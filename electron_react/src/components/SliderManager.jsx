import React, { useState, useCallback, useRef, useEffect } from 'react';
import useContentStore from '../config/initialData';
import { useToast } from '../contexts/ToastContext';
import { t } from '../i18n';
import { validateTitle } from '../utils/validation';
import AdvancedViewSwitcher from './AdvancedViewSwitcher';
import DynamicSlider from './DynamicSlider';

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
  const { showToast } = useToast();
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
    getAllStatusesByPage, 
    addStatus,
    updateStatus,
    deleteStatus,
    toggleStatusVisibility,
    reorderStatuses,
    getStatusContentCount
  } = useContentStore();

  // Slider verilerini Zustand'dan al (gizli olanlar dahil)
  const sliders = getAllStatusesByPage(page) || [];

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
    try {
      const validatedTitle = validateTitle(newSliderTitle);
      
      setAddError('');
      const success = addStatus(page, {
        title: validatedTitle,
        type: 'custom'
      });
      
      if (success) {
        setNewSliderTitle('');
        setShowAddForm(false);
        showToast(t('components.sliderManager.newListModal.successMessage'), 'success');
      } else {
        setAddError(t('components.sliderManager.newListModal.duplicateError'));
        showToast(t('components.sliderManager.newListModal.duplicateToast'), 'warning');
        if (addInputRef.current) addInputRef.current.focus();
      }
    } catch (error) {
      setAddError(error.message);
      showToast(error.message, 'warning');
      if (addInputRef.current) addInputRef.current.focus();
    }
  };

  const handleToggleVisibility = (sliderId) => {
    toggleStatusVisibility(page, sliderId);
  };

  const handleDeleteSlider = (sliderId) => {
    const contentCount = getStatusContentCount(page, sliderId);
    
    if (contentCount > 0) {
      // Toast mesajı göster
      showToast(
        `Bu slider silinemez! İçinde ${contentCount} içerik var. Önce slider'ı boşaltın.`,
        'warning',
        4000
      );
      return;
    }
    
    if (window.confirm('Bu slider\'ı silmek istediğinizden emin misiniz?')) {
      const success = deleteStatus(page, sliderId);
      if (success) {
        showToast('Slider başarıyla silindi.', 'success');
      } else {
        showToast('Slider silinemedi. Lütfen tekrar deneyin.', 'error');
      }
    }
  };

  useEffect(() => {
    if (showAddForm && addInputRef.current) {
      addInputRef.current.focus();
    }
  }, [showAddForm]);

  const isAddValid = newSliderTitle.trim().length >= 3;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm px-2 sm:px-0" tabIndex={-1} onClick={onClose} style={{ background: 'var(--overlay-bg)' }}>
      <div
        ref={modalRef}
  className="relative w-full max-w-lg rounded-2xl shadow-2xl p-6 sm:p-8 flex flex-col gap-5 sm:gap-6"
  style={{ background: 'var(--primary-bg)', border: '1px solid var(--border-color)' }}
        tabIndex={0}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between mb-1 sm:mb-2 gap-2">
          <h2 className="text-xl font-semibold drop-shadow-lg" style={{ color: 'var(--primary-text)' }}>
            Listeleri Yönet
          </h2>
          <div className="flex items-center gap-3">
            {/* Layout Switcher */}
            <div className="hidden sm:block">
              <AdvancedViewSwitcher onLayoutChange={(layout) => {
                // Layout değişikliği burada handle edilebilir
                console.log('Layout changed:', layout);
              }} />
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2"
              style={{ background: 'var(--secondary-bg)', color: 'var(--secondary-text)', boxShadow: '0 0 0 2px var(--accent-color)' }}
              title="Kapat"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Layout Switcher */}
        <div className="block sm:hidden mb-4">
          <AdvancedViewSwitcher onLayoutChange={(layout) => {
            console.log('Layout changed:', layout);
          }} />
        </div>

        {/* Slider List */}
  <div className="space-y-3 sm:space-y-4">
          {sliders.map((slider, idx) => (
            <div
              key={slider.id}
              className={`flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 rounded-xl transition-all duration-300 ${draggedItem === slider.id ? 'ring-2' : ''}`}
              style={draggedItem === slider.id ? { boxShadow: '0 0 0 2px var(--accent-color)', background: 'var(--secondary-bg)', border: '1px solid var(--accent-color)' } : { background: 'var(--secondary-bg)', border: '1px solid var(--border-color)' }}
              draggable
              onDragStart={e => handleDragStart(e, slider.id)}
              onDragOver={handleDragOver}
              onDrop={e => handleDrop(e, idx)}
            >
              {/* Drag Icon */}
              <span className="mr-3 cursor-grab transition-all" style={{ color: 'var(--secondary-text)' }} title="Sürükle">
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
                  className="text-lg font-normal border-none outline-none px-1.5 py-1 rounded-md transition-all"
                    style={{ color: 'var(--primary-text)', background: 'transparent' }}
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'var(--secondary-bg)', color: 'var(--secondary-text)' }}>
                  {slider.type}
                </span>
                <button
                  onClick={() => handleToggleVisibility(slider.id)}
                  className={`p-2 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2`}
                  style={slider.visible ? { background: 'color-mix(in srgb, var(--success-color) 20%, transparent)', color: 'var(--success-color)' } : { background: 'var(--secondary-bg)', color: 'var(--secondary-text)' }}
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
                  style={{ background: 'color-mix(in srgb, var(--danger-color) 20%, transparent)', color: 'var(--danger-color)' }}
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
            <div className="text-center py-8" style={{ color: 'var(--secondary-text)' }}>
              Bu sayfada henüz liste bulunmuyor.
            </div>
          )}
        </div>
        {/* Add New List Button ve Modal */}
        <div>
          <div className="flex justify-end mt-5">
            <button
              onClick={() => setShowAddForm(true)}
              className="px-5 py-2 font-medium rounded-xl transition-all duration-300 hover:scale-105 focus-visible:outline-none focus-visible:ring-2"
              style={{ background: 'var(--accent-color)', color: 'var(--primary-text)', boxShadow: '0 4px 24px 0 color-mix(in srgb, var(--accent-color) 25%, transparent)' }}
            >
              + Yeni Liste
            </button>
          </div>
          {showAddForm && (
            <div className="fixed inset-0 z-60 flex items-center justify-center backdrop-blur-sm" style={{ background: 'var(--overlay-bg)' }}>
              <div style={{ background: 'var(--primary-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', boxShadow: 'var(--popup-shadow)', padding: '32px', width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--primary-text)', marginBottom: 8 }}>Yeni Liste Oluştur</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <input
                    ref={addInputRef}
                    type="text"
                    value={newSliderTitle}
                    onChange={e => {
                      setNewSliderTitle(e.target.value);
                      if (addError) setAddError('');
                    }}
                    placeholder="Liste adı... (en az 3 karakter)"
                    style={{ background: 'var(--input-bg)', color: 'var(--primary-text)', padding: '12px 16px', borderRadius: '12px', border: addError ? `1px solid var(--danger-color)` : `1px solid var(--border-color)`, outline: 'none' }}
                    aria-label="Yeni liste adı"
                    aria-invalid={!!addError}
                  />
                  {addError && (
                    <span style={{ color: 'var(--danger-color)', fontSize: 12, marginTop: 4 }}>{addError}</span>
                  )}
                  <select
                    value={newSliderType}
                    onChange={e => setNewSliderType(e.target.value)}
                    style={{ background: 'var(--input-bg)', color: 'var(--primary-text)', padding: '12px 16px', borderRadius: '12px', border: `1px solid var(--border-color)`, outline: 'none' }}
                  >
                    <option value="film">{t('common.movies')}</option>
                    <option value="dizi">{t('common.series')}</option>
                    <option value="anime">{t('common.anime')}</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button
                    onClick={() => isAddValid && handleAddSlider()}
                    style={{ flex: 1, padding: '12px 16px', borderRadius: '12px', background: isAddValid ? 'var(--accent-color)' : 'var(--secondary-bg)', color: isAddValid ? 'var(--primary-text)' : 'var(--secondary-text)', border: 'none', cursor: isAddValid ? 'pointer' : 'not-allowed', transition: 'all 0.15s' }}
                    aria-disabled={!isAddValid}
                    disabled={!isAddValid}
                  >
                    {isAddValid ? t('components.sliderManager.buttons.add') : t('components.sliderManager.buttons.titleTooShort')}
                  </button>
                  <button
                    onClick={() => setShowAddForm(false)}
                    style={{ flex: 1, padding: '12px 16px', borderRadius: '12px', background: 'var(--secondary-bg)', color: 'var(--secondary-text)', border: `1px solid var(--border-color)` }}
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
