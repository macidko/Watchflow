import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardSkeleton } from '../ui/Card';
import useDynamicSliderController from '../../hooks/useDynamicSliderController';
import { t } from '../../i18n';
import { LAYOUT_MODES } from '../../config/layoutConfig';

// Helper function to parse title from various formats
const parseTitle = (title) => {
  if (React.isValidElement(title)) {
    return title.props?.children || 'Slider';
  }
  if (typeof title === 'string') {
    return title;
  }
  return 'Slider';
};

const DynamicSlider = ({ 
  title, 
  items = [], 
  onCardClick, 
  onCardMove, 
  sliderId, 
  isLoading = false, 
  onQuickMove, 
  rootRef,
  customLayout = null,
  onShowAll = null // Tümünü göster callback'i
}) => {
  const {
    draggedItem,
    isDragOver,
    canScrollLeft,
    canScrollRight,
    isHovered,
    setIsHovered,
    sliderRef,
    globalDrag,
    sourceSliderId,
    activeLayout,
    layoutCSS,
    scroll,
    handleScroll,
    handleCardDragStart,
    handleCardDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop
  } = useDynamicSliderController({ items, sliderId, customLayout });

  // Render different layout modes
  const renderLayoutContent = () => {
    switch (activeLayout.mode) {
      case LAYOUT_MODES.GRID:
        return renderGridLayout();
      case LAYOUT_MODES.LIST:
        return renderListLayout();
      default:
        return renderSliderLayout();
    }
  };

  const renderSliderLayout = () => (
    <div 
      ref={sliderRef}
      className="slider-content flex overflow-x-auto scrollbar-hide scroll-smooth"
      onScroll={handleScroll}
      style={{
        gap: layoutCSS['--layout-gap'],
        padding: layoutCSS['--layout-padding'],
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
          size={activeLayout.cardSize}
          variant={activeLayout.style}
        />
      ))}
    </div>
  );

  const renderGridLayout = () => (
    <div 
      className="grid gap-4 p-4"
      style={{
        gridTemplateColumns: `repeat(auto-fill, minmax(${layoutCSS['--card-width']}, 1fr))`,
        gap: layoutCSS['--layout-gap']
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
          size={activeLayout.cardSize}
          variant={activeLayout.style}
        />
      ))}
    </div>
  );

  const renderListLayout = () => (
    <div className="space-y-2 p-4">
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
          size="compact"
          variant={activeLayout.style}
          customCSS={{
            width: '100%',
            height: '80px'
          }}
        />
      ))}
    </div>
  );

  // Compact view during global drag operations
  if (globalDrag && sourceSliderId !== sliderId) {
    const titleText = parseTitle(title);
    return (
      <section 
        ref={rootRef}
        className="slider-compact-item"
        aria-label={`Slider: ${titleText}`}
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
        onDrop={e => handleDrop(e, onCardMove)}
      >
        {/* Compact header */}
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
                {parseTitle(title)}
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

        {/* Content area - REMOVED: Now handled by SliderCompactView */}
      </section>
    );
  }

  return (
    <div ref={rootRef} className={`slider-root ${sourceSliderId === sliderId ? 'is-source' : ''} mb-10`} style={layoutCSS}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5 px-0 sm:px-1 gap-2">
        <div className="flex items-center gap-2 sm:gap-3">
          <h2 className="slider-title" style={{ fontSize: 20, fontWeight: 600, color: 'var(--primary-text)', position: 'relative', margin: 0 }}>
            {title}
            <div style={{ position: 'absolute', left: 0, bottom: -4, height: 3, width: 32, borderRadius: 4, background: 'color-mix(in srgb, var(--accent-color) 60%, transparent)' }} />
          </h2>
          <div style={{ padding: '4px 12px', borderRadius: 999, border: '1px solid color-mix(in srgb, var(--accent-color) 30%, transparent)', background: 'var(--accent-color)', transition: 'background 0.2s, border 0.2s' }}>
            <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--primary-text)' }}>{items.length}</span>
          </div>
          
          {/* Show All Button */}
          {items.length > 0 && onShowAll && (
            <button
              onClick={() => onShowAll(title, items)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid color-mix(in srgb, var(--accent-color) 40%, transparent)',
                background: 'color-mix(in srgb, var(--accent-color) 10%, transparent)',
                color: 'var(--accent-color)',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'color-mix(in srgb, var(--accent-color) 20%, transparent)';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'color-mix(in srgb, var(--accent-color) 10%, transparent)';
                e.target.style.transform = 'translateY(0)';
              }}
              title={t('common.showAll')}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              {t('common.showAll')}
            </button>
          )}
          
          {/* Layout Mode Indicator */}
          <div style={{ 
            padding: '2px 8px', 
            borderRadius: 12, 
            background: 'var(--secondary-bg)', 
            border: '1px solid var(--border-color)',
            fontSize: 11,
            color: 'var(--text-muted)'
          }}>
            {activeLayout.mode.toUpperCase()}
          </div>
        </div>

        {/* Navigation Controls - only for slider and carousel modes */}
        {(activeLayout.mode === LAYOUT_MODES.SLIDER || activeLayout.mode === LAYOUT_MODES.CAROUSEL) && (
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
              <svg width={20} height={20} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <svg width={20} height={20} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Slider Container */}
      <section
        className={`relative rounded-2xl border-2 border-dashed transition-all duration-300`}
        aria-label="Drop zone for content cards"
        style={{
          borderColor: isDragOver ? 'var(--accent-color)' : 'var(--border-color)',
          backgroundColor: isDragOver ? 'color-mix(in srgb, var(--accent-color) 10%, transparent)' : 'var(--secondary-bg-transparent)',
          boxShadow: isDragOver ? 'var(--card-shadow)' : 'none',
          minHeight: activeLayout.mode === LAYOUT_MODES.LIST ? '200px' : '320px'
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={e => handleDrop(e, onCardMove)}
      >
        {(() => {
          if (isLoading) {
            /* Loading skeleton */
            return (
              <div className="p-5 grid grid-flow-col gap-5 overflow-x-auto">
                {[1,2,3,4,5].map(n => (
                  <CardSkeleton key={n} />
                ))}
              </div>
            );
          }
          
          if (items.length === 0 && !isDragOver) {
            /* Empty State */
            return (
              <div className="flex items-center justify-center h-80 text-center">
                <div className="max-w-sm">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl" style={{ background: 'var(--card-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--secondary-text)' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-normal mb-2" style={{ color: 'var(--primary-text)' }}>{t('components.slider.emptyState.title')}</h3>
                  <p className="text-sm mb-4" style={{ color: 'var(--secondary-text)' }}>
                    {t('components.slider.emptyState.description')}
                  </p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm" style={{ background: 'color-mix(in srgb, var(--accent-color) 12%, transparent)', border: '1px solid color-mix(in srgb, var(--accent-color) 20%, transparent)', color: 'var(--accent-color)' }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>{t('components.slider.emptyState.dragDrop')}</span>
                  </div>
                </div>
              </div>
            );
          }
          
          if (items.length === 0 && isDragOver) {
            /* Empty drag over state */
            return <div style={{ minHeight: '320px' }}></div>;
          }
          
          /* Main Content */
          return renderLayoutContent();
        })()}

        {/* Drop Zone Indicator - REMOVED: Now handled by SliderCompactView */}
      </section>
    </div>
  );
};

// PropTypes validation
DynamicSlider.propTypes = {
  title: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element
  ]).isRequired,
  items: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    title: PropTypes.string,
    poster: PropTypes.string,
    rating: PropTypes.number,
    releaseDate: PropTypes.string
  })),
  onCardClick: PropTypes.func,
  onCardMove: PropTypes.func,
  sliderId: PropTypes.string.isRequired,
  isLoading: PropTypes.bool,
  onQuickMove: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.object
  ]),
  rootRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.any })
  ]),
  customLayout: PropTypes.shape({
    mode: PropTypes.string,
    cardSize: PropTypes.string,
    style: PropTypes.string,
    gap: PropTypes.number
  }),
  onShowAll: PropTypes.func
};

DynamicSlider.defaultProps = {
  items: [],
  isLoading: false,
  customLayout: null,
  onShowAll: null,
  onCardClick: undefined,
  onCardMove: undefined,
  onQuickMove: undefined,
  rootRef: undefined
};

export default DynamicSlider;
