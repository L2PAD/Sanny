import React, { useState, useEffect } from 'react';
import {
  TrendingUp, ShoppingCart, Heart, Users, Eye, Package,
  DollarSign, Calendar, ArrowUp, ArrowDown, AlertCircle, Target
} from 'lucide-react';
import axios from 'axios';
import { Button } from '../ui/button';

const AdvancedAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Data states
  const [visits, setVisits] = useState({ unique_visitors: 0, total_visits: 0 });
  const [abandonedCarts, setAbandonedCarts] = useState({ total_abandoned: 0, total_value: 0, carts: [] });
  const [wishlistData, setWishlistData] = useState({ total_products: 0, potential_revenue: 0, products: [] });
  const [conversionFunnel, setConversionFunnel] = useState({});
  const [productPerformance, setProductPerformance] = useState([]);
  const [timeBasedData, setTimeBasedData] = useState({ monthly_breakdown: [] });
  const [customerLTV, setCustomerLTV] = useState([]);
  const [categoryPerformance, setCategoryPerformance] = useState([]);
  const [timeOnPages, setTimeOnPages] = useState([]);
  const [productPageAnalytics, setProductPageAnalytics] = useState([]);
  const [userBehaviorFlow, setUserBehaviorFlow] = useState({ top_transitions: [] });

  useEffect(() => {
    fetchAllAnalytics();
  }, []);

  const fetchAllAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const [
        visitsRes,
        cartsRes,
        wishlistRes,
        funnelRes,
        performanceRes,
        timeRes,
        ltvRes,
        categoryRes,
        timeOnPagesRes,
        productPageRes,
        behaviorFlowRes
      ] = await Promise.all([
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/admin/analytics/advanced/visits`, config),
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/admin/analytics/advanced/abandoned-carts`, config),
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/admin/analytics/advanced/wishlist`, config),
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/admin/analytics/advanced/conversion-funnel`, config),
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/admin/analytics/advanced/product-performance`, config),
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/admin/analytics/advanced/time-based`, config),
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/admin/analytics/advanced/customer-ltv`, config),
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/admin/analytics/advanced/category-performance`, config),
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/admin/analytics/advanced/time-on-pages`, config),
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/admin/analytics/advanced/product-page-analytics`, config),
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/admin/analytics/advanced/user-behavior-flow`, config)
      ]);

      setVisits(visitsRes.data);
      setAbandonedCarts(cartsRes.data);
      setWishlistData(wishlistRes.data);
      setConversionFunnel(funnelRes.data);
      setProductPerformance(performanceRes.data);
      setTimeBasedData(timeRes.data);
      setCustomerLTV(ltvRes.data);
      setCategoryPerformance(categoryRes.data);
      setTimeOnPages(timeOnPagesRes.data);
      setProductPageAnalytics(productPageRes.data);
      setUserBehaviorFlow(behaviorFlowRes.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">Расширенная Аналитика</h2>
        <Button onClick={fetchAllAnalytics} variant="outline">
          Обновить данные
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-4 overflow-x-auto">
          {['overview', 'products', 'customers', 'time', 'user-behavior'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-4 font-semibold transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab === 'overview' && '📊 Обзор'}
              {tab === 'products' && '📦 Товары'}
              {tab === 'customers' && '👥 Покупатели'}
              {tab === 'time' && '📅 По времени'}
              {tab === 'user-behavior' && '⏱️ Поведение'}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <Eye className="w-8 h-8 opacity-80" />
                <TrendingUp className="w-5 h-5" />
              </div>
              <p className="text-sm opacity-90 mb-1">Посещений (30 дней)</p>
              <p className="text-4xl font-bold">{visits.total_page_views || visits.total_visits || 0}</p>
              <p className="text-sm opacity-75 mt-2">
                Уникальных: {visits.unique_visitors || 0}
              </p>
              <p className="text-xs opacity-70 mt-1">
                Среднее время: {visits.avg_session_duration ? `${Math.floor(visits.avg_session_duration / 60)}м ${Math.round(visits.avg_session_duration % 60)}с` : 'N/A'}
              </p>
            </div>

            <div className="bg-gradient-to-br from-yellow-500 to-orange-600 text-white rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <ShoppingCart className="w-8 h-8 opacity-80" />
                <AlertCircle className="w-5 h-5" />
              </div>
              <p className="text-sm opacity-90 mb-1">Брошенные корзины</p>
              <p className="text-4xl font-bold">{abandonedCarts.total_abandoned}</p>
              <p className="text-sm opacity-75 mt-2">
                На сумму: ${abandonedCarts.total_value.toFixed(2)}
              </p>
            </div>

            <div className="bg-gradient-to-br from-pink-500 to-red-600 text-white rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <Heart className="w-8 h-8 opacity-80" />
                <Target className="w-5 h-5" />
              </div>
              <p className="text-sm opacity-90 mb-1">В избранном</p>
              <p className="text-4xl font-bold">{wishlistData.total_products}</p>
              <p className="text-sm opacity-75 mt-2">
                Потенциал: ${wishlistData.potential_revenue.toFixed(2)}
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <Target className="w-8 h-8 opacity-80" />
                <ArrowUp className="w-5 h-5" />
              </div>
              <p className="text-sm opacity-90 mb-1">Конверсия</p>
              <p className="text-4xl font-bold">
                {conversionFunnel.overall_conversion?.toFixed(1) || 0}%
              </p>
              <p className="text-sm opacity-75 mt-2">
                Посетитель → Покупка
              </p>
            </div>
          </div>

          {/* Conversion Funnel */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="text-xl font-bold mb-6">Воронка Конверсии</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-full">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">👥 Всего пользователей</span>
                    <span className="font-bold text-xl">{conversionFunnel.total_users}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div className="bg-blue-500 h-4 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-full">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">🛒 Добавили в корзину</span>
                    <span className="font-bold text-xl">
                      {conversionFunnel.added_to_cart} 
                      <span className="text-sm text-green-600 ml-2">
                        ({conversionFunnel.cart_conversion?.toFixed(1)}%)
                      </span>
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div 
                      className="bg-yellow-500 h-4 rounded-full" 
                      style={{ width: `${conversionFunnel.cart_conversion || 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-full">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">✅ Совершили покупку</span>
                    <span className="font-bold text-xl">
                      {conversionFunnel.completed_purchase}
                      <span className="text-sm text-green-600 ml-2">
                        ({conversionFunnel.overall_conversion?.toFixed(1)}%)
                      </span>
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div 
                      className="bg-green-500 h-4 rounded-full" 
                      style={{ width: `${conversionFunnel.overall_conversion || 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Abandoned Carts Table */}
          <div className="bg-white rounded-2xl border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold">🛒 Брошенные корзины (Топ 10)</h3>
              <p className="text-gray-600 text-sm mt-1">
                Пользователи добавили товары, но не завершили покупку
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Покупатель</th>
                    <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">Товаров</th>
                    <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">Сумма</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Обновлено</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {abandonedCarts.carts.slice(0, 10).map((cart, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div>
                          <div className="font-medium">{cart.user_name}</div>
                          <div className="text-sm text-gray-500">{cart.user_email}</div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right font-medium">
                        {cart.items_count}
                      </td>
                      <td className="py-4 px-6 text-right font-bold text-orange-600">
                        ${cart.cart_value.toFixed(2)}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {cart.last_updated ? new Date(cart.last_updated).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          {/* Wishlist Products */}
          <div className="bg-white rounded-2xl border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold">❤️ Товары в избранном (не куплены)</h3>
              <p className="text-gray-600 text-sm mt-1">
                Товары с высоким интересом, но низкой конверсией
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Товар</th>
                    <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">В избранном</th>
                    <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">Куплено</th>
                    <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">Не куплено</th>
                    <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">Конверсия</th>
                    <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">Потенциал</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {wishlistData.products.slice(0, 20).map((product, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {product.product_image && (
                            <img 
                              src={product.product_image} 
                              alt={product.product_name}
                              className="w-12 h-12 object-cover rounded"
                            />
                          )}
                          <div>
                            <div className="font-medium">{product.product_name}</div>
                            <div className="text-sm text-gray-500">{product.category}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right font-medium">
                        {product.in_wishlist}
                      </td>
                      <td className="py-4 px-6 text-right text-green-600 font-medium">
                        {product.purchased}
                      </td>
                      <td className="py-4 px-6 text-right text-orange-600 font-bold">
                        {product.not_purchased}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          product.conversion_rate > 50 
                            ? 'bg-green-100 text-green-700'
                            : product.conversion_rate > 20
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {product.conversion_rate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right font-bold text-blue-600">
                        ${(product.product_price * product.not_purchased).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Product Performance */}
          <div className="bg-white rounded-2xl border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold">📊 Эффективность товаров</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Товар</th>
                    <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">В корзине</th>
                    <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">Продано</th>
                    <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">Выручка</th>
                    <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">Конверсия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {productPerformance.slice(0, 20).map((product, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div>
                          <div className="font-medium">{product.product_name}</div>
                          <div className="text-sm text-gray-500">{product.category}</div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right font-medium">
                        {product.in_cart}
                      </td>
                      <td className="py-4 px-6 text-right font-bold text-green-600">
                        {product.total_sold}
                      </td>
                      <td className="py-4 px-6 text-right font-bold text-blue-600">
                        ${product.revenue.toFixed(2)}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          product.cart_to_purchase_rate > 70
                            ? 'bg-green-100 text-green-700'
                            : product.cart_to_purchase_rate > 40
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {product.cart_to_purchase_rate.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Category Performance */}
          <div className="bg-white rounded-2xl border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold">📁 Эффективность по категориям</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Категория</th>
                    <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">Заказов</th>
                    <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">Продано единиц</th>
                    <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">Выручка</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {categoryPerformance.map((cat, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="py-4 px-6 font-medium">{cat.category}</td>
                      <td className="py-4 px-6 text-right">{cat.orders}</td>
                      <td className="py-4 px-6 text-right font-medium">{cat.items_sold}</td>
                      <td className="py-4 px-6 text-right font-bold text-green-600">
                        ${cat.revenue.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Customers Tab */}
      {activeTab === 'customers' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold">👑 Топ покупатели (LTV)</h3>
              <p className="text-gray-600 text-sm mt-1">
                Customer Lifetime Value - общая ценность клиента
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Покупатель</th>
                    <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">Заказов</th>
                    <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">Всего потрачено</th>
                    <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">Средний чек</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Последний заказ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {customerLTV.map((customer, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {idx < 3 && <span className="text-xl">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}</span>}
                            {customer.user_name}
                          </div>
                          <div className="text-sm text-gray-500">{customer.user_email}</div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right font-medium">
                        {customer.total_orders}
                      </td>
                      <td className="py-4 px-6 text-right font-bold text-green-600 text-lg">
                        ${customer.total_spent.toFixed(2)}
                      </td>
                      <td className="py-4 px-6 text-right font-medium text-blue-600">
                        ${customer.average_order.toFixed(2)}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {customer.last_order ? new Date(customer.last_order).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Time Tab */}
      {activeTab === 'time' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold">📅 Анализ по месяцам</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {timeBasedData.monthly_breakdown.map((month, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="w-32 font-medium text-gray-700">{month.month}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">
                          {month.orders} заказов
                        </span>
                        <span className="font-bold text-green-600">
                          ${month.revenue.toFixed(2)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full"
                          style={{ 
                            width: `${Math.min((month.revenue / Math.max(...timeBasedData.monthly_breakdown.map(m => m.revenue))) * 100, 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedAnalytics;
