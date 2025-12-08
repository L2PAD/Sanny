import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight, Gift, Sparkles, Tag } from 'lucide-react';
import axios from 'axios';
import ScrollReveal from '../components/ScrollReveal';

const Promotions = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/promotions`);
      setPromotions(response.data);
    } catch (error) {
      console.error('Failed to fetch promotions:', error);
    } finally {
      setLoading(false);
    }
  };

  const Countdown = ({ endDate }) => {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
      const calculateTimeLeft = () => {
        const difference = new Date(endDate) - new Date();
        
        if (difference > 0) {
          return {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60)
          };
        }
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      };

      const timer = setInterval(() => {
        setTimeLeft(calculateTimeLeft());
      }, 1000);

      return () => clearInterval(timer);
    }, [endDate]);

    if (timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0) {
      return null;
    }

    return (
      <div className="flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
        <Clock className="w-4 h-4" />
        <span>
          {timeLeft.days > 0 && `${timeLeft.days}д `}
          {String(timeLeft.hours).padStart(2, '0')}:
          {String(timeLeft.minutes).padStart(2, '0')}:
          {String(timeLeft.seconds).padStart(2, '0')}
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        
        <div className="container-main relative z-10">
          <ScrollReveal>
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl mb-6 animate-bounce">
                <Gift className="w-10 h-10" />
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
                Акції та знижки
              </h1>
              <p className="text-lg sm:text-xl text-white/90">
                Вигідні пропозиції та спеціальні акції від Y-store
              </p>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-main py-12">

        {/* Promotions Grid */}
        {promotions.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <p className="text-gray-500 text-lg">Акцій поки немає</p>
            <Link to="/" className="text-blue-600 hover:underline mt-4 inline-block">
              Повернутися на головну
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {promotions.map((promo) => (
              <div
                key={promo.id}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group"
              >
                {/* Image */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={promo.image_url}
                    alt={promo.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  
                  {/* Discount Badge */}
                  {promo.discount_text && (
                    <div 
                      className="absolute top-4 right-4 px-4 py-2 rounded-full font-bold text-white shadow-lg"
                      style={{ backgroundColor: promo.badge_color }}
                    >
                      {promo.discount_text}
                    </div>
                  )}
                  
                  {/* Countdown */}
                  {promo.countdown_enabled && promo.countdown_end_date && (
                    <div className="absolute bottom-4 left-4">
                      <Countdown endDate={promo.countdown_end_date} />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3 line-clamp-2">
                    {promo.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {promo.description}
                  </p>
                  
                  {promo.link_url && (
                    <Link
                      to={`/promotion/${promo.id}`}
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold group-hover:gap-3 transition-all"
                    >
                      Детальніше
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Promotions;
