import React, { useState, useRef, useEffect } from 'react';
import Card from './Card';

const Slider = ({ title, items = [], onCardClick }) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);
  const sliderRef = useRef(null);

  useEffect(() => {
    const updateScrollInfo = () => {
      const slider = sliderRef.current;
      if (slider) {
        setMaxScroll(slider.scrollWidth - slider.clientWidth);
      }
    };

    updateScrollInfo();
    window.addEventListener('resize', updateScrollInfo);
    
    return () => window.removeEventListener('resize', updateScrollInfo);
  }, [items]);

  const scroll = (direction) => {
    const slider = sliderRef.current;
    if (!slider) return;

    console.log(`Scrolling ${direction}, current position: ${scrollPosition}`);
    
    const scrollAmount = 300; // Her tıklamada kaydırılacak miktar
    const newPosition = direction === 'left' 
      ? Math.max(0, scrollPosition - scrollAmount)
      : scrollPosition + scrollAmount;

    const finalPosition = Math.min(newPosition, maxScroll);
    
    console.log(`New position: ${finalPosition}, max scroll: ${maxScroll}`);

    slider.scrollTo({
      left: finalPosition,
      behavior: 'smooth'
    });

    setScrollPosition(finalPosition);
  };

  const canScrollLeft = scrollPosition > 0;
  const canScrollRight = scrollPosition < maxScroll;

  return (
    <div className="w-full mb-8">
      {/* Başlık Satırı */}
      <div className="flex items-center justify-between mb-4 px-6">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
      </div>

      {/* Slider Satırı */}
      <div className="relative">
        {/* Sol Ok Butonu */}
        <button
          onClick={() => scroll('left')}
          className={`absolute left-2 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/80 hover:bg-black/95 transition-all duration-200 flex items-center justify-center shadow-lg ${
            !canScrollLeft ? 'opacity-40 cursor-not-allowed' : 'opacity-90 hover:opacity-100'
          }`}
          disabled={!canScrollLeft}
          style={{ pointerEvents: 'auto' }}
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Sağ Ok Butonu */}
        <button
          onClick={() => scroll('right')}
          className={`absolute right-2 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/80 hover:bg-black/95 transition-all duration-200 flex items-center justify-center shadow-lg ${
            !canScrollRight ? 'opacity-40 cursor-not-allowed' : 'opacity-90 hover:opacity-100'
          }`}
          disabled={!canScrollRight}
          style={{ pointerEvents: 'auto' }}
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Slider Container */}
        <div
          ref={sliderRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide px-6 py-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onScroll={(e) => setScrollPosition(e.target.scrollLeft)}
        >
          {items.map((item, index) => (
            <Card 
              key={index} 
              item={item} 
              onClick={onCardClick}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide {
          -webkit-overflow-scrolling: touch;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default Slider;
