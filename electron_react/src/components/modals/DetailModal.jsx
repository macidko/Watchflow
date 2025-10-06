import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import useContentStore from '../../config/initialData';
import RelatedContent from './RelatedContent';
import '../../css/components/modals/DetailModal.css';

const DetailModal = ({ item, onClose }) => {
  const modalRef = useRef(null);
  const {
    getContentById,
    markEpisodeWatched,
    markEpisodeUnwatched,
    markSeasonWatched,
    markSeasonUnwatched,
    deleteContent,
    moveContentToStatus,
    fetchAndCacheSeasonData,
    fetchAndUpdateRelations
  } = useContentStore();

  // Helper function for status badge
  const getStatusBadge = (status) => {
    const statusMap = {
      'finished': {
        background: 'linear-gradient(90deg,#16a34a,#22d3ee)',
        borderColor: '#16a34a',
        text: 'Tamamlandı'
      },
      'airing': {
        background: 'linear-gradient(90deg,#f59e42,#fbbf24)',
        borderColor: '#f59e42',
        text: 'Devam Ediyor'
      }
    };
    return statusMap[status] || {
      background: 'linear-gradient(90deg,#64748b,#334155)',
      borderColor: '#64748b',
      text: status
    };
  };

  // Store'dan güncel content'i al
  const content = getContentById(item?.id);
  let { apiData = {}, seasons = {} } = content || {};

  useEffect(() => {
    if (!item) return;
    if (!seasons || Object.keys(seasons).length === 0) {
      if (content?.pageId === 'dizi' || content?.pageId === 'anime') {
        let fetchId = item.id;
        fetchAndCacheSeasonData(fetchId);
      }
    }
    // Relations bilgisi yoksa fetch et
    if (!apiData?.relations) {
      fetchAndUpdateRelations(item.id);
    }
  }, [item, content?.pageId, fetchAndCacheSeasonData, seasons, apiData?.relations, fetchAndUpdateRelations]);


  // Debug: Check what data we have
  useEffect(() => {
    const focusableSelectors = [
      'button', 'a[href]', 'input', 'select', 'textarea', '[tabindex]:not([tabindex="-1"])'
    ];
    const node = modalRef.current;
    if (!node) return;
    // İlk odaklanabilir elemana odaklan
    const focusables = node.querySelectorAll(focusableSelectors.join(','));
    if (focusables.length) focusables[0].focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Tab') {
        // Focus trap
        const focusable = Array.from(node.querySelectorAll(focusableSelectors.join(',')));
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };
    node.addEventListener('keydown', handleKeyDown);
    return () => node.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);



  // debug removed
  const [relationsError, setRelationsError] = React.useState(null);

const episodeCount = apiData.episodeCount || apiData.episodes;
// Anime için seasons fallback işlemi koşulsuz yapılır, hook dışında
if (
  content?.pageId === 'anime' &&
  (Object.keys(seasons).length === 0 || !seasons[1]?.episodeCount) &&
  episodeCount
) {
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


  // Kapsamlı, modern UI: yeni renkler, kartlar, badge'ler, animasyonlu butonlar
  const [descExpanded, setDescExpanded] = React.useState(false);
  const [relationsLoading, setRelationsLoading] = React.useState(false);
  const [seasonsLoading, setSeasonsLoading] = React.useState(false);
  const [seasonsError, setSeasonsError] = React.useState(null);

  // İlişkili içerikler güncelleme fonksiyonu
  const handleUpdateRelations = async () => {
    setRelationsError(null);
    try {
      setRelationsLoading(true);
      await fetchAndUpdateRelations(item.id);
    } catch (err) {
      console.error('Relations update failed:', err);
      setRelationsError('İlişkili içerikler güncellenirken hata oluştu');
    } finally {
      setRelationsLoading(false);
    }
  };


  // Tüm useEffect hook'ları return'dan önce olmalı

  // useEffect her zaman çağrılır, koşul içeride
  useEffect(() => {
    if (!item) return;
    if (!seasons || Object.keys(seasons).length === 0) {
      if (content?.pageId === 'dizi' || content?.pageId === 'anime') {
        let fetchId = item.id;
        fetchAndCacheSeasonData(fetchId);
      }
    }
  }, [item, content?.pageId, fetchAndCacheSeasonData, seasons]);

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

  // Focus trap ve ESC ile kapama
  useEffect(() => {
    const focusableSelectors = [
      'button', 'a[href]', 'input', 'select', 'textarea', '[tabindex]:not([tabindex="-1"])'
    ];
    const node = modalRef.current;
    if (!node) return;
    // İlk odaklanabilir elemana odaklan
    const focusables = node.querySelectorAll(focusableSelectors.join(','));
    if (focusables.length) focusables[0].focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Tab') {
        // Focus trap
        const focusable = Array.from(node.querySelectorAll(focusableSelectors.join(',')));
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };
    node.addEventListener('keydown', handleKeyDown);
    return () => node.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!item) return null;

  return (
  <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-20" role="dialog" aria-modal="true" aria-labelledby="detail-modal-title" tabIndex={-1}>
      {/* Backdrop */}
  <div className="absolute inset-0 detail-modal-backdrop" onClick={onClose} />
      {/* Modal - Kompakt tasarım */}
  <div ref={modalRef} className="detail-modal-container" style={{
    maxHeight: '90vh',
    pointerEvents: 'auto'
  }} tabIndex={0}>
        {/* Header */}
  <div className="detail-modal-header">
          <div className="flex items-start gap-2 sm:gap-3">
            {/* Poster - Küçük */}
            <div className="flex-shrink-0 relative">
              {apiData?.poster ? (
                <img src={apiData.poster} alt={apiData.title} className="detail-modal-poster" />
              ) : (
                <div className="detail-modal-poster-placeholder">
                  <span className="detail-modal-poster-icon">🎬</span>
                </div>
              )}
            </div>
            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <h2 id="detail-modal-title" className="detail-modal-title">
                    {apiData?.title || 'Başlık Yok'}
                  </h2>
                  {/* Status badge başlığın hemen sağında, animasyonsuz */}
                  {apiData?.relations?.status && (() => {
                    const badge = getStatusBadge(apiData.relations.status);
                    return (
                      <span className="ml-1 px-3 py-1 rounded-full text-xs font-bold shadow-lg border border-2"
                        style={{
                          background: badge.background,
                          color: '#fff',
                          borderColor: badge.borderColor,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                          zIndex: 2
                        }}
                        title={badge.text}
                      >
                        {badge.text}
                      </span>
                    );
                  })()}
                </div>
                <button 
                  onClick={onClose} 
                  className="detail-modal-close"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <title>Kapat</title>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {/* Meta badges - Kompakt */}
              <div className="flex flex-wrap gap-1 mb-2">
                {apiData?.rating && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium" style={{background: 'var(--card-bg, #1e1e1e)', color: 'var(--accent-color, #ff4500)'}}>
                    ⭐ {apiData.rating}
                  </span>
                )}
                {apiData?.releaseDate && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium opacity-70" style={{background: 'var(--card-bg, #1e1e1e)', color: 'var(--primary-text, #fff)'}}>
                    {apiData.releaseDate}
                  </span>
                )}
              </div>
              {/* Description - Kompakt */}
              {apiData?.overview && (
                <p className={`text-sm opacity-80 ${descExpanded ? '' : 'overflow-hidden'}`} 
                   style={{
                     color: 'var(--primary-text, #fff)',
                     ...(!descExpanded && {
                       display: '-webkit-box',
                       WebkitLineClamp: 2,
                       WebkitBoxOrient: 'vertical'
                     })
                   }}>
                  {apiData.overview}
                </p>
              )}
              {apiData?.overview && apiData.overview.length > 100 && (
                <button 
                  onClick={() => setDescExpanded(e => !e)} 
                  className="text-xs mt-1 hover:underline"
                  style={{color: 'var(--accent-color, #ff4500)'}}
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
          scrollbarColor: 'var(--secondary-bg, #1e1e1e) var(--primary-bg, #121212)'
        }}>
          {/* Progress bar - sadece dizi/anime için */}
          {totalCount > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs" style={{color: 'var(--secondary-text, #b3b3b3)'}}>
                <span>{watchedCount}/{totalCount} bölüm</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium" style={{color: 'var(--accent-color, #ff4500)'}}>%{progress}</span>
                  <button
                    onClick={async () => {
                      setSeasonsError(null);
                      try {
                        setSeasonsLoading(true);
                        await fetchAndCacheSeasonData(item.id, true);
                      } catch (err) {
                        console.error(err);
                        setSeasonsError('Sezonlar güncellenemedi');
                      } finally {
                        setSeasonsLoading(false);
                      }
                    }}
                    disabled={seasonsLoading}
                    className="text-xs px-2 py-1 rounded bg-[#374151] hover:bg-[#4b5563] text-white"
                    title="Sezon bilgilerini güncelle"
                  >
                    {seasonsLoading ? 'Güncelleniyor...' : 'Sezonları Güncelle'}
                  </button>
                </div>
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden" style={{background: 'var(--border-color, #2a2a2a)'}}>
                <div 
                  className="h-2 rounded-full transition-all" 
                  style={{ width: `${progress}%`, background: 'var(--accent-color, #ff4500)' }}
                />
              </div>
              {seasonsError && <div className="text-xs text-red-400 mt-2">{seasonsError}</div>}
            </div>
          )}

          {/* Film için özel detaylar */}
          {content?.pageId === 'film' && (
            <div className="mb-4 space-y-3">
              {/* Film Detayları Kartı */}
              <div className="rounded-lg p-4 border" style={{
                borderColor: 'var(--border-color, #2a2a2a)',
                background: 'linear-gradient(135deg, var(--card-bg, #1e1e1e) 60%, var(--secondary-bg, #1e1e1e) 100%)'
              }}>
                <h3 className="text-sm font-semibold text-[#A3A8B8] mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h4a1 1 0 011 1v18a1 1 0 01-1 1H3a1 1 0 01-1-1V1a1 1 0 011-1h4a1 1 0 011 1v3m0 0h8M7 4H3" />
                  </svg>
                  Film Detayları
                </h3>
                
                <div className="grid grid-cols-2 gap-3">
                  {/* Süre */}
                  {apiData?.runtime && (
                    <div className="rounded-lg p-3 border" style={{background: 'var(--card-bg, #1e1e1e)', borderColor: 'var(--border-color, #2a2a2a)'}}>
                      <div className="flex items-center gap-2 mb-1">
                        <svg className="w-4 h-4 text-[#029096]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-xs font-medium" style={{color: 'var(--accent-color, #ff4500)'}}>Süre</span>
                      </div>
                      <span className="text-sm font-bold" style={{color: 'var(--primary-text, #fff)'}}>{apiData.runtime} dk</span>
                    </div>
                  )}

                  {/* Bütçe */}
                  {apiData?.budget && apiData.budget > 0 && (
                    <div className="rounded-lg p-3 border" style={{background: 'var(--card-bg, #1e1e1e)', borderColor: 'var(--border-color, #2a2a2a)'}}>
                      <div className="flex items-center gap-2 mb-1">
                        <svg className="w-4 h-4 text-[#029096]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                        <span className="text-xs font-medium" style={{color: 'var(--accent-color, #ff4500)'}}>Bütçe</span>
                      </div>
                      <span className="text-sm font-bold" style={{color: 'var(--primary-text, #fff)'}}>
                        ${(apiData.budget / 1000000).toFixed(1)}M
                      </span>
                    </div>
                  )}

                  {/* Hasılat */}
                  {apiData?.revenue && apiData.revenue > 0 && (
                    <div className="rounded-lg p-3 border" style={{background: 'var(--card-bg, #1e1e1e)', borderColor: 'var(--border-color, #2a2a2a)'}}>
                      <div className="flex items-center gap-2 mb-1">
                        <svg className="w-4 h-4 text-[#029096]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        <span className="text-xs font-medium" style={{color: 'var(--accent-color, #ff4500)'}}>Hasılat</span>
                      </div>
                      <span className="text-sm font-bold" style={{color: 'var(--primary-text, #fff)'}}>
                        ${(apiData.revenue / 1000000).toFixed(1)}M
                      </span>
                    </div>
                  )}

                  {/* IMDB Puanı */}
                  {(apiData?.vote_average || apiData?.rating) && (
                    <div className="rounded-lg p-3 border" style={{background: 'var(--card-bg, #1e1e1e)', borderColor: 'var(--accent-color, #ff4500)'}}>
                      <div className="flex items-center gap-2 mb-1">
                        <svg className="w-4 h-4 text-[#029096]" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                        <span className="text-xs font-medium" style={{color: 'var(--accent-color, #ff4500)'}}>Puan</span>
                      </div>
                      <span className="text-sm font-bold" style={{color: 'var(--accent-color, #ff4500)'}}>
                        {(apiData.vote_average || apiData.rating)}/10
                      </span>
                    </div>
                  )}
                </div>

                {/* Oyuncular */}
                {apiData?.cast && apiData.cast.length > 0 && (
                  <div className="mt-3">
                    <h4 className="text-xs font-medium text-[#029096] mb-2">Başrol Oyuncuları</h4>
                    <div className="flex flex-wrap gap-1">
                      {apiData.cast.slice(0, 4).map((actor) => (
                        <span key={actor.id || actor.name || actor} className="px-2 py-1 rounded-full text-xs opacity-70" style={{background: 'var(--secondary-bg, #1e1e1e)', color: 'var(--primary-text, #fff)'}}>
                          {actor.name || actor}
                        </span>
                      ))}
                      {apiData.cast.length > 4 && (
                        <span className="px-2 py-1 rounded-full text-xs" style={{background: 'var(--secondary-bg, #1e1e1e)', color: 'var(--accent-color, #ff4500)'}}>
                          +{apiData.cast.length - 4} daha
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Yönetmen */}
                {apiData?.director && (
                  <div className="mt-3">
                    <h4 className="text-xs font-medium text-[#029096] mb-1">Yönetmen</h4>
                    <span className="px-2 py-1 rounded-full text-xs opacity-70" style={{background: 'var(--secondary-bg, #1e1e1e)', color: 'var(--primary-text, #fff)'}}>
                      {apiData.director}
                    </span>
                  </div>
                )}
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
                  <div key={season.seasonNumber} className="backdrop-blur-sm rounded-xl border shadow-lg overflow-hidden" style={{
                    background: 'var(--card-bg, #1e1e1e)',
                    borderColor: 'var(--border-color, #2a2a2a)'
                  }}>
                    {/* Header */}
                    <div className="p-4" style={{
                      borderBottom: '1px solid var(--border-color, #2a2a2a)',
                      background: 'linear-gradient(90deg, var(--card-bg, #1e1e1e) 60%, var(--secondary-bg, #1e1e1e) 100%)'
                    }}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold shadow-sm" style={{ background: 'var(--accent-color, #ff4500)', color: 'var(--primary-text, #fff)' }}>
                              {content?.pageId === 'anime' ? 'Bölümler' : `S${season.seasonNumber}`}
                            </span>
                            <span className="text-sm font-semibold" style={{color: 'var(--primary-text, #fff)'}}>
                              {season.title || (content?.pageId === 'anime' ? 'Anime' : `Season ${season.seasonNumber}`)}
                            </span>
                          </div>
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{color: 'var(--secondary-text, #b3b3b3)', background: 'var(--secondary-bg, #1e1e1e)'}}>
                            {totalEpisodes} bölüm
                          </span>
                        </div>
                        <button
                          onClick={() => handleSeasonToggle(season.seasonNumber)}
                          className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                            isSeasonComplete
                              ? ''
                              : ''
                          }`}
                          style={isSeasonComplete ? {
                            background: 'var(--accent-color, #ff4500)',
                            color: 'var(--primary-text, #fff)',
                            boxShadow: 'var(--card-shadow, 0 4px 10px rgba(0,0,0,0.3))',
                            border: 'none',
                          } : {
                            background: 'var(--card-bg, #1e1e1e)',
                            color: 'var(--primary-text, #fff)',
                            border: '1px solid var(--border-color, #2a2a2a)',
                            boxShadow: 'var(--card-shadow, 0 4px 10px rgba(0,0,0,0.3))',
                          }}
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
                          <span className="text-[#A3A8B8] font-medium">
                            {watchedEpisodes}/{totalEpisodes} bölüm izlendi
                          </span>
                          <span className="font-bold" style={{color: seasonProgress === 100 ? 'var(--accent-color, #ff4500)' : 'var(--primary-text, #fff)'}}>
                            %{seasonProgress}
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full overflow-hidden" style={{background: 'var(--border-color, #2a2a2a)'}}>
                          <div 
                            className={`h-2 rounded-full transition-all duration-500`}
                            style={{ width: `${seasonProgress}%`, background: 'var(--accent-color, #ff4500)' }}
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
                              className={`group relative w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-all duration-200`}
                              style={isWatched ? {
                                background: 'var(--accent-color, #ff4500)',
                                color: 'var(--primary-text, #fff)',
                                boxShadow: 'var(--card-shadow, 0 4px 10px rgba(0,0,0,0.3))',
                                border: '2px solid var(--accent-color, #ff4500)'
                              } : {
                                background: 'var(--card-bg, #1e1e1e)',
                                color: 'var(--primary-text, #fff)',
                                border: '2px solid var(--border-color, #2a2a2a)',
                                boxShadow: 'var(--card-shadow, 0 4px 10px rgba(0,0,0,0.3))',
                              }}
                              title={`Bölüm ${ep}${isWatched ? ' - İzlendi' : ' - İzlenmedi'}`}
                            >
                              {isWatched && (
                                <div className="absolute inset-0 bg-[#029096]/20 rounded-lg animate-pulse"></div>
                              )}
                              <span className="relative z-10" style={{color: 'var(--primary-text, #fff)'}}>{ep}</span>
                              {isWatched && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full flex items-center justify-center" style={{background: 'var(--accent-color, #ff4500)'}}>
                                    <svg className="w-2 h-2" style={{color: 'var(--primary-text, #fff)'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                      {/* Episode Stats */}
                      <div className="mt-4 flex items-center justify-between text-xs opacity-60" style={{color: 'var(--primary-text, #fff)'}}>
                        <span>Bölümlere tıklayarak işaretleyin</span>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full" style={{background: 'var(--accent-color, #ff4500)'}}></div>
                            <span style={{color: 'var(--accent-color, #ff4500)'}}>İzlendi</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2" style={{background: 'var(--secondary-bg, #1e1e1e)', border: '1px solid var(--card-bg, #1e1e1e)'}}></div>
                            <span className="opacity-60" style={{color: 'var(--primary-text, #fff)'}}>İzlenmedi</span>
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
                  <span key={genre} className="px-2 py-1 rounded-full text-xs" style={{background: 'var(--secondary-bg, #1e1e1e)', color: 'var(--accent-color, #ff4500)'}}>
                    {genre}
                  </span>
                ))
              }
              {apiData?.provider && (
                <span className="px-2 py-1 rounded-full text-xs" style={{background: 'var(--secondary-bg, #1e1e1e)', color: 'var(--accent-color, #ff4500)'}}>
                  {apiData.provider}
                </span>
              )}
            </div>
          )}

          {/* İlişkili İçerikler - Yeni Modern Component */}
          <RelatedContent 
            item={{...item, pageId: content?.pageId}}
            relations={apiData?.relations}
            onUpdateRelations={handleUpdateRelations}
            relationsLoading={relationsLoading}
            relationsError={relationsError}
          />
        </div>

        {/* Footer - Kompakt butonlar */}
  <div className="p-4 flex-shrink-0" style={{background: 'var(--secondary-bg, #1e1e1e)', borderTop: '1px solid var(--border-color, #2a2a2a)'}}>
          <div className="flex gap-2">
            <button 
              onClick={handleMarkWatched} 
              className="flex-1 px-3 py-2 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-1 shadow-md"
              style={{
                background: 'var(--accent-color, #ff4500)',
                color: 'var(--primary-text, #fff)',
                border: '1px solid var(--border-color, #2a2a2a)'
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="#222831" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              İzlendi
            </button>
            <button 
              onClick={handleDelete} 
              className="flex-1 px-3 py-2 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-1 shadow-md"
              style={{
                background: 'var(--card-bg, #1e1e1e)',
                color: 'var(--primary-text, #fff)',
                border: '1px solid var(--border-color, #2a2a2a)'
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="#222831" viewBox="0 0 24 24">
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

DetailModal.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string,
    pageId: PropTypes.string
  }),
  onClose: PropTypes.func.isRequired
};

export default DetailModal;
