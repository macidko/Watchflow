import React, { useState, useEffect } from 'react';
import Slider from '../components/Slider';
import SliderManager from '../components/SliderManager';
import SearchButton from '../components/SearchButton';
import DetailModal from '../components/DetailModal';
import useContentStore from '../config/initialData';

const Dizi = () => {
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

  // Dizi sayfası için slider verilerini hazırla
  // Zustand store'dan slider listesini doğrudan oluştur
  const diziStatuses = getStatusesByPage('dizi');
  const sliders = diziStatuses.map(status => {
    const contents = getContentsByPageAndStatus('dizi', status.id);
    return {
      id: `dizi-${status.id}`,
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
    const fromStatusId = fromSliderId.replace('dizi-', '');
    const toStatusId = toSliderId.replace('dizi-', '');
    
    const success = moveContentBetweenStatuses(cardItem, fromStatusId, toStatusId);
    console.log('Move result:', success);
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
              <h1 className="text-3xl font-semibold text-white">
                Diziler
              </h1>
              <p className="text-lg text-gray-400">İzlediğin ve izleyeceğin dizileri organize et</p>
              <div className="flex items-center gap-3 mt-3">
                <div className="h-1 w-16 rounded-full shadow-sm" style={{ background: 'linear-gradient(90deg, color-mix(in srgb, var(--accent) 60%, transparent), color-mix(in srgb, var(--accent) 40%, transparent))', boxShadow: '0 1px 6px 0 color-mix(in srgb, var(--accent) 10%, transparent)' }}></div>
                <span className="text-sm text-gray-500 font-normal">
                  {sliders.reduce((total, slider) => total + slider.items.length, 0)} Dizi
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <SearchButton 
                category="dizi" 
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
                      <title>Dizi Yok</title>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-500 mb-4">Henüz Dizi Yok</h2>
                <p className="text-neutral-400 mb-6">
                  Dizi koleksiyonunu oluşturmaya başla! Arama yaparak diziler ekleyebilir ve listeler oluşturabilirsin.
                </p>
                <SearchButton 
                  category="dizi" 
                  className=""
                  style={{ background: 'var(--accent)' }}
                />
              </div>
            </div>
          ) : (
            /* Sliders */
            <div className="space-y-8">
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

      {/* Modal Components */}
      {showManager && (
        <SliderManager 
          onClose={() => setShowManager(false)}
          page="dizi"
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

export default Dizi;
