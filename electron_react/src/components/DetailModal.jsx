
import React, { useEffect } from 'react';
import useContentStore from '../config/initialData';

const DetailModal = ({ item, onClose }) => {
  const {
    getContentById,
    markEpisodeWatched,
    markEpisodeUnwatched,
    markSeasonWatched,
    markSeasonUnwatched,
    deleteContent,
    moveContentToStatus,
    fetchAndCacheSeasonData
  } = useContentStore();

  // Store'dan güncel content'i al
  const content = getContentById(item?.id);
  let { apiData = {}, seasons = {} } = content || {};

const episodeCount = apiData.episodeCount || apiData.episodes;
if (
  content?.pageId === 'anime' &&
  (Object.keys(seasons).length === 0 || !seasons[1]?.episodeCount) &&
  episodeCount
) {
  // watchedEpisodes fallback: hem store'dan hem seasons[1] varsa birleştir
  let watchedEpisodes = [];
  if (Array.isArray(content?.watchedEpisodes)) watchedEpisodes = [...content.watchedEpisodes];
  if (seasons[1]?.watchedEpisodes && Array.isArray(seasons[1].watchedEpisodes)) {
    watchedEpisodes = Array.from(new Set([...watchedEpisodes, ...seasons[1].watchedEpisodes]));
  }
  seasons = {
    1: {
      seasonNumber: 1,
      title: apiData?.title || 'Anime',
      episodeCount,
      watchedEpisodes,
    }
  };
}
  useEffect(() => {
    if (item && (!seasons || Object.keys(seasons).length === 0)) {
      if (content?.pageId === 'dizi' || content?.pageId === 'anime') {
        let fetchId = item.id;
        fetchAndCacheSeasonData(fetchId);
      }
    }
  }, [item, content?.pageId, fetchAndCacheSeasonData]);

  // Kapsamlı, modern UI: yeni renkler, kartlar, badge'ler, animasyonlu butonlar
  const [descExpanded, setDescExpanded] = React.useState(false);

  if (!item) return null;

  // Bölüm işaretleme
  const handleEpisodeToggle = (seasonNumber, episodeNumber) => {
    const watched = seasons[seasonNumber]?.watchedEpisodes?.includes(episodeNumber);
    if (watched) {
      markEpisodeUnwatched(item.id, seasonNumber, episodeNumber);
    } else {
      markEpisodeWatched(item.id, seasonNumber, episodeNumber);
    }
  };

  // Sezon işaretleme
  const handleSeasonToggle = (seasonNumber) => {
    const allWatched = seasons[seasonNumber]?.watchedEpisodes?.length === seasons[seasonNumber]?.episodeCount;
    if (allWatched) {
      markSeasonUnwatched(item.id, seasonNumber);
    } else {
      markSeasonWatched(item.id, seasonNumber);
    }
  };

  // Kaldırma
  const handleDelete = () => {
    deleteContent(item.id);
    onClose();
  };

  // İzlendi olarak ekleme
  const handleMarkWatched = () => {
    moveContentToStatus(item.id, 'watched');
    onClose();
  };

  const watchedCount = Object.values(seasons).reduce((acc, s) => acc + (s.watchedEpisodes?.length || 0), 0);
  const totalCount = Object.values(seasons).reduce((acc, s) => acc + (s.episodeCount || 0), 0);
  const progress = totalCount > 0 ? Math.round((watchedCount / totalCount) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-20">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal - Kompakt tasarım */}
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col" style={{maxHeight: 'calc(100vh - 10rem)'}}>
        {/* Header */}
        <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-start gap-3">
            {/* Poster - Küçük */}
            <div className="flex-shrink-0">
              {apiData?.poster ? (
                <img src={apiData.poster} alt={apiData.title} className="w-16 h-24 object-cover rounded-lg shadow border border-gray-200" />
              ) : (
                <div className="w-16 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400 text-2xl">🎬</span>
                </div>
              )}
            </div>
            
            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <h2 className="font-semibold text-gray-900 text-base mb-1 truncate pr-2">
                  {apiData?.title || 'Başlık Yok'}
                </h2>
                <button 
                  onClick={onClose} 
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-md transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Meta badges - Kompakt */}
              <div className="flex flex-wrap gap-1 mb-2">
                {apiData?.rating && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                    ⭐ {apiData.rating}
                  </span>
                )}
                {apiData?.releaseDate && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                    {apiData.releaseDate}
                  </span>
                )}
              </div>
              
              {/* Description - Kompakt */}
              {apiData?.overview && (
                <p className={`text-sm text-gray-600 ${descExpanded ? '' : 'overflow-hidden'}`} 
                   style={!descExpanded ? {
                     display: '-webkit-box',
                     WebkitLineClamp: 2,
                     WebkitBoxOrient: 'vertical'
                   } : {}}>
                  {apiData.overview}
                </p>
              )}
              {apiData?.overview && apiData.overview.length > 100 && (
                <button 
                  onClick={() => setDescExpanded(e => !e)} 
                  className="text-xs text-blue-600 mt-1 hover:underline"
                >
                  {descExpanded ? 'Daha az' : 'Daha fazla'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 overflow-y-auto" style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#d1d5db transparent'
        }}>
          {/* Progress bar - sadece dizi/anime için */}
          {totalCount > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                <span>{watchedCount}/{totalCount} bölüm</span>
                <span className="font-medium text-blue-600">%{progress}</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-2 bg-blue-500 rounded-full transition-all" 
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Seasons/Bölümler - Premium tasarım */}
          {Object.keys(seasons).length > 0 && (
            <div className="space-y-4 mb-4">
              {Object.values(seasons).map(season => {
                const watchedEpisodes = season.watchedEpisodes?.length || 0;
                const totalEpisodes = season.episodeCount || 0;
                const seasonProgress = totalEpisodes > 0 ? Math.round((watchedEpisodes / totalEpisodes) * 100) : 0;
                const isSeasonComplete = watchedEpisodes === totalEpisodes && totalEpisodes > 0;
                return (
                  <div key={season.seasonNumber} className="bg-white/95 backdrop-blur-sm rounded-xl border border-orange-100 shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 border-b border-orange-100">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-sm">
                              {content?.pageId === 'anime' ? 'Bölümler' : `S${season.seasonNumber}`}
                            </span>
                            <span className="text-sm font-semibold text-gray-900">
                              {season.title || (content?.pageId === 'anime' ? 'Anime' : `Season ${season.seasonNumber}`)}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                            {totalEpisodes} bölüm
                          </span>
                        </div>
                        <button
                          onClick={() => handleSeasonToggle(season.seasonNumber)}
                          className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                            isSeasonComplete
                              ? 'bg-green-500 text-white shadow-lg hover:bg-green-600 hover:scale-105' 
                              : 'bg-white/80 text-orange-700 border border-orange-200 hover:bg-orange-50 hover:scale-105 shadow-sm'
                          }`}
                        >
                          {isSeasonComplete ? (
                            <>
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Tamamlandı
                            </>
                          ) : (
                            <>
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                              Tümünü İzle
                            </>
                          )}
                        </button>
                      </div>
                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600 font-medium">
                            {watchedEpisodes}/{totalEpisodes} bölüm izlendi
                          </span>
                          <span className={`font-bold ${seasonProgress === 100 ? 'text-green-600' : 'text-orange-600'}`}>
                            %{seasonProgress}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-2 rounded-full transition-all duration-500 ${
                              seasonProgress === 100 
                                ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                                : 'bg-gradient-to-r from-orange-500 to-red-500'
                            }`}
                            style={{ width: `${seasonProgress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    {/* Episodes Grid */}
                    <div className="p-4">
                      <div className="grid grid-cols-8 gap-2">
                        {Array.from({ length: totalEpisodes }, (_, i) => i + 1).map(ep => {
                          const isWatched = season.watchedEpisodes?.includes(ep);
                          return (
                            <button
                              key={ep}
                              onClick={() => handleEpisodeToggle(season.seasonNumber, ep)}
                              className={`group relative w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-all duration-200 ${
                                isWatched
                                  ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg hover:shadow-xl hover:scale-110 border-2 border-green-400' 
                                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700 hover:scale-110 shadow-sm hover:shadow-md'
                              }`}
                              title={`Bölüm ${ep}${isWatched ? ' - İzlendi' : ' - İzlenmedi'}`}
                            >
                              {isWatched && (
                                <div className="absolute inset-0 bg-green-400/20 rounded-lg animate-pulse"></div>
                              )}
                              <span className="relative z-10">{ep}</span>
                              {isWatched && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full flex items-center justify-center">
                                  <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                      {/* Episode Stats */}
                      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                        <span>Bölümlere tıklayarak işaretleyin</span>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full"></div>
                            <span>İzlendi</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-gray-300 rounded-full border border-gray-400"></div>
                            <span>İzlenmedi</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Additional info - Kompakt */}
          {(apiData?.genres || apiData?.provider) && (
            <div className="flex flex-wrap gap-1 mb-4">
              {apiData?.genres && apiData.genres.length > 0 && 
                apiData.genres.slice(0, 3).map(genre => (
                  <span key={genre} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                    {genre}
                  </span>
                ))
              }
              {apiData?.provider && (
                <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">
                  {apiData.provider}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer - Kompakt butonlar */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex-shrink-0">
          <div className="flex gap-2">
            <button 
              onClick={handleMarkWatched} 
              className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium flex items-center justify-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              İzlendi
            </button>
            <button 
              onClick={handleDelete} 
              className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium flex items-center justify-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Kaldır
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;
