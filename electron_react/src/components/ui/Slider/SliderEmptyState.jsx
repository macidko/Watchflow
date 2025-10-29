import React from 'react';
import { t } from '../../../i18n';

const SliderEmptyState = () => {
  return (
    <div className="flex items-center justify-center h-80 text-center">
      <div className="max-w-sm">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl" style={{ background: 'var(--card-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-label="Boş" focusable="false" style={{ color: 'var(--secondary-text)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="text-lg font-normal mb-2" style={{ color: 'var(--primary-text)' }}>{t('components.slider.emptyState.title')}</h3>
        <p className="text-sm mb-4" style={{ color: 'var(--secondary-text)' }}>
          {t('components.slider.emptyState.description')}
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm" style={{ background: 'color-mix(in srgb, var(--accent-color) 12%, transparent)', border: '1px solid color-mix(in srgb, var(--accent-color) 20%, transparent)', color: 'var(--accent-color)' }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--accent-color)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span style={{ color: 'var(--accent-color)' }}>{t('components.slider.emptyState.dragDrop')}</span>
        </div>
      </div>
    </div>
  );
};

export default SliderEmptyState;