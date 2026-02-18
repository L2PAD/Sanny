"""
Admin routes - Popular Categories, Promotions, Offers, Custom Sections, Product management
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import List
from datetime import datetime, timezone
import uuid

from database import db
from models.user import User
from models.promotion import (
    PopularCategory, PopularCategoryCreate, PopularCategoryUpdate,
    ActualOffer, ActualOfferCreate, ActualOfferUpdate,
    Promotion, PromotionCreate, PromotionUpdate,
    CustomSection, CustomSectionCreate, CustomSectionUpdate
)
from models.product import Product
from dependencies import get_current_admin

router = APIRouter(tags=["Admin"])


# ============= POPULAR CATEGORIES =============

@router.get("/popular-categories")
async def get_popular_categories():
    """Get all active popular categories (public)"""
    categories = await db.popular_categories.find({"active": True}, {"_id": 0}).sort("order", 1).to_list(100)
    return categories


@router.get("/admin/popular-categories")
async def get_all_popular_categories(current_user: User = Depends(get_current_admin)):
    """Get all popular categories (admin only)"""
    categories = await db.popular_categories.find({}, {"_id": 0}).sort("order", 1).to_list(1000)
    return categories


@router.post("/admin/popular-categories", response_model=PopularCategory)
async def create_popular_category(
    category: PopularCategoryCreate,
    current_user: User = Depends(get_current_admin)
):
    """Create a popular category (admin only)"""
    category_dict = category.model_dump()
    category_dict["id"] = str(uuid.uuid4())
    category_dict["created_at"] = datetime.now(timezone.utc)
    
    await db.popular_categories.insert_one(category_dict)
    
    created_category = await db.popular_categories.find_one({"id": category_dict["id"]}, {"_id": 0})
    return PopularCategory(**created_category)


@router.put("/admin/popular-categories/{category_id}", response_model=PopularCategory)
async def update_popular_category(
    category_id: str,
    category_update: PopularCategoryUpdate,
    current_user: User = Depends(get_current_admin)
):
    """Update a popular category (admin only)"""
    update_data = category_update.model_dump(exclude_unset=True)
    
    result = await db.popular_categories.update_one(
        {"id": category_id},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    
    updated_category = await db.popular_categories.find_one({"id": category_id}, {"_id": 0})
    return PopularCategory(**updated_category)


@router.delete("/admin/popular-categories/{category_id}")
async def delete_popular_category(
    category_id: str,
    current_user: User = Depends(get_current_admin)
):
    """Delete a popular category (admin only)"""
    result = await db.popular_categories.delete_one({"id": category_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    
    return {"message": "Popular category deleted successfully"}


# ============= ACTUAL OFFERS =============

@router.get("/actual-offers")
async def get_actual_offers():
    """Get all active actual offers (public)"""
    offers = await db.actual_offers.find({"active": True}, {"_id": 0}).sort("order", 1).to_list(100)
    return offers


@router.get("/actual-offers/{offer_id}")
async def get_actual_offer(offer_id: str):
    """Get single actual offer with products (public)"""
    offer = await db.actual_offers.find_one({"id": offer_id, "active": True}, {"_id": 0})
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    
    if offer.get("product_ids"):
        products = await db.products.find(
            {"id": {"$in": offer["product_ids"]}},
            {"_id": 0}
        ).to_list(100)
        offer["products"] = products
    else:
        offer["products"] = []
    
    return offer


@router.get("/admin/actual-offers")
async def get_all_actual_offers(current_user: User = Depends(get_current_admin)):
    """Get all actual offers (admin only)"""
    offers = await db.actual_offers.find({}, {"_id": 0}).sort("order", 1).to_list(100)
    return offers


@router.post("/admin/actual-offers", response_model=ActualOffer)
async def create_actual_offer(
    offer: ActualOfferCreate,
    current_user: User = Depends(get_current_admin)
):
    """Create an actual offer (admin only)"""
    offer_dict = offer.model_dump()
    offer_dict["id"] = str(uuid.uuid4())
    offer_dict["created_at"] = datetime.now(timezone.utc)
    
    await db.actual_offers.insert_one(offer_dict)
    return ActualOffer(**offer_dict)


@router.put("/admin/actual-offers/{offer_id}", response_model=ActualOffer)
async def update_actual_offer(
    offer_id: str,
    offer_update: ActualOfferUpdate,
    current_user: User = Depends(get_current_admin)
):
    """Update an actual offer (admin only)"""
    update_data = offer_update.model_dump(exclude_unset=True)
    
    result = await db.actual_offers.update_one(
        {"id": offer_id},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Offer not found")
    
    updated_offer = await db.actual_offers.find_one({"id": offer_id}, {"_id": 0})
    return ActualOffer(**updated_offer)


@router.delete("/admin/actual-offers/{offer_id}")
async def delete_actual_offer(
    offer_id: str,
    current_user: User = Depends(get_current_admin)
):
    """Delete an actual offer (admin only)"""
    result = await db.actual_offers.delete_one({"id": offer_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Offer not found")
    
    return {"message": "Actual offer deleted successfully"}


# ============= PROMOTIONS =============

@router.get("/promotions")
async def get_promotions():
    """Get all active promotions (public)"""
    promotions = await db.promotions.find({"active": True}, {"_id": 0}).sort("order", 1).to_list(100)
    return promotions


@router.get("/promotions/{promotion_id}")
async def get_promotion(promotion_id: str):
    """Get single promotion by ID (public)"""
    promotion = await db.promotions.find_one({"id": promotion_id, "active": True}, {"_id": 0})
    if not promotion:
        raise HTTPException(status_code=404, detail="Promotion not found")
    return promotion


@router.get("/admin/promotions")
async def get_all_promotions(current_user: User = Depends(get_current_admin)):
    """Get all promotions (admin only)"""
    promotions = await db.promotions.find({}, {"_id": 0}).sort("order", 1).to_list(100)
    return promotions


@router.post("/admin/promotions", response_model=Promotion)
async def create_promotion(
    promotion: PromotionCreate,
    current_user: User = Depends(get_current_admin)
):
    """Create a promotion (admin only)"""
    promotion_dict = promotion.model_dump()
    promotion_dict["id"] = str(uuid.uuid4())
    promotion_dict["created_at"] = datetime.now(timezone.utc)
    promotion_dict["updated_at"] = datetime.now(timezone.utc)
    
    await db.promotions.insert_one(promotion_dict)
    return Promotion(**promotion_dict)


@router.put("/admin/promotions/{promotion_id}", response_model=Promotion)
async def update_promotion(
    promotion_id: str,
    promotion_update: PromotionUpdate,
    current_user: User = Depends(get_current_admin)
):
    """Update a promotion (admin only)"""
    update_data = promotion_update.model_dump(exclude_unset=True)
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    result = await db.promotions.update_one(
        {"id": promotion_id},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Promotion not found")
    
    updated_promotion = await db.promotions.find_one({"id": promotion_id}, {"_id": 0})
    return Promotion(**updated_promotion)


@router.delete("/admin/promotions/{promotion_id}")
async def delete_promotion(
    promotion_id: str,
    current_user: User = Depends(get_current_admin)
):
    """Delete a promotion (admin only)"""
    result = await db.promotions.delete_one({"id": promotion_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Promotion not found")
    
    return {"message": "Promotion deleted successfully"}


# ============= CUSTOM SECTIONS =============

@router.get("/custom-sections", response_model=List[CustomSection])
async def get_custom_sections():
    """Get all active custom sections for frontend"""
    sections = await db.custom_sections.find(
        {"active": True, "display_on_home": True},
        {"_id": 0}
    ).sort("order", 1).to_list(100)
    return [CustomSection(**section) for section in sections]


@router.get("/custom-sections/{slug}")
async def get_custom_section_by_slug(slug: str):
    """Get a specific custom section by slug"""
    section = await db.custom_sections.find_one({"slug": slug, "active": True}, {"_id": 0})
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
    
    products = []
    if section.get("product_ids"):
        products = await db.products.find(
            {"id": {"$in": section["product_ids"]}},
            {"_id": 0}
        ).to_list(100)
    
    return {
        "section": CustomSection(**section),
        "products": [Product(**p) for p in products]
    }


@router.get("/admin/custom-sections", response_model=List[CustomSection])
async def get_all_custom_sections_admin(current_user: User = Depends(get_current_admin)):
    """Get all custom sections (admin)"""
    sections = await db.custom_sections.find({}, {"_id": 0}).sort("order", 1).to_list(100)
    return [CustomSection(**section) for section in sections]


@router.post("/admin/custom-sections", response_model=CustomSection)
async def create_custom_section(
    section: CustomSectionCreate,
    current_user: User = Depends(get_current_admin)
):
    """Create a new custom section (admin only)"""
    existing = await db.custom_sections.find_one({"slug": section.slug})
    if existing:
        raise HTTPException(status_code=400, detail="Section with this slug already exists")
    
    section_dict = section.model_dump()
    section_dict["id"] = str(uuid.uuid4())
    section_dict["created_at"] = datetime.now(timezone.utc)
    section_dict["updated_at"] = datetime.now(timezone.utc)
    
    await db.custom_sections.insert_one(section_dict)
    return CustomSection(**section_dict)


@router.put("/admin/custom-sections/{section_id}", response_model=CustomSection)
async def update_custom_section(
    section_id: str,
    section_update: CustomSectionUpdate,
    current_user: User = Depends(get_current_admin)
):
    """Update a custom section (admin only)"""
    update_data = section_update.model_dump(exclude_unset=True)
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    if "slug" in update_data:
        existing = await db.custom_sections.find_one({
            "slug": update_data["slug"],
            "id": {"$ne": section_id}
        })
        if existing:
            raise HTTPException(status_code=400, detail="Section with this slug already exists")
    
    result = await db.custom_sections.update_one(
        {"id": section_id},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Section not found")
    
    updated_section = await db.custom_sections.find_one({"id": section_id}, {"_id": 0})
    return CustomSection(**updated_section)


@router.delete("/admin/custom-sections/{section_id}")
async def delete_custom_section(
    section_id: str,
    current_user: User = Depends(get_current_admin)
):
    """Delete a custom section (admin only)"""
    result = await db.custom_sections.delete_one({"id": section_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Section not found")
    
    return {"message": "Custom section deleted successfully"}


@router.post("/admin/custom-sections/{section_id}/products/{product_id}")
async def add_product_to_section(
    section_id: str,
    product_id: str,
    current_user: User = Depends(get_current_admin)
):
    """Add a product to a custom section (admin only)"""
    product = await db.products.find_one({"id": product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    result = await db.custom_sections.update_one(
        {"id": section_id},
        {"$addToSet": {"product_ids": product_id}, "$set": {"updated_at": datetime.now(timezone.utc)}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Section not found or product already in section")
    
    return {"message": "Product added to section successfully"}


@router.delete("/admin/custom-sections/{section_id}/products/{product_id}")
async def remove_product_from_section(
    section_id: str,
    product_id: str,
    current_user: User = Depends(get_current_admin)
):
    """Remove a product from a custom section (admin only)"""
    result = await db.custom_sections.update_one(
        {"id": section_id},
        {"$pull": {"product_ids": product_id}, "$set": {"updated_at": datetime.now(timezone.utc)}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Section not found")
    
    return {"message": "Product removed from section successfully"}


# ============= ADMIN PRODUCT MANAGEMENT =============

@router.put("/admin/products/{product_id}/bestseller")
async def toggle_product_bestseller(
    product_id: str,
    is_bestseller: bool,
    current_user: User = Depends(get_current_admin)
):
    """Toggle product bestseller status (admin only)"""
    result = await db.products.update_one(
        {"id": product_id},
        {"$set": {"is_bestseller": is_bestseller, "updated_at": datetime.now(timezone.utc)}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return {"success": True, "product_id": product_id, "is_bestseller": is_bestseller}
