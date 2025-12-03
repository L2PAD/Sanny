import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Globe, Cookie } from 'lucide-react';

const WelcomeModal = () => {
  const { language, changeLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState('ua');
  const [contentKey, setContentKey] = useState(0);

  useEffect(() => {
    // Check if user has already completed welcome flow
    const welcomeCompleted = localStorage.getItem('welcomeCompleted');
    if (!welcomeCompleted) {
      // Show modal on first visit
      setIsOpen(true);
      // Set default language to Ukrainian
      setSelectedLang('ua');
      changeLanguage('ua');
    }
  }, [changeLanguage]);

  const handleLanguageSelect = (lang) => {
    setSelectedLang(lang);
    changeLanguage(lang);
    // Force re-render of content
    setContentKey(prev => prev + 1);
  };

  const handleAccept = () => {
    localStorage.setItem('welcomeCompleted', 'true');
    localStorage.setItem('cookieConsent', 'accepted');
    localStorage.setItem('languageSelected', 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  // Get content dynamically based on selected language
  const getContent = () => {
    const content = {
      ua: {
        welcome: 'Ласкаво просимо!',
        selectLanguage: 'Оберіть мову',
        cookieTitle: 'Ми використовуємо файли cookie',
        cookieText: 'Для покращення вашого досвіду та персоналізації контенту',
        accept: 'Прийняти та продовжити',
        privacyLink: 'Політика конфіденційності',
      },
      ru: {
        welcome: 'Добро пожаловать!',
        selectLanguage: 'Выберите язык',
        cookieTitle: 'Мы используем файлы cookie',
        cookieText: 'Для улучшения вашего опыта и персонализации контента',
        accept: 'Принять и продолжить',
        privacyLink: 'Политика конфиденциальности',
      },
    };
    return content[selectedLang] || content.ua;
  };

  const currentContent = getContent();

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in zoom-in duration-500">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 text-center">
          <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
            <Globe className="w-6 h-6" />
            {selectedLang === 'ua' ? 'Ласкаво просимо!' : 'Добро пожаловать!'}
          </h2>
        </div>

        {/* Language Selection */}
        <div className="p-6 pb-4">
          <h3 key={`lang-${contentKey}`} className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-600" />
            {currentContent.selectLanguage}
          </h3>
          <div className="flex gap-3">
            {/* Ukrainian Button */}
            <button
              onClick={() => handleLanguageSelect('ua')}
              className={`flex-1 relative overflow-hidden rounded-lg p-3 border-2 transition-all duration-300 hover:scale-105 ${
                selectedLang === 'ua'
                  ? 'border-blue-600 bg-blue-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-blue-300'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl">🇺🇦</span>
                <span className={`font-semibold ${selectedLang === 'ua' ? 'text-blue-700' : 'text-gray-700'}`}>
                  UA
                </span>
              </div>
              {selectedLang === 'ua' && (
                <div className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full"></div>
              )}
            </button>

            {/* Russian Button */}
            <button
              onClick={() => handleLanguageSelect('ru')}
              className={`flex-1 relative overflow-hidden rounded-lg p-3 border-2 transition-all duration-300 hover:scale-105 ${
                selectedLang === 'ru'
                  ? 'border-blue-600 bg-blue-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-blue-300'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl">🇷🇺</span>
                <span className={`font-semibold ${selectedLang === 'ru' ? 'text-blue-700' : 'text-gray-700'}`}>
                  RU
                </span>
              </div>
              {selectedLang === 'ru' && (
                <div className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full"></div>
              )}
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="px-6">
          <div className="border-t border-gray-200"></div>
        </div>

        {/* Cookie Consent */}
        <div key={`cookie-${contentKey}`} className="px-6 py-4">
          <div className="flex items-start gap-3 mb-3">
            <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <Cookie className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-800 mb-1">
                {currentContent.cookieTitle}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {currentContent.cookieText}
              </p>
            </div>
          </div>

          {/* Privacy Link */}
          <a
            href="/terms"
            className="text-xs text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1"
          >
            {currentContent.privacyLink}
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        {/* Accept Button */}
        <div className="px-6 pb-6">
          <button
            key={`btn-${contentKey}`}
            onClick={handleAccept}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
          >
            {currentContent.accept}
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;
