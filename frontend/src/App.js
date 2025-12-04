import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { ComparisonProvider } from './contexts/ComparisonContext';
import { NotificationsProvider } from './contexts/NotificationsContext';
import { CatalogProvider } from './contexts/CatalogContext';
import NewHeader from './components/NewHeader';
import Footer from './components/Footer';
import AIChatbot from './components/AIChatbot';
import CatalogDropdown from './components/CatalogDropdown';
import SupportWidget from './components/SupportWidget';
import WelcomeModal from './components/WelcomeModal';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import EnhancedProductDetail from './components/product/EnhancedProductDetail';
import Favorites from './pages/Favorites';
import Comparison from './pages/Comparison';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import CheckoutSuccess from './pages/CheckoutSuccess';
import SellerDashboard from './pages/SellerDashboard';
import AdminPanel from './pages/AdminPanel';
import UserProfile from './pages/UserProfile';
import ContactInfo from './pages/ContactInfo';
import DeliveryPayment from './pages/DeliveryPayment';
import ExchangeReturn from './pages/ExchangeReturn';
import AboutUs from './pages/AboutUs';
import Terms from './pages/Terms';
import Blog from './pages/Blog';
import analyticsTracker from './services/analyticsTracker';
import './App.css';

// Analytics Wrapper Component
function AnalyticsWrapper({ children }) {
  const location = useLocation();

  useEffect(() => {
    // Track page view on route change
    const pageTitle = document.title;
    analyticsTracker.trackPageView(location.pathname, pageTitle, {
      search: location.search,
      hash: location.hash
    });
  }, [location]);

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <NotificationsProvider>
            <ComparisonProvider>
              <FavoritesProvider>
                <CatalogProvider>
                  <CartProvider>
                    <AnalyticsWrapper>
                      <div data-testid="app" className="App">
                        <Toaster position="top-right" />
                        <WelcomeModal />
                        <CatalogDropdown />
                        <NewHeader />
                        <Routes>
                          <Route path="/" element={<Home />} />
                          <Route path="/login" element={<Login />} />
                          <Route path="/register" element={<Register />} />
                          <Route path="/products" element={<Products />} />
                          <Route path="/product/:id" element={<EnhancedProductDetail />} />
                          <Route path="/favorites" element={<Favorites />} />
                          <Route path="/comparison" element={<Comparison />} />
                          <Route path="/cart" element={<Cart />} />
                          <Route path="/checkout" element={<Checkout />} />
                          <Route path="/checkout/success" element={<CheckoutSuccess />} />
                          <Route path="/checkout/cancel" element={<Navigate to="/cart" />} />
                          <Route path="/seller/dashboard" element={<SellerDashboard />} />
                          <Route path="/admin" element={<AdminPanel />} />
                          <Route path="/contact" element={<ContactInfo />} />
                          <Route path="/delivery-payment" element={<DeliveryPayment />} />
                          <Route path="/exchange-return" element={<ExchangeReturn />} />
                          <Route path="/about" element={<AboutUs />} />
                          <Route path="/terms" element={<Terms />} />
                          <Route path="/blog" element={<Blog />} />
                          <Route path="*" element={<Navigate to="/" />} />
                        </Routes>
                        <Footer />
                        <AIChatbot />
                        <SupportWidget />
                      </div>
                    </AnalyticsWrapper>
                  </CartProvider>
                </CatalogProvider>
              </FavoritesProvider>
            </ComparisonProvider>
          </NotificationsProvider>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;