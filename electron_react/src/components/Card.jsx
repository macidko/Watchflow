import React, { useState } from 'react';

const Card = ({ item, onClick, onDragStart, onDragEnd, isDragging, sliderId }) => {
  const [imgError, setImgError] = useState(false);
  
  // Yeni veri yapısına göre field mapping
  const poster = item.poster || item.imageUrl || (item.apiData?.poster);
  const title = item.title || (item.apiData?.title);
  const genres = item.genres || item.genre || (item.apiData?.genres) || [];
  const releaseDate = item.releaseDate || item.year || (item.apiData?.releaseDate);
  const rating = item.rating || item.score || (item.apiData?.rating || item.apiData?.score);

  const showImage = poster && !imgError;

  const handleDragStart = (e) => {
    if (onDragStart) {
      e.dataTransfer.setData('text/plain', JSON.stringify({
        item,
        sourceSlider: sliderId
      }));
      e.dataTransfer.effectAllowed = 'move';
      onDragStart(item, sliderId);
    }
  };

  const handleDragEnd = () => {
    if (onDragEnd) {
      onDragEnd();
    }
  };

  return (
    <div
      className={`group flex-none w-44 h-64 bg-gray-900 rounded-xl overflow-hidden transition-all duration-300 cursor-move relative border border-gray-800 ${
        isDragging 
          ? 'opacity-70 scale-95 ring-2 ring-orange-500 shadow-lg shadow-orange-500/25' 
          : 'hover:scale-[1.02] hover:shadow-lg hover:shadow-black/40 hover:border-gray-700'
      }`}
      onClick={() => onClick && onClick(item)}
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
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={() => setImgError(true)}
              draggable={false}
            />
            
            {/* Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20"></div>
            
            {/* Rating Badge */}
            {rating && (
              <div className="absolute top-3 right-3 px-2 py-1 bg-black/80 backdrop-blur-sm rounded-md">
                <div className="flex items-center gap-1">
                  <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  <span className="text-xs font-medium text-white">{Number(rating).toFixed(1)}</span>
                </div>
              </div>
            )}

            {/* Content Overlay - Bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <h3 className="text-white text-sm font-semibold line-clamp-2 mb-1 drop-shadow-lg">
                {title || 'Başlık Yok'}
              </h3>
              
              <div className="flex items-center justify-between">
                {releaseDate && (
                  <span className="text-xs text-gray-200 drop-shadow-md">{releaseDate}</span>
                )}
                {genres.length > 0 && (
                  <span className="text-xs text-gray-300 bg-black/30 px-2 py-0.5 rounded-full backdrop-blur-sm">
                    {genres[0]}
                  </span>
                )}
              </div>
            </div>

            {/* Drag Indicator */}
            {isDragging && (
              <div className="absolute inset-0 flex items-center justify-center bg-orange-500/30 backdrop-blur-sm">
                <div className="bg-orange-500 text-white px-3 py-1.5 rounded-md font-medium text-sm">
                  Taşınıyor...
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center relative">
            <div className="text-center">
              <svg className="w-8 h-8 text-gray-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-xs text-gray-500">Poster Yok</p>
            </div>
            
            {/* Content for No Image */}
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <h3 className="text-white text-sm font-semibold line-clamp-2 mb-1">
                {title || 'Başlık Yok'}
              </h3>
              
              <div className="flex items-center justify-between">
                {releaseDate && (
                  <span className="text-xs text-gray-400">{releaseDate}</span>
                )}
                {genres.length > 0 && (
                  <span className="text-xs text-gray-500 bg-gray-700 px-2 py-0.5 rounded-full">
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