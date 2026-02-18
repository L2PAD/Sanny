import React, { useState, useEffect, useCallback } from 'react';
import { ThumbsUp, MessageCircle, Send, Heart, Reply, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { commentsAPI } from '../../utils/api';

/**
 * Single Comment Component with reply functionality
 */
const CommentItem = ({ 
  comment, 
  onReply, 
  onReact, 
  onDelete,
  isAuthenticated, 
  currentUserId,
  depth = 0,
  t 
}) => {
  const [showReplies, setShowReplies] = useState(depth < 2);
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const hasReplies = comment.replies && comment.replies.length > 0;
  const maxDepth = 3;
  const canReply = depth < maxDepth;
  
  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onReply(comment.id, replyText.trim());
      setReplyText('');
      setIsReplying(false);
      setShowReplies(true);
    } catch (error) {
      console.error('Failed to submit reply:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReaction = async (reactionType) => {
    await onReact(comment.id, reactionType);
  };

  return (
    <div 
      className={`${depth > 0 ? 'ml-8 pl-4 border-l-2 border-gray-100' : ''}`}
      data-testid={`comment-${comment.id}`}
    >
      <div className="py-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background: `linear-gradient(135deg, 
                hsl(${(comment.user_name.charCodeAt(0) * 10) % 360}, 70%, 50%), 
                hsl(${(comment.user_name.charCodeAt(0) * 10 + 60) % 360}, 70%, 60%))`
            }}
          >
            <span className="text-white font-semibold text-sm">
              {comment.user_name[0].toUpperCase()}
            </span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-semibold text-gray-900">{comment.user_name}</p>
              <span className="text-xs text-gray-400">•</span>
              <p className="text-xs text-gray-500">
                {new Date(comment.created_at).toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            
            <p className="text-gray-700 leading-relaxed mb-3 whitespace-pre-wrap">{comment.comment}</p>

            {/* Actions */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Reactions */}
              <button
                onClick={() => handleReaction('likes')}
                disabled={!isAuthenticated}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all ${
                  comment.user_reacted
                    ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                } ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`}
                data-testid={`like-btn-${comment.id}`}
              >
                <ThumbsUp className={`w-3.5 h-3.5 ${comment.user_reacted ? 'fill-current' : ''}`} />
                <span>{comment.reactions?.likes || 0}</span>
              </button>

              <button
                onClick={() => handleReaction('hearts')}
                disabled={!isAuthenticated}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all ${
                  comment.user_reacted
                    ? 'bg-red-50 text-red-500 hover:bg-red-100'
                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                } ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`}
                data-testid={`heart-btn-${comment.id}`}
              >
                <Heart className={`w-3.5 h-3.5 ${comment.user_reacted ? 'fill-current' : ''}`} />
                <span>{comment.reactions?.hearts || 0}</span>
              </button>

              {/* Reply button */}
              {canReply && isAuthenticated && (
                <button
                  onClick={() => setIsReplying(!isReplying)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-gray-50 text-gray-500 hover:bg-gray-100 transition-all"
                  data-testid={`reply-btn-${comment.id}`}
                >
                  <Reply className="w-3.5 h-3.5" />
                  <span>{t('language') === 'ru' ? 'Ответить' : 'Reply'}</span>
                </button>
              )}

              {/* Delete button (for own comments or admin) */}
              {isAuthenticated && comment.user_id === currentUserId && (
                <button
                  onClick={() => onDelete(comment.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all"
                  data-testid={`delete-btn-${comment.id}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Show/Hide replies */}
              {hasReplies && (
                <button
                  onClick={() => setShowReplies(!showReplies)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-blue-600 hover:bg-blue-50 transition-all"
                  data-testid={`toggle-replies-${comment.id}`}
                >
                  {showReplies ? (
                    <>
                      <ChevronUp className="w-3.5 h-3.5" />
                      <span>{t('language') === 'ru' ? 'Скрыть' : 'Hide'} ({comment.replies.length})</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3.5 h-3.5" />
                      <span>{t('language') === 'ru' ? 'Показать ответы' : 'Show replies'} ({comment.replies.length})</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Reply form */}
            {isReplying && (
              <form onSubmit={handleSubmitReply} className="mt-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={t('language') === 'ru' ? 'Напишите ответ...' : 'Write a reply...'}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    disabled={isSubmitting}
                    data-testid={`reply-input-${comment.id}`}
                  />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isSubmitting || !replyText.trim()}
                    className="rounded-full px-4"
                    data-testid={`reply-submit-${comment.id}`}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setIsReplying(false);
                      setReplyText('');
                    }}
                    className="rounded-full"
                  >
                    {t('language') === 'ru' ? 'Отмена' : 'Cancel'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Nested replies */}
      {showReplies && hasReplies && (
        <div className="space-y-0">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onReact={onReact}
              onDelete={onDelete}
              isAuthenticated={isAuthenticated}
              currentUserId={currentUserId}
              depth={depth + 1}
              t={t}
            />
          ))}
        </div>
      )}
    </div>
  );
};


