import React from 'react';
import SliderManager from '../components/layout/SliderManager';
import SearchButton from '../components/common/SearchButton';
import DetailModal from '../components/modals/DetailModal';
import ShowAllModal from '../components/modals/ShowAllModal';
import { CATEGORIES, PAGES } from '../config/constants';
import { t } from '../i18n';
import '../css/pages/common.css';
import SlidersContainer from '../components/layout/SlidersContainer';
import useHomeController from '../hooks/useHomeController';

const Home = () => {
  const {
    mainContentRef,
    showManager,
    setShowManager,
    selectedItem,
    setSelectedItem,
    showAllModal,
    handleCardClick,
    handleManagerClose,
    handleShowAll,
    handleShowAllClose,
    isLoading,
    sliderData
  } = useHomeController();

  if (isLoading) {
    return (
      <div className="page-loading-container">
        <span className="page-loading-text">{t('common.loading')}</span>
      </div>
    );
  }

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
  <main className="page-main" aria-label={t('pages.home.mainContentLabel')}>
        {/* Header */}
  <header className="page-header">
          <div className="page-header-container">
            <div className="page-header-content">
              <div className="page-header-info">
                <h1 className="page-title">{t('pages.home.title')}</h1>
                <p className="page-description">{t('pages.home.description')}</p>
                <div className="page-meta-info">
                  <div className="page-accent-bar"></div>
                  <span className="page-content-count">
                    {sliderData.reduce((total, slider) => total + slider.items.length, 0)} {t('common.content')}
                  </span>
                </div>
              </div>

              <div className="page-header-actions">
                <SearchButton 
                  category={CATEGORIES.ALL}
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
  <section className="page-content" id="main-content" tabIndex={-1} ref={mainContentRef} aria-label={t('pages.home.collectionSlidersLabel')}>
          <div className="page-content-container">
            {sliderData.length === 0 ? (
              /* Empty State */
              <div className="page-empty-state">
                <div className="page-empty-content">
                  <div className="page-empty-icon">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                      <title>{t('pages.home.empty.noContentTitle')}</title>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h2 className="page-empty-title">{t('pages.home.empty.noContentTitle')}</h2>
                  <p className="page-empty-description">
                    {t('pages.home.empty.noContentDescription')}
                  </p>
                  <SearchButton 
                    category={CATEGORIES.ALL} 
                    className="page-empty-search-button"
                  />
                </div>
              </div>
            ) : (
              /* Sliders */
              <div className="page-sliders">
                <SlidersContainer
                  sliders={sliderData}
                  onCardClick={handleCardClick}
                  onShowAll={handleShowAll}
                />
              </div>
            )}
          </div>
        </section>

        {/* Modal Components */}
        {showManager && (
          <SliderManager 
            onClose={handleManagerClose}
            page={PAGES.HOME}
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

export default Home;
