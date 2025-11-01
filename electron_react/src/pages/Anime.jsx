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
import useAnimeController from '../hooks/useAnimeController';

const Anime = () => {
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
  } = useAnimeController();


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
              <h1 className="page-title">{t('pages.anime.title')}</h1>
              <p className="page-description">{t('pages.anime.description')}</p>
              <div className="page-meta-info">
                <div className="page-accent-bar"></div>
                <span className="page-content-count">
                  {sliders.reduce((total, slider) => total + slider.items.length, 0)} {t('pages.anime.count')}
                </span>
              </div>
            </div>

            <div className="page-header-actions">
              <ViewSwitcher viewMode={viewMode} toggleViewMode={toggleViewMode} />
              <SearchButton 
                category={CATEGORIES.ANIME} 
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
                    <title>{t('pages.anime.empty.noContentTitle')}</title>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="page-empty-title">{t('pages.anime.empty.noContentTitle')}</h2>
                <p className="page-empty-description">
                  {t('pages.anime.empty.noContentDescription')}
                </p>
                <SearchButton 
                  category={CATEGORIES.ANIME} 
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
          page={PAGES.ANIME}
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

export default Anime;
