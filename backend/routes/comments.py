"""
Comment routes - Threaded comments/chat system
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from datetime import datetime, timezone

from database import db
from models.comment import Comment, CommentCreate, CommentWithReplies, CommentReactions
from models.user import User
from dependencies import get_current_user

router = APIRouter(prefix="/comments", tags=["Comments"])


def build_comment_tree(comments: List[dict], parent_id: Optional[str] = None, current_user_id: Optional[str] = None) -> List[CommentWithReplies]:
    """Build nested tree structure from flat comments list"""
    result = []
    for comment in comments:
        if comment.get("parent_id") == parent_id:
            # Check if current user reacted
            user_reacted = current_user_id in comment.get("user_reactions", []) if current_user_id else False
            
            # Parse datetime
            created_at = comment.get("created_at")
            if isinstance(created_at, str):
                created_at = datetime.fromisoformat(created_at)
            
            # Parse reactions
            reactions_data = comment.get("reactions", {})
            if isinstance(reactions_data, dict):
                reactions = CommentReactions(**reactions_data)
            else:
                reactions = CommentReactions()
            
            comment_obj = CommentWithReplies(
                id=comment["id"],
                product_id=comment["product_id"],
                user_id=comment["user_id"],
                user_name=comment["user_name"],
                comment=comment["comment"],
                parent_id=comment.get("parent_id"),
                reactions=reactions,
                user_reacted=user_reacted,
                created_at=created_at,
                replies=build_comment_tree(comments, comment["id"], current_user_id)
            )
            result.append(comment_obj)
    
    # Sort by created_at descending (newest first for top-level, oldest first for replies)
    if parent_id is None:
        result.sort(key=lambda x: x.created_at, reverse=True)
    else:
        result.sort(key=lambda x: x.created_at)
    
    return result


@router.get("/product/{product_id}", response_model=List[CommentWithReplies])
async def get_product_comments(
    product_id: str,
    current_user_id: Optional[str] = None
):
    """Get all comments for a product in threaded structure"""
    comments = await db.comments.find(
        {"product_id": product_id},
        {"_id": 0}
    ).to_list(1000)
    
    # Build tree structure
    tree = build_comment_tree(comments, None, current_user_id)
    return tree


@router.get("/product/{product_id}/flat")
async def get_product_comments_flat(product_id: str):
    """Get all comments for a product as flat list"""
    comments = await db.comments.find(
        {"product_id": product_id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(1000)
    
    for comment in comments:
        if isinstance(comment.get("created_at"), str):
            comment["created_at"] = datetime.fromisoformat(comment["created_at"])
        if isinstance(comment.get("updated_at"), str):
            comment["updated_at"] = datetime.fromisoformat(comment["updated_at"])
    
    return comments


@router.post("", response_model=Comment)
async def create_comment(
    comment_data: CommentCreate,
    current_user: User = Depends(get_current_user)
):
    """Create a new comment or reply"""
    # If it's a reply, verify parent exists
    if comment_data.parent_id:
        parent = await db.comments.find_one({"id": comment_data.parent_id})
        if not parent:
            raise HTTPException(status_code=404, detail="Parent comment not found")
        # Ensure reply is on same product
        if parent["product_id"] != comment_data.product_id:
            raise HTTPException(status_code=400, detail="Reply must be on same product")
    
    comment = Comment(
        product_id=comment_data.product_id,
        user_id=current_user.id,
        user_name=current_user.full_name,
        comment=comment_data.comment,
        parent_id=comment_data.parent_id
    )
    
    comment_doc = comment.model_dump()
    comment_doc["created_at"] = comment_doc["created_at"].isoformat()
    comment_doc["updated_at"] = comment_doc["updated_at"].isoformat()
    comment_doc["reactions"] = {"likes": 0, "hearts": 0}
    comment_doc["user_reactions"] = []
    
    await db.comments.insert_one(comment_doc)
    return comment


@router.post("/{comment_id}/react")
async def react_to_comment(
    comment_id: str,
    reaction_type: str,
    current_user: User = Depends(get_current_user)
):
    """Add or remove reaction from a comment"""
    if reaction_type not in ["likes", "hearts"]:
        raise HTTPException(status_code=400, detail="Invalid reaction type. Use 'likes' or 'hearts'")
    
    comment = await db.comments.find_one({"id": comment_id})
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    user_reactions = comment.get("user_reactions", [])
    reactions = comment.get("reactions", {"likes": 0, "hearts": 0})
    
    # Toggle reaction
    if current_user.id in user_reactions:
        # Remove reaction
        user_reactions.remove(current_user.id)
        reactions[reaction_type] = max(0, reactions[reaction_type] - 1)
        reacted = False
    else:
        # Add reaction
        user_reactions.append(current_user.id)
        reactions[reaction_type] = reactions[reaction_type] + 1
        reacted = True
    
    await db.comments.update_one(
        {"id": comment_id},
        {
            "$set": {
                "reactions": reactions,
                "user_reactions": user_reactions,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    return {
        "success": True,
        "reacted": reacted,
        "reactions": reactions
    }


@router.delete("/{comment_id}")
async def delete_comment(
    comment_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete a comment (only by author or admin)"""
    comment = await db.comments.find_one({"id": comment_id})
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    if comment["user_id"] != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete this comment")
    
    # Delete comment and all its replies
    await db.comments.delete_many({
        "$or": [
            {"id": comment_id},
            {"parent_id": comment_id}
        ]
    })
    
    return {"message": "Comment deleted successfully"}


@router.get("/count/{product_id}")
async def get_comments_count(product_id: str):
    """Get total comments count for a product"""
    count = await db.comments.count_documents({"product_id": product_id})
    return {"count": count}
