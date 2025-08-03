import React, { useState, useEffect, useCallback } from 'react';
import { 
  getAllPageSliders, 
  addSlider, 
  reorderSliders, 
  toggleSliderVisibility, 
  deleteSlider, 
  updateSlider
} from '../config/dataUtils';

// Custom hook for debouncing
const useDebounce = (callback, delay) => {
  const [debounceTimer, setDebounceTimer] = useState();
  
  const debouncedCallback = useCallback((...args) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    
    const newTimer = setTimeout(() => {
      callback(...args);
    }, delay);
    
    setDebounceTimer(newTimer);
  }, [callback, delay, debounceTimer]);
  
  return debouncedCallback;
};

const SliderManager = ({ page, onClose }) => {
  const [sliders, setSliders] = useState([]);
  const [draggedItem, setDraggedItem] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSliderTitle, setNewSliderTitle] = useState('');
  const [newSliderType, setNewSliderType] = useState('movies');

  const loadSliders = useCallback(() => {
    const pageSliders = getAllPageSliders(page);
    setSliders(pageSliders);
  }, [page]);

  // Debounced title update
  const debouncedTitleUpdate = useDebounce((sliderId, newTitle) => {
    if (newTitle.trim()) {
      updateSlider(page, sliderId, { title: newTitle });
    }
  }, 500);

  useEffect(() => {
    loadSliders();
  }, [loadSliders]);

  const handleDragStart = (e, sliderId) => {
    setDraggedItem(sliderId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    
    if (!draggedItem) return;

    const draggedIndex = sliders.findIndex(s => s.id === draggedItem);
    if (draggedIndex === -1 || draggedIndex === targetIndex) {
      setDraggedItem(null);
      return;
    }

    // Create new array with reordered items
    const reorderedSliders = [...sliders];
    const [draggedSlider] = reorderedSliders.splice(draggedIndex, 1);
    reorderedSliders.splice(targetIndex, 0, draggedSlider);

    // Update local state immediately
    setSliders(reorderedSliders);
    setDraggedItem(null);

    // Save to storage
    const newOrder = reorderedSliders.map(s => s.id);
    reorderSliders(page, newOrder);
  };

  const handleAddSlider = () => {
    if (!newSliderTitle.trim()) return;

    const newSlider = addSlider(page, {
      title: newSliderTitle,
      type: newSliderType
    });

    setSliders([...sliders, newSlider]);
    setNewSliderTitle('');
    setShowAddForm(false);
  };

  const handleToggleVisibility = (sliderId) => {
    // Optimistic update
    setSliders(prev => prev.map(slider => 
      slider.id === sliderId 
        ? { ...slider, visible: !slider.visible }
        : slider
    ));

    toggleSliderVisibility(page, sliderId);
  };

  const handleDeleteSlider = (sliderId) => {
    if (window.confirm('Bu slider\'ı silmek istediğinizden emin misiniz?')) {
      setSliders(prev => prev.filter(s => s.id !== sliderId));
      deleteSlider(page, sliderId);
    }
  };

  const handleEditTitle = (sliderId, newTitle) => {
    // Update local state immediately
    setSliders(prev => prev.map(slider => 
      slider.id === sliderId 
        ? { ...slider, title: newTitle }
        : slider
    ));

    // Debounced save
    debouncedTitleUpdate(sliderId, newTitle);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-zinc-800 rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            {page.charAt(0).toUpperCase() + page.slice(1)} - Slider Yönetimi
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Add New Slider */}
        <div className="mb-6">
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Yeni Slider Ekle
            </button>
          ) : (
            <div className="bg-zinc-700 p-4 rounded-lg">
              <div className="flex gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Slider başlığı"
                  value={newSliderTitle}
                  onChange={(e) => setNewSliderTitle(e.target.value)}
                  className="flex-1 bg-zinc-600 text-white px-3 py-2 rounded border-none outline-none"
                />
                <select
                  value={newSliderType}
                  onChange={(e) => setNewSliderType(e.target.value)}
                  className="bg-zinc-600 text-white px-3 py-2 rounded border-none outline-none"
                >
                  <option value="movies">Film</option>
                  <option value="series">Dizi</option>
                  <option value="anime">Anime</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddSlider}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                >
                  Ekle
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewSliderTitle('');
                  }}
                  className="bg-zinc-600 hover:bg-zinc-700 text-white px-4 py-2 rounded"
                >
                  İptal
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sliders List */}
        <div className="space-y-4">
          {sliders.map((slider, index) => (
            <div
              key={slider.id}
              draggable
              onDragStart={(e) => handleDragStart(e, slider.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              className={`bg-zinc-700 p-4 rounded-lg cursor-move transition-opacity ${
                draggedItem === slider.id ? 'opacity-50' : ''
              } ${!slider.visible ? 'opacity-60' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center text-zinc-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    <span className="text-xs">{index + 1}</span>
                  </div>
                  
                  <div>
                    <input
                      type="text"
                      value={slider.title}
                      onChange={(e) => handleEditTitle(slider.id, e.target.value)}
                      className="bg-transparent text-white text-lg font-semibold border-none outline-none"
                    />
                    <div className="flex items-center gap-4 text-sm text-zinc-400">
                      <span>Tür: {slider.type}</span>
                      <span>Oluşturulma: {slider.createdAt}</span>
                      <span>İtem sayısı: {slider.items?.length || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleVisibility(slider.id)}
                    className={`p-2 rounded ${
                      slider.visible 
                        ? 'text-green-400 hover:bg-green-400/20' 
                        : 'text-zinc-500 hover:bg-zinc-600'
                    }`}
                    title={slider.visible ? 'Gizle' : 'Göster'}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {slider.visible ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      )}
                    </svg>
                  </button>
                  
                  <button
                    onClick={() => handleDeleteSlider(slider.id)}
                    className="p-2 text-red-400 hover:bg-red-400/20 rounded"
                    title="Sil"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {sliders.length === 0 && (
          <div className="text-center text-zinc-400 py-8">
            Bu sayfada henüz slider bulunmuyor.
          </div>
        )}
      </div>
    </div>
  );
};

export default SliderManager;
