import React, { useState, useEffect, useRef } from 'react';
import { useDrag } from '../contexts/DragContext';
import { CARD_STYLES, CARD_SIZE_CONFIG } from '../config/layoutConfig';

const DynamicCard = ({ 
  item, 
  onClick, 
  onDragStart, 
  onDragEnd, 
  isDragging, 
  sliderId, 
  onQuickMove,
  cardSize = 'medium',
  cardStyle = 'modern',
  customCSS = {}
}) => {
  const [imgError, setImgError] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
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

  // Data mapping
  const poster = item.poster || item.imageUrl || (item.apiData?.poster);
  const title = item.title || (item.apiData?.title);
  const genres = item.genres || item.genre || (item.apiData?.genres) || [];
  const releaseDate = item.releaseDate || item.year || (item.apiData?.releaseDate);
  const rating = item.rating || item.score || (item.apiData?.rating || item.apiData?.score);
  const description = item.description || item.overview || (item.apiData?.description);

  const showImage = poster && !imgError;
  const sizeConfig = CARD_SIZE_CONFIG[cardSize] || CARD_SIZE_CONFIG.medium;

  const handleDragStart = (e) => {
    if (onDragStart) {
      e.dataTransfer.setData('text/plain', JSON.stringify({
        item,
        sourceSlider: sliderId
      }));
      e.dataTransfer.effectAllowed = 'move';
      
      requestAnimationFrame(() => {
        startDrag(item, sliderId);
      });
      
      onDragStart(item, sliderId);
    }
  };

  const handleDragEnd = () => {
    if (onDragEnd) {
      onDragEnd();
    }
  };

  // Style variants
  const getCardStyles = () => {
    const baseStyles = {
      width: sizeConfig.width,
      height: sizeConfig.height,
      borderRadius: sizeConfig.borderRadius,
      ...customCSS
    };

    switch (cardStyle) {
      case CARD_STYLES.MINIMAL:
        return {
          ...baseStyles,
          background: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
          boxShadow: 'none',
          transition: 'all 0.2s ease'
        };

      case CARD_STYLES.CLASSIC:
        return {
          ...baseStyles,
          background: 'var(--card-bg)',
          border: '2px solid var(--border-color)',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease'
        };

      case CARD_STYLES.COMPACT:
        return {
          ...baseStyles,
          background: 'var(--secondary-bg)',
          border: '1px solid var(--border-color)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          transition: 'all 0.2s ease'
        };

      case CARD_STYLES.ARTISTIC:
        return {
          ...baseStyles,
          background: 'linear-gradient(135deg, var(--card-bg), var(--secondary-bg))',
          border: 'none',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
        };

      case CARD_STYLES.PROFESSIONAL:
        return {
          ...baseStyles,
          background: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          transition: 'all 0.2s ease'
        };

      default: // MODERN
        return {
          ...baseStyles,
          background: 'var(--card-bg)',
          border: '1px solid color-mix(in srgb, var(--border-color) 50%, transparent)',
          boxShadow: 'var(--card-shadow)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        };
    }
  };

  const getHoverStyles = () => {
    switch (cardStyle) {
      case CARD_STYLES.MINIMAL:
        return {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        };

      case CARD_STYLES.CLASSIC:
        return {
          transform: 'scale(1.02)',
          boxShadow: '0 8px 16px rgba(0,0,0,0.15)'
        };

      case CARD_STYLES.COMPACT:
        return {
          background: 'var(--hover-bg)',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
        };

      case CARD_STYLES.ARTISTIC:
        return {
          transform: 'translateY(-4px) scale(1.02)',
          boxShadow: '0 12px 32px rgba(0,0,0,0.2)'
        };

      case CARD_STYLES.PROFESSIONAL:
        return {
          borderColor: 'var(--accent-color)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)'
        };

      default: // MODERN
        return {
          transform: 'translateY(-2px) scale(1.02)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
        };
    }
  };

  const renderContent = () => {
    switch (cardStyle) {
      case CARD_STYLES.COMPACT:
        return renderCompactContent();
      case CARD_STYLES.PROFESSIONAL:
        return renderProfessionalContent();
      case CARD_STYLES.ARTISTIC:
        return renderArtisticContent();
      case CARD_STYLES.MINIMAL:
        return renderMinimalContent();
      case CARD_STYLES.CLASSIC:
        return renderClassicContent();
      default:
        return renderModernContent();
    }
  };

  const renderModernContent = () => (
    <div className="relative w-full h-full overflow-hidden">
      {showImage ? (
        <>
          <img
            src={poster}
            alt={title}
            className={`w-full h-full object-cover transition-all duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            onError={() => setImgError(true)}
            onLoad={() => setIsLoaded(true)}
            draggable={false}
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/10"></div>
          
          {rating && (
            <div className="absolute top-3 right-3 px-2 py-1 bg-black/80 backdrop-blur-sm rounded-md">
              <div className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--accent-color)' }}>
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <span className="text-xs font-medium text-white">{Number(rating).toFixed(1)}</span>
              </div>
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0" style={{ padding: sizeConfig.padding }}>
            <h2 
              className="text-white font-semibold line-clamp-2 mb-0.5"
              style={{ fontSize: sizeConfig.titleSize }}
            >
              {title || 'Başlık Yok'}
            </h2>
            <div className="flex items-center justify-between gap-1">
              {releaseDate && (
                <span className="text-gray-400" style={{ fontSize: sizeConfig.metaSize }}>
                  {releaseDate}
                </span>
              )}
              {genres.length > 0 && (
                <span 
                  className="text-gray-500 bg-black/30 px-2 py-0.5 rounded-full backdrop-blur-sm"
                  style={{ fontSize: sizeConfig.metaSize }}
                >
                  {genres[0]}
                </span>
              )}
            </div>
          </div>
        </>
      ) : (
        renderNoImagePlaceholder()
      )}
    </div>
  );

  const renderMinimalContent = () => (
    <div className="w-full h-full flex flex-col">
      {showImage ? (
        <div className="flex-1 overflow-hidden">
          <img
            src={poster}
            alt={title}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
            draggable={false}
          />
        </div>
      ) : (
        <div className="flex-1 bg-gray-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}
      
      <div style={{ padding: sizeConfig.padding }}>
        <h3 
          className="font-medium text-gray-900 line-clamp-1"
          style={{ fontSize: sizeConfig.titleSize }}
        >
          {title || 'Başlık Yok'}
        </h3>
        {releaseDate && (
          <p 
            className="text-gray-500 mt-1"
            style={{ fontSize: sizeConfig.metaSize }}
          >
            {releaseDate}
          </p>
        )}
      </div>
    </div>
  );

  const renderCompactContent = () => (
    <div className="flex h-full">
      {showImage ? (
        <div className="w-16 flex-shrink-0">
          <img
            src={poster}
            alt={title}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
            draggable={false}
          />
        </div>
      ) : (
        <div className="w-16 flex-shrink-0 bg-gray-200 flex items-center justify-center">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}
      
      <div className="flex-1 p-3 flex flex-col justify-center">
        <h3 className="font-medium text-gray-900 line-clamp-2 text-sm">
          {title || 'Başlık Yok'}
        </h3>
        <div className="flex items-center gap-2 mt-1">
          {releaseDate && (
            <span className="text-xs text-gray-500">{releaseDate}</span>
          )}
          {rating && (
            <span className="text-xs text-orange-600 font-medium">★ {Number(rating).toFixed(1)}</span>
          )}
        </div>
      </div>
    </div>
  );

  const renderClassicContent = () => (
    <div className="w-full h-full">
      {showImage ? (
        <div className="relative h-full">
          <img
            src={poster}
            alt={title}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
            draggable={false}
          />
          
          <div className="absolute bottom-0 left-0 right-0 bg-white p-3">
            <h3 className="font-semibold text-gray-900 line-clamp-1" style={{ fontSize: sizeConfig.titleSize }}>
              {title || 'Başlık Yok'}
            </h3>
            <div className="flex items-center justify-between mt-1">
              {releaseDate && (
                <span className="text-sm text-gray-600">{releaseDate}</span>
              )}
              {rating && (
                <span className="text-sm text-orange-600 font-medium">★ {Number(rating).toFixed(1)}</span>
              )}
            </div>
          </div>
        </div>
      ) : (
        renderNoImagePlaceholder()
      )}
    </div>
  );

  const renderArtisticContent = () => (
    <div className="relative w-full h-full overflow-hidden">
      {showImage ? (
        <>
          <img
            src={poster}
            alt={title}
            className="w-full h-full object-cover filter contrast-110 saturate-110"
            onError={() => setImgError(true)}
            draggable={false}
          />
          
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20"></div>
          
          <div className="absolute inset-0 flex flex-col justify-end p-4">
            <div className="backdrop-blur-sm bg-black/30 p-3 rounded-lg">
              <h3 className="text-white font-bold mb-1" style={{ fontSize: sizeConfig.titleSize }}>
                {title || 'Başlık Yok'}
              </h3>
              {description && (
                <p className="text-white/80 text-xs line-clamp-2 mb-2">
                  {description}
                </p>
              )}
              <div className="flex items-center gap-2">
                {releaseDate && (
                  <span className="text-white/70 text-xs">{releaseDate}</span>
                )}
                {rating && (
                  <span className="text-yellow-400 text-xs font-medium">★ {Number(rating).toFixed(1)}</span>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        renderNoImagePlaceholder()
      )}
    </div>
  );

  const renderProfessionalContent = () => (
    <div className="w-full h-full bg-white">
      {showImage ? (
        <div className="h-2/3">
          <img
            src={poster}
            alt={title}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
            draggable={false}
          />
        </div>
      ) : (
        <div className="h-2/3 bg-gray-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}
      
      <div className="h-1/3 p-3 bg-white">
        <h3 className="font-semibold text-gray-900 line-clamp-2" style={{ fontSize: sizeConfig.titleSize }}>
          {title || 'Başlık Yok'}
        </h3>
        <div className="flex items-center justify-between mt-2">
          {releaseDate && (
            <span className="text-sm text-gray-600">{releaseDate}</span>
          )}
          {rating && (
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-500">Rating:</span>
              <span className="text-sm font-medium text-gray-900">{Number(rating).toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderNoImagePlaceholder = () => (
    <div className="w-full h-full bg-gray-800 flex flex-col items-center justify-center">
      <svg className="w-8 h-8 mb-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <p className="text-xs text-gray-500 mb-2">Poster Yok</p>
      <div style={{ padding: sizeConfig.padding }}>
        <h2 className="text-white font-semibold line-clamp-2" style={{ fontSize: sizeConfig.titleSize }}>
          {title || 'Başlık Yok'}
        </h2>
        {releaseDate && (
          <span className="text-gray-400" style={{ fontSize: sizeConfig.metaSize }}>
            {releaseDate}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div
      className={`group flex-none relative overflow-hidden cursor-pointer transition-all duration-300 ${
        isDragging 
          ? 'opacity-70 scale-95 ring-2 ring-orange-500' 
          : 'hover:scale-[1.02]'
      }`}
      style={getCardStyles()}
      onClick={() => onClick && onClick(item)}
      tabIndex={0}
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
      {renderContent()}

      {/* Quick Move Button */}
      {onQuickMove && (
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

          {showDropdown && (
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
      )}

      {/* Drag Indicator */}
      {isDragging && (
        <div className="absolute inset-0 flex items-center justify-center bg-orange-500/30">
          <div className="text-white px-3 py-1.5 rounded-md font-medium text-sm bg-orange-500">
            Taşınıyor...
          </div>
        </div>
      )}

      <style jsx>{`
        .group:hover {
          ${Object.entries(getHoverStyles()).map(([key, value]) => 
            `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value};`
          ).join('')}
        }
      `}</style>
    </div>
  );
};

export default DynamicCard;
