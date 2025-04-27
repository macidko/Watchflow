// Electron API'lerini yükle
const { contextBridge, ipcRenderer, shell } = require('electron');

// Uygulama API'sini tanımla - Renderer sürecine güvenli bir şekilde expose ediyoruz
contextBridge.exposeInMainWorld('watchflowAPI', {
  // API sunucusu bağlantı durumunu kontrol et
  checkServerStatus: async () => {
    try {
      return await ipcRenderer.invoke('check-server-status');
    } catch (error) {
      console.error('API kontrol hatası:', error);
      throw new Error('API kontrol edilemedi');
    }
  },
  
  // Uygulama sürümünü al
  getAppVersion: async () => {
    try {
      return await ipcRenderer.invoke('get-app-version');
    } catch (error) {
      console.error('Uygulama sürümü alınırken hata:', error);
      throw error;
    }
  },
  
  // Pencere kontrolleri
  minimizeWindow: () => {
    ipcRenderer.send('minimize-window');
  },
  
  closeWindow: () => {
    ipcRenderer.send('close-window');
  },
  
  // TMDB API ile arama yap
  searchTMDB: async (query, type = 'multi') => {
    try {
      return await ipcRenderer.invoke('search-tmdb', query, type);
    } catch (error) {
      console.error('TMDB araması sırasında hata:', error);
      throw error;
    }
  },
  
  // Jikan API ile arama yap
  searchJikan: async (query) => {
    try {
      return await ipcRenderer.invoke('search-jikan', query);
    } catch (error) {
      console.error('Jikan araması sırasında hata:', error);
      throw error;
    }
  },
  
  // Film/Dizi detayları al (TMDB API)
  getMovieTVDetails: async (id, type) => {
    try {
      return await ipcRenderer.invoke('get-movie-tv-details', {id, type});
    } catch (error) {
      console.error('Film/Dizi detayları alınırken hata:', error);
      throw error;
    }
  },
  
  // Anime detayları al (Jikan API)
  getAnimeDetails: async (id) => {
    try {
      return await ipcRenderer.invoke('get-anime-details', {id});
    } catch (error) {
      console.error('Anime detayları alınırken hata:', error);
      throw error;
    }
  },
  
  // Dizi sezon ve bölüm bilgilerini al (TMDB API)
  getTvShowSeasons: async (tvId) => {
    try {
      return await ipcRenderer.invoke('get-tv-seasons', tvId);
    } catch (error) {
      console.error('Dizi sezon bilgileri alınırken hata:', error);
      throw error;
    }
  },
  
  // Anime sezon ve bölüm bilgilerini al (Jikan API)
  getAnimeSeasons: async (animeId) => {
    try {
      return await ipcRenderer.invoke('get-anime-seasons', animeId);
    } catch (error) {
      console.error('Anime sezon bilgileri alınırken hata:', error);
      throw error;
    }
  },
  
  // İzleme listesine öğe ekle
  addToWatchlist: async (item) => {
    try {
      return await ipcRenderer.invoke('add-to-watchlist', item);
    } catch (error) {
      console.error('İzleme listesine ekleme hatası:', error);
      throw error;
    }
  },
  
  // İzleme listesini al
  getWatchlist: async () => {
    try {
      return await ipcRenderer.invoke('get-watchlist');
    } catch (error) {
      console.error('İzleme listesini alma hatası:', error);
      throw error;
    }
  },
  
  // Bölüm izleme durumunu güncelle
  updateEpisodeStatus: async (data) => {
    try {
      return await ipcRenderer.invoke('update-episode-status', data);
    } catch (error) {
      console.error('Bölüm durumu güncellenirken hata:', error);
      throw error;
    }
  },
  
  // API anahtarlarını kaydet
  saveApiKeys: async (keys) => {
    try {
      return await ipcRenderer.invoke('save-api-keys', keys);
    } catch (error) {
      console.error('API anahtarları kaydedilirken hata:', error);
      throw error;
    }
  },
  
  // İçerik puanını güncelle
  updateContentRating: async (data) => {
    try {
      return await ipcRenderer.invoke('update-content-rating', data);
    } catch (error) {
      console.error('İçerik puanı güncellenirken hata:', error);
      throw error;
    }
  },
  
  // İzleme listesinden içeriği kaldır
  removeFromWatchlist: async (id, mediaType) => {
    try {
      return await ipcRenderer.invoke('remove-from-watchlist', { id, mediaType });
    } catch (error) {
      console.error('İzleme listesinden kaldırma hatası:', error);
      throw error;
    }
  },
  
  // İçeriği izlendi olarak işaretle
  markAsWatched: async (data) => {
    try {
      // Data kontrolü
      if (!data) {
        console.error('markAsWatched: data parametresi tanımsız veya null');
        throw new Error('Eksik veya hatalı veri');
      }

      if (data.id === undefined || data.id === null) {
        console.error('markAsWatched: data.id tanımsız veya null');
        throw new Error('Öğe ID bilgisi eksik'); 
      }

      if (!data.mediaType) {
        console.error('markAsWatched: data.mediaType tanımsız veya boş');
        throw new Error('Medya türü bilgisi eksik');
      }
      
      console.log('markAsWatched çağrısı yapılıyor:', data);
      return await ipcRenderer.invoke('mark-as-watched', data);
    } catch (error) {
      console.error('İzlendi olarak işaretleme hatası:', error);
      throw error;
    }
  },
  
  // Watchlist verilerini dışa aktar
  exportWatchlist: async (targetPath) => {
    try {
      return await ipcRenderer.invoke('export-watchlist', targetPath);
    } catch (error) {
      console.error('Watchlist dışa aktarılırken hata:', error);
      throw error;
    }
  },
  
  // Dosya kaydetme dialog göster
  showSaveDialog: async (options) => {
    try {
      return await ipcRenderer.invoke('show-save-dialog', options);
    } catch (error) {
      console.error('Dosya kaydetme dialog hatası:', error);
      throw error;
    }
  },
  
  // API anahtarlarını getir
  getApiKeys: async () => {
    try {
      return await ipcRenderer.invoke('get-api-keys');
    } catch (error) {
      console.error('API anahtarları alınırken hata:', error);
      throw error;
    }
  },
  
  // Uygulamayı yeniden başlat
  restartApp: () => {
    try {
      ipcRenderer.send('restart-app');
    } catch (error) {
      console.error('Uygulama yeniden başlatılırken hata:', error);
    }
  },
  
  // Dış bağlantıyı tarayıcıda aç
  openExternalLink: (url) => {
    shell.openExternal(url);
  },
  
  // Özel slider oluştur
  createCustomSlider: async (slider) => {
    try {
      return await ipcRenderer.invoke('create-custom-slider', slider);
    } catch (error) {
      console.error('Özel slider oluşturulurken hata:', error);
      throw error;
    }
  },
  
  // Özel slider güncelle
  updateCustomSlider: async (slider) => {
    try {
      return await ipcRenderer.invoke('update-custom-slider', slider);
    } catch (error) {
      console.error('Özel slider güncellenirken hata:', error);
      throw error;
    }
  },
  
  // Özel slider sil
  deleteCustomSlider: async (sliderId) => {
    try {
      return await ipcRenderer.invoke('delete-custom-slider', sliderId);
    } catch (error) {
      console.error('Özel slider silinirken hata:', error);
      throw error;
    }
  },
  
  // Slider'a öğe ekle
  addItemToSlider: async (sliderId, itemId, mediaType) => {
    try {
      return await ipcRenderer.invoke('add-item-to-slider', sliderId, itemId, mediaType);
    } catch (error) {
      console.error('Slider öğesi eklenirken hata:', error);
      throw error;
    }
  },
  
  // Slider'dan öğe kaldır
  removeItemFromSlider: async (sliderId, itemId, mediaType) => {
    try {
      return await ipcRenderer.invoke('remove-item-from-slider', sliderId, itemId, mediaType);
    } catch (error) {
      console.error('Slider öğesi kaldırılırken hata:', error);
      throw error;
    }
  }
});

