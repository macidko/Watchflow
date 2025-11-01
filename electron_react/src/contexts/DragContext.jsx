import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';

const DragContext = createContext();

export const useDrag = () => {
  const context = useContext(DragContext);
  if (!context) {
    throw new Error('useDrag must be used within a DragProvider');
  }
  return context;
};

export const DragProvider = ({ children }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [sourceSliderId, setSourceSliderId] = useState(null);
  
  // Scroll pozisyonu için durum tutuyoruz
  const scrollPositionRef = useRef({ x: 0, y: 0 });
  const htmlElement = useRef(null);

  // Drag başladığında scroll pozisyonunu kilitle
  const startDrag = (item, sliderId) => {
    console.log('🚀 [DragContext] startDrag called', { item, sliderId, timestamp: Date.now() });
    // Önce scroll pozisyonunu kaydet
    scrollPositionRef.current = {
      x: window.scrollX || window.pageXOffset,
      y: window.scrollY || window.pageYOffset
    };
    
    // HTML elementini referansta tut
    htmlElement.current = document.documentElement;
    
    // Sayfanın scroll'unu engelle
    if (htmlElement.current) {
      htmlElement.current.classList.add('no-scroll');
      // Sayfanın pozisyonunu koru (sayfa sıçramasını önlemek için)
      htmlElement.current.style.scrollBehavior = 'auto';
    }
    
    // Drag durumunu aktif et
    setIsDragging(true);
    setDraggedItem(item);
    setSourceSliderId(sliderId);
    console.log('✅ [DragContext] startDrag completed, isDragging set to TRUE');
  };

  const endDrag = () => {
    console.log('🛑 [DragContext] endDrag called', { timestamp: Date.now() });
    // Drag durumunu sıfırla
    setIsDragging(false);
    setDraggedItem(null);
    setSourceSliderId(null);
    
    // Scroll kilitini kaldır ve pozisyonu geri yükle
    if (htmlElement.current) {
      htmlElement.current.classList.remove('no-scroll');
      htmlElement.current.style.scrollBehavior = '';
      
      // Scroll pozisyonunu geri yükle
      window.scrollTo(scrollPositionRef.current.x, scrollPositionRef.current.y);
    }
    console.log('✅ [DragContext] endDrag completed, isDragging set to FALSE');
  };

  const value = useMemo(() => ({
    isDragging,
    draggedItem,
    sourceSliderId,
    startDrag,
    endDrag
  }), [isDragging, draggedItem, sourceSliderId]);

  // Fallback: bazı durumlarda dragend event'i kaynakta tetiklenmeyebilir, bu yüzden
  // window üzerinde genel bir dinleyici ekleyerek durumu güvenli şekilde sıfırlıyoruz.
  useEffect(() => {
    const handleDragEnd = () => {
      console.log('⚠️ [DragContext] window.dragend listener triggered', { timestamp: Date.now() });
      // küçük bir gecikme bırak; drop handler'larının tamamlanması için
      setTimeout(() => {
        console.log('🔄 [DragContext] window.dragend timeout executing (80ms later)', { timestamp: Date.now() });
        // State'i direkt set ederek closure problemini çözüyoruz
        setIsDragging(false);
        setDraggedItem(null);
        setSourceSliderId(null);
        
        // HTML element cleanup
        const html = document.documentElement;
        if (html) {
          html.classList.remove('no-scroll');
          html.style.scrollBehavior = '';
        }
        console.log('✅ [DragContext] window.dragend cleanup completed');
      }, 80);
    };

    const handleMouseUp = () => {
      console.log('🖱️ [DragContext] document.mouseup detected during drag', { isDragging, timestamp: Date.now() });
      // Eğer drag aktifse ve mouseup geliyorsa, drag sonlandırılmalı
      if (isDragging) {
        console.log('⚡ [DragContext] Force ending drag via mouseup');
        setTimeout(() => {
          setIsDragging(false);
          setDraggedItem(null);
          setSourceSliderId(null);
          
          const html = document.documentElement;
          if (html) {
            html.classList.remove('no-scroll');
            html.style.scrollBehavior = '';
          }
          console.log('✅ [DragContext] mouseup cleanup completed');
        }, 50);
      }
    };

    const handleClick = () => {
      console.log('🖱️ [DragContext] document.click detected during drag', { isDragging, timestamp: Date.now() });
      // Click eventi de drag'i sonlandırabilir
      if (isDragging) {
        console.log('⚡ [DragContext] Force ending drag via click');
        setTimeout(() => {
          setIsDragging(false);
          setDraggedItem(null);
          setSourceSliderId(null);
          
          const html = document.documentElement;
          if (html) {
            html.classList.remove('no-scroll');
            html.style.scrollBehavior = '';
          }
          console.log('✅ [DragContext] click cleanup completed');
        }, 50);
      }
    };

    const handleDrop = (e) => {
      // Document-level drop eventi - eğer hiçbir slider yakalamazsa
      console.log('📦 [DragContext] document.drop detected', { isDragging, timestamp: Date.now() });
      if (isDragging) {
        console.log('⚡ [DragContext] Force ending drag via document drop');
        e.preventDefault();
        setTimeout(() => {
          setIsDragging(false);
          setDraggedItem(null);
          setSourceSliderId(null);
          
          const html = document.documentElement;
          if (html) {
            html.classList.remove('no-scroll');
            html.style.scrollBehavior = '';
          }
          console.log('✅ [DragContext] document drop cleanup completed');
        }, 50);
      }
    };

    window.addEventListener('dragend', handleDragEnd);
    window.addEventListener('dragend', () => console.log('🌍 [DragContext] RAW window dragend listener fired'), true); // capture phase
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('click', handleClick, true); // capture phase
    document.addEventListener('drop', handleDrop);
    document.addEventListener('dragover', (e) => e.preventDefault()); // drop'u enable etmek için gerekli
    
    return () => {
      window.removeEventListener('dragend', handleDragEnd);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('drop', handleDrop);
      document.removeEventListener('dragover', (e) => e.preventDefault());
      // Sayfa kapanırken temizlik yap
      const html = document.documentElement;
      if (html) {
        html.classList.remove('no-scroll');
        html.style.scrollBehavior = '';
      }
    };
  }, [isDragging]); // isDragging dependency eklendi

  return (
    <DragContext.Provider value={value}>
      {children}
    </DragContext.Provider>
  );
};

// PropTypes validation
DragProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default DragProvider;