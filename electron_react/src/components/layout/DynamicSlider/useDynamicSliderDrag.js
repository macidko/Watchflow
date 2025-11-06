import { useState, useCallback } from 'react';

// Drag and drop management hook
export const useDynamicSliderDrag = (sliderId, endDrag) => {
  const [draggedItem, setDraggedItem] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleCardDragStart = useCallback((item, sourceSlider) => {
    setDraggedItem({ item, sourceSlider });
  }, []);

  const handleCardDragEnd = useCallback(() => {
    setDraggedItem(null);
    setIsDragOver(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  }, []);

  const handleDrop = useCallback((e, onCardMove) => {
    e.preventDefault();
    setIsDragOver(false);

    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      if (data.sourceSlider !== sliderId && typeof onCardMove === 'function') {
        onCardMove(data.item, data.sourceSlider, sliderId);
      }
    } catch {
      // Invalid data - ignore
    }

    setDraggedItem(null);
    if (typeof endDrag === 'function') endDrag();
  }, [sliderId, endDrag]);

  return {
    draggedItem,
    isDragOver,
    handleCardDragStart,
    handleCardDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop
  };
};
