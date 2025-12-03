import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Heart, GitCompare, User, LogOut, Menu } from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';
import { CartContext } from '../contexts/CartContext';
import { FavoritesContext } from '../contexts/FavoritesContext';
import { ComparisonContext } from '../contexts/ComparisonContext';
import { CatalogContext } from '../contexts/CatalogContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { NotificationsContext } from '../contexts/NotificationsContext';

const NewHeader = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const { cart } = useContext(CartContext);
  const { favorites } = useContext(FavoritesContext);
  const { comparison } = useContext(ComparisonContext);
  const { setIsOpen } = useContext(CatalogContext);
  const { language, setLanguage, t } = useContext(LanguageContext);
  const { hasUnreadNotifications } = useContext(NotificationsContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartItemsCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const favoritesCount = favorites?.products?.length || 0;
  const comparisonCount = comparison?.products?.length || 0;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleLanguage = () => {
    setLanguage(language === 'ru' ? 'ua' : 'ru');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      {/* Top Bar */}
      <div className="bg-[#1a1a1a] text-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-2 text-sm">
            {/* Left - Contact Info */}
            <div className="hidden md:flex items-center gap-6">
              <a href="tel:050-247-41-61" className="hover:text-gray-300 transition-colors">
                📞 050-247-41-61
              </a>
              <a href="tel:063-724-77-03" className="hover:text-gray-300 transition-colors">
                📞 063-724-77-03
              </a>
            </div>

            {/* Right - Social & Language */}
            <div className="flex items-center gap-4 ml-auto">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
              <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
              </a>

              <button
                onClick={toggleLanguage}
                className="ml-4 px-2 py-1 rounded hover:bg-gray-700 transition-colors font-medium"
              >
                🌐 {language === 'ru' ? 'RU' : 'UA'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4 gap-4">
          {/* Logo & Catalog Button */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#2563eb] text-white rounded-lg hover:bg-[#1d4ed8] transition-colors font-medium"
            >
              <Menu className="w-5 h-5" />
              <span className="hidden sm:inline">{t('catalog')}</span>
            </button>

            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="text-2xl font-bold text-[#2563eb]">
                Y-store
              </div>
            </Link>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl hidden md:block">
            <div className="relative">
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-[#2563eb] transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </form>

          {/* Right Icons */}
          <div className="flex items-center gap-3">
            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors group"
              title={t('myCart')}
            >
              <ShoppingCart className="w-6 h-6 text-gray-700 group-hover:text-[#2563eb]" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
              <span className="hidden lg:block text-xs text-gray-600 group-hover:text-[#2563eb] mt-1">{t('myCart')}</span>
            </Link>

            {/* Favorites */}
            <Link
              to="/favorites"
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors group"
              title={t('favorites')}
            >
              <Heart className="w-6 h-6 text-gray-700 group-hover:text-[#2563eb]" />
              {favoritesCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {favoritesCount}
                </span>
              )}
            </Link>

            {/* Comparison */}
            <Link
              to="/comparison"
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors group hidden sm:flex"
              title={t('comparison')}
            >
              <GitCompare className="w-6 h-6 text-gray-700 group-hover:text-[#2563eb]" />
              {comparisonCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {comparisonCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {user ? (
              <div className="relative group">
                <button className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <User className="w-6 h-6 text-gray-700" />
                  {hasUnreadNotifications && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </button>
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <div className="p-3 border-b border-gray-200">
                    <p className="font-semibold text-gray-900">{user.full_name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                  <div className="p-2">
                    {user.role === 'seller' && (
                      <Link
                        to="/seller/dashboard"
                        className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded transition-colors"
                      >
                        {t('sellerDashboard')}
                      </Link>
                    )}
                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded transition-colors"
                      >
                        {t('adminPanel')}
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded transition-colors flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      {t('logout')}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 px-4 py-2 bg-[#2563eb] text-white rounded-lg hover:bg-[#1d4ed8] transition-colors font-medium"
              >
                <User className="w-5 h-5" />
                <span className="hidden sm:inline">{t('login')}</span>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Search */}
        <form onSubmit={handleSearch} className="pb-4 md:hidden">
          <div className="relative">
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-[#2563eb] transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>

      {/* Bottom Navigation */}
      <div className="bg-gray-50 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <nav className="flex items-center gap-6 py-3 overflow-x-auto">
            <Link to="/contact" className="text-sm text-gray-700 hover:text-[#2563eb] whitespace-nowrap transition-colors">
              {t('contactInfo')}
            </Link>
            <Link to="/delivery-payment" className="text-sm text-gray-700 hover:text-[#2563eb] whitespace-nowrap transition-colors">
              {t('deliveryPayment')}
            </Link>
            <Link to="/exchange-return" className="text-sm text-gray-700 hover:text-[#2563eb] whitespace-nowrap transition-colors">
              {t('exchangeReturn')}
            </Link>
            <Link to="/about" className="text-sm text-gray-700 hover:text-[#2563eb] whitespace-nowrap transition-colors">
              {t('about')}
            </Link>
            <Link to="/terms" className="text-sm text-gray-700 hover:text-[#2563eb] whitespace-nowrap transition-colors">
              {t('agreement')}
            </Link>
            <Link to="/blog" className="text-sm text-gray-700 hover:text-[#2563eb] whitespace-nowrap transition-colors">
              {t('blog')}
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default NewHeader;