import React, { useState } from 'react';
import useContentStore from '../../config/initialData';
import { PAGES } from '../../config/constants';
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
          title: 'Benzer Filmler',
          emptyMessage: 'Benzer film bulunamadı',
          emptyDescription: 'Bu filmle ilişkili başka filmler mevcut değil.',
          addButtonText: 'Listeye Ekle'
        };
      case PAGES.DIZI:
        return {
          title: 'İlgili Diziler',
          emptyMessage: 'İlgili dizi bulunamadı',
          emptyDescription: 'Bu diziyle ilişkili başka diziler mevcut değil.',
          addButtonText: 'Listeye Ekle'
        };
      case PAGES.ANIME:
        return {
          title: 'İlişkili Animeler',
          emptyMessage: 'İlişkili anime bulunamadı',
          emptyDescription: 'Prequel, sequel veya ilgili anime bulunamadı.',
          addButtonText: 'Listeye Ekle'
        };
      default:
        return {
          title: 'İlişkili İçerikler',
          emptyMessage: 'İlişkili içerik bulunamadı',
          emptyDescription: 'Bu içerikle ilgili başka içerikler mevcut değil.',
          addButtonText: 'Ekle'
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
      // İçerik türünü belirle
      let contentType;
      if (item.pageId === PAGES.ANIME) {
        contentType = 'anime';
      } else if (item.pageId === PAGES.DIZI) {
        contentType = 'tv';
      } else {
        contentType = 'movie';
      }
      
      // Daha zengin veri yapısı oluştur
      const contentToAdd = {
        id: relatedItem.id || `related_${Date.now()}`,
        apiData: {
          title: relatedItem.title || relatedItem.name,
          poster: getPosterUrl(relatedItem),
          year: relatedItem.year || relatedItem.release_date?.split('-')[0] || relatedItem.first_air_date?.split('-')[0],
          rating: relatedItem.rating || relatedItem.vote_average || relatedItem.score,
          overview: relatedItem.overview || relatedItem.description || relatedItem.synopsis,
          genres: relatedItem.genres || [],
          type: relatedItem.type || contentType,
          provider: relatedItem.provider || 'related_content',
          tmdbId: relatedItem.tmdbId || relatedItem.id,
          kitsuId: relatedItem.kitsuId,
          // İlişki bilgisini koru
          addedFrom: 'related_content',
          originalRelation: {
            fromId: item.id,
            relationType: relatedItem.relType
          }
        },
        pageId: item.pageId,
        statusId: getDefaultStatusForPage(item.pageId),
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

  // Boş relations dizisini düz hale getir
  const flatRelations = React.useMemo(() => {
    if (!relations || Object.keys(relations).length === 0) return [];
    
    const flattened = [];
    Object.entries(relations).forEach(([relType, relArray]) => {
      if (Array.isArray(relArray)) {
        relArray.forEach(rel => {
          flattened.push({
            ...rel,
            relType
          });
        });
      }
    });
    
    return flattened;
  }, [relations]);

  // Poster URL'ini düzelt
  const getPosterUrl = (rel) => {
    let posterUrl = rel.poster || rel.image || rel.cover || rel.poster_path || rel.thumbnail;
    
    // TMDB poster path'ini full URL'e çevir
    if (posterUrl && posterUrl.startsWith('/')) {
      posterUrl = `https://image.tmdb.org/t/p/w500${posterUrl}`;
    }
    
    // Kitsu poster URL'lerini kontrol et
    if (rel.poster && typeof rel.poster === 'object') {
      posterUrl = rel.poster.large || rel.poster.medium || rel.poster.small || rel.poster.original;
    }
    
    return posterUrl;
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
          title="İlişkileri güncelle"
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

export default RelatedContent;
