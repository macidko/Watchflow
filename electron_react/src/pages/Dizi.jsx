import React from 'react';
import SliderManager from '../components/layout/SliderManager';
import SearchButton from '../components/common/SearchButton';
import DetailModal from '../components/modals/DetailModal';
import ShowAllModal from '../components/modals/ShowAllModal';
import ViewSwitcher from '../components/layout/ViewSwitcher';
import { CATEGORIES, PAGES } from '../config/constants';
import { t } from '../i18n';
import '../css/pages/common.css';
import SlidersContainer from '../components/layout/SlidersContainer';
import useDiziController from '../hooks/useDiziController';

const Dizi = () => {
  const {
    mainContentRef,
    showManager,
    setShowManager,
    selectedItem,
    setSelectedItem,
    showAllModal,
    handleCardClick,
    handleShowAll,
    handleShowAllClose,
    sliders,
    viewMode,
    toggleViewMode,
    isDragging,
    sliderRefs,
    handleCardMove,
    quickMoveConfig
  } = useDiziController();


  return (
    <>
      {/* Skip to Content Link */}
      <a
        href="#main-content"
        onClick={e => {
          e.preventDefault();
          mainContentRef.current?.focus();
        }}
        className="page-skip-link"
        tabIndex={0}
      >
        {t('common.skipToContent')}
      </a>
  <main className="page-main">
      {/* Header */}
      <header className="page-header">
        <div className="page-header-container">
          <div className="page-header-content">
            <div className="page-header-info">
              <h1 className="page-title">{t('pages.dizi.title')}</h1>
              <p className="page-description">{t('pages.dizi.description')}</p>
              <div className="page-meta-info">
                <div className="page-accent-bar"></div>
                <span className="page-content-count">
                  {sliders.reduce((total, slider) => total + slider.items.length, 0)} {t('pages.dizi.count')}
                </span>
              </div>
            </div>

            <div className="page-header-actions">
              <ViewSwitcher viewMode={viewMode} toggleViewMode={toggleViewMode} />
              <SearchButton 
                category={CATEGORIES.DIZI} 
                className="page-search-button"
              />
              <button
                onClick={() => setShowManager(true)}
                className="page-manager-button"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
                {t('common.lists')}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <section className="page-content" id="main-content" tabIndex={-1} ref={mainContentRef}>
        <div className="page-content-container">
          {sliders.length === 0 ? (
            /* Empty State */
            <div className="page-empty-state">
              <div className="page-empty-content">
                <div className="page-empty-icon">
                  <svg className="page-empty-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <title>{t('pages.dizi.empty.noContentTitle')}</title>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="page-empty-title">{t('pages.dizi.empty.noContentTitle')}</h2>
                <p className="page-empty-description">
                  {t('pages.dizi.empty.noContentDescription')}
                </p>
                <SearchButton 
                  category={CATEGORIES.DIZI} 
                  className="page-search-button"
                />
              </div>
            </div>
          ) : (
            <div className={'sliders ' + (isDragging ? 'compact' : viewMode)}>
              <SlidersContainer
                sliders={sliders}
                isDragging={isDragging}
                viewMode={viewMode}
                sliderRefs={sliderRefs}
                onCardClick={handleCardClick}
                onCardMove={handleCardMove}
                onQuickMove={quickMoveConfig}
                onShowAll={handleShowAll}
              />
            </div>
          )}
        </div>
      </section>

      {/* Modal Components */}
      {showManager && (
        <SliderManager 
          onClose={() => setShowManager(false)}
          page={PAGES.DIZI}
        />
      )}

      {selectedItem && (
        <DetailModal 
          item={selectedItem} 
          onClose={() => setSelectedItem(null)} 
        />
      )}

      {showAllModal.isOpen && (
        <ShowAllModal
          title={showAllModal.title}
          items={showAllModal.items}
          onClose={handleShowAllClose}
          onCardClick={handleCardClick}
        />
      )}
      </main>
    </>
  );
};

export default Dizi;
