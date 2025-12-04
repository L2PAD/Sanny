import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronDown, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { categoriesAPI } from '../utils/api';
import { useCatalog } from '../contexts/CatalogContext';
import { useLanguage } from '../contexts/LanguageContext';

const CatalogSidebar = () => {
  const { isCatalogOpen, closeCatalog } = useCatalog();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState([]);
  const [categorySearch, setCategorySearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isCatalogOpen) {
      fetchCategories();
    }
  }, [isCatalogOpen]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoriesAPI.getAll();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleCategoryClick = (categoryId) => {
    closeCatalog();
    navigate(`/products?category_id=${categoryId}`);
  };

  const filteredCategories = categories.filter(cat =>
    cat.name?.toLowerCase().includes(categorySearch.toLowerCase())
  );

  if (!isCatalogOpen) return null;

  return (
    <>
      {/* Overlay - закрывает весь экран */}
      <div
        className="fixed inset-0 bg-black bg-opacity-70 z-[45] transition-opacity"
        onClick={closeCatalog}
      />

      {/* Sidebar - на весь экран на мобильных */}
      <div className="fixed left-0 top-0 h-full w-full sm:w-96 md:w-[400px] lg:w-[450px] bg-white shadow-2xl z-50 overflow-y-auto transform transition-transform">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 z-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              {t('catalog')}
            </h2>
            <button
              onClick={closeCatalog}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value)}
              placeholder={t('search')}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Categories List */}
        <div className="p-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredCategories.length === 0 ? (
            <p className="text-center text-gray-500 py-8">{t('noProductsFound')}</p>
          ) : (
            <div className="space-y-1">
              {filteredCategories.map((category) => (
                <div key={category.id}>
                  <button
                    onClick={() => {
                      if (category.subcategories?.length > 0) {
                        toggleCategory(category.id);
                      } else {
                        handleCategoryClick(category.id);
                      }
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 transition-colors ${
                      expandedCategories.includes(category.id) ? 'bg-gray-50' : ''
                    }`}
                  >
                    <span className="font-medium text-gray-900">{category.name}</span>
                    {category.subcategories?.length > 0 && (
                      expandedCategories.includes(category.id) ? (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      )
                    )}
                  </button>

                  {/* Subcategories */}
                  {expandedCategories.includes(category.id) && category.subcategories?.length > 0 && (
                    <div className="ml-4 mt-1 space-y-1">
                      {category.subcategories.map((subcat) => (
                        <button
                          key={subcat.id}
                          onClick={() => handleCategoryClick(subcat.id)}
                          className="w-full text-left p-2 pl-4 rounded-lg hover:bg-gray-50 text-gray-700 text-sm transition-colors"
                        >
                          {subcat.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gradient-to-t from-white via-white to-transparent p-4 border-t border-gray-200">
          <button
            onClick={() => {
              closeCatalog();
              navigate('/products');
            }}
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('language') === 'ru' ? 'Посмотреть все товары' : 'Подивитись всі товари'}
          </button>
        </div>
      </div>
    </>
  );
};

export default CatalogSidebar;
