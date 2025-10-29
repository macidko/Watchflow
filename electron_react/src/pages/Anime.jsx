import React, { useEffect, useState, useRef } from 'react';
import Slider from '../components/ui/Slider';
import SliderManager from '../components/layout/SliderManager';
import SearchButton from '../components/common/SearchButton';
import DetailModal from '../components/modals/DetailModal';
import ShowAllModal from '../components/modals/ShowAllModal';
import ViewSwitcher from '../components/layout/ViewSwitcher';
import useContentStore from '../config/initialData';
import { useDrag } from '../contexts/DragContext';
import useViewMode from '../hooks/useViewMode';
import { CATEGORIES, PAGES } from '../config/constants';
import { t } from '../i18n';
import '../css/pages/common.css';

const Anime = () => {
  // Ana içeriğe atla için ref
  const mainContentRef = useRef(null);
  const [showManager, setShowManager] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showAllModal, setShowAllModal] = useState({ isOpen: false, title: '', items: [] });
  
  // Görünüm modu için custom hook (grid/list)
  const { viewMode, toggleViewMode } = useViewMode(PAGES.ANIME);
  
  // Zustand store'dan verileri al
  const { 
    getStatusesByPage, 
    getContentsByPageAndStatus,
    initializeStore,
    moveContentBetweenStatuses
  } = useContentStore();

  // Initialize store on component mount
  useEffect(() => {
    initializeStore();
  }, [initializeStore]);

  // Anime sayfası için slider verilerini hazırla
  // Zustand store'dan slider listesini doğrudan oluştur
  const animeStatuses = getStatusesByPage(PAGES.ANIME);
  const sliders = animeStatuses.map(status => {
    const contents = getContentsByPageAndStatus(PAGES.ANIME, status.id);
    return {
      id: `anime-${status.id}`,
      title: status.title,
      items: contents.map(content => ({
        id: content.id, // Önce unique content ID
        ...content.apiData, // Sonra API verileri
        apiData: content.apiData || {},
        seasons: content.seasons || {},
        pageId: content.pageId, // pageId'yi de ekle
        statusId: content.statusId, // statusId'yi de ekle
        title: content.apiData?.title || content.title,
        poster: content.apiData?.poster || content.poster || content.imageUrl,
        rating: content.apiData?.rating || content.rating || content.score,
        releaseDate: content.apiData?.releaseDate || content.releaseDate || content.year
      }))
    };
  });

  // Card tıklama handler'ı
  const handleCardClick = (item) => {
    setSelectedItem(item);
  };

  // Show all modal handler
  const handleShowAll = (title, items) => {
    setShowAllModal({
      isOpen: true,
      title,
      items
    });
  };

  const handleCloseShowAll = () => {
    setShowAllModal({ isOpen: false, title: '', items: [] });
  };

  const { isDragging } = useDrag();

  // Refs for each slider element (used for scrollIntoView / layout behavior)
  const sliderRefs = useRef({});

  // Quick move için slider listesi ve handler
  const quickMoveConfig = {
    availableSliders: sliders.map(slider => ({
      id: slider.id,
      title: slider.title
    })),
    handler: (item, fromSliderId, toSliderId) => {
      if (fromSliderId !== toSliderId) {
        handleCardMove(item, fromSliderId, toSliderId);
      }
    }
  };

  // Card taşıma handler'ı - slider'lar arası
  const handleCardMove = (cardItem, fromSliderId, toSliderId) => {
    // Slider ID'lerini status ID'lerine çevir
    const fromStatusId = fromSliderId.replace('anime-', '');
    const toStatusId = toSliderId.replace('anime-', '');
    
    // Anime sayfasında olduğumuz için pageId'yi 'anime' olarak geç
    const success = moveContentBetweenStatuses(cardItem, fromStatusId, toStatusId, PAGES.ANIME);
    if (success) {
      // Kart taşındıktan sonra hedef slider'a scroll
      setTimeout(() => {
        const ref = sliderRefs.current[toSliderId];
        ref?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
      }, 200); // animasyon için küçük bir gecikme
    }
  };


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
              {sliders.map(slider => (
                <Slider
                  key={slider.id}
                  rootRef={el => (sliderRefs.current[slider.id] = el)}
                  title={slider.title}
                  items={slider.items}
                  onCardClick={handleCardClick}
                  onCardMove={handleCardMove}
                  sliderId={slider.id}
                  onQuickMove={quickMoveConfig}
                  onShowAll={handleShowAll}
                />
              ))}
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
          onClose={handleCloseShowAll}
          onCardClick={handleCardClick}
        />
      )}
      </main>
    </>
  );
};

export default Anime;
