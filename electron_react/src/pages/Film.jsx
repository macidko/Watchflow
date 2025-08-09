import React, { useState, useEffect } from 'react';
import Slider from '../components/Slider';
import SliderManager from '../components/SliderManager';
import SearchButton from '../components/SearchButton';
import DetailModal from '../components/DetailModal';
import useContentStore from '../config/initialData';

const Film = () => {
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
  const getSliderData = () => {
    const filmStatuses = getStatusesByPage('film');
    const sliders = [];

    filmStatuses.forEach(status => {
      const contents = getContentsByPageAndStatus('film', status.id);
      sliders.push({
        id: `film-${status.id}`,
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

  // Card taşıma handler'ı - slider'lar arası
  const handleCardMove = (item, sourceSlider, targetSlider) => {
    console.log('Moving card:', { item: item.title, sourceSlider, targetSlider });
    
    // Slider ID'lerinden status ID'lerini çıkar
    const sourceStatusId = sourceSlider.replace('film-', '');
    const targetStatusId = targetSlider.replace('film-', '');
    
    moveContentBetweenStatuses(item.id, 'film', sourceStatusId, targetStatusId);
  };

  const sliders = getSliderData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <div className="pt-32 pb-12 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex flex-col space-y-2">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                Filmler
              </h1>
              <p className="text-lg text-gray-400">İzlediğin ve izleyeceğin filmleri organize et</p>
              <div className="flex items-center gap-4 mt-4">
                <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
                <span className="text-sm text-gray-500 font-medium">
                  {sliders.reduce((total, slider) => total + slider.items.length, 0)} Film
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <SearchButton 
                category="film" 
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-xl"
              />
              <button
                onClick={() => setShowManager(true)}
                className="px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white rounded-xl font-medium transition-all duration-300 shadow-xl border border-gray-600/50 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
                Listeler
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 pb-16">
        <div className="max-w-7xl mx-auto">
          {sliders.length === 0 ? (
            /* Empty State */
            <div className="flex items-center justify-center min-h-96">
              <div className="text-center max-w-md">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-700 to-gray-800 rounded-3xl flex items-center justify-center">
                  <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h4a1 1 0 011 1v18a1 1 0 01-1 1H3a1 1 0 01-1-1V1a1 1 0 011-1h4a1 1 0 011 1v3m0 0h8M7 4H3" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-300 mb-4">Henüz Film Yok</h2>
                <p className="text-gray-500 mb-6">
                  Film koleksiyonunu oluşturmaya başla! Arama yaparak filmler ekleyebilir ve listeler oluşturabilirsin.
                </p>
                <SearchButton 
                  category="film" 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                />
              </div>
            </div>
          ) : (
            /* Sliders */
            <div className="space-y-8">
              {sliders.map(slider => (
                <Slider
                  key={slider.id}
                  title={slider.title}
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
          pageId="film" 
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
  );
};

export default Film;