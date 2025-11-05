import React from 'react';
import { t } from '../../../i18n';
import styles from './Slider.module.css';

const SliderHeader = ({
  title,
  itemsCount,
  canScrollLeft,
  canScrollRight,
  onScrollLeft,
  onScrollRight,
  // Dynamic features
  onShowAll,
  activeLayout,
  showNavigation = true
}) => {
  return (
    <div className={styles.sliderHeader}>
        <div className="flex items-center gap-2 sm:gap-3">
          <h2 className={styles.sliderTitle}>
            {title}
            <div className={styles.sliderTitleUnderline} />
          </h2>
          <div className={styles.sliderCountBadge}>
            <span>{itemsCount}</span>
          </div>
          
          {/* Show All Button */}
          {itemsCount > 0 && onShowAll && (
            <button
              onClick={() => onShowAll(title, [])}
              className={styles.sliderShowAllButton}
              title={t('common.showAll')}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              {t('common.showAll')}
            </button>
          )}
          
          {/* Layout Mode Indicator */}
          {activeLayout && (
            <div className={styles.sliderLayoutBadge}>
              {activeLayout.mode?.toUpperCase()}
            </div>
          )}
        </div>      {/* Navigation Controls - only for slider mode */}
        {showNavigation && (
          <div className={styles.sliderNavigation}>
            <button
              onClick={onScrollLeft}
              disabled={!canScrollLeft}
              className={styles.sliderNavButton}
              aria-label={t('components.slider.scrollLeft')}
            >
              <svg width={20} height={20} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-label={t('components.slider.scrollLeft')} focusable="false">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={onScrollRight}
              disabled={!canScrollRight}
              className={styles.sliderNavButton}
              aria-label={t('components.slider.scrollRight')}
            >
              <svg width={20} height={20} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-label={t('components.slider.scrollRight')} focusable="false">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
    </div>
  );
};

export default SliderHeader;