import { useState, useRef, useEffect } from 'react';
import { useDrag } from '../contexts/DragContext';
import { useLayoutDynamic } from '../hooks/useLayoutDynamic';
import { LAYOUT_MODES } from '../config/layoutConfig';

export default function useDynamicSliderController({ items = [], sliderId, customLayout = null }) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);
  const [draggedItem, setDraggedItem] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const sliderRef = useRef(null);
  const { isDragging: globalDrag, sourceSliderId, endDrag } = useDrag();
  const { currentLayout, getLayoutCSS } = useLayoutDynamic();

  const activeLayout = customLayout || currentLayout;
  const layoutCSS = getLayoutCSS();

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

    // debounce resize handler to avoid excessive recalculations on rapid resize
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

  // Drag/drop handlers
  const handleCardDragStart = (item, sourceSlider) => setDraggedItem({ item, sourceSlider });
  const handleCardDragEnd = () => {
    setDraggedItem(null);
    setIsDragOver(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setIsDragOver(false);
  };

  const handleDrop = (e, onCardMove) => {
    e.preventDefault();
    setIsDragOver(false);
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      if (data.sourceSlider !== sliderId && typeof onCardMove === 'function') {
        onCardMove(data.item, data.sourceSlider, sliderId);
      }
    } catch {
      // ignore
    }
    setDraggedItem(null);
    if (typeof endDrag === 'function') endDrag();
  };

  return {
    scrollPosition,
    maxScroll,
    draggedItem,
    isDragOver,
    canScrollLeft,
    canScrollRight,
    isHovered,
    setIsHovered,
    sliderRef,
    globalDrag,
    sourceSliderId,
    endDrag,
    currentLayout,
    activeLayout,
    layoutCSS,
    scroll,
    handleScroll,
    handleCardDragStart,
    handleCardDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop
  };
}
