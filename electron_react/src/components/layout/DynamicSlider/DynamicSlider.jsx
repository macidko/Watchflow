import React from 'react';
import PropTypes from 'prop-types';
import { useDrag } from '../../../contexts/DragContext';
import { useLayoutDynamic } from '../../../hooks/useLayoutDynamic';
import { LAYOUT_MODES } from '../../../config/layoutConfig';
import { useDynamicSliderScroll } from './useDynamicSliderScroll';
import { useDynamicSliderDrag } from './useDynamicSliderDrag';
import { useDynamicSliderState } from './useDynamicSliderState';
import DynamicSliderHeader from './DynamicSliderHeader';
import DynamicSliderEmpty from './DynamicSliderEmpty';
import DynamicSliderCompact from './DynamicSliderCompact';
import DynamicSliderLoading from './DynamicSliderLoading';
import SliderLayout from './SliderLayout';
import GridLayout from './GridLayout';
import ListLayout from './ListLayout';
import styles from './DynamicSlider.module.css';

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
  onShowAll = null
}) => {
  const { isDragging: globalDrag, sourceSliderId, endDrag } = useDrag();
  const { currentLayout, getLayoutCSS } = useLayoutDynamic();

  // Use custom layout if provided, otherwise use global layout
  const activeLayout = customLayout || currentLayout;
  const layoutCSS = getLayoutCSS();

  // Custom hooks
  const scrollLogic = useDynamicSliderScroll(activeLayout, items);
  const dragLogic = useDynamicSliderDrag(sliderId, endDrag);
  const stateLogic = useDynamicSliderState();

  // Determine if navigation should be shown
  const showNavigation = 
    activeLayout.mode === LAYOUT_MODES.SLIDER || 
    activeLayout.mode === LAYOUT_MODES.CAROUSEL;

  // Render different layout modes
  const renderLayoutContent = () => {
    const commonProps = {
      items,
      onCardClick,
      onCardDragStart: dragLogic.handleCardDragStart,
      onCardDragEnd: dragLogic.handleCardDragEnd,
      draggedItem: dragLogic.draggedItem,
      globalDrag,
      sliderId,
      onQuickMove,
      activeLayout
    };

    switch (activeLayout.mode) {
      case LAYOUT_MODES.GRID:
        return <GridLayout {...commonProps} />;
      
      case LAYOUT_MODES.LIST:
        return <ListLayout {...commonProps} />;
      
      default:
        return (
          <SliderLayout 
            {...commonProps}
            sliderRef={scrollLogic.sliderRef}
            onScroll={scrollLogic.handleScroll}
          />
        );
    }
  };

  // Compact view during global drag operations
  if (globalDrag && sourceSliderId !== sliderId) {
    return (
      <DynamicSliderCompact
        rootRef={rootRef}
        title={title}
        itemsCount={items.length}
        isDragOver={dragLogic.isDragOver}
        onMouseEnter={stateLogic.handleMouseEnter}
        onMouseLeave={stateLogic.handleMouseLeave}
        onDragOver={dragLogic.handleDragOver}
        onDragLeave={dragLogic.handleDragLeave}
        onDrop={(e) => dragLogic.handleDrop(e, onCardMove)}
      />
    );
  }

  // Main render
  return (
    <div 
      ref={rootRef} 
      className={`slider-root ${styles.sliderRoot} ${sourceSliderId === sliderId ? 'is-source' : ''} mb-10`} 
      style={layoutCSS}
    >
      {/* Header */}
      <DynamicSliderHeader
        title={title}
        itemsCount={items.length}
        canScrollLeft={scrollLogic.canScrollLeft}
        canScrollRight={scrollLogic.canScrollRight}
        onScrollLeft={() => scrollLogic.scroll('left')}
        onScrollRight={() => scrollLogic.scroll('right')}
        onShowAll={onShowAll ? () => onShowAll(title, items) : null}
        activeLayout={activeLayout}
        showNavigation={showNavigation}
      />

      {/* Slider Container */}
      <section
        className={`${styles.dropZone} relative rounded-2xl border-2 border-dashed transition-all duration-300`}
        aria-label="Drop zone for content cards"
        data-dragover={dragLogic.isDragOver}
        data-layoutmode={activeLayout.mode}
        onDragOver={dragLogic.handleDragOver}
        onDragLeave={dragLogic.handleDragLeave}
        onDrop={(e) => dragLogic.handleDrop(e, onCardMove)}
      >
        {(() => {
          if (isLoading) {
            return <DynamicSliderLoading />;
          }
          
          if (items.length === 0) {
            return <DynamicSliderEmpty isDragOver={dragLogic.isDragOver} />;
          }
          
          return renderLayoutContent();
        })()}
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
