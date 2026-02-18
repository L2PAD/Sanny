"""
Comment models - Threaded comments/chat system
"""
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime, timezone
import uuid


class CommentReactions(BaseModel):
    likes: int = 0
    hearts: int = 0


class Comment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    product_id: str
    user_id: str
    user_name: str
    comment: str
    parent_id: Optional[str] = None  # For threaded replies
    reactions: CommentReactions = Field(default_factory=CommentReactions)
    user_reactions: List[str] = []  # List of user_ids who reacted
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class CommentCreate(BaseModel):
    product_id: str
    comment: str
    parent_id: Optional[str] = None


class CommentWithReplies(BaseModel):
    """Comment with nested replies for frontend"""
    model_config = ConfigDict(extra="ignore")
    id: str
    product_id: str
    user_id: str
    user_name: str
    comment: str
    parent_id: Optional[str] = None
    reactions: CommentReactions
    user_reacted: bool = False
    created_at: datetime
    replies: List["CommentWithReplies"] = []


# Allow self-reference for nested replies
CommentWithReplies.model_rebuild()
