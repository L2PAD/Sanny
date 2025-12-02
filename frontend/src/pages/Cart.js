import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { productsAPI } from '../utils/api';
import { Button } from '../components/ui/button';
import { Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useState } from 'react';

const Cart = () => {
  const { cart, removeFromCart, clearCart, fetchCart } = useCart();
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch cart on mount to ensure we have latest data
    fetchCart();
  }, []);

  useEffect(() => {
    fetchCartProducts();
  }, [cart]);

  const fetchCartProducts = async () => {
    try {
      setLoading(true);
      const productPromises = cart?.items?.map((item) =>
        productsAPI.getById(item.product_id).catch(() => null)
      ) || [];
      
      const productResults = await Promise.all(productPromises);
      const productsMap = {};
      
      productResults.forEach((res, idx) => {
        if (res) {
          productsMap[cart.items[idx].product_id] = res.data;
        }
      });
      
      setProducts(productsMap);
    } catch (error) {
      console.error('Failed to fetch cart products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  const cartItems = cart?.items || [];
  const total = cartItems.reduce((sum, item) => {
    const product = products[item.product_id];
    return sum + (product?.price || item.price) * item.quantity;
  }, 0);

  if (cartItems.length === 0) {
    return (
      <div data-testid="empty-cart" className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center space-y-6">
          <ShoppingBag className="w-24 h-24 mx-auto text-gray-300" />
          <h2 className="text-3xl font-bold text-gray-400">Your cart is empty</h2>
          <p className="text-gray-600">Add some products to get started!</p>
          <Link to="/products">
            <Button data-testid="continue-shopping-button" size="lg">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="cart-page" className="min-h-screen py-12">
      <div className="container-main">
        <div className="flex items-center justify-between mb-8">
          <h1 data-testid="cart-title" className="text-4xl font-bold">Shopping Cart</h1>
          <Button
            data-testid="clear-cart-button"
            variant="ghost"
            onClick={clearCart}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Cart
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="skeleton h-32 rounded-2xl"></div>
              ))
            ) : (
              cartItems.map((item) => {
                const product = products[item.product_id];
                if (!product) return null;

                return (
                  <div
                    key={item.product_id}
                    data-testid={`cart-item-${item.product_id}`}
                    className="bg-white border border-gray-200 rounded-2xl p-6 flex gap-6"
                  >
                    {/* Product Image */}
                    <Link to={`/products/${product.id}`} className="flex-shrink-0">
                      <div className="w-24 h-24 bg-[#F7F7F7] rounded-xl overflow-hidden">
                        {product.images && product.images[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-3xl">📦</span>
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Product Info */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <Link to={`/products/${product.id}`}>
                          <h3 className="font-semibold text-lg hover:text-[#0071E3]">
                            {product.title}
                          </h3>
                        </Link>
                        <p className="text-sm text-gray-600 mt-1">Quantity: {item.quantity}</p>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <span data-testid={`item-price-${item.product_id}`} className="text-2xl font-bold">
                          ${(product.price * item.quantity).toFixed(2)}
                        </span>
                        <Button
                          data-testid={`remove-item-${item.product_id}`}
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.product_id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-6 sticky top-24">
              <h2 className="text-2xl font-bold">Order Summary</h2>
              
              <div className="space-y-3 py-4 border-t border-b">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
              </div>

              <div className="flex justify-between text-xl font-bold">
                <span>Total</span>
                <span data-testid="cart-total">${total.toFixed(2)}</span>
              </div>

              <Button
                data-testid="proceed-to-checkout-button"
                onClick={handleCheckout}
                size="lg"
                className="w-full"
              >
                Proceed to Checkout
              </Button>

              <Link to="/products">
                <Button data-testid="continue-shopping-link" variant="outline" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;