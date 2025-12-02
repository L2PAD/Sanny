import React from 'react';
import { Package, CreditCard, TruckIcon, MapPin } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const DeliveryPayment = () => {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-center">
          {language === 'ru' ? 'Доставка и оплата' : 'Доставка і оплата'}
        </h1>

        {/* Fast Shipping */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
            <TruckIcon className="w-8 h-8 text-blue-600" />
            {language === 'ru' ? 'Быстрая доставка' : 'Швидка доставка'}
          </h2>
          <div className="space-y-4 text-gray-700">
            <p>✅ <strong>90% {language === 'ru' ? 'товаров на складе' : 'товарів на складі'}</strong></p>
            <p>✅ <strong>{language === 'ru' ? 'Ежедневная работа без выходных' : 'Щоденна робота без вихідних'}</strong></p>
            <p>✅ <strong>{language === 'ru' ? 'Отправка через 1–2 часа после подтверждения' : 'Відправка через 1–2 години після підтвердження'}</strong></p>
            <p className="mt-4 p-4 bg-green-50 rounded-lg">
              🎁 <strong>{language === 'ru' ? 'Бесплатная доставка' : 'Безкоштовна доставка'}</strong>
              <br />
              {language === 'ru' ? 'При заказе от 2000 грн с предоплатой' : 'При замовленні від 2000 грн з передоплатою'}
            </p>
          </div>
        </div>

        {/* Delivery Methods */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
          <h2 className="text-2xl font-bold mb-6">
            {language === 'ru' ? 'Способы доставки' : 'Способи доставки'}
          </h2>
          
          <div className="space-y-6">
            <div className="border-l-4 border-blue-600 pl-4">
              <h3 className="text-xl font-semibold mb-2">📦 {language === 'ru' ? 'Новая Почта — отделение' : 'Нова Пошта — відділення'}</h3>
              <p className="text-gray-600">{language === 'ru' ? 'Стоимость:' : 'Вартість:'} 60-160 {language === 'ru' ? 'грн в зависимости от веса' : 'грн залежно від ваги'}</p>
            </div>

            <div className="border-l-4 border-green-600 pl-4">
              <h3 className="text-xl font-semibold mb-2">📬 {language === 'ru' ? 'Новая Почта — почтомат' : 'Нова Пошта — поштомат'}</h3>
              <p className="text-gray-600">{language === 'ru' ? 'Стоимость:' : 'Вартість:'} 60-110 {language === 'ru' ? 'грн в зависимости от веса' : 'грн залежно від ваги'}</p>
            </div>

            <div className="border-l-4 border-purple-600 pl-4">
              <h3 className="text-xl font-semibold mb-2">🚚 {language === 'ru' ? 'Курьер на адрес' : 'Кур\'єр на адресу'}</h3>
              <p className="text-gray-600">{language === 'ru' ? 'Стоимость:' : 'Вартість:'} {language === 'ru' ? 'от' : 'від'} 95 {language === 'ru' ? 'до' : 'до'} 200 {language === 'ru' ? 'грн' : 'грн'}</p>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-green-600" />
            {language === 'ru' ? 'Способы оплаты' : 'Способи оплати'}
          </h2>
          
          <div className="space-y-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">💳 {language === 'ru' ? 'Онлайн-оплата картой' : 'Онлайн-оплата карткою'}</h3>
              <p className="text-gray-600">{language === 'ru' ? 'Без комиссий. Поддержка Apple Pay, Google Pay, VISA, MasterCard' : 'Без комісій. Підтримка Apple Pay, Google Pay, VISA, MasterCard'}</p>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">🛒 {language === 'ru' ? 'Наложенный платеж' : 'Післяплата'}</h3>
              <p className="text-gray-600">{language === 'ru' ? 'Оплата при получении. Комиссия: 20 грн + 2% от суммы' : 'Оплата при отриманні. Комісія: 20 грн + 2% від суми'}</p>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">📄 {language === 'ru' ? 'Безналичный расчет' : 'Безготівковий розрахунок'}</h3>
              <p className="text-gray-600">{language === 'ru' ? 'По реквизитам для юридических лиц' : 'За реквізитами для юридичних осіб'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryPayment;