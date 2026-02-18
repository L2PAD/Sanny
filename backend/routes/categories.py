"""
Category routes
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import List
from datetime import datetime

from database import db
from models.category import Category, CategoryCreate
from models.user import User
from dependencies import get_current_admin

router = APIRouter(prefix="/categories", tags=["Categories"])


@router.get("")
async def get_categories(tree: bool = False):
    """
    Get all categories. If tree=true, returns nested structure.
    Otherwise returns flat list.
    """
    categories = await db.categories.find({}, {"_id": 0}).to_list(1000)
    for cat in categories:
        if isinstance(cat.get("created_at"), str):
            cat["created_at"] = datetime.fromisoformat(cat["created_at"])
    
    if not tree:
        return categories
    
    # Build tree structure
    def build_tree(parent_id=None):
        result = []
        for cat in categories:
            if cat.get("parent_id") == parent_id:
                cat_copy = dict(cat)
                children = build_tree(cat["id"])
                if children:
                    cat_copy["children"] = children
                result.append(cat_copy)
        return result
    
    return build_tree(None)


@router.post("", response_model=Category)
async def create_category(
    category_data: CategoryCreate,
    current_user: User = Depends(get_current_admin)
):
    """Create a new category (admin only)"""
    category = Category(**category_data.model_dump())
    cat_doc = category.model_dump()
    cat_doc["created_at"] = cat_doc["created_at"].isoformat()
    await db.categories.insert_one(cat_doc)
    return category


@router.put("/{category_id}", response_model=Category)
async def update_category(
    category_id: str,
    category_data: CategoryCreate,
    current_user: User = Depends(get_current_admin)
):
    """Update a category (admin only)"""
    update_data = category_data.model_dump(exclude_unset=True)
    
    result = await db.categories.update_one(
        {"id": category_id},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    
    updated_category = await db.categories.find_one({"id": category_id}, {"_id": 0})
    return Category(**updated_category)


@router.delete("/{category_id}")
async def delete_category(
    category_id: str,
    current_user: User = Depends(get_current_admin)
):
    """Delete a category (admin only)"""
    result = await db.categories.delete_one({"id": category_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    
    return {"message": "Category deleted successfully"}
