const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const dotenv = require('dotenv');
const { jikanApi } = require('../api');
const Store = require('electron-store');
const fs = require('fs').promises;
const axios = require('axios');

// Ayarlar store'unu başlat
const store = new Store({
  name: 'watchflow-settings',
  encryptionKey: 'watchflow-app-secure-key',
});

// .env dosyasını doğru yoldan yükle
const result = dotenv.config({ path: path.join(__dirname, '../../.env') });
if (result.error) {
  console.error('.env dosyası yüklenirken hata oluştu:', result.error);
}

// İzleme listesi dosya yolu
const isDevelopment = process.env.NODE_ENV === 'development' || process.argv.includes('--dev');
// Geliştirme modunda src/data içinde, üretim modunda userData klasöründe depolama yap
const watchlistPath = isDevelopment 
  ? path.join(__dirname, '../../src/data/watchlist.json')
  : path.join(app.getPath('userData'), 'watchlist.json');

// Pencere referansını global olarak tut, yoksa çöp toplama olabilir
let mainWindow;
let settingsWindow;

// tmdbApi referansı
let tmdbApi = null;

// API anahtarlarının varlığını kontrol et
function checkApiKeys() {
  const tmdbKey = store.get('TMDB_API_KEY');
  
  if (!tmdbKey) {
    // API anahtarları yoksa, ayarlar penceresini göster
    createSettingsWindow();
    return false;
  }
  
  // API anahtarlarını çevre değişkenlerine ata
  process.env.TMDB_API_KEY = tmdbKey;
  
  console.log('API anahtarları store\'dan yüklendi:');
  console.log('- TMDB_API_KEY:', process.env.TMDB_API_KEY ? 'Tanımlı' : 'Tanımlı değil');
  
  // API anahtarları tanımlı, tmdbApi'yi yükle
  tmdbApi = require('../api').tmdbApi;
  
  return true;
}

function createWindow() {
  // API anahtarlarını kontrol et
  const apiKeysExist = checkApiKeys();
  if (!apiKeysExist) {
    // Eğer API anahtarları yoksa, main window oluşturma
    return;
  }
  
  // Tarayıcı penceresi oluştur
  mainWindow = new BrowserWindow({
    width: 500,
    height: 900,
    frame: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload/preload.js')
    }
  });

  // index.html'i yükle
  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  // DevTools'u aç (geliştirme sırasında)
  if (process.env.NODE_ENV === 'development' || process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }

  // Pencere kapatıldığında gerçekleşecek olay
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

// Ayarlar penceresini oluştur
function createSettingsWindow() {
  // Eğer pencere zaten açıksa, yeni bir tane oluşturma
  if (settingsWindow) {
    settingsWindow.focus();
    return;
  }
  
  settingsWindow = new BrowserWindow({
    width: 600,
    height: 650,
    resizable: false,
    frame: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload/preload.js')
    }
  });
  
  // settings.html'i yükle
  settingsWindow.loadFile(path.join(__dirname, '../renderer/settings.html'));
  
  // DevTools'u aç (geliştirme sırasında)
  if (process.env.NODE_ENV === 'development' || process.argv.includes('--dev')) {
    settingsWindow.webContents.openDevTools();
  }
  
  // Pencere kapatıldığında gerçekleşecek olay
  settingsWindow.on('closed', function () {
    settingsWindow = null;
    
    // Eğer bu sadece API ayarı penceresi idiyse ve API anahtarları ayarlandıysa
    // Ana pencereyi oluştur (ve eğer ana pencere zaten açık değilse)
    if (!mainWindow && store.get('TMDB_API_KEY')) {
      createWindow();
    }
  });
}

// Uygulama hazır olduğunda
app.whenReady().then(() => {
  // Eğer daha önce hiç pencere açılmadıysa, yeni pencere aç
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }

  app.on('activate', function () {
    // macOS için: dock'a tıklandığında pencere yoksa yeni pencere oluştur
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Tüm pencereler kapatıldığında uygulamadan çık (Windows ve Linux)
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// Pencere kontrolleri için IPC kanalları
ipcMain.on('minimize-window', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) win.minimize();
});

ipcMain.on('close-window', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) win.close();
});

