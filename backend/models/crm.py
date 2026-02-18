"""
CRM models - Customer Notes, Tasks, Leads, Email Templates
"""
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import Optional, Dict, Any
from datetime import datetime, timezone
import uuid


class CustomerNote(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_id: str
    author_id: str
    author_name: str
    note: str
    type: str = "general"  # general, call, email, meeting, complaint, order_update
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class CustomerNoteCreate(BaseModel):
    customer_id: str
    note: str
    type: str = "general"


class CustomerSegment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = None
    conditions: Dict[str, Any] = {}
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class CRMTask(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: Optional[str] = None
    customer_id: Optional[str] = None
    assigned_to: str
    due_date: Optional[datetime] = None
    priority: str = "medium"  # low, medium, high, urgent
    status: str = "pending"  # pending, in_progress, completed, cancelled
    type: str = "follow_up"  # follow_up, call, email, meeting
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    completed_at: Optional[datetime] = None


class CRMTaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    customer_id: Optional[str] = None
    assigned_to: str
    due_date: Optional[datetime] = None
    priority: str = "medium"
    type: str = "follow_up"


class CRMTaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: Optional[str] = None
    status: Optional[str] = None


class Lead(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    phone: Optional[str] = None
    source: str = "website"  # website, referral, social, ads, other
    status: str = "new"  # new, contacted, qualified, converted, lost
    interest: Optional[str] = None
    notes: Optional[str] = None
    assigned_to: Optional[str] = None
    converted_to_customer_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class LeadCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    source: str = "website"
    interest: Optional[str] = None
    notes: Optional[str] = None


class LeadUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    assigned_to: Optional[str] = None


class EmailTemplate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    subject: str
    body: str
    type: str = "marketing"  # marketing, transactional, notification
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
