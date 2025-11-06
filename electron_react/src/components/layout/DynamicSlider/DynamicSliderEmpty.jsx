import React from 'react';
import PropTypes from 'prop-types';
import { t } from '../../../i18n';
import styles from './DynamicSlider.module.css';

const DynamicSliderEmpty = ({ isDragOver }) => {
  // Empty drag over state - just show empty container
  if (isDragOver) {
    return <div className={styles.emptyState}></div>;
  }

  // Empty state with message
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyInner}>
        <div className={styles.emptyIconWrapper}>
          <svg 
            className={`w-8 h-8 ${styles.emptyIconSvg}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" 
            />
          </svg>
        </div>
        <h3 className={styles.emptyTitle}>
          {t('components.slider.emptyState.title')}
        </h3>
        <p className={styles.emptyDescription}>
          {t('components.slider.emptyState.description')}
        </p>
        <div className={styles.emptyAction}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 6v6m0 0v6m0-6h6m-6 0H6" 
            />
          </svg>
          <span>{t('components.slider.emptyState.dragDrop')}</span>
        </div>
      </div>
    </div>
  );
};

DynamicSliderEmpty.propTypes = {
  isDragOver: PropTypes.bool
};

DynamicSliderEmpty.defaultProps = {
  isDragOver: false
};

export default DynamicSliderEmpty;
