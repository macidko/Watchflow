import React, { useState, useRef, useEffect } from 'react';
import Card from './Card';

const Slider = ({ title, items = [], onCardClick, onCardMove, sliderId }) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);
  const [draggedItem, setDraggedItem] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const sliderRef = useRef(null);

  useEffect(() => {
    const updateScrollInfo = () => {
      const slider = sliderRef.current;
      if (slider) {
        const newMaxScroll = slider.scrollWidth - slider.clientWidth;
        setMaxScroll(newMaxScroll);
        setCanScrollLeft(scrollPosition > 0);
        setCanScrollRight(scrollPosition < newMaxScroll);
      }
    };

    updateScrollInfo();
    window.addEventListener('resize', updateScrollInfo);
    
    return () => window.removeEventListener('resize', updateScrollInfo);
  }, [items, scrollPosition]);

  const scroll = (direction) => {
    const slider = sliderRef.current;
    if (!slider) return;

    const scrollAmount = 300;
    const newPosition = direction === 'left' 
      ? Math.max(0, scrollPosition - scrollAmount)
      : scrollPosition + scrollAmount;

    const finalPosition = Math.min(newPosition, maxScroll);

    slider.scrollTo({
      left: finalPosition,
      behavior: 'smooth'
    });

    setScrollPosition(finalPosition);
  };

  const handleScroll = () => {
    const slider = sliderRef.current;
    if (slider) {
      setScrollPosition(slider.scrollLeft);
    }
  };

  // Drag and drop handlers
  const handleCardDragStart = (item, sourceSlider) => {
    setDraggedItem({ item, sourceSlider });
  };

  const handleCardDragEnd = () => {
    setDraggedItem(null);
    setIsDragOver(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      
      if (data.sourceSlider !== sliderId && onCardMove) {
        onCardMove(data.item, data.sourceSlider, sliderId);
      }
    } catch (error) {
      console.error('Drop parsing error:', error);
    }
    
    setDraggedItem(null);
  };

  return (
    <div className="mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 px-1">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            {title}
          </h2>
          <div className="px-3 py-1 bg-gradient-to-r from-orange-500/20 to-red-600/20 border border-orange-500/30 rounded-full">
            <span className="text-sm font-medium text-orange-400">{items.length}</span>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex gap-2">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-300 ${
              canScrollLeft
                ? 'bg-white/5 hover:bg-white/10 border-gray-600 text-gray-300 hover:text-white hover:border-gray-500'
                : 'bg-gray-800/50 border-gray-700 text-gray-600 cursor-not-allowed'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-300 ${
              canScrollRight
                ? 'bg-white/5 hover:bg-white/10 border-gray-600 text-gray-300 hover:text-white hover:border-gray-500'
                : 'bg-gray-800/50 border-gray-700 text-gray-600 cursor-not-allowed'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Slider Container */}
      <div 
        className={`relative rounded-2xl border-2 border-dashed transition-all duration-500 min-h-80 ${
          isDragOver 
            ? 'border-orange-500 bg-orange-500/5 shadow-2xl shadow-orange-500/10' 
            : 'border-gray-700/50 bg-gradient-to-br from-gray-900/20 to-gray-800/20'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {items.length === 0 ? (
          /* Empty State */
          <div className="flex items-center justify-center h-80 text-center">
            <div className="max-w-sm">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-300 mb-2">Liste Boş</h3>
              <p className="text-sm text-gray-500 mb-4">
                Henüz bu kategoride içerik yok. Arama yaparak içerik ekleyebilir veya başka listelerden sürükleyebilirsiniz.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500/20 to-red-600/20 border border-orange-500/30 rounded-lg text-orange-400 text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Sürükle & Bırak
              </div>
            </div>
          </div>
        ) : (
          /* Content Grid */
          <div 
            ref={sliderRef}
            className="flex gap-6 p-6 overflow-x-auto scrollbar-hide scroll-smooth"
            onScroll={handleScroll}
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          >
            {items.map((item, index) => (
              <Card
                key={item.id || index}
                item={item}
                onClick={onCardClick}
                onDragStart={handleCardDragStart}
                onDragEnd={handleCardDragEnd}
                isDragging={draggedItem?.item?.id === item.id}
                sliderId={sliderId}
              />
            ))}
          </div>
        )}

        {/* Drop Zone Indicator */}
        {isDragOver && (
          <div className="absolute inset-4 border-2 border-orange-500 rounded-xl bg-orange-500/5 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-orange-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
              <p className="text-orange-400 font-medium">Buraya Bırak</p>
              <p className="text-orange-300/70 text-sm mt-1">Kart "{title}" listesine taşınacak</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Slider;
