import React from 'react';
import PropTypes from 'prop-types';
import { useDrag } from '../../../contexts/DragContext';
import { useLayoutDynamic } from '../../../hooks/useLayoutDynamic';
import { t } from '../../../i18n';
import { LAYOUT_MODES } from '../../../config/layoutConfig';
import { useSliderScroll } from './useSliderScroll';
import { useSliderDrag } from './useSliderDrag';
import { useSliderState } from './useSliderState';
import SliderHeader from './SliderHeader';
import SliderContent from './SliderContent';
import SliderDropZone from './SliderDropZone';
import SliderEmptyState from './SliderEmptyState';
import SliderCompactView from './SliderCompactView';
import styles from './Slider.module.css';

const Slider = ({
  title,
  items = [],
  onCardClick,
  onCardMove,
  sliderId,
  isLoading = false,
  onQuickMove,
  rootRef,
  // Dynamic features
  customLayout = null,
  onShowAll = null,
  // Card customization
  cardSize,
  cardVariant
}) => {
  const { isDragging: globalDrag, sourceSliderId, endDrag } = useDrag();
  const { currentLayout, getLayoutCSS } = useLayoutDynamic();

  // Use custom layout if provided, otherwise use global layout
  const activeLayout = customLayout || currentLayout;
  const layoutCSS = getLayoutCSS();

  // Custom hooks
  const scrollLogic = useSliderScroll(items);
  const dragLogic = useSliderDrag(sliderId, onCardMove, endDrag);
  const stateLogic = useSliderState();

  // Compact view during global drag operations
  if (globalDrag) {
    return (
      <SliderCompactView
        ref={rootRef}
        title={title}
        itemsCount={items.length}
        cardSize={cardSize}
        isSourceSlider={sourceSliderId === sliderId}
        isDragOver={dragLogic.isDragOver}
        isHovered={stateLogic.isHovered}
        onMouseEnter={stateLogic.handleMouseEnter}
        onMouseLeave={stateLogic.handleMouseLeave}
        onDragOver={dragLogic.handleDragOver}
        onDragLeave={dragLogic.handleDragLeave}
        onDrop={dragLogic.handleDrop}
      />
    );
  }

  return (
    <div ref={rootRef} className={`${styles.sliderRoot} ${sourceSliderId === sliderId ? styles.sliderRootIsSource : ''} mb-10`} style={layoutCSS}>
      {/* Header */}
      <SliderHeader
        title={title}
        itemsCount={items.length}
        canScrollLeft={scrollLogic.canScrollLeft}
        canScrollRight={scrollLogic.canScrollRight}
        onScrollLeft={() => scrollLogic.scroll('left')}
        onScrollRight={() => scrollLogic.scroll('right')}
        onShowAll={onShowAll}
        activeLayout={activeLayout}
        showNavigation={activeLayout?.mode === LAYOUT_MODES.SLIDER}
      />

      {/* Slider Container */}
      <div
        className={`${styles.sliderContainer} ${dragLogic.isDragOver ? styles.sliderContainerDragOver : ''}`}
        onDragOver={dragLogic.handleDragOver}
        onDragLeave={dragLogic.handleDragLeave}
        onDrop={dragLogic.handleDrop}
      >
        {isLoading ? (
          <SliderContent
            items={[]}
            isLoading={true}
            sliderRef={scrollLogic.sliderRef}
            onScroll={scrollLogic.handleScroll}
            onCardClick={onCardClick}
            onCardDragStart={dragLogic.handleCardDragStart}
            onCardDragEnd={dragLogic.handleCardDragEnd}
            onQuickMove={onQuickMove}
            sliderId={sliderId}
            activeLayout={activeLayout}
            layoutCSS={layoutCSS}
            cardSize={cardSize}
            cardVariant={cardVariant}
          />
        ) : items.length === 0 ? (
          <SliderEmptyState />
        ) : (
          <SliderContent
            items={items}
            isLoading={false}
            sliderRef={scrollLogic.sliderRef}
            onScroll={scrollLogic.handleScroll}
            onCardClick={onCardClick}
            onCardDragStart={dragLogic.handleCardDragStart}
            onCardDragEnd={dragLogic.handleCardDragEnd}
            onQuickMove={onQuickMove}
            sliderId={sliderId}
            activeLayout={activeLayout}
            layoutCSS={layoutCSS}
            cardSize={cardSize}
            cardVariant={cardVariant}
          />
        )}

        {/* Drop Zone Indicator */}
        <SliderDropZone
          isDragOver={dragLogic.isDragOver}
          title={title}
        />
      </div>
    </div>
  );
};

Slider.propTypes = {
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
  // Dynamic features
  customLayout: PropTypes.shape({
    mode: PropTypes.string,
    cardSize: PropTypes.string,
    style: PropTypes.string,
    gap: PropTypes.number
  }),
  onShowAll: PropTypes.func,
  cardSize: PropTypes.string,
  cardVariant: PropTypes.string
};

Slider.defaultProps = {
  items: [],
  isLoading: false,
  customLayout: null,
  onShowAll: null,
  cardSize: null,
  cardVariant: null,
  onCardClick: undefined,
  onCardMove: undefined,
  onQuickMove: undefined,
  rootRef: undefined
};

export default Slider;
