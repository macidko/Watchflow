import { useState } from 'react';

// Hover state management hook
export const useDynamicSliderState = () => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  return {
    isHovered,
    setIsHovered,
    handleMouseEnter,
    handleMouseLeave
  };
};
