import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const HeroBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSlides();
  }, []);

  useEffect(() => {
    if (slides.length === 0) return;
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    
    return () => clearInterval(timer);
  }, [slides.length]);

  const fetchSlides = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/slides`);
      
      if (response.data.length === 0) {
        // Fallback to default slides if none configured
        setSlides([
          {
            id: 1,
            title: 'НОУТБУКИ ДЛЯ ТРИВАЛОЇ РОБОТИ',
            subtitle: 'ІЗ ЗАРЯДЖАННЯМ USB',
            background_gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            type: 'banner'
          }
        ]);
      } else {
        setSlides(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch slides:', error);
      // Fallback slides
      setSlides([
        {
          id: 1,
          title: 'НОУТБУКИ ДЛЯ ТРИВАЛОЇ РОБОТИ',
          subtitle: 'ІЗ ЗАРЯДЖАННЯМ USB',
          background_gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          type: 'banner'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleSlideClick = (slide) => {
    if (slide.button_link) {
      if (slide.button_link.startsWith('http')) {
        window.open(slide.button_link, '_blank');
      } else {
        navigate(slide.button_link);
      }
    } else if (slide.type === 'product' && slide.product_id) {
      navigate(`/product/${slide.product_id}`);
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
      <div className="flex items-center gap-4 bg-black/30 backdrop-blur-md px-6 py-3 rounded-full">
        <Clock className="w-5 h-5" />
        <div className="flex gap-3">
          {timeLeft.days > 0 && (
            <div className="text-center">
              <div className="text-2xl font-bold">{timeLeft.days}</div>
              <div className="text-xs opacity-80">дней</div>
            </div>
          )}
          <div className="text-center">
            <div className="text-2xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</div>
            <div className="text-xs opacity-80">часов</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{String(timeLeft.minutes).padStart(2, '0')}</div>
            <div className="text-xs opacity-80">минут</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{String(timeLeft.seconds).padStart(2, '0')}</div>
            <div className="text-xs opacity-80">секунд</div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="relative w-full h-[400px] rounded-2xl overflow-hidden bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse"></div>
    );
  }

  if (slides.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full h-[400px] rounded-2xl overflow-hidden">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-500 cursor-pointer ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ background: slide.background_gradient }}
          onClick={() => handleSlideClick(slide)}
        >
          <div className="flex items-center justify-center h-full text-white relative">
            {/* Промо текст в углу */}
            {slide.promo_text && (
              <div className="absolute top-6 right-6 bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-lg shadow-lg">
                {slide.promo_text}
              </div>
            )}

            {/* Основной контент */}
            <div className="text-center px-6">
              {slide.type === 'banner' && slide.image_url && (
                <img 
                  src={slide.image_url} 
                  alt={slide.title}
                  className="mx-auto mb-6 max-h-48 object-contain"
                />
              )}
              
              <h2 className="text-5xl font-bold mb-3 drop-shadow-lg">
                {slide.title}
              </h2>
              
              {slide.subtitle && (
                <p className="text-2xl mb-4 opacity-90">{slide.subtitle}</p>
              )}
              
              {slide.description && (
                <p className="text-lg opacity-80 mb-6">{slide.description}</p>
              )}

              {/* Обратный отсчет */}
              {slide.countdown_enabled && slide.countdown_end_date && (
                <div className="flex justify-center mb-6">
                  <Countdown endDate={slide.countdown_end_date} />
                </div>
              )}

              {/* Кнопка действия */}
              {slide.button_text && (
                <button 
                  className="bg-white text-gray-900 px-8 py-3 rounded-full font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSlideClick(slide);
                  }}
                >
                  {slide.button_text}
                </button>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/30 hover:bg-white/50 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors z-10"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/30 hover:bg-white/50 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors z-10"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </>
      )}

      {/* Dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentSlide
                  ? 'bg-white w-8'
                  : 'bg-white/50 w-2'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroBanner;
