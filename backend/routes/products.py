"""
Product routes
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from datetime import datetime, timezone
import uuid
import re

from database import db
from models.product import Product, ProductCreate, ProductUpdate
from models.user import User
from dependencies import get_current_seller

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("", response_model=List[Product])
async def get_products(
    category_id: Optional[str] = None,
    search: Optional[str] = None,
    seller_id: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort_by: Optional[str] = None,
    skip: int = 0,
    limit: int = 50
):
    """Get products with filters and sorting"""
    query = {"status": "published"}
    
    # Build filter query
    if category_id:
        query["category_id"] = category_id
    if seller_id:
        query["seller_id"] = seller_id
    if min_price is not None or max_price is not None:
        query["price"] = {}
        if min_price is not None:
            query["price"]["$gte"] = min_price
        if max_price is not None:
            query["price"]["$lte"] = max_price
    
    # Use MongoDB text search for better relevance
    if search:
        query["$text"] = {"$search": search}
        projection = {"_id": 0, "score": {"$meta": "textScore"}}
        
        # Default sort by relevance when searching
        sort_field = [("score", {"$meta": "textScore"})]
        
        # Override sort if explicitly requested
        if sort_by == "popularity":
            sort_field = [("views_count", -1), ("rating", -1)]
        elif sort_by == "newest":
            sort_field = [("created_at", -1)]
        elif sort_by == "price_asc":
            sort_field = [("price", 1)]
        elif sort_by == "price_desc":
            sort_field = [("price", -1)]
        elif sort_by == "rating":
            sort_field = [("rating", -1), ("reviews_count", -1)]
        
        products = await db.products.find(query, projection).sort(sort_field).skip(skip).limit(limit).to_list(limit)
        
        # Remove score from response
        for prod in products:
            prod.pop("score", None)
    else:
        # No search query - use standard sorting
        sort_field = [("created_at", -1)]  # Default: newest first
        if sort_by == "popularity":
            sort_field = [("views_count", -1), ("rating", -1)]
        elif sort_by == "newest":
            sort_field = [("created_at", -1)]
        elif sort_by == "price_asc":
            sort_field = [("price", 1)]
        elif sort_by == "price_desc":
            sort_field = [("price", -1)]
        elif sort_by == "rating":
            sort_field = [("rating", -1), ("reviews_count", -1)]
        
        products = await db.products.find(query, {"_id": 0}).sort(sort_field).skip(skip).limit(limit).to_list(limit)
    
    for prod in products:
        if isinstance(prod.get("created_at"), str):
            prod["created_at"] = datetime.fromisoformat(prod["created_at"])
        if isinstance(prod.get("updated_at"), str):
            prod["updated_at"] = datetime.fromisoformat(prod["updated_at"])
    return products


@router.get("/search/suggestions")
async def search_suggestions(q: str, limit: int = 5):
    """Get search suggestions based on product titles"""
    if not q or len(q) < 2:
        return []
    
    query = {
        "$or": [
            {"title": {"$regex": q, "$options": "i"}},
            {"description": {"$regex": q, "$options": "i"}},
            {"short_description": {"$regex": q, "$options": "i"}}
        ],
        "status": "published"
    }
    
    products = await db.products.find(
        query,
        {"_id": 0, "title": 1, "id": 1, "price": 1, "images": 1}
    ).limit(limit).to_list(limit)
    
    return [
        {
            "title": p["title"],
            "id": p["id"],
            "price": p.get("price"),
            "image": p["images"][0] if p.get("images") else None
        }
        for p in products
    ]


@router.get("/search/stats")
async def search_stats(search: str):
    """Get search statistics - total results, price range, available categories"""
    if not search:
        return {"total": 0, "price_range": {}, "categories": []}
    
    query = {
        "$text": {"$search": search},
        "status": "published"
    }
    
    # Get total count
    total = await db.products.count_documents(query)
    
    # Get price range
    price_pipeline = [
        {"$match": query},
        {"$group": {
            "_id": None,
            "min_price": {"$min": "$price"},
            "max_price": {"$max": "$price"},
            "avg_price": {"$avg": "$price"}
        }}
    ]
    price_result = await db.products.aggregate(price_pipeline).to_list(1)
    
    # Get categories distribution
    category_pipeline = [
        {"$match": query},
        {"$group": {"_id": "$category_id", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 10}
    ]
    category_results = await db.products.aggregate(category_pipeline).to_list(10)
    
    # Enrich with category names
    categories = []
    for cat in category_results:
        if cat["_id"]:
            category = await db.categories.find_one({"id": cat["_id"]}, {"_id": 0, "name": 1})
            if category:
                categories.append({
                    "id": cat["_id"],
                    "name": category["name"],
                    "count": cat["count"]
                })
    
    return {
        "total": total,
        "price_range": price_result[0] if price_result else {},
        "categories": categories
    }


@router.get("/{product_id}", response_model=Product)
async def get_product(product_id: str):
    """Get a single product by ID"""
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if isinstance(product.get("created_at"), str):
        product["created_at"] = datetime.fromisoformat(product["created_at"])
    if isinstance(product.get("updated_at"), str):
        product["updated_at"] = datetime.fromisoformat(product["updated_at"])
    return Product(**product)


@router.post("", response_model=Product)
async def create_product(
    product_data: ProductCreate,
    current_user: User = Depends(get_current_seller)
):
    """Create a new product"""
    product_dict = product_data.model_dump()
    if not product_dict.get("slug"):
        slug_base = re.sub(r'[^a-z0-9]+', '-', product_dict["title"].lower()).strip('-')
        product_dict["slug"] = f"{slug_base}-{str(uuid.uuid4())[:8]}"
    
    product = Product(
        seller_id=current_user.id,
        **product_dict
    )
    
    prod_doc = product.model_dump()
    prod_doc["created_at"] = prod_doc["created_at"].isoformat()
    prod_doc["updated_at"] = prod_doc["updated_at"].isoformat()
    
    await db.products.insert_one(prod_doc)
    return product


@router.patch("/{product_id}", response_model=Product)
async def update_product(
    product_id: str,
    update_data: ProductUpdate,
    current_user: User = Depends(get_current_seller)
):
    """Update a product"""
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if product["seller_id"] != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    update_dict = {k: v for k, v in update_data.model_dump(exclude_unset=True).items() if v is not None}
    if update_dict:
        update_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
        await db.products.update_one({"id": product_id}, {"$set": update_dict})
    
    updated_product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if isinstance(updated_product.get("created_at"), str):
        updated_product["created_at"] = datetime.fromisoformat(updated_product["created_at"])
    if isinstance(updated_product.get("updated_at"), str):
        updated_product["updated_at"] = datetime.fromisoformat(updated_product["updated_at"])
    return Product(**updated_product)


@router.delete("/{product_id}")
async def delete_product(
    product_id: str,
    current_user: User = Depends(get_current_seller)
):
    """Delete a product"""
    product = await db.products.find_one({"id": product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if product["seller_id"] != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.products.delete_one({"id": product_id})
    return {"message": "Product deleted successfully"}
