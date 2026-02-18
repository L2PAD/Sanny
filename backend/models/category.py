"""
Category models
"""
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime, timezone
import uuid


class Category(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    slug: str
    parent_id: Optional[str] = None
    icon: Optional[str] = 'Smartphone'
    image_url: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class CategoryCreate(BaseModel):
    name: str
    slug: str
    parent_id: Optional[str] = None
    icon: Optional[str] = 'Smartphone'
    image_url: Optional[str] = None
