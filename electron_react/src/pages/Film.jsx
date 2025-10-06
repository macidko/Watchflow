import React, { useEffect, useState, useRef } from 'react';
import DynamicSlider from '../components/layout/DynamicSlider';
import SliderManager from '../components/layout/SliderManager';
import SearchButton from '../components/common/SearchButton';
import DetailModal from '../components/modals/DetailModal';
import ShowAllModal from '../components/modals/ShowAllModal';
import ViewSwitcher from '../components/layout/ViewSwitcher';
import useContentStore from '../config/initialData';
import { useDrag } from '../contexts/DragContext';
import useViewMode from '../hooks/useViewMode';
import '../css/pages/common.css';
import { CATEGORIES, PAGES } from '../config/constants';
import { t } from '../i18n';

const Film = () => {
  // Ana içeriğe atla için ref
  const mainContentRef = useRef(null);
  const [showManager, setShowManager] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showAllModal, setShowAllModal] = useState({ isOpen: false, title: '', items: [] });
  
  // Görünüm modu için custom hook (grid/list)
  const { viewMode, toggleViewMode } = useViewMode(PAGES.FILM);
  
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

  // Film sayfası için slider verilerini hazırla
  // Zustand store'dan slider listesini doğrudan oluştur
  const filmStatuses = getStatusesByPage(PAGES.FILM);
  const sliders = filmStatuses.map(status => {
    const contents = getContentsByPageAndStatus(PAGES.FILM, status.id);
    return {
      id: `film-${status.id}`,
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

  // Tümünü göster handler'ı
  const handleShowAll = (title, items) => {
    setShowAllModal({
      isOpen: true,
      title: title,
      items: items
    });
  };

  const handleShowAllClose = () => {
    setShowAllModal({ isOpen: false, title: '', items: [] });
  };

  const { isDragging } = useDrag();

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

  // Her slider için ref dizisi oluştur
  const sliderRefs = useRef({});

  // Card taşıma handler'ı - slider'lar arası
  const handleCardMove = (cardItem, fromSliderId, toSliderId) => {
    // Slider ID'lerini status ID'lerine çevir
    const fromStatusId = fromSliderId.replace('film-', '');
    const toStatusId = toSliderId.replace('film-', '');
    const success = moveContentBetweenStatuses(cardItem, fromStatusId, toStatusId, PAGES.FILM);
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
              {sliders.map(slider => (
                <DynamicSlider
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