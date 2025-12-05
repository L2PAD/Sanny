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
