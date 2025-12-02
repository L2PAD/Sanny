import React from 'react';
import { FileText } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Terms = () => {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-center flex items-center justify-center gap-3">
          <FileText className="w-10 h-10" />
          {language === 'ru' ? 'Пользовательское соглашение' : 'Угода користувача'}
        </h1>

        <div className="bg-white rounded-2xl shadow-sm p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-bold mb-4">
              1. {language === 'ru' ? 'Общие положения' : 'Загальні положення'}
            </h2>
            <p className="text-gray-700">
              {language === 'ru'
                ? 'Настоящее Пользовательское соглашение регулирует отношения между администрацией интернет-магазина BAZAAR и пользователями сайта.'
                : 'Ця Угода користувача регулює відносини між адміністрацією інтернет-магазину BAZAAR та користувачами сайту.'}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">
              2. {language === 'ru' ? 'Условия использования' : 'Умови використання'}
            </h2>
            <p className="text-gray-700 mb-2">
              {language === 'ru'
                ? 'Используя наш сайт, вы соглашаетесь с условиями данного соглашения.'
                : 'Використовуючи наш сайт, ви погоджуєтесь з умовами цієї угоди.'}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">
              3. {language === 'ru' ? 'Защита персональных данных' : 'Захист персональних даних'}
            </h2>
            <p className="text-gray-700">
              {language === 'ru'
                ? 'Мы обязуемся защищать ваши персональные данные в соответствии с законодательством Украины о защите персональных данных.'
                : 'Ми зобов\'язуємось захищати ваші персональні дані відповідно до законодавства України про захист персональних даних.'}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">
              4. {language === 'ru' ? 'Права и обязанности' : 'Права та обов\'язки'}
            </h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>{language === 'ru' ? 'Пользователь обязан предоставлять достоверную информацию' : 'Користувач зобов\'язаний надавати достовірну інформацію'}</li>
              <li>{language === 'ru' ? 'Администрация имеет право изменять условия соглашения' : 'Адміністрація має право змінювати умови угоди'}</li>
              <li>{language === 'ru' ? 'Пользователь несет ответственность за сохранность своих данных для входа' : 'Користувач несе відповідальність за збереження своїх даних для входу'}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">
              5. {language === 'ru' ? 'Ответственность' : 'Відповідальність'}
            </h2>
            <p className="text-gray-700">
              {language === 'ru'
                ? 'Администрация не несет ответственности за убытки, возникшие в результате использования или невозможности использования сайта.'
                : 'Адміністрація не несе відповідальності за збитки, що виникли внаслідок використання або неможливості використання сайту.'}
            </p>
          </section>

          <div className="mt-8 p-6 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">
              {language === 'ru'
                ? 'Последнее обновление: Декабрь 2024'
                : 'Останнє оновлення: Грудень 2024'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;