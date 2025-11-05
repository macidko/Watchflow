import React from 'react';
import { t } from '../../../i18n';
import styles from './Slider.module.css';

const SliderEmptyState = () => {
  return (
    <div className="flex items-center justify-center h-80 text-center">
      <div className="max-w-sm">
        <div className={`${styles.sliderEmptyIconContainer} w-16 h-16 mx-auto mb-4 rounded-2xl`}>
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-label={t('components.slider.empty')} focusable="false">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
  <h3 className={`${styles.sliderEmptyTitle} text-lg font-normal mb-2`}>{t('components.slider.emptyState.title')}</h3>
  <p className={`${styles.sliderEmptyDescription} text-sm mb-4`}>
          {t('components.slider.emptyState.description')}
        </p>
  <div className={styles.sliderEmptyDragBadge}>
          <svg className={`w-4 h-4 ${styles.sliderEmptyIcon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>{t('components.slider.emptyState.dragDrop')}</span>
        </div>
      </div>
    </div>
  );
};

export default SliderEmptyState;