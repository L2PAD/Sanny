import React from 'react';
import { Phone, Mail, Clock } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const ContactInfo = () => {
  const { t, language } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-center">
          {language === 'ru' ? 'Контактная информация' : 'Контактна інформація'}
        </h1>

        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Phone Numbers */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Phone className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold">
                  {language === 'ru' ? 'Телефоны' : 'Телефони'}
                </h2>
              </div>
              
              <a href="tel:+380688886671" className="block text-xl font-semibold hover:text-blue-600 transition-colors">
                068-888-66-71
              </a>
              <a href="tel:+380668886671" className="block text-xl font-semibold hover:text-blue-600 transition-colors">
                066-888-66-71
              </a>
            </div>

            {/* Email */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Mail className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold">Email</h2>
              </div>
              
              <a href="mailto:info@bazaar.com" className="block text-xl font-semibold hover:text-blue-600 transition-colors">
                info@bazaar.com
              </a>
            </div>
          </div>
        </div>

        {/* Working Hours */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold">
              {language === 'ru' ? 'Время работы' : 'Час роботи'}
            </h2>
          </div>
          
          <div className="space-y-3 text-lg">
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="font-medium">
                {language === 'ru' ? 'Понедельник – Пятница' : 'Понеділок – П\'ятниця'}
              </span>
              <span>09:00 – 18:00</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="font-medium">
                {language === 'ru' ? 'Суббота – Воскресенье' : 'Субота – Неділя'}
              </span>
              <span className="text-red-600 font-medium">
                {language === 'ru' ? 'Выходной' : 'Вихідний'}
              </span>
            </div>
          </div>
        </div>

        {/* Messengers */}
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h2 className="text-2xl font-bold mb-6">
            {language === 'ru' ? 'Мессенджеры' : 'Месенджери'}
          </h2>
          
          <p className="text-gray-600 mb-6">
            {language === 'ru' 
              ? 'Пишите нам в любой удобный мессенджер — мы читаем все сообщения и всегда отвечаем в ближайшее рабочее время 💬'
              : 'Пишіть нам у будь-який зручний месенджер — ми читаємо всі повідомлення і завжди відповідаємо у найближчий робочий час 💬'
            }
          </p>

          <div className="flex gap-4">
            <a 
              href="viber://chat?number=%2B380688886671"
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.35.5C6.697.5 2.09 5.107 2.09 10.76c0 1.904.522 3.684 1.427 5.214L2 20.5l4.74-1.474c1.452.803 3.13 1.264 4.91 1.264 5.653 0 10.26-4.607 10.26-10.26C21.91 5.107 17.303.5 12.35.5zm5.8 13.96c-.226.634-1.132 1.165-1.85 1.314-.493.098-.947.442-3.206-.668-2.715-1.337-4.458-4.123-4.594-4.312-.136-.19-1.11-1.477-1.11-2.817 0-1.34.704-1.998.952-.77.247.002.588.092.845.092.248 0 .548-.097.858.656.317.772 1.08 2.634 1.174 2.825.095.19.158.412.032.603-.127.19-.19.308-.38.474-.19.165-.4.37-.57.497-.19.143-.388.297-.167.583.222.286.987 1.628 2.12 2.635 1.458 1.297 2.687 1.698 3.067 1.888.38.19.603.158.825-.095.222-.254.95-1.108 1.204-1.49.254-.38.507-.317.857-.19.35.126 2.223 1.048 2.603 1.238.38.19.634.285.73.444.095.158.095.92-.13 1.553z"/>
              </svg>
              Viber
            </a>
            
            <a 
              href="https://t.me/yourtelegram"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
              </svg>
              Telegram
            </a>
          </div>
        </div>

        {/* Questions Section */}
        <div className="mt-8 text-center p-8 bg-blue-50 rounded-2xl">
          <h3 className="text-2xl font-bold mb-4">
            📞 {language === 'ru' ? 'Есть вопросы? Мы рядом!' : 'Маєте запитання? Ми поруч!'}
          </h3>
          <p className="text-gray-700 max-w-2xl mx-auto">
            {language === 'ru'
              ? 'Если у вас есть любые вопросы по заказу, доставке или товарам — просто напишите нам. Мы с радостью подскажем, поможем и всё объясним простыми словами.'
              : 'Якщо у вас є будь-які питання щодо замовлення, доставки чи товарів — просто напишіть нам. Ми з радістю підкажемо, допоможемо й усе пояснимо простими словами.'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;
