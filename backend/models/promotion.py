"""
Promotion, Offer, and Content Section models
"""
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime, timezone
import uuid


class HeroSlide(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    subtitle: Optional[str] = None
    description: Optional[str] = None
    type: str = "banner"
    product_id: Optional[str] = None
    image_url: Optional[str] = None
    background_color: Optional[str] = None
    background_gradient: Optional[str] = None
    promo_text: Optional[str] = None
    button_text: Optional[str] = None
    button_link: Optional[str] = None
    countdown_enabled: bool = False
    countdown_end_date: Optional[datetime] = None
    order: int = 0
    active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class HeroSlideCreate(BaseModel):
    title: str
    subtitle: Optional[str] = None
    description: Optional[str] = None
    type: str = "banner"
    product_id: Optional[str] = None
    image_url: Optional[str] = None
    background_color: Optional[str] = None
    background_gradient: Optional[str] = None
    promo_text: Optional[str] = None
    button_text: Optional[str] = None
    button_link: Optional[str] = None
    countdown_enabled: bool = False
    countdown_end_date: Optional[datetime] = None
    order: int = 0
    active: bool = True


class HeroSlideUpdate(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    description: Optional[str] = None
    type: Optional[str] = None
    product_id: Optional[str] = None
    image_url: Optional[str] = None
    background_color: Optional[str] = None
    background_gradient: Optional[str] = None
    promo_text: Optional[str] = None
    button_text: Optional[str] = None
    button_link: Optional[str] = None
    countdown_enabled: Optional[bool] = None
    countdown_end_date: Optional[datetime] = None
    order: Optional[int] = None
    active: Optional[bool] = None


class PopularCategory(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    icon: Optional[str] = None
    image_url: Optional[str] = None
    category_id: Optional[str] = None
    product_ids: List[str] = []
    order: int = 0
    active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class PopularCategoryCreate(BaseModel):
    name: str
    icon: Optional[str] = None
    image_url: Optional[str] = None
    category_id: Optional[str] = None
    product_ids: List[str] = []
    order: int = 0
    active: bool = True


class PopularCategoryUpdate(BaseModel):
    name: Optional[str] = None
    icon: Optional[str] = None
    image_url: Optional[str] = None
    category_id: Optional[str] = None
    product_ids: Optional[List[str]] = None
    order: Optional[int] = None
    active: Optional[bool] = None


class ActualOffer(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    subtitle: Optional[str] = None
    description: Optional[str] = None
    description_html: Optional[str] = None
    image_url: str
    banner_image_url: Optional[str] = None
    link_url: str
    product_ids: List[str] = []
    background_color: Optional[str] = "#ffffff"
    text_color: Optional[str] = "#000000"
    position: int = 0
    order: int = 0
    active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ActualOfferCreate(BaseModel):
    title: str
    subtitle: Optional[str] = None
    description: Optional[str] = None
    description_html: Optional[str] = None
    image_url: str
    banner_image_url: Optional[str] = None
    link_url: str
    product_ids: List[str] = []
    background_color: Optional[str] = "#ffffff"
    text_color: Optional[str] = "#000000"
    position: int = 0


class ActualOfferUpdate(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    description: Optional[str] = None
    description_html: Optional[str] = None
    image_url: Optional[str] = None
    banner_image_url: Optional[str] = None
    link_url: Optional[str] = None
    product_ids: Optional[List[str]] = None
    background_color: Optional[str] = None
    text_color: Optional[str] = None
    position: Optional[int] = None
    order: Optional[int] = None
    active: Optional[bool] = None


class Promotion(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    detailed_description: Optional[str] = None
    image_url: str
    discount_text: Optional[str] = None
    link_url: Optional[str] = None
    countdown_enabled: bool = False
    countdown_end_date: Optional[datetime] = None
    background_color: Optional[str] = "#ffffff"
    text_color: Optional[str] = "#000000"
    badge_color: Optional[str] = "#ef4444"
    order: int = 0
    active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class PromotionCreate(BaseModel):
    title: str
    description: str
    detailed_description: Optional[str] = None
    image_url: str
    discount_text: Optional[str] = None
    link_url: Optional[str] = None
    countdown_enabled: bool = False
    countdown_end_date: Optional[datetime] = None
    background_color: Optional[str] = "#ffffff"
    text_color: Optional[str] = "#000000"
    badge_color: Optional[str] = "#ef4444"
    order: int = 0
    active: bool = True


class PromotionUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    detailed_description: Optional[str] = None
    image_url: Optional[str] = None
    discount_text: Optional[str] = None
    link_url: Optional[str] = None
    countdown_enabled: Optional[bool] = None
    countdown_end_date: Optional[datetime] = None
    background_color: Optional[str] = None
    text_color: Optional[str] = None
    badge_color: Optional[str] = None
    order: Optional[int] = None
    active: Optional[bool] = None


class CustomSection(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    slug: str
    description: Optional[str] = None
    description_html: Optional[str] = None
    banner_image_url: Optional[str] = None
    icon: Optional[str] = None
    product_ids: List[str] = []
    display_on_home: bool = True
    order: int = 0
    active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class CustomSectionCreate(BaseModel):
    title: str
    slug: str
    description: Optional[str] = None
    description_html: Optional[str] = None
    banner_image_url: Optional[str] = None
    icon: Optional[str] = None
    product_ids: List[str] = []
    display_on_home: bool = True
    order: int = 0
    active: bool = True


class CustomSectionUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    description_html: Optional[str] = None
    banner_image_url: Optional[str] = None
    icon: Optional[str] = None
    product_ids: Optional[List[str]] = None
    display_on_home: Optional[bool] = None
    order: Optional[int] = None
    active: Optional[bool] = None
