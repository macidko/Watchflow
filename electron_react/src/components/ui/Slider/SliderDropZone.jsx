import React from 'react';
import styles from './Slider.module.css';

const SliderDropZone = ({ isDragOver, title }) => {
  if (!isDragOver) return null;

  return (
    <div className={styles.sliderDropZone}>
      <div className={styles.sliderDropZoneContent}>
        <div className={styles.sliderDropZoneIcon}>
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
        <p className={styles.sliderDropZoneTitle}>Buraya Bırak</p>
        <span className={styles.sliderDropZoneSubtitle}>Kart "{title}" listesine taşınacak</span>
      </div>
    </div>
  );
};

export default SliderDropZone;