"""
Order and Cart models
"""
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
import uuid


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
