"""
Main FastAPI application entry point

This is the refactored modular version of the Y-Store marketplace API.
"""
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
import logging

from config import CORS_ORIGINS
from database import db, close_db_connection

# Import route modules
from routes import auth, users, categories, products, reviews, orders, admin, seller, ai, crm, seo

# Import existing services for analytics
from advanced_analytics_service import get_advanced_analytics_service

# Create FastAPI app
app = FastAPI(title="Y-Store Marketplace API", version="2.0.0")

# API Router prefix
API_PREFIX = "/api"

# Include all routers with /api prefix
app.include_router(auth.router, prefix=API_PREFIX)
app.include_router(users.router, prefix=API_PREFIX)
app.include_router(categories.router, prefix=API_PREFIX)
app.include_router(products.router, prefix=API_PREFIX)
app.include_router(reviews.router, prefix=API_PREFIX)
app.include_router(orders.router, prefix=API_PREFIX)
app.include_router(admin.router, prefix=API_PREFIX)
app.include_router(seller.router, prefix=API_PREFIX)
app.include_router(ai.router, prefix=API_PREFIX)
app.include_router(crm.router, prefix=API_PREFIX)
app.include_router(seo.router, prefix=API_PREFIX)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging setup
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# ============= ANALYTICS ENDPOINTS (keeping in main for now) =============
from fastapi import Depends
from dependencies import get_current_admin
from models.user import User


@app.get("/api/admin/analytics/advanced/visits")
async def get_site_visits_analytics(days: int = 30, current_user: User = Depends(get_current_admin)):
    """Get site visit statistics"""
    analytics = get_advanced_analytics_service(db)
    return await analytics.get_site_visits(days)


@app.get("/api/admin/analytics/advanced/abandoned-carts")
async def get_abandoned_carts_analytics(current_user: User = Depends(get_current_admin)):
    """Get abandoned cart statistics"""
    analytics = get_advanced_analytics_service(db)
    return await analytics.get_abandoned_carts()


@app.get("/api/admin/analytics/advanced/wishlist")
async def get_wishlist_analytics(current_user: User = Depends(get_current_admin)):
    """Get wishlist analytics"""
    analytics = get_advanced_analytics_service(db)
    return await analytics.get_wishlist_analytics()


@app.get("/api/admin/analytics/advanced/conversion-funnel")
async def get_conversion_funnel(current_user: User = Depends(get_current_admin)):
    """Get conversion funnel data"""
    analytics = get_advanced_analytics_service(db)
    return await analytics.get_conversion_funnel()


@app.get("/api/admin/analytics/advanced/product-performance")
async def get_product_performance(days: int = 30, current_user: User = Depends(get_current_admin)):
    """Get product performance metrics"""
    analytics = get_advanced_analytics_service(db)
    return await analytics.get_product_performance(days)


@app.get("/api/admin/analytics/advanced/time-based")
async def get_time_based_analytics(months: int = 12, current_user: User = Depends(get_current_admin)):
    """Get time-based analytics"""
    analytics = get_advanced_analytics_service(db)
    return await analytics.get_time_based_analytics(months)


@app.get("/api/admin/analytics/advanced/customer-ltv")
async def get_customer_ltv(current_user: User = Depends(get_current_admin)):
    """Get customer lifetime value"""
    analytics = get_advanced_analytics_service(db)
    return await analytics.get_customer_lifetime_value()


@app.get("/api/admin/analytics/advanced/category-performance")
async def get_category_performance(current_user: User = Depends(get_current_admin)):
    """Get category performance"""
    analytics = get_advanced_analytics_service(db)
    return await analytics.get_category_performance()


@app.get("/api/admin/analytics/advanced/time-on-pages")
async def get_time_on_pages(current_user: User = Depends(get_current_admin)):
    """Get average time spent on different pages"""
    analytics = get_advanced_analytics_service(db)
    return await analytics.get_time_on_pages()


@app.get("/api/admin/analytics/advanced/product-page-analytics")
async def get_product_page_analytics(current_user: User = Depends(get_current_admin)):
    """Get detailed analytics for product pages"""
    analytics = get_advanced_analytics_service(db)
    return await analytics.get_product_page_analytics()


@app.get("/api/admin/analytics/advanced/user-behavior-flow")
async def get_user_behavior_flow(current_user: User = Depends(get_current_admin)):
    """Get user behavior flow"""
    analytics = get_advanced_analytics_service(db)
    return await analytics.get_user_behavior_flow()


# ============= ANALYTICS EVENT TRACKING =============
from models.ai import AnalyticsEvent

@app.post("/api/analytics/event")
async def track_analytics_event(event: AnalyticsEvent):
    """Track analytics event from frontend"""
    try:
        event_dict = event.model_dump()
        await db.analytics_events.insert_one(event_dict)
        return {"success": True}
    except Exception as e:
        logger.error(f"Error tracking analytics event: {str(e)}")
        return {"success": False, "error": str(e)}


# ============= STARTUP/SHUTDOWN EVENTS =============

@app.on_event("startup")
async def startup_event():
    """Actions on application startup"""
    logger.info("Y-Store Marketplace API v2.0 starting up...")
    logger.info("Modular architecture initialized")


@app.on_event("shutdown")
async def shutdown_event():
    """Actions on application shutdown"""
    logger.info("Shutting down Y-Store Marketplace API...")
    await close_db_connection()


# Health check endpoint
@app.get("/api/health")
async def health_check():
    """API health check"""
    return {"status": "healthy", "version": "2.0.0", "architecture": "modular"}
