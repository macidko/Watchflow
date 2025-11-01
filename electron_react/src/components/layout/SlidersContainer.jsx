import React from 'react';
import PropTypes from 'prop-types';
import Slider from '../ui/Slider';

export default function SlidersContainer({
  sliders,
  sliderRefs,
  onCardClick,
  onCardMove,
  onShowAll,
  onQuickMove,
}) {
  if (!sliders || sliders.length === 0) {
    return null;
  }
  return (
    <>
      {sliders.map(slider => (
        <Slider
          key={slider.id}
          rootRef={el => sliderRefs && (sliderRefs.current[slider.id] = el)}
          title={slider.title}
          items={slider.items}
          onCardClick={onCardClick}
          onCardMove={onCardMove}
          sliderId={slider.id}
          onQuickMove={onQuickMove}
          onShowAll={onShowAll}
        />
      ))}
    </>
  );
}

SlidersContainer.propTypes = {
  sliders: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    title: PropTypes.string,
    items: PropTypes.array
  })),
  sliderRefs: PropTypes.object,
  onCardClick: PropTypes.func,
  onCardMove: PropTypes.func,
  onShowAll: PropTypes.func,
  onQuickMove: PropTypes.oneOfType([PropTypes.object, PropTypes.func])
};

SlidersContainer.defaultProps = {
  sliders: [],
  sliderRefs: null,
  onCardClick: () => {},
  onCardMove: () => {},
  onShowAll: () => {},
  onQuickMove: null
};
