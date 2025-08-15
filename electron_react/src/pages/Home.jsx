import React, { useState, useEffect } from 'react';
import Slider from '../components/Slider';
import SliderManager from '../components/SliderManager';
import SearchButton from '../components/SearchButton';
import DetailModal from '../components/DetailModal';
import useContentStore from '../config/initialData';

const Home = () => {
  // Ana içeriğe atla için ref
  const mainContentRef = React.useRef(null);
  const [showManager, setShowManager] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Zustand store'dan verileri al
  const { 
    getPages, 
    getStatusesByPage,
    getContentsByPageAndStatus,
    initializeStore 
  } = useContentStore();

  // Initialize store on component mount
  useEffect(() => {
    initializeStore();
  }, [initializeStore]);

  // Tüm sayfalardaki içerikleri slider formatında hazırla
  const getSliderData = () => {
    const pages = getPages();
    if (!pages) return [];
    const sliders = [];

    pages.forEach(page => {
      const statuses = getStatusesByPage(page.id);
      statuses.forEach(status => {
        const contents = getContentsByPageAndStatus(page.id, status.id);
        if (contents.length > 0) {
          sliders.push({
            id: `${page.id}-${status.id}`,
            title: `${page.title} - ${status.title}`,
            items: contents.map(content => ({
              id: content.id,
              apiData: content.apiData || {},
              seasons: content.seasons || {},
              ...content.apiData
            }))
          });
        }
      });
    });

    return sliders;
  };

  // Card tıklama handler'ı
  const handleCardClick = (item) => {
    setSelectedItem(item);
  };

  const handleManagerClose = () => {
    setShowManager(false);
  };

  // Loading kontrolü önce yapılmalı
  const isLoading = !getPages() || getPages().length === 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 pt-28 flex items-center justify-center">
  <span className="text-muted text-xl">Yükleniyor...</span>
      </div>
    );
  }

  // Slider verilerini al (loading kontrolünden sonra)
  const sliderData = getSliderData();

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
        style={{
          '--accent': 'var(--accent)',
          '--accent-shadow': '0 4px 24px 0 color-mix(in srgb, var(--accent) 70%, transparent)',
          '--accent-ring': 'color-mix(in srgb, var(--accent) 70%, transparent)'
        }}
        tabIndex={0}
      >
        İçeriğe atla
      </a>
      <main className="min-h-screen bg-neutral-950" aria-label="Ana Sayfa Ana İçerik">
        {/* Header */}
  <header className="pt-28 pb-10 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-semibold text-white">
                  Ana Sayfa
                </h1>
                <p className="text-lg text-gray-400">Tüm koleksiyonunuzun özeti</p>
                <div className="flex items-center gap-3 mt-3">
                  <div className="h-1 w-16 rounded-full shadow-sm" style={{ background: 'linear-gradient(90deg, color-mix(in srgb, var(--accent) 60%, transparent), color-mix(in srgb, var(--accent) 40%, transparent))', boxShadow: '0 1px 6px 0 color-mix(in srgb, var(--accent) 10%, transparent)' }}></div>
                  <span className="text-sm text-gray-500 font-normal">
                    {sliderData.reduce((total, slider) => total + slider.items.length, 0)} İçerik
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <SearchButton 
                  category="all"
                  className="shadow-xl"
                  style={{ backgroundColor: 'var(--accent)', boxShadow: '0 4px 24px 0 color-mix(in srgb, var(--accent) 25%, transparent)' }}
                />
                <button
                  onClick={() => setShowManager(true)}
                  className="px-6 py-3 text-black rounded-xl font-medium transition-all duration-300 border flex items-center gap-2 hover:scale-105"
                  style={{ backgroundColor: 'var(--accent)', borderColor: 'color-mix(in srgb, var(--accent) 50%, transparent)', boxShadow: '0 4px 24px 0 color-mix(in srgb, var(--accent) 25%, transparent)' }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-label="Listeler" focusable="false">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                  </svg>
                  Listeler
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
  <section className="px-4 sm:px-8 pb-16" id="main-content" tabIndex={-1} ref={mainContentRef} aria-label="Koleksiyon Sliders">
          <div className="max-w-7xl mx-auto">
            {sliderData.length === 0 ? (
              /* Empty State */
              <div className="flex items-center justify-center min-h-96">
                <div className="text-center max-w-md">
                  <div className="w-20 h-20 mx-auto mb-6 bg-neutral-800 rounded-3xl flex items-center justify-center">
                    <svg className="w-10 h-10 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false">
                        <title>İçerik Yok</title>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-500 mb-4">Henüz İçerik Yok</h2>
                  <p className="text-neutral-400 mb-6">
                    Koleksiyonunu oluşturmaya başla! Arama yaparak içerik ekleyebilir ve listeler oluşturabilirsin.
                  </p>
                  <SearchButton 
                    category="all" 
                    className="bg-lime-500 hover:bg-lime-400"
                  />
                </div>
              </div>
            ) : (
              /* Sliders */
              <div className="space-y-8">
                {sliderData.map((slider) => (
                  <Slider 
                    key={slider.id}
                    title={<h2 className="text-xl font-semibold text-neutral-100 mb-2">{slider.title}</h2>}
                    items={slider.items} 
                    onCardClick={handleCardClick}
                    sliderId={slider.id}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Modal Components */}
        {showManager && (
          <SliderManager 
            onClose={handleManagerClose}
            page="anasayfa"
          />
        )}

        {selectedItem && (
          <DetailModal 
            item={selectedItem} 
            onClose={() => setSelectedItem(null)} 
          />
        )}
      </main>
    </>
  );
};

export default Home;
