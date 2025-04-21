const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const dotenv = require('dotenv');
const { jikanApi } = require('../api');
const Store = require('electron-store');
const fs = require('fs').promises;

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
const watchlistPath = path.join(__dirname, '../../src/data/watchlist.json');

// Pencere referansını global olarak tut, yoksa çöp toplama olabilir
let mainWindow;
let settingsWindow;

// tmdbApi referansı
let tmdbApi = null;

// API anahtarlarının varlığını kontrol et
function checkApiKeys() {
  const tmdbKey = store.get('TMDB_API_KEY');
  const omdbKey = store.get('OMDB_API_KEY');
  
  if (!tmdbKey || !omdbKey) {
    // API anahtarları yoksa, ayarlar penceresini göster
    createSettingsWindow();
    return false;
  }
  
  // API anahtarlarını çevre değişkenlerine ata
  process.env.TMDB_API_KEY = tmdbKey;
  process.env.OMDB_API_KEY = omdbKey;
  
  console.log('API anahtarları store\'dan yüklendi:');
  console.log('- TMDB_API_KEY:', process.env.TMDB_API_KEY ? 'Tanımlı' : 'Tanımlı değil');
  console.log('- OMDB_API_KEY:', process.env.OMDB_API_KEY ? 'Tanımlı' : 'Tanımlı değil');
  
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
  });
}

// Uygulama hazır olduğunda
app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    // macOS için: dock'a tıklandığında pencere yoksa yeni pencere oluştur
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Tüm pencereler kapatıldığında uygulamadan çık (Windows ve Linux)
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// API anahtarlarını kaydet
ipcMain.handle('save-api-keys', async (event, keys) => {
  try {
    // API anahtarlarını kaydet
    store.set('TMDB_API_KEY', keys.TMDB_API_KEY);
    store.set('OMDB_API_KEY', keys.OMDB_API_KEY);
    
    return { success: true };
  } catch (error) {
    console.error('API anahtarları kaydedilirken hata:', error);
    return { success: false, error: error.message };
  }
});

// API anahtarlarını al
ipcMain.handle('get-api-keys', async () => {
  try {
    return {
      TMDB_API_KEY: store.get('TMDB_API_KEY', ''),
      OMDB_API_KEY: store.get('OMDB_API_KEY', '')
    };
  } catch (error) {
    console.error('API anahtarları okunurken hata:', error);
    return null;
  }
});

// Uygulamayı yeniden başlat
ipcMain.on('restart-app', () => {
  app.relaunch();
  app.exit(0);
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
      throw new Error('TMDB API anahtarı ayarlanmamış. Lütfen .env dosyasını kontrol edin.');
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
    // data klasörünün varlığını kontrol et
    const dataDir = path.join(__dirname, '../../src/data');
    
    try {
      await fs.access(dataDir);
    } catch (error) {
      // Klasör yoksa oluştur
      await fs.mkdir(dataDir, { recursive: true });
      console.log('Data klasörü oluşturuldu');
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
      console.log('watchlist.json dosyası oluşturuldu');
    }
  } catch (error) {
    console.error('Klasör veya dosya erişim hatası:', error);
    throw new Error('İzleme listesi dosyası oluşturulamadı');
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