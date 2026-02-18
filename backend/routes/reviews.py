"""
Review routes
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import List
from datetime import datetime

from database import db
from models.review import Review, ReviewCreate, ReviewWithProduct
from models.user import User
from dependencies import get_current_user, get_current_admin

router = APIRouter(tags=["Reviews"])


@router.get("/products/{product_id}/reviews", response_model=List[Review])
async def get_product_reviews(product_id: str):
    """Get all reviews for a product"""
    reviews = await db.reviews.find({"product_id": product_id}, {"_id": 0}).to_list(1000)
    for review in reviews:
        if isinstance(review.get("created_at"), str):
            review["created_at"] = datetime.fromisoformat(review["created_at"])
    return reviews


@router.post("/reviews", response_model=Review)
async def create_review(
    review_data: ReviewCreate,
    current_user: User = Depends(get_current_user)
):
    """Create a new review (only for purchased products)"""
    # Check if user purchased this product
    user_orders = await db.orders.find({
        "buyer_id": current_user.id,
        "payment_status": {"$in": ["completed", "paid"]}
    }, {"_id": 0}).to_list(1000)
    
    has_purchased = False
    for order in user_orders:
        for item in order.get("items", []):
            if item.get("product_id") == review_data.product_id:
                has_purchased = True
                break
        if has_purchased:
            break
    
    if not has_purchased:
        raise HTTPException(
            status_code=403, 
            detail="You can only review products you have purchased"
        )
    
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


@router.get("/products/{product_id}/can-review")
async def can_user_review_product(
    product_id: str,
    current_user: User = Depends(get_current_user)
):
    """Check if user can review a product"""
    # Check if user purchased this product
    user_orders = await db.orders.find({
        "buyer_id": current_user.id,
        "payment_status": {"$in": ["completed", "paid"]}
    }, {"_id": 0}).to_list(1000)
    
    has_purchased = False
    for order in user_orders:
        for item in order.get("items", []):
            if item.get("product_id") == product_id:
                has_purchased = True
                break
        if has_purchased:
            break
    
    # Check if already reviewed
    existing_review = await db.reviews.find_one({
        "product_id": product_id,
        "user_id": current_user.id
    })
    
    return {
        "can_review": has_purchased and not existing_review,
        "has_purchased": has_purchased,
        "already_reviewed": existing_review is not None
    }


@router.get("/reviews/featured", response_model=List[ReviewWithProduct])
async def get_featured_reviews():
    """Get featured reviews for homepage"""
    reviews = await db.reviews.find(
        {"featured": True},
        {"_id": 0}
    ).sort("created_at", -1).limit(5).to_list(5)
    
    enriched_reviews = []
    for review in reviews:
        product = await db.products.find_one({"id": review.get("product_id")}, {"_id": 0})
        product_name = product.get("title", "Unknown Product") if product else "Unknown Product"
        
        user = await db.users.find_one({"id": review.get("user_id")}, {"_id": 0})
        user_email = user.get("email", "N/A") if user else "N/A"
        
        created_at = review.get("created_at")
        if isinstance(created_at, str):
            created_at = datetime.fromisoformat(created_at)
        
        enriched_review = ReviewWithProduct(
            id=review["id"],
            product_id=review["product_id"],
            product_name=product_name,
            user_id=review["user_id"],
            user_name=review.get("user_name", "Unknown"),
            user_email=user_email,
            rating=review["rating"],
            comment=review["comment"],
            created_at=created_at
        )
        enriched_reviews.append(enriched_review)
    
    return enriched_reviews


# Admin review routes
@router.get("/admin/reviews", response_model=List[ReviewWithProduct])
async def get_all_reviews_admin(current_user: User = Depends(get_current_admin)):
    """Get all reviews for admin management"""
    reviews = await db.reviews.find({}, {"_id": 0}).to_list(10000)
    
    enriched_reviews = []
    for review in reviews:
        product = await db.products.find_one({"id": review.get("product_id")}, {"_id": 0})
        product_name = product.get("title", "Unknown Product") if product else "Unknown Product"
        
        user = await db.users.find_one({"id": review.get("user_id")}, {"_id": 0})
        user_email = user.get("email", "N/A") if user else "N/A"
        
        created_at = review.get("created_at")
        if isinstance(created_at, str):
            created_at = datetime.fromisoformat(created_at)
        
        enriched_review = ReviewWithProduct(
            id=review["id"],
            product_id=review["product_id"],
            product_name=product_name,
            user_id=review["user_id"],
            user_name=review.get("user_name", "Unknown"),
            user_email=user_email,
            rating=review["rating"],
            comment=review["comment"],
            created_at=created_at
        )
        enriched_reviews.append(enriched_review)
    
    enriched_reviews.sort(key=lambda x: x.created_at, reverse=True)
    return enriched_reviews


@router.delete("/admin/reviews/{review_id}")
async def delete_review_admin(
    review_id: str,
    current_user: User = Depends(get_current_admin)
):
    """Delete a review (admin only)"""
    result = await db.reviews.delete_one({"id": review_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Review not found")
    
    return {"message": "Review deleted successfully"}


@router.put("/admin/reviews/{review_id}/feature")
async def toggle_review_featured(
    review_id: str,
    current_user: User = Depends(get_current_admin)
):
    """Toggle review featured status"""
    review = await db.reviews.find_one({"id": review_id})
    
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    new_featured_status = not review.get("featured", False)
    
    result = await db.reviews.update_one(
        {"id": review_id},
        {"$set": {"featured": new_featured_status}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=400, detail="Failed to update review")
    
    return {
        "message": "Review featured status updated",
        "featured": new_featured_status
    }
