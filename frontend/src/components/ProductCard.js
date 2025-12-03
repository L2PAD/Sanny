import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star, Heart } from 'lucide-react';
import { Button } from './ui/button';
import { useCart } from '../contexts/CartContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    addToCart(product.id);
  };

  const handleToggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isFavorite(product.id)) {
      removeFromFavorites(product.id);
      toast.success('Удалено из избранного');
    } else {
      addToFavorites(product);
      toast.success('Добавлено в избранное');
    }
  };

  const discount = product.compare_price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : 0;

  return (
    <Link
      data-testid={`product-card-${product.id}`}
      to={`/products/${product.id}`}
      className="group card hover:shadow-xl flex flex-col h-full"
    >
      {/* Image */}
      <div className="relative image-zoom rounded-xl overflow-hidden bg-[#F7F7F7] aspect-ratio-1-1 mb-4 flex-shrink-0">
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span className="text-4xl">📦</span>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {/* Favorite Button */}
          <button
            onClick={handleToggleFavorite}
            className={`p-2 rounded-full backdrop-blur-sm transition-all ${
              isFavorite(product.id)
                ? 'bg-red-500 text-white'
                : 'bg-white/80 text-gray-600 hover:bg-white'
            }`}
            title={isFavorite(product.id) ? 'Удалить из избранного' : 'Добавить в избранное'}
          >
            <Heart
              className={`w-5 h-5 ${isFavorite(product.id) ? 'fill-current' : ''}`}
            />
          </button>
        </div>
        
        {discount > 0 && (
          <div data-testid="discount-badge" className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
            -{discount}%
          </div>
        )}
        {product.stock_level === 0 && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white font-semibold">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1">
        {/* Title - Fixed height */}
        <h3 data-testid="product-title" className="font-semibold text-lg text-[#121212] line-clamp-2 group-hover:text-[#0071E3] mb-2 min-h-[3.5rem]">
          {product.title}
        </h3>

        {/* Description - Fixed height */}
        <div className="mb-3 min-h-[2.5rem]">
          {product.short_description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {product.short_description}
            </p>
          )}
        </div>

        {/* Rating */}
        <div className="mb-3 min-h-[1.5rem]">
          {product.rating > 0 && (
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(product.rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
              <span className="text-sm text-gray-600 ml-1">({product.reviews_count})</span>
            </div>
          )}
        </div>

        {/* Spacer to push price and button to bottom */}
        <div className="flex-1"></div>

        {/* Price - Always at the same position */}
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-1">
            <span data-testid="product-price" className="text-2xl font-bold text-[#121212]">
              ${product.price.toFixed(2)}
            </span>
            {product.compare_price && (
              <span className="text-lg text-gray-400 line-through">
                ${product.compare_price.toFixed(2)}
              </span>
            )}
          </div>
          {product.installment_available && product.installment_months && (
            <div className="text-sm text-gray-600">
              или <span className="font-semibold text-[#0071E3]">
                ${(product.price / product.installment_months).toFixed(2)}/мес
              </span> на {product.installment_months} мес
            </div>
          )}
        </div>

        {/* Add to Cart Button - Always at bottom */}
        <Button
          data-testid={`add-to-cart-${product.id}`}
          onClick={handleAddToCart}
          className="w-full mt-auto"
          disabled={product.stock_level === 0}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {product.stock_level === 0 ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </div>
    </Link>
  );
};

export default ProductCard;