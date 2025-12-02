import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Star } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

const ProductCardCompact = ({ product, viewMode = 'grid' }) => {
  const { addToCart } = useCart();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

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
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (isFavorite(product.id)) {
      removeFromFavorites(product.id);
    } else {
      addToFavorites(product);
    }
  };

  const discount = product.compare_price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : 0;

  const finalPrice = product.price;
  const installmentPrice = product.installment_months
    ? (finalPrice / product.installment_months).toFixed(2)
    : null;

  return (
    <div
      onClick={() => navigate(`/product/${product.id}`)}
      className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col h-full"
    >
      {/* Image Container */}
      <div className="relative bg-gray-50 aspect-square overflow-hidden">
        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute top-2 left-2 z-10">
            <div className="bg-red-500 text-white px-2 py-1 rounded-md text-xs font-bold">
              -{discount}%
            </div>
          </div>
        )}

        {/* Favorite Button */}
        <button
          onClick={handleToggleFavorite}
          className={`absolute top-2 right-2 z-10 p-2 rounded-full backdrop-blur-sm transition-all ${
            isFavorite(product.id)
              ? 'bg-red-500 text-white'
              : 'bg-white/80 text-gray-600 hover:bg-white'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFavorite(product.id) ? 'fill-current' : ''}`} />
        </button>

        {/* Credit Badge */}
        {installmentPrice && (
          <div className="absolute bottom-2 left-2 z-10">
            <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
              Кредит 0%
            </div>
          </div>
        )}

        {/* Product Image */}
        <img
          src={product.images?.[0] || 'https://via.placeholder.com/300'}
          alt={product.title || product.name}
          className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Product Info */}
      <div className="p-3 flex flex-col flex-grow">
        {/* Product Title */}
        <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2 min-h-[40px]">
          {product.title || product.name}
        </h3>

        {/* Short Description */}
        <p className="text-xs text-gray-600 mb-2 line-clamp-1">
          {product.short_description || 'Високоякісний товар для вас'}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-3 h-3 ${
                  star <= Math.round(product.rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'fill-gray-200 text-gray-200'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500">
            ({product.reviews_count || 0})
          </span>
        </div>

        {/* Price Section */}
        <div className="mt-auto">
          <div className="mb-2">
            {/* Current Price */}
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-gray-900">
                ${finalPrice.toFixed(2)}
              </span>
              {product.compare_price && (
                <span className="text-sm text-gray-400 line-through">
                  ${product.compare_price.toFixed(2)}
                </span>
              )}
            </div>

            {/* Installment Price */}
            {installmentPrice && (
              <p className="text-xs text-blue-600 mt-1">
                або <span className="font-semibold">${installmentPrice}/міс</span> на{' '}
                {product.installment_months} міс
              </p>
            )}
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className="w-full bg-teal-500 hover:bg-teal-600 text-white py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCardCompact;
