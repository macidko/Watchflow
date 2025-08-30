import React, { useState, useEffect, useRef } from 'react';
import Slider from '../components/Slider';
import SliderManager from '../components/SliderManager';
import SearchButton from '../components/SearchButton';
import DetailModal from '../components/DetailModal';
import ViewSwitcher from '../components/ViewSwitcher';
import useContentStore from '../config/initialData';
import { useDrag } from '../contexts/DragContext';
import useViewMode from '../hooks/useViewMode';
import { CATEGORIES, PAGES } from '../config/constants';
import { t } from '../i18n';

const Film = () => {
  // Ana içeriğe atla için ref
  const mainContentRef = useRef(null);
  const [showManager, setShowManager] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
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
        id: content.id,
        apiData: content.apiData || {},
        seasons: content.seasons || {},
        ...content.apiData
      }))
    };
  });

  // Card tıklama handler'ı
  const handleCardClick = (item) => {
    setSelectedItem(item);
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
        if (ref && ref.scrollIntoView) {
          ref.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
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
  className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:px-6 focus:py-3 focus:shadow-xl focus:outline-none focus:ring-2 transition-all"
  style={{ background: 'var(--accent-color)', color: 'var(--primary-text)', boxShadow: '0 4px 24px 0 color-mix(in srgb, var(--accent-color) 70%, transparent)', outlineColor: 'color-mix(in srgb, var(--accent-color) 70%, transparent)' }}
        tabIndex={0}
      >
        {t('common.skipToContent')}
      </a>
  <div style={{ minHeight: '100vh', background: 'var(--primary-bg)' }}>
      {/* Header */}
      <div style={{ paddingTop: 112, paddingBottom: 40, paddingLeft: 16, paddingRight: 16 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <h1 style={{ fontSize: 30, fontWeight: 600, color: 'var(--primary-text)' }}>{t('pages.film.title')}</h1>
              <p style={{ fontSize: 18, color: 'var(--secondary-text)' }}>{t('pages.film.description')}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
                <div style={{ height: 4, width: 64, borderRadius: 999, boxShadow: 'var(--card-shadow)', background: 'linear-gradient(90deg, var(--accent-color) 60%, transparent 100%)' }}></div>
                <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 400 }}>
                  {sliders.reduce((total, slider) => total + slider.items.length, 0)} {t('pages.film.count')}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <ViewSwitcher viewMode={viewMode} toggleViewMode={toggleViewMode} />
              <SearchButton 
                category={CATEGORIES.FILM} 
                style={{ background: 'var(--accent-color)', color: 'var(--primary-text)', boxShadow: '0 4px 24px 0 color-mix(in srgb, var(--accent-color) 25%, transparent)' }}
              />
              <button
                onClick={() => setShowManager(true)}
                style={{ padding: '12px 24px', color: 'var(--primary-text)', background: 'var(--accent-color)', borderRadius: 16, fontWeight: 500, border: '1px solid color-mix(in srgb, var(--accent-color) 50%, transparent)', boxShadow: '0 4px 24px 0 color-mix(in srgb, var(--accent-color) 25%, transparent)', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.3s' }}
              >
                <svg style={{ width: 20, height: 20 }} fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-label={t('common.lists')} focusable="false">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
                {t('common.lists')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ paddingLeft: 16, paddingRight: 16, paddingBottom: 64 }} id="main-content" tabIndex={-1} ref={mainContentRef}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          {sliders.length === 0 ? (
            /* Empty State */
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 384 }}>
              <div style={{ textAlign: 'center', maxWidth: 400 }}>
                <div style={{ width: 80, height: 80, margin: '0 auto', marginBottom: 24, background: 'var(--card-bg)', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg style={{ width: 40, height: 40, color: 'var(--secondary-text)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <svg style={{ width: 32, height: 32, margin: '0 auto 8px auto' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false">
                      <title>{t('pages.film.empty.noContentTitle')}</title>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h4a1 1 0 011 1v18a1 1 0 01-1 1H3a1 1 0 01-1-1V1a1 1 0 011-1h4a1 1 0 011 1v3m0 0h8M7 4H3" />
                    </svg>
                  </svg>
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 16 }}>{t('pages.film.empty.noContentTitle')}</h2>
                <p style={{ color: 'var(--secondary-text)', marginBottom: 24 }}>
                  {t('pages.film.empty.noContentDescription')}
                </p>
                <SearchButton 
                  category={CATEGORIES.FILM} 
                  style={{ background: 'var(--accent-color)', color: 'var(--primary-text)' }}
                />
              </div>
            </div>
          ) : (
            <div className={'sliders ' + (isDragging ? 'compact' : viewMode)}>
              {sliders.map(slider => (
                <Slider
                  key={slider.id}
                  rootRef={el => (sliderRefs.current[slider.id] = el)}
                  title={<h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--primary-text)', marginBottom: 8 }}>{slider.title}</h2>}
                  items={slider.items}
                  onCardClick={handleCardClick}
                  onCardMove={handleCardMove}
                  sliderId={slider.id}
                  onQuickMove={quickMoveConfig}
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
      </div>
    </>
  );
};

export default Film;