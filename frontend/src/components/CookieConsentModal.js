import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Cookie, Shield, Eye, Settings } from 'lucide-react';

const CookieConsentModal = () => {
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const cookieConsent = localStorage.getItem('cookieConsent');
    if (!cookieConsent) {
      // Show modal after a short delay for better UX
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setIsOpen(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  const content = {
    ua: {
      title: 'Ми використовуємо файли cookie',
      description: 'Цей веб-сайт використовує файли cookie для покращення вашого досвіду користування, аналізу відвідуваності та персоналізації контенту.',
      features: [
        { icon: Shield, text: 'Захист персональних даних' },
        { icon: Eye, text: 'Аналіз відвідуваності сайту' },
        { icon: Settings, text: 'Персоналізація контенту' },
      ],
      accept: 'Прийняти все',
      decline: 'Відхилити',
      learnMore: 'Дізнатися більше про нашу політику конфіденційності',
    },
    ru: {
      title: 'Мы используем файлы cookie',
      description: 'Этот веб-сайт использует файлы cookie для улучшения вашего опыта использования, анализа посещаемости и персонализации контента.',
      features: [
        { icon: Shield, text: 'Защита персональных данных' },
        { icon: Eye, text: 'Анализ посещаемости сайта' },
        { icon: Settings, text: 'Персонализация контента' },
      ],
      accept: 'Принять все',
      decline: 'Отклонить',
      learnMore: 'Узнать больше о нашей политике конфиденциальности',
    },
  };

  const currentContent = content[language] || content.ua;

  return (
    <div className="fixed inset-0 z-[9998] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-w-2xl w-full mx-4 mb-0 sm:mb-4 overflow-hidden animate-in slide-in-from-bottom sm:zoom-in duration-500">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
              <Cookie className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-1">
                {currentContent.title}
              </h2>
              <p className="text-amber-100 text-sm">
                {currentContent.description}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-4">
          {/* Features List */}
          <div className="grid gap-3">
            {currentContent.features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="flex items-center gap-3 bg-gray-50 rounded-lg p-3"
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <Icon className="w-5 h-5 text-orange-600" />
                  </div>
                  <span className="text-sm text-gray-700 font-medium">
                    {feature.text}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Learn More Link */}
          <div className="pt-2">
            <a
              href="/terms"
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1"
            >
              {currentContent.learnMore}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleAccept}
            className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-95"
          >
            {currentContent.accept}
          </button>
          <button
            onClick={handleDecline}
            className="sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow active:scale-95"
          >
            {currentContent.decline}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsentModal;
