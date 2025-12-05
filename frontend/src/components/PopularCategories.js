import React from 'react';
import { useNavigate } from 'react-router-dom';

const PopularCategories = ({ categories }) => {
  const navigate = useNavigate();

  // Популярные категории с эмодзи-иконками
  const popularCategories = [
    { name: 'СМАРТФОНИ', icon: '📱', emoji: true },
    { name: 'ТЕЛЕВІЗОРИ', icon: '📺', emoji: true },
    { name: 'МУЛЬТИВАРКИ', icon: '🍲', emoji: true },
    { name: 'КАВОВАРКИ', icon: '☕', emoji: true },
    { name: 'ПРАЛЬНІ МАШИНИ', icon: '🧺', emoji: true },
    { name: 'ПИЛОСОСИ', icon: '🧹', emoji: true },
    { name: 'НОУТБУКИ', icon: '💻', emoji: true },
    { name: 'ХОЛОДИЛЬНИКИ', icon: '❄️', emoji: true },
  ];

  const handleCategoryClick = (categoryName) => {
    // Находим ID категории по имени
    const category = categories.find(cat => 
      cat.name.toLowerCase().includes(categoryName.toLowerCase().slice(0, 5))
    );
    
    if (category) {
      navigate(`/products?category_id=${category.id}`);
    } else {
      navigate('/products');
    }
  };

  return (
    <div className="bg-gray-50 py-8 rounded-2xl">
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center">
          Популярні категорії
        </h2>
      </div>

      <div className="grid grid-cols-4 md:grid-cols-4 lg:grid-cols-8 gap-4 md:gap-6">
        {popularCategories.map((category, index) => (
          <button
            key={index}
            onClick={() => handleCategoryClick(category.name)}
            className="flex flex-col items-center justify-center p-4 md:p-6 bg-white rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105 group"
          >
            <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <span className="text-4xl md:text-5xl">{category.icon}</span>
            </div>
            <span className="text-xs md:text-sm font-semibold text-gray-700 text-center leading-tight uppercase">
              {category.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default PopularCategories;
