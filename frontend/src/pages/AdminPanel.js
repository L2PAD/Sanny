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
  const [activeTab, setActiveTab] = useState('analytics');
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

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`pb-4 px-4 font-semibold transition-colors ${
              activeTab === 'analytics'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <BarChart3 className="w-5 h-5 inline mr-2" />
            Аналитика
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-4 px-4 font-semibold transition-colors ${
              activeTab === 'users'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users className="w-5 h-5 inline mr-2" />
            Пользователи
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`pb-4 px-4 font-semibold transition-colors ${
              activeTab === 'categories'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Package className="w-5 h-5 inline mr-2" />
            Категории
          </button>
        </div>

        {/* Analytics Tab */}
        {activeTab === 'analytics' && <AnalyticsDashboard />}

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
        {activeTab === 'categories' && (
          <div>
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

            {/* Categories List */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200">
              <h2 className="text-2xl font-bold mb-6">Категории ({categories.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {categories.filter(cat => !cat.parent_id).map((cat) => (
                  <div key={cat.id} className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-lg">{cat.name}</h3>
                    <p className="text-sm text-gray-600">{cat.slug}</p>
                    {/* Show subcategories count */}
                    {categories.filter(sub => sub.parent_id === cat.id).length > 0 && (
                      <p className="text-xs text-blue-600 mt-2">
                        {categories.filter(sub => sub.parent_id === cat.id).length} подкатегорий
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;