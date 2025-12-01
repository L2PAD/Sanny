import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, TrendingUp, Shield, ChevronRight } from 'lucide-react';
import { categoriesAPI, productsAPI } from '../utils/api';
import ProductCard from '../components/ProductCard';
import { Button } from '../components/ui/button';
import { useLanguage } from '../contexts/LanguageContext';
import TestimonialsSection from '../components/TestimonialsSection';

const Home = () => {
  const { t } = useLanguage();
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div data-testid="home-page" className="min-h-screen">
      {/* Hero Banner Slider - место для слайдера баннеров */}
      <section className="bg-gradient-to-br from-[#0071E3] to-[#0051c3] py-12 md:py-20">
        <div className="container-main">
          <div className="max-w-4xl mx-auto text-center text-white space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              Найкращі ціни на техніку
            </h1>
            <p className="text-lg sm:text-xl opacity-90 max-w-2xl mx-auto">
              Широкий асортимент товарів з офіційною гарантією
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Link to="/products">
                <Button size="lg" className="bg-white text-[#0071E3] hover:bg-gray-100 text-lg px-8">
                  Переглянути каталог
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Category Links */}
      {categories.length > 0 && (
        <section className="py-6 bg-white border-b border-gray-200">
          <div className="container-main">
            <div className="flex flex-wrap justify-center gap-4">
              {categories.slice(0, 8).map((category) => (
                <Link
                  key={category.id}
                  to={`/products?category=${category.id}`}
                  className="px-6 py-2 bg-gray-100 hover:bg-[#0071E3] hover:text-white rounded-full transition-colors text-sm font-medium"
                >
                  {category.name}
                </Link>
              ))}
              {categories.length > 8 && (
                <Link
                  to="/products"
                  className="px-6 py-2 bg-gray-100 hover:bg-[#0071E3] hover:text-white rounded-full transition-colors text-sm font-medium flex items-center gap-1"
                >
                  Все категории
                  <ChevronRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products - Хіти продажів */}
      <section className="py-12 bg-[#F7F7F7]">
        <div className="container-main">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-[#121212]">Хіти продажів</h2>
            <Link to="/products?sort_by=popularity">
              <Button variant="ghost" className="gap-2">
                Показати все
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0071E3]"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* New Products - Новинки */}
      <section className="py-12 bg-white">
        <div className="container-main">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-[#121212]">Новинки</h2>
            <Link to="/products?sort_by=newest">
              <Button variant="ghost" className="gap-2">
                Показати все
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0071E3]"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
              {newProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 bg-[#F7F7F7]">
        <div className="container-main">
          <h2 className="text-3xl font-bold text-center mb-8">Відгуки покупців</h2>
          <TestimonialsSection />
        </div>
      </section>

      {/* Features Section - перенесено вниз */}
      <section className="py-16 bg-white">
        <div className="container-main">
          <h2 className="text-3xl font-bold text-center mb-12">Чому обирають нас</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-[#0071E3]/10 rounded-2xl flex items-center justify-center mx-auto">
                <Sparkles className="w-8 h-8 text-[#0071E3]" />
              </div>
              <h3 className="text-xl font-semibold">Якісні товари</h3>
              <p className="text-gray-600 text-sm">Офіційна гарантія на всі товари</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-[#0071E3]/10 rounded-2xl flex items-center justify-center mx-auto">
                <TrendingUp className="w-8 h-8 text-[#0071E3]" />
              </div>
              <h3 className="text-xl font-semibold">Кращі ціни</h3>
              <p className="text-gray-600 text-sm">Конкурентні ціни та регулярні акції</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-[#0071E3]/10 rounded-2xl flex items-center justify-center mx-auto">
                <Shield className="w-8 h-8 text-[#0071E3]" />
              </div>
              <h3 className="text-xl font-semibold">Безпечна оплата</h3>
              <p className="text-gray-600 text-sm">Захищені транзакції та різні способи оплати</p>
            </div>
          </div>
        </div>
      </section>

      {/* Short About Section */}
      <section className="py-12 bg-[#F7F7F7]">
        <div className="container-main">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <h2 className="text-3xl font-bold">Marketplace — ваш надійний партнер</h2>
            <p className="text-gray-600">
              Великий асортимент техніки та електроніки за вигідними цінами. 
              Офіційна гарантія, швидка доставка по Україні та професійна консультація.
            </p>
            <Link to="/products">
              <Button size="lg" className="mt-4">
                Почати покупки
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;