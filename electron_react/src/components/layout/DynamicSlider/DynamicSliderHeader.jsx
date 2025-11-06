import React from 'react';
import PropTypes from 'prop-types';
import { t } from '../../../i18n';
import styles from './DynamicSlider.module.css';

const DynamicSliderHeader = ({
  title,
  itemsCount,
  canScrollLeft,
  canScrollRight,
  onScrollLeft,
  onScrollRight,
  onShowAll,
  activeLayout,
  showNavigation
}) => {
  return (
    <div className="flex items-center justify-between mb-5 px-0 sm:px-1 gap-2">
      <div className="flex items-center gap-2 sm:gap-3">
        <h2 className={`slider-title ${styles.title}`}>
          {title}
          <div className={styles.titleBar} />
        </h2>
        
        <div className={styles.countBadge}>
          <span className={styles.countBadgeText}>{itemsCount}</span>
        </div>
        
        {/* Show All Button */}
        {itemsCount > 0 && onShowAll && (
          <button 
            onClick={() => onShowAll(title, itemsCount)} 
            className={styles.showAllBtn} 
            title={t('common.showAll')}
            aria-label={t('common.showAll')}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            {t('common.showAll')}
          </button>
        )}
        
        {/* Layout Mode Indicator */}
        <div className={styles.layoutMode}>
          {activeLayout.mode.toUpperCase()}
        </div>
      </div>

      {/* Navigation Controls - only for slider and carousel modes */}
      {showNavigation && (
        <div className={styles.navControls}>
          <button
            onClick={onScrollLeft}
            disabled={!canScrollLeft}
            className={styles.navBtn}
            data-active={canScrollLeft}
            aria-label={t('components.slider.scrollLeft')}
          >
            <svg width={20} height={20} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={onScrollRight}
            disabled={!canScrollRight}
            className={styles.navBtn}
            data-active={canScrollRight}
            aria-label={t('components.slider.scrollRight')}
          >
            <svg width={20} height={20} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

DynamicSliderHeader.propTypes = {
  title: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element
  ]).isRequired,
  itemsCount: PropTypes.number.isRequired,
  canScrollLeft: PropTypes.bool.isRequired,
  canScrollRight: PropTypes.bool.isRequired,
  onScrollLeft: PropTypes.func.isRequired,
  onScrollRight: PropTypes.func.isRequired,
  onShowAll: PropTypes.func,
  activeLayout: PropTypes.shape({
    mode: PropTypes.string,
    cardSize: PropTypes.string,
    style: PropTypes.string,
    gap: PropTypes.number
  }).isRequired,
  showNavigation: PropTypes.bool.isRequired
};

DynamicSliderHeader.defaultProps = {
  onShowAll: null
};

export default DynamicSliderHeader;
