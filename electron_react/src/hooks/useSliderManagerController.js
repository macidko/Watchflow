import { useState, useCallback, useRef, useEffect } from 'react';
import useContentStore from '../config/initialData';
import { useToast } from '../contexts/ToastContext';
import { t } from '../i18n';
import { validateTitle } from '../utils/validation';

// Simple debounce hook
const useDebounce = (callback, delay) => {
  const [debounceTimer, setDebounceTimer] = useState();
  const debouncedCallback = useCallback((...args) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    const newTimer = setTimeout(() => callback(...args), delay);
    setDebounceTimer(newTimer);
  }, [callback, delay, debounceTimer]);
  return debouncedCallback;
};

export default function useSliderManagerController(page) {
  const [draggedItem, setDraggedItem] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSliderTitle, setNewSliderTitle] = useState('');
  const [addError, setAddError] = useState('');
  const [newSliderType, setNewSliderType] = useState('film');
  const addInputRef = useRef(null);
  const modalRef = useRef(null);

  const { showToast } = useToast();

  const { 
    getAllStatusesByPage, 
    addStatus,
    updateStatus,
    deleteStatus,
    toggleStatusVisibility,
    reorderStatuses,
    getStatusContentCount
  } = useContentStore();

  // Slider verileri
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

    const newOrder = [...sliders];
    const [draggedSlider] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedSlider);

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
      showToast(
        `Bu slider silinemez! İçinde ${contentCount} içerik var. Önce slider'ı boşaltın.`,
        'warning',
        4000
      );
      return;
    }

    if (globalThis.confirm(t('components.sliderManager.deleteConfirm'))) {
      const success = deleteStatus(page, sliderId);
      if (success) {
        showToast(t('components.sliderManager.deleteSuccess'), 'success');
      } else {
        showToast(t('components.sliderManager.deleteFail'), 'error');
      }
    }
  };

  useEffect(() => {
    if (showAddForm && addInputRef.current) {
      addInputRef.current.focus();
    }
  }, [showAddForm]);

  const isAddValid = newSliderTitle.trim().length >= 3;

  // Focus trap handled by parent component; expose refs for that
  return {
    modalRef,
    addInputRef,
    sliders,
    draggedItem,
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
    handleDrop,
    handleAddSlider,
    handleToggleVisibility,
    handleDeleteSlider,
    isAddValid
  };
}
