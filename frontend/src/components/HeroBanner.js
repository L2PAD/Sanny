import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const HeroBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      title: 'НОУТБУКИ ДЛЯ ТРИВАЛОЇ РОБОТИ',
      subtitle: 'ІЗ ЗАРЯДЖАННЯМ USB',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      image: '🖥️'
    },
    {
      id: 2,
      title: 'НАЙКРАЩІ ЦІНИ',
      subtitle: 'НА ЕЛЕКТРОНІКУ',
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      image: '💳'
    },
    {
      id: 3,
      title: 'ДОСТАВКА ЗА 2 ГОДИНИ',
      subtitle: 'ПО ВСІЙ УКРАЇНІ',
      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      image: '🚚'
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="relative w-full h-[400px] rounded-2xl overflow-hidden">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-500 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ background: slide.background }}
        >
          <div className="flex items-center justify-center h-full text-white">
            <div className="text-center">
              <div className="text-8xl mb-4">{slide.image}</div>
              <h2 className="text-4xl font-bold mb-2">{slide.title}</h2>
              <p className="text-2xl">{slide.subtitle}</p>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/30 hover:bg-white/50 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/30 hover:bg-white/50 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors"
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentSlide
                ? 'bg-white w-8'
                : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroBanner;
