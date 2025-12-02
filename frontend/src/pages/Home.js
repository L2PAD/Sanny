import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { categoriesAPI, productsAPI } from '../utils/api';
import ProductCardCompact from '../components/ProductCardCompact';
import CategorySidebar from '../components/CategorySidebar';
import HeroBanner from '../components/HeroBanner';
import PaymentDeliveryInfo from '../components/PaymentDeliveryInfo';
import TestimonialsSection from '../components/TestimonialsSection';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [categoriesRes, featuredRes, newRes] = await Promise.all([
        categoriesAPI.getAll(),
        productsAPI.getAll({ limit: 12, sort_by: 'popularity' }),
        productsAPI.getAll({ limit: 12, sort_by: 'newest' }),
      ]);
      setCategories(categoriesRes.data);
      setFeaturedProducts(featuredRes.data);
      setNewProducts(newRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryId) => {
    navigate(`/products?category=${categoryId}`);
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      <div className="container-main py-6">
        <div className="flex gap-6">
          {/* Left Sidebar - Categories */}
          <CategorySidebar 
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryClick={handleCategoryClick}
          />

          {/* Right Content */}
          <div className="flex-1">
            {/* Hero Banner */}
            <HeroBanner />

            {/* Featured Products */}
            <section className="mt-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-[#121212]">Найкращі пропозиції для вас</h2>
                <Link 
                  to="/products?sort_by=popularity"
                  className="text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
                >
                  Показати все
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0071E3]"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                  {featuredProducts.slice(0, 12).map((product) => (
                    <ProductCardCompact key={product.id} product={product} />
                  ))}
                </div>
              )}
            </section>

            {/* New Products */}
            <section className="mt-12">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-[#121212]">Новинки</h2>
                <Link 
                  to="/products?sort_by=newest"
                  className="text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
                >
                  Показати все
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0071E3]"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                  {newProducts.slice(0, 12).map((product) => (
                    <ProductCardCompact key={product.id} product={product} />
                  ))}
                </div>
              )}
            </section>

            {/* Testimonials */}
            <section className="mt-12">
              <h2 className="text-3xl font-bold text-center mb-8">Відгуки покупців</h2>
              <TestimonialsSection />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;