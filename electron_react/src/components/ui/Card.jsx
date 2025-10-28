import React, { useState, useRef, useEffect } from 'react';
import { useDrag } from '../../contexts/DragContext';
import '../../css/components/ui/Card.css';

const Card = ({ item, onClick, onDragStart, onDragEnd, isDragging, sliderId, onQuickMove }) => {
  const [imgError, setImgError] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const dropdownRef = useRef(null);
  const imageRef = useRef(null);
  const observerRef = useRef(null);
  const { startDrag } = useDrag();

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!imageRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observerRef.current?.disconnect();
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    observerRef.current.observe(imageRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  // Image load handler
  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImgError(true);
    setImageLoaded(true);
  };

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
      className={`card card-hover-lift ${isDragging ? 'card--dragging' : ''} group flex-none w-44 h-64 bg-neutral-900 rounded-xl border border-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]`}
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
              ref={imageRef}
              src={isInView ? poster : undefined}
              alt={title}
              className={`card-image ${imageLoaded ? 'loaded' : 'loading'}`}
              onLoad={handleImageLoad}
              onError={handleImageError}
              draggable={false}
              loading="lazy"
            />

            {/* Gradient Overlay for Text Readability */}
            <div className="card-overlay"></div>

            {/* Rating Badge */}
            {rating && (
              <div className="card-rating">
                <svg fill="currentColor" viewBox="0 0 24 24" role="img" aria-label="Derecelendirme" focusable="false">
                  <title>Derecelendirme</title>
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <span>{Number(rating).toFixed(1)}</span>
              </div>
            )}

            {/* Quick Move Button */}
            <div className="card-quick-move" ref={dropdownRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDropdown(!showDropdown);
                }}
                className="quick-move-btn"
                title="Hızlı taşı"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {showDropdown && onQuickMove && (
                <div className="dropdown-menu">
                  {onQuickMove.availableSliders?.map((slider) => (
                    <button
                      key={slider.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onQuickMove.handler(item, sliderId, slider.id);
                        setShowDropdown(false);
                      }}
                      className="dropdown-item"
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
              <div className="card__drag-indicator">
                <div className="card__drag-indicator-text">
                  Taşınıyor...
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="card__no-image">
            <div className="card__no-image-content">
              <svg className="card__no-image-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-label="Poster Yok" focusable="false">
                <title>Poster Yok</title>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-xs text-gray-500">Poster Yok</p>
            </div>
            {/* Content for No Image */}
            <div className="absolute bottom-0 left-0 right-0 p-2.5">
              <h2 className="card__no-image-title">
                {title || 'Başlık Yok'}
              </h2>
              <div className="flex items-center justify-between gap-1">
                {releaseDate && (
                  <span className="card__no-image-year">{releaseDate}</span>
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

      {/* Rating Badge */}
      {item.rating && (
        <div className="card-rating">
          <svg fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <span>{item.rating}</span>
        </div>
      )}
    </div>
  );
};

export default Card;