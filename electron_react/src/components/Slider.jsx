import React, { useState, useRef, useEffect } from 'react';
import Card from './Card';
import CardSkeleton from './CardSkeleton';

const Slider = ({ title, items = [], onCardClick, onCardMove, sliderId, isLoading = false }) => {
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
    <div className="mb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 px-0 sm:px-1 gap-2">
        <div className="flex items-center gap-2 sm:gap-3">
          <h2 className="text-xl font-semibold text-neutral-100 relative">
            {title}
            <div className="absolute -bottom-1 left-0 h-0.5 w-8 rounded-full" style={{ backgroundColor: 'color-mix(in srgb, var(--accent) 60%, transparent)' }}></div>
          </h2>
          <div className="px-2.5 py-1 rounded-full border transition-colors duration-200" style={{ backgroundColor: 'var(--accent)', borderColor: 'color-mix(in srgb, var(--accent) 30%, transparent)' }}>
            <span className="text-sm font-normal text-black">{items.length}</span>
          </div>
        </div>

        {/* Navigation Controls */}
  <div className="flex gap-1 sm:gap-2">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-300 ${
              canScrollLeft
                ? 'bg-[color:var(--accent)/.2] hover:bg-[color:var(--accent)/.3] border-[color:var(--accent)/.5] text-[color:var(--accent)] hover:text-[color:var(--accent)] hover:border-[color:var(--accent)]'
                : 'bg-neutral-800/50 border-neutral-700 text-neutral-600 cursor-not-allowed'
            }`}
          >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-label="Sola kaydır" focusable="false">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-300 ${
              canScrollRight
                ? 'bg-[color:var(--accent)/.2] hover:bg-[color:var(--accent)/.3] border-[color:var(--accent)/.5] text-[color:var(--accent)] hover:text-[color:var(--accent)] hover:border-[color:var(--accent)]'
                : 'bg-neutral-800/50 border-neutral-700 text-neutral-600 cursor-not-allowed'
            }`}
          >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-label="Sağa kaydır" focusable="false">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

  {/* Slider Container */}
      <div
        className={`relative rounded-2xl border-2 border-dashed transition-all duration-300 min-h-80 ${
          isDragOver
            ? 'shadow-[var(--card-shadow,0_6px_18px_rgba(0,0,0,0.18))]'
            : 'border-neutral-700/50 bg-neutral-800/10'
        }`}
        style={isDragOver ? { borderColor: 'var(--accent)', backgroundColor: 'color-mix(in srgb, var(--accent) 10%, transparent)' } : {}}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isLoading ? (
          /* Loading skeleton */
          <div className="p-5 grid grid-flow-col gap-5 overflow-x-auto">
            {[1,2,3,4,5].map(n => (
              <CardSkeleton key={n} />
            ))}
          </div>
        ) : items.length === 0 ? (
          /* Empty State */
          <div className="flex items-center justify-center h-80 text-center">
            <div className="max-w-sm">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-neutral-800 flex items-center justify-center">
                <svg className="w-8 h-8 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-label="Boş" focusable="false">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-normal text-neutral-300 mb-2">Liste Boş</h3>
              <p className="text-sm text-neutral-500 mb-4">
                Henüz bu kategoride içerik yok. Arama yaparak içerik ekleyebilir veya başka listelerden sürükleyebilirsiniz.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-lime-500/20 border border-lime-500/30 rounded-lg text-lime-400 text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--accent)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span style={{ color: 'var(--accent)' }}>Sürükle & Bırak</span>
              </div>
            </div>
          </div>
        ) : (
          /* Content Grid */
          <div 
            ref={sliderRef}
            className="flex gap-5 p-5 overflow-x-auto scrollbar-hide scroll-smooth"
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
              <p className="text-orange-400 font-normal">Buraya Bırak</p>
              <p className="text-orange-300/70 text-sm mt-1">Kart "{title}" listesine taşınacak</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Slider;
