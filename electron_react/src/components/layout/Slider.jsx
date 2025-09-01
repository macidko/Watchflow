import React, { useState, useRef, useEffect } from 'react';
import Card from '../ui/Card';
import CardSkeleton from '../ui/CardSkeleton';
import { useDrag } from '../../contexts/DragContext';
import { t } from '../../i18n';

const Slider = ({ title, items = [], onCardClick, onCardMove, sliderId, isLoading = false, onQuickMove, rootRef }) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);
  const [draggedItem, setDraggedItem] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const sliderRef = useRef(null);
  const { isDragging: globalDrag, sourceSliderId, endDrag } = useDrag();


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
  // finalize global drag state after successful drop handling
  if (typeof endDrag === 'function') endDrag();
  };

  // Compact view during global drag operations
  if (globalDrag && sourceSliderId !== sliderId) {
    return (
      <div 
        ref={rootRef}
        className="slider-compact-item"
        style={{
          position: 'relative',
          height: '120px',
          minHeight: '120px',
          maxHeight: '120px',
          borderRadius: '12px',
          border: isDragOver 
            ? '2px solid var(--accent-color)' 
            : '1px solid color-mix(in srgb, var(--border-color) 40%, var(--accent-color))',
          background: isDragOver
            ? 'linear-gradient(135deg, color-mix(in srgb, var(--accent-color) 8%, var(--card-bg)), color-mix(in srgb, var(--accent-color) 4%, var(--secondary-bg)))'
            : 'linear-gradient(135deg, var(--card-bg), color-mix(in srgb, var(--secondary-bg) 60%, var(--card-bg)))',
          boxShadow: isDragOver 
            ? '0 8px 32px color-mix(in srgb, var(--accent-color) 25%, transparent), 0 4px 16px rgba(0,0,0,0.1)'
            : '0 4px 16px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.1)',
          cursor: 'pointer',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isHovered ? 'translateY(-1px) scale(1.01)' : 'none',
          overflow: 'hidden',
          backdropFilter: 'blur(8px)',
          opacity: isDragOver ? 1 : 0.92
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Header */}
        <div style={{
          padding: '12px 16px 8px',
          borderBottom: '1px solid color-mix(in srgb, var(--border-color) 30%, transparent)',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.05), transparent)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
              <div style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: isDragOver ? 'var(--accent-color)' : 'color-mix(in srgb, var(--accent-color) 60%, var(--secondary-text))',
                flexShrink: 0
              }} />
              <h3 style={{
                fontSize: '13px',
                fontWeight: '600',
                color: isDragOver ? 'var(--accent-color)' : 'var(--primary-text)',
                margin: 0,
                lineHeight: '1.2',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {React.isValidElement(title) ? 
                  title.props.children || 'Slider' : 
                  (typeof title === 'string' ? title : 'Slider')
                }
              </h3>
            </div>
            {items.length > 0 && (
              <div style={{
                padding: '2px 6px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: '600',
                color: isDragOver ? 'var(--accent-color)' : 'var(--secondary-text)',
                background: isDragOver 
                  ? 'color-mix(in srgb, var(--accent-color) 20%, transparent)'
                  : 'color-mix(in srgb, var(--secondary-text) 10%, transparent)',
                border: `1px solid ${isDragOver ? 'color-mix(in srgb, var(--accent-color) 30%, transparent)' : 'color-mix(in srgb, var(--border-color) 50%, transparent)'}`,
                flexShrink: 0
              }}>
                {items.length}
              </div>
            )}
          </div>
        </div>

        {/* Content area */}
        <div style={{
          padding: '12px 16px',
          height: 'calc(100% - 60px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {isDragOver ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '24px',
                height: '24px',
                margin: '0 auto 6px',
                borderRadius: '50%',
                background: 'var(--accent-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="12" height="12" fill="none" stroke="white" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
              <span style={{
                fontSize: '12px',
                fontWeight: '600',
                color: 'var(--accent-color)',
                display: 'block'
              }}>
                Buraya Bırak
              </span>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              gap: '4px',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0.6
            }}>
              {[1,2,3].map(i => (
                <div key={i} style={{
                  width: '16px',
                  height: '20px',
                  borderRadius: '3px',
                  background: 'color-mix(in srgb, var(--secondary-text) 25%, transparent)',
                  border: '1px solid color-mix(in srgb, var(--border-color) 40%, transparent)'
                }} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
  <div ref={rootRef} className={`slider-root ${sourceSliderId === sliderId ? 'is-source' : ''} mb-10`}>
      {/* Header */}
        <div className="flex items-center justify-between mb-5 px-0 sm:px-1 gap-2">
        <div className="flex items-center gap-2 sm:gap-3">
          <div role="heading" aria-level={2} className="slider-title" style={{ fontSize: 20, fontWeight: 600, color: 'var(--primary-text)', position: 'relative' }}>
            {title}
            <div style={{ position: 'absolute', left: 0, bottom: -4, height: 3, width: 32, borderRadius: 4, background: 'color-mix(in srgb, var(--accent-color) 60%, transparent)' }} />
          </div>
          <div style={{ padding: '4px 12px', borderRadius: 999, border: '1px solid color-mix(in srgb, var(--accent-color) 30%, transparent)', background: 'var(--accent-color)', transition: 'background 0.2s, border 0.2s' }}>
            <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--primary-text)' }}>{items.length}</span>
          </div>
        </div>

        {/* Navigation Controls */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={() => scroll('left')}
          disabled={!canScrollLeft}
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `1px solid ${canScrollLeft ? 'color-mix(in srgb, var(--accent-color) 50%, transparent)' : 'var(--border-color)'}`,
            background: canScrollLeft ? 'color-mix(in srgb, var(--accent-color) 12%, transparent)' : 'var(--secondary-bg)',
            color: canScrollLeft ? 'var(--accent-color)' : 'var(--secondary-text)',
            cursor: canScrollLeft ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s'
          }}
        >
          <svg width={20} height={20} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-label="Sola kaydır" focusable="false">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={() => scroll('right')}
          disabled={!canScrollRight}
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `1px solid ${canScrollRight ? 'color-mix(in srgb, var(--accent-color) 50%, transparent)' : 'var(--border-color)'}`,
            background: canScrollRight ? 'color-mix(in srgb, var(--accent-color) 12%, transparent)' : 'var(--secondary-bg)',
            color: canScrollRight ? 'var(--accent-color)' : 'var(--secondary-text)',
            cursor: canScrollRight ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s'
          }}
        >
          <svg width={20} height={20} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-label="Sağa kaydır" focusable="false">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      </div>

  {/* Slider Container */}
      <div
        className={`relative rounded-2xl border-2 border-dashed transition-all duration-300 min-h-80`}
        style={isDragOver ? { borderColor: 'var(--accent-color)', backgroundColor: 'color-mix(in srgb, var(--accent-color) 10%, transparent)', boxShadow: 'var(--card-shadow)' } : { borderColor: 'var(--border-color)', background: 'var(--secondary-bg-transparent)' }}
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
        ) : items.length === 0 && !isDragOver ? (
          /* Empty State - sadece drag over olmadığında göster */
          <div className="flex items-center justify-center h-80 text-center">
            <div className="max-w-sm">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl" style={{ background: 'var(--card-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-label="Boş" focusable="false" style={{ color: 'var(--secondary-text)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-normal mb-2" style={{ color: 'var(--primary-text)' }}>{t('components.slider.emptyState.title')}</h3>
              <p className="text-sm mb-4" style={{ color: 'var(--secondary-text)' }}>
                {t('components.slider.emptyState.description')}
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm" style={{ background: 'color-mix(in srgb, var(--accent-color) 12%, transparent)', border: '1px solid color-mix(in srgb, var(--accent-color) 20%, transparent)', color: 'var(--accent-color)' }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--accent-color)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span style={{ color: 'var(--accent-color)' }}>{t('components.slider.emptyState.dragDrop')}</span>
              </div>
            </div>
          </div>
        ) : items.length === 0 && isDragOver ? (
          /* Boş slider drag over durumu - sadece drop zone göster */
          <div className="h-80"></div>
        ) : (
          /* Content Grid */
          <div 
            ref={sliderRef}
            className="slider-content flex gap-5 p-5 overflow-x-auto scrollbar-hide scroll-smooth"
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
                isDragging={draggedItem?.item?.id === item.id && !globalDrag}
                sliderId={sliderId}
                onQuickMove={onQuickMove}
              />
            ))}
          </div>
        )}

        {/* Drop Zone Indicator */}
        {isDragOver && (
          <div className="absolute inset-4 rounded-xl flex items-center justify-center pointer-events-none" style={{ border: '1px solid var(--accent-color)', background: 'color-mix(in srgb, var(--accent-color) 6%, transparent)' }}>
            <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent-color)' }}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--primary-text)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
                <p className="font-normal" style={{ color: 'var(--accent-color)' }}>Buraya Bırak</p>
                <span className="text-sm mt-1" style={{ color: 'var(--hover-color)' }}>Kart "{title}" listesine taşınacak</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Slider;
