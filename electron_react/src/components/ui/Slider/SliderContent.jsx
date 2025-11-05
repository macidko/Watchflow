import React from 'react';
import { Card, CardSkeleton } from '../Card';
import { LAYOUT_MODES } from '../../../config/layoutConfig';
import { useDrag } from '../../../contexts/DragContext';
import styles from './Slider.module.css';

const SliderContent = ({
  items,
  isLoading,
  sliderRef,
  onScroll,
  onCardClick,
  onCardDragStart,
  onCardDragEnd,
  onQuickMove,
  sliderId,
  // Dynamic features
  activeLayout,
  layoutCSS,
  cardSize,
  cardVariant
}) => {
  const { isDragging: globalIsDragging, draggedItem } = useDrag();
  if (isLoading) {
    return (
      <div className="p-5 grid grid-flow-col gap-5 overflow-x-auto">
        {[1,2,3,4,5].map(n => (
          <CardSkeleton key={n} />
        ))}
      </div>
    );
  }

  // Render different layout modes
  const renderLayoutContent = () => {
    switch (activeLayout?.mode) {
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
      className={`${styles.sliderContent} scrollbar-hide`}
      onScroll={onScroll}
      style={{
        gap: layoutCSS?.['--layout-gap'] || '1rem',
        padding: layoutCSS?.['--layout-padding'] || '1.25rem'
      }}
    >
      {items.map((item, index) => (
        <Card
          key={item.id || index}
          item={item}
          isDragging={globalIsDragging && draggedItem?.id === item.id}
          onClick={onCardClick}
          onDragStart={onCardDragStart}
          onDragEnd={onCardDragEnd}
          sliderId={sliderId}
          onQuickMove={onQuickMove}
          size={cardSize || activeLayout?.cardSize}
          variant={cardVariant || activeLayout?.style}
        />
      ))}
    </div>
  );

  const renderGridLayout = () => (
    <div
      className={styles.sliderGrid}
      style={{
        gridTemplateColumns: `repeat(auto-fill, minmax(${layoutCSS?.['--card-width'] || '200px'}, 1fr))`,
        gap: layoutCSS?.['--layout-gap'] || '1rem'
      }}
    >
      {items.map((item, index) => (
        <Card
          key={item.id || index}
          item={item}
          isDragging={globalIsDragging && draggedItem?.id === item.id}
          onClick={onCardClick}
          onDragStart={onCardDragStart}
          onDragEnd={onCardDragEnd}
          sliderId={sliderId}
          onQuickMove={onQuickMove}
          size={cardSize || activeLayout?.cardSize}
          variant={cardVariant || activeLayout?.style}
        />
      ))}
    </div>
  );

  const renderListLayout = () => (
    <div className={styles.sliderList}>
      {items.map((item, index) => (
        <div key={item.id || index} className={styles.sliderListItem}>
          <Card
            item={item}
            isDragging={globalIsDragging && draggedItem?.id === item.id}
            onClick={onCardClick}
            onDragStart={onCardDragStart}
            onDragEnd={onCardDragEnd}
            sliderId={sliderId}
            onQuickMove={onQuickMove}
            size="compact"
            variant={cardVariant || activeLayout?.style}
            customCSS={{
              width: '100%',
              height: '80px'
            }}
          />
        </div>
      ))}
    </div>
  );

  return renderLayoutContent();
};

export default SliderContent;
