import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ScrollReveal from './ScrollReveal';

const PopularCategories = ({ categories }) => {
  const navigate = useNavigate();
  const [popularCategories, setPopularCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPopularCategories();
  }, []);

  const fetchPopularCategories = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/popular-categories`);
      
      if (response.data.length > 0) {
        setPopularCategories(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch popular categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (category) => {
    // Если указан category_id, используем его для фильтрации
    if (category.category_id) {
      navigate(`/products?category_id=${category.category_id}`);
    } else {
      // Иначе ищем категорию по имени
      const matchedCategory = categories.find(cat => 
        cat.name.toLowerCase().includes(category.name.toLowerCase().slice(0, 5))
      );
      
      if (matchedCategory) {
        navigate(`/products?category_id=${matchedCategory.id}`);
      } else {
        navigate('/products');
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-white py-6 rounded-xl border border-gray-200">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (popularCategories.length === 0) {
    return null;
  }

  return (
    <div className="bg-white py-6 rounded-xl border border-gray-200">
      <div className="mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 px-4">
          Популярні категорії
        </h2>
      </div>

      <div className="grid grid-cols-4 md:grid-cols-4 lg:grid-cols-8 gap-3 md:gap-4 px-4">
        {popularCategories.map((category, index) => (
          <button
            key={index}
            onClick={() => handleCategoryClick(category.name)}
            className="flex flex-col items-center justify-center p-3 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 hover:border-blue-300 group"
          >
            <div className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <span className="text-3xl md:text-4xl">{category.icon}</span>
            </div>
            <span className="text-[10px] md:text-xs font-medium text-gray-700 text-center leading-tight uppercase">
              {category.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default PopularCategories;
