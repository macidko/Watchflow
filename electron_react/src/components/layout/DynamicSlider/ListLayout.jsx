import React from 'react';
import PropTypes from 'prop-types';
import { Card } from '../../ui/Card';
import styles from './DynamicSlider.module.css';

const ListLayout = ({
  items,
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
    <div className={styles.listLayout}>
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
};

ListLayout.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    title: PropTypes.string,
    poster: PropTypes.string
  })).isRequired,
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

ListLayout.defaultProps = {
  onCardClick: undefined,
  draggedItem: null,
  globalDrag: false,
  onQuickMove: undefined
};

export default ListLayout;
