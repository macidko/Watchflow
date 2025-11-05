import React from 'react';
import styles from './Card.module.css';

const CardRating = ({ rating }) => {
  if (!rating) return null;

  return (
    <div className={styles.cardRating}>
      <svg fill="currentColor" viewBox="0 0 24 24" role="img" aria-label="Derecelendirme" focusable="false">
        <title>Derecelendirme</title>
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
      <span>{Number(rating).toFixed(1)}</span>
    </div>
  );
};

export default CardRating;
