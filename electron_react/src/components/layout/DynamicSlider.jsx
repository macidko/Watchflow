import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardSkeleton } from '../ui/Card';
import useDynamicSliderController from '../../hooks/useDynamicSliderController';
import { t } from '../../i18n';
import { LAYOUT_MODES } from '../../config/layoutConfig';
import styles from './DynamicSlider.module.css';

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
      className={`${styles.sliderContent} slider-content flex overflow-x-auto scroll-smooth`}
      onScroll={handleScroll}
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
      className={`${styles.gridLayout} grid`}
      
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
    <div className={styles.listLayout}>
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
        className={`${styles.compactItem} slider-compact-item`}
        aria-label={`Slider: ${titleText}`}
        data-dragover={isDragOver}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={e => handleDrop(e, onCardMove)}
      >
        {/* Compact header */}
        <div className={styles.compactHeader}>
    <div className={styles.compactHeaderRow}>
              <div className={styles.compactHeaderLeft}>
                <div className={styles.compactDot} data-dragover={isDragOver} />
                <h3 className={styles.compactTitle} data-dragover={isDragOver}>{parseTitle(title)}</h3>
              </div>
            {items.length > 0 && (
              <div className={styles.compactCount} data-dragover={isDragOver}>{items.length}</div>
            )}
          </div>
        </div>

        {/* Content area - REMOVED: Now handled by SliderCompactView */}
      </section>
    );
  }

  return (
    <div ref={rootRef} className={`slider-root ${styles.sliderRoot} ${sourceSliderId === sliderId ? 'is-source' : ''} mb-10`} style={layoutCSS}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5 px-0 sm:px-1 gap-2">
        <div className="flex items-center gap-2 sm:gap-3">
          <h2 className={`slider-title ${styles.title}`}>
            {title}
            <div className={styles.titleBar} />
          </h2>
          <div className={styles.countBadge}>
            <span className={styles.countBadgeText}>{items.length}</span>
          </div>
          
          {/* Show All Button */}
          {items.length > 0 && onShowAll && (
            <button onClick={() => onShowAll(title, items)} className={styles.showAllBtn} title={t('common.showAll')}>
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              {t('common.showAll')}
            </button>
          )}
          
          {/* Layout Mode Indicator */}
          <div className={styles.layoutMode}>
            {activeLayout.mode.toUpperCase()}
          </div>
        </div>

        {/* Navigation Controls - only for slider and carousel modes */}
        {(activeLayout.mode === LAYOUT_MODES.SLIDER || activeLayout.mode === LAYOUT_MODES.CAROUSEL) && (
          <div className={styles.navControls}>
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className={styles.navBtn}
              data-active={canScrollLeft}
            >
              <svg width={20} height={20} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className={styles.navBtn}
              data-active={canScrollRight}
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
        className={`${styles.dropZone} relative rounded-2xl border-2 border-dashed transition-all duration-300`}
        aria-label="Drop zone for content cards"
        data-dragover={isDragOver}
        data-layoutmode={activeLayout.mode}
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
              <div className={styles.emptyState}>
                <div className={styles.emptyInner}>
                  <div className={styles.emptyIconWrapper}>
                    <svg className={`w-8 h-8 ${styles.emptyIconSvg}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 className={styles.emptyTitle}>{t('components.slider.emptyState.title')}</h3>
                  <p className={styles.emptyDescription}>
                    {t('components.slider.emptyState.description')}
                  </p>
                  <div className={styles.emptyAction}>
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
            return <div className={styles.emptyState}></div>;
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
