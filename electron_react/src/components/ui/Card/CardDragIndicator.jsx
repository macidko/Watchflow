import React from 'react';
import styles from './Card.module.css';

const CardDragIndicator = ({ isDragging }) => {
  if (!isDragging) return null;

  return (
    <div className={styles.cardDragIndicator}>
      <div className={styles.cardDragIndicatorText}>
        Taşınıyor...
      </div>
    </div>
  );
};

export default CardDragIndicator;