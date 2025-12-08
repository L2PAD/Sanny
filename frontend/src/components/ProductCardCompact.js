import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Star, Video, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { toast } from 'sonner';

const ProductCardCompact = ({ product, viewMode = 'grid' }) => {
  const { addToCart } = useCart();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
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
  
  // Get all images or fallback
  const images = product.images && product.images.length > 0 
    ? product.images 
    : ['https://via.placeholder.com/300'];
  
  // Generate SKU from product ID
  const sku = product.id ? product.id.substring(0, 8).toUpperCase() : 'N/A';

  // Check for new features
  const hasVideos = product.videos && product.videos.length > 0;
  const hasSpecs = product.specifications && product.specifications.length > 0;
  const hasMultipleImages = images.length > 1;

  const nextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div
      onClick={() => navigate(`/product/${product.id}`)}
      className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-2xl hover:border-blue-300 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full"
    >
      {/* Image Container */}
      <div 
        className="relative bg-gradient-to-br from-gray-50 to-gray-100 aspect-square overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Badges Container - Top Left */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
          {discount > 0 && (
            <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg animate-pulse">
              -{discount}%
            </div>
          )}
          {hasVideos && (
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-lg flex items-center gap-1 backdrop-blur-sm">
              <Video className="w-3 h-3" />
              Відео
            </div>
          )}
          {hasSpecs && (
            <div className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-lg flex items-center gap-1 backdrop-blur-sm">
              <FileText className="w-3 h-3" />
              Specs
            </div>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleToggleFavorite}
          className={`absolute top-2 right-2 z-10 p-2 rounded-full backdrop-blur-sm transition-all shadow-lg ${
            isFavorite(product.id)
              ? 'bg-red-500 text-white'
              : 'bg-white/80 text-gray-600 hover:bg-white'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFavorite(product.id) ? 'fill-current' : ''}`} />
        </button>

        {/* Product Image */}
        <img
          src={images[currentImageIndex]}
          alt={product.title || product.name}
          className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
        />

        {/* Image Navigation Arrows */}
        {hasMultipleImages && isHovered && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-1.5 rounded-full shadow-lg z-10"
            >
              <ChevronLeft className="w-4 h-4 text-gray-800" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-1.5 rounded-full shadow-lg z-10"
            >
              <ChevronRight className="w-4 h-4 text-gray-800" />
            </button>
          </>
        )}

        {/* Image Dots Indicator */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 z-10">
            {images.slice(0, 5).map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentImageIndex(index);
                }}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  currentImageIndex === index 
                    ? 'bg-white w-3' 
                    : 'bg-white/50 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-3 flex flex-col flex-grow">
        {/* Category and SKU */}
        <div className="flex items-center justify-between mb-1">
          {product.category_name && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
              {product.category_name}
            </span>
          )}
          <div className="text-xs text-gray-400">
            {sku}
          </div>
        </div>

        {/* Product Title */}
        <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2 min-h-[40px]">
          {product.title || product.name}
        </h3>

        {/* Short Description */}
        <p className="text-xs text-gray-600 mb-2 line-clamp-1">
          {product.short_description || t('highQualityProduct')}
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
            {product.compare_price ? (
              // With discount
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-red-600">
                    ${finalPrice.toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-400 line-through">
                    ${product.compare_price.toFixed(2)}
                  </span>
                </div>
                <div className="text-xs text-green-600 font-medium">
                  {t('economy')} ${(product.compare_price - finalPrice).toFixed(2)}
                </div>
              </div>
            ) : (
              // Regular price
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-gray-900">
                  ${finalPrice.toFixed(2)}
                </span>
              </div>
            )}
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className="w-full bg-teal-500 hover:bg-teal-600 text-white py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            {t('addToCart')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCardCompact;
