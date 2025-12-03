import React, { useState, useEffect } from 'react';
import { productsAPI, categoriesAPI } from '../../utils/api';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import RichTextEditor from './RichTextEditor';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    description_html: '',
    price: '',
    compare_price: '',
    category_id: '',
    category_name: '',
    stock_level: '',
    images: [''],
    videos: ['']
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productsAPI.getAll();
      setProducts(response.data || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setIsEditing(true);
    setFormData({
      title: product.title || '',
      description: product.description || '',
      description_html: product.description_html || '',
      price: product.price || '',
      compare_price: product.compare_price || '',
      category_id: product.category_id || '',
      category_name: product.category_name || '',
      stock_level: product.stock_level || '',
      images: product.images && product.images.length > 0 ? product.images : [''],
      videos: product.videos && product.videos.length > 0 ? product.videos : ['']
    });
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setIsEditing(true);
    setFormData({
      title: '',
      description: '',
      description_html: '',
      price: '',
      compare_price: '',
      category_id: '',
      category_name: '',
      stock_level: '',
      images: [''],
      videos: ['']
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingProduct(null);
    setFormData({
      title: '',
      description: '',
      description_html: '',
      price: '',
      compare_price: '',
      category_id: '',
      category_name: '',
      stock_level: '',
      images: [''],
      videos: ['']
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        compare_price: formData.compare_price ? parseFloat(formData.compare_price) : null,
        stock_level: parseInt(formData.stock_level),
        images: formData.images.filter(img => img.trim() !== ''),
        videos: formData.videos.filter(vid => vid.trim() !== '')
      };

      if (editingProduct) {
        await productsAPI.update(editingProduct.id, productData);
        toast.success('Товар обновлен!');
      } else {
        await productsAPI.create(productData);
        toast.success('Товар создан!');
      }
      
      fetchProducts();
      handleCancel();
    } catch (error) {
      console.error('Failed to save product:', error);
      toast.error('Ошибка при сохранении товара');
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Вы уверены, что хотите удалить этот товар?')) {
      try {
        await productsAPI.delete(productId);
        toast.success('Товар удален!');
        fetchProducts();
      } catch (error) {
        console.error('Failed to delete product:', error);
        toast.error('Ошибка при удалении товара');
      }
    }
  };

  const handleImageChange = (index, value) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData({ ...formData, images: newImages });
  };

  const addImageField = () => {
    setFormData({ ...formData, images: [...formData.images, ''] });
  };

  const removeImageField = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
  };

  if (isEditing) {
    return (
      <div className=\"max-w-5xl mx-auto\">
        <div className=\"bg-white rounded-2xl p-8 border border-gray-200\">
          <h2 className=\"text-2xl font-bold mb-6\">
            {editingProduct ? 'Редактировать товар' : 'Добавить товар'}
          </h2>

          <form onSubmit={handleSubmit} className=\"space-y-6\">
            {/* Title */}
            <div>
              <Label htmlFor=\"title\">Название товара *</Label>
              <Input
                id=\"title\"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            {/* Category */}
            <div>
              <Label htmlFor=\"category\">Категория *</Label>
              <select
                id=\"category\"
                value={formData.category_id}
                onChange={(e) => {
                  const selectedCategory = categories.find(c => c.id === e.target.value);
                  setFormData({
                    ...formData,
                    category_id: e.target.value,
                    category_name: selectedCategory?.name || ''
                  });
                }}
                className=\"w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500\"
                required
              >
                <option value=\"\">Выберите категорию</option>
                {categories.filter(c => !c.parent_id).map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div className=\"grid grid-cols-2 gap-4\">
              <div>
                <Label htmlFor=\"price\">Цена *</Label>
                <Input
                  id=\"price\"
                  type=\"number\"
                  step=\"0.01\"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor=\"compare_price\">Старая цена</Label>
                <Input
                  id=\"compare_price\"
                  type=\"number\"
                  step=\"0.01\"
                  value={formData.compare_price}
                  onChange={(e) => setFormData({ ...formData, compare_price: e.target.value })}
                />
              </div>
            </div>

            {/* Stock */}
            <div>
              <Label htmlFor=\"stock\">Количество на складе *</Label>
              <Input
                id=\"stock\"
                type=\"number\"
                value={formData.stock_level}
                onChange={(e) => setFormData({ ...formData, stock_level: e.target.value })}
                required
              />
            </div>

            {/* Images */}
            <div>
              <Label>Изображения (URL)</Label>
              {formData.images.map((image, index) => (
                <div key={index} className=\"flex gap-2 mb-2\">
                  <Input
                    value={image}
                    onChange={(e) => handleImageChange(index, e.target.value)}
                    placeholder=\"https://example.com/image.jpg\"
                  />
                  {formData.images.length > 1 && (
                    <Button type=\"button\" variant=\"outline\" onClick={() => removeImageField(index)}>
                      <X className=\"w-4 h-4\" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type=\"button\" variant=\"outline\" onClick={addImageField} className=\"mt-2\">
                <Plus className=\"w-4 h-4 mr-2\" /> Добавить изображение
              </Button>
            </div>

            {/* Rich Text Description */}
            <div>
              <Label>Описание товара (с картинками и форматированием)</Label>
              <p className=\"text-sm text-gray-500 mb-2\">
                Используйте редактор для добавления текста, картинок, заголовков и ссылок
              </p>
              <RichTextEditor
                value={formData.description_html}
                onChange={(value) => setFormData({ ...formData, description_html: value })}
                placeholder=\"Введите подробное описание товара. Вы можете добавлять картинки, заголовки, списки и ссылки...\"
              />
            </div>

            {/* Buttons */}
            <div className=\"flex gap-4 pt-4\">
              <Button type=\"submit\" className=\"flex items-center gap-2\">
                <Save className=\"w-4 h-4\" />
                {editingProduct ? 'Сохранить изменения' : 'Создать товар'}
              </Button>
              <Button type=\"button\" variant=\"outline\" onClick={handleCancel}>
                <X className=\"w-4 h-4 mr-2\" />
                Отмена
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className=\"flex justify-between items-center mb-6\">
        <h2 className=\"text-2xl font-bold\">Управление товарами</h2>
        <Button onClick={handleAddNew} className=\"flex items-center gap-2\">
          <Plus className=\"w-4 h-4\" />
          Добавить товар
        </Button>
      </div>

      <div className=\"bg-white rounded-2xl border border-gray-200 overflow-hidden\">
        <div className=\"overflow-x-auto\">
          <table className=\"w-full\">
            <thead className=\"bg-gray-50 border-b border-gray-200\">
              <tr>
                <th className=\"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase\">Товар</th>
                <th className=\"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase\">Категория</th>
                <th className=\"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase\">Цена</th>
                <th className=\"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase\">Склад</th>
                <th className=\"px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase\">Действия</th>
              </tr>
            </thead>
            <tbody className=\"divide-y divide-gray-200\">
              {products.map((product) => (
                <tr key={product.id} className=\"hover:bg-gray-50\">
                  <td className=\"px-6 py-4\">
                    <div className=\"flex items-center gap-3\">
                      {product.images && product.images[0] && (
                        <img
                          src={product.images[0]}
                          alt={product.title}
                          className=\"w-12 h-12 object-cover rounded-lg\"
                        />
                      )}
                      <div>
                        <p className=\"font-medium text-gray-900\">{product.title}</p>
                      </div>
                    </div>
                  </td>
                  <td className=\"px-6 py-4 text-sm text-gray-600\">{product.category_name}</td>
                  <td className=\"px-6 py-4 text-sm font-medium text-gray-900\">${product.price}</td>
                  <td className=\"px-6 py-4 text-sm text-gray-600\">{product.stock_level}</td>
                  <td className=\"px-6 py-4 text-right space-x-2\">
                    <Button
                      variant=\"outline\"
                      size=\"sm\"
                      onClick={() => handleEdit(product)}
                      className=\"inline-flex items-center gap-1\"
                    >
                      <Edit className=\"w-4 h-4\" />
                      Изменить
                    </Button>
                    <Button
                      variant=\"outline\"
                      size=\"sm\"
                      onClick={() => handleDelete(product.id)}
                      className=\"inline-flex items-center gap-1 text-red-600 hover:text-red-700\"
                    >
                      <Trash2 className=\"w-4 h-4\" />
                      Удалить
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductManagement;
