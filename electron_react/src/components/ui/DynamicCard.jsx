import React, { useState, useEffect, useRef } from 'react';
import { useDrag } from '../../contexts/DragContext';
import './../../css/components/ui/DynamicCard.css';

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

  const showImage = poster && !imgError;

  // Get CSS class names based on props
  const getCardClasses = () => {
    const classes = ['dynamic-card', 'card-hover-lift'];
    
    // Add size class
    classes.push(`dynamic-card--${cardSize}`);
    
    // Add style class  
    classes.push(`dynamic-card--${cardStyle.toLowerCase()}`);
    
    // Add state classes
    if (isDragging) {
      classes.push('dynamic-card--dragging');
    }
    
    return classes.join(' ');
  };

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

  const renderContent = () => {
    // Only modern card style is supported
    return renderModernContent();
  };

  const renderModernContent = () => (
    <div className="dynamic-card__content">
      {showImage ? (
        <>
          <img
            src={poster}
            alt={title}
            className={`dynamic-card__image ${isLoaded ? 'dynamic-card__image--loaded' : 'dynamic-card__image--loading'}`}
            onError={() => setImgError(true)}
            onLoad={() => setIsLoaded(true)}
            draggable={false}
          />
          
          <div className="dynamic-card__gradient-overlay"></div>
          
          {rating && (
            <div className="dynamic-card__rating">
              <svg className="dynamic-card__rating-icon" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <span className="dynamic-card__rating-text">{Number(rating).toFixed(1)}</span>
            </div>
          )}

          <div className="dynamic-card__text-overlay">
            <h2 className="dynamic-card__title">
              {title || 'Başlık Yok'}
            </h2>
            <div className="dynamic-card__meta">
              {releaseDate && (
                <span className="dynamic-card__release-date">
                  {releaseDate}
                </span>
              )}
              {genres.length > 0 && (
                <span className="dynamic-card__genre">
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

  const renderNoImagePlaceholder = () => (
    <div className="dynamic-card__no-image">
      <svg className="dynamic-card__no-image-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <p className="dynamic-card__no-image-text">Poster Yok</p>
      <div className="dynamic-card__text-overlay">
        <h2 className="dynamic-card__no-image-title">
          {title || 'Başlık Yok'}
        </h2>
        {releaseDate && (
          <span className="dynamic-card__no-image-date">
            {releaseDate}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div
      className={getCardClasses()}
      style={customCSS}
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
        <div className="dynamic-card__quick-move" ref={dropdownRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDropdown(!showDropdown);
            }}
            className="dynamic-card__quick-move-btn"
            title="Hızlı taşı"
          >
            <svg className="dynamic-card__quick-move-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
            </svg>
          </button>

          {showDropdown && (
            <div className="dynamic-card__dropdown">
              {onQuickMove.availableSliders?.map((slider) => (
                <button
                  key={slider.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onQuickMove.handler(item, sliderId, slider.id);
                    setShowDropdown(false);
                  }}
                  className="dynamic-card__dropdown-item"
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
        <div className="dynamic-card__drag-indicator">
          <div className="dynamic-card__drag-indicator-text">
            Taşınıyor...
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicCard;