// Dosya kaydetme dialogu
ipcMain.handle('show-save-dialog', async (event, options) => {
  try {
    const win = BrowserWindow.fromWebContents(event.sender);
    return await dialog.showSaveDialog(win, options);
  } catch (error) {
    console.error('Dosya kaydetme dialogu hatası:', error);
    throw error;
  }
});

// API anahtarlarını kaydet
ipcMain.handle('save-api-keys', async (event, keys) => {
  try {
    // API anahtarlarını kaydet
    store.set('TMDB_API_KEY', keys.TMDB_API_KEY);
    
    return { success: true };
  } catch (error) {
    console.error('API anahtarı kaydedilirken hata:', error);
    return { success: false, error: error.message };
  }
});

// API anahtarlarını al
ipcMain.handle('get-api-keys', async () => {
  try {
    return {
      TMDB_API_KEY: store.get('TMDB_API_KEY', '')
    };
  } catch (error) {
    console.error('API anahtarı okunurken hata:', error);
    return null;
  }
});

// Uygulamayı yeniden başlat
ipcMain.on('restart-app', () => {
  // Mevcut tüm pencereleri kapat
  BrowserWindow.getAllWindows().forEach(win => {
    win.close();
  });
  
  // Ayarlardan sonra yeniden başlatılan uygulamayı temiz bir şekilde başlat
  setTimeout(() => {
    // Pencere referanslarını temizle
    mainWindow = null;
    settingsWindow = null;
    
    // Uygulama zaten başlatılmış olduğundan, doğrudan createWindow() çağrısı yap
    app.whenReady().then(() => {
      createWindow();
    });
  }, 500);
});

// IPC iletişim kanallarını kur
ipcMain.handle('check-server-status', async () => {
  return { status: 'API bağlantısı hazır' };
});

