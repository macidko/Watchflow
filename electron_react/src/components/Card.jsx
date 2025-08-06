import React, { useState } from 'react';

const Card = ({ item, onClick }) => {
  const [imgError, setImgError] = useState(false);
  // Yeni veri yapısına göre field mapping
  const poster = item.poster || item.imageUrl || (item.apiData?.poster);
  const title = item.title || (item.apiData?.title);
  const overview = item.overview || item.description || (item.apiData?.overview);
  const genres = item.genres || item.genre || (item.apiData?.genres) || [];
  const releaseDate = item.releaseDate || item.year || (item.apiData?.releaseDate);
  const rating = item.rating || item.score || (item.apiData?.rating || item.apiData?.score);

  const showImage = poster && !imgError;
  return (
    <div
      className="flex-none w-48 h-72 bg-zinc-800 rounded-lg overflow-hidden hover:scale-105 hover:shadow-md hover:shadow-white/10 transition-all duration-300 cursor-pointer relative"
      onClick={() => onClick && onClick(item)}
    >
      {showImage ? (
        <>
          <img
            src={poster}
            alt={title}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
            draggable={false}
          />
          {/* Overlay for better readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 via-zinc-900/20 to-transparent" />
          {/* Info at bottom */}
          <div className="absolute bottom-0 left-0 w-full p-3 flex flex-col">
            <h3 className="text-white font-bold text-lg mb-1 line-clamp-1 drop-shadow-lg">{title}</h3>
            <p className="text-zinc-200 text-xs line-clamp-2 mb-1 drop-shadow">{overview}</p>
            {genres.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-1 justify-start">
                {genres.slice(0, 2).map((genre, index) => (
                  <span 
                    key={index}
                    className="text-xs px-2 py-1 bg-zinc-700/90 text-zinc-300 rounded-full border border-zinc-600/50"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between w-full">
              {releaseDate && (
                <span className="text-zinc-300 text-xs drop-shadow">{releaseDate}</span>
              )}
              {rating && (
                <div className="flex items-center">
                  <svg className="w-3 h-3 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  <span className="text-yellow-400 text-xs font-medium drop-shadow">{rating}</span>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-center p-4">
          <div className="w-16 h-16 bg-zinc-700 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-zinc-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <h3 className="text-white font-bold text-base mb-2">{title}</h3>
          <p className="text-zinc-400 text-xs line-clamp-2 mb-2">{overview}</p>
          {/* Genre etiketleri */}
          {genres.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2 justify-center">
              {genres.slice(0, 2).map((genre, index) => (
                <span 
                  key={index}
                  className="text-xs px-2 py-1 bg-zinc-700 text-zinc-300 rounded-full"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between w-full mt-auto">
            {releaseDate && (
              <span className="text-zinc-500 text-xs">{releaseDate}</span>
            )}
            {rating && (
              <div className="flex items-center">
                <svg className="w-3 h-3 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <span className="text-yellow-500 text-xs font-medium">{rating}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Card;
