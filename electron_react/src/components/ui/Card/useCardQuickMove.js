import { useState, useCallback } from 'react';

// Quick move logic hook
const useCardQuickMove = (item, sliderId, onQuickMove) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const handleQuickMove = useCallback((targetSliderId) => {
    if (onQuickMove?.handler) {
      onQuickMove.handler(item, sliderId, targetSliderId);
      setShowDropdown(false);
    }
  }, [item, sliderId, onQuickMove]);

  const toggleDropdown = useCallback((e) => {
    e.stopPropagation();
    setShowDropdown(prev => !prev);
  }, []);

  const closeDropdown = useCallback(() => {
    setShowDropdown(false);
  }, []);

  return {
    showDropdown,
    handleQuickMove,
    toggleDropdown,
    closeDropdown,
    availableSliders: onQuickMove?.availableSliders || [],
  };
};

export default useCardQuickMove;