ipcMain.handle('search-tmdb', async (event, query, type = 'multi') => {
  try {
    if (!tmdbApi) {
      throw new Error('TMDB API yüklenmemiş. Lütfen API anahtarlarınızı kontrol edin.');
    }
    
    console.log(`TMDB Araması: "${query}" (Tür: ${type})`);
    const results = await tmdbApi.searchMedia(query, type, process.env.TMDB_API_KEY);
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

ipcMain.handle('search-jikan', async (event, query) => {
  try {
    console.log(`Jikan Araması: "${query}"`);
    const results = await jikanApi.searchAnime(query);
    return results;
  } catch (error) {
    console.error('Jikan arama hatası:', error);
    throw new Error('Anime araması sırasında bir hata oluştu: ' + error.message);
  }
});

// Dizi sezon ve bölüm bilgilerini al
ipcMain.handle('get-tv-seasons', async (event, tvId) => {
  try {
    if (!tmdbApi) {
      throw new Error('TMDB API yüklenmemiş. Lütfen API anahtarlarınızı kontrol edin.');
    }
    
    console.log(`Dizi sezon bilgilerini alınıyor: TV ID ${tvId}`);
    const result = await tmdbApi.getTvShowSeasons(tvId, process.env.TMDB_API_KEY);
    return result;
  } catch (error) {
    console.error('Dizi sezon bilgileri alınırken hata:', error);
    throw new Error('Dizi sezon bilgileri alınamadı: ' + error.message);
  }
});

// Anime sezon ve bölüm bilgilerini al
ipcMain.handle('get-anime-seasons', async (event, animeId) => {
  try {
    console.log(`Anime sezon bilgilerini alınıyor: Anime ID ${animeId}`);
    const result = await jikanApi.getAnimeSeasons(animeId);
    return result;
  } catch (error) {
    console.error('Anime sezon bilgileri alınırken hata:', error);
    throw new Error('Anime sezon bilgileri alınamadı: ' + error.message);
  }
});

// İzleme listesine ekle
ipcMain.handle('add-to-watchlist', async (event, item) => {
  try {
    // Watchlist klasörünün ve dosyasının varlığını kontrol et
    await ensureWatchlistExists();
    
    // Tür adını Türkçeleştir
    let displayType = '';
    switch (item.type) {
      case 'movie':
        displayType = 'Film';
        break;
      case 'tv':
        displayType = 'Dizi';
        break;
      case 'anime':
        displayType = 'Anime';
        break;
      default:
        displayType = item.type;
    }
    
    // Öğeyi güncelle
    const itemToSave = {
      id: item.id,
      title: item.title,
      year: item.year || '',
      imageUrl: item.imageUrl,
      status: item.status,
      dateAdded: item.dateAdded || new Date().toISOString()
    };
    
    // Rating bilgisi varsa ekle
    if (item.rating) {
      itemToSave.rating = item.rating;
    }
    
    // Dizi ve anime için sezon bilgilerini al
    if (item.type === 'tv' || item.type === 'anime') {
      try {
        let seasonData = null;
        
        if (item.type === 'tv') {
          if (!tmdbApi) {
            throw new Error('TMDB API yüklenmemiş. Lütfen API anahtarlarınızı kontrol edin.');
          }
          
          console.log(`Dizi için sezon bilgileri alınıyor: ${item.title} (ID: ${item.id})`);
          seasonData = await tmdbApi.getTvShowSeasons(item.id, process.env.TMDB_API_KEY);
        } else if (item.type === 'anime') {
          console.log(`Anime için sezon bilgileri alınıyor: ${item.title} (ID: ${item.id})`);
          seasonData = await jikanApi.getAnimeSeasons(item.id);
        }
        
        if (seasonData) {
          // Sadece sezon sayısı ve bölüm sayılarını al
          const simplifiedSeasons = seasonData.seasons.map(season => ({
            seasonNumber: season.seasonNumber,
            episodeCount: season.episodeCount || season.episodes.length
          }));
          
          // Sezon bilgilerini nesneye ekle
          itemToSave.totalSeasons = seasonData.totalSeasons || seasonData.seasons.length;
          itemToSave.seasons = simplifiedSeasons;
          
          // İzlenen bölümler dizisi ekle (başlangıçta boş)
          if (!item.watchedEpisodes) {
            itemToSave.watchedEpisodes = [];
          }
        }
      } catch (seasonError) {
        console.error('Sezon bilgileri alınırken hata:', seasonError);
        // Hata oluşsa da devam et, sezon bilgileri olmadan kaydet
      }
    }
    
    // Mevcut listeyi oku
    let watchlist = {};
    try {
      const data = await fs.readFile(watchlistPath, 'utf8');
      watchlist = JSON.parse(data);
      
      // Eğer eski format varsa (dizi yerine obje) yeni formata dönüştür
      if (Array.isArray(watchlist)) {
        console.log('Eski format tespit edildi, yeni formata dönüştürülüyor...');
        const newFormat = {
          movie: [],
          tv: [],
          anime: []
        };
        
        // Eski listedeki öğeleri yeni formata aktar
        watchlist.forEach(oldItem => {
          if (oldItem.type && ['movie', 'tv', 'anime'].includes(oldItem.type)) {
            newFormat[oldItem.type].push({
              id: oldItem.id,
              title: oldItem.title,
              year: oldItem.year || '',
              imageUrl: oldItem.imageUrl,
              status: oldItem.status,
              dateAdded: oldItem.dateAdded
            });
          }
        });
        
        watchlist = newFormat;
      }
    } catch (readError) {
      // Dosya yoksa veya okunmazsa başlangıç yapısı oluştur
      console.log('İzleme listesi okunamadı, yeni liste oluşturuluyor');
      watchlist = {
        movie: [],
        tv: [],
        anime: []
      };
    }
    
    // Kategorilerin varlığını kontrol et
    if (!watchlist.movie) watchlist.movie = [];
    if (!watchlist.tv) watchlist.tv = [];
    if (!watchlist.anime) watchlist.anime = [];
    
    // İlgili kategoriden mevcut öğeyi bul
    const category = item.type;
    const existingIndex = watchlist[category].findIndex(i => i.id === item.id);
    
    if (existingIndex !== -1) {
      // Zaten varsa, öğeyi güncelle
      watchlist[category][existingIndex] = {
        ...watchlist[category][existingIndex],
        ...itemToSave,
        updatedAt: new Date().toISOString()
      };
      console.log(`İzleme listesinde güncelleme: ${item.title} (${displayType})`);
    } else {
      // Yoksa ekle
      watchlist[category].push(itemToSave);
      console.log(`İzleme listesine eklendi: ${item.title} (${displayType})`);
    }
    
    // Listeyi kaydet
    await fs.writeFile(watchlistPath, JSON.stringify(watchlist, null, 2), 'utf8');
    
    return { success: true };
  } catch (error) {
    console.error('İzleme listesi kayıt hatası:', error);
    return { success: false, error: error.message };
  }
});

// İzleme listesi dosyasının varlığını kontrol et, yoksa oluştur
async function ensureWatchlistExists() {
  try {
    // watchlistPath'in dizinini al
    const watchlistDir = path.dirname(watchlistPath);
    
    try {
      // Dizinin varlığını kontrol et
      await fs.access(watchlistDir);
    } catch (error) {
      // Dizin yoksa oluştur
      await fs.mkdir(watchlistDir, { recursive: true });
      console.log(`Dizin oluşturuldu: ${watchlistDir}`);
    }
    
    // watchlist.json dosyasının varlığını kontrol et
    try {
      await fs.access(watchlistPath);
    } catch (error) {
      // Dosya yoksa oluştur - boş kategori yapısıyla
      const emptyWatchlist = {
        movie: [],
        tv: [],
        anime: []
      };
      await fs.writeFile(watchlistPath, JSON.stringify(emptyWatchlist, null, 2), 'utf8');
      console.log(`watchlist.json dosyası oluşturuldu: ${watchlistPath}`);
    }
  } catch (error) {
    console.error('Klasör veya dosya erişim hatası:', error);
    throw new Error('İzleme listesi dosyası oluşturulamadı: ' + error.message);
  }
}

// İzleme listesini al
ipcMain.handle('get-watchlist', async () => {
  try {
    // Watchlist dosyasının var olduğundan emin ol
    await ensureWatchlistExists();
    
    // JSON'u oku ve döndür
    const watchlistData = await fs.readFile(watchlistPath, 'utf8');
    return JSON.parse(watchlistData);
  } catch (error) {
    console.error('İzleme listesi okunurken hata:', error);
    throw new Error('İzleme listesi okunamadı: ' + error.message);
  }
});

// Bölüm izleme durumunu güncellemek için handler
ipcMain.handle('update-episode-status', async (event, data) => {
  try {
    const { mediaId, mediaType, seasonNumber, episodeNumber, isWatched } = data;
    
    // Watchlist dosyasının var olduğundan emin ol
    await ensureWatchlistExists();
    
    // JSON'u oku
    const watchlistData = await fs.readFile(watchlistPath, 'utf8');
    const watchlist = JSON.parse(watchlistData);
    
    // İlgili öğeyi bul - kategorileri düzelttim
    const category = mediaType; // 'movie', 'tv', veya 'anime'
    
    // Öğeyi bul
    const itemIndex = watchlist[category].findIndex(item => item.id === mediaId);
    
    if (itemIndex === -1) {
      throw new Error('Öğe bulunamadı');
    }
    
    // Öğenin watchedEpisodes array'ini kontrol et, yoksa oluştur
    if (!watchlist[category][itemIndex].watchedEpisodes) {
      watchlist[category][itemIndex].watchedEpisodes = [];
    }
    
    // Bölüm kimliğini oluştur
    const episodeId = `s${seasonNumber}e${episodeNumber}`;
    
    // Eğer izlendi işaretlendiyse, array'e ekle (eğer yoksa)
    if (isWatched) {
      if (!watchlist[category][itemIndex].watchedEpisodes.includes(episodeId)) {
        watchlist[category][itemIndex].watchedEpisodes.push(episodeId);
      }
    } 
    // Eğer izlenmedi işaretlendiyse ve array'de varsa, çıkar
    else {
      const epIndex = watchlist[category][itemIndex].watchedEpisodes.indexOf(episodeId);
      if (epIndex !== -1) {
        watchlist[category][itemIndex].watchedEpisodes.splice(epIndex, 1);
      }
    }
    
    // JSON'u güncelle
    await fs.writeFile(watchlistPath, JSON.stringify(watchlist, null, 2));
    
    return { 
      success: true, 
      watchedEpisodes: watchlist[category][itemIndex].watchedEpisodes 
    };
  } catch (error) {
    console.error('Bölüm durumu güncellenirken hata:', error);
    throw new Error('Bölüm durumu güncellenemedi: ' + error.message);
  }
});

// İzleme listesini dışa aktar
ipcMain.handle('export-watchlist', async (event, targetPath) => {
  try {
    // Watchlist dosyasının var olduğundan emin ol
    await ensureWatchlistExists();
    
    // Kaynak dosyayı oku
    const watchlistData = await fs.readFile(watchlistPath, 'utf8');
    
    // Hedef dizini kontrol et
    const targetDir = path.dirname(targetPath);
    try {
      await fs.access(targetDir);
    } catch (error) {
      // Dizin yoksa oluştur
      await fs.mkdir(targetDir, { recursive: true });
    }
    
    // Hedef dosyaya kopyala
    await fs.writeFile(targetPath, watchlistData, 'utf8');
    
    console.log(`İzleme listesi dışa aktarıldı: ${targetPath}`);
    return { success: true, path: targetPath };
  } catch (error) {
    console.error('İzleme listesi dışa aktarılırken hata:', error);
    return { success: false, error: error.message };
  }
});

// Film/TV detaylarını getiren handler
ipcMain.handle('get-movie-tv-details', async (event, {id, type}) => {
  try {
    const tmdbApiKey = store.get('TMDB_API_KEY');
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

// Anime detaylarını getiren handler
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

// İçerik puanını güncelleme handler'ı
ipcMain.handle('update-content-rating', async (event, data) => {
  try {
    const { mediaId, mediaType, rating } = data;
    
    // Watchlist dosyasının var olduğundan emin ol
    await ensureWatchlistExists();
    
    // JSON'u oku
    const watchlistData = await fs.readFile(watchlistPath, 'utf8');
    const watchlist = JSON.parse(watchlistData);
    
    // İlgili öğeyi bul
    const category = mediaType; // 'movie', 'tv', veya 'anime'
    
    // Öğeyi bul
    const itemIndex = watchlist[category].findIndex(item => item.id === mediaId);
    
    if (itemIndex === -1) {
      throw new Error('Öğe bulunamadı');
    }
    
    // Kullanıcı puanını güncelle
    watchlist[category][itemIndex].userRating = rating;
    
    // JSON'u güncelle
    await fs.writeFile(watchlistPath, JSON.stringify(watchlist, null, 2));
    
    return { 
      success: true,
      userRating: rating
    };
  } catch (error) {
    console.error('İçerik puanı güncellenirken hata:', error);
    throw new Error('İçerik puanı güncellenemedi: ' + error.message);
  }
});

// İzleme listesinden içerik kaldırma handler'ı
ipcMain.handle('remove-from-watchlist', async (event, data) => {
  try {
    const { id, mediaType } = data;
    
    // İzleme listesi dosyasının var olduğundan emin ol
    await ensureWatchlistExists();
    
    // JSON'u oku
    const watchlistData = await fs.readFile(watchlistPath, 'utf8');
    const watchlist = JSON.parse(watchlistData);
    
    // İlgili kategoriyi kontrol et
    const category = mediaType; // 'movie', 'tv', veya 'anime'
    
    if (!watchlist[category]) {
      throw new Error(`Geçersiz medya türü: ${mediaType}`);
    }
    
    // ID'yi sayısal değere dönüştür (tür uyumsuzluğunu önle)
    const itemId = Number(id);
    
    // Öğeyi bul
    const itemIndex = watchlist[category].findIndex(item => Number(item.id) === itemId);
    
    if (itemIndex === -1) {
      throw new Error('İzleme listesinden kaldırılacak öğe bulunamadı');
    }
    
    // Mevcut içeriğin başlığı ve diğer bilgileri
    const item = watchlist[category][itemIndex];
    console.log(`İzleme listesinden kaldırılıyor: "${item.title}" (${category}), ID: ${itemId}`);
    
    // Öğeyi listeden kaldır
    watchlist[category].splice(itemIndex, 1);
    
    // JSON'u güncelle
    await fs.writeFile(watchlistPath, JSON.stringify(watchlist, null, 2));
    
    return { 
      success: true,
      message: `"${item.title}" izleme listesinden kaldırıldı`
    };
  } catch (error) {
    console.error('İzleme listesinden kaldırma hatası:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
});

// İçeriği izlendi olarak işaretle handler'ı
ipcMain.handle('mark-as-watched', async (event, data) => {
  try {
    const { id, mediaType } = data;
    
    // Watchlist dosyasının var olduğundan emin ol
    await ensureWatchlistExists();
    
    // JSON'u oku
    const watchlistData = await fs.readFile(watchlistPath, 'utf8');
    const watchlist = JSON.parse(watchlistData);
    
    // İlgili kategoriyi kontrol et
    const category = mediaType; // 'movie', 'tv', veya 'anime'
    
    if (!watchlist[category]) {
      throw new Error(`Geçersiz medya türü: ${mediaType}`);
    }
    
    // ID'yi sayısal değere dönüştür (tür uyumsuzluğunu önle)
    const itemId = Number(id);
    
    // Öğeyi bul
    const itemIndex = watchlist[category].findIndex(item => Number(item.id) === itemId);
    
    if (itemIndex === -1) {
      throw new Error('İşaretlenecek öğe bulunamadı');
    }
    
    // Mevcut içeriğin başlığı ve diğer bilgileri
    const item = watchlist[category][itemIndex];
    console.log(`İzlendi olarak işaretleniyor: "${item.title}" (${category}), ID: ${itemId}`);
    
    // Durum bilgisini güncelle
    watchlist[category][itemIndex].status = 'izlendi';
    
    // Film ise direkt izlendi olarak işaretle, dizi/anime ise tüm bölümleri izlendi olarak işaretle
    if (mediaType === 'tv' || mediaType === 'anime') {
      // Eğer seasons bilgisi varsa
      if (item.seasons && item.seasons.length > 0) {
        // Tüm bölümleri izlendi olarak işaretle
        let watchedEpisodes = [];
        
        item.seasons.forEach(season => {
          const seasonNumber = season.seasonNumber;
          const episodeCount = season.episodeCount;
          
          // Her bölüm için izlendi kaydı ekle
          for (let i = 1; i <= episodeCount; i++) {
            watchedEpisodes.push(`s${seasonNumber}e${i}`);
          }
        });
        
        // İzlenen bölümleri güncelle
        watchlist[category][itemIndex].watchedEpisodes = watchedEpisodes;
      }
    }
    
    // Güncelleme tarihi ekle
    watchlist[category][itemIndex].updatedAt = new Date().toISOString();
    
    // JSON'u güncelle
    await fs.writeFile(watchlistPath, JSON.stringify(watchlist, null, 2));
    
    return { 
      success: true,
      message: `"${item.title}" izlendi olarak işaretlendi`
    };
  } catch (error) {
    console.error('İzlendi olarak işaretleme hatası:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
});

// Özel slider oluşturma handler'ı
ipcMain.handle('create-custom-slider', async (event, slider) => {
  try {
    // Watchlist dosyasının var olduğundan emin ol
    await ensureWatchlistExists();
    
    // JSON'u oku
    const watchlistData = await fs.readFile(watchlistPath, 'utf8');
    const watchlist = JSON.parse(watchlistData);
    
    // sliders array'i yoksa oluştur
    if (!watchlist.sliders) {
      watchlist.sliders = [];
    }
    
    // ID çakışması var mı kontrol et
    const existingSlider = watchlist.sliders.find(s => s.id === slider.id);
    if (existingSlider) {
      return { success: false, error: 'Bu ID ile bir slider zaten var' };
    }
    
    // Yeni Kategori'ı ekle
    watchlist.sliders.push(slider);
    
    // JSON'u güncelle
    await fs.writeFile(watchlistPath, JSON.stringify(watchlist, null, 2));
    
    return { success: true, slider };
  } catch (error) {
    console.error('Slider oluşturma hatası:', error);
    return { success: false, error: error.message };
  }
});

// Özel slider güncelleme handler'ı
ipcMain.handle('update-custom-slider', async (event, updatedSlider) => {
  try {
    // Watchlist dosyasının var olduğundan emin ol
    await ensureWatchlistExists();
    
    // JSON'u oku
    const watchlistData = await fs.readFile(watchlistPath, 'utf8');
    const watchlist = JSON.parse(watchlistData);
    
    // sliders array'i yoksa hata döndür
    if (!watchlist.sliders) {
      return { success: false, error: 'Sliders dizisi bulunamadı' };
    }
    
    // Slider'ı bul
    const sliderIndex = watchlist.sliders.findIndex(s => s.id === updatedSlider.id);
    if (sliderIndex === -1) {
      return { success: false, error: 'Güncellenecek slider bulunamadı' };
    }
    
    // Slider'ı güncelle
    watchlist.sliders[sliderIndex] = updatedSlider;
    
    // JSON'u güncelle
    await fs.writeFile(watchlistPath, JSON.stringify(watchlist, null, 2));
    
    return { success: true, slider: updatedSlider };
  } catch (error) {
    console.error('Slider güncelleme hatası:', error);
    return { success: false, error: error.message };
  }
});

// Özel slider silme handler'ı
ipcMain.handle('delete-custom-slider', async (event, sliderId) => {
  try {
    // Watchlist dosyasının var olduğundan emin ol
    await ensureWatchlistExists();
    
    // JSON'u oku
    const watchlistData = await fs.readFile(watchlistPath, 'utf8');
    const watchlist = JSON.parse(watchlistData);
    
    // sliders array'i yoksa hata döndür
    if (!watchlist.sliders) {
      return { success: false, error: 'Sliders dizisi bulunamadı' };
    }
    
    // Slider'ı bul
    const sliderIndex = watchlist.sliders.findIndex(s => s.id === sliderId);
    if (sliderIndex === -1) {
      return { success: false, error: 'Silinecek slider bulunamadı' };
    }
    
    // Slider'ı sil
    watchlist.sliders.splice(sliderIndex, 1);
    
    // JSON'u güncelle
    await fs.writeFile(watchlistPath, JSON.stringify(watchlist, null, 2));
    
    return { success: true };
  } catch (error) {
    console.error('Slider silme hatası:', error);
    return { success: false, error: error.message };
  }
});

// Slider'a öğe ekleme handler'ı
ipcMain.handle('add-item-to-slider', async (event, sliderId, itemId, mediaType) => {
  try {
    // Watchlist dosyasının var olduğundan emin ol
    await ensureWatchlistExists();
    
    // JSON'u oku
    const watchlistData = await fs.readFile(watchlistPath, 'utf8');
    const watchlist = JSON.parse(watchlistData);
    
    // sliders array'i yoksa hata döndür
    if (!watchlist.sliders) {
      return { success: false, error: 'Sliders dizisi bulunamadı' };
    }
    
    // Slider'ı bul
    const sliderIndex = watchlist.sliders.findIndex(s => s.id === sliderId);
    if (sliderIndex === -1) {
      return { success: false, error: 'Slider bulunamadı' };
    }
    
    // itemIds nesnesini kontrol et
    if (!watchlist.sliders[sliderIndex].itemIds) {
      watchlist.sliders[sliderIndex].itemIds = { movie: [], tv: [], anime: [] };
    }
    
    // İlgili medya türü için array'i kontrol et
    if (!watchlist.sliders[sliderIndex].itemIds[mediaType]) {
      watchlist.sliders[sliderIndex].itemIds[mediaType] = [];
    }
    
    // Öğeyi ekleyecek mi kontrol et
    if (!watchlist.sliders[sliderIndex].itemIds[mediaType].includes(itemId)) {
      watchlist.sliders[sliderIndex].itemIds[mediaType].push(itemId);
    }
    
    // JSON'u güncelle
    await fs.writeFile(watchlistPath, JSON.stringify(watchlist, null, 2));
    
    return { success: true, slider: watchlist.sliders[sliderIndex] };
  } catch (error) {
    console.error('Öğe ekleme hatası:', error);
    return { success: false, error: error.message };
  }
});

// Slider'dan öğe kaldırma handler'ı
ipcMain.handle('remove-item-from-slider', async (event, sliderId, itemId, mediaType) => {
  try {
    // Watchlist dosyasının var olduğundan emin ol
    await ensureWatchlistExists();
    
    // JSON'u oku
    const watchlistData = await fs.readFile(watchlistPath, 'utf8');
    const watchlist = JSON.parse(watchlistData);
    
    // sliders array'i yoksa hata döndür
    if (!watchlist.sliders) {
      return { success: false, error: 'Sliders dizisi bulunamadı' };
    }
    
    // Slider'ı bul
    const sliderIndex = watchlist.sliders.findIndex(s => s.id === sliderId);
    if (sliderIndex === -1) {
      return { success: false, error: 'Slider bulunamadı' };
    }
    
    // itemIds nesnesini ve medya türünü kontrol et
    if (!watchlist.sliders[sliderIndex].itemIds || 
        !watchlist.sliders[sliderIndex].itemIds[mediaType]) {
      return { success: false, error: 'Bu medya türü için öğe bulunamadı' };
    }
    
    // Öğenin indeksini bul
    const itemIndex = watchlist.sliders[sliderIndex].itemIds[mediaType].indexOf(itemId);
    if (itemIndex === -1) {
      return { success: false, error: 'Öğe bulunamadı' };
    }
    
    // Öğeyi kaldır
    watchlist.sliders[sliderIndex].itemIds[mediaType].splice(itemIndex, 1);
    
    // JSON'u güncelle
    await fs.writeFile(watchlistPath, JSON.stringify(watchlist, null, 2));
    
    return { success: true, slider: watchlist.sliders[sliderIndex] };
  } catch (error) {
    console.error('Öğe kaldırma hatası:', error);
    return { success: false, error: error.message };
  }
});

// Favorilerden kaldırma handler'ı
ipcMain.handle('remove-from-favorites', async (event, data) => {
  try {
    const { id, mediaType } = data;
    
    // Favori dosyasının var olduğundan emin ol
    await ensureFavoritesExists();
    
    // JSON'u oku
    const favoritesData = await fs.readFile(favoritesPath, 'utf8');
    const favorites = JSON.parse(favoritesData);
    
    // İlgili kategoriyi kontrol et
    const category = mediaType; // 'movie', 'tv', veya 'anime'
    
    if (!favorites[category]) {
      throw new Error(`Geçersiz medya türü: ${mediaType}`);
    }
    
    // ID'yi sayısal değere dönüştür (tür uyumsuzluğunu önle)
    const itemId = Number(id);
    
    // Öğeyi bul
    const itemIndex = favorites[category].findIndex(item => Number(item.id) === itemId);
    
    if (itemIndex === -1) {
      throw new Error('Favorilerden kaldırılacak öğe bulunamadı');
    }
    
    // Mevcut içeriğin başlığı ve diğer bilgileri
    const item = favorites[category][itemIndex];
    console.log(`Favorilerden kaldırılıyor: "${item.title}" (${category}), ID: ${itemId}`);
    
    // Öğeyi listeden kaldır
    favorites[category].splice(itemIndex, 1);
    
    // JSON'u güncelle
    await fs.writeFile(favoritesPath, JSON.stringify(favorites, null, 2));
    
    return { 
      success: true,
      message: `"${item.title}" favorilerden kaldırıldı`
    };
  } catch (error) {
    console.error('Favorilerden kaldırma hatası:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
}); 