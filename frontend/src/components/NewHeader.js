import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu, X, ChevronDown, Phone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useCatalog } from '../contexts/CatalogContext';
import LanguageSwitcher from './LanguageSwitcher';

const NewHeader = () => {
  const { isAuthenticated, user, logout, isSeller, isAdmin } = useAuth();
  const { cartItemsCount } = useCart();
  const { t, language } = useLanguage();
  const { toggleCatalog } = useCatalog();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const navigationLinks = [
    { label: t('contactInfo'), path: '/contact' },
    { label: t('deliveryPayment'), path: '/delivery-payment' },
    { label: t('exchangeReturn'), path: '/exchange-return' },
    { label: t('aboutUs'), path: '/about' },
    { label: t('userAgreement'), path: '/terms' },
    { label: t('blog'), path: '/blog' },
  ];

  return (
    <header className="sticky top-0 bg-white z-50 shadow-sm">
      {/* Top Bar - Logo, Search, Contact, Social, Cart */}
      <div className="border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
                BAZAAR
              </h1>
            </Link>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <form onSubmit={handleSearch} className="w-full">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('searchProducts')}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Search className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </form>
            </div>

            {/* Contact & Social Icons - Desktop */}
            <div className="hidden lg:flex items-center gap-6">
              {/* Phone Numbers */}
              <div className="flex flex-col gap-1 text-sm">
                <a href="tel:+380502474161" className="flex items-center gap-2 hover:text-blue-600 transition-colors">
                  <Phone className="w-4 h-4" />
                  <span className="font-medium">050-247-41-61</span>
                </a>
                <a href="tel:+380637247703" className="flex items-center gap-2 hover:text-blue-600 transition-colors">
                  <Phone className="w-4 h-4" />
                  <span className="font-medium">063-724-77-03</span>
                </a>
              </div>

              {/* Social Media Icons */}
              <div className="flex items-center gap-3">
                <a href="https://t.me/yourtelegram" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity" aria-label="Telegram">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
                  </svg>
                </a>
                <a href="viber://chat?number=%2B380502474161" className="hover:opacity-70 transition-opacity" aria-label="Viber">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.35.5C6.697.5 2.09 5.107 2.09 10.76c0 1.904.522 3.684 1.427 5.214L2 20.5l4.74-1.474c1.452.803 3.13 1.264 4.91 1.264 5.653 0 10.26-4.607 10.26-10.26C21.91 5.107 17.303.5 12.35.5zm5.8 13.96c-.226.634-1.132 1.165-1.85 1.314-.493.098-.947.442-3.206-.668-2.715-1.337-4.458-4.123-4.594-4.312-.136-.19-1.11-1.477-1.11-2.817 0-1.34.704-1.998 .952-.77.247.002.588.092.845.092.248 0 .548-.097.858.656.317.772 1.08 2.634 1.174 2.825.095.19.158.412.032.603-.127.19-.19.308-.38.474-.19.165-.4.37-.57.497-.19.143-.388.297-.167.583.222.286.987 1.628 2.12 2.635 1.458 1.297 2.687 1.698 3.067 1.888.38.19.603.158.825-.095.222-.254.95-1.108 1.204-1.49.254-.38.507-.317.857-.19.35.126 2.223 1.048 2.603 1.238.38.19.634.285.73.444.095.158.095.92-.13 1.553z"/>
                  </svg>
                </a>
                <a href="https://www.instagram.com/yourinsta" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity" aria-label="Instagram">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                {/* YouTube removed */}
                <a href="https://www.tiktok.com/@yourtiktok" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity" aria-label="TikTok">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                  </svg>
                </a>
              </div>

              {/* Cart */}
              <Link
                to="/cart"
                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors relative"
              >
                <ShoppingCart className="w-5 h-5" />
                <span className="font-medium text-sm">{t('myCart')}</span>
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                    {cartItemsCount}
                  </span>
                )}
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden mt-4">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('searchProducts')}
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
                >
                  <Search className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            {/* Catalog Button */}
            <button
              onClick={toggleCatalog}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Menu className="w-4 h-4" />
              <span className="font-medium">{t('catalog')}</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {/* Navigation Links - Desktop */}
            <nav className="hidden lg:flex items-center gap-6">
              {navigationLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-sm hover:text-gray-300 transition-colors whitespace-nowrap"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Language & Login */}
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              
              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <Link
                    to={isAdmin ? '/admin' : isSeller ? '/seller' : '/profile'}
                    className="flex items-center gap-2 hover:text-gray-300 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline text-sm">{user?.name}</span>
                  </Link>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-2 hover:text-gray-300 transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm">{t('login')}</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                toggleCatalog();
              }}
              className="px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors font-medium text-left"
            >
              {t('catalog')}
            </button>
            {navigationLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {link.label}
              </Link>
            ))}
            
            {/* Mobile Cart & User */}
            <div className="border-t border-gray-200 pt-2 mt-2 space-y-2">
              <Link
                to="/cart"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span>{t('myCart')}</span>
                {cartItemsCount > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {cartItemsCount}
                  </span>
                )}
              </Link>
              
              {isAuthenticated ? (
                <Link
                  to={isAdmin ? '/admin' : isSeller ? '/seller' : '/profile'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>{user?.name}</span>
                </Link>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>{t('login')}</span>
                </Link>
              )}
            </div>

            {/* Mobile Contact Info */}
            <div className="border-t border-gray-200 pt-2 mt-2">
              <div className="px-4 py-2 text-sm text-gray-600">
                <p className="font-medium mb-2">Контакти:</p>
                <a href="tel:+380502474161" className="block hover:text-blue-600">050-247-41-61</a>
                <a href="tel:+380637247703" className="block hover:text-blue-600">063-724-77-03</a>
                <p className="mt-2 text-xs text-gray-500">{t('workingHours')}</p>
                <p className="text-xs text-gray-500">{t('weekends')}</p>
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default NewHeader;
