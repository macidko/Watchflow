import React, { useState, useEffect, useRef } from 'react';
import { useDrag } from '../contexts/DragContext';

const Card = ({ item, onClick, onDragStart, onDragEnd, isDragging, sliderId, onQuickMove }) => {
  const [imgError, setImgError] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const { startDrag } = useDrag();

  // Dropdown dışına tıklandığında kapat
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  // Yeni veri yapısına göre field mapping
  const poster = item.poster || item.imageUrl || (item.apiData?.poster);
  const title = item.title || (item.apiData?.title);
  const genres = item.genres || item.genre || (item.apiData?.genres) || [];
  const releaseDate = item.releaseDate || item.year || (item.apiData?.releaseDate);
  const rating = item.rating || item.score || (item.apiData?.rating || item.apiData?.score);

  const showImage = poster && !imgError;

  const handleDragStart = (e) => {
    if (onDragStart) {
      // İlk olarak dataTransfer'i ayarla (bu sırada preventDefault yapmadan)
      e.dataTransfer.setData('text/plain', JSON.stringify({
        item,
        sourceSlider: sliderId
      }));
      e.dataTransfer.effectAllowed = 'move';
      
      // Layout thrashing'i önlemek için global state değişikliğini bir sonraki animasyon frame'ine ertele
      // Bu sayede layout değişiminden kaynaklı scroll jump'ı minimize edilebilir
      requestAnimationFrame(() => {
        startDrag(item, sliderId); // Global drag state'i başlat - sliderId'yi de gönder
      });
      
      onDragStart(item, sliderId);
    }
  };

  const handleDragEnd = () => {
    // Do not end global drag here — let drop handler on target finalize and clear state.
    if (onDragEnd) {
      onDragEnd();
    }
  };

  return (
    <div
      className={`group flex-none w-44 h-64 bg-neutral-900 rounded-xl overflow-hidden transition-all duration-200 ease-out cursor-move relative border border-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] ${
        isDragging 
          ? 'opacity-70 scale-95 ring-2 shadow-[var(--card-shadow,0_6px_18px_rgba(0,0,0,0.35))]' 
          : 'hover:scale-103 hover:shadow-[var(--card-shadow,0_6px_18px_rgba(0,0,0,0.35))] transition-colors'
      }`}
      style={{ boxShadow: 'var(--card-shadow, 0 6px 18px rgba(0,0,0,0.35))' }}
      onClick={() => onClick && onClick(item)}
      tabIndex={0}
      role="button"
      onKeyDown={e => {
        if ((e.key === 'Enter' || e.key === ' ') && onClick) {
          e.preventDefault();
          onClick(item);
        }
      }}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      title="🔄 Kartı sürükleyerek başka slider'a taşıyabilirsiniz"
    >
      {/* Image Container - Full Height */}
      <div className="relative w-full h-full overflow-hidden">
        {showImage ? (
          <>
            <img
              src={poster}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-102"
              onError={() => setImgError(true)}
              draggable={false}
            />
            
            {/* Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/10"></div>
            
            {/* Rating Badge */}
            {rating && (
              <div className="absolute top-3 right-3 px-2 py-1 bg-black/80 backdrop-blur-sm rounded-md">
                <div className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--accent)' }} role="img" aria-label="Derecelendirme" focusable="false">
                    <title>Derecelendirme</title>
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  <span className="text-xs font-medium text-white">{Number(rating).toFixed(1)}</span>
                </div>
              </div>
            )}

            {/* Quick Move Button */}
            <div className="absolute top-3 left-3" ref={dropdownRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDropdown(!showDropdown);
                }}
                className="w-7 h-7 bg-black/80 backdrop-blur-sm rounded-md flex items-center justify-center text-white/80 hover:text-white hover:bg-black/90 transition-all opacity-0 group-hover:opacity-100"
                title="Hızlı taşı"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {showDropdown && onQuickMove && (
                <div className="absolute top-8 left-0 bg-neutral-800 rounded-lg shadow-lg border border-neutral-700 py-1 z-50 min-w-40">
                  {onQuickMove.availableSliders?.map((slider) => (
                    <button
                      key={slider.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onQuickMove.handler(item, sliderId, slider.id);
                        setShowDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-white hover:bg-neutral-700 transition-colors"
                    >
                      {slider.title}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Content Overlay - Bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-2.5">
              <h2 className="text-white text-base font-semibold line-clamp-2 mb-0.5">
                {title || 'Başlık Yok'}
              </h2>
              <div className="flex items-center justify-between gap-1">
                {releaseDate && (
                  <span className="text-xs text-gray-400 drop-shadow-md">{releaseDate}</span>
                )}
                {genres.length > 0 && (
                  <span className="text-xs text-gray-500 bg-black/30 px-2 py-0.5 rounded-full backdrop-blur-sm">
                    {genres[0]}
                  </span>
                )}
              </div>
            </div>

            {/* Drag Indicator */}
            {isDragging && (
              <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'color-mix(in srgb, var(--accent) 30%, transparent)' }}>
                <div className="text-white px-3 py-1.5 rounded-md font-medium text-sm" style={{ background: 'var(--accent)' }}>
                  Taşınıyor...
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center relative">
            <div className="text-center">
              <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#6b7280' }} role="img" aria-label="Poster Yok" focusable="false">
                <title>Poster Yok</title>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-xs text-gray-500">Poster Yok</p>
            </div>
            {/* Content for No Image */}
            <div className="absolute bottom-0 left-0 right-0 p-2.5">
              <h2 className="text-white text-base font-semibold line-clamp-2 mb-0.5">
                {title || 'Başlık Yok'}
              </h2>
              <div className="flex items-center justify-between gap-1">
                {releaseDate && (
                  <span className="text-xs text-gray-400">{releaseDate}</span>
                )}
                {genres.length > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full text-gray-500 bg-gray-700">
                    {genres[0]}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Card;