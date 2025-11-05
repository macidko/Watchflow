import { useCallback } from 'react';
import { useDrag } from '../../../contexts/DragContext';

// Drag logic hook
const useCardDrag = (item, sliderId, onDragStart, onDragEnd) => {
  const { startDrag, endDrag } = useDrag();

  const handleDragStart = useCallback((e) => {
    if (onDragStart) {
      e.dataTransfer.setData('text/plain', JSON.stringify({
        item,
        sourceSlider: sliderId
      }));
      e.dataTransfer.effectAllowed = 'move';

      requestAnimationFrame(() => {
        startDrag(item, sliderId);
      });

      onDragStart(item, sliderId);
    }
  }, [item, sliderId, onDragStart, startDrag]);

  const handleDragEnd = useCallback(() => {
    endDrag();
    if (onDragEnd) {
      onDragEnd();
    }
  }, [endDrag, onDragEnd]);

  return {
    handleDragStart,
    handleDragEnd,
  };
};

export default useCardDrag;