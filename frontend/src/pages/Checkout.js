import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { MapPin, CreditCard, Building2, User, Phone, Mail, ChevronRight, AlertCircle, Package, Truck, Home } from 'lucide-react';
import { toast } from 'sonner';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, cartTotal, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();

  const [deliveryMethod, setDeliveryMethod] = useState('self-pickup');
  const [paymentMethod, setPaymentMethod] = useState('on-delivery');
  const [recipientData, setRecipientData] = useState({
    firstName: user?.full_name?.split(' ')[0] || '',
    lastName: user?.full_name?.split(' ')[1] || '',
    patronymic: '',
    phone: '',
    email: user?.email || '',
    city: '',
    address: '',
    comment: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (cart.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);

  const deliveryOptions = [
    {
      id: 'self-pickup',
      name: 'Самовивіз з наших магазинів',
      description: 'виберіть відповідне відділення',
      price: 0,
      icon: Home
    },
    {
      id: 'courier',
      name: 'Кур\'єр на вашу адресу',
      description: 'Доставка протягом 1-2 днів',
      price: 149,
      smartFree: true,
      icon: Truck
    },
    {
      id: 'nova-poshta',
      name: 'Самовивіз з Нової Пошти',
      description: 'Відділення або поштомат',
      price: 72,
      icon: Package
    },
    {
      id: 'ukrposhta',
      name: 'Самовивіз з УКРПОШТИ',
      description: 'Найближче відділення',
      price: 0,
      free: true,
      icon: Package
    }
  ];

  const paymentOptions = [
    {
      id: 'on-delivery',
      name: 'Оплата під час отримання товару',
      description: 'Готівкою або карткою при отриманні'
    },
    {
      id: 'online',
      name: 'Оплатити зараз',
      description: 'Оплата карткою онлайн'
    },
    {
      id: 'card-rozetka',
      name: 'Оплатити Карткою Marketplace зараз',
      description: 'При оплаті онлайн Карткою Marketplace застосується знижка',
      badge: 'Discount'
    },
    {
      id: 'installment',
      name: 'Кредит та оплата частинами',
      description: 'Оформлення кредитів у банках партнерів'
    }
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!recipientData.firstName.trim()) {
      newErrors.firstName = 'Введіть ім\'я';
    }
    if (!recipientData.lastName.trim()) {
      newErrors.lastName = 'Введіть прізвище';
    }
    if (!recipientData.phone.trim()) {
      newErrors.phone = 'Введіть номер мобільного телефону';
    } else if (!/^\+?38?0\d{9}$/.test(recipientData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Невірний формат телефону';
    }
    if (!recipientData.email.trim()) {
      newErrors.email = 'Введіть email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientData.email)) {
      newErrors.email = 'Невірний формат email';
    }

    if (deliveryMethod !== 'self-pickup') {
      if (!recipientData.city.trim()) {
        newErrors.city = 'Введіть місто';
      }
      if (!recipientData.address.trim()) {
        newErrors.address = 'Введіть адресу';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setRecipientData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      toast.error('Будь ласка, заповніть всі обов\'язкові поля');
      return;
    }

    try {
      // Here would be the actual order placement logic
      toast.success('Замовлення успішно оформлено!');
      clearCart();
      navigate('/checkout/success');
    } catch (error) {
      toast.error('Помилка при оформленні замовлення');
    }
  };

  const selectedDelivery = deliveryOptions.find(opt => opt.id === deliveryMethod);
  const deliveryPrice = selectedDelivery?.price || 0;
  const totalWithDelivery = cartTotal + deliveryPrice;

  return (
    <div className="min-h-screen bg-[#F7F7F7] py-8">
      <div className="container-main">
        <h1 className="text-3xl font-bold mb-8">Оформлення замовлення</h1>

        <div className="flex gap-8">
          {/* Left Column - Forms */}
          <div className="flex-1 space-y-6">
            {/* Auth Block (if not authenticated) */}
            {!isAuthenticated && (
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h2 className="text-xl font-bold mb-4">Авторизація</h2>
                <p className="text-gray-600 mb-4">
                  Увійдіть в свій акаунт або продовжіть як гість
                </p>
                <div className="flex gap-4">
                  <Button onClick={() => navigate('/login')} className="flex-1">
                    Увійти
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Продовжити як гість
                  </Button>
                </div>
              </div>
            )}

            {/* Recipient Data */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <User className="w-6 h-6" />
                Отримувач
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Прізвище <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={recipientData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.lastName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Іванов"
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.lastName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Ім'я <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={recipientData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.firstName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Іван"
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.firstName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">По батькові</label>
                  <input
                    type="text"
                    value={recipientData.patronymic}
                    onChange={(e) => handleInputChange('patronymic', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Іванович"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Мобільний телефон <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={recipientData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="+38 (0__) ___-__-__"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.phone}
                    </p>
                  )}
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={recipientData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="example@mail.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Delivery */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <MapPin className="w-6 h-6" />
                Доставка
              </h2>

              <div className="space-y-3">
                {deliveryOptions.map((option) => {
                  const IconComponent = option.icon;
                  return (
                    <div
                      key={option.id}
                      onClick={() => setDeliveryMethod(option.id)}
                      className={`p-4 border rounded-xl cursor-pointer transition-all ${
                        deliveryMethod === option.id
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <input
                            type="radio"
                            checked={deliveryMethod === option.id}
                            onChange={() => setDeliveryMethod(option.id)}
                            className="mt-1 w-5 h-5"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <IconComponent className="w-5 h-5 text-gray-600" />
                              <p className="font-semibold">{option.name}</p>
                            </div>
                            <p className="text-sm text-gray-600">{option.description}</p>
                            
                            {deliveryMethod === option.id && option.id === 'self-pickup' && (
                              <div className="mt-3">
                                <input
                                  type="text"
                                  placeholder="виберіть відповідне відділення"
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                />
                                <Button variant="outline" className="mt-2" size="sm">
                                  Обрати на мапі
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          {option.free && (
                            <span className="text-green-600 font-semibold">Безкоштовно</span>
                          )}
                          {!option.free && option.price === 0 && (
                            <span className="text-green-600 font-semibold">Безкоштовно</span>
                          )}
                          {!option.free && option.price > 0 && (
                            <div>
                              <span className="font-semibold">{option.price} ₴</span>
                              {option.smartFree && (
                                <p className="text-xs text-gray-500">або безкоштовно зі SMART</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {deliveryMethod !== 'self-pickup' && (
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Місто <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={recipientData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.city ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Київ"
                    />
                    {errors.city && (
                      <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Адреса <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={recipientData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.address ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="вул. Хрещатик, 1"
                    />
                    {errors.address && (
                      <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Payment */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <CreditCard className="w-6 h-6" />
                Оплата
              </h2>

              <div className="space-y-3">
                {paymentOptions.map((option) => (
                  <div
                    key={option.id}
                    onClick={() => setPaymentMethod(option.id)}
                    className={`p-4 border rounded-xl cursor-pointer transition-all ${
                      paymentMethod === option.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        checked={paymentMethod === option.id}
                        onChange={() => setPaymentMethod(option.id)}
                        className="mt-1 w-5 h-5"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{option.name}</p>
                          {option.badge && (
                            <span className="px-2 py-1 bg-yellow-400 text-xs font-semibold rounded">
                              {option.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Certificate */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Сертифікат</h3>
                  <Button variant="outline" size="sm">
                    Додати
                  </Button>
                </div>
              </div>
            </div>

            {/* Comment */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <h3 className="font-semibold mb-4">Коментар до замовлення</h3>
              <textarea
                value={recipientData.comment}
                onChange={(e) => handleInputChange('comment', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Додаткова інформація для кур'єра..."
              />
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="w-96 flex-shrink-0">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 sticky top-6">
              <h2 className="text-xl font-bold mb-6">Ваше замовлення</h2>

              {/* Products */}
              <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-3 pb-4 border-b border-gray-100">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0">
                      {item.images?.[0] && (
                        <img
                          src={item.images[0]}
                          alt={item.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-2">{item.title}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {item.quantity} × ${item.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-3 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{cart.length} товарів</span>
                  <span className="font-semibold">${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Доставка</span>
                  <span className="font-semibold">
                    {deliveryPrice === 0 ? (
                      <span className="text-green-600">Безкоштовно</span>
                    ) : (
                      `${deliveryPrice} ₴`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-3 border-t border-gray-200">
                  <span>До сплати:</span>
                  <span>${totalWithDelivery.toFixed(2)}</span>
                </div>
              </div>

              {/* Place Order Button */}
              <Button
                onClick={handlePlaceOrder}
                className="w-full mt-6 bg-green-600 hover:bg-green-700 text-lg py-6"
              >
                Підтвердити замовлення
              </Button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Натискаючи кнопку, ви погоджуєтесь з умовами обробки персональних даних
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;