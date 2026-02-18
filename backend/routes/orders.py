"""
Order and Cart routes
"""
from fastapi import APIRouter, HTTPException, Depends, Request
from typing import List
from datetime import datetime, timezone
import uuid
import logging
import os

from database import db
from models.order import (
    Cart, CartItem, AddToCartRequest,
    Order, OrderItem, CheckoutRequest, PaymentTransaction
)
from models.user import User
from dependencies import get_current_user, get_current_admin

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Orders & Cart"])


# ============= CART ENDPOINTS =============

@router.get("/cart", response_model=Cart)
async def get_cart(current_user: User = Depends(get_current_user)):
    """Get current user's cart"""
    cart = await db.carts.find_one({"user_id": current_user.id}, {"_id": 0})
    if not cart:
        cart = Cart(user_id=current_user.id)
        cart_doc = cart.model_dump()
        cart_doc["created_at"] = cart_doc["created_at"].isoformat()
        cart_doc["updated_at"] = cart_doc["updated_at"].isoformat()
        await db.carts.insert_one(cart_doc)
        return cart
    
    if isinstance(cart.get("created_at"), str):
        cart["created_at"] = datetime.fromisoformat(cart["created_at"])
    if isinstance(cart.get("updated_at"), str):
        cart["updated_at"] = datetime.fromisoformat(cart["updated_at"])
    return Cart(**cart)


