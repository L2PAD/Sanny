import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { adminAPI, categoriesAPI } from '../utils/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { toast } from 'sonner';
import { Users, Package, ShoppingBag, DollarSign, Plus, BarChart3, Wallet, ClipboardList, TrendingUp, Monitor, Briefcase } from 'lucide-react';
import AnalyticsDashboard from '../components/admin/AnalyticsDashboard';
import ProductManagement from '../components/admin/ProductManagement';
import CategoryManagement from '../components/admin/CategoryManagement';
import PayoutsDashboard from '../components/admin/PayoutsDashboard';
import OrdersAnalytics from '../components/admin/OrdersAnalytics';
import AdvancedAnalytics from '../components/admin/AdvancedAnalytics';
import SlidesManagement from '../components/admin/SlidesManagement';
import CRMDashboard from '../components/admin/CRMDashboard';
import PromotionsManagement from '../components/admin/PromotionsManagement';

const AdminPanel = () => {
  const { isAdmin, loading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('analytics');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: '', slug: '' });

  useEffect(() => {
    // Wait for auth to load
    if (loading) return;
    
    if (!isAdmin) {
      navigate('/');
      return;
    }
    fetchData();
  }, [isAdmin, loading, navigate]);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes, categoriesRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getUsers(),
        categoriesAPI.getAll()
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      await categoriesAPI.create(categoryForm);
      toast.success('Категория добавлена!');
      setShowAddCategory(false);
      setCategoryForm({ name: '', slug: '' });
      fetchData();
    } catch (error) {
      toast.error('Ошибка добавления категории');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div data-testid="admin-panel" className="min-h-screen bg-gray-50 py-4 md:py-8">
      <div className="container-main px-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-4">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">Админ Панель</h1>
          <Button onClick={() => setShowAddCategory(!showAddCategory)} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            <span className="hidden md:inline">Добавить категорию</span>
            <span className="md:hidden">Категорія</span>
          </Button>
        </div>

        {/* Tabs - Horizontal scroll on mobile */}
        <div className="border-b mb-6 md:mb-8 overflow-x-auto -mx-4 px-4">
          <div className="flex gap-2 md:gap-4 min-w-max">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`pb-3 md:pb-4 px-3 md:px-4 font-semibold transition-colors whitespace-nowrap text-sm md:text-base ${
                activeTab === 'analytics'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BarChart3 className="w-4 h-4 md:w-5 md:h-5 inline mr-1 md:mr-2" />
              <span className="hidden sm:inline">Аналитика</span>
              <span className="sm:hidden">📊</span>
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`pb-3 md:pb-4 px-3 md:px-4 font-semibold transition-colors whitespace-nowrap text-sm md:text-base ${
                activeTab === 'users'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users className="w-4 h-4 md:w-5 md:h-5 inline mr-1 md:mr-2" />
              <span className="hidden sm:inline">Пользователи</span>
              <span className="sm:hidden">👥</span>
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`pb-3 md:pb-4 px-3 md:px-4 font-semibold transition-colors whitespace-nowrap text-sm md:text-base ${
                activeTab === 'categories'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Package className="w-4 h-4 md:w-5 md:h-5 inline mr-1 md:mr-2" />
              <span className="hidden sm:inline">Категории</span>
              <span className="sm:hidden">📦</span>
            </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`pb-3 md:pb-4 px-3 md:px-4 font-semibold transition-colors whitespace-nowrap text-sm md:text-base ${
              activeTab === 'products'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4 md:w-5 md:h-5 inline mr-1 md:mr-2" />
            <span className="hidden sm:inline">Товары</span>
            <span className="sm:hidden">🛍️</span>
          </button>
          <button
            onClick={() => setActiveTab('payouts')}
            className={`pb-3 md:pb-4 px-3 md:px-4 font-semibold transition-colors whitespace-nowrap text-sm md:text-base ${
              activeTab === 'payouts'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Wallet className="w-4 h-4 md:w-5 md:h-5 inline mr-1 md:mr-2" />
            <span className="hidden sm:inline">Выплаты</span>
            <span className="sm:hidden">💰</span>
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 md:pb-4 px-3 md:px-4 font-semibold transition-colors whitespace-nowrap text-sm md:text-base ${
              activeTab === 'orders'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ClipboardList className="w-4 h-4 md:w-5 md:h-5 inline mr-1 md:mr-2" />
            <span className="hidden sm:inline">Заказы</span>
            <span className="sm:hidden">📋</span>
          </button>
          <button
            onClick={() => setActiveTab('advanced')}
            className={`pb-3 md:pb-4 px-3 md:px-4 font-semibold transition-colors whitespace-nowrap text-sm md:text-base ${
              activeTab === 'advanced'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <TrendingUp className="w-4 h-4 md:w-5 md:h-5 inline mr-1 md:mr-2" />
            <span className="hidden sm:inline">Расширенная</span>
            <span className="sm:hidden">📈</span>
          </button>
          <button
            onClick={() => setActiveTab('slides')}
            className={`pb-3 md:pb-4 px-3 md:px-4 font-semibold transition-colors whitespace-nowrap text-sm md:text-base ${
              activeTab === 'slides'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Monitor className="w-4 h-4 md:w-5 md:h-5 inline mr-1 md:mr-2" />
            <span className="hidden sm:inline">Слайдер</span>
            <span className="sm:hidden">🖼️</span>
          </button>
          <button
            onClick={() => setActiveTab('crm')}
            className={`pb-3 md:pb-4 px-3 md:px-4 font-semibold transition-colors whitespace-nowrap text-sm md:text-base ${
              activeTab === 'crm'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Briefcase className="w-4 h-4 md:w-5 md:h-5 inline mr-1 md:mr-2" />
            <span className="hidden sm:inline">CRM</span>
            <span className="sm:hidden">💼</span>
          </button>
          </div>
        </div>

        {/* Analytics Tab */}
        {activeTab === 'analytics' && <AnalyticsDashboard />}

        {/* Payouts Tab */}
        {activeTab === 'payouts' && <PayoutsDashboard />}

        {/* Orders Tab */}
        {activeTab === 'orders' && <OrdersAnalytics />}

        {/* Advanced Analytics Tab */}
        {activeTab === 'advanced' && <AdvancedAnalytics />}

        {/* Slides Management Tab */}
        {activeTab === 'slides' && <SlidesManagement />}

        {/* CRM Tab */}
        {activeTab === 'crm' && <CRMDashboard />}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <h2 className="text-2xl font-bold mb-6">Список пользователей</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Email</th>
                    <th className="text-left py-3 px-4">Имя</th>
                    <th className="text-left py-3 px-4">Роль</th>
                    <th className="text-left py-3 px-4">Дата регистрации</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{user.email}</td>
                      <td className="py-3 px-4">{user.full_name}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          user.role === 'admin' ? 'bg-red-100 text-red-600' :
                          user.role === 'seller' ? 'bg-blue-100 text-blue-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && <CategoryManagement />}

        {/* Products Tab */}
        {activeTab === 'products' && <ProductManagement />}
      </div>
    </div>
  );
};

export default AdminPanel;