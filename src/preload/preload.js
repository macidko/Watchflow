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
  
  // Film/Dizi araması yap (TMDB API)
  searchMovieTV: async (query, type = 'multi') => {
    try {
      return await ipcRenderer.invoke('search-tmdb', query, type);
    } catch (error) {
      console.error('Film/Dizi araması sırasında hata:', error);
      throw error;
    }
  },
  
  // Anime araması yap (Jikan API)
  searchAnime: async (query) => {
    try {
      return await ipcRenderer.invoke('search-jikan', query);
    } catch (error) {
      console.error('Anime araması sırasında hata:', error);
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