@router.post("/cart/items")
async def add_to_cart(
    item: AddToCartRequest,
    current_user: User = Depends(get_current_user)
):
    """Add item to cart"""
    product = await db.products.find_one({"id": item.product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if product["stock_level"] < item.quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock")
    
    cart = await db.carts.find_one({"user_id": current_user.id}, {"_id": 0})
    if not cart:
        cart = Cart(user_id=current_user.id).model_dump()
        cart["created_at"] = cart["created_at"].isoformat()
        cart["updated_at"] = cart["updated_at"].isoformat()
    
    cart_item = CartItem(
        product_id=item.product_id,
        quantity=item.quantity,
        price=product["price"]
    )
    
    items = cart.get("items", [])
    existing_idx = next((i for i, x in enumerate(items) if x["product_id"] == item.product_id), None)
    
    if existing_idx is not None:
        items[existing_idx]["quantity"] += item.quantity
    else:
        items.append(cart_item.model_dump())
    
    cart["items"] = items
    cart["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.carts.update_one(
        {"user_id": current_user.id},
        {"$set": cart},
        upsert=True
    )
    
    return {"message": "Item added to cart", "cart": cart}


@router.delete("/cart/items/{product_id}")
async def remove_from_cart(
    product_id: str,
    current_user: User = Depends(get_current_user)
):
    """Remove item from cart"""
    cart = await db.carts.find_one({"user_id": current_user.id})
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    items = [item for item in cart.get("items", []) if item["product_id"] != product_id]
    
    await db.carts.update_one(
        {"user_id": current_user.id},
        {"$set": {"items": items, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"message": "Item removed from cart"}


@router.delete("/cart")
async def clear_cart(current_user: User = Depends(get_current_user)):
    """Clear entire cart"""
    await db.carts.update_one(
        {"user_id": current_user.id},
        {"$set": {"items": [], "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"message": "Cart cleared"}


# ============= CHECKOUT ENDPOINTS =============

@router.post("/checkout/create-session")
async def create_checkout_session(
    request: Request,
    checkout_data: CheckoutRequest,
    current_user: User = Depends(get_current_user)
):
    """Create Stripe checkout session"""
    from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionRequest
    
    cart = await db.carts.find_one({"user_id": current_user.id}, {"_id": 0})
    if not cart or not cart.get("items"):
        raise HTTPException(status_code=400, detail="Cart is empty")
    
    total = sum(item["price"] * item["quantity"] for item in cart["items"])
    
    order_items = []
    for item in cart["items"]:
        product = await db.products.find_one({"id": item["product_id"]}, {"_id": 0})
        if product:
            order_items.append(OrderItem(
                product_id=item["product_id"],
                title=product["title"],
                quantity=item["quantity"],
                price=item["price"],
                seller_id=product["seller_id"]
            ))
    
    order = Order(
        order_number=f"ORD-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}",
        buyer_id=current_user.id,
        items=order_items,
        total_amount=total,
        shipping_address=checkout_data.shipping_address,
        status="pending",
        payment_status="pending"
    )
    
    order_doc = order.model_dump()
    order_doc["created_at"] = order_doc["created_at"].isoformat()
    order_doc["updated_at"] = order_doc["updated_at"].isoformat()
    await db.orders.insert_one(order_doc)
    
    stripe_api_key = os.environ.get('STRIPE_API_KEY')
    host_url = str(request.base_url).rstrip('/')
    webhook_url = f"{host_url}/api/webhook/stripe"
    
    stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url=webhook_url)
    
    success_url = f"{request.headers.get('origin', host_url)}/checkout/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{request.headers.get('origin', host_url)}/checkout/cancel"
    
    checkout_request = CheckoutSessionRequest(
        amount=total,
        currency="usd",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "order_id": order.id,
            "user_id": current_user.id
        }
    )
    
    session = await stripe_checkout.create_checkout_session(checkout_request)
    
    payment = PaymentTransaction(
        order_id=order.id,
        session_id=session.session_id,
        amount=total,
        currency="usd",
        payment_status="pending",
        user_id=current_user.id,
        metadata={"order_number": order.order_number}
    )
    
    payment_doc = payment.model_dump()
    payment_doc["created_at"] = payment_doc["created_at"].isoformat()
    payment_doc["updated_at"] = payment_doc["updated_at"].isoformat()
    await db.payment_transactions.insert_one(payment_doc)
    
    await db.orders.update_one(
        {"id": order.id},
        {"$set": {"payment_session_id": session.session_id}}
    )
    
    return {
        "checkout_url": session.url,
        "session_id": session.session_id,
        "order_id": order.id
    }


@router.get("/checkout/status/{session_id}")
async def get_checkout_status(session_id: str):
    """Get checkout status"""
    from emergentintegrations.payments.stripe.checkout import StripeCheckout
    
    stripe_api_key = os.environ.get('STRIPE_API_KEY')
    stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url="")
    
    status = await stripe_checkout.get_checkout_status(session_id)
    
    if status.payment_status == "paid":
        payment = await db.payment_transactions.find_one({"session_id": session_id})
        if payment and payment.get("payment_status") != "paid":
            await db.payment_transactions.update_one(
                {"session_id": session_id},
                {"$set": {"payment_status": "paid", "updated_at": datetime.now(timezone.utc).isoformat()}}
            )
            
            await db.orders.update_one(
                {"id": payment["order_id"]},
                {"$set": {
                    "payment_status": "paid",
                    "status": "processing",
                    "payment_method": "stripe",
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }}
            )
            
            order = await db.orders.find_one({"id": payment["order_id"]})
            if order:
                await db.carts.update_one(
                    {"user_id": order["buyer_id"]},
                    {"$set": {"items": [], "updated_at": datetime.now(timezone.utc).isoformat()}}
                )
    
    return status


@router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    """Handle Stripe webhook"""
    from emergentintegrations.payments.stripe.checkout import StripeCheckout
    
    stripe_api_key = os.environ.get('STRIPE_API_KEY')
    webhook_url = str(request.base_url).rstrip('/') + "/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url=webhook_url)
    
    body = await request.body()
    signature = request.headers.get("Stripe-Signature")
    
    try:
        webhook_response = await stripe_checkout.handle_webhook(body, signature)
        logger.info(f"Stripe webhook: {webhook_response.event_type}")
        return {"status": "success"}
    except Exception as e:
        logger.error(f"Stripe webhook error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))


# ============= ORDERS ENDPOINTS =============

@router.post("/orders", response_model=Order)
async def create_order(
    order_data: dict,
    current_user: User = Depends(get_current_user)
):
    """Create a new order"""
    try:
        order = Order(
            order_number=order_data.get("order_number", f"ORD-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"),
            buyer_id=order_data.get("buyer_id", current_user.id),
            items=order_data.get("items", []),
            total_amount=order_data.get("total_amount", 0),
            currency=order_data.get("currency", "USD"),
            shipping_address=order_data.get("shipping_address", {}),
            status=order_data.get("status", "pending"),
            payment_status=order_data.get("payment_status", "pending"),
            payment_method=order_data.get("payment_method", "cash_on_delivery")
        )
        
        order_doc = order.model_dump()
        order_doc["created_at"] = order_doc["created_at"].isoformat()
        order_doc["updated_at"] = order_doc["updated_at"].isoformat()
        await db.orders.insert_one(order_doc)
        
        # Clear cart after successful order creation
        await db.carts.update_one(
            {"user_id": current_user.id},
            {"$set": {"items": []}}
        )
        
        # Send email notifications
        try:
            from email_service import email_service
            
            customer = await db.users.find_one({"id": current_user.id}, {"_id": 0})
            customer_name = customer.get("full_name", "Покупатель") if customer else "Покупатель"
            customer_email = customer.get("email", "") if customer else ""
            
            email_order_data = {
                "order_number": order.order_number,
                "buyer_id": order.buyer_id,
                "customer_name": customer_name,
                "customer_email": customer_email,
                "items": [],
                "total_amount": order.total_amount,
                "status": order.status,
                "payment_method": order.payment_method
            }
            
            for item in order.items:
                product = await db.products.find_one({"id": item.get("product_id")}, {"_id": 0})
                email_order_data["items"].append({
                    "product_name": product.get("title", "Unknown") if product else "Unknown",
                    "quantity": item.get("quantity", 0),
                    "price": item.get("price", 0)
                })
            
            if customer_email:
                email_service.send_order_confirmation(customer_email, email_order_data)
            
            email_service.send_admin_notification(email_order_data)
            
        except Exception as e:
            logger.error(f"Failed to send email notifications: {str(e)}")
        
        return order
        
    except Exception as e:
        logger.error(f"Error creating order: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create order: {str(e)}")


@router.get("/orders", response_model=List[Order])
async def get_orders(current_user: User = Depends(get_current_user)):
    """Get user's orders"""
    query = {"buyer_id": current_user.id}
    if current_user.role == "admin":
        query = {}
    
    orders = await db.orders.find(query, {"_id": 0}).to_list(1000)
    for order in orders:
        if isinstance(order.get("created_at"), str):
            order["created_at"] = datetime.fromisoformat(order["created_at"])
        if isinstance(order.get("updated_at"), str):
            order["updated_at"] = datetime.fromisoformat(order["updated_at"])
    return orders


@router.get("/orders/{order_id}", response_model=Order)
async def get_order(order_id: str, current_user: User = Depends(get_current_user)):
    """Get single order by ID"""
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order["buyer_id"] != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if isinstance(order.get("created_at"), str):
        order["created_at"] = datetime.fromisoformat(order["created_at"])
    if isinstance(order.get("updated_at"), str):
        order["updated_at"] = datetime.fromisoformat(order["updated_at"])
    return Order(**order)


@router.get("/admin/orders")
async def get_admin_orders(current_user: User = Depends(get_current_admin)):
    """Get all orders with details for admin"""
    try:
        orders = await db.orders.find({}, {"_id": 0}).to_list(10000)
        
        for order in orders:
            customer = await db.users.find_one({"id": order.get("buyer_id")}, {"_id": 0})
            if customer:
                order["customer_name"] = customer.get("full_name", "N/A")
                order["customer_email"] = customer.get("email", "N/A")
            else:
                order["customer_name"] = "Unknown"
                order["customer_email"] = "N/A"
            
            for item in order.get("items", []):
                product = await db.products.find_one({"id": item.get("product_id")}, {"_id": 0})
                if product:
                    item["product_name"] = product.get("title", "Unknown Product")
                    item["category_name"] = product.get("category_name")
                    item["price"] = item.get("price", product.get("price", 0))
            
            if isinstance(order.get("created_at"), str):
                order["created_at"] = order["created_at"]
            elif hasattr(order.get("created_at"), 'isoformat'):
                order["created_at"] = order["created_at"].isoformat()
                
            if isinstance(order.get("updated_at"), str):
                order["updated_at"] = order["updated_at"]
            elif hasattr(order.get("updated_at"), 'isoformat'):
                order["updated_at"] = order["updated_at"].isoformat()
        
        return orders
    except Exception as e:
        logger.error(f"Error fetching admin orders: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
