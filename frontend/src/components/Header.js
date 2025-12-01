import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu, X, Package, Heart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from './ui/button';
import LanguageSwitcher from './LanguageSwitcher';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

const Header = () => {
  const { isAuthenticated, user, logout, isSeller, isAdmin } = useAuth();
  const { cartItemsCount } = useCart();
  const { favoritesCount } = useFavorites();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 bg-white border-b border-gray-200 z-50">
      <div data-testid="header" className="container-main py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link data-testid="logo-link" to="/" className="flex items-center gap-2 text-xl font-bold text-[#121212]">
            <Package className="w-7 h-7 text-[#0071E3]" />
            <span>Marketplace</span>
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                data-testid="search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products..."
                className="w-full pl-12 pr-4 py-3 bg-[#F7F7F7] rounded-full focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:bg-white"
              />
            </div>
          </form>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Language Switcher */}
            <LanguageSwitcher />
            
            {/* Favorites */}
            <Link to="/favorites" className="relative p-2 hover:bg-gray-100 rounded-lg" title="Обране">
              <Heart className="w-6 h-6 text-[#121212]" />
              {favoritesCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {favoritesCount}
                </span>
              )}
            </Link>
            
            {/* Cart */}
            {isAuthenticated && (
              <Link data-testid="cart-link" to="/cart" className="relative p-2 hover:bg-gray-100 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-[#121212]" />
                {cartItemsCount > 0 && (
                  <span data-testid="cart-count" className="cart-badge">
                    {cartItemsCount}
                  </span>
                )}
              </Link>
            )}

            {/* User Menu */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button data-testid="user-menu-trigger" variant="ghost" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#0071E3] rounded-full flex items-center justify-center text-white font-medium">
                      {user?.full_name?.[0]?.toUpperCase() || 'U'}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="font-medium">{user?.full_name}</span>
                      <span className="text-xs text-gray-500">{user?.email}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem data-testid="profile-link" onClick={() => navigate('/profile')}>
                    My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem data-testid="orders-link" onClick={() => navigate('/orders')}>
                    My Orders
                  </DropdownMenuItem>
                  {isSeller && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem data-testid="seller-dashboard-link" onClick={() => navigate('/seller/dashboard')}>
                        Seller Dashboard
                      </DropdownMenuItem>
                    </>
                  )}
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem data-testid="admin-panel-link" onClick={() => navigate('/admin')}>
                        Admin Panel
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem data-testid="logout-button" onClick={handleLogout} className="text-red-600">
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button data-testid="login-button" variant="ghost" onClick={() => navigate('/login')}>
                  Login
                </Button>
                <Button data-testid="register-button" onClick={() => navigate('/register')}>
                  Sign Up
                </Button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              data-testid="mobile-menu-toggle"
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Search Bar - Mobile */}
        <form onSubmit={handleSearch} className="md:hidden mt-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('search')}
              className="w-full pl-12 pr-4 py-3 bg-[#F7F7F7] rounded-full focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:bg-white"
            />
          </div>
        </form>
      </div>
    </header>
  );
};

export default Header;