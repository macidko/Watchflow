import { useState, useRef, useEffect, useCallback } from 'react';

export const useSliderScroll = (items) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const sliderRef = useRef(null);

  useEffect(() => {
    const updateScrollInfo = () => {
      const slider = sliderRef.current;
      if (slider) {
        const newMaxScroll = slider.scrollWidth - slider.clientWidth;
        setMaxScroll(newMaxScroll);
        setCanScrollLeft(scrollPosition > 0);
        setCanScrollRight(scrollPosition < newMaxScroll);
      }
    };

    updateScrollInfo();
    window.addEventListener('resize', updateScrollInfo);

    return () => window.removeEventListener('resize', updateScrollInfo);
  }, [items, scrollPosition]);

  const scroll = useCallback((direction) => {
    const slider = sliderRef.current;
    if (!slider) return;

    const scrollAmount = 300;
    const newPosition = direction === 'left'
      ? Math.max(0, scrollPosition - scrollAmount)
      : scrollPosition + scrollAmount;

    const finalPosition = Math.min(newPosition, maxScroll);

    slider.scrollTo({
      left: finalPosition,
      behavior: 'smooth'
    });

    setScrollPosition(finalPosition);
  }, [scrollPosition, maxScroll]);

  const handleScroll = useCallback(() => {
    const slider = sliderRef.current;
    if (slider) {
      setScrollPosition(slider.scrollLeft);
    }
  }, []);

  return {
    scrollPosition,
    maxScroll,
    canScrollLeft,
    canScrollRight,
    sliderRef,
    scroll,
    handleScroll
  };
};
