import React from 'react';
import { CreditCard, Truck, Package, ShieldCheck, Banknote, Smartphone, MapPin } from 'lucide-react';

const PaymentDeliveryInfo = () => {
  return (
    <div className="bg-gray-50 py-12 mt-16">
      <div className="container-main">
        <h2 className="text-3xl font-bold text-center mb-8">Оплата та доставка</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Payment Methods */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className="w-8 h-8 text-blue-600" />
              <h3 className="text-xl font-bold">Способи оплати</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Banknote className="w-5 h-5 text-gray-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Готівкою при отриманні</p>
                  <p className="text-sm text-gray-600">Оплата курʼєру або в відділенні Нової Пошти</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CreditCard className="w-5 h-5 text-gray-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Карткою онлайн</p>
                  <p className="text-sm text-gray-600">Visa, Mastercard - безпечна оплата через RozetkaPay</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Smartphone className="w-5 h-5 text-gray-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Apple Pay / Google Pay</p>
                  <p className="text-sm text-gray-600">Миттєва оплата з вашого смартфона</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-gray-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Оплата частинами</p>
                  <p className="text-sm text-gray-600">Розстрочка 0% від ПриватБанк, monobank, ПУМБ та інших банків</p>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Options */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Truck className="w-8 h-8 text-green-600" />
              <h3 className="text-xl font-bold">Варіанти доставки</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Package className="w-5 h-5 text-gray-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Нова Пошта</p>
                  <p className="text-sm text-gray-600">Доставка у відділення або поштомат по всій Україні</p>
                  <p className="text-sm text-green-600 font-medium mt-1">Безкоштовно від 500 грн</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Truck className="w-5 h-5 text-gray-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Кур'єром по Києву</p>
                  <p className="text-sm text-gray-600">Доставка за вашою адресою протягом 1-2 днів</p>
                  <p className="text-sm text-green-600 font-medium mt-1">Вартість: 80 грн</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Самовивіз з магазину</p>
                  <p className="text-sm text-gray-600">м. Київ, вул. Хрещатик, 1</p>
                  <p className="text-sm text-green-600 font-medium mt-1">Безкоштовно</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Important Notice */}
        <div className="mt-8 bg-yellow-50 border-2 border-yellow-400 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-6 h-6 text-yellow-600 mt-1 flex-shrink-0" />
            <div>
              <p className="font-bold text-lg text-gray-900 mb-2">Важлива інформація</p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-600 rounded-full"></span>
                  <span><strong>Мінімальна сума замовлення:</strong> 200 грн</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-600 rounded-full"></span>
                  <span><strong>Гарантія повернення:</strong> 14 днів</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-600 rounded-full"></span>
                  <span><strong>Офіційна гарантія:</strong> 12-24 місяці від виробника</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-600 rounded-full"></span>
                  <span><strong>Перевірка товару:</strong> можлива при отриманні</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentDeliveryInfo;
