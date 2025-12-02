import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { useComparison } from '../contexts/ComparisonContext';
import { productsAPI, reviewsAPI } from '../utils/api';
import { Star, Heart, GitCompare, ShoppingCart, Minus, Plus, ChevronRight, Package, Shield, Truck } from 'lucide-react';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import ProductGallery from '../components/ProductGallery';
import ProductSpecs from '../components/ProductSpecs';
import DeliveryOptions from '../components/DeliveryOptions';
import BuyTogether from '../components/BuyTogether';
import AIRecommendations from '../components/AIRecommendations';
import ReviewsSection from '../components/ReviewsSection';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [selectedImage, setSelectedImage] = useState(0);
  
  const { addToCart } = useCart();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const { addToComparison, removeFromComparison, isInComparison } = useComparison();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getById(id);
      setProduct(response.data);
    } catch (error) {
      console.error('Failed to fetch product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    addToCart(product.id, quantity);
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const result = await addToCart(product.id, quantity);
    if (result.success) {
      // Small delay to ensure cart state is fully updated before navigation
      setTimeout(() => {
        navigate('/cart');
      }, 300);
    }
  };

  const handleToggleFavorite = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (isFavorite(product.id)) {
      removeFromFavorites(product.id);
      toast.success('Видалено з обраного');
    } else {
      addToFavorites(product);
      toast.success('Додано в обране');
    }
  };

  const handleToggleComparison = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (isInComparison(product.id)) {
      removeFromComparison(product.id);
      toast.success('Видалено з порівняння');
    } else {
      addToComparison(product);
      toast.success('Додано до порівняння');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-12">
        <div className="container-main">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="skeleton h-[600px] rounded-2xl"></div>
            <div className="space-y-6">
              <div className="skeleton h-12 w-3/4"></div>
              <div className="skeleton h-8 w-1/2"></div>
              <div className="skeleton h-24 w-full"></div>
              <div className="skeleton h-12 w-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen py-12">
        <div className="container-main text-center">
          <h2 className="text-2xl font-bold text-gray-400">Product not found</h2>
        </div>
      </div>
    );
  }

  const discount = product.compare_price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : 0;

  const images = product.images && product.images.length > 0 ? product.images : [null];

  return (
    <div data-testid="product-detail-page" className="min-h-screen py-12">
      <div className="container-main">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images Section */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-ratio-1-1 bg-[#F7F7F7] rounded-2xl overflow-hidden">
              {images[selectedImage] ? (
                <img
                  data-testid="main-product-image"
                  src={images[selectedImage]}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <span className="text-8xl">📦</span>
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    data-testid={`thumbnail-${idx}`}
                    onClick={() => setSelectedImage(idx)}
                    className={`aspect-ratio-1-1 bg-[#F7F7F7] rounded-xl overflow-hidden border-2 ${
                      selectedImage === idx ? 'border-[#0071E3]' : 'border-transparent'
                    }`}
                  >
                    {img ? (
                      <img src={img} alt={`${product.title} ${idx + 1}`} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-2xl">📦</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info Section */}
          <div className="space-y-6">
            <div>
              <h1 data-testid="product-title" className="text-4xl font-bold text-[#121212] mb-4">
                {product.title}
              </h1>
              
              {/* Rating */}
              {product.rating > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(product.rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-gray-600">({product.reviews_count} reviews)</span>
                </div>
              )}

              {/* Price */}
              <div className="flex items-center gap-4 mb-6">
                <span data-testid="product-price" className="text-5xl font-bold text-[#121212]">
                  ${product.price.toFixed(2)}
                </span>
                {product.compare_price && (
                  <>
                    <span className="text-2xl text-gray-400 line-through">
                      ${product.compare_price.toFixed(2)}
                    </span>
                    <span data-testid="discount-badge" className="bg-red-500 text-white px-4 py-2 rounded-full font-semibold">
                      -{discount}% OFF
                    </span>
                  </>
                )}
              </div>

              {/* Short Description */}
              {product.short_description && (
                <p className="text-lg text-gray-600 mb-6">{product.short_description}</p>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2 text-sm">
              {product.stock_level > 0 ? (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-600 font-medium">
                    In Stock ({product.stock_level} available)
                  </span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-red-600 font-medium">Out of Stock</span>
                </>
              )}
            </div>

            {/* Quantity Selector */}
            {product.stock_level > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="font-medium">Quantity:</label>
                  <div className="flex items-center border border-gray-300 rounded-xl">
                    <button
                      data-testid="decrease-quantity"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 hover:bg-gray-100 rounded-l-xl"
                    >
                      -
                    </button>
                    <span data-testid="quantity-value" className="px-6 py-2 border-x border-gray-300">
                      {quantity}
                    </span>
                    <button
                      data-testid="increase-quantity"
                      onClick={() => setQuantity(Math.min(product.stock_level, quantity + 1))}
                      className="px-4 py-2 hover:bg-gray-100 rounded-r-xl"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <Button
                    data-testid="add-to-cart-button"
                    onClick={handleAddToCart}
                    variant="outline"
                    size="lg"
                    className="flex-1"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Add to Cart
                  </Button>
                  <Button
                    data-testid="buy-now-button"
                    onClick={handleBuyNow}
                    size="lg"
                    className="flex-1"
                  >
                    Buy Now
                  </Button>
                </div>
              </div>
            )}

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t">
              <div className="text-center space-y-2">
                <Package className="w-8 h-8 mx-auto text-[#0071E3]" />
                <p className="text-sm text-gray-600">Free Shipping</p>
              </div>
              <div className="text-center space-y-2">
                <Shield className="w-8 h-8 mx-auto text-[#0071E3]" />
                <p className="text-sm text-gray-600">Secure Payment</p>
              </div>
              <div className="text-center space-y-2">
                <Truck className="w-8 h-8 mx-auto text-[#0071E3]" />
                <p className="text-sm text-gray-600">Fast Delivery</p>
              </div>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="mt-16 bg-white border border-gray-200 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-6">Product Description</h2>
          <div data-testid="product-description" className="prose prose-lg max-w-none text-gray-700">
            {product.description.split('\n').map((paragraph, idx) => (
              <p key={idx} className="mb-4">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* Reviews Section */}
        <ReviewsSection productId={product.id} />

        {/* AI Recommendations */}
        <AIRecommendations product={product} />
      </div>
    </div>
  );
};

export default ProductDetail;