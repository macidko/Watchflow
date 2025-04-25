// İzleme Listesi Yönetim Servisi
// İzleme listesi okuma, yazma ve içerik yönetimi işlemleri

const fs = require('fs').promises;
const path = require('path');
const { app } = require('electron');

// İzleme listesi dosya yolu hesaplama
const getWatchlistPath = () => {
  const isDevelopment = process.env.NODE_ENV === 'development' || process.argv.includes('--dev');
  // Geliştirme modunda src/data içinde, üretim modunda userData klasöründe depolama yap
  return isDevelopment 
    ? path.join(__dirname, '../../../src/data/watchlist.json')
    : path.join(app.getPath('userData'), 'watchlist.json');
};

// İzleme listesi dosyasının varlığını kontrol et, yoksa oluştur
const ensureWatchlistExists = async () => {
  try {
    const watchlistPath = getWatchlistPath();
    
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
        anime: [],
        sliders: []
      };
      await fs.writeFile(watchlistPath, JSON.stringify(emptyWatchlist, null, 2), 'utf8');
      console.log(`watchlist.json dosyası oluşturuldu: ${watchlistPath}`);
    }
    
    return true;
  } catch (error) {
    console.error('Klasör veya dosya erişim hatası:', error);
    throw new Error('İzleme listesi dosyası oluşturulamadı: ' + error.message);
  }
};

// İzleme listesini oku
const getWatchlist = async () => {
  try {
    // Watchlist dosyasının var olduğundan emin ol
    await ensureWatchlistExists();
    
    // JSON'u oku ve döndür
    const watchlistData = await fs.readFile(getWatchlistPath(), 'utf8');
    return JSON.parse(watchlistData);
  } catch (error) {
    console.error('İzleme listesi okunurken hata:', error);
    throw new Error('İzleme listesi okunamadı: ' + error.message);
  }
};

// İzleme listesine içerik ekle veya güncelle
const addToWatchlist = async (item) => {
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
    
    // Dizi ve anime için sezon bilgilerini ekle
    if (item.type === 'tv' || item.type === 'anime') {
      if (item.totalSeasons) itemToSave.totalSeasons = item.totalSeasons;
      if (item.seasons) itemToSave.seasons = item.seasons;
      
      // İzlenen bölümler dizisi ekle (başlangıçta boş)
      if (!item.watchedEpisodes) {
        itemToSave.watchedEpisodes = [];
      } else {
        itemToSave.watchedEpisodes = item.watchedEpisodes;
      }
    }
    
    // Mevcut listeyi oku
    const watchlist = await getWatchlist();
    
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
    await fs.writeFile(getWatchlistPath(), JSON.stringify(watchlist, null, 2), 'utf8');
    
    return { success: true };
  } catch (error) {
    console.error('İzleme listesi kayıt hatası:', error);
    return { success: false, error: error.message };
  }
};

// Bölüm izleme durumunu güncelle
const updateEpisodeStatus = async (data) => {
  try {
    const { mediaId, mediaType, seasonNumber, episodeNumber, isWatched } = data;
    
    // Watchlist dosyasının var olduğundan emin ol
    await ensureWatchlistExists();
    
    // JSON'u oku
    const watchlist = await getWatchlist();
    
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
    await fs.writeFile(getWatchlistPath(), JSON.stringify(watchlist, null, 2));
    
    return { 
      success: true, 
      watchedEpisodes: watchlist[category][itemIndex].watchedEpisodes 
    };
  } catch (error) {
    console.error('Bölüm durumu güncellenirken hata:', error);
    throw new Error('Bölüm durumu güncellenemedi: ' + error.message);
  }
};

// İçerik puanını güncelle
const updateContentRating = async (data) => {
  try {
    const { mediaId, mediaType, rating } = data;
    
    // Watchlist dosyasının var olduğundan emin ol
    await ensureWatchlistExists();
    
    // JSON'u oku
    const watchlist = await getWatchlist();
    
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
    await fs.writeFile(getWatchlistPath(), JSON.stringify(watchlist, null, 2));
    
    return { 
      success: true,
      userRating: rating
    };
  } catch (error) {
    console.error('İçerik puanı güncellenirken hata:', error);
    throw new Error('İçerik puanı güncellenemedi: ' + error.message);
  }
};

