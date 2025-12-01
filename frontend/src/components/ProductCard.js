import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star, Heart } from 'lucide-react';
import { Button } from './ui/button';
import { useCart } from '../contexts/CartContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

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
    } else {
      addToFavorites(product);
    }
  };

  const discount = product.compare_price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : 0;

  return (
    <Link
      data-testid={`product-card-${product.id}`}
      to={`/products/${product.id}`}
      className="group card hover:shadow-xl"
    >
      {/* Image */}
      <div className="relative image-zoom rounded-xl overflow-hidden bg-[#F7F7F7] aspect-ratio-1-1 mb-4">
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
        
        {/* Favorite Button */}
        <button
          onClick={handleToggleFavorite}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all ${
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
        
        {discount > 0 && (
          <div data-testid="discount-badge" className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
            -{discount}%
          </div>
        )}
        {product.installment_available && (
          <div className="absolute bottom-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
            Кредит 0%
          </div>
        )}
        {product.stock_level === 0 && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white font-semibold">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-3">
        <h3 data-testid="product-title" className="font-semibold text-lg text-[#121212] line-clamp-2 group-hover:text-[#0071E3]">
          {product.title}
        </h3>

        {product.short_description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {product.short_description}
          </p>
        )}

        {/* Rating */}
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

        {/* Price */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
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

        {/* Add to Cart Button */}
        <Button
          data-testid={`add-to-cart-${product.id}`}
          onClick={handleAddToCart}
          className="w-full"
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