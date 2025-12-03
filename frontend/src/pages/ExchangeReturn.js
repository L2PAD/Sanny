import React from 'react';
import { RefreshCw, CheckCircle, XCircle, AlertTriangle, Package, Phone, Mail } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const ExchangeReturn = () => {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-center">
          {language === 'ru' ? 'Обмен и возврат' : 'Обмін та повернення'}
        </h1>

        {/* Main Info Block */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
            <RefreshCw className="w-8 h-8 text-blue-600" />
            {language === 'ru' ? 'Обмен и возврат' : 'Обмін та повернення'}
          </h2>
          <p className="text-gray-700 mb-4 leading-relaxed">
            {language === 'ru'
              ? 'Мы стремимся обеспечить наших клиентов качественным товаром и высоким уровнем сервиса. Если по какой-либо причине вам нужно вернуть товар, мы действуем в соответствии с Законом Украины «О защите прав потребителей»'
              : 'Ми прагнемо забезпечити наших клієнтів якісним товаром та високим рівнем сервісу. Якщо з будь-якої причини вам потрібно повернути товар, ми діємо відповідно до Закону України «Про захист прав споживачів»'}
          </p>
        </div>

        {/* Return Rights */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
            {language === 'ru' ? 'Вы имеете право вернуть товар:' : 'Ви маєте право повернути товар:'}
          </h3>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold mt-1">✓</span>
              <span>
                <strong>
                  {language === 'ru' 
                    ? 'В течение 14 дней с момента получения' 
                    : 'Протягом 14 днів з моменту отримання'}
                </strong>
                {' '}
                {language === 'ru'
                  ? '(при условии, что товар не использовался и сохранен его товарный вид, полная комплектация, ярлыки и пломбы);'
                  : '(за умови, що товар не використовувався і збережено його товарний вигляд, повну комплектацію, ярлики та пломби);'}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold mt-1">✓</span>
              <span>
                {language === 'ru'
                  ? 'В случае обнаружения производственного брака или несоответствия заказу.'
                  : 'У разі виявлення виробничого браку або невідповідності замовленню.'}
              </span>
            </li>
          </ul>
        </div>

        {/* Non-returnable Items */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <XCircle className="w-6 h-6 text-red-600" />
            {language === 'ru' 
              ? 'Возврату надлежащего качества не подлежат:' 
              : 'Поверненню належної якості не підлягають:'}
          </h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-red-600 font-bold mt-1">✗</span>
              <span>
                {language === 'ru' ? 'Средства личной гигиены;' : 'засоби особистої гігієни;'}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-600 font-bold mt-1">✗</span>
              <span>
                {language === 'ru' 
                  ? 'Косметические и моющие средства без защитной (запаянной/гигиенической) упаковки;'
                  : 'косметичні та мийні засоби без захисної (запаяної/гігієнічної) упаковки;'}
              </span>
            </li>
          </ul>
        </div>

        {/* Special Categories */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
          <h3 className="text-xl font-bold mb-4">
            {language === 'ru' ? 'Отдельные категории товаров:' : 'Окремі категорії товарів:'}
          </h3>
          
          <div className="space-y-4 text-gray-700">
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-semibold mb-2">
                {language === 'ru' ? 'Товары текстильного производства' : 'Товари текстильного виробництва'}
              </h4>
            </div>

            <div className="border-l-4 border-purple-500 pl-4">
              <h4 className="font-semibold mb-2">
                {language === 'ru' 
                  ? 'Массажеры, электробритвы, триммеры, эпиляторы, фены, стайлеры и другие электроприборы для ухода'
                  : 'Масажери, електробритви, тримери, епілятори, фени, стайлери та інші електроприлади для догляду'}
              </h4>
              <p className="text-sm">
                {language === 'ru'
                  ? 'подлежат возврату только если сохранены заводские пломбы, нет следов использования, товар полностью новый и пригоден к дальнейшей реализации.'
                  : 'підлягають поверненню тільки якщо збережені заводські пломби, немає слідів використання, товар повністю новий і придатний до подальшої реалізації.'}
              </p>
            </div>

            <div className="border-l-4 border-pink-500 pl-4">
              <h4 className="font-semibold mb-2">
                {language === 'ru' ? 'Детские мягкие игрушки' : 'Дитячі м\'які іграшки'}
              </h4>
              <p className="text-sm">
                {language === 'ru'
                  ? 'принимаются к возврату при условии отсутствия следов использования, сохранения ярлыков и полной комплектации.'
                  : 'приймаються до повернення за умови відсутності слідів використання, збереження ярликів та повної комплектації.'}
              </p>
            </div>
          </div>
        </div>

        {/* Important Warning - Shipping Cost */}
        <div className="bg-red-50 border-2 border-red-400 rounded-2xl p-6 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-lg text-red-900 mb-2">
                {language === 'ru' ? 'ВНИМАНИЕ! ВОЗВРАТ' : 'УВАГА! ПОВЕРНЕННЯ'}
              </h3>
              <p className="text-red-800 font-semibold">
                {language === 'ru'
                  ? 'Посылки ПРОИСХОДИТ ЗА СЧЕТ КЛИЕНТА'
                  : 'Посилки ВІДБУВАЄТЬСЯ ЗА РАХУНОК КЛІЄНТА'}
              </p>
            </div>
          </div>
        </div>

        {/* Package Inspection Warning */}
        <div className="bg-yellow-50 border-2 border-yellow-400 rounded-2xl p-6 mb-6">
          <div className="flex items-start gap-3">
            <Package className="w-6 h-6 text-yellow-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-lg text-gray-900 mb-3">
                {language === 'ru' 
                  ? 'Важно: Обязательно проверяйте товар на почте во время получения' 
                  : 'Важливо: Обов\'язково перевіряйте товар на пошті під час отримання'}
              </h3>
              <p className="text-gray-700 mb-3 leading-relaxed">
                {language === 'ru'
                  ? 'При получении товара в почтовом отделении проверьте его на целостность, наличие брака и деформаций. Если при осмотре Вы обнаружили повреждение товара или неполную комплектацию, Вам необходимо составить Акт о повреждении товара в отделении перевозчика (составляется вместе с представителем почтового отделения) и отказаться от получения посылки.'
                  : 'При отриманні товару у поштовому відділенні перевірте його на цілісність, наявність браку та деформацій. Якщо під час огляду Ви виявили пошкодження товару або неповну комплектацію, Вам необхідно скласти Акт про пошкодження товару на відділенні перевізника (складається разом з представником поштового відділення) та відмовитися від отримання посилки.'}
              </p>
              <p className="text-red-700 font-semibold">
                {language === 'ru'
                  ? 'Даже если посылка вами оплачена, в случае повреждения ни в коем случае не получайте её, дальнейшие претензии не будут приниматься от покупателя.'
                  : 'Навіть якщо посилка вами оплачена, у разі пошкодження ні в якому разі не отримуйте її, подальші претензії не будуть прийматися від покупця.'}
              </p>
            </div>
          </div>
        </div>

        {/* Return Process */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
          <h3 className="text-xl font-bold mb-4">
            {language === 'ru' ? 'Для оформления возврата:' : 'Для оформлення повернення:'}
          </h3>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-1">1.</span>
              <span>
                {language === 'ru'
                  ? 'Необходимо предоставить подтверждение покупки (номер заказа)'
                  : 'необхідно надати підтвердження покупки (номер замовлення)'}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-1">2.</span>
              <span>
                {language === 'ru'
                  ? 'Покупатель имеет право осуществить осмотр товара во время получения (внешний вид, комплектация). После подтверждения получения и оплаты товар считается принятым без замечаний, кроме случаев, прямо предусмотренных законом.'
                  : 'Покупець має право здійснити огляд товару під час отримання (зовнішній вигляд, комплектація). Після підтвердження отримання та оплати товар вважається прийнятим без зауважень, крім випадків, прямо передбачених законом.'}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-1">3.</span>
              <span>
                {language === 'ru'
                  ? 'В случае осуществления предоплаты покупатель может отказаться от получения товара во время осмотра в отделении, и в таком случае средства возвращаются в течение 7 рабочих дней.'
                  : 'У разі здійснення передплати покупець може відмовитися від отримання товару під час огляду у відділенні, і в такому випадку кошти повертаються протягом 7 робочих днів.'}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-1">4.</span>
              <span>
                {language === 'ru'
                  ? 'Вы можете вернуть посылку отправителю только перевозчиком Новой почты, но перед тем связаться с нашим менеджером и согласовать возврат товара.'
                  : 'Ви можете повернути посилку відправнику тільки перевізником Нової пошти але перед тим зв\'язатися з нашім менеджером та погодити повернення товару.'}
              </span>
            </li>
          </ul>
        </div>

        {/* Contact Information */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-8 mb-6">
          <h3 className="text-2xl font-bold mb-6 text-center">
            {language === 'ru' ? 'Контакты для возврата' : 'Контакти для повернення'}
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="w-6 h-6 flex-shrink-0" />
              <div>
                <p className="font-semibold mb-1">
                  {language === 'ru' ? 'Написать письмо на электронную почту:' : 'написати лист на електронну пошту:'}
                </p>
                <a href="mailto:dynamo1402om@gmail.com" className="text-xl hover:underline">
                  dynamo1402om@gmail.com
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="w-6 h-6 flex-shrink-0" />
              <div>
                <p className="font-semibold mb-1">
                  {language === 'ru' ? 'или позвонить:' : 'або подзвонити:'}
                </p>
                <a href="tel:+380502474161" className="text-xl hover:underline">
                  +380 50 247 41 61
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.35.5C6.697.5 2.09 5.107 2.09 10.76c0 1.904.522 3.684 1.427 5.214L2 20.5l4.74-1.474c1.452.803 3.13 1.264 4.91 1.264 5.653 0 10.26-4.607 10.26-10.26C21.91 5.107 17.303.5 12.35.5zm5.8 13.96c-.226.634-1.132 1.165-1.85 1.314-.493.098-.947.442-3.206-.668-2.715-1.337-4.458-4.123-4.594-4.312-.136-.19-1.11-1.477-1.11-2.817 0-1.34.704-1.998.952-.77.247.002.588.092.845.092.248 0 .548-.097.858.656.317.772 1.08 2.634 1.174 2.825.095.19.158.412.032.603-.127.19-.19.308-.38.474-.19.165-.4.37-.57.497-.19.143-.388.297-.167.583.222.286.987 1.628 2.12 2.635 1.458 1.297 2.687 1.698 3.067 1.888.38.19.603.158.825-.095.222-.254.95-1.108 1.204-1.49.254-.38.507-.317.857-.19.35.126 2.223 1.048 2.603 1.238.38.19.634.285.73.444.095.158.095.92-.13 1.553z"/>
              </svg>
              <div>
                <p className="font-semibold mb-1">
                  {language === 'ru' ? 'или написать на Viber:' : 'або написати на вайбер:'}
                </p>
                <a href="viber://chat?number=%2B380502474161" className="text-xl hover:underline">
                  +380 50 247 41 61
                </a>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-white/30">
              <p className="font-semibold mb-2">
                {language === 'ru' ? 'Необходимо приложить:' : 'додати:'}
              </p>
              <ul className="space-y-1 text-sm">
                <li>• {language === 'ru' ? 'фото товара' : 'фото товар'}</li>
                <li>• {language === 'ru' ? 'номер заказа' : 'номер замовлення'}</li>
                <li>• {language === 'ru' ? 'описание претензии' : 'опис претензії'}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Return Address */}
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h3 className="text-xl font-bold mb-4">
            {language === 'ru' ? 'Отправить товар Новой почтой по адресу:' : 'відправити товар Новою поштою за адресою:'}
          </h3>
          <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-6">
            <p className="text-lg font-semibold mb-2">м. Київ</p>
            <p className="text-lg mb-2">НП 23 проспект Миколи Бажана, 24/1</p>
            <p className="text-lg mb-2">ФОП Тищенко Олександр Миколайович</p>
            <p className="text-lg font-semibold text-blue-600">+380 63 724 77 03</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExchangeReturn;
