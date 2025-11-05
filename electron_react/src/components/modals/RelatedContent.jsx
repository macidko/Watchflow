import React, { useState } from 'react';
import PropTypes from 'prop-types';
import useContentStore from '../../config/initialData';
import { PAGES } from '../../config/constants';
import { t } from '../../i18n';
import '../../css/components/modals/RelatedContent.css';

const RelatedContent = ({ 
  item, 
  relations, 
  onUpdateRelations, 
  relationsLoading = false, 
  relationsError = null 
}) => {
  const [addingContent, setAddingContent] = useState({});
  const [addedContent, setAddedContent] = useState({});
  const { addContent } = useContentStore();

  // İçerik türüne göre başlık ve açıklama metinlerini belirle
  const getContentTypeTexts = (pageId) => {
    switch(pageId) {
      case PAGES.FILM:
        return {
          title: t('components.relatedContent.similarMovies'),
          emptyMessage: t('components.relatedContent.noSimilarMovies'),
          emptyDescription: t('components.relatedContent.noSimilarMoviesDesc'),
          addButtonText: t('components.relatedContent.addToList')
        };
      case PAGES.DIZI:
        return {
          title: t('components.relatedContent.relatedSeries'),
          emptyMessage: t('components.relatedContent.noRelatedSeries'),
          emptyDescription: t('components.relatedContent.noRelatedSeriesDesc'),
          addButtonText: t('components.relatedContent.addToList')
        };
      case PAGES.ANIME:
        return {
          title: t('components.relatedContent.relatedAnime'),
          emptyMessage: t('components.relatedContent.noRelatedAnime'),
          emptyDescription: t('components.relatedContent.noRelatedAnimeDesc'),
          addButtonText: t('components.relatedContent.addToList')
        };
      default:
        return {
          title: t('components.relatedContent.relatedContent'),
          emptyMessage: t('components.relatedContent.noRelatedContent'),
          emptyDescription: t('components.relatedContent.noRelatedContentDesc'),
          addButtonText: t('components.relatedContent.add')
        };
    }
  };

  // İlişki türü etiketlerini Türkçe'ye çevir
  const getRelationTypeLabel = (relType, pageId) => {
    const typeMap = {
      'prequel': 'Önceki',
      'sequel': 'Devam',
      'related': pageId === PAGES.ANIME ? 'İlişkili' : 'Benzer',
      'spin-off': 'Spin-off',
      'side-story': 'Yan Hikaye',
      'alternative': 'Alternatif',
      'adaptation': 'Uyarlama'
    };
    return typeMap[relType] || relType;
  };

  // İçerik ekleme fonksiyonu
  const handleAddContent = async (relatedItem) => {
    const contentId = relatedItem.id;
    
    if (addingContent[contentId]) return;
    
    setAddingContent(prev => ({ ...prev, [contentId]: true }));
    
    try {
      // **KRİTİK FIX**: İçerik türü zaten filtrelenmiş durumda
      // Artık tür kontrolü yapmamıza gerek yok - her zaman mevcut pageId'ye ekle
      const targetPageId = item.pageId;
      
      // İçerik tipini belirle
      let contentType;
      if (targetPageId === PAGES.ANIME) {
        contentType = 'anime';
      } else if (targetPageId === PAGES.DIZI) {
        contentType = 'tv';
      } else {
        contentType = 'movie';
      }
      
      // Temel API data - normalizeRelations'tan gelen TÜM bilgileri koru
      let detailedApiData = {
        title: relatedItem.title || relatedItem.name,
        originalTitle: relatedItem.originalTitle || relatedItem.original_title || relatedItem.original_name,
        poster: getPosterUrl(relatedItem),
        backdrop: relatedItem.backdrop || relatedItem.backdrop_path,
        year: relatedItem.year || relatedItem.releaseDate?.split('-')[0] || relatedItem.first_air_date?.split('-')[0] || relatedItem.release_date?.split('-')[0],
        releaseDate: relatedItem.releaseDate || relatedItem.release_date || relatedItem.first_air_date,
        rating: relatedItem.rating || relatedItem.vote_average || relatedItem.score,
        voteCount: relatedItem.voteCount || relatedItem.vote_count,
        popularity: relatedItem.popularity,
        overview: relatedItem.overview || relatedItem.description || relatedItem.synopsis,
        genres: relatedItem.genres || [],
        episodes: relatedItem.episodes || relatedItem.episodeCount || relatedItem.episode_count,
        episodeCount: relatedItem.episodeCount || relatedItem.episode_count || relatedItem.episodes,
        seasonCount: relatedItem.seasonCount || relatedItem.season_count || relatedItem.number_of_seasons,
        status: relatedItem.status,
        adult: relatedItem.adult,
        duration: relatedItem.duration || relatedItem.runtime || relatedItem.episode_run_time?.[0],
        runtime: relatedItem.runtime || relatedItem.duration || relatedItem.episode_run_time?.[0],
        studios: relatedItem.studios,
        type: contentType,
        provider: relatedItem.provider || 'related_content',
        tmdbId: relatedItem.tmdbId || (contentType !== 'anime' && relatedItem.provider === 'tmdb' ? relatedItem.id : undefined),
        kitsuId: relatedItem.kitsuId || (contentType === 'anime' && relatedItem.provider === 'kitsu' ? relatedItem.id : undefined),
        anilistId: relatedItem.anilistId || (relatedItem.provider === 'anilist' ? relatedItem.id : undefined),
        jikanId: relatedItem.jikanId || (relatedItem.provider === 'jikan' ? relatedItem.id : undefined),
        malId: relatedItem.malId || relatedItem.mal_id,
        // İlişki bilgisini koru
        addedFrom: 'related_content',
        originalRelation: {
          fromId: item.id,
          fromTitle: item.title,
          relationType: relatedItem.relType
        }
      };
      
      // **ARTIK ÇOK DAHA AZ DETAY ÇEKMEMİZ LAZIM** çünkü normalizeRelations zaten dolu bilgi gönderiyor
      // Sadece eksik önemli bilgiler varsa detay çek
      const needsDetailFetch = !detailedApiData.overview || 
                               !detailedApiData.genres?.length || 
                               (!detailedApiData.runtime && contentType === 'movie') ||
                               (!detailedApiData.episodeCount && contentType !== 'movie');
      
      if (needsDetailFetch) {
        try {
          const providerId = relatedItem.tmdbId || relatedItem.anilistId || relatedItem.kitsuId || relatedItem.jikanId;
          const provider = relatedItem.provider;
          
          if (providerId && provider) {
            
            if (provider === 'tmdb') {
              const { TmdbApi } = await import('../../api/providers/TmdbApi.js');
              const tmdbApi = new TmdbApi();
              
              // Türe göre detay çek
              const mediaType = contentType === 'movie' ? 'movie' : 'tv';
              const details = await tmdbApi.getDetails(providerId, mediaType);
              
              // Eksik bilgileri doldur - TÜM detayları al
              if (!detailedApiData.overview) detailedApiData.overview = details.overview;
              if (!detailedApiData.genres?.length) detailedApiData.genres = details.genres;
              if (!detailedApiData.runtime) {
                detailedApiData.runtime = details.duration || details.runtime;
                detailedApiData.duration = details.duration || details.runtime;
              }
              if (!detailedApiData.cast) detailedApiData.cast = details.cast;
              if (!detailedApiData.director) detailedApiData.director = details.director;
              if (!detailedApiData.budget) detailedApiData.budget = details.budget;
              if (!detailedApiData.revenue) detailedApiData.revenue = details.revenue;
              if (!detailedApiData.episodeCount) {
                detailedApiData.episodeCount = details.episodeCount || details.number_of_episodes;
                detailedApiData.episodes = details.episodeCount || details.number_of_episodes;
              }
              if (!detailedApiData.seasonCount) detailedApiData.seasonCount = details.seasonCount || details.number_of_seasons;
              if (!detailedApiData.status) detailedApiData.status = details.status;
              if (!detailedApiData.originalTitle) detailedApiData.originalTitle = details.originalTitle;
              // Relations bilgisini de ekle
              if (details.relations && !detailedApiData.relations) {
                detailedApiData.relations = details.relations;
              }
            } else if (['anilist', 'kitsu', 'jikan'].includes(provider)) {
              const { ApiManager } = await import('../../api/ApiManager.js');
              const apiManager = new ApiManager();
              
              const details = await apiManager.getDetails(providerId, 'anime');
              
              // Eksik bilgileri doldur - TÜM detayları al
              if (!detailedApiData.overview) detailedApiData.overview = details.overview;
              if (!detailedApiData.genres?.length) detailedApiData.genres = details.genres;
              if (!detailedApiData.episodeCount) {
                detailedApiData.episodeCount = details.episodeCount || details.episodes;
                detailedApiData.episodes = details.episodeCount || details.episodes;
              }
              if (!detailedApiData.duration) detailedApiData.duration = details.duration;
              if (!detailedApiData.studios) detailedApiData.studios = details.studios;
              if (!detailedApiData.status) detailedApiData.status = details.status;
              if (!detailedApiData.rating && details.score) detailedApiData.rating = details.score;
              // Relations bilgisini de ekle
              if (details.relations && !detailedApiData.relations) {
                detailedApiData.relations = details.relations;
              }
            }
          }
        } catch (detailError) {
          console.warn(`Failed to fetch additional details for related content, using available info:`, detailError);
          // Detay çekimi başarısız olursa normalize edilmiş bilgilerle devam
        }
      }
      
      // İçeriği ekle - DETAYLI LOG
      const contentToAdd = {
        id: relatedItem.id || `related_${Date.now()}`,
        apiData: detailedApiData,
        pageId: targetPageId,
        statusId: getDefaultStatusForPage(targetPageId),
        addedAt: new Date().toISOString()
      };
      await addContent(contentToAdd);
      
      // Başarı durumunda "Eklendi" state'ini ayarla
      setAddingContent(prev => ({ ...prev, [contentId]: false }));
      setAddedContent(prev => ({ ...prev, [contentId]: true }));
      
      // 3 saniye sonra "Eklendi" state'ini temizle
      setTimeout(() => {
        setAddedContent(prev => ({ ...prev, [contentId]: false }));
      }, 3000);
      
    } catch (error) {
      console.error('İçerik eklenirken hata:', error);
      setAddingContent(prev => ({ ...prev, [contentId]: false }));
      // Hata durumunda toast gösterebiliriz
    }
  };

  // Sayfa için varsayılan status'u belirle
  const getDefaultStatusForPage = (_pageId) => {
    // Tüm sayfalar için varsayılan olarak "İzlenecekler" status'unu kullan
    return 'to-watch';
  };

  // Boş relations dizisini düz hale getir ve TİP UYUMLU OLMAYANLARI FİLTRELE
  const flatRelations = React.useMemo(() => {
    // **KRİTİK FIX**: İçerik türüne göre uyumlu olanları filtrele
    const isCompatibleContent = (relatedItem, currentPageId) => {
      // Daha fazla olası alanı kontrol et (type, media_type, itemType...)
      const rawType = relatedItem.type || relatedItem.media_type || relatedItem.itemType || relatedItem.item_type || relatedItem.mediaType || relatedItem.media_type || '';
      const itemType = (typeof rawType === 'string' ? rawType : '').toLowerCase().trim();

      // Fallback: provider/id bilgisi anime olduğunu işaret ediyorsa anime olarak kabul et
      const assumeAnimeProviders = ['anilist', 'kitsu', 'jikan', 'mal'];
      const isProviderAnime = assumeAnimeProviders.includes((relatedItem.provider || '').toLowerCase());
      const hasAnimeIds = !!(relatedItem.anilistId || relatedItem.kitsuId || relatedItem.jikanId || relatedItem.malId);

      // Anime sayfasındaysa, geniş bir tip seti kabul et ve provider/id'ye bak
      if (currentPageId === PAGES.ANIME) {
        const animeTypes = new Set(['anime', 'tv', 'ova', 'movie', 'special', 'manga', 'ona', 'tv_series', 'tv_show', 'series']);
        const isAnime = animeTypes.has(itemType) || isProviderAnime || hasAnimeIds;
        return isAnime;
      }

      // Dizi sayfasındaysa, TV/Series tiplerini kabul et. Eğer ilk_air_date vb varsa da dizi say
      if (currentPageId === PAGES.DIZI) {
        const seriesTypes = new Set(['tv', 'series', 'tv_series', 'tv_show']);
        const hasAirDate = !!(relatedItem.first_air_date || relatedItem.firstAired || relatedItem.seasons || relatedItem.number_of_seasons);
        const isSeries = seriesTypes.has(itemType) || hasAirDate;
        return isSeries;
      }

      // Film sayfasındaysa, film tiplerini kabul et
      if (currentPageId === PAGES.FILM) {
        const movieTypes = new Set(['movie', 'film', 'feature']);
        const hasReleaseDate = !!(relatedItem.release_date || relatedItem.releaseDate || relatedItem.runtime || relatedItem.duration);
        const isMovie = movieTypes.has(itemType) || hasReleaseDate;
        return isMovie;
      }

      // Varsayılan: tümünü göster
      return true;
    };
    
    if (!relations || Object.keys(relations).length === 0) return [];
    
    const flattened = [];
    Object.entries(relations).forEach(([relType, relArray]) => {
      if (Array.isArray(relArray)) {
        relArray.forEach(rel => {
          // **KRİTİK FIX**: Sadece uyumlu içerikleri ekle
          if (isCompatibleContent(rel, item.pageId)) {
            flattened.push({
              ...rel,
              relType
            });
          }
        });
      }
    });

    return flattened;
  }, [relations, item.pageId]);

  // Poster URL'ini al - artık normalize edilmiş
  const getPosterUrl = (rel) => {
    // Relations'lardan gelen poster bilgileri artık normalize edilmiş
    return rel.poster || rel.image || rel.cover || null;
  };

  const texts = getContentTypeTexts(item.pageId);

  return (
    <div className="related-content">
      <div className="related-content-header">
        <h4 className="related-content-title">{texts.title}</h4>
        <button
          onClick={onUpdateRelations}
          disabled={relationsLoading}
          className="related-content-refresh-btn"
          title={t('components.relatedContent.updateRelations')}
        >
          {relationsLoading ? (
            <div className="loading-spinner"></div>
          ) : (
            <svg className="refresh-icon" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          )}
        </button>
      </div>

      {relationsError && (
        <div className="related-content-error">
          <svg className="error-icon" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span>{relationsError}</span>
        </div>
      )}

      <div className="related-content-grid">
        {flatRelations.length > 0 ? (
          flatRelations.map((rel, index) => {
            const isAdding = addingContent[rel.id];
            const isAdded = addedContent[rel.id];
            const posterSrc = getPosterUrl(rel);
            
            return (
              <div key={rel.id || index} className="related-content-card">
                <div className="related-content-card-poster">
                  {posterSrc ? (
                    <img
                      src={posterSrc}
                      alt={rel.title}
                      className="related-content-poster-image"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className="related-content-poster-fallback" style={{ display: posterSrc ? 'none' : 'flex' }}>
                    <svg className="poster-fallback-icon" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                        d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h4a1 1 0 011 1v18a1 1 0 01-1 1H3a1 1 0 01-1-1V1a1 1 0 011-1h4a1 1 0 011 1v3m0 0h8M7 4H3" />
                    </svg>
                  </div>
                  
                  {rel.relType && (
                    <div className="related-content-relation-badge">
                      {getRelationTypeLabel(rel.relType, item.pageId)}
                    </div>
                  )}
                </div>
                
                <div className="related-content-card-info">
                  <h5 className="related-content-card-title" title={rel.title}>
                    {rel.title}
                  </h5>
                  
                  {rel.year && (
                    <div className="related-content-card-year">
                      {rel.year}
                    </div>
                  )}
                  
                  {rel.rating && (
                    <div className="related-content-card-rating">
                      <svg className="rating-icon" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                      <span>{rel.rating}</span>
                    </div>
                  )}
                </div>
                
                <div className="related-content-card-actions">
                  <button
                    onClick={() => handleAddContent(rel)}
                    disabled={isAdding || isAdded}
                    className={`related-content-add-btn ${isAdding ? 'adding' : ''} ${isAdded ? 'added' : ''}`}
                    title={isAdded ? 'Eklendi' : texts.addButtonText}
                  >
                    {isAdding ? (
                      <>
                        <div className="loading-spinner small"></div>
                        <span>Ekleniyor...</span>
                      </>
                    ) : isAdded ? (
                      <>
                        <svg className="check-icon" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Eklendi</span>
                      </>
                    ) : (
                      <>
                        <svg className="add-icon" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span>{texts.addButtonText}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="related-content-empty">
            <div className="related-content-empty-icon">
              <svg viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h5 className="related-content-empty-title">{texts.emptyMessage}</h5>
            <p className="related-content-empty-description">{texts.emptyDescription}</p>
            <button
              onClick={onUpdateRelations}
              disabled={relationsLoading}
              className="related-content-retry-btn"
            >
              {relationsLoading ? 'Aranıyor...' : 'Tekrar Ara'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

RelatedContent.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    pageId: PropTypes.string
  }),
  relations: PropTypes.arrayOf(PropTypes.object),
  onUpdateRelations: PropTypes.func,
  relationsLoading: PropTypes.bool,
  relationsError: PropTypes.string
};

export default RelatedContent;
