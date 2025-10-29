import React from 'react';

// Pure component - sadece props alıp render eder
const CardImage = ({ imageRef, src, alt, className, onLoad, onError }) => {
  return (
    <img
      ref={imageRef}
      src={src}
      alt={alt}
      className={className}
      onLoad={onLoad}
      onError={onError}
      draggable={false}
      loading="lazy"
    />
  );
};

export default CardImage;