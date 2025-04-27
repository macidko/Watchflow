// IPC Handler Servisi
// Electron IPC iletişimini yöneten handler fonksiyonları

const { dialog } = require('electron');
const windowManager = require('./windowManager');
const apiManager = require('./apiManager');
const watchlistManager = require('./watchlistManager');
const sliderManager = require('./sliderManager');
const axios = require('axios');
const { app } = require('electron');
const path = require('path');
const fs = require('fs');

// API modüllerini al
let apiModules = null;

// IPC işleyicilerini ayarla
const setupIpcHandlers = (ipcMain) => {
  // API modüllerini yükle
  apiModules = apiManager.loadApiModules();
  
  // Pencere kontrolleri
  ipcMain.on('minimize-window', (event) => {
    const win = windowManager.getWindowFromWebContents(event.sender);
    if (win) win.minimize();
  });

  ipcMain.on('close-window', (event) => {
    const win = windowManager.getWindowFromWebContents(event.sender);
    if (win) win.close();
  });
  
  // Uygulama sürümünü al
  ipcMain.handle('get-app-version', async () => {
    try {
      // package.json'ı oku
      const packageJsonPath = path.join(app.getAppPath(), 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      return packageJson.version;
    } catch (error) {
      console.error('Uygulama sürümü okunurken hata:', error);
      return '0.0.0'; // Hata durumunda varsayılan sürüm
    }
  });
  
  // Dosya kaydetme dialogu
  ipcMain.handle('show-save-dialog', async (event, options) => {
    try {
      const win = windowManager.getWindowFromWebContents(event.sender);
      return await dialog.showSaveDialog(win, options);
    } catch (error) {
      console.error('Dosya kaydetme dialogu hatası:', error);
      throw error;
    }
  });
  
  // ======= API İşlemleri =======
  
  // API anahtarlarını kaydet
  ipcMain.handle('save-api-keys', async (event, keys) => {
    try {
      const result = await apiManager.saveApiKeys(keys);
      if (result.success) {
        // API anahtarları kaydedildikten sonra modülleri yeniden yükle
        apiModules = apiManager.loadApiModules();
      }
      return result;
    } catch (error) {
      console.error('API anahtarı kaydedilirken hata:', error);
      return { success: false, error: error.message };
    }
  });
  
  // API anahtarlarını al
  ipcMain.handle('get-api-keys', async () => {
    try {
      return apiManager.getApiKeys();
    } catch (error) {
      console.error('API anahtarı okunurken hata:', error);
      return null;
    }
  });
  
  // Uygulamayı yeniden başlat
  ipcMain.on('restart-app', () => {
    // Mevcut tüm pencereleri kapat
    windowManager.closeAllWindows();
  });
  
  // IPC iletişim kanallarını kur
  ipcMain.handle('check-server-status', async () => {
    return { status: 'API bağlantısı hazır' };
  });
  
  // TMDB API araması
  ipcMain.handle('search-tmdb', async (event, query, type = 'multi') => {
    try {
      if (!apiModules || !apiModules.tmdbApi) {
        throw new Error('TMDB API yüklenmemiş. Lütfen API anahtarlarınızı kontrol edin.');
      }
      
      console.log(`TMDB Araması: "${query}" (Tür: ${type})`);
      const results = await apiModules.tmdbApi.searchMedia(query, type, process.env.TMDB_API_KEY);
      return results;
    } catch (error) {
      console.error('TMDB arama hatası:', error);
      
      // Belirli hata türleri için özelleştirilmiş mesajlar
      if (error.message.includes('401')) {
        throw new Error('API anahtarı geçersiz veya eksik. Lütfen API anahtarınızı kontrol edin.');
      } else if (error.message.includes('TMDB API anahtarı tanımlanmamış')) {
        throw new Error('TMDB API anahtarı ayarlanmamış. Lütfen ayarlarınızı kontrol edin.');
      } else {
        throw new Error('Film/Dizi araması sırasında bir hata oluştu: ' + error.message);
      }
    }
  });
  
  // Jikan API araması
  ipcMain.handle('search-jikan', async (event, query) => {
    try {
      if (!apiModules || !apiModules.jikanApi) {
        throw new Error('Jikan API yüklenmemiş.');
      }
      
      console.log(`Jikan Araması: "${query}"`);
      const results = await apiModules.jikanApi.searchAnime(query);
      return results;
    } catch (error) {
      console.error('Jikan arama hatası:', error);
      throw new Error('Anime araması sırasında bir hata oluştu: ' + error.message);
    }
  });
  
  // Dizi sezon ve bölüm bilgilerini al
  ipcMain.handle('get-tv-seasons', async (event, tvId) => {
    try {
      // API modüllerini tekrar kontrol et
      if (!apiModules) {
        apiModules = apiManager.loadApiModules();
      }
      
      if (!apiModules || !apiModules.tmdbApi) {
        throw new Error('TMDB API yüklenmemiş. Lütfen API anahtarlarınızı kontrol edin.');
      }
      
      // TV ID'sini sayıya dönüştür
      const numericTvId = parseInt(tvId);
      if (isNaN(numericTvId)) {
        throw new Error('Geçersiz TV ID formatı: ' + tvId);
      }
      
      console.log(`Dizi sezon bilgilerini alınıyor: TV ID ${numericTvId}`);
      const result = await apiModules.tmdbApi.getTvShowSeasons(numericTvId, process.env.TMDB_API_KEY);
      
      if (!result || (!result.seasons && !Array.isArray(result))) {
        throw new Error('API yanıtı geçersiz veya sezon bilgisi içermiyor');
      }
      
      // Cevabı döndür
      return result;
    } catch (error) {
      console.error('Dizi sezon bilgileri alınırken hata:', error);
      throw new Error('Dizi sezon bilgileri alınamadı: ' + error.message);
    }
  });
  
  // Anime sezon ve bölüm bilgilerini al
  ipcMain.handle('get-anime-seasons', async (event, animeId) => {
    try {
      if (!apiModules || !apiModules.jikanApi) {
        throw new Error('Jikan API yüklenmemiş.');
      }
      
      // Anime ID'sini sayıya dönüştür
      const numericAnimeId = parseInt(animeId);
      if (isNaN(numericAnimeId)) {
        throw new Error('Geçersiz Anime ID formatı: ' + animeId);
      }
      
      console.log(`Anime sezon bilgilerini alınıyor: Anime ID ${numericAnimeId}`);
      const result = await apiModules.jikanApi.getAnimeSeasons(numericAnimeId);
      
      if (!result) {
        throw new Error('API yanıtı geçersiz veya sezon bilgisi içermiyor');
      }
      
      return result;
    } catch (error) {
      console.error('Anime sezon bilgileri alınırken hata:', error);
      throw new Error('Anime sezon bilgileri alınamadı: ' + error.message);
    }
  });
  
  // ======= İzleme Listesi İşlemleri =======
  
  // İzleme listesine ekle
  ipcMain.handle('add-to-watchlist', async (event, item) => {
    try {
      return await watchlistManager.addToWatchlist(item);
    } catch (error) {
      console.error('İzleme listesi kayıt hatası:', error);
      return { success: false, error: error.message };
    }
  });
  
  // İzleme listesini al
  ipcMain.handle('get-watchlist', async () => {
    try {
      return await watchlistManager.getWatchlist();
    } catch (error) {
      console.error('İzleme listesi okunurken hata:', error);
      throw new Error('İzleme listesi okunamadı: ' + error.message);
    }
  });
  
  // Bölüm izleme durumunu güncelle
  ipcMain.handle('update-episode-status', async (event, data) => {
    try {
      return await watchlistManager.updateEpisodeStatus(data);
    } catch (error) {
      console.error('Bölüm durumu güncellenirken hata:', error);
      throw new Error('Bölüm durumu güncellenemedi: ' + error.message);
    }
  });
  
  // İçerik puanını güncelle
  ipcMain.handle('update-content-rating', async (event, data) => {
    try {
      return await watchlistManager.updateContentRating(data);
    } catch (error) {
      console.error('İçerik puanı güncellenirken hata:', error);
      throw new Error('İçerik puanı güncellenemedi: ' + error.message);
    }
  });
  
  // İzleme listesinden içerik kaldır
  ipcMain.handle('remove-from-watchlist', async (event, data) => {
    try {
      return await watchlistManager.removeFromWatchlist(data);
    } catch (error) {
      console.error('İzleme listesinden kaldırma hatası:', error);
      throw new Error('İzleme listesinden kaldırılamadı: ' + error.message);
    }
  });
  
  // İzlendi olarak işaretle
  ipcMain.handle('mark-as-watched', async (event, data) => {
    try {
      console.log('Mark as watched data received:', data);
      
      // Data validasyonu
      if (!data) {
        throw new Error('İşaretleme verisi bulunamadı (data: undefined)');
      }
      
      // ID ve mediaType kontrolü
      if (data.id === undefined || data.id === null) {
        throw new Error('İçerik ID bilgisi eksik');
      }
      
      if (!data.mediaType) {
        throw new Error('Medya türü belirtilmedi (mediaType: undefined)');
      }
      
      // Veriyi doğru formatta hazırla
      const processedData = {
        id: parseInt(data.id),
        mediaType: data.mediaType
      };
      
      console.log('Processed mark as watched data:', processedData);
      return await watchlistManager.markAsWatched(processedData);
    } catch (error) {
      console.error('İzlendi olarak işaretleme hatası:', error);
      throw new Error('İzlendi olarak işaretlenemedi: ' + error.message);
    }
  });
  
  // İzleme listesini dışa aktar
  ipcMain.handle('export-watchlist', async (event, targetPath) => {
    try {
      return await watchlistManager.exportWatchlist(targetPath);
    } catch (error) {
      console.error('İzleme listesi dışa aktarılırken hata:', error);
      return { success: false, error: error.message };
    }
  });
  
  // ======= Detay İşlemleri =======
  
  // Film/TV detaylarını getir
  ipcMain.handle('get-movie-tv-details', async (event, {id, type}) => {
    try {
      const tmdbApiKey = apiManager.getApiKeys().TMDB_API_KEY;
      if (!tmdbApiKey) {
        throw new Error('TMDB API anahtarı bulunamadı');
      }
      
      const url = `https://api.themoviedb.org/3/${type}/${id}?api_key=${tmdbApiKey}&language=en-US`;
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('TMDB detayları alınamadı:', error);
      return null;
    }
  });
  
  // Anime detaylarını getir
  ipcMain.handle('get-anime-details', async (event, {id}) => {
    try {
      const url = `https://api.jikan.moe/v4/anime/${id}`;
      const response = await axios.get(url);
      return response.data.data;
    } catch (error) {
      console.error('Anime detayları alınamadı:', error);
      return null;
    }
  });
  
  // ======= Slider İşlemleri =======
  
  // Özel slider oluştur
  ipcMain.handle('create-custom-slider', async (event, slider) => {
    try {
      return await sliderManager.createCustomSlider(slider);
    } catch (error) {
      console.error('Slider oluşturma hatası:', error);
      return { success: false, error: error.message };
    }
  });
  
  // Özel slider güncelle
  ipcMain.handle('update-custom-slider', async (event, slider) => {
    try {
      return await sliderManager.updateCustomSlider(slider);
    } catch (error) {
      console.error('Slider güncelleme hatası:', error);
      return { success: false, error: error.message };
    }
  });
  
  // Özel slider sil
  ipcMain.handle('delete-custom-slider', async (event, sliderId) => {
    try {
      return await sliderManager.deleteCustomSlider(sliderId);
    } catch (error) {
      console.error('Slider silme hatası:', error);
      return { success: false, error: error.message };
    }
  });
  
  // Slider'a öğe ekle
  ipcMain.handle('add-item-to-slider', async (event, sliderId, itemId, mediaType) => {
    try {
      return await sliderManager.addItemToSlider(sliderId, itemId, mediaType);
    } catch (error) {
      console.error('Slider öğesi eklenirken hata:', error);
      return { success: false, error: error.message };
    }
  });
  
  // Slider'dan öğe kaldır
  ipcMain.handle('remove-item-from-slider', async (event, sliderId, itemId, mediaType) => {
    try {
      return await sliderManager.removeItemFromSlider(sliderId, itemId, mediaType);
    } catch (error) {
      console.error('Slider öğesi kaldırılırken hata:', error);
      return { success: false, error: error.message };
    }
  });
};

module.exports = {
  setupIpcHandlers
}; 