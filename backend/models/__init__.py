"""
Models package - all Pydantic models
"""
from models.user import User, UserCreate, UserLogin, Token
from models.category import Category, CategoryCreate
from models.product import Product, ProductCreate, ProductUpdate
from models.review import Review, ReviewCreate, ReviewWithProduct
from models.comment import Comment, CommentCreate, CommentWithReplies, CommentReactions
from models.order import (
    Cart, CartItem, AddToCartRequest,
    Order, OrderItem, ShippingAddress, CheckoutRequest,
    PaymentTransaction
)
from models.promotion import (
    HeroSlide, HeroSlideCreate, HeroSlideUpdate,
    PopularCategory, PopularCategoryCreate, PopularCategoryUpdate,
    ActualOffer, ActualOfferCreate, ActualOfferUpdate,
    Promotion, PromotionCreate, PromotionUpdate,
    CustomSection, CustomSectionCreate, CustomSectionUpdate
)
from models.crm import (
    CustomerNote, CustomerNoteCreate, CustomerSegment,
    CRMTask, CRMTaskCreate, CRMTaskUpdate,
    Lead, LeadCreate, LeadUpdate, EmailTemplate
)
from models.ai import (
    AIDescriptionRequest, AIDescriptionResponse,
    AIRecommendationsRequest, AIRecommendationsResponse,
    AIChatRequest, AIChatResponse,
    AISEORequest, AISEOResponse,
    AnalyticsEvent, ContactRequest
)

__all__ = [
    # User
    'User', 'UserCreate', 'UserLogin', 'Token',
    # Category
    'Category', 'CategoryCreate',
    # Product
    'Product', 'ProductCreate', 'ProductUpdate',
    # Review
    'Review', 'ReviewCreate', 'ReviewWithProduct',
    # Comment
    'Comment', 'CommentCreate', 'CommentWithReplies', 'CommentReactions',
    # Order
    'Cart', 'CartItem', 'AddToCartRequest',
    'Order', 'OrderItem', 'ShippingAddress', 'CheckoutRequest',
    'PaymentTransaction',
    # Promotion
    'HeroSlide', 'HeroSlideCreate', 'HeroSlideUpdate',
    'PopularCategory', 'PopularCategoryCreate', 'PopularCategoryUpdate',
    'ActualOffer', 'ActualOfferCreate', 'ActualOfferUpdate',
    'Promotion', 'PromotionCreate', 'PromotionUpdate',
    'CustomSection', 'CustomSectionCreate', 'CustomSectionUpdate',
    # CRM
    'CustomerNote', 'CustomerNoteCreate', 'CustomerSegment',
    'CRMTask', 'CRMTaskCreate', 'CRMTaskUpdate',
    'Lead', 'LeadCreate', 'LeadUpdate', 'EmailTemplate',
    # AI
    'AIDescriptionRequest', 'AIDescriptionResponse',
    'AIRecommendationsRequest', 'AIRecommendationsResponse',
    'AIChatRequest', 'AIChatResponse',
    'AISEORequest', 'AISEOResponse',
    'AnalyticsEvent', 'ContactRequest',
]
