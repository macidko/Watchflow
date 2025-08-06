import React, { useState, useEffect } from 'react';
import Slider from '../components/Slider';
import SliderManager from '../components/SliderManager';
import SearchButton from '../components/SearchButton';
import DetailModal from '../components/DetailModal';
import useContentStore from '../config/initialData';

const Dizi = () => {
  const [showManager, setShowManager] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null); 
  // Zustand store'dan verileri al
  const { 
    getStatusesByPage, 
    getContentsByPageAndStatus,
    initializeStore 
  } = useContentStore();

  // Initialize store on component mount
  useEffect(() => {
    initializeStore();
  }, [initializeStore]);

  // Dizi sayfası için slider verilerini hazırla
  const getSliderData = () => {
    const diziStatuses = getStatusesByPage('dizi');
    const sliders = [];

    diziStatuses.forEach(status => {
      const contents = getContentsByPageAndStatus('dizi', status.id);
      sliders.push({
        id: `dizi-${status.id}`,
        title: status.title,
        items: contents.map(content => ({
          id: content.id,
          apiData: content.apiData || {},
          seasons: content.seasons || {},
          ...content.apiData
        }))
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
    // Store otomatik olarak güncellendiği için reload'a gerek yok
  };


  // Slider verilerini al
  const isLoading = !getStatusesByPage('dizi') || getStatusesByPage('dizi').length === 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-900 pt-28 flex items-center justify-center">
        <span className="text-white text-xl">Yükleniyor...</span>
      </div>
    );
  }

  const sliderData = getSliderData();

  return (
    <div className="min-h-screen bg-zinc-900 pt-28">
      <div className="max-w-7xl mx-auto relative">
        {/* Slider Yönetimi Butonu - Kompakt */}
        <button
          onClick={() => setShowManager(true)}
          className="fixed top-32 right-6 z-40 w-12 h-12 bg-orange-600 hover:bg-orange-700 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          title="Slider Yönetimi"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
          </svg>
        </button>

        <div className="px-6 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Diziler</h1>
            <p className="text-zinc-400">Tüm dizi koleksiyonunuz</p>
          </div>
        </div>
        
        {sliderData.map((slider) => (
          <Slider 
            key={slider.id}
            title={slider.title} 
            items={slider.items} 
            onCardClick={handleCardClick} 
          />
        ))}

        {/* Slider Manager Modal */}
        {showManager && (
          <SliderManager
            page="dizi"
            onClose={handleManagerClose}
          />
        )}

        {/* Search Button */}
        <SearchButton />
        {selectedItem && (
          <DetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
        )}
      </div>
    </div>
  );
};

export default Dizi;
