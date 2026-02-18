"""
Product models
"""
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
import uuid


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
    is_bestseller: bool = False
    is_featured: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ProductCreate(BaseModel):
    title: str
    slug: Optional[str] = None
    description: str
    description_html: Optional[str] = None
    short_description: Optional[str] = None
    category_id: str
    category_name: Optional[str] = None
    price: float
    compare_price: Optional[float] = None
    stock_level: int = 0
    images: List[str] = []
    videos: Optional[List[str]] = []
    specifications: Optional[List[Dict[str, Any]]] = []
    status: str = "published"
    installment_months: Optional[int] = None
    installment_available: bool = False


class ProductUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    description_html: Optional[str] = None
    short_description: Optional[str] = None
    category_id: Optional[str] = None
    category_name: Optional[str] = None
    price: Optional[float] = None
    compare_price: Optional[float] = None
    stock_level: Optional[int] = None
    images: Optional[List[str]] = None
    videos: Optional[List[str]] = None
    specifications: Optional[List[Dict[str, Any]]] = None
    status: Optional[str] = None
    is_bestseller: Optional[bool] = None
    is_featured: Optional[bool] = None
