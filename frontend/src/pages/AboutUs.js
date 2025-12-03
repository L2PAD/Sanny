import React from 'react';
import { Heart, ShoppingBag, Users, Award } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const AboutUs = () => {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-center">
          {language === 'ru' ? 'О нас' : 'Про нас'}
        </h1>

        <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
          <p className="text-lg text-gray-700 mb-4">
            {language === 'ru'
              ? 'Y-store — это современный интернет-магазин, который предлагает широкий ассортимент качественных товаров по выгодным ценам.'
              : 'Y-store — це сучасний інтернет-магазин, який пропонує широкий асортимент якісних товарів за вигідними цінами.'}
          </p>
          <p className="text-lg text-gray-700">
            {language === 'ru'
              ? 'Мы работаем для того, чтобы ваши покупки были удобными, быстрыми и приятными.'
              : 'Ми працюємо для того, щоб ваші покупки були зручними, швидкими та приємними.'}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <ShoppingBag className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">
              {language === 'ru' ? 'Широкий ассортимент' : 'Широкий асортимент'}
            </h3>
            <p className="text-gray-600">
              {language === 'ru'
                ? 'Тысячи товаров для дома, красоты и комфорта'
                : 'Тисячі товарів для дому, краси та комфорту'}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Award className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">
              {language === 'ru' ? 'Качество' : 'Якість'}
            </h3>
            <p className="text-gray-600">
              {language === 'ru'
                ? 'Только проверенные поставщики и сертифицированная продукция'
                : 'Тільки перевірені постачальники та сертифікована продукція'}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">
              {language === 'ru' ? 'Поддержка клиентов' : 'Підтримка клієнтів'}
            </h3>
            <p className="text-gray-600">
              {language === 'ru'
                ? 'Наша команда всегда готова помочь с выбором и ответить на вопросы'
                : 'Наша команда завжди готова допомогти з вибором та відповісти на питання'}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Heart className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">
              {language === 'ru' ? 'С заботой о вас' : 'З турботою про вас'}
            </h3>
            <p className="text-gray-600">
              {language === 'ru'
                ? 'Быстрая доставка и удобные способы оплаты'
                : 'Швидка доставка та зручні способи оплати'}
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">
            {language === 'ru' ? 'Спасибо, что выбираете нас!' : 'Дякуємо, що обираєте нас!'}
          </h2>
          <p className="text-lg">
            {language === 'ru'
              ? 'Мы ценим каждого клиента и стремимся сделать ваш опыт покупок максимально комфортным.'
              : 'Ми цінуємо кожного клієнта і прагнемо зробити ваш досвід покупок максимально комфортним.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;