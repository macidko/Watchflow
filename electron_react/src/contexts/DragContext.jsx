import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

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
  };

  const endDrag = () => {
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
  };

  const value = {
    isDragging,
    draggedItem,
    sourceSliderId,
    startDrag,
    endDrag
  };

  // Fallback: bazı durumlarda dragend event'i kaynakta tetiklenmeyebilir, bu yüzden
  // window üzerinde genel bir dinleyici ekleyerek durumu güvenli şekilde sıfırlıyoruz.
  useEffect(() => {
    const handler = () => {
      // küçük bir gecikme bırak; drop handler'larının tamamlanması için
      setTimeout(() => {
        endDrag();
      }, 80);
    };
    window.addEventListener('dragend', handler);
    return () => {
      window.removeEventListener('dragend', handler);
      // Sayfa kapanırken temizlik yap
      if (htmlElement.current) {
        htmlElement.current.classList.remove('no-scroll');
        htmlElement.current.style.scrollBehavior = '';
      }
    };
  }, []);

  return (
    <DragContext.Provider value={value}>
      {children}
    </DragContext.Provider>
  );
};
