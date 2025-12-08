import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import { toast } from 'sonner';
import { Plus, Trash2, Edit, Eye, EyeOff, ArrowUp, ArrowDown, Sparkles } from 'lucide-react';
import axios from 'axios';

const PopularCategoriesManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  
  const [form, setForm] = useState({
    name: '',
    icon: '📱',
    image_url: '',
    order: 0,
    active: true
  });
  const [uploading, setUploading] = useState(false);

  const emojiIcons = ['📱', '📺', '💻', '⌚', '📷', '🎧', '🎮', '🏠', '🍲', '☕', '🧺', '🧹', '❄️', '🔌', '💡', '🎨', '📚', '👕', '👟', '⚽', '🎸', '🚗', '🏃', '🍕', '🎁'];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/admin/popular-categories`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch popular categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      
      if (editingCategory) {
        await axios.put(
          `${process.env.REACT_APP_BACKEND_URL}/api/admin/popular-categories/${editingCategory.id}`,
          form,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Категорію оновлено!');
      } else {
        await axios.post(
          `${process.env.REACT_APP_BACKEND_URL}/api/admin/popular-categories`,
          form,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Категорію створено!');
      }
      
      setShowAddForm(false);
      setEditingCategory(null);
      setForm({ name: '', icon: '📱', image_url: '', order: categories?.length || 0, active: true });
      fetchCategories();
    } catch (error) {
      console.error('Failed to save category:', error);
      toast.error('Помилка збереження');
    }
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm('Видалити цю категорію?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${process.env.REACT_APP_BACKEND_URL}/api/admin/popular-categories/${categoryId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Категорію видалено!');
      fetchCategories();
    } catch (error) {
      toast.error('Помилка видалення');
    }
  };

  const handleToggleActive = async (category) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/admin/popular-categories/${category.id}`,
        { active: !category.active },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(category.active ? 'Категорію приховано' : 'Категорію активовано');
      fetchCategories();
    } catch (error) {
      toast.error('Помилка зміни статусу');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setForm({
      name: category.name,
      icon: category.icon,
      order: category.order,
      active: category.active
    });
    setShowAddForm(true);
  };

  const handleMove = async (categoryId, direction) => {
    const currentIndex = categories.findIndex(c => c.id === categoryId);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === (categories?.length || 0) - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const cat1 = categories[currentIndex];
    const cat2 = categories[newIndex];

    try {
      const token = localStorage.getItem('token');
      await Promise.all([
        axios.put(
          `${process.env.REACT_APP_BACKEND_URL}/api/admin/popular-categories/${cat1.id}`,
          { order: cat2.order },
          { headers: { Authorization: `Bearer ${token}` } }
        ),
        axios.put(
          `${process.env.REACT_APP_BACKEND_URL}/api/admin/popular-categories/${cat2.id}`,
          { order: cat1.order },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      ]);
      fetchCategories();
    } catch (error) {
      toast.error('Помилка зміни порядку');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Популярні категорії на головній</h2>
          <p className="text-gray-600 mt-1">Налаштуйте категорії які відображаються під баннером</p>
        </div>
        <Button 
          onClick={() => {
            setEditingCategory(null);
            setForm({ name: '', icon: '📱', order: categories?.length || 0, active: true });
            setShowAddForm(!showAddForm);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Додати категорію
        </Button>
      </div>

      {/* Форма добавления/редактирования */}
      {showAddForm && (
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">
            {editingCategory ? 'Редагувати категорію' : 'Нова популярна категорія'}
          </h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Label>Назва категорії *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="СМАРТФОНИ"
                required
                className="uppercase"
              />
              <p className="text-xs text-gray-500 mt-1">
                Рекомендуємо коротку назву (до 12 символів)
              </p>
            </div>

            <div>
              <Label>Виберіть іконку (emoji)</Label>
              <div className="grid grid-cols-10 gap-2 p-4 bg-gray-50 rounded-lg max-h-60 overflow-y-auto">
                {emojiIcons.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setForm({ ...form, icon: emoji })}
                    className={`text-3xl p-2 rounded-lg transition-all ${
                      form.icon === emoji
                        ? 'bg-blue-100 ring-2 ring-blue-500 scale-110'
                        : 'hover:bg-gray-200'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-3">
                <span className="text-sm text-gray-600">Вибрана іконка:</span>
                <span className="text-5xl">{form.icon}</span>
              </div>
            </div>

            <div>
              <Label>Порядок (0 = перший)</Label>
              <Input
                type="number"
                value={form.order}
                onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) })}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="active"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor="active" className="cursor-pointer">
                Активна (відображається на сайті)
              </Label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                {editingCategory ? 'Зберегти зміни' : 'Створити категорію'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setShowAddForm(false);
                  setEditingCategory(null);
                  setForm({ name: '', icon: '📱', order: 0, active: true });
                }}
              >
                Скасувати
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Список категорий */}
      <div className="grid gap-4">
        {(categories?.length || 0) === 0 ? (
          <Card className="p-12 text-center">
            <Sparkles className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2">Немає популярних категорій</h3>
            <p className="text-gray-600 mb-6">Створіть категорії для відображення на головній сторінці</p>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Додати категорію
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((category, index) => (
              <Card key={category.id} className={`p-4 ${!category.active ? 'opacity-60' : ''}`}>
                <div className="flex flex-col items-center">
                  {/* Предпросмотр */}
                  <div className="text-6xl mb-3">{category.icon}</div>
                  <h3 className="font-bold text-center mb-3">{category.name}</h3>
                  
                  {!category.active && (
                    <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded mb-2">
                      Прихована
                    </span>
                  )}
                  
                  {/* Управление */}
                  <div className="flex flex-wrap gap-2 mt-auto">
                    <button
                      onClick={() => handleMove(category.id, 'up')}
                      disabled={index === 0}
                      className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                      title="Вгору"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleMove(category.id, 'down')}
                      disabled={index === (categories?.length || 0) - 1}
                      className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                      title="Вниз"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(category)}
                      className="p-1 hover:bg-blue-100 rounded text-blue-600"
                      title="Редагувати"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleToggleActive(category)}
                      className="p-1 hover:bg-gray-100 rounded"
                      title={category.active ? 'Приховати' : 'Показати'}
                    >
                      {category.active ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="p-1 hover:bg-red-100 rounded text-red-600"
                      title="Видалити"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Предпросмотр */}
      {(categories?.length || 0) > 0 && (
        <Card className="p-6 bg-gray-50">
          <h3 className="font-bold mb-4">Попередній перегляд на сайті:</h3>
          <div className="bg-white py-6 rounded-xl border border-gray-200">
            <div className="grid grid-cols-4 md:grid-cols-8 gap-3 px-4">
              {categories.filter(c => c.active).map((category) => (
                <div
                  key={category.id}
                  className="flex flex-col items-center justify-center p-3 bg-white border border-gray-200 rounded-lg"
                >
                  <div className="w-12 h-12 flex items-center justify-center mb-2">
                    <span className="text-3xl">{category.icon}</span>
                  </div>
                  <span className="text-[10px] font-medium text-gray-700 text-center leading-tight uppercase">
                    {category.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default PopularCategoriesManagement;
