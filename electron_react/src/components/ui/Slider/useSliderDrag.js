import { useState, useCallback } from 'react';

export const useSliderDrag = (sliderId, onCardMove, endDrag) => {
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

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);

    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));

      if (data.sourceSlider !== sliderId && onCardMove) {
        onCardMove(data.item, data.sourceSlider, sliderId);
      }
    } catch (error) {
      console.error('Drop parsing error:', error);
    }

    setDraggedItem(null);
    // finalize global drag state after successful drop handling
    if (typeof endDrag === 'function') endDrag();
  }, [sliderId, onCardMove, endDrag]);

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