// İzleme listesinden içeriği kaldır
const removeFromWatchlist = async (data) => {
  try {
    // ID ve mediaType parametrelerini destekle
    let id, mediaType;
    
    // Eğer data bir obje ise (yeni format)
    if (typeof data === 'object' && data !== null) {
      id = data.id;
      mediaType = data.mediaType;
    } 
    // Eski format - iki ayrı parametre 
    else if (arguments.length === 2) {
      id = arguments[0];
      mediaType = arguments[1];
    } else {
      throw new Error('Geçersiz parametreler');
    }
    
    // Sayı değerine dönüştür
    id = Number(id);
    
    // İzleme listesi dosyasının var olduğundan emin ol
    await ensureWatchlistExists();
    
    // JSON'u oku
    const watchlist = await getWatchlist();
    
    // İlgili kategoriyi kontrol et
    if (!watchlist[mediaType]) {
      throw new Error(`Geçersiz medya türü: ${mediaType}`);
    }
    
    // Öğeyi bul
    const itemIndex = watchlist[mediaType].findIndex(item => Number(item.id) === id);
    
    if (itemIndex === -1) {
      throw new Error('İzleme listesinden kaldırılacak öğe bulunamadı');
    }
    
    // Mevcut içeriğin başlığı ve diğer bilgileri
    const item = watchlist[mediaType][itemIndex];
    console.log(`İzleme listesinden kaldırılıyor: "${item.title}" (${mediaType}), ID: ${id}`);
    
    // Öğeyi listeden kaldır
    watchlist[mediaType].splice(itemIndex, 1);
    
    // JSON'u güncelle
    await fs.writeFile(getWatchlistPath(), JSON.stringify(watchlist, null, 2));
    
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
};

// İçeriği izlendi olarak işaretle
const markAsWatched = async (data) => {
  try {
    // Veri kontrolü
    if (!data) {
      throw new Error('Veri bulunamadı (data: undefined)');
    }
    
    console.log('markAsWatched called with data:', JSON.stringify(data));
    
    // ID ve mediaType parametrelerini destekle
    let id, mediaType;
    
    // Eğer data bir obje ise (yeni format)
    if (typeof data === 'object' && data !== null) {
      id = data.id;
      // Önce mediaType, yoksa type parametresini kullan (geriye dönük uyumluluk için)
      mediaType = data.mediaType || data.type;
    } 
    // Eski format - iki ayrı parametre 
    else if (arguments.length === 2) {
      id = arguments[0];
      mediaType = arguments[1];
    } else {
      throw new Error('Geçersiz parametreler');
    }
    
    // Değerlerin varlığını kontrol et
    if (id === undefined || id === null) {
      throw new Error('İçerik ID bilgisi eksik');
    }
    
    if (!mediaType) {
      throw new Error('Medya türü belirtilmedi (mediaType ve type: undefined)');
    }

    // Sayı değerine dönüştür
    id = Number(id);
    
    console.log(`Processing mark as watched: ID=${id}, MediaType=${mediaType}`);
    
    // İzleme listesi dosyasının var olduğundan emin ol
    await ensureWatchlistExists();
    
    // JSON'u oku
    const watchlist = await getWatchlist();
    
    // watchlist içeriğini kontrol et
    console.log('Available categories in watchlist:', Object.keys(watchlist));
    
    // İlgili kategoriyi kontrol et
    if (!watchlist[mediaType]) {
      throw new Error(`Geçersiz medya türü: ${mediaType}. Mevcut kategoriler: ${Object.keys(watchlist).join(', ')}`);
    }
    
    // Öğeyi bul
    const itemIndex = watchlist[mediaType].findIndex(item => Number(item.id) === id);
    
    if (itemIndex === -1) {
      throw new Error(`İşaretlenecek öğe bulunamadı (ID: ${id}, MediaType: ${mediaType})`);
    }
    
    // Mevcut içeriğin başlığı ve diğer bilgileri
    const item = watchlist[mediaType][itemIndex];
    console.log(`İzlendi olarak işaretleniyor: "${item.title}" (${mediaType}), ID: ${id}`);
    
    // Durum bilgisini güncelle
    watchlist[mediaType][itemIndex].status = 'izlendi';
    
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
        watchlist[mediaType][itemIndex].watchedEpisodes = watchedEpisodes;
      }
    }
    
    // Güncelleme tarihi ekle
    watchlist[mediaType][itemIndex].updatedAt = new Date().toISOString();
    
    // JSON'u güncelle
    await fs.writeFile(getWatchlistPath(), JSON.stringify(watchlist, null, 2));
    
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
};

// İzleme listesini dışa aktar
const exportWatchlist = async (targetPath) => {
  try {
    // Watchlist dosyasının var olduğundan emin ol
    await ensureWatchlistExists();
    
    // Kaynak dosyayı oku
    const watchlistData = await fs.readFile(getWatchlistPath(), 'utf8');
    
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
};

// Modülü dışa aktar
module.exports = {
  getWatchlistPath,
  ensureWatchlistExists,
  getWatchlist,
  addToWatchlist,
  updateEpisodeStatus,
  updateContentRating,
  removeFromWatchlist,
  markAsWatched,
  exportWatchlist
}; 