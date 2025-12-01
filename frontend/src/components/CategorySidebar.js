import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Laptop, 
  Smartphone, 
  Gamepad2, 
  WashingMachine, 
  Shirt, 
  Sofa, 
  Hammer, 
  Dumbbell, 
  Baby,
  PackageOpen,
  BookOpen,
  Zap,
  Dog,
  Sparkles,
  Gift
} from 'lucide-react';

const CategorySidebar = ({ categories, selectedCategory, onCategoryClick }) => {
  const categoryIcons = {
    'Electronics': Laptop,
    'Smartphones': Smartphone,
    'Gaming': Gamepad2,
    'Home Appliances': WashingMachine,
    'Fashion': Shirt,
    'Furniture': Sofa,
    'Tools': Hammer,
    'Sports': Dumbbell,
    'Kids': Baby,
    'Books': BookOpen,
    'Beauty': Sparkles,
    'Gifts': Gift,
    'Pets': Dog,
    'Other': PackageOpen
  };

  const getIconForCategory = (categoryName) => {
    const IconComponent = categoryIcons[categoryName] || PackageOpen;
    return IconComponent;
  };

  return (
    <aside className="w-80 flex-shrink-0 space-y-4">
      {/* Promo Blocks */}
      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-5 border border-green-200">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Карта Marketplace</h3>
          </div>
        </div>
        <p className="text-sm text-gray-700">Персональні знижки та бонуси</p>
      </div>

      <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-5 border border-yellow-200">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
            S
          </div>
          <div>
            <h3 className="font-bold text-lg">Підписка Smart</h3>
          </div>
        </div>
        <p className="text-sm text-gray-700">Безплатна доставка за 50 ₴/міс</p>
      </div>

      {/* Categories */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="divide-y divide-gray-100">
          {categories.map((category) => {
            const IconComponent = getIconForCategory(category.name);
            const isSelected = selectedCategory === category.id;
            
            return (
              <button
                key={category.id}
                onClick={() => onCategoryClick(category.id)}
                className={`w-full flex items-center gap-4 p-4 transition-colors hover:bg-gray-50 ${
                  isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}
              >
                <div className={`w-12 h-12 flex items-center justify-center rounded-xl ${
                  isSelected ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  <IconComponent className={`w-7 h-7 ${
                    isSelected ? 'text-blue-600' : 'text-gray-600'
                  }`} />
                </div>
                <span className={`font-medium text-left ${
                  isSelected ? 'text-blue-700' : 'text-gray-800'
                }`}>
                  {category.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
};

export default CategorySidebar;
