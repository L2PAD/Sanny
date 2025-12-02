import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Dog,
  Sparkles,
  Gift,
  ChevronDown,
  ChevronRight,
  Monitor,
  Tablet,
  Headphones,
  Watch,
  Camera
} from 'lucide-react';
import { categoriesAPI } from '../utils/api';

const CategorySidebar = ({ categories, selectedCategory, onCategoryClick }) => {
  const navigate = useNavigate();
  const [expandedCategories, setExpandedCategories] = useState([]);
  const [categoriesData, setCategoriesData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch categories from API
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoriesAPI.getAll();
      
      // Organize categories with subcategories
      const organized = organizeCategories(response.data);
      setCategoriesData(organized);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const organizeCategories = (categories) => {
    // Get parent categories
    const parents = categories.filter(cat => !cat.parent_id);
    
    // Map subcategories to parents
    return parents.map(parent => ({
      ...parent,
      subcategories: categories.filter(cat => cat.parent_id === parent.id)
    }));
  };

  // Icon mapping for categories
  const iconMap = {
    'electronics': Laptop,
    'smartphones-tv': Smartphone,
    'gaming': Gamepad2,
    'appliances': WashingMachine,
    'fashion': Shirt,
    'home-garden': Sofa,
    'sports': Dumbbell,
    'beauty': Sparkles,
    'kids': Baby,
    'pets': Dog
  };

  // Fallback hardcoded structure (in case API fails)
  const categoryStructure = loading ? [] : categoriesData.length > 0 ? categoriesData : [
    {
      id: 'electronics',
      name: 'Ноутбуки та комп\'ютери',
      icon: Laptop,
      subcategories: [
        { id: 'laptops', name: 'Ноутбуки' },
        { id: 'computers', name: 'Комп\'ютери' },
        { id: 'monitors', name: 'Монітори' },
        { id: 'keyboards', name: 'Клавіатури та миші' },
        { id: 'storage', name: 'Накопичувачі даних' }
      ]
    },
    {
      id: 'smartphones',
      name: 'Смартфони, ТВ і електроніка',
      icon: Smartphone,
      subcategories: [
        { id: 'smartphones', name: 'Мобільні телефони' },
        { id: 'tablets', name: 'Планшети' },
        { id: 'tvs', name: 'Телевізори' },
        { id: 'audio', name: 'Аудіотехніка' },
        { id: 'accessories', name: 'Аксесуари для гаджетів' }
      ]
    },
    {
      id: 'gaming',
      name: 'Товари для геймерів',
      icon: Gamepad2,
      subcategories: [
        { id: 'consoles', name: 'Ігрові консолі' },
        { id: 'games', name: 'Відеоігри' },
        { id: 'gaming-chairs', name: 'Геймерські крісла' },
        { id: 'gaming-accessories', name: 'Аксесуари для геймерів' }
      ]
    },
    {
      id: 'appliances',
      name: 'Побутова техніка',
      icon: WashingMachine,
      subcategories: [
        { id: 'washing', name: 'Пральні машини' },
        { id: 'refrigerators', name: 'Холодильники' },
        { id: 'vacuums', name: 'Пилососи' },
        { id: 'kitchen', name: 'Техніка для кухні' },
        { id: 'climate', name: 'Клімат техніка' }
      ]
    },
    {
      id: 'fashion',
      name: 'Одяг, взуття та прикраси',
      icon: Shirt,
      subcategories: [
        { id: 'mens-clothing', name: 'Чоловічий одяг' },
        { id: 'womens-clothing', name: 'Жіночий одяг' },
        { id: 'shoes', name: 'Взуття' },
        { id: 'accessories', name: 'Аксесуари' },
        { id: 'jewelry', name: 'Прикраси' }
      ]
    },
    {
      id: 'furniture',
      name: 'Дім, сад і будівництво',
      icon: Sofa,
      subcategories: [
        { id: 'furniture', name: 'Меблі' },
        { id: 'garden', name: 'Сад і город' },
        { id: 'tools', name: 'Інструменти' },
        { id: 'decor', name: 'Декор' },
        { id: 'lighting', name: 'Освітлення' }
      ]
    },
    {
      id: 'sports',
      name: 'Спорт і захоплення',
      icon: Dumbbell,
      subcategories: [
        { id: 'fitness', name: 'Фітнес' },
        { id: 'outdoor', name: 'Туризм' },
        { id: 'cycling', name: 'Велоспорт' },
        { id: 'winter', name: 'Зимові види спорту' },
        { id: 'fishing', name: 'Рибалка' }
      ]
    },
    {
      id: 'beauty',
      name: 'Краса та здоров\'я',
      icon: Sparkles,
      subcategories: [
        { id: 'cosmetics', name: 'Косметика' },
        { id: 'perfume', name: 'Парфумерія' },
        { id: 'haircare', name: 'Догляд за волоссям' },
        { id: 'skincare', name: 'Догляд за шкірою' },
        { id: 'health', name: 'Здоров\'я' }
      ]
    },
    {
      id: 'kids',
      name: 'Дитячі товари',
      icon: Baby,
      subcategories: [
        { id: 'baby-clothes', name: 'Дитячий одяг' },
        { id: 'toys', name: 'Іграшки' },
        { id: 'baby-care', name: 'Догляд за дитиною' },
        { id: 'strollers', name: 'Коляски' },
        { id: 'school', name: 'Шкільні товари' }
      ]
    },
    {
      id: 'pets',
      name: 'Товари для тварин',
      icon: Dog,
      subcategories: [
        { id: 'pet-food', name: 'Корми' },
        { id: 'pet-accessories', name: 'Аксесуари' },
        { id: 'pet-care', name: 'Догляд' },
        { id: 'pet-toys', name: 'Іграшки для тварин' }
      ]
    }
  ];

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleCategoryClick = (categoryId) => {
    navigate(`/products?category=${categoryId}`);
  };

  const handleSubcategoryClick = (subcategoryId) => {
    navigate(`/products?subcategory=${subcategoryId}`);
  };

  return (
    <aside className="w-80 flex-shrink-0 space-y-4">
      {/* Categories */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Завантаження...</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {categoryStructure.map((category) => {
              const IconComponent = iconMap[category.slug] || category.icon || PackageOpen;
              const isExpanded = expandedCategories.includes(category.id);
              const isSelected = selectedCategory === category.id;
            
            return (
              <div key={category.id}>
                {/* Main Category */}
                <div
                  className={`flex items-center justify-between p-4 transition-colors hover:bg-gray-50 cursor-pointer ${
                    isSelected ? 'bg-blue-50' : ''
                  }`}
                >
                  <div 
                    className="flex items-center gap-4 flex-1"
                    onClick={() => handleCategoryClick(category.id)}
                  >
                    <div className={`w-12 h-12 flex items-center justify-center rounded-xl ${
                      isSelected ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      <IconComponent className={`w-7 h-7 ${
                        isSelected ? 'text-blue-600' : 'text-gray-600'
                      }`} />
                    </div>
                    <span className={`font-medium text-left text-sm ${
                      isSelected ? 'text-blue-700' : 'text-gray-800'
                    }`}>
                      {category.name}
                    </span>
                  </div>
                  
                  {/* Expand/Collapse Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCategory(category.id);
                    }}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-gray-600" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-600" />
                    )}
                  </button>
                </div>
                
                {/* Subcategories */}
                {isExpanded && category.subcategories && category.subcategories.length > 0 && (
                  <div className="bg-gray-50 px-4 py-2">
                    {category.subcategories.map((subcategory) => (
                      <button
                        key={subcategory.id}
                        onClick={() => handleSubcategoryClick(subcategory.id)}
                        className="w-full text-left py-2 px-4 text-sm text-gray-700 hover:text-blue-600 hover:bg-white rounded-lg transition-colors"
                      >
                        {subcategory.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
            })}
          </div>
        )}
      </div>
    </aside>
  );
};

export default CategorySidebar;