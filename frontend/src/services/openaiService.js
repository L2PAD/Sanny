/**
 * OpenAI Service - Frontend AI Integration (TEST VERSION)
 * 
 * ⚠️ WARNING: This is a TEST implementation with API key in frontend
 * TODO: Move to backend for production
 */

import OpenAI from "openai";

// TEST API Key - will be replaced with backend integration
const openai = new OpenAI({
  apiKey: "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",
  dangerouslyAllowBrowser: true // Only for testing!
});

/**
 * Generate product description
 * @param {Object} params - Product parameters
 * @param {string} params.productName - Product name
 * @param {string} params.category - Product category
 * @param {number} params.price - Product price
 * @param {Array} params.features - Product features
 * @returns {Promise<Object>} Generated description
 */
export const generateProductDescription = async ({ productName, category, price, features = [] }) => {
  try {
    const featuresText = features.length > 0 ? `\nОсновные характеристики: ${features.join(', ')}` : '';
    const priceText = price ? `\nЦена: $${price}` : '';

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Ты профессиональный копирайтер для e-commerce. Создавай привлекательные, информативные описания товаров на русском языке. Описание должно быть структурированным, подчеркивать преимущества и побуждать к покупке."
        },
        {
          role: "user",
          content: `Создай детальное описание товара для маркетплейса:

Название: ${productName}
Категория: ${category}${priceText}${featuresText}

Требования к описанию:
1. Начни с привлекательного вступления (1-2 предложения)
2. Опиши ключевые особенности и преимущества
3. Укажи для кого подойдет товар
4. Заверши призывом к действию
5. Длина: 150-200 слов
6. Используй параграфы для удобочитаемости`
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const description = response.choices[0].message.content;

    return {
      success: true,
      description: description,
      shortDescription: description.split('\n')[0].substring(0, 200) + '...'
    };
  } catch (error) {
    console.error('Error generating description:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Generate AI product recommendations
 * @param {Object} params - Recommendation parameters
 * @param {string} params.productName - Current product name
 * @param {string} params.category - Product category
 * @param {number} params.price - Product price
 * @param {Array} params.availableProducts - List of available products
 * @returns {Promise<Array>} Recommended product IDs with reasons
 */
export const generateProductRecommendations = async ({ productName, category, price, availableProducts = [] }) => {
  try {
    const productsContext = availableProducts
      .map(p => `ID: ${p.id}, Название: ${p.title}, Категория: ${p.category}, Цена: $${p.price}`)
      .join('\n');

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Ты AI-ассистент для e-commerce, специализирующийся на персонализированных рекомендациях товаров. Анализируй товары и предлагай наиболее релевантные варианты."
        },
        {
          role: "user",
          content: `Пользователь просматривает товар:
Название: ${productName}
Категория: ${category}
Цена: $${price}

Доступные товары для рекомендации:
${productsContext}

Задача: Выбери 3-5 наиболее подходящих товаров для рекомендации и объясни почему.

Ответь в формате JSON:
{
  "recommendations": [
    {
      "productId": "id товара",
      "reason": "короткая причина (1 предложение)"
    }
  ]
}`
        }
      ],
      temperature: 0.5,
      max_tokens: 800,
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    
    return {
      success: true,
      recommendations: result.recommendations || []
    };
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return {
      success: false,
      recommendations: [],
      error: error.message
    };
  }
};

/**
 * AI Chatbot for customer support
 * @param {Array} messages - Chat history
 * @param {Object} context - Additional context (cart, user, etc.)
 * @returns {Promise<string>} AI response
 */
export const chatWithAI = async (messages, context = {}) => {
  try {
    const systemContext = `Ты дружелюбный AI-помощник для украинского маркетплейса.

Твои возможности:
- Помощь в выборе товаров
- Ответы на вопросы о доставке, оплате, возврате
- Рекомендации товаров по предпочтениям
- Помощь с оформлением заказа

Правила:
- Отвечай на русском языке
- Будь вежливым и профессиональным
- Если не знаешь ответа, честно признайся
- Рекомендуй связаться с поддержкой для сложных вопросов
- Используй эмодзи для дружелюбности

${context.cartItems ? `Товары в корзине: ${context.cartItems}` : ''}
${context.userName ? `Имя пользователя: ${context.userName}` : ''}`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemContext },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 300
    });

    return {
      success: true,
      message: response.choices[0].message.content
    };
  } catch (error) {
    console.error('Error in chat:', error);
    return {
      success: false,
      message: "Извините, произошла ошибка. Попробуйте позже или свяжитесь с поддержкой.",
      error: error.message
    };
  }
};

/**
 * Generate SEO-optimized title and meta description
 * @param {Object} params - Product parameters
 * @returns {Promise<Object>} SEO texts
 */
export const generateSEO = async ({ productName, category, features = [] }) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Ты SEO-специалист. Создавай оптимизированные заголовки и описания для товаров."
        },
        {
          role: "user",
          content: `Создай SEO-оптимизированные тексты для товара:

Название: ${productName}
Категория: ${category}
Характеристики: ${features.join(', ')}

Ответь в JSON формате:
{
  "title": "SEO заголовок (до 60 символов)",
  "metaDescription": "Мета описание (до 160 символов)",
  "keywords": ["ключевое", "слово"]
}`
        }
      ],
      temperature: 0.5,
      max_tokens: 300,
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    
    return {
      success: true,
      ...result
    };
  } catch (error) {
    console.error('Error generating SEO:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export default {
  generateProductDescription,
  generateProductRecommendations,
  chatWithAI,
  generateSEO
};
