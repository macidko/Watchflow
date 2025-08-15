import React, { useState, useEffect } from 'react';
import Slider from '../components/Slider';
import SliderManager from '../components/SliderManager';
import SearchButton from '../components/SearchButton';
import DetailModal from '../components/DetailModal';
import useContentStore from '../config/initialData';

const Film = () => {
  // Ana içeriğe atla için ref
  const mainContentRef = React.useRef(null);
  const [showManager, setShowManager] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
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
  const filmStatuses = getStatusesByPage('film');
  const sliders = filmStatuses.map(status => {
    const contents = getContentsByPageAndStatus('film', status.id);
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

  // Card taşıma handler'ı - slider'lar arası
  const handleCardMove = (cardItem, fromSliderId, toSliderId) => {
    console.log('handleCardMove called:', { cardItem, fromSliderId, toSliderId });
    
    // Slider ID'lerini status ID'lerine çevir
    // slider ID format: "film-statusId" (örn: "film-to-watch")
    const fromStatusId = fromSliderId.replace('film-', '');
    const toStatusId = toSliderId.replace('film-', '');
    
    console.log('Status IDs:', { fromStatusId, toStatusId });
    
    const success = moveContentBetweenStatuses(cardItem, fromStatusId, toStatusId);
    console.log('Move result:', success);
    
    if (success) {
      console.log('Move successful, no need to reinitialize store');
      // Zustand otomatik olarak re-render yapar, initializeStore() gerek yok
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
  style={{ background: 'var(--accent)', color: 'black', boxShadow: '0 4px 24px 0 color-mix(in srgb, var(--accent) 70%, transparent)', outlineColor: 'color-mix(in srgb, var(--accent) 70%, transparent)' }}
        tabIndex={0}
      >
        İçeriğe atla
      </a>
      <div className="min-h-screen bg-neutral-950">
      {/* Header */}
      <div className="pt-28 pb-10 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-semibold text-white">Filmler</h1>
              <p className="text-lg text-gray-400">İzlediğin ve izleyeceğin filmleri organize et</p>
              <div className="flex items-center gap-3 mt-3">
                <div className="h-1 w-16 rounded-full shadow-sm" style={{ background: 'linear-gradient(90deg, color-mix(in srgb, var(--accent) 60%, transparent), color-mix(in srgb, var(--accent) 40%, transparent))', boxShadow: '0 1px 6px 0 color-mix(in srgb, var(--accent) 10%, transparent)' }}></div>
                <span className="text-sm text-gray-500 font-normal">
                  {sliders.reduce((total, slider) => total + slider.items.length, 0)} Film
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <SearchButton 
                category="film" 
                className="shadow-xl"
                style={{ background: 'var(--accent)', boxShadow: '0 4px 24px 0 color-mix(in srgb, var(--accent) 25%, transparent)' }}
              />
              <button
                onClick={() => setShowManager(true)}
                className="px-6 py-3 text-black rounded-xl font-medium transition-all duration-300 border flex items-center gap-2 hover:scale-105"
                style={{ background: 'var(--accent)', borderColor: 'color-mix(in srgb, var(--accent) 50%, transparent)', boxShadow: '0 4px 24px 0 color-mix(in srgb, var(--accent) 25%, transparent)' }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-label="Listeler" focusable="false">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
                Listeler
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-8 pb-16" id="main-content" tabIndex={-1} ref={mainContentRef}>
        <div className="max-w-7xl mx-auto">
          {sliders.length === 0 ? (
            /* Empty State */
            <div className="flex items-center justify-center min-h-96">
              <div className="text-center max-w-md">
                <div className="w-20 h-20 mx-auto mb-6 bg-neutral-800 rounded-3xl flex items-center justify-center">
                  <svg className="w-10 h-10 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false">
                      <title>Film Yok</title>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h4a1 1 0 011 1v18a1 1 0 01-1 1H3a1 1 0 01-1-1V1a1 1 0 011-1h4a1 1 0 011 1v3m0 0h8M7 4H3" />
                    </svg>
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-500 mb-4">Henüz Film Yok</h2>
                <p className="text-neutral-400 mb-6">
                  Film koleksiyonunu oluşturmaya başla! Arama yaparak filmler ekleyebilir ve listeler oluşturabilirsin.
                </p>
                <SearchButton 
                  category="film" 
                  className=""
                  style={{ background: 'var(--accent)' }}
                />
              </div>
            </div>
          ) : (
            /* Sliders */
            <div className="space-y-10">
              {sliders.map(slider => (
                <Slider
                  key={slider.id}
                  title={<h2 className="text-xl font-semibold text-neutral-100 mb-2">{slider.title}</h2>}
                  items={slider.items}
                  onCardClick={handleCardClick}
                  onCardMove={handleCardMove}
                  sliderId={slider.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showManager && (
        <SliderManager 
          page="film" 
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