import { useState, useRef, useEffect } from 'react';
import { LAYOUT_MODES } from '../../../config/layoutConfig';

// Scroll management hook - handles scroll position and navigation
export const useDynamicSliderScroll = (activeLayout, items = []) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const sliderRef = useRef(null);

  useEffect(() => {
    const updateScrollInfo = () => {
      const slider = sliderRef.current;
      if (slider && activeLayout.mode === LAYOUT_MODES.SLIDER) {
        const newMaxScroll = slider.scrollWidth - slider.clientWidth;
        setMaxScroll(newMaxScroll);
        setCanScrollLeft(scrollPosition > 0);
        setCanScrollRight(scrollPosition < newMaxScroll);
      }
    };

    updateScrollInfo();

    // Debounce resize handler to avoid excessive recalculations on rapid resize
    let resizeTimer = null;
    const onResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        updateScrollInfo();
      }, 120);
    };

    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      if (resizeTimer) clearTimeout(resizeTimer);
    };
  }, [items, scrollPosition, activeLayout.mode]);

  const scroll = (direction) => {
    const slider = sliderRef.current;
    if (!slider) return;

    const scrollAmount = activeLayout.gap * 10 || 300;
    const newPosition = direction === 'left'
      ? Math.max(0, scrollPosition - scrollAmount)
      : scrollPosition + scrollAmount;

    const finalPosition = Math.min(newPosition, maxScroll);

    slider.scrollTo({ left: finalPosition, behavior: 'smooth' });
    setScrollPosition(finalPosition);
  };

  const handleScroll = () => {
    const slider = sliderRef.current;
    if (slider) setScrollPosition(slider.scrollLeft);
  };

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
