import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Heart, GitCompare, User, LogOut, Menu } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { useComparison } from '../contexts/ComparisonContext';
import { useCatalog } from '../contexts/CatalogContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNotifications } from '../contexts/NotificationsContext';

const NewHeader = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const { favorites } = useFavorites();
  const { comparison } = useComparison();
  const { openCatalog } = useCatalog();
  const { language, changeLanguage, t } = useLanguage();
  const { hasUnreadNotifications } = useNotifications();
  const [searchQuery, setSearchQuery] = useState('');
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
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
    setShowLanguageModal(true);
  };

  const selectLanguage = (lang) => {
    changeLanguage(lang);
    setShowLanguageModal(false);
  };

  return (
    <header className="bg-white sticky top-0 z-50 shadow-sm">
      {/* Main Header - White Section */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4 gap-4">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="text-4xl font-bold text-black hover:opacity-80 transition-opacity">
              Y-store
            </Link>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-gray-400"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </form>

          {/* Right Section - Phones and Social */}
          <div className="flex items-center gap-6">
            {/* Phones */}
            <div className="flex flex-col text-right text-sm">
              <a href="tel:050-247-41-61" className="font-medium text-black hover:text-blue-600">
                📞 050-247-41-61
              </a>
              <a href="tel:063-724-77-03" className="font-medium text-black hover:text-blue-600">
                📞 063-724-77-03
              </a>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-2">
              <a href="https://t.me/yourtelegram" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-black rounded-full flex items-center justify-center hover:bg-gray-800">
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
                </svg>
              </a>
              <a href="viber://chat?number=%2B380502474161" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-black rounded-full flex items-center justify-center hover:bg-gray-800">
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.35.5C6.697.5 2.09 5.107 2.09 10.76c0 1.904.522 3.684 1.427 5.214L2 20.5l4.74-1.474c1.452.803 3.13 1.264 4.91 1.264 5.653 0 10.26-4.607 10.26-10.26C21.91 5.107 17.303.5 12.35.5zm5.8 13.96c-.226.634-1.132 1.165-1.85 1.314-.493.098-.947.442-3.206-.668-2.715-1.337-4.458-4.123-4.594-4.312-.136-.19-1.11-1.477-1.11-2.817 0-1.34.704-1.998.952-.77.247.002.588.092.845.092.248 0 .548-.097.858.656.317.772 1.08 2.634 1.174 2.825.095.19.158.412.032.603-.127.19-.19.308-.38.474-.19.165-.4.37-.57.497-.19.143-.388.297-.167.583.222.286.987 1.628 2.12 2.635 1.458 1.297 2.687 1.698 3.067 1.888.38.19.603.158.825-.095.222-.254.95-1.108 1.204-1.49.254-.38.507-.317.857-.19.35.126 2.223 1.048 2.603 1.238.38.19.634.285.73.444.095.158.095.92-.13 1.553z"/>
                </svg>
              </a>
            </div>

            {/* Cart */}
            <Link
              to="/cart"
              className="flex items-center gap-2 text-black hover:text-blue-600"
              title={t('myCart')}
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="text-sm">{t('myCart')}</span>
              {cartItemsCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Dark Navigation Bar - BLACK */}
      <div className="bg-black text-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            {/* Left Navigation */}
            <div className="flex items-center gap-8">
              <button
                onClick={openCatalog}
                className="flex items-center gap-2 hover:text-gray-300 transition-colors"
              >
                <Menu className="w-4 h-4" />
                <span>{t('catalog')}</span>
              </button>
              
              <Link to="/contact" className="hover:text-gray-300 transition-colors">
                {t('contactInfo')}
              </Link>
              
              <Link to="/delivery-payment" className="hover:text-gray-300 transition-colors">
                {t('deliveryPayment')}
              </Link>
              
              <Link to="/exchange-return" className="hover:text-gray-300 transition-colors">
                {t('exchangeReturn')}
              </Link>
              
              <Link to="/about" className="hover:text-gray-300 transition-colors">
                {t('aboutUs')}
              </Link>
              
              <Link to="/terms" className="hover:text-gray-300 transition-colors">
                {t('agreement')}
              </Link>
              
              <Link to="/blog" className="hover:text-gray-300 transition-colors">
                {t('blog')}
              </Link>
            </div>

            {/* Right Side - Language and Login */}
            <div className="flex items-center gap-4">
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1 hover:text-gray-300 transition-colors"
              >
                🌐 {language === 'ru' ? 'RU' : 'UA'}
              </button>

              {user ? (
                <div className="flex items-center gap-4">
                  <Link to="/seller/dashboard" className="hover:text-gray-300">
                    <User className="w-4 h-4 inline mr-1" />
                    {user.name || user.email}
                  </Link>
                  <button onClick={handleLogout} className="hover:text-gray-300">
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link to="/login" className="flex items-center gap-1 hover:text-gray-300 transition-colors">
                  <User className="w-4 h-4" />
                  <span>{t('login')}</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Language Selection Modal */}
      {showLanguageModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-center">Выберите язык / Оберіть мову</h3>
              <div className="space-y-3">
                <button
                  onClick={() => selectLanguage('ua')}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <span className="text-2xl">🇺🇦</span>
                  <span className="font-medium">Українська</span>
                </button>
                <button
                  onClick={() => selectLanguage('ru')}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <span className="text-2xl">🇷🇺</span>
                  <span className="font-medium">Русский</span>
                </button>
              </div>
              <button
                onClick={() => setShowLanguageModal(false)}
                className="w-full mt-4 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Отмена / Скасувати
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default NewHeader;