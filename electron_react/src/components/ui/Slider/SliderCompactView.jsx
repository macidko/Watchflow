import React from 'react';
import { t } from '../../../i18n';
import styles from './Slider.module.css';

const SliderCompactView = ({
  title,
  itemsCount,
  cardSize = 'medium',
  isSourceSlider = false,
  isDragOver,
  isHovered,
  onMouseEnter,
  onMouseLeave,
  onDragOver,
  onDragLeave,
  onDrop
}) => {
  return (
    <div
      className={`${styles.sliderCompactView} ${styles[`sliderCompactViewSize${cardSize.charAt(0).toUpperCase() + cardSize.slice(1)}`]} ${isDragOver ? styles.sliderCompactViewDragOver : ''} ${isHovered ? styles.sliderCompactViewHovered : ''}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {/* Header - show for all sliders but with different styles */}
      <div className={`${styles.sliderCompactViewHeader} ${isSourceSlider ? styles.sliderCompactViewHeaderSource : ''}`}>
        <div className={styles.sliderCompactViewHeaderRow}>
          <div className={styles.sliderCompactViewTitleRow}>
            <div className={`${styles.sliderCompactViewIndicator} ${isSourceSlider ? styles.sliderCompactViewIndicatorSource : ''}`} />
            <h3 className={`${styles.sliderCompactViewTitle} ${isSourceSlider ? styles.sliderCompactViewTitleSource : ''}`}>
              {React.isValidElement(title) ?
                title.props.children || 'Slider' :
                (typeof title === 'string' ? title : 'Slider')
              }
            </h3>
          </div>
          {itemsCount > 0 && (
            <div className={`${styles.sliderCompactViewCount} ${isSourceSlider ? styles.sliderCompactViewCountSource : ''}`}>
              {itemsCount}
            </div>
          )}
        </div>
      </div>

      {/* Content area */}
      <div className={styles.sliderCompactViewContent}>
        {isDragOver ? (
          <div className={styles.sliderCompactViewDropIndicator}>
            <div className={styles.sliderCompactViewDropIcon}>
              <svg width="12" height="12" fill="none" stroke="white" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
            <span className={styles.sliderCompactViewDropText}>
              {t('components.slider.dropZone.title')}
            </span>
          </div>
        ) : isSourceSlider ? (
          <div className={styles.sliderCompactViewSourceIndicator}>
            <div className={styles.sliderCompactViewSourceIcon}>
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </div>
            <span className={styles.sliderCompactViewSourceText}>
              {t('components.slider.compact.dragging')}
            </span>
          </div>
        ) : (
          <div className={styles.sliderCompactViewPlaceholder}>
            {[1,2,3].map(i => (
              <div key={i} className={styles.sliderCompactViewPlaceholderItem} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SliderCompactView;
