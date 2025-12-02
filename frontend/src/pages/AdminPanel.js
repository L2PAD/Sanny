import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { adminAPI, categoriesAPI } from '../utils/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { toast } from 'sonner';
import { Users, Package, ShoppingBag, DollarSign, Plus, BarChart3 } from 'lucide-react';
import AnalyticsDashboard from '../components/admin/AnalyticsDashboard';

const AdminPanel = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: '', slug: '' });

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    fetchData();
  }, [isAdmin]);

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

  if (!isAdmin) return null;

  return (
    <div data-testid="admin-panel" className="min-h-screen bg-gray-50 py-8">
      <div className="container-main">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Админ Панель</h1>
          <Button onClick={() => setShowAddCategory(!showAddCategory)}>
            <Plus className="w-4 h-4 mr-2" />
            Добавить категорию
          </Button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Пользователи</p>
                  <p className="text-2xl font-bold">{stats.total_users}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Товары</p>
                  <p className="text-2xl font-bold">{stats.total_products}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Заказы</p>
                  <p className="text-2xl font-bold">{stats.total_orders}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Выручка</p>
                  <p className="text-2xl font-bold">${stats.total_revenue.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Category Form */}
        {showAddCategory && (
          <div className="bg-white rounded-2xl p-8 border border-gray-200 mb-8">
            <h2 className="text-2xl font-bold mb-6">Добавить категорию</h2>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <Label htmlFor="cat-name">Название</Label>
                <Input
                  data-testid="category-name"
                  id="cat-name"
                  value={categoryForm.name}
                  onChange={(e) => {
                    setCategoryForm({
                      name: e.target.value,
                      slug: e.target.value.toLowerCase().replace(/\s+/g, '-')
                    });
                  }}
                  required
                  placeholder="Электроника"
                />
              </div>
              <div>
                <Label htmlFor="cat-slug">Slug</Label>
                <Input
                  data-testid="category-slug"
                  id="cat-slug"
                  value={categoryForm.slug}
                  onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                  required
                  placeholder="electronics"
                />
              </div>
              <div className="flex gap-4">
                <Button data-testid="submit-category" type="submit">Добавить</Button>
                <Button type="button" variant="outline" onClick={() => setShowAddCategory(false)}>
                  Отмена
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Categories */}
        <div className="bg-white rounded-2xl p-8 border border-gray-200 mb-8">
          <h2 className="text-2xl font-bold mb-6">Категории</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <div key={cat.id} className="p-4 border border-gray-200 rounded-xl">
                <h3 className="font-semibold">{cat.name}</h3>
                <p className="text-sm text-gray-600">{cat.slug}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Users */}
        <div className="bg-white rounded-2xl p-8 border border-gray-200">
          <h2 className="text-2xl font-bold mb-6">Пользователи</h2>
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="p-4 border border-gray-200 rounded-xl flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{user.full_name}</h3>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {user.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;