import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import Header from './components/Header';
import Footer from './components/Footer';
import SupportWidget from './components/SupportWidget';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import CheckoutSuccess from './pages/CheckoutSuccess';
import SellerDashboard from './pages/SellerDashboard';
import AdminPanel from './pages/AdminPanel';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <CartProvider>
            <div data-testid="app" className="App">
              <Toaster position="top-right" />
              <Header />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/checkout/success" element={<CheckoutSuccess />} />
                <Route path="/checkout/cancel" element={<Navigate to="/cart" />} />
                <Route path="/seller/dashboard" element={<SellerDashboard />} />
                <Route path="/admin" element={<AdminPanel />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
              <Footer />
              <SupportWidget />
            </div>
          </CartProvider>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;