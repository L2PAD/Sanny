"""
AI and Analytics models
"""
from pydantic import BaseModel
from typing import List, Optional, Dict, Any


class AIDescriptionRequest(BaseModel):
    product_title: str
    category: str
    key_features: Optional[List[str]] = []


class AIDescriptionResponse(BaseModel):
    description: str
    short_description: str


class AIRecommendationsRequest(BaseModel):
    product_name: str
    category: str
    price: float
    available_products: List[Dict[str, Any]]


class AIRecommendationsResponse(BaseModel):
    success: bool
    recommendations: List[Dict[str, Any]] = []
    error: Optional[str] = None


class AIChatRequest(BaseModel):
    messages: List[Dict[str, str]]
    context: Optional[Dict[str, Any]] = {}


class AIChatResponse(BaseModel):
    success: bool
    message: str
    error: Optional[str] = None


class AISEORequest(BaseModel):
    product_name: str
    category: str
    features: List[str] = []


class AISEOResponse(BaseModel):
    success: bool
    title: Optional[str] = None
    metaDescription: Optional[str] = None
    keywords: Optional[List[str]] = []
    error: Optional[str] = None


class AnalyticsEvent(BaseModel):
    session_id: str
    user_id: str
    event_type: str
    timestamp: str
    page_path: Optional[str] = None
    page_title: Optional[str] = None
    time_spent: Optional[int] = None
    product_id: Optional[str] = None
    product_name: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    quantity: Optional[int] = None
    query: Optional[str] = None
    results_count: Optional[int] = None


class ContactRequest(BaseModel):
    name: str
    phone: str
    message: str
