import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, TrendingUp, Shield } from 'lucide-react';
import { categoriesAPI, productsAPI } from '../utils/api';
import ProductCard from '../components/ProductCard';
import { Button } from '../components/ui/button';
import { useLanguage } from '../contexts/LanguageContext';

const Home = () => {
  const { t } = useLanguage();
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [categoriesRes, productsRes] = await Promise.all([
        categoriesAPI.getAll(),
        productsAPI.getAll({ limit: 8 }),
      ]);
      setCategories(categoriesRes.data);
      setFeaturedProducts(productsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid="home-page" className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-section py-20">
        <div className="container-main">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 data-testid="hero-title" className="text-5xl sm:text-6xl lg:text-7xl font-bold text-[#121212] leading-tight">
              {t('heroTitle')}
              <span className="block text-[#0071E3]">{t('heroTitleHighlight')}</span>
            </h1>
            <p data-testid="hero-description" className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              {t('heroDescription')}
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Link to="/products">
                <Button data-testid="browse-products-button" size="lg" className="text-lg px-8">
                  Browse Products
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/register?role=seller">
                <Button data-testid="become-seller-button" size="lg" variant="outline" className="text-lg px-8">
                  Become a Seller
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container-main">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div data-testid="feature-quality" className="text-center space-y-4">
              <div className="w-16 h-16 bg-[#0071E3]/10 rounded-2xl flex items-center justify-center mx-auto">
                <Sparkles className="w-8 h-8 text-[#0071E3]" />
              </div>
              <h3 className="text-xl font-semibold">Quality Products</h3>
              <p className="text-gray-600">Verified sellers offering authentic products with quality guarantee</p>
            </div>
            <div data-testid="feature-prices" className="text-center space-y-4">
              <div className="w-16 h-16 bg-[#0071E3]/10 rounded-2xl flex items-center justify-center mx-auto">
                <TrendingUp className="w-8 h-8 text-[#0071E3]" />
              </div>
              <h3 className="text-xl font-semibold">Best Prices</h3>
              <p className="text-gray-600">Competitive pricing across thousands of products from multiple sellers</p>
            </div>
            <div data-testid="feature-secure" className="text-center space-y-4">
              <div className="w-16 h-16 bg-[#0071E3]/10 rounded-2xl flex items-center justify-center mx-auto">
                <Shield className="w-8 h-8 text-[#0071E3]" />
              </div>
              <h3 className="text-xl font-semibold">Secure Payment</h3>
              <p className="text-gray-600">Safe and secure transactions with multiple payment options</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      {categories.length > 0 && (
        <section className="py-16 bg-[#F7F7F7]">
          <div className="container-main">
            <div className="flex justify-between items-center mb-8">
              <h2 data-testid="categories-title" className="text-3xl font-bold">Shop by Category</h2>
              <Link to="/products">
                <Button data-testid="view-all-categories-button" variant="ghost">
                  View All
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="category-grid">
              {categories.slice(0, 8).map((category) => (
                <Link
                  key={category.id}
                  data-testid={`category-card-${category.slug}`}
                  to={`/products?category=${category.id}`}
                  className="bg-white rounded-xl p-6 hover:shadow-lg text-center group"
                >
                  <div className="w-16 h-16 bg-[#F7F7F7] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[#0071E3]/10">
                    {category.image_url ? (
                      <img src={category.image_url} alt={category.name} className="w-10 h-10 object-cover" />
                    ) : (
                      <span className="text-3xl">📦</span>
                    )}
                  </div>
                  <h3 className="font-medium group-hover:text-[#0071E3]">{category.name}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products Section */}
      <section className="py-16 bg-white">
        <div className="container-main">
          <div className="flex justify-between items-center mb-8">
            <h2 data-testid="featured-title" className="text-3xl font-bold">Featured Products</h2>
            <Link to="/products">
              <Button data-testid="view-all-products-button" variant="ghost">
                View All
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
          {loading ? (
            <div className="product-grid">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="skeleton h-96 rounded-2xl"></div>
              ))}
            </div>
          ) : (
            <div className="product-grid">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#0071E3] text-white">
        <div className="container-main text-center space-y-6">
          <h2 data-testid="cta-title" className="text-4xl font-bold">Ready to Start Selling?</h2>
          <p data-testid="cta-description" className="text-xl opacity-90 max-w-2xl mx-auto">
            Join thousands of successful sellers on our platform. Create your store and start earning today.
          </p>
          <Link to="/register?role=seller">
            <Button data-testid="cta-button" size="lg" variant="secondary" className="text-lg px-8">
              Get Started Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;