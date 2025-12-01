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
    short_description: Optional[str] = None
    category_id: str
    price: float
    compare_price: Optional[float] = None
    currency: str = "USD"
    stock_level: int = 0
    images: List[str] = []
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
    skip: int = 0,
    limit: int = 50
):
    query = {"status": "published"}
    
    if category_id:
        query["category_id"] = category_id
    if seller_id:
        query["seller_id"] = seller_id
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
    if min_price is not None or max_price is not None:
        query["price"] = {}
        if min_price is not None:
            query["price"]["$gte"] = min_price
        if max_price is not None:
            query["price"]["$lte"] = max_price
    
    products = await db.products.find(query, {"_id": 0}).skip(skip).limit(limit).to_list(limit)
    for prod in products:
        if isinstance(prod.get("created_at"), str):
            prod["created_at"] = datetime.fromisoformat(prod["created_at"])
        if isinstance(prod.get("updated_at"), str):
            prod["updated_at"] = datetime.fromisoformat(prod["updated_at"])
    return products

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

@api_router.get("/admin/stats")
async def get_admin_stats(current_user: User = Depends(get_current_admin)):
    total_users = await db.users.count_documents({})
    total_products = await db.products.count_documents({})
    total_orders = await db.orders.count_documents({})
    
    orders = await db.orders.find({"payment_status": "paid"}).to_list(1000)
    total_revenue = sum(order.get("total_amount", 0) for order in orders)
    
    return {
        "total_users": total_users,
        "total_products": total_products,
        "total_orders": total_orders,
        "total_revenue": total_revenue
    }

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