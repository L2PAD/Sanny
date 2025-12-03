import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '../ui/button';
import { reviewsAPI } from '../../utils/api';
import { toast } from 'sonner';
import { useLanguage } from '../../contexts/LanguageContext';

const ReviewForm = ({ productId, onReviewAdded, isAuthenticated, onLoginRequired }) => {
  const { t } = useLanguage();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      onLoginRequired();
      return;
    }

    if (!comment.trim()) {
      toast.error(t('language') === 'ru' ? 'Пожалуйста, напишите отзыв' : 'Будь ласка, напишіть відгук');
      return;
    }

    try {
      setIsSubmitting(true);
      await reviewsAPI.create({
        product_id: productId,
        rating,
        comment: comment.trim()
      });
      
      toast.success(t('language') === 'ru' ? 'Отзыв добавлен!' : 'Відгук додано!');
      setComment('');
      setRating(5);
      onReviewAdded();
    } catch (error) {
      console.error('Failed to submit review:', error);
      toast.error(t('language') === 'ru' ? 'Ошибка при добавлении отзыва' : 'Помилка при додаванні відгуку');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 rounded-2xl p-6 mb-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">
        {t('language') === 'ru' ? 'Оставить отзыв' : 'Залишити відгук'}
      </h3>
      
      {!isAuthenticated && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            {t('language') === 'ru' 
              ? 'Для добавления отзыва необходимо войти в аккаунт'
              : 'Для додавання відгуку необхідно увійти в акаунт'
            }
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Rating */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('language') === 'ru' ? 'Ваша оценка' : 'Ваша оцінка'}
          </label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="focus:outline-none transition-transform hover:scale-110"
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= (hoveredRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Comment */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('language') === 'ru' ? 'Ваш отзыв' : 'Ваш відгук'}
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={
              t('language') === 'ru'
                ? 'Поделитесь своим мнением о товаре...'
                : 'Поділіться своєю думкою про товар...'
            }
            disabled={!isAuthenticated}
          />
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting || !isAuthenticated || !comment.trim()}
          className="w-full"
        >
          {isSubmitting
            ? (t('language') === 'ru' ? 'Отправка...' : 'Відправка...')
            : (t('language') === 'ru' ? 'Отправить отзыв' : 'Надіслати відгук')
          }
        </Button>
      </form>
    </div>
  );
};

export default ReviewForm;
