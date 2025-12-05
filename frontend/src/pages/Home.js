import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { categoriesAPI, productsAPI } from '../utils/api';
import ProductCardCompact from '../components/ProductCardCompact';
import CategorySidebar from '../components/CategorySidebar';
import HeroBanner from '../components/HeroBanner';
import PopularCategories from '../components/PopularCategories';
import ActualOffers from '../components/ActualOffers';
import PaymentDeliveryInfo from '../components/PaymentDeliveryInfo';
import TestimonialsSection from '../components/TestimonialsSection';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const Home = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [bestsellers, setBestsellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [categoriesRes, featuredRes] = await Promise.all([
        categoriesAPI.getAll(),
        productsAPI.getAll({ limit: 12, sort_by: 'popularity' }),
      ]);
      
      // Получаем бестселлеры
      const bestsellersRes = await productsAPI.getAll({ limit: 12 });
      const bestsellersData = bestsellersRes.data.filter(p => p.is_bestseller) || bestsellersRes.data.slice(0, 8);
      
      setCategories(categoriesRes.data);
      setFeaturedProducts(featuredRes.data);
      setBestsellers(bestsellersData);
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
          {/* Left Sidebar - Categories - только на десктопе */}
          <div className="hidden lg:block">
            <CategorySidebar 
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryClick={handleCategoryClick}
            />
          </div>

          {/* Right Content */}
          <div className="flex-1">
            {/* Hero Banner */}
            <HeroBanner />

            {/* Featured Products */}
            <section className="mt-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-[#121212]">{t('featuredProducts')}</h2>
                <Link 
                  to="/products?sort_by=popularity"
                  className="text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
                >
                  {t('viewAll')}
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

            {/* Popular Categories - под товарами */}
            <div className="mt-8">
              <PopularCategories categories={categories} />
            </div>

            {/* Actual Offers - актуальні пропозиції */}
            <div className="mt-8">
              <ActualOffers />
            </div>

            {/* New Products */}
            <section className="mt-12">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-[#121212]">{t('language') === 'ru' ? 'Новинки' : 'Новинки'}</h2>
                <Link 
                  to="/products?sort_by=newest"
                  className="text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
                >
                  {t('viewAll')}
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

            {/* Testimonials - ОДИН РАЗ */}
            <section className="mt-12">
              <TestimonialsSection />
            </section>
          </div>
        </div>
      </div>

      {/* Payment & Delivery Info Section */}
      <PaymentDeliveryInfo />
    </div>
  );
};

export default Home;
