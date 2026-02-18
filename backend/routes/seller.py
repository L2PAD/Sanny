"""
Seller dashboard routes
"""
from fastapi import APIRouter, Depends
from typing import List
from datetime import datetime

from database import db
from models.product import Product
from models.order import Order
from models.user import User
from dependencies import get_current_seller

router = APIRouter(prefix="/seller", tags=["Seller"])


@router.get("/products", response_model=List[Product])
async def get_seller_products(current_user: User = Depends(get_current_seller)):
    """Get seller's products"""
    products = await db.products.find({"seller_id": current_user.id}, {"_id": 0}).to_list(1000)
    for prod in products:
        if isinstance(prod.get("created_at"), str):
            prod["created_at"] = datetime.fromisoformat(prod["created_at"])
        if isinstance(prod.get("updated_at"), str):
            prod["updated_at"] = datetime.fromisoformat(prod["updated_at"])
    return products


@router.get("/orders", response_model=List[Order])
async def get_seller_orders(current_user: User = Depends(get_current_seller)):
    """Get orders containing seller's products"""
    orders = await db.orders.find({}, {"_id": 0}).to_list(1000)
    seller_orders = []
    
    for order in orders:
        if any(item["seller_id"] == current_user.id for item in order.get("items", [])):
            if isinstance(order.get("created_at"), str):
                order["created_at"] = datetime.fromisoformat(order["created_at"])
            if isinstance(order.get("updated_at"), str):
                order["updated_at"] = datetime.fromisoformat(order["updated_at"])
            seller_orders.append(order)
    
    return seller_orders


@router.get("/stats")
async def get_seller_stats(current_user: User = Depends(get_current_seller)):
    """Get seller statistics"""
    products = await db.products.find({"seller_id": current_user.id}).to_list(1000)
    orders = await db.orders.find({}).to_list(1000)
    
    total_products = len(products)
    total_revenue = 0.0
    total_orders = 0
    
    for order in orders:
        if order.get("payment_status") == "paid":
            for item in order.get("items", []):
                if item["seller_id"] == current_user.id:
                    total_revenue += item["price"] * item["quantity"]
                    total_orders += 1
    
    return {
        "total_products": total_products,
        "total_revenue": total_revenue,
        "total_orders": total_orders
    }
