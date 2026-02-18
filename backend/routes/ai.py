"""
AI routes - Description generation, Recommendations, Chat, SEO
"""
from fastapi import APIRouter, HTTPException, Depends
import uuid
import os
import logging

from models.user import User
from models.ai import (
    AIDescriptionRequest, AIDescriptionResponse,
    AIRecommendationsRequest, AIRecommendationsResponse,
    AIChatRequest, AIChatResponse,
    AISEORequest, AISEOResponse
)
from dependencies import get_current_seller
from config import EMERGENT_LLM_KEY

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/ai", tags=["AI"])


@router.post("/generate-description", response_model=AIDescriptionResponse)
async def generate_product_description(
    request: AIDescriptionRequest,
    current_user: User = Depends(get_current_seller)
):
    """Generate AI product description"""
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    
    api_key = EMERGENT_LLM_KEY or os.environ.get('EMERGENT_LLM_KEY')
    chat = LlmChat(
        api_key=api_key,
        session_id=f"product-desc-{str(uuid.uuid4())}",
        system_message="You are a professional product description writer for an e-commerce marketplace. Create engaging, SEO-friendly product descriptions."
    )
    
    chat.with_model("openai", "gpt-4o")
    
    features_text = "\n".join(request.key_features) if request.key_features else "No specific features provided"
    
    prompt = f"""Create a product description for:

Product Title: {request.product_title}
Category: {request.category}
Key Features:
{features_text}

Provide:
1. A detailed product description (2-3 paragraphs, 150-200 words)
2. A short description (1 sentence, max 160 characters)

Format your response as JSON with keys: "description" and "short_description"""
    
    user_message = UserMessage(text=prompt)
    response = await chat.send_message(user_message)
    
    try:
        import json
        response_text = response.strip()
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        result = json.loads(response_text)
        return AIDescriptionResponse(
            description=result.get("description", response),
            short_description=result.get("short_description", request.product_title)
        )
    except:
        lines = response.split("\n\n")
        return AIDescriptionResponse(
            description=response if len(lines) < 2 else "\n\n".join(lines[:-1]),
            short_description=lines[-1] if len(lines) > 1 else request.product_title[:160]
        )


@router.post("/recommendations", response_model=AIRecommendationsResponse)
async def generate_ai_recommendations(request: AIRecommendationsRequest):
    """Generate AI product recommendations"""
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        
        api_key = EMERGENT_LLM_KEY or os.environ.get('EMERGENT_LLM_KEY')
        chat = LlmChat(
            api_key=api_key,
            session_id=f"recommendations-{str(uuid.uuid4())}",
            system_message="You are an AI assistant for e-commerce, specializing in personalized product recommendations. Analyze products and suggest the most relevant options."
        )
        
        chat.with_model("openai", "gpt-4o")
        
        products_context = "\n".join([
            f"ID: {p.get('id')}, Title: {p.get('title')}, Category: {p.get('category', 'N/A')}, Price: ${p.get('price', 0)}"
            for p in request.available_products[:20]
        ])
        
        prompt = f"""User is viewing product:
Title: {request.product_name}
Category: {request.category}
Price: ${request.price}

Available products for recommendation:
{products_context}

Task: Select 3-5 most suitable products for recommendation and explain why.

Respond in JSON format:
{{
  "recommendations": [
    {{
      "productId": "product id",
      "reason": "short reason (1 sentence)"
    }}
  ]
}}"""
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        import json
        response_text = response.strip()
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        result = json.loads(response_text)
        
        return AIRecommendationsResponse(
            success=True,
            recommendations=result.get("recommendations", [])
        )
    except Exception as e:
        logger.error(f"Error in AI recommendations: {str(e)}")
        return AIRecommendationsResponse(
            success=False,
            recommendations=[],
            error=str(e)
        )


@router.post("/chat", response_model=AIChatResponse)
async def ai_chatbot(request: AIChatRequest):
    """AI Chatbot for customer support"""
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        
        api_key = EMERGENT_LLM_KEY or os.environ.get('EMERGENT_LLM_KEY')
        
        system_context = f"""You are a friendly AI assistant for a Ukrainian marketplace.

Your capabilities:
- Help with product selection
- Answer questions about delivery, payment, returns
- Product recommendations based on preferences
- Help with order placement

Rules:
- Respond in Russian
- Be polite and professional
- If you don't know the answer, admit it honestly
- Recommend contacting support for complex questions
- Use emojis for friendliness

{f"Cart items: {request.context.get('cartItems')}" if request.context.get('cartItems') else ''}
{f"User name: {request.context.get('userName')}" if request.context.get('userName') else ''}"""
        
        chat = LlmChat(
            api_key=api_key,
            session_id=f"chat-{str(uuid.uuid4())}",
            system_message=system_context
        )
        
        chat.with_model("openai", "gpt-4o")
        
        last_user_message = None
        for msg in request.messages:
            if msg.get('role') == 'user':
                last_user_message = msg.get('content', '')
        
        if not last_user_message:
            return AIChatResponse(
                success=False,
                message="No user message provided",
                error="Invalid request"
            )
        
        user_message = UserMessage(text=last_user_message)
        response = await chat.send_message(user_message)
        
        return AIChatResponse(
            success=True,
            message=response
        )
    except Exception as e:
        logger.error(f"Error in AI chat: {str(e)}")
        return AIChatResponse(
            success=False,
            message="Извините, произошла ошибка. Попробуйте позже или свяжитесь с поддержкой.",
            error=str(e)
        )


@router.post("/seo", response_model=AISEOResponse)
async def generate_seo(
    request: AISEORequest,
    current_user: User = Depends(get_current_seller)
):
    """Generate SEO-optimized title and meta description"""
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        
        api_key = EMERGENT_LLM_KEY or os.environ.get('EMERGENT_LLM_KEY')
        chat = LlmChat(
            api_key=api_key,
            session_id=f"seo-{str(uuid.uuid4())}",
            system_message="You are an SEO specialist. Create optimized titles and descriptions for products."
        )
        
        chat.with_model("openai", "gpt-4o")
        
        features_text = ", ".join(request.features) if request.features else "No specific features"
        
        prompt = f"""Create SEO-optimized texts for product:

Product Name: {request.product_name}
Category: {request.category}
Features: {features_text}

Respond in JSON format:
{{
  "title": "SEO title (up to 60 characters)",
  "metaDescription": "Meta description (up to 160 characters)",
  "keywords": ["keyword1", "keyword2"]
}}"""
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        import json
        response_text = response.strip()
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        result = json.loads(response_text)
        
        return AISEOResponse(
            success=True,
            title=result.get("title"),
            metaDescription=result.get("metaDescription"),
            keywords=result.get("keywords", [])
        )
    except Exception as e:
        logger.error(f"Error in SEO generation: {str(e)}")
        return AISEOResponse(
            success=False,
            error=str(e)
        )
