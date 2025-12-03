import React, { useState, useEffect } from 'react';
import { ThumbsUp, MessageCircle, Send, Heart, Smile } from 'lucide-react';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { useLanguage } from '../../contexts/LanguageContext';

const ProductComments = ({ productId, isAuthenticated, onLoginRequired }) => {
  const { t } = useLanguage();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock data - в реальности загружать из API
  useEffect(() => {
    setComments([
      {
        id: 1,
        user_name: 'Олександр К.',
        comment: 'Дуже якісний товар! Рекомендую всім!',
        created_at: new Date().toISOString(),
        reactions: {
          likes: 5,
          hearts: 2
        },
        user_reacted: false
      },
      {
        id: 2,
        user_name: 'Марія С.',
        comment: 'Швидка доставка, все супер. Дякую!',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        reactions: {
          likes: 3,
          hearts: 1
        },
        user_reacted: false
      }
    ]);
  }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      onLoginRequired();
      return;
    }

    if (!newComment.trim()) {
      toast.error(t('language') === 'ru' ? 'Напишите комментарий' : 'Напишіть коментар');
      return;
    }

    try {
      setIsSubmitting(true);
      // TODO: API call to submit comment
      const mockNewComment = {
        id: Date.now(),
        user_name: 'Вы',
        comment: newComment.trim(),
        created_at: new Date().toISOString(),
        reactions: {
          likes: 0,
          hearts: 0
        },
        user_reacted: false
      };
      
      setComments([mockNewComment, ...comments]);
      setNewComment('');
      toast.success(t('language') === 'ru' ? 'Комментарий добавлен!' : 'Коментар додано!');
    } catch (error) {
      console.error('Failed to submit comment:', error);
      toast.error(t('language') === 'ru' ? 'Ошибка при добавлении' : 'Помилка при додаванні');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReaction = (commentId, reactionType) => {
    if (!isAuthenticated) {
      onLoginRequired();
      return;
    }

    setComments(comments.map(comment => {
      if (comment.id === commentId) {
        const newReactions = { ...comment.reactions };
        if (comment.user_reacted) {
          newReactions[reactionType] = Math.max(0, newReactions[reactionType] - 1);
          return { ...comment, reactions: newReactions, user_reacted: false };
        } else {
          newReactions[reactionType] = (newReactions[reactionType] || 0) + 1;
          return { ...comment, reactions: newReactions, user_reacted: true };
        }
      }
      return comment;
    }));
  };

  return (
    <div className="mt-12 bg-white rounded-2xl p-8 border border-gray-200">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <MessageCircle className="w-6 h-6 text-blue-600" />
        <h3 className="text-2xl font-bold text-gray-900">
          {t('language') === 'ru' ? 'Комментарии' : 'Коментарі'} ({comments.length})
        </h3>
      </div>

      {/* Add Comment Form */}
      <div className="mb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder={
                t('language') === 'ru'
                  ? 'Поделитесь своим мнением о товаре...'
                  : 'Поділіться своєю думкою про товар...'
              }
              disabled={!isAuthenticated}
            />
            {!isAuthenticated && (
              <div className="absolute inset-0 bg-gray-50/80 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <p className="text-sm text-gray-600">
                  {t('language') === 'ru' 
                    ? 'Войдите, чтобы оставить комментарий'
                    : 'Увійдіть, щоб залишити коментар'
                  }
                </p>
              </div>
            )}
          </div>
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting || !isAuthenticated || !newComment.trim()}
              className="flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              {isSubmitting
                ? (t('language') === 'ru' ? 'Отправка...' : 'Відправка...')
                : (t('language') === 'ru' ? 'Отправить' : 'Надіслати')
              }
            </Button>
          </div>
        </form>
      </div>

      {/* Comments List */}
      <div className="space-y-6">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="border-b border-gray-100 pb-6 last:border-0">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-semibold text-sm">
                    {comment.user_name[0].toUpperCase()}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="mb-2">
                    <p className="font-semibold text-gray-900">{comment.user_name}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(comment.created_at).toLocaleDateString('uk-UA', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-3">{comment.comment}</p>

                  {/* Reactions */}
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleReaction(comment.id, 'likes')}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-full transition-all ${
                        comment.user_reacted
                          ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <ThumbsUp className={`w-4 h-4 ${comment.user_reacted ? 'fill-current' : ''}`} />
                      <span className="text-sm font-medium">{comment.reactions.likes}</span>
                    </button>

                    <button
                      onClick={() => handleReaction(comment.id, 'hearts')}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-full transition-all ${
                        comment.user_reacted
                          ? 'bg-red-50 text-red-600 hover:bg-red-100'
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${comment.user_reacted ? 'fill-current' : ''}`} />
                      <span className="text-sm font-medium">{comment.reactions.hearts}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              {t('language') === 'ru' 
                ? 'Пока нет комментариев. Будьте первым!'
                : 'Поки немає коментарів. Будьте першим!'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductComments;
