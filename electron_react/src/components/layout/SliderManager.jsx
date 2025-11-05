import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import useSliderManagerController from '../../hooks/useSliderManagerController';
import AdvancedViewSwitcher from './AdvancedViewSwitcher';
import { t } from '../../i18n';
import styles from './SliderManager.module.css';

const SliderManager = ({ page, onClose }) => {
  const {
    modalRef,
    addInputRef,
    sliders,
    draggedItem,
    dropTargetIndex,
    showAddForm,
    setShowAddForm,
    newSliderTitle,
    setNewSliderTitle,
    addError,
    setAddError,
    newSliderType,
    setNewSliderType,
    debouncedTitleUpdate,
    handleDragStart,
  handleDragOver,
  handleDragEnd,
    handleDrop,
    handleAddSlider,
    handleToggleVisibility,
    handleDeleteSlider,
    isAddValid
  } = useSliderManagerController(page);

  // Focus trap ve ESC ile kapama - component side to access onClose
  useEffect(() => {
    const focusableSelectors = [
      'button', 'a[href]', 'input', 'select', 'textarea', '[tabindex]:not([tabindex="-1"])'
    ];
    const node = modalRef.current;
    if (!node) return;
    const focusables = node.querySelectorAll(focusableSelectors.join(','));
    if (focusables.length) focusables[0].focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Tab') {
        const focusable = Array.from(node.querySelectorAll(focusableSelectors.join(',')));
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (typeof document !== 'undefined' && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (typeof document !== 'undefined' && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };
    node.addEventListener('keydown', handleKeyDown);
    return () => node.removeEventListener('keydown', handleKeyDown);
  }, [onClose, modalRef]);

SliderManager.propTypes = {
  page: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired
};

  return (
    <dialog
      ref={modalRef}
      open
      aria-modal="true"
      tabIndex={-1}
      className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm px-2 sm:px-0 ${styles.sliderDialog}`}
      aria-labelledby="slider-manager-title"
      onClick={(e) => {
        if (e.target === modalRef.current) onClose();
      }}
    >
      <div
        className={`relative w-full max-w-lg rounded-2xl shadow-2xl p-6 sm:p-8 flex flex-col gap-5 sm:gap-6 ${styles.modalCard}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className={`${styles.modalHeader} mb-1 sm:mb-2`}> 
          <h2 id="slider-manager-title" className="text-xl font-semibold drop-shadow-lg" style={{ color: 'var(--primary-text)' }}>
            {t('components.sliderManager.title')}
          </h2>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className={`p-2 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 ${styles.closeButton}`}
              title={t('common.close')}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Layout Switcher */}
        <div className="block sm:hidden mb-4">
          <AdvancedViewSwitcher onLayoutChange={(_layout) => {
            // Layout değişikliği burada handle edilebilir
          }} />
        </div>

        {/* Slider List */}
  <div className={`${styles.sliderList} space-y-3 sm:space-y-4`} role="list" aria-label={t('components.sliderManager.ariaList')}>
          {sliders.map((slider, idx) => (
            <React.Fragment key={slider.id}>
              {/* Drop indicator shown above an item while dragging */}
              {draggedItem && dropTargetIndex === idx && (
                <div className={styles.dropIndicator} aria-hidden />
              )}
              <div
                role="listitem"
                aria-label={`${slider.title} - ${slider.visible ? t('common.show') : t('common.hide')}`}
                className={`${styles.sliderItem} ${draggedItem === slider.id ? styles.sliderItemDragging : ''} flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 rounded-xl transition-all duration-300`}
                draggable
                onDragStart={e => handleDragStart(e, slider.id)}
                onDragOver={e => handleDragOver(e, idx)}
                onDragEnd={handleDragEnd}
                onDrop={e => handleDrop(e, idx)}
              >
              {/* Drag Icon */}
              <span className={`${styles.dragIcon} mr-3 transition-all`} title={t('components.slider.drag')}>
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
                  className={`text-lg font-normal border-none outline-none px-1.5 py-1 rounded-md transition-all ${styles.titleInput}`}
                />
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full ${styles.tag}`}>
                  {slider.type}
                </span>
                <button
                  onClick={() => handleToggleVisibility(slider.id)}
                  className={`p-2 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 ${slider.visible ? styles.iconBtnVisible : styles.iconBtnHidden} ${styles.iconBtn}`}
                  title={slider.visible ? t('common.hide') : t('common.show')}
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
                  className={`p-2 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 ${styles.deleteBtn} ${styles.iconBtn}`}
                  title={t('components.sliderManager.buttons.delete')}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            </React.Fragment>
          ))}
          {/* Drop area at the end of the list to allow dropping after the last item */}
          <div
            className={styles.endDropArea}
            onDragOver={e => handleDragOver(e, sliders.length)}
            onDrop={e => handleDrop(e, sliders.length)}
            aria-hidden
          >
            {draggedItem && dropTargetIndex === sliders.length && (
              <div className={styles.dropIndicator} />
            )}
          </div>
          {sliders.length === 0 && (
            <div className="text-center py-8" style={{ color: 'var(--secondary-text)' }}>
              {t('components.sliderManager.noLists')}
            </div>
          )}
        </div>
        {/* Add New List Button ve Modal */}
        <div>
          <div className="flex justify-end mt-5">
            <button
              onClick={() => setShowAddForm(true)}
              className={`px-5 py-2 font-medium rounded-xl transition-all duration-300 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 ${styles.primaryBtn}`}
            >
              {t('components.sliderManager.newList')}
            </button>
          </div>
          {showAddForm && (
            <dialog
              open
              aria-modal="true"
              aria-labelledby="new-list-title"
              className={`${styles.addFormBackdrop} fixed inset-0 z-60 flex items-center justify-center backdrop-blur-sm`}
            >
              <div className={styles.addFormCard}>
                <h3 id="new-list-title" className="mb-2" style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--primary-text)' }}>{t('components.sliderManager.newListModal.title')}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <input
                    ref={addInputRef}
                    type="text"
                    value={newSliderTitle}
                    onChange={e => {
                      setNewSliderTitle(e.target.value);
                      if (addError) setAddError('');
                    }}
                    placeholder={t('components.sliderManager.newListModal.placeholder')}
                    className={styles.inputField}
                    aria-label={t('components.sliderManager.newListModal.placeholder')}
                    aria-invalid={!!addError}
                  />
                  {addError && (
                    <span className={styles.inputError}>{addError}</span>
                  )}
                  <select
                    value={newSliderType}
                    onChange={e => setNewSliderType(e.target.value)}
                    className={styles.inputField}
                  >
                    <option value="film">{t('common.movies')}</option>
                    <option value="dizi">{t('common.series')}</option>
                    <option value="anime">{t('common.anime')}</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button
                    onClick={() => isAddValid && handleAddSlider()}
                    className={styles.primaryBtn}
                    aria-disabled={!isAddValid}
                    disabled={!isAddValid}
                  >
                    {isAddValid ? t('components.sliderManager.buttons.add') : t('components.sliderManager.buttons.titleTooShort')}
                  </button>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className={styles.secondaryBtn}
                  >
                    {t('components.sliderManager.buttons.cancel')}
                  </button>
                </div>
              </div>
            </dialog>
          )}
        </div>
      </div>
    </dialog>
  );
};

export default SliderManager;

