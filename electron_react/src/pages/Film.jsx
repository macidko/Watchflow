import React from 'react';
import SliderManager from '../components/layout/SliderManager';
import SearchButton from '../components/common/SearchButton';
import DetailModal from '../components/modals/DetailModal';
import ShowAllModal from '../components/modals/ShowAllModal';
import ViewSwitcher from '../components/layout/ViewSwitcher';
import '../css/pages/common.css';
import { CATEGORIES, PAGES } from '../config/constants';
import { t } from '../i18n';
import SlidersContainer from '../components/layout/SlidersContainer';
import useFilmController from '../hooks/useFilmController';

const Film = () => {
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
  } = useFilmController();


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
  <div className="page-main">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-container">
          <div className="page-header-content">
            <div className="page-header-info">
              <h1 className="page-title">{t('pages.film.title')}</h1>
              <p className="page-description">{t('pages.film.description')}</p>
              <div className="page-meta-info">
                <div className="page-accent-bar"></div>
                <span className="page-content-count">
                  {sliders.reduce((total, slider) => total + slider.items.length, 0)} {t('pages.film.count')}
                </span>
              </div>
            </div>

            <div className="page-header-actions">
              <ViewSwitcher viewMode={viewMode} toggleViewMode={toggleViewMode} />
              <SearchButton 
                category={CATEGORIES.FILM} 
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
      </div>

      {/* Content */}
      <div className="page-content" id="main-content" tabIndex={-1} ref={mainContentRef}>
        <div className="page-content-container">
          {sliders.length === 0 ? (
            /* Empty State */
            <div className="page-empty-state">
              <div className="page-empty-content">
                <div className="page-empty-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <title>{t('pages.film.empty.noContentTitle')}</title>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h4a1 1 0 011 1v18a1 1 0 01-1 1H3a1 1 0 01-1-1V1a1 1 0 011-1h4a1 1 0 011 1v3m0 0h8M7 4H3" />
                  </svg>
                </div>
                <h2 className="page-empty-title">{t('pages.film.empty.noContentTitle')}</h2>
                <p className="page-empty-description">
                  {t('pages.film.empty.noContentDescription')}
                </p>
                <SearchButton 
                  category={CATEGORIES.FILM} 
                  className="page-empty-search-button"
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
      </div>

      {/* Modals */}
      {showManager && (
        <SliderManager 
          page={PAGES.FILM} 
          onClose={() => setShowManager(false)} 
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
      </div>
    </>
  );
};

export default Film;