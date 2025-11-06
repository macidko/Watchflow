import React from 'react';
import PropTypes from 'prop-types';
import { Card } from '../../ui/Card';
import styles from './DynamicSlider.module.css';

const SliderLayout = ({
  items,
  sliderRef,
  onScroll,
  onCardClick,
  onCardDragStart,
  onCardDragEnd,
  draggedItem,
  globalDrag,
  sliderId,
  onQuickMove,
  activeLayout
}) => {
  return (
    <div 
      ref={sliderRef}
      className={`${styles.sliderContent} slider-content flex overflow-x-auto scroll-smooth`}
      onScroll={onScroll}
    >
      {items.map((item, index) => (
        <Card
          key={item.id || index}
          item={item}
          onClick={onCardClick}
          onDragStart={onCardDragStart}
          onDragEnd={onCardDragEnd}
          isDragging={draggedItem?.item?.id === item.id && !globalDrag}
          sliderId={sliderId}
          onQuickMove={onQuickMove}
          size={activeLayout.cardSize}
          variant={activeLayout.style}
        />
      ))}
    </div>
  );
};

SliderLayout.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    title: PropTypes.string,
    poster: PropTypes.string
  })).isRequired,
  sliderRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.any })
  ]),
  onScroll: PropTypes.func.isRequired,
  onCardClick: PropTypes.func,
  onCardDragStart: PropTypes.func.isRequired,
  onCardDragEnd: PropTypes.func.isRequired,
  draggedItem: PropTypes.shape({
    item: PropTypes.object,
    sourceSlider: PropTypes.string
  }),
  globalDrag: PropTypes.bool,
  sliderId: PropTypes.string.isRequired,
  onQuickMove: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.object
  ]),
  activeLayout: PropTypes.shape({
    mode: PropTypes.string,
    cardSize: PropTypes.string,
    style: PropTypes.string,
    gap: PropTypes.number
  }).isRequired
};

SliderLayout.defaultProps = {
  sliderRef: undefined,
  onCardClick: undefined,
  draggedItem: null,
  globalDrag: false,
  onQuickMove: undefined
};

export default SliderLayout;