// Electron versiyonunu DOM'a ekle
window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  for (const dependency of ['chrome', 'node', 'electron']) {
    replaceText(`${dependency}-version`, process.versions[dependency]);
  }
});

// Eğer contextIsolation: true kullanıyorsanız, bunun yerine contextBridge kullanmanız gerekir:
/*
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  doThing: () => ipcRenderer.invoke('do-a-thing'),
  // ...diğer API'ler
});
*/

// API'yi belirle
const api = {
  // Pencere işlemleri
  minimize: () => ipcRenderer.send('minimize-window'),
  maximize: () => ipcRenderer.send('maximize-window'),
  close: () => ipcRenderer.send('close-window'),
  
  // Medya işlemleri
  searchMovies: (query) => ipcRenderer.invoke('search-movies', query),
  searchTVShows: (query) => ipcRenderer.invoke('search-tv-shows', query),
  searchAnime: (query) => ipcRenderer.invoke('search-anime', query),
  getMovieDetails: (id) => ipcRenderer.invoke('get-movie-details', id),
  getTVShowDetails: (id) => ipcRenderer.invoke('get-tv-show-details', id),
  getAnimeDetails: (id) => ipcRenderer.invoke('get-anime-details', id),
  
  // İzleme listesi işlemleri
  getWatchlist: () => ipcRenderer.invoke('get-watchlist'),
  addToWatchlist: (data) => ipcRenderer.invoke('add-to-watchlist', data),
  removeFromWatchlist: (data) => ipcRenderer.invoke('remove-from-watchlist', data),
  setWatchStatus: (data) => ipcRenderer.invoke('set-watch-status', data),
  updateEpisodeStatus: (data) => {
    try {
      return ipcRenderer.invoke('update-episode-status', data);
    } catch (error) {
      console.error('Bölüm durumu güncellenirken hata:', error);
      throw error;
    }
  }
}; 