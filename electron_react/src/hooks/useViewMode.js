import { useState, useEffect } from 'react';

// View mode hook - layout görünüm tercihini yönetir (list/grid)
function useViewMode(pageType = 'default') {
  // LocalStorage key oluştur (sayfa türüne göre farklı tercihler)
  const storageKey = `watchflow_view_mode_${pageType}`;
  
  // Varsayılan görünüm modu: list
  const [viewMode, setViewMode] = useState('normal');
  
  // Component mount edildiğinde localStorage'dan tercihi yükle
  useEffect(() => {
    const savedViewMode = localStorage.getItem(storageKey);
    if (savedViewMode && ['normal', 'grid'].includes(savedViewMode)) {
      setViewMode(savedViewMode);
    }
  }, [storageKey]);
  
  // View mode değiştiğinde localStorage'a kaydet
  const toggleViewMode = () => {
    const newMode = viewMode === 'normal' ? 'grid' : 'normal';
    setViewMode(newMode);
    localStorage.setItem(storageKey, newMode);
  };
  
  return { viewMode, toggleViewMode };
}

export default useViewMode;
