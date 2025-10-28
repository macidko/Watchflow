// İçerik Takip Uygulaması - Veri Yapısı ve Store
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';

// Ana veri yapısı şeması
const initialData = {
  pages: {
    "anasayfa": {
      id: "anasayfa",
      title: "Ana Sayfa",
      order: 0,
      visible: true,
      createdAt: "2024-01-01T00:00:00Z"
    },
    "film": {
      id: "film",
      title: "Filmler",
      order: 1,
      visible: true,
      createdAt: "2024-01-01T00:00:00Z"
    },
    "dizi": {
      id: "dizi", 
      title: "Diziler",
      order: 2,
      visible: true,
      createdAt: "2024-01-01T00:00:00Z"
    },
    "anime": {
      id: "anime",
      title: "Animeler", 
      order: 3,
      visible: true,
      createdAt: "2024-01-01T00:00:00Z"
    }
  },
  
  statuses: {
    "film": {
      "to-watch": {
        id: "to-watch",
        pageId: "film",
        title: "İzlenecekler",
        order: 0,
        visible: true,
        type: "default",
        createdAt: "2024-01-01T00:00:00Z"
      },
      "watching": {
        id: "watching",
        pageId: "film", 
        title: "İzleniyor",
        order: 1,
        visible: true,
        type: "default",
        createdAt: "2024-01-01T00:00:00Z"
      },
      "watched": {
        id: "watched",
        pageId: "film",
        title: "İzlendi",
        order: 2,
        visible: true,
        type: "default", 
        createdAt: "2024-01-01T00:00:00Z"
      }
    },
    "dizi": {
     "to-watch": {
        id: "to-watch",
        pageId: "dizi",
        title: "İzlenecekler",
        order: 0,
        visible: true,
        type: "default",
        createdAt: "2024-01-01T00:00:00Z"
      },
      "watching": {
        id: "watching",
        pageId: "dizi", 
        title: "İzleniyor",
        order: 1,
        visible: true,
        type: "default",
        createdAt: "2024-01-01T00:00:00Z"
      },
      "watched": {
        id: "watched",
        pageId: "dizi",
        title: "İzlendi",
        order: 2,
        visible: true,
        type: "default", 
        createdAt: "2024-01-01T00:00:00Z"
      }
    },
    "anime": {
      "to-watch": {
        id: "to-watch",
        pageId: "anime",
        title: "İzlenecekler",
        order: 0,
        visible: true,
        type: "default",
        createdAt: "2024-01-01T00:00:00Z"
      },
      "watching": {
        id: "watching",
        pageId: "anime", 
        title: "İzleniyor",
        order: 1,
        visible: true,
        type: "default",
        createdAt: "2024-01-01T00:00:00Z"
      },
      "watched": {
        id: "watched",
        pageId: "anime",
        title: "İzlendi",
        order: 2,
        visible: true,
        type: "default", 
        createdAt: "2024-01-01T00:00:00Z"
      }
    }
  },

  contents: {
    "content_1": {
      id: "content_1",
      pageId: "film",
      statusId: "to-watch",
      
      // API'den gelen veriler
      apiData: {
        tmdbId: 123456,
        title: "Test Film",
        originalTitle: "Test Movie",
        overview: "Bu bir test film açıklamasıdır. Modal testini yapmak için kullanılıyor.",
        poster: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
        backdrop: "https://image.tmdb.org/backdrop.jpg",
        rating: 8.5,
        releaseDate: "2024-01-01",
        genres: ["Action", "Adventure"],
        runtime: 120,
      },

      // Seasons & Episodes (Diziler ve Animeler için)
      seasons: {
        1: {
          seasonNumber: 1,
          episodeCount: 12,
          title: "Season 1",
          // Her bölüm için izlenme durumu
          watchedEpisodes: [1, 2, 3] // İzlenen bölüm numaraları
        },
        2: {
          seasonNumber: 2, 
          episodeCount: 10,
          title: "Season 2",
          watchedEpisodes: []
        }
      },

      // Metadata
      addedAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
      userRating: null, // Kullanıcının verdiği puan
      notes: "" // Kullanıcı notları
    },
    "content_2": {
      id: "content_2",
      pageId: "dizi",
      statusId: "watching",
      
      // API'den gelen veriler
      apiData: {
        tmdbId: 789123,
        title: "Test Dizi",
        originalTitle: "Test Series",
        overview: "Bu bir test dizi açıklamasıdır. Sezon ve bölüm tracking testini yapmak için kullanılıyor.",
        poster: "https://image.tmdb.org/t/p/w500/test-series.jpg",
        backdrop: "https://image.tmdb.org/backdrop-series.jpg",
        rating: 9.2,
        releaseDate: "2023-01-01",
        genres: ["Drama", "Thriller"],
        runtime: 45,
      },

      // Seasons & Episodes (Diziler ve Animeler için)
      seasons: {
        1: {
          seasonNumber: 1,
          episodeCount: 8,
          title: "Season 1",
          watchedEpisodes: [1, 2, 3, 4]
        },
        2: {
          seasonNumber: 2, 
          episodeCount: 10,
          title: "Season 2",
          watchedEpisodes: [1, 2]
        }
      },

      // Metadata
      addedAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
      userRating: null,
      notes: ""
    }
  }
};
// Zustand Store
const useContentStore = create()(
  persist(
    immer((set, get) => ({
      // State - sadece store boşsa initialData'yı kullan
      pages: {},
      statuses: {},
      contents: {},

      // Initialize store with default data if empty
      initializeStore: () => set((state) => {
        // Sadece store boşsa initialize et
        if (Object.keys(state.pages).length === 0) {
          state.pages = { ...initialData.pages };
          state.statuses = { ...initialData.statuses };
          state.contents = { ...initialData.contents };
        }
      }),

      // Page Actions
      getPages: () => {
        const { pages } = get();
        return Object.values(pages)
          .filter(page => page.visible)
          .sort((a, b) => a.order - b.order);
      },

      addPage: (pageData) => set((state) => {
        const id = pageData.id || `page_${Date.now()}`;
        state.pages[id] = {
          id,
          title: pageData.title,
          order: pageData.order || Object.keys(state.pages).length,
          visible: true,
          createdAt: new Date().toISOString(),
          ...pageData
        };
        // Yeni sayfa için boş status objesi oluştur
        state.statuses[id] = {};
      }),

      updatePage: (pageId, updates) => set((state) => {
        if (state.pages[pageId]) {
          Object.assign(state.pages[pageId], updates);
        }
      }),

      deletePage: (pageId) => set((state) => {
        delete state.pages[pageId];
        delete state.statuses[pageId];
        // İlgili page'deki tüm içerikleri sil
        Object.keys(state.contents).forEach(contentId => {
          if (state.contents[contentId].pageId === pageId) {
            delete state.contents[contentId];
          }
        });
      }),

      // Status Actions
      getStatusesByPage: (pageId) => {
        const { statuses } = get();
        if (!statuses[pageId]) return [];
        
        return Object.values(statuses[pageId])
          .filter(status => status.visible)
          .sort((a, b) => a.order - b.order);
      },

      // SliderManager için tüm status'leri döndür (gizli olanlar dahil)
      getAllStatusesByPage: (pageId) => {
        const { statuses } = get();
        if (!statuses[pageId]) return [];
        
        return Object.values(statuses[pageId])
          .sort((a, b) => a.order - b.order);
      },

      addStatus: (pageId, statusData) => {
        let success = false;
        set((state) => {
          if (!state.statuses[pageId]) {
            state.statuses[pageId] = {};
          }
          
          // Aynı isimde status var mı kontrol et
          const existingStatus = Object.values(state.statuses[pageId]).find(
            status => status.title.toLowerCase() === statusData.title.toLowerCase()
          );
          
          if (!existingStatus) {
            const id = statusData.id || `status_${Date.now()}`;
            state.statuses[pageId][id] = {
              id,
              pageId,
              title: statusData.title,
              order: statusData.order || Object.keys(state.statuses[pageId]).length,
              visible: true,
              type: statusData.type || "custom",
              createdAt: new Date().toISOString(),
              ...statusData
            };
            success = true;
          }
        });
        return success;
      },

      updateStatus: (pageId, statusId, updates) => set((state) => {
        if (state.statuses[pageId] && state.statuses[pageId][statusId]) {
          Object.assign(state.statuses[pageId][statusId], updates);
        }
      }),

      deleteStatus: (pageId, statusId) => {
        let canDelete = false;
        set((state) => {
          if (state.statuses[pageId] && state.statuses[pageId][statusId]) {
            // Önce bu status'ta içerik var mı kontrol et
            const hasContent = Object.values(state.contents).some(content => 
              content.pageId === pageId && content.statusId === statusId
            );
            
            if (!hasContent) {
              delete state.statuses[pageId][statusId];
              canDelete = true;
            }
          }
        });
        return canDelete;
      },

      // Status'un boş olup olmadığını kontrol et
      isStatusEmpty: (pageId, statusId) => {
        const { contents } = get();
        return !Object.values(contents).some(content => 
          content.pageId === pageId && content.statusId === statusId
        );
      },

      // Status'ta kaç içerik olduğunu döndür
      getStatusContentCount: (pageId, statusId) => {
        const { contents } = get();
        return Object.values(contents).filter(content => 
          content.pageId === pageId && content.statusId === statusId
        ).length;
      },

      toggleStatusVisibility: (pageId, statusId) => set((state) => {
        if (state.statuses[pageId] && state.statuses[pageId][statusId]) {
          state.statuses[pageId][statusId].visible = !state.statuses[pageId][statusId].visible;
        }
      }),

      reorderStatuses: (pageId, statusIds) => set((state) => {
        if (state.statuses[pageId]) {
          statusIds.forEach((statusId, index) => {
            if (state.statuses[pageId][statusId]) {
              state.statuses[pageId][statusId].order = index;
            }
          });
        }
      }),

      // Content Actions
      getContentsByPageAndStatus: (pageId, statusId) => {
        const { contents } = get();
        return Object.values(contents)
          .filter(content => content.pageId === pageId && content.statusId === statusId)
          .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
      },

      getContentById: (contentId) => {
        const { contents } = get();
        return contents[contentId] || null;
      },

      getContentsByIds: (contentIds) => {
        const { contents } = get();
        return contentIds.map(id => contents[id]).filter(Boolean);
      },

      addContent: (contentData) => set((state) => {
        const apiData = contentData.apiData || {};
        // Relations alanı varsa, doğrudan ekle
        if (contentData.apiData && contentData.apiData.relations) {
          apiData.relations = contentData.apiData.relations;
        }
        
        // **KRİTİK FIX**: Kapsamlı duplicate kontrolü
        // 1. Provider ID eşleşmesi
        // 2. Title benzerliği  
        // 3. Original title benzerliği
        const isDuplicate = Object.values(state.contents).some(c => {
          if (!c.apiData) return false;
          
          // Aynı provider ID kontrolü - tüm provider'lar için
          const providers = ['tmdb', 'anilist', 'kitsu', 'jikan', 'mal'];
          for (const provider of providers) {
            const providerKey = provider + 'Id';
            if (apiData[providerKey] && c.apiData[providerKey] === apiData[providerKey]) {
              console.log(`Duplicate found: same ${provider}Id`, apiData[providerKey]);
              return true;
            }
          }
          
          // Title benzerliği kontrolü
          const existingTitle = (c.apiData.title || '').toLowerCase().trim();
          const newTitle = (apiData.title || '').toLowerCase().trim();
          if (existingTitle && newTitle && existingTitle === newTitle) {
            // Aynı sayfa ve status'ta mı kontrol et (farklı sayfada aynı isimli içerik olabilir)
            if (c.pageId === contentData.pageId) {
              console.log('Duplicate found: same title in same page', newTitle);
              return true;
            }
          }
          
          // Original title benzerliği
          const existingOriginal = (c.apiData.originalTitle || '').toLowerCase().trim();
          const newOriginal = (apiData.originalTitle || '').toLowerCase().trim();
          if (existingOriginal && newOriginal && existingOriginal === newOriginal) {
            if (c.pageId === contentData.pageId) {
              console.log('Duplicate found: same originalTitle in same page', newOriginal);
              return true;
            }
          }
          
          return false;
        });
        
        if (isDuplicate) {
          console.warn('Content already exists, skipping add:', apiData.title);
          return;
        }
        
        const id = contentData.id || `content_${Date.now()}`;
        const now = new Date().toISOString();

        // Kitsu'dan gelen içerik için genre bilgisini çek
        if (apiData.kitsuId) {
          (async () => {
            try {
                const url = `https://kitsu.io/api/edge/anime/${apiData.kitsuId}?include=genres`;
              const response = await fetch(url, {
                headers: {
                  'Accept': 'application/vnd.api+json'
                }
              });
              if (response.ok) {
                const data = await response.json();
                const genres = data.included?.filter(g => g.type === 'genres').map(g => g.attributes.name) || [];
                apiData.genres = genres;
                state.contents[id] = {
                  id,
                  pageId: contentData.pageId,
                  statusId: contentData.statusId,
                  apiData,
                  seasons: contentData.seasons || {},
                  addedAt: now,
                  updatedAt: now,
                  userRating: null,
                  notes: "",
                  ...contentData
                };
              } else {
                state.contents[id] = {
                  id,
                  pageId: contentData.pageId,
                  statusId: contentData.statusId,
                  apiData,
                  seasons: contentData.seasons || {},
                  addedAt: now,
                  updatedAt: now,
                  userRating: null,
                  notes: "",
                  ...contentData
                };
              }
            } catch (err) {
                  console.error('Sezon güncelleme butonundan gelen hata:', err);
                  state.contents[id] = {
                id,
                pageId: contentData.pageId,
                statusId: contentData.statusId,
                apiData,
                seasons: contentData.seasons || {},
                addedAt: now,
                updatedAt: now,
                userRating: null,
                notes: "",
                ...contentData
              };
            }
          })();
        } else {
          state.contents[id] = {
            id,
            pageId: contentData.pageId,
            statusId: contentData.statusId,
            apiData,
            seasons: contentData.seasons || {},
            addedAt: now,
            updatedAt: now,
            userRating: null,
            notes: "",
            ...contentData
          };
        }
      }),

      updateContent: (contentId, updates) => set((state) => {
        if (state.contents[contentId]) {
          // relations güncellemesi varsa apiData'ya da yaz
          if (updates.apiData && updates.apiData.relations) {
            state.contents[contentId].apiData = {
              ...state.contents[contentId].apiData,
              relations: updates.apiData.relations
            };
          }
          Object.assign(state.contents[contentId], {
            ...updates,
            updatedAt: new Date().toISOString()
          });
        }
      }),

      // Hızlı status değişimi
      moveContentToStatus: (contentId, newStatusId) => set((state) => {
        if (state.contents[contentId]) {
          state.contents[contentId].statusId = newStatusId;
          state.contents[contentId].updatedAt = new Date().toISOString();
        }
      }),

      deleteContent: (contentId) => set((state) => {
        delete state.contents[contentId];
      }),

      deleteMultipleContents: (contentIds) => set((state) => {
        contentIds.forEach(id => {
          delete state.contents[id];
        });
      }),

      // Episode/Season tracking
      markEpisodeWatched: (contentId, seasonNumber, episodeNumber) => set((state) => {
        const content = state.contents[contentId];
        if (!content) return;

        // Eğer seasons yoksa (özellikle anime için) başlangıç sezon bilgisini oluştur
        if (!content.seasons || Object.keys(content.seasons).length === 0) {
          const epCount = content.apiData?.episodeCount || content.apiData?.episodes || 0;
          // Eğer episode count yoksa, fallback olarak 1 bölüm oluşturma (koruyucu davranış)
          const defaultCount = epCount > 0 ? epCount : 1;
          content.seasons = {
            1: {
              seasonNumber: 1,
              title: content.apiData?.title || 'Season 1',
              episodeCount: defaultCount,
              watchedEpisodes: Array.isArray(content.watchedEpisodes) ? [...content.watchedEpisodes] : []
            }
          };
        }

        // **FIX: Cascade logic - mevcut watchedEpisodes'u koru, override etme!**
        Object.values(content.seasons).forEach(season => {
          if (season.seasonNumber < seasonNumber) {
            // Bu sezonun tüm bölümlerini işaretle (mevcut array'e EKLE)
            const allEpisodes = Array.from({ length: season.episodeCount }, (_, i) => i + 1);
            // Set kullanarak duplicate'leri engelle
            season.watchedEpisodes = [...new Set([...(season.watchedEpisodes || []), ...allEpisodes])].sort((a, b) => a - b);
          } else if (season.seasonNumber === seasonNumber) {
            // Aynı sezondaki bu bölüme kadar olan tüm bölümleri işaretle
            if (!Array.isArray(season.watchedEpisodes)) season.watchedEpisodes = [];
            const watchedEpisodes = season.watchedEpisodes;
            for (let ep = 1; ep <= episodeNumber; ep++) {
              if (!watchedEpisodes.includes(ep)) {
                watchedEpisodes.push(ep);
              }
            }
            watchedEpisodes.sort((a, b) => a - b);
          }
        });
        content.updatedAt = new Date().toISOString();

        console.log('✅ Episode marked watched with cascade:', {
          contentId,
          season: seasonNumber,
          episode: episodeNumber,
          updatedSeasons: Object.values(content.seasons).map(s => ({
            season: s.seasonNumber,
            watched: (s.watchedEpisodes || []).length,
            total: s.episodeCount
          }))
        });
      }),

      markEpisodeUnwatched: (contentId, seasonNumber, episodeNumber) => set((state) => {
        const content = state.contents[contentId];
        if (content && content.seasons) {
          // Bu bölümü işaretsiz yap
          if (content.seasons[seasonNumber]) {
            const watchedEpisodes = content.seasons[seasonNumber].watchedEpisodes;
            const index = watchedEpisodes.indexOf(episodeNumber);
            if (index > -1) {
              watchedEpisodes.splice(index, 1);
            }
            
            // Bu bölümden sonraki tüm bölümleri de işaretsiz yap
            for (let ep = episodeNumber + 1; ep <= content.seasons[seasonNumber].episodeCount; ep++) {
              const idx = watchedEpisodes.indexOf(ep);
              if (idx > -1) {
                watchedEpisodes.splice(idx, 1);
              }
            }
          }
          
          // Sonraki sezonların tüm bölümlerini işaretsiz yap
          Object.values(content.seasons).forEach(season => {
            if (season.seasonNumber > seasonNumber) {
              season.watchedEpisodes = [];
            }
          });
          
          content.updatedAt = new Date().toISOString();
        }
      }),

      markSeasonWatched: (contentId, seasonNumber) => set((state) => {
        const content = state.contents[contentId];
        if (content && content.seasons) {
          // Önce önceki tüm sezonları işaretle
          Object.values(content.seasons).forEach(season => {
            if (season.seasonNumber <= seasonNumber) {
              // Bu sezon ve önceki sezonların tüm bölümlerini işaretle
              season.watchedEpisodes = Array.from(
                { length: season.episodeCount }, 
                (_, i) => i + 1
              );
            }
          });
          content.updatedAt = new Date().toISOString();
        }
      }),

      markSeasonUnwatched: (contentId, seasonNumber) => set((state) => {
        const content = state.contents[contentId];
        if (content && content.seasons) {
          // Bu sezon ve sonraki tüm sezonları işaretsiz yap
          Object.values(content.seasons).forEach(season => {
            if (season.seasonNumber >= seasonNumber) {
              season.watchedEpisodes = [];
            }
          });
          content.updatedAt = new Date().toISOString();
        }
      }),

      // Utility functions
      getWatchedEpisodeCount: (contentId) => {
        const { contents } = get();
        const content = contents[contentId];
        if (!content || !content.seasons) return 0;
        
        return Object.values(content.seasons).reduce(
          (total, season) => total + (season.watchedEpisodes?.length || 0), 
          0
        );
      },

      getTotalEpisodeCount: (contentId) => {
        const { contents } = get();
        const content = contents[contentId];
        if (!content || !content.seasons) return 0;
        
        return Object.values(content.seasons).reduce(
          (total, season) => total + (season.episodeCount || 0), 
          0
        );
      },

      // API'den sezon/bölüm bilgilerini al ve cache'le
      // Relations bilgisini fetch edip güncelle
      fetchAndUpdateRelations: async (contentId) => {
        const { contents } = get();
        const content = contents[contentId];

        if (!content || !content.apiData) return;

        try {
          let updatedApiData = null;

          // İçerik türüne göre media type belirle
          let mediaType;
          if (content.pageId === 'film') {
            mediaType = 'movie';
          } else if (content.pageId === 'dizi') {
            mediaType = 'tv';
          } else if (content.pageId === 'anime') {
            mediaType = 'anime';
          } else {
            console.warn('Unknown pageId for relations fetch:', content.pageId);
            return;
          }

          // ApiManager kullanarak relations fetch et
          const { ApiManager } = await import('../api/ApiManager.js');
          const apiManager = new ApiManager();

          // İçerik ID'sini belirle - FALLBACK CHAIN kullan
          let providerChain = [];

          // Provider chain'i oluştur - birincil provider önce gelir
          if (content.apiData.tmdbId) {
            providerChain.push({ provider: 'tmdb', id: content.apiData.tmdbId });
          }
          if (content.apiData.anilistId) {
            providerChain.push({ provider: 'anilist', id: content.apiData.anilistId });
          }
          if (content.apiData.kitsuId) {
            providerChain.push({ provider: 'kitsu', id: content.apiData.kitsuId });
          }
          if (content.apiData.jikanId) {
            providerChain.push({ provider: 'jikan', id: content.apiData.jikanId });
          }

          if (providerChain.length === 0) {
            console.warn('No valid ID found for relations fetch:', content.apiData);
            return;
          }

          // Fallback chain ile dene
          let lastError = null;
          let successfulProvider = null;
          for (const providerInfo of providerChain) {
            try {
              console.log(`Trying to fetch details from ${providerInfo.provider} for content:`, contentId);
              
              // **KRİTİK FIX**: getDetails TÜM detaylı bilgileri döndürüyor
              // Sadece relations değil, tüm bilgileri güncellememiz gerekiyor
              updatedApiData = await apiManager.getDetails(providerInfo.id, mediaType);
              
              if (updatedApiData) {
                console.log(`Successfully fetched details from ${providerInfo.provider}:`, {
                  hasRelations: !!updatedApiData.relations,
                  hasRuntime: !!updatedApiData.duration,
                  hasEpisodeCount: !!updatedApiData.episodeCount,
                  hasCast: !!updatedApiData.cast
                });
                
                // Başarılı, döngüden çık
                successfulProvider = providerInfo.provider;
                break;
              }
            } catch (error) {
              lastError = error;
              console.warn(`Failed to fetch from ${providerInfo.provider}:`, error.message);
              // Bir sonraki provider'a geç
              continue;
            }
          }

          if (!updatedApiData) {
            console.error('All providers failed for relations fetch:', lastError);
            return;
          }

          console.log(`Using data from provider: ${successfulProvider}`);

          // **KRİTİK FIX**: TÜM detaylı bilgileri güncelle, sadece relations değil
          set((state) => {
            if (state.contents[contentId]) {
              // Mevcut API data'yı koruyarak yeni bilgilerle zenginleştir
              const existingApiData = state.contents[contentId].apiData;
              
              // Relations mutlaka güncelle
              if (updatedApiData.relations) {
                existingApiData.relations = updatedApiData.relations;
              }
              
              // Diğer detayları da güncelle (eğer yoksa veya güncellenebilirse)
              if (updatedApiData.duration && !existingApiData.runtime) {
                existingApiData.runtime = updatedApiData.duration;
              }
              if (updatedApiData.cast && (!existingApiData.cast || existingApiData.cast.length === 0)) {
                existingApiData.cast = updatedApiData.cast;
              }
              if (updatedApiData.director && !existingApiData.director) {
                existingApiData.director = updatedApiData.director;
              }
              if (updatedApiData.budget && !existingApiData.budget) {
                existingApiData.budget = updatedApiData.budget;
              }
              if (updatedApiData.revenue && !existingApiData.revenue) {
                existingApiData.revenue = updatedApiData.revenue;
              }
              if (updatedApiData.episodeCount && !existingApiData.episodeCount) {
                existingApiData.episodeCount = updatedApiData.episodeCount;
              }
              if (updatedApiData.seasonCount && !existingApiData.seasonCount) {
                existingApiData.seasonCount = updatedApiData.seasonCount;
              }
              if (updatedApiData.status && !existingApiData.status) {
                existingApiData.status = updatedApiData.status;
              }
              if (updatedApiData.studios && (!existingApiData.studios || existingApiData.studios.length === 0)) {
                existingApiData.studios = updatedApiData.studios;
              }
              
              state.contents[contentId].updatedAt = new Date().toISOString();
              
              console.log('Content details updated comprehensively:', contentId, {
                relationsAdded: !!updatedApiData.relations,
                detailsEnriched: true
              });
            }
          });
        } catch (error) {
          console.error('Relations fetch hatası:', error);
        }
      },

      // Dev helper: fetch relations for all contents and log the results
      debugFetchAllRelations: async () => {
        const { contents } = get();
        const ids = Object.keys(contents || {});
        for (const id of ids) {
          try {
            const content = contents[id];
            if (!content || !content.apiData) continue;
            // Only try providers that we can handle
            if (content.apiData.tmdbId || content.apiData.kitsuId || content.apiData.anilistId || content.apiData.jikanId) {
              await get().fetchAndUpdateRelations(id);
            }
          } catch (err) {
            console.warn('Failed to fetch relations for', id, err);
          }
        }
      },

      fetchAndCacheSeasonData: async (contentId, force = false) => {
        console.log('fetchAndCacheSeasonData çağrıldı:', contentId, 'force=', force);
        const { contents } = get();
        const content = contents[contentId];
        
        if (!content) {
          console.log('Content bulunamadı:', contentId);
          return null;
        }
        
        console.log('Content bulundu:', content);
        
        // Zaten sezon verisi varsa ve force belirtilmemişse API çağrısı yapma
        if (!force && content.seasons && Object.keys(content.seasons).length > 0) {
          console.log('Sezon verisi zaten var, cache kullanılıyor:', content.seasons);
          return content.seasons;
        }

        try {
          const { apiData } = content;
          let seasonData = {};
          
          console.log('API Data:', apiData);
          console.log('Content pageId:', content.pageId);

          // **KRİTİK FIX**: FALLBACK CHAIN kullan - önce TMDB, sonra diğer provider'lar
          let fetchSuccess = false;

          // 1. ÖNCE TMDB dene (dizi/anime için)
          if (apiData.tmdbId && (content.pageId === 'dizi' || content.pageId === 'anime') && !fetchSuccess) {
            console.log('TMDB API çağrısı yapılıyor...');
            
            try {
              // Electron ortamında mı kontrol et
              if (window.electronAPI?.getTvShowSeasons) {
                const tmdbSeasons = await window.electronAPI.getTvShowSeasons(apiData.tmdbId);
                console.log('TMDB yanıtı:', tmdbSeasons);
                if (tmdbSeasons && tmdbSeasons.seasons) {
                  tmdbSeasons.seasons.forEach(season => {
                    seasonData[season.seasonNumber] = {
                      seasonNumber: season.seasonNumber,
                      episodeCount: season.episodes?.length || season.episodeCount || 0,
                      title: season.seasonName || `Season ${season.seasonNumber}`,
                      watchedEpisodes: []
                    };
                  });
                  fetchSuccess = true;
                }
              } else {
                // Web ortamında doğrudan TMDB API'sini kullan
                console.log('Web ortamında TMDB API çağrısı yapılıyor...');
                const { TmdbApi } = await import('../api/providers/TmdbApi.js');
                const tmdbApi = new TmdbApi();
                const tmdbSeasons = await tmdbApi.getSeasons(apiData.tmdbId);
                console.log('TMDB yanıtı (web):', tmdbSeasons);
                
                if (tmdbSeasons && Array.isArray(tmdbSeasons) && tmdbSeasons.length > 0) {
                  tmdbSeasons.forEach(season => {
                    seasonData[season.seasonNumber] = {
                      seasonNumber: season.seasonNumber,
                      episodeCount: season.episodeCount || season.episodes?.length || 0,
                      title: season.title || `Season ${season.seasonNumber}`,
                      watchedEpisodes: []
                    };
                  });
                  fetchSuccess = true;
                }
              }
            } catch (tmdbError) {
              console.warn('TMDB API çağrısı başarısız, fallback deneniyor:', tmdbError);
            }
          }
          
          // 2. TMDB başarısız olduysa, Anime için diğer provider'ları dene
          if (content.pageId === 'anime' && !fetchSuccess) {
            // 2a. Kitsu API dene
            if (apiData.kitsuId && !fetchSuccess) {
              console.log('Kitsu API episode çağrısı yapılıyor...');
              try {
                const episodeUrl = `https://kitsu.io/api/edge/anime/${apiData.kitsuId}/episodes`;
                const episodeResponse = await fetch(episodeUrl, {
                  headers: {
                    'Accept': 'application/vnd.api+json',
                    'Content-Type': 'application/vnd.api+json'
                  }
                });
                
                if (episodeResponse.ok) {
                  const episodeData = await episodeResponse.json();
                  console.log('Kitsu episode yanıtı:', episodeData);
                  
                  const episodes = episodeData.data || [];
                  const totalEpisodes = episodeData.meta?.count || episodes.length;
                  
                  if (totalEpisodes > 0) {
                    // Sezon numaralarına göre gruplandır
                    const seasonGroups = {};
                    episodes.forEach(ep => {
                      const seasonNum = ep.attributes?.seasonNumber || 1;
                      if (!seasonGroups[seasonNum]) {
                        seasonGroups[seasonNum] = [];
                      }
                      seasonGroups[seasonNum].push(ep);
                    });
                    
                    // Eğer sezon bilgisi yoksa tek sezon olarak kaydet
                    if (Object.keys(seasonGroups).length === 0 || (Object.keys(seasonGroups).length === 1 && seasonGroups[1])) {
                      seasonData[1] = {
                        seasonNumber: 1,
                        episodeCount: totalEpisodes,
                        title: apiData.title || 'Anime',
                        watchedEpisodes: []
                      };
                    } else {
                      // Çoklu sezon varsa her birini kaydet
                      Object.keys(seasonGroups).forEach(seasonNum => {
                        seasonData[seasonNum] = {
                          seasonNumber: parseInt(seasonNum),
                          episodeCount: seasonGroups[seasonNum].length,
                          title: `Season ${seasonNum}`,
                          watchedEpisodes: []
                        };
                      });
                    }
                    fetchSuccess = true;
                  }
                }
              } catch (kitsuError) {
                console.warn('Kitsu API çağrısı başarısız:', kitsuError);
              }
            }
            
            // 2b. AniList API dene
            if ((apiData.anilistId || apiData.id) && !fetchSuccess) {
              console.log('AniList API episode çağrısı yapılıyor...');
              try {
                const anilistId = apiData.anilistId || apiData.id;
                
                // AniList GraphQL API'sinden episode sayısını çek
                const query = `
                query ($id: Int) {
                  Media(id: $id, type: ANIME) {
                    episodes
                    title {
                      romaji
                      english
                    }
                  }
                }
              `;
              
              const response = await fetch('https://graphql.anilist.co', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
                },
                body: JSON.stringify({
                  query: query,
                  variables: { id: parseInt(anilistId) }
                })
              });
              
              if (response.ok) {
                const anilistData = await response.json();
                console.log('AniList GraphQL yanıtı:', anilistData);
                
                const episodes = anilistData?.data?.Media?.episodes;
                
                if (episodes && episodes > 0) {
                  console.log('AniList episodes bulundu:', episodes);
                  seasonData[1] = {
                    seasonNumber: 1,
                    episodeCount: episodes,
                    title: apiData.title || anilistData?.data?.Media?.title?.english || anilistData?.data?.Media?.title?.romaji || 'Anime',
                    watchedEpisodes: []
                  };
                  fetchSuccess = true;
                }
              }
              } catch (anilistError) {
                console.warn('AniList API çağrısı başarısız:', anilistError);
              }
            }
            
            // 2c. Jikan API dene
            if ((apiData.jikanId || apiData.mal_id) && !fetchSuccess) {
              console.log('Jikan API episode çağrısı yapılıyor...');
              try {
                const jikanId = apiData.jikanId || apiData.mal_id;
                const episodeUrl = `https://api.jikan.moe/v4/anime/${jikanId}/episodes`;
                const episodeResponse = await fetch(episodeUrl);
                
                if (episodeResponse.ok) {
                  const episodeData = await episodeResponse.json();
                  console.log('Jikan episode yanıtı:', episodeData);
                  
                  const episodes = episodeData.data || [];
                  const totalEpisodes = episodes.length;
                  
                  if (totalEpisodes > 0) {
                    seasonData[1] = {
                      seasonNumber: 1,
                      episodeCount: totalEpisodes,
                      title: apiData.title || 'Anime',
                      watchedEpisodes: []
                    };
                    fetchSuccess = true;
                  }
                }
              } catch (jikanError) {
                console.warn('Jikan API çağrısı başarısız:', jikanError);
              }
            }
          }
          
          // 3. SON FALLBACK: Hiçbir API başarısız olduysa ve episodeCount varsa kullan
          if (!fetchSuccess && apiData.episodeCount && apiData.episodeCount > 0) {
            console.log('Son fallback: episodeCount kullanılıyor:', apiData.episodeCount);
            seasonData[1] = {
              seasonNumber: 1,
              episodeCount: apiData.episodeCount,
              title: apiData.title || (content.pageId === 'anime' ? 'Anime' : 'Season 1'),
              watchedEpisodes: []
            };
            fetchSuccess = true;
          } else if (!fetchSuccess && apiData.episodes && apiData.episodes > 0) {
            console.log('Son fallback: episodes kullanılıyor:', apiData.episodes);
            seasonData[1] = {
              seasonNumber: 1,
              episodeCount: apiData.episodes,
              title: apiData.title || (content.pageId === 'anime' ? 'Anime' : 'Season 1'),
              watchedEpisodes: []
            };
            fetchSuccess = true;
          }

          console.log('Oluşturulan sezon verisi:', seasonData, 'fetchSuccess:', fetchSuccess);

          // Store'da güncelle (mevcut watchedEpisodes korunacak şekilde birleştir)
          set((state) => {
            if (state.contents[contentId]) {
              const existing = state.contents[contentId].seasons || {};
              const merged = Object.assign({}, existing);

              // Overwrite or add seasons from fetched data, but preserve watchedEpisodes if present
              Object.keys(seasonData).forEach(seasonKey => {
                const newSeason = seasonData[seasonKey] || {};
                const existingSeason = existing[seasonKey] || {};
                merged[seasonKey] = Object.assign({}, newSeason, {
                  // preserve existing watchedEpisodes array when available
                  watchedEpisodes: Array.isArray(existingSeason.watchedEpisodes)
                    ? Array.from(new Set([...(existingSeason.watchedEpisodes || []), ...(newSeason.watchedEpisodes || [])]))
                    : (newSeason.watchedEpisodes || [])
                });
              });

              // Keep any existing seasons that weren't present in the fetched data
              Object.keys(existing).forEach(seasonKey => {
                if (!merged[seasonKey]) merged[seasonKey] = existing[seasonKey];
              });

              state.contents[contentId].seasons = merged;
              state.contents[contentId].updatedAt = new Date().toISOString();
            }
          });

          return seasonData;
        } catch (error) {
          console.error('Sezon verisi alınırken hata:', error);
          return {};
        }
      },

      // Search & Filter
      searchContents: (query, pageId = null) => {
        const { contents } = get();
        return Object.values(contents)
          .filter(content => {
            if (pageId && content.pageId !== pageId) return false;
            
            const title = content.apiData.title?.toLowerCase() || '';
            const originalTitle = content.apiData.originalTitle?.toLowerCase() || '';
            const overview = content.apiData.overview?.toLowerCase() || '';
            const searchQuery = query.toLowerCase();
            
            return title.includes(searchQuery) || 
                   originalTitle.includes(searchQuery) || 
                   overview.includes(searchQuery);
          });
      },

      // Bulk operations
      bulkUpdateContentStatus: (contentIds, newStatusId) => set((state) => {
        const now = new Date().toISOString();
        contentIds.forEach(id => {
          if (state.contents[id]) {
            state.contents[id].statusId = newStatusId;
            state.contents[id].updatedAt = now;
          }
        });
      }),

      // Move content between different statuses (for drag & drop)
      moveContentBetweenStatuses: (contentItem, fromStatusId, toStatusId, targetPageId = null) => {
        let moveSuccess = false;
        set((state) => {
          // ID ile doğrudan eşleştir (en güvenilir yöntem)
          const content = contentItem.id ? state.contents[contentItem.id] : null;
          
          // Eğer ID ile bulunamazsa, fallback olarak diğer özelliklere bak
          if (!content) {
            const foundContent = Object.values(state.contents).find(c => {
              const itemTitle = contentItem.title || contentItem.apiData?.title;
              const contentTitle = c.apiData?.title || c.title;
              return itemTitle === contentTitle && 
                     (contentItem.apiData?.tmdbId === c.apiData?.tmdbId ||
                      contentItem.apiData?.kitsuId === c.apiData?.kitsuId ||
                      contentItem.apiData?.anilistId === c.apiData?.anilistId);
            });
            
            if (foundContent) {
              foundContent.statusId = toStatusId;
              if (targetPageId) {
                foundContent.pageId = targetPageId;
              }
              foundContent.updatedAt = new Date().toISOString();
              moveSuccess = true;
            }
          } else {
            // ID ile bulundu, güncelle
            content.statusId = toStatusId;
            if (targetPageId) {
              content.pageId = targetPageId;
            }
            content.updatedAt = new Date().toISOString();
            moveSuccess = true;
          }
        });
        return moveSuccess;
      },

    })),
    {
      name: 'content-tracker-storage',
      version: 1
    }
  )
);

// Selector hooks for optimized re-renders
export const usePageData = () => useContentStore((state) => state.pages);
export const useStatusData = () => useContentStore((state) => state.statuses);
export const useContentData = () => useContentStore((state) => state.contents);
export const useSettingsData = () => useContentStore((state) => state.settings);

export const usePageStatuses = (pageId) => useContentStore((state) => {
  if (!pageId || !state.statuses[pageId]) return [];
  return Object.values(state.statuses[pageId]).sort((a, b) => a.order - b.order);
});

export const usePageContents = (pageId) => useContentStore((state) => {
  if (!pageId) return [];
  return Object.values(state.contents).filter(content => content.pageId === pageId);
});

export const useStatusContents = (statusId) => useContentStore((state) => {
  if (!statusId) return [];
  return Object.values(state.contents).filter(content => content.statusId === statusId);
});

export default useContentStore;