/**
 * Product Comments Component - Threaded Chat System
 */
const ProductComments = ({ productId, isAuthenticated, onLoginRequired }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const fetchComments = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await commentsAPI.getByProduct(productId, user?.id);
      setComments(response.data);
      
      // Get total count
      const countResponse = await commentsAPI.getCount(productId);
      setTotalCount(countResponse.data.count);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      // If API fails, show empty state instead of error
      setComments([]);
    } finally {
      setIsLoading(false);
    }
  }, [productId, user?.id]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      onLoginRequired();
      return;
    }

    if (!newComment.trim()) {
      toast.error(t('language') === 'ru' ? 'Напишите комментарий' : 'Write a comment');
      return;
    }

    try {
      setIsSubmitting(true);
      await commentsAPI.create({
        product_id: productId,
        comment: newComment.trim(),
        parent_id: null
      });
      
      setNewComment('');
      toast.success(t('language') === 'ru' ? 'Комментарий добавлен!' : 'Comment added!');
      fetchComments(); // Refresh comments
    } catch (error) {
      console.error('Failed to submit comment:', error);
      toast.error(t('language') === 'ru' ? 'Ошибка при добавлении комментария' : 'Error adding comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async (parentId, text) => {
    try {
      await commentsAPI.create({
        product_id: productId,
        comment: text,
        parent_id: parentId
      });
      toast.success(t('language') === 'ru' ? 'Ответ добавлен!' : 'Reply added!');
      fetchComments();
    } catch (error) {
      console.error('Failed to submit reply:', error);
      toast.error(t('language') === 'ru' ? 'Ошибка при добавлении ответа' : 'Error adding reply');
      throw error;
    }
  };

  const handleReaction = async (commentId, reactionType) => {
    if (!isAuthenticated) {
      onLoginRequired();
      return;
    }

    try {
      await commentsAPI.react(commentId, reactionType);
      fetchComments(); // Refresh to get updated reaction counts
    } catch (error) {
      console.error('Failed to react:', error);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm(t('language') === 'ru' ? 'Удалить комментарий?' : 'Delete comment?')) {
      return;
    }

    try {
      await commentsAPI.delete(commentId);
      toast.success(t('language') === 'ru' ? 'Комментарий удален' : 'Comment deleted');
      fetchComments();
    } catch (error) {
      console.error('Failed to delete:', error);
      toast.error(t('language') === 'ru' ? 'Ошибка при удалении' : 'Error deleting');
    }
  };

  return (
    <div className="mt-12 bg-white rounded-2xl p-6 md:p-8 border border-gray-200" data-testid="comments-section">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
          <MessageCircle className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">
            {t('language') === 'ru' ? 'Чат' : 'Chat'}
          </h3>
          <p className="text-sm text-gray-500">
            {totalCount} {t('language') === 'ru' ? 
              (totalCount === 1 ? 'сообщение' : totalCount < 5 ? 'сообщения' : 'сообщений') : 
              (totalCount === 1 ? 'message' : 'messages')}
          </p>
        </div>
      </div>

      {/* Add Comment Form */}
      <div className="mb-6">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
              placeholder={t('language') === 'ru' ? 'Написать сообщение...' : 'Write a message...'}
              disabled={!isAuthenticated}
              data-testid="new-comment-input"
            />
            {!isAuthenticated && (
              <div 
                className="absolute inset-0 bg-gray-50/80 rounded-xl flex items-center justify-center backdrop-blur-sm cursor-pointer"
                onClick={onLoginRequired}
              >
                <p className="text-sm text-gray-600 font-medium">
                  {t('language') === 'ru' ? 'Войдите, чтобы написать' : 'Login to write'}
                </p>
              </div>
            )}
          </div>
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting || !isAuthenticated || !newComment.trim()}
              className="flex items-center gap-2 rounded-full px-6"
              data-testid="submit-comment-btn"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? 
                (t('language') === 'ru' ? 'Отправка...' : 'Sending...') : 
                (t('language') === 'ru' ? 'Отправить' : 'Send')}
            </Button>
          </div>
        </form>
      </div>

      {/* Comments List */}
      <div className="divide-y divide-gray-100">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-gray-500">{t('language') === 'ru' ? 'Загрузка...' : 'Loading...'}</p>
          </div>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={handleReply}
              onReact={handleReaction}
              onDelete={handleDelete}
              isAuthenticated={isAuthenticated}
              currentUserId={user?.id}
              depth={0}
              t={t}
            />
          ))
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">
              {t('language') === 'ru' ? 'Пока нет сообщений' : 'No messages yet'}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              {t('language') === 'ru' ? 'Будьте первым!' : 'Be the first!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductComments;
