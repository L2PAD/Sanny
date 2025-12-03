import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Globe } from 'lucide-react';

const LanguageSelectionModal = () => {
  const { changeLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if user has already selected a language
    const languageSelected = localStorage.getItem('languageSelected');
    if (!languageSelected) {
      // Show modal on first visit
      setIsOpen(true);
      // Set default language to Ukrainian
      changeLanguage('ua');
    }
  }, [changeLanguage]);

  const handleLanguageSelect = (lang) => {
    changeLanguage(lang);
    localStorage.setItem('languageSelected', 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
            <Globe className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Оберіть мову / Выберите язык
          </h2>
          <p className="text-blue-100 text-sm">
            Виберіть зручну для вас мову інтерфейсу
          </p>
        </div>

        {/* Language Options */}
        <div className="p-6 space-y-3">
          {/* Ukrainian Option */}
          <button
            onClick={() => handleLanguageSelect('ua')}
            className="w-full group relative overflow-hidden bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-2 border-blue-600 rounded-xl p-5 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-4xl">🇺🇦</div>
                <div className="text-left">
                  <div className="text-lg font-bold text-blue-900">Українська</div>
                  <div className="text-sm text-blue-700">Мова за замовчуванням</div>
                </div>
              </div>
              <div className="text-blue-600 group-hover:translate-x-1 transition-transform">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>

          {/* Russian Option */}
          <button
            onClick={() => handleLanguageSelect('ru')}
            className="w-full group relative overflow-hidden bg-white hover:bg-gray-50 border-2 border-gray-300 hover:border-blue-400 rounded-xl p-5 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-4xl">🇷🇺</div>
                <div className="text-left">
                  <div className="text-lg font-bold text-gray-900">Русский</div>
                  <div className="text-sm text-gray-600">Альтернативный язык</div>
                </div>
              </div>
              <div className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-2">
          <p className="text-xs text-gray-500 text-center">
            Ви можете змінити мову пізніше у верхньому меню<br />
            Вы можете изменить язык позже в верхнем меню
          </p>
        </div>
      </div>
    </div>
  );
};

export default LanguageSelectionModal;
