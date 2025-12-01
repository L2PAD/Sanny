import React, { useState, useEffect } from 'react';
import { Star, Package } from 'lucide-react';
import api from '../utils/api';

const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      // Получаем все отзывы через products
      const productsRes = await api.get('/products?limit=50');
      const products = productsRes.data;
      
      // Для каждого продукта с отзывами получаем их
      const testimonialsPromises = products
        .filter(p => p.reviews_count > 0)
        .slice(0, 6) // Ограничим 6 товарами
        .map(async (product) => {
          try {
            const reviewsRes = await api.get(`/products/${product.id}/reviews`);
            return reviewsRes.data.map(review => ({
              ...review,
              product_title: product.title,
              product_id: product.id
            }));
          } catch (error) {
            return [];
          }
        });

      const allReviews = await Promise.all(testimonialsPromises);
      const flatReviews = allReviews.flat();
      
      // Сортируем по дате и берем последние 6
      const sortedReviews = flatReviews
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 6);
      
      setTestimonials(sortedReviews);
    } catch (error) {
      console.error('Failed to fetch testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="container-main">
          <h2 className="text-3xl font-bold text-center mb-12">Отзывы покупателей</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton h-64 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) {
    return null;
  }

  return (
    <section data-testid="testimonials-section" className="py-16 bg-[#F7F9FC]">
      <div className="container-main">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Отзывы покупателей</h2>
          <p className="text-lg text-gray-600">Реальные отзывы от наших клиентов</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={`${testimonial.id}-${index}`}
              data-testid={`testimonial-${index}`}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-[#0071E3] rounded-full flex items-center justify-center text-white font-semibold text-lg">
                  {testimonial.user_name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-[#121212]">{testimonial.user_name}</h4>
                  <p className="text-xs text-gray-500">{formatDate(testimonial.created_at)}</p>
                </div>
              </div>

              {/* Product */}
              <div className="flex items-center gap-2 mb-3 p-3 bg-[#F7F7F7] rounded-lg">
                <Package className="w-4 h-4 text-[#0071E3] flex-shrink-0" />
                <p className="text-sm text-gray-700 line-clamp-1">
                  {testimonial.product_title}
                </p>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < testimonial.rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="ml-2 text-sm font-medium">{testimonial.rating}/5</span>
              </div>

              {/* Comment */}
              <p className="text-gray-700 text-sm leading-relaxed line-clamp-4">
                {testimonial.comment}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;