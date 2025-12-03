from fastapi import FastAPI, APIRouter, Depends, HTTPException, status, Request, BackgroundTasks, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt
import asyncio

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET_KEY')
JWT_ALGORITHM = os.environ.get('JWT_ALGORITHM', 'HS256')
JWT_EXPIRATION = int(os.environ.get('JWT_EXPIRATION_MINUTES', 10080))

# Create the main app
app = FastAPI(title="Global Marketplace API")
api_router = APIRouter(prefix="/api")

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ============= MODELS =============

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    full_name: str
    role: str = "customer"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    company_name: Optional[str] = None
    verified: bool = False

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str = "customer"
    company_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

class Category(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    slug: str
    parent_id: Optional[str] = None
    image_url: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CategoryCreate(BaseModel):
    name: str
    slug: str
    parent_id: Optional[str] = None
    image_url: Optional[str] = None

class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    seller_id: str
    title: str
    slug: str
    description: str
    description_html: Optional[str] = None
    short_description: Optional[str] = None
    category_id: str
    category_name: Optional[str] = None
    price: float
    compare_price: Optional[float] = None
    currency: str = "USD"
    stock_level: int = 0
    images: List[str] = []
    videos: Optional[List[str]] = []
    specifications: Optional[List[Dict[str, Any]]] = []
    status: str = "published"
    rating: float = 0.0
    reviews_count: int = 0
    installment_months: Optional[int] = None
    installment_available: bool = False
    views_count: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProductCreate(BaseModel):
    title: str
    slug: str
    description: str
    short_description: Optional[str] = None
    category_id: str
    price: float
    compare_price: Optional[float] = None
    stock_level: int = 0
    images: List[str] = []
    status: str = "published"
    installment_months: Optional[int] = None
    installment_available: bool = False

class ProductUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    short_description: Optional[str] = None
    category_id: Optional[str] = None
    price: Optional[float] = None
    compare_price: Optional[float] = None
    stock_level: Optional[int] = None
    images: Optional[List[str]] = None
    status: Optional[str] = None

class Review(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    product_id: str
    user_id: str
    user_name: str
    rating: int
    comment: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ReviewCreate(BaseModel):
    product_id: str
    rating: int = Field(ge=1, le=5)
    comment: str

class CartItem(BaseModel):
    product_id: str
    quantity: int
    price: float

class Cart(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    items: List[CartItem] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AddToCartRequest(BaseModel):
    product_id: str
    quantity: int = 1

class OrderItem(BaseModel):
    product_id: str
    title: str
    quantity: int
    price: float
    seller_id: str

class ShippingAddress(BaseModel):
    street: str
    city: str
    state: str
    postal_code: str
    country: str

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    order_number: str
    buyer_id: str
    items: List[OrderItem]
    total_amount: float
    currency: str = "USD"
    shipping_address: ShippingAddress
    status: str = "pending"
    payment_status: str = "pending"
    payment_method: Optional[str] = None
    payment_session_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CheckoutRequest(BaseModel):
    shipping_address: ShippingAddress

class PaymentTransaction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    order_id: str
    session_id: str
    amount: float
    currency: str
    payment_status: str = "pending"
    user_id: Optional[str] = None
    metadata: Dict[str, Any] = {}
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AIDescriptionRequest(BaseModel):
    product_title: str
    category: str
    key_features: Optional[List[str]] = []

class AIDescriptionResponse(BaseModel):
    description: str
    short_description: str

class ContactRequest(BaseModel):
    name: str
    phone: str
    message: str

# ============= AUTH UTILITIES =============

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=JWT_EXPIRATION)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication")
    
    user_doc = await db.users.find_one({"id": user_id}, {"_id": 0})
    if user_doc is None:
        raise HTTPException(status_code=404, detail="User not found")
    return User(**user_doc)

async def get_current_seller(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in ["seller", "admin"]:
        raise HTTPException(status_code=403, detail="Seller privileges required")
    return current_user

async def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin privileges required")
    return current_user

# ============= AUTH ENDPOINTS =============

@api_router.post("/auth/register", response_model=Token)
async def register(user_data: UserCreate):
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user = User(
        email=user_data.email,
        full_name=user_data.full_name,
        role=user_data.role,
        company_name=user_data.company_name
    )
    
    user_doc = user.model_dump()
    user_doc["password_hash"] = get_password_hash(user_data.password)
    user_doc["created_at"] = user_doc["created_at"].isoformat()
    
    await db.users.insert_one(user_doc)
    access_token = create_access_token({"sub": user.id})
    
    return Token(access_token=access_token, token_type="bearer", user=user)

@api_router.post("/auth/login", response_model=Token)
async def login(credentials: UserLogin):
    user_doc = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(credentials.password, user_doc["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user_doc.pop("password_hash", None)
    if isinstance(user_doc.get("created_at"), str):
        user_doc["created_at"] = datetime.fromisoformat(user_doc["created_at"])
    
    user = User(**user_doc)
    access_token = create_access_token({"sub": user.id})
    
    return Token(access_token=access_token, token_type="bearer", user=user)

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

# ============= CATEGORIES ENDPOINTS =============

@api_router.get("/categories", response_model=List[Category])
async def get_categories():
    categories = await db.categories.find({}, {"_id": 0}).to_list(1000)
    for cat in categories:
        if isinstance(cat.get("created_at"), str):
            cat["created_at"] = datetime.fromisoformat(cat["created_at"])
    return categories

@api_router.post("/categories", response_model=Category)
async def create_category(
    category_data: CategoryCreate,
    current_user: User = Depends(get_current_admin)
):
    category = Category(**category_data.model_dump())
    cat_doc = category.model_dump()
    cat_doc["created_at"] = cat_doc["created_at"].isoformat()
    await db.categories.insert_one(cat_doc)
    return category

# ============= PRODUCTS ENDPOINTS =============

@api_router.get("/products", response_model=List[Product])
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
        # Add text score for sorting by relevance
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

@api_router.get("/products/search/suggestions")
async def search_suggestions(q: str, limit: int = 5):
    """
    Get search suggestions based on product titles
    Fast autocomplete endpoint
    """
    if not q or len(q) < 2:
        return []
    
    # Use text search for suggestions
    query = {
        "$text": {"$search": q},
        "status": "published"
    }
    
    # Get products sorted by relevance
    products = await db.products.find(
        query,
        {"_id": 0, "title": 1, "id": 1, "price": 1, "images": 1, "score": {"$meta": "textScore"}}
    ).sort([("score", {"$meta": "textScore"})]).limit(limit).to_list(limit)
    
    return [
        {
            "title": p["title"],
            "id": p["id"],
            "price": p.get("price"),
            "image": p["images"][0] if p.get("images") else None
        }
        for p in products
    ]

@api_router.get("/products/search/stats")
async def search_stats(search: str):
    """
    Get search statistics - total results, price range, available categories
    """
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


@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if isinstance(product.get("created_at"), str):
        product["created_at"] = datetime.fromisoformat(product["created_at"])
    if isinstance(product.get("updated_at"), str):
        product["updated_at"] = datetime.fromisoformat(product["updated_at"])
    return Product(**product)

@api_router.post("/products", response_model=Product)
async def create_product(
    product_data: ProductCreate,
    current_user: User = Depends(get_current_seller)
):
    product = Product(
        seller_id=current_user.id,
        **product_data.model_dump()
    )
    
    prod_doc = product.model_dump()
    prod_doc["created_at"] = prod_doc["created_at"].isoformat()
    prod_doc["updated_at"] = prod_doc["updated_at"].isoformat()
    
    await db.products.insert_one(prod_doc)
    return product

@api_router.patch("/products/{product_id}", response_model=Product)
async def update_product(
    product_id: str,
    update_data: ProductUpdate,
    current_user: User = Depends(get_current_seller)
):
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

@api_router.delete("/products/{product_id}")
async def delete_product(
    product_id: str,
    current_user: User = Depends(get_current_seller)
):
    product = await db.products.find_one({"id": product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if product["seller_id"] != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.products.delete_one({"id": product_id})
    return {"message": "Product deleted successfully"}

# ============= REVIEWS ENDPOINTS =============

@api_router.get("/products/{product_id}/reviews", response_model=List[Review])
async def get_product_reviews(product_id: str):
    reviews = await db.reviews.find({"product_id": product_id}, {"_id": 0}).to_list(1000)
    for review in reviews:
        if isinstance(review.get("created_at"), str):
            review["created_at"] = datetime.fromisoformat(review["created_at"])
    return reviews

@api_router.post("/reviews", response_model=Review)
async def create_review(
    review_data: ReviewCreate,
    current_user: User = Depends(get_current_user)
):
    # Check if user already reviewed this product
    existing = await db.reviews.find_one({
        "product_id": review_data.product_id,
        "user_id": current_user.id
    })
    if existing:
        raise HTTPException(status_code=400, detail="You already reviewed this product")
    
    review = Review(
        product_id=review_data.product_id,
        user_id=current_user.id,
        user_name=current_user.full_name,
        rating=review_data.rating,
        comment=review_data.comment
    )
    
    review_doc = review.model_dump()
    review_doc["created_at"] = review_doc["created_at"].isoformat()
    await db.reviews.insert_one(review_doc)
    
    # Update product rating
    all_reviews = await db.reviews.find({"product_id": review_data.product_id}).to_list(1000)
    avg_rating = sum(r["rating"] for r in all_reviews) / len(all_reviews)
    await db.products.update_one(
        {"id": review_data.product_id},
        {"$set": {"rating": round(avg_rating, 1), "reviews_count": len(all_reviews)}}
    )
    
    return review

# ============= CART ENDPOINTS =============

@api_router.get("/cart", response_model=Cart)
async def get_cart(current_user: User = Depends(get_current_user)):
    cart = await db.carts.find_one({"user_id": current_user.id}, {"_id": 0})
    if not cart:
        cart = Cart(user_id=current_user.id)
        cart_doc = cart.model_dump()
        cart_doc["created_at"] = cart_doc["created_at"].isoformat()
        cart_doc["updated_at"] = cart_doc["updated_at"].isoformat()
        await db.carts.insert_one(cart_doc)
        return cart
    
    if isinstance(cart.get("created_at"), str):
        cart["created_at"] = datetime.fromisoformat(cart["created_at"])
    if isinstance(cart.get("updated_at"), str):
        cart["updated_at"] = datetime.fromisoformat(cart["updated_at"])
    return Cart(**cart)

@api_router.post("/cart/items")
async def add_to_cart(
    item: AddToCartRequest,
    current_user: User = Depends(get_current_user)
):
    product = await db.products.find_one({"id": item.product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if product["stock_level"] < item.quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock")
    
    cart = await db.carts.find_one({"user_id": current_user.id}, {"_id": 0})
    if not cart:
        cart = Cart(user_id=current_user.id).model_dump()
        cart["created_at"] = cart["created_at"].isoformat()
        cart["updated_at"] = cart["updated_at"].isoformat()
    
    cart_item = CartItem(
        product_id=item.product_id,
        quantity=item.quantity,
        price=product["price"]
    )
    
    items = cart.get("items", [])
    existing_idx = next((i for i, x in enumerate(items) if x["product_id"] == item.product_id), None)
    
    if existing_idx is not None:
        items[existing_idx]["quantity"] += item.quantity
    else:
        items.append(cart_item.model_dump())
    
    cart["items"] = items
    cart["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.carts.update_one(
        {"user_id": current_user.id},
        {"$set": cart},
        upsert=True
    )
    
    return {"message": "Item added to cart", "cart": cart}

@api_router.delete("/cart/items/{product_id}")
async def remove_from_cart(
    product_id: str,
    current_user: User = Depends(get_current_user)
):
    cart = await db.carts.find_one({"user_id": current_user.id})
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    items = [item for item in cart.get("items", []) if item["product_id"] != product_id]
    
    await db.carts.update_one(
        {"user_id": current_user.id},
        {"$set": {"items": items, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"message": "Item removed from cart"}

@api_router.delete("/cart")
async def clear_cart(current_user: User = Depends(get_current_user)):
    await db.carts.update_one(
        {"user_id": current_user.id},
        {"$set": {"items": [], "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"message": "Cart cleared"}

# ============= CHECKOUT & ORDERS =============

@api_router.post("/checkout/create-session")
async def create_checkout_session(
    request: Request,
    checkout_data: CheckoutRequest,
    current_user: User = Depends(get_current_user)
):
    from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionRequest
    
    cart = await db.carts.find_one({"user_id": current_user.id}, {"_id": 0})
    if not cart or not cart.get("items"):
        raise HTTPException(status_code=400, detail="Cart is empty")
    
    total = sum(item["price"] * item["quantity"] for item in cart["items"])
    
    order_items = []
    for item in cart["items"]:
        product = await db.products.find_one({"id": item["product_id"]}, {"_id": 0})
        if product:
            order_items.append(OrderItem(
                product_id=item["product_id"],
                title=product["title"],
                quantity=item["quantity"],
                price=item["price"],
                seller_id=product["seller_id"]
            ))
    
    order = Order(
        order_number=f"ORD-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}",
        buyer_id=current_user.id,
        items=order_items,
        total_amount=total,
        shipping_address=checkout_data.shipping_address,
        status="pending",
        payment_status="pending"
    )
    
    order_doc = order.model_dump()
    order_doc["created_at"] = order_doc["created_at"].isoformat()
    order_doc["updated_at"] = order_doc["updated_at"].isoformat()
    await db.orders.insert_one(order_doc)
    
    stripe_api_key = os.environ.get('STRIPE_API_KEY')
    host_url = str(request.base_url).rstrip('/')
    webhook_url = f"{host_url}/api/webhook/stripe"
    
    stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url=webhook_url)
    
    success_url = f"{request.headers.get('origin', host_url)}/checkout/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{request.headers.get('origin', host_url)}/checkout/cancel"
    
    checkout_request = CheckoutSessionRequest(
        amount=total,
        currency="usd",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "order_id": order.id,
            "user_id": current_user.id
        }
    )
    
    session = await stripe_checkout.create_checkout_session(checkout_request)
    
    payment = PaymentTransaction(
        order_id=order.id,
        session_id=session.session_id,
        amount=total,
        currency="usd",
        payment_status="pending",
        user_id=current_user.id,
        metadata={"order_number": order.order_number}
    )
    
    payment_doc = payment.model_dump()
    payment_doc["created_at"] = payment_doc["created_at"].isoformat()
    payment_doc["updated_at"] = payment_doc["updated_at"].isoformat()
    await db.payment_transactions.insert_one(payment_doc)
    
    await db.orders.update_one(
        {"id": order.id},
        {"$set": {"payment_session_id": session.session_id}}
    )
    
    return {
        "checkout_url": session.url,
        "session_id": session.session_id,
        "order_id": order.id
    }

@api_router.get("/checkout/status/{session_id}")
async def get_checkout_status(session_id: str):
    from emergentintegrations.payments.stripe.checkout import StripeCheckout
    
    stripe_api_key = os.environ.get('STRIPE_API_KEY')
    stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url="")
    
    status = await stripe_checkout.get_checkout_status(session_id)
    
    if status.payment_status == "paid":
        payment = await db.payment_transactions.find_one({"session_id": session_id})
        if payment and payment.get("payment_status") != "paid":
            await db.payment_transactions.update_one(
                {"session_id": session_id},
                {"$set": {"payment_status": "paid", "updated_at": datetime.now(timezone.utc).isoformat()}}
            )
            
            await db.orders.update_one(
                {"id": payment["order_id"]},
                {"$set": {
                    "payment_status": "paid",
                    "status": "processing",
                    "payment_method": "stripe",
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }}
            )
            
            order = await db.orders.find_one({"id": payment["order_id"]})
            if order:
                await db.carts.update_one(
                    {"user_id": order["buyer_id"]},
                    {"$set": {"items": [], "updated_at": datetime.now(timezone.utc).isoformat()}}
                )
    
    return status

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    from emergentintegrations.payments.stripe.checkout import StripeCheckout
    
    stripe_api_key = os.environ.get('STRIPE_API_KEY')
    webhook_url = str(request.base_url).rstrip('/') + "/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url=webhook_url)
    
    body = await request.body()
    signature = request.headers.get("Stripe-Signature")
    
    try:
        webhook_response = await stripe_checkout.handle_webhook(body, signature)
        logger.info(f"Stripe webhook: {webhook_response.event_type}")
        return {"status": "success"}
    except Exception as e:
        logger.error(f"Stripe webhook error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

# ============= ORDERS ENDPOINTS =============

@api_router.post("/orders", response_model=Order)
async def create_order(
    order_data: dict,
    current_user: User = Depends(get_current_user)
):
    """Create a new order"""
    try:
        # Create order object
        order = Order(
            order_number=order_data.get("order_number", f"ORD-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"),
            buyer_id=order_data.get("buyer_id", current_user.id),
            items=order_data.get("items", []),
            total_amount=order_data.get("total_amount", 0),
            currency=order_data.get("currency", "USD"),
            shipping_address=order_data.get("shipping_address", {}),
            status=order_data.get("status", "pending"),
            payment_status=order_data.get("payment_status", "pending"),
            payment_method=order_data.get("payment_method", "cash_on_delivery")
        )
        
        # Save to database
        order_doc = order.model_dump()
        order_doc["created_at"] = order_doc["created_at"].isoformat()
        order_doc["updated_at"] = order_doc["updated_at"].isoformat()
        await db.orders.insert_one(order_doc)
        
        # Clear cart after successful order creation
        await db.carts.update_one(
            {"user_id": current_user.id},
            {"$set": {"items": []}}
        )
        
        return order
        
    except Exception as e:
        logger.error(f"Error creating order: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create order: {str(e)}")

@api_router.get("/orders", response_model=List[Order])
async def get_orders(current_user: User = Depends(get_current_user)):
    query = {"buyer_id": current_user.id}
    if current_user.role == "admin":
        query = {}
    
    orders = await db.orders.find(query, {"_id": 0}).to_list(1000)
    for order in orders:
        if isinstance(order.get("created_at"), str):
            order["created_at"] = datetime.fromisoformat(order["created_at"])
        if isinstance(order.get("updated_at"), str):
            order["updated_at"] = datetime.fromisoformat(order["updated_at"])
    return orders

@api_router.get("/orders/{order_id}", response_model=Order)
async def get_order(order_id: str, current_user: User = Depends(get_current_user)):
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order["buyer_id"] != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if isinstance(order.get("created_at"), str):
        order["created_at"] = datetime.fromisoformat(order["created_at"])
    if isinstance(order.get("updated_at"), str):
        order["updated_at"] = datetime.fromisoformat(order["updated_at"])
    return Order(**order)

# ============= SELLER DASHBOARD =============

@api_router.get("/seller/products", response_model=List[Product])
async def get_seller_products(current_user: User = Depends(get_current_seller)):
    products = await db.products.find({"seller_id": current_user.id}, {"_id": 0}).to_list(1000)
    for prod in products:
        if isinstance(prod.get("created_at"), str):
            prod["created_at"] = datetime.fromisoformat(prod["created_at"])
        if isinstance(prod.get("updated_at"), str):
            prod["updated_at"] = datetime.fromisoformat(prod["updated_at"])
    return products

@api_router.get("/seller/orders", response_model=List[Order])
async def get_seller_orders(current_user: User = Depends(get_current_seller)):
    orders = await db.orders.find({}, {"_id": 0}).to_list(1000)
    seller_orders = []
    
    for order in orders:
        if any(item["seller_id"] == current_user.id for item in order.get("items", [])):
            if isinstance(order.get("created_at"), str):
                order["created_at"] = datetime.fromisoformat(order["created_at"])
            if isinstance(order.get("updated_at"), str):
                order["updated_at"] = datetime.fromisoformat(order["updated_at"])
            seller_orders.append(order)
    
    return seller_orders

@api_router.get("/seller/stats")
async def get_seller_stats(current_user: User = Depends(get_current_seller)):
    products = await db.products.find({"seller_id": current_user.id}).to_list(1000)
    orders = await db.orders.find({}).to_list(1000)
    
    total_products = len(products)
    total_revenue = 0.0
    total_orders = 0
    
    for order in orders:
        if order.get("payment_status") == "paid":
            for item in order.get("items", []):
                if item["seller_id"] == current_user.id:
                    total_revenue += item["price"] * item["quantity"]
                    total_orders += 1
    
    return {
        "total_products": total_products,
        "total_revenue": total_revenue,
        "total_orders": total_orders
    }

# ============= AI ENDPOINTS =============

@api_router.post("/ai/generate-description", response_model=AIDescriptionResponse)
async def generate_product_description(
    request: AIDescriptionRequest,
    current_user: User = Depends(get_current_seller)
):
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    
    api_key = os.environ.get('EMERGENT_LLM_KEY')
    chat = LlmChat(
        api_key=api_key,
        session_id=f"product-desc-{str(uuid.uuid4())}",
        system_message="You are a professional product description writer for an e-commerce marketplace. Create engaging, SEO-friendly product descriptions."
    )
    
    chat.with_model("openai", "gpt-4o")
    
    features_text = "\n".join(request.key_features) if request.key_features else "No specific features provided"
    
    prompt = f"""Create a product description for:

Product Title: {request.product_title}
Category: {request.category}
Key Features:
{features_text}

Provide:
1. A detailed product description (2-3 paragraphs, 150-200 words)
2. A short description (1 sentence, max 160 characters)

Format your response as JSON with keys: "description" and "short_description"""
    
    user_message = UserMessage(text=prompt)
    response = await chat.send_message(user_message)
    
    try:
        import json
        response_text = response.strip()
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        result = json.loads(response_text)
        return AIDescriptionResponse(
            description=result.get("description", response),
            short_description=result.get("short_description", request.product_title)
        )
    except:
        lines = response.split("\n\n")
        return AIDescriptionResponse(
            description=response if len(lines) < 2 else "\n\n".join(lines[:-1]),
            short_description=lines[-1] if len(lines) > 1 else request.product_title[:160]
        )

# ============= CONTACT & SUPPORT =============

@api_router.post("/contact/callback")
async def request_callback(request: ContactRequest):
    callback_doc = {
        "id": str(uuid.uuid4()),
        "name": request.name,
        "phone": request.phone,
        "message": request.message,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "status": "pending"
    }
    await db.callbacks.insert_one(callback_doc)
    return {"message": "Callback request received. We will contact you soon."}

# ============= ADMIN ENDPOINTS =============

@api_router.get("/admin/users", response_model=List[User])
async def get_all_users(current_user: User = Depends(get_current_admin)):
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(1000)
    for user in users:
        if isinstance(user.get("created_at"), str):
            user["created_at"] = datetime.fromisoformat(user["created_at"])
    return users

from analytics_service import init_analytics

# Initialize analytics service
analytics_svc = init_analytics(db)

@api_router.get("/admin/stats")
async def get_admin_stats(current_user: User = Depends(get_current_admin)):
    return await analytics_svc.get_overview_stats()

@api_router.get("/admin/analytics/revenue")
async def get_revenue_analytics(days: int = 30, current_user: User = Depends(get_current_admin)):
    return await analytics_svc.get_revenue_by_period(days)

@api_router.get("/admin/analytics/top-products")
async def get_top_products(limit: int = 10, current_user: User = Depends(get_current_admin)):
    return await analytics_svc.get_top_products(limit)

@api_router.get("/admin/analytics/categories")
async def get_category_distribution(current_user: User = Depends(get_current_admin)):
    return await analytics_svc.get_category_distribution()

@api_router.get("/admin/analytics/user-growth")
async def get_user_growth(days: int = 30, current_user: User = Depends(get_current_admin)):
    return await analytics_svc.get_user_growth(days)

@api_router.get("/admin/analytics/sellers")
async def get_seller_performance(limit: int = 10, current_user: User = Depends(get_current_admin)):
    return await analytics_svc.get_seller_performance(limit)

@api_router.get("/admin/analytics/order-status")
async def get_order_status_distribution(current_user: User = Depends(get_current_admin)):
    return await analytics_svc.get_order_status_distribution()

# ============= AI FEATURES =============

from ai_service import ai_service

class AIGenerateDescriptionRequest(BaseModel):
    product_name: str
    category: str
    price: Optional[float] = None
    features: Optional[List[str]] = None

@api_router.post("/ai/generate-description")
async def generate_product_description(
    request: AIGenerateDescriptionRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Generate AI product description
    Requires seller or admin role
    """
    if current_user.role not in ['seller', 'admin']:
        raise HTTPException(status_code=403, detail="Only sellers and admins can generate descriptions")
    
    try:
        existing_info = {}
        if request.price:
            existing_info['price'] = request.price
        if request.features:
            existing_info['features'] = request.features
        
        result = await ai_service.generate_product_description(
            product_name=request.product_name,
            category=request.category,
            existing_info=existing_info if existing_info else None
        )
        
        return result
    except Exception as e:
        logger.error(f"Error in generate_product_description: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ============= PAYOUTS =============

from payouts_service import init_payouts

# Initialize payouts service
payouts_svc = init_payouts(db)

class PayoutRequest(BaseModel):
    amount: float
    payment_method: str  # bank_transfer, paypal, stripe
    payment_details: Dict[str, str]  # account_number, email, etc.

@api_router.get("/seller/balance")
async def get_seller_balance(current_user: User = Depends(get_current_user)):
    if current_user.role != 'seller':
        raise HTTPException(status_code=403, detail="Only sellers can access balance")
    return await payouts_svc.calculate_seller_balance(current_user.id)

@api_router.post("/seller/payouts")
async def request_payout(
    request: PayoutRequest,
    current_user: User = Depends(get_current_user)
):
    if current_user.role != 'seller':
        raise HTTPException(status_code=403, detail="Only sellers can request payouts")
    
    try:
        payout = await payouts_svc.create_payout_request(
            current_user.id,
            request.amount,
            request.payment_method,
            request.payment_details
        )
        return {"success": True, "payout": payout}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.get("/seller/payouts")
async def get_my_payouts(current_user: User = Depends(get_current_user)):
    if current_user.role != 'seller':
        raise HTTPException(status_code=403, detail="Only sellers can access payouts")
    return await payouts_svc.get_seller_payouts(current_user.id)

@api_router.get("/admin/payouts/pending")
async def get_pending_payouts_admin(current_user: User = Depends(get_current_admin)):
    return await payouts_svc.get_pending_payouts()

@api_router.post("/admin/payouts/{payout_id}/process")
async def process_payout_admin(
    payout_id: str,
    status: str,
    current_user: User = Depends(get_current_admin)
):
    if status not in ['completed', 'rejected']:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    try:
        payout = await payouts_svc.process_payout(payout_id, current_user.id, status)
        return {"success": True, "payout": payout}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    """
    Generate AI product description
    Requires seller or admin role
    """
    if current_user.role not in ['seller', 'admin']:
        raise HTTPException(status_code=403, detail="Only sellers and admins can generate descriptions")
    
    try:
        existing_info = {}
        if request.price:
            existing_info['price'] = request.price
        if request.features:
            existing_info['features'] = request.features
        
        result = await ai_service.generate_product_description(
            product_name=request.product_name,
            category=request.category,
            existing_info=existing_info if existing_info else None
        )
        
        return result
    except Exception as e:
        logger.error(f"Error in generate_product_description: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/ai/recommendations")
async def get_product_recommendations(
    product_id: Optional[str] = None,
    limit: int = 5
):
    """
    Get AI-powered product recommendations
    Based on user history and current product
    """
    try:
        # Get user history (for now, use empty list - can be enhanced later)
        user_history = []
        
        # TODO: Get from user session/cookies if available
        if False:  # Placeholder for future auth integration
            # Get user's order history
            orders = await db.orders.find(
                {"buyer_id": current_user.id},
                {"_id": 0}
            ).limit(20).to_list(20)
            
            # Extract products from orders
            for order in orders:
                for item in order.get('items', []):
                    user_history.append({
                        'title': item.get('title'),
                        'category': 'Electronics',  # Default category
                        'id': item.get('product_id')
                    })
        
        # Get current product if provided
        current_product = None
        if product_id:
            product = await db.products.find_one({"id": product_id}, {"_id": 0})
            if product:
                current_product = {
                    'id': product['id'],
                    'title': product['name'],
                    'category': product.get('category', 'General')
                }
        
        # Get available products
        available_products = await db.products.find(
            {"status": "published"},
            {"_id": 0, "id": 1, "name": 1, "category": 1, "price": 1}
        ).limit(50).to_list(50)
        
        # Format for AI
        available_for_ai = [
            {
                'id': p['id'],
                'title': p['name'],
                'category': p.get('category', 'General'),
                'price': p.get('price', 0)
            }
            for p in available_products
        ]
        
        result = await ai_service.generate_recommendations(
            user_history=user_history,
            current_product=current_product,
            available_products=available_for_ai,
            limit=limit
        )
        
        return result
    except Exception as e:
        logger.error(f"Error in get_product_recommendations: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ============= NOVA POSHTA INTEGRATION =============

from novaposhta_service import novaposhta_service

@api_router.get("/novaposhta/cities")
async def search_novaposhta_cities(query: str, limit: int = 10):
    """
    Search for cities in Nova Poshta system
    """
    try:
        result = novaposhta_service.search_cities(query, limit)
        return result
    except Exception as e:
        logger.error(f"Error searching cities: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/novaposhta/warehouses")
async def get_novaposhta_warehouses(city_ref: str, number: Optional[str] = None):
    """
    Get Nova Poshta warehouses/branches by city and optional warehouse number
    """
    try:
        result = novaposhta_service.get_warehouses(city_ref, number)
        return result
    except Exception as e:
        logger.error(f"Error getting warehouses: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ============= ROZETKAPAY PAYMENT INTEGRATION =============

from rozetkapay_service import rozetkapay_service

class RozetkaPayCreatePaymentRequest(BaseModel):
    external_id: str
    amount: float
    currency: str = "UAH"
    customer: Dict[str, Any]
    description: str = "Оплата заказа"

class RozetkaPayPaymentResponse(BaseModel):
    success: bool
    payment_id: Optional[str] = None
    external_id: Optional[str] = None
    is_success: Optional[bool] = None
    action_required: bool = False
    action: Optional[Dict[str, Any]] = None
    status: Optional[str] = None
    error: Optional[str] = None
    message: Optional[str] = None

@api_router.post("/payment/rozetkapay/create", response_model=RozetkaPayPaymentResponse)
async def create_rozetkapay_payment(
    request: RozetkaPayCreatePaymentRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Create payment using RozetkaPay Hosted Checkout
    """
    try:
        # Get callback and result URLs
        backend_url = os.environ.get('REACT_APP_BACKEND_URL', 'http://localhost:8001')
        frontend_url = backend_url.replace(':8001', ':3000').replace('/api', '')
        
        callback_url = f"{backend_url}/api/payment/rozetkapay/webhook"
        result_url = f"{frontend_url}/checkout/success"
        
        # Create payment
        result = rozetkapay_service.create_payment(
            external_id=request.external_id,
            amount=request.amount,
            currency=request.currency,
            customer=request.customer,
            callback_url=callback_url,
            result_url=result_url,
            description=request.description
        )
        
        if result.get("success"):
            # Save payment transaction to database
            payment_doc = {
                "id": str(uuid.uuid4()),
                "order_id": request.external_id,
                "payment_id": result.get("payment_id"),
                "user_id": current_user.id,
                "amount": request.amount,
                "currency": request.currency,
                "status": result.get("status", "pending"),
                "payment_method": "rozetkapay",
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat(),
                "raw_response": result.get("raw_response")
            }
            await db.payment_transactions.insert_one(payment_doc)
            
            return RozetkaPayPaymentResponse(
                success=True,
                payment_id=result.get("payment_id"),
                external_id=result.get("external_id"),
                is_success=result.get("is_success"),
                action_required=result.get("action_required", False),
                action=result.get("action"),
                status=result.get("status"),
                message="Payment created successfully"
            )
        else:
            logger.error(f"Payment creation failed: {result.get('error')}")
            return RozetkaPayPaymentResponse(
                success=False,
                error=result.get("error"),
                message="Failed to create payment"
            )
    
    except Exception as e:
        logger.error(f"Error in create_rozetkapay_payment: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create payment: {str(e)}"
        )

@api_router.post("/payment/rozetkapay/webhook")
async def rozetkapay_webhook(request: Request):
    """
    Handle payment webhooks from RozetkaPay
    """
    try:
        # Get raw body and signature
        body = await request.body()
        body_str = body.decode('utf-8')
        signature = request.headers.get('X-ROZETKAPAY-SIGNATURE', '')
        
        logger.info(f"Received webhook from RozetkaPay")
        
        # Verify signature
        if not rozetkapay_service.verify_webhook_signature(body_str, signature):
            logger.warning("Invalid webhook signature")
            raise HTTPException(status_code=403, detail="Invalid signature")
        
        # Parse payload
        import json
        payload = json.loads(body_str)
        
        # Extract payment details
        external_id = payload.get("external_id")
        payment_id = payload.get("id")
        is_success = payload.get("is_success")
        details = payload.get("details", {})
        status = details.get("status")
        
        logger.info(f"Webhook for order {external_id}: status={status}, success={is_success}")
        
        # Update order status
        if external_id:
            order = await db.orders.find_one({"order_number": external_id})
            if order:
                new_status = "paid" if is_success else "payment_failed"
                await db.orders.update_one(
                    {"order_number": external_id},
                    {
                        "$set": {
                            "payment_status": new_status,
                            "payment_session_id": payment_id,
                            "updated_at": datetime.now(timezone.utc).isoformat()
                        }
                    }
                )
                logger.info(f"Order {external_id} updated to status: {new_status}")
        
        # Update payment transaction
        await db.payment_transactions.update_one(
            {"order_id": external_id},
            {
                "$set": {
                    "status": status,
                    "is_success": is_success,
                    "webhook_received": True,
                    "webhook_data": payload,
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
            }
        )
        
        return {"status": "processed", "order_id": external_id}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing webhook: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to process webhook")

@api_router.get("/payment/rozetkapay/info/{payment_id}")
async def get_payment_info(
    payment_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Get payment information from RozetkaPay
    """
    try:
        result = rozetkapay_service.get_payment_info(payment_id)
        return result
    except Exception as e:
        logger.error(f"Error getting payment info: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ============= INITIALIZE APP =============

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()