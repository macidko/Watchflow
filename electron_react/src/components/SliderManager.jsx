import React, { useState, useCallback, useRef, useEffect } from 'react';
import useContentStore from '../config/initialData';

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
  const [draggedItem, setDraggedItem] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSliderTitle, setNewSliderTitle] = useState('');
  const [addError, setAddError] = useState('');
  const [newSliderType, setNewSliderType] = useState('film');
  const addInputRef = useRef(null);
  const modalRef = useRef(null);
  // Focus trap ve ESC ile kapama
  useEffect(() => {
    const focusableSelectors = [
      'button', 'a[href]', 'input', 'select', 'textarea', '[tabindex]:not([tabindex="-1"])'
    ];
    const node = modalRef.current;
    if (!node) return;
    // İlk odaklanabilir elemana odaklan
    const focusables = node.querySelectorAll(focusableSelectors.join(','));
    if (focusables.length) focusables[0].focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Tab') {
        // Focus trap
        const focusable = Array.from(node.querySelectorAll(focusableSelectors.join(',')));
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };
    node.addEventListener('keydown', handleKeyDown);
    return () => node.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Zustand store'dan fonksiyonları al
  const { 
    getStatusesByPage, 
    addStatus,
    updateStatus,
    deleteStatus,
    toggleStatusVisibility,
    reorderStatuses
  } = useContentStore();

  // Slider verilerini Zustand'dan al
  const sliders = getStatusesByPage(page) || [];

  // Debounced title update
  const debouncedTitleUpdate = useDebounce((statusId, newTitle) => {
    if (newTitle.trim()) {
      updateStatus(page, statusId, { title: newTitle });
    }
  }, 500);

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

    // Yeni sıralama dizisi oluştur
    const newOrder = [...sliders];
    const [draggedSlider] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedSlider);

    // Zustand store'da sıralamayı güncelle
    const reorderedIds = newOrder.map(s => s.id);
    reorderStatuses(page, reorderedIds);
    
    setDraggedItem(null);
  };

  const handleAddSlider = () => {
    if (!newSliderTitle.trim() || newSliderTitle.trim().length < 3) {
      setAddError('Lütfen en az 3 karakterlik bir başlık girin.');
      if (addInputRef.current) addInputRef.current.focus();
      return;
    }
    setAddError('');
    addStatus(page, {
      title: newSliderTitle,
      type: 'custom'
    });
    setNewSliderTitle('');
    setShowAddForm(false);
  };

  const handleToggleVisibility = (sliderId) => {
    toggleStatusVisibility(page, sliderId);
  };

  const handleDeleteSlider = (sliderId) => {
    if (window.confirm('Bu slider\'ı silmek istediğinizden emin misiniz?')) {
      deleteStatus(page, sliderId);
    }
  };

  useEffect(() => {
    if (showAddForm && addInputRef.current) {
      addInputRef.current.focus();
    }
  }, [showAddForm]);

  const isAddValid = newSliderTitle.trim().length >= 3;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-2 sm:px-0" tabIndex={-1} onClick={onClose}>
      <div
        ref={modalRef}
        className="relative w-full max-w-lg bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-700 p-6 sm:p-8 flex flex-col gap-5 sm:gap-6"
        tabIndex={0}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between mb-1 sm:mb-2 gap-2">
          <h2 className="text-xl font-semibold text-white drop-shadow-lg">
            Listeleri Yönet
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-700 transition-all focus-visible:outline-none focus-visible:ring-2"
            style={{ boxShadow: '0 0 0 2px var(--accent)' }}
            title="Kapat"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Slider List */}
  <div className="space-y-3 sm:space-y-4">
          {sliders.map((slider, idx) => (
            <div
              key={slider.id}
              className={`flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 rounded-xl border bg-neutral-800/80 shadow-md transition-all duration-300 ${draggedItem === slider.id ? 'ring-2' : 'hover:shadow-lg hover:bg-neutral-700/90'}`}
              style={draggedItem === slider.id ? { boxShadow: '0 0 0 2px var(--accent)' } : { borderColor: '#52525b' }}
              draggable
              onDragStart={e => handleDragStart(e, slider.id)}
              onDragOver={handleDragOver}
              onDrop={e => handleDrop(e, idx)}
            >
              {/* Drag Icon */}
              <span className="mr-3 cursor-grab text-neutral-500 hover:text-neutral-300 transition-all" title="Sürükle">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="6" cy="7" r="1.5" />
                  <circle cx="6" cy="12" r="1.5" />
                  <circle cx="6" cy="17" r="1.5" />
                  <circle cx="18" cy="7" r="1.5" />
                  <circle cx="18" cy="12" r="1.5" />
                  <circle cx="18" cy="17" r="1.5" />
                </svg>
              </span>
              <div className="flex items-center gap-2 sm:gap-3 flex-1">
                <input
                  type="text"
                  value={slider.title}
                  onChange={e => debouncedTitleUpdate(slider.id, e.target.value)}
                  className="bg-transparent text-lg font-normal text-white border-none outline-none px-1.5 py-1 rounded-md focus:bg-gray-900/60 focus:ring-2 transition-all"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 bg-gray-700 text-gray-500 rounded-full">
                  {slider.type}
                </span>
                <button
                  onClick={() => handleToggleVisibility(slider.id)}
                  className={`p-2 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2`}
                  style={slider.visible ? { background: 'color-mix(in srgb, var(--accent) 20%, transparent)', color: 'var(--accent)' } : { background: '#374151', color: '#6b7280' }}
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
                  className="p-2 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2"
                  style={{ background: 'color-mix(in srgb, var(--accent) 20%, transparent)', color: 'var(--accent)' }}
                  title="Sil"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
          {sliders.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              Bu sayfada henüz liste bulunmuyor.
            </div>
          )}
        </div>
        {/* Add New List Button ve Modal */}
        <div>
          <div className="flex justify-end mt-5">
            <button
              onClick={() => setShowAddForm(true)}
              className="px-5 py-2 text-black font-medium rounded-xl shadow-lg transition-all duration-300 hover:scale-105 focus-visible:outline-none focus-visible:ring-2"
              style={{ background: 'var(--accent)', boxShadow: '0 4px 24px 0 color-mix(in srgb, var(--accent) 25%, transparent)' }}
            >
              + Yeni Liste
            </button>
          </div>
          {showAddForm && (
            <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <div className="bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-700 p-8 w-full max-w-sm flex flex-col gap-6">
                <h3 className="text-lg font-semibold text-white mb-2">Yeni Liste Oluştur</h3>
                <div className="flex flex-col gap-4">
                  <input
                    ref={addInputRef}
                    type="text"
                    value={newSliderTitle}
                    onChange={e => {
                      setNewSliderTitle(e.target.value);
                      if (addError) setAddError('');
                    }}
                    placeholder="Liste adı... (en az 3 karakter)"
                    className={`bg-neutral-800 text-white px-4 py-2 rounded-lg border ${addError ? 'border-red-500' : 'border-neutral-700'} focus:ring-2 focus:ring-neutral-400 outline-none`}
                    aria-label="Yeni liste adı"
                    aria-invalid={!!addError}
                  />
                  {addError && (
                    <span className="text-red-500 text-xs mt-1">{addError}</span>
                  )}
                  <select
                    value={newSliderType}
                    onChange={e => setNewSliderType(e.target.value)}
                    className="bg-neutral-800 text-white px-4 py-2 rounded-lg border border-neutral-700 focus:ring-2 focus:ring-neutral-400 outline-none"
                  >
                    <option value="film">Filmler</option>
                    <option value="dizi">Diziler</option>
                    <option value="anime">Anime</option>
                  </select>
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => isAddValid && handleAddSlider()}
                    className={`flex-1 px-4 py-2 ${isAddValid ? 'bg-lime-500 hover:bg-lime-400 text-black shadow-lg hover:shadow-lime-500/25 hover:scale-105' : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'} font-normal rounded-xl transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400`}
                    aria-disabled={!isAddValid}
                    disabled={!isAddValid}
                  >
                    {isAddValid ? 'Ekle' : 'Başlık kısa'}
                  </button>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 px-4 py-2 bg-neutral-700 text-neutral-300 rounded-xl hover:bg-neutral-600 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
                  >
                    İptal
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SliderManager;
