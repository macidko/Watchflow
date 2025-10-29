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
            <div className="absolute left-0 -bottom-1 h-0.5 w-8 rounded" style={{ background: 'color-mix(in srgb, var(--accent-color) 60%, transparent)' }} />
          </h2>
          <div className="px-3 py-1 rounded-full border bg-accent text-primary-text text-sm font-normal transition-all" style={{ borderColor: 'color-mix(in srgb, var(--accent-color) 30%, transparent)', background: 'var(--accent-color)' }}>
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
            <div style={{ 
              padding: '2px 8px', 
              borderRadius: 12, 
              background: 'var(--secondary-bg)', 
              border: '1px solid var(--border-color)',
              fontSize: 11,
              color: 'var(--text-muted)'
            }}>
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
              aria-label="Sola kaydır"
            >
              <svg width={20} height={20} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-label="Sola kaydır" focusable="false">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={onScrollRight}
              disabled={!canScrollRight}
              className={styles.sliderNavButton}
              aria-label="Sağa kaydır"
            >
              <svg width={20} height={20} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-label="Sağa kaydır" focusable="false">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
    </div>
  );
};

export default SliderHeader;