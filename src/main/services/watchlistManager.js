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

// Son yedekleme tarihini saklamak için dosya yolu
const getBackupInfoPath = () => {
  const isDevelopment = process.env.NODE_ENV === 'development' || process.argv.includes('--dev');
  return isDevelopment 
    ? path.join(__dirname, '../../../src/data/backup_info.json')
    : path.join(app.getPath('userData'), 'backup_info.json');
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
      
      // Dosya varsa, içeriğini oku ve yapıyı kontrol et
      const watchlistData = await fs.readFile(watchlistPath, 'utf8');
      let watchlist;
      
      try {
        watchlist = JSON.parse(watchlistData);
        let isModified = false;
        
        // Ana kategori alanlarını kontrol et
        const requiredCategories = ['movie', 'tv', 'anime'];
        requiredCategories.forEach(category => {
          if (!watchlist[category]) {
            watchlist[category] = [];
            isModified = true;
            console.log(`${category} kategorisi eksikti, oluşturuldu`);
          }
        });
        
        // Sliders yapısını kontrol et
        if (!watchlist.sliders) {
          watchlist.sliders = {
            movie: [
              {
                id: `movie-slider-${Date.now()}-1`,
                name: "İzleniyor",
                index: 0
              },
              {
                id: `movie-slider-${Date.now()}-2`,
                name: "İzlenecek",
                index: 1
              },
              {
                id: `movie-slider-${Date.now()}-3`,
                name: "İzlendi",
                index: 2
              }
            ],
            tv: [
              {
                id: `tv-slider-${Date.now()}-1`,
                name: "İzleniyor",
                index: 0
              },
              {
                id: `tv-slider-${Date.now()}-2`,
                name: "İzlenecek",
                index: 1
              },
              {
                id: `tv-slider-${Date.now()}-3`,
                name: "İzlendi",
                index: 2
              }
            ],
            anime: [
              {
                id: `anime-slider-${Date.now()}-1`,
                name: "İzleniyor",
                index: 0
              },
              {
                id: `anime-slider-${Date.now()}-2`,
                name: "İzlenecek",
                index: 1
              },
              {
                id: `anime-slider-${Date.now()}-3`,
                name: "İzlendi",
                index: 2
              }
            ]
          };
          isModified = true;
          console.log('sliders yapısı eksikti, varsayılan sliderlarla oluşturuldu');
        } 
        else if (Array.isArray(watchlist.sliders)) {
          // Eski yapıyı yeni yapıya dönüştür
          watchlist.sliders = {
            movie: [
              {
                id: `movie-slider-${Date.now()}-1`,
                name: "İzleniyor",
                index: 0
              },
              {
                id: `movie-slider-${Date.now()}-2`,
                name: "İzlenecek",
                index: 1
              },
              {
                id: `movie-slider-${Date.now()}-3`,
                name: "İzlendi",
                index: 2
              }
            ],
            tv: [
              {
                id: `tv-slider-${Date.now()}-1`,
                name: "İzleniyor",
                index: 0
              },
              {
                id: `tv-slider-${Date.now()}-2`,
                name: "İzlenecek",
                index: 1
              },
              {
                id: `tv-slider-${Date.now()}-3`,
                name: "İzlendi",
                index: 2
              }
            ],
            anime: [
              {
                id: `anime-slider-${Date.now()}-1`,
                name: "İzleniyor",
                index: 0
              },
              {
                id: `anime-slider-${Date.now()}-2`,
                name: "İzlenecek",
                index: 1
              },
              {
                id: `anime-slider-${Date.now()}-3`,
                name: "İzlendi",
                index: 2
              }
            ]
          };
          isModified = true;
          console.log('sliders yapısı eski formattaydı, varsayılan sliderlarla yeni formata dönüştürüldü');
        }
        else {
          // Sliders içindeki kategori alanlarını kontrol et
          requiredCategories.forEach(category => {
            if (!watchlist.sliders[category]) {
              watchlist.sliders[category] = [];
              isModified = true;
              console.log(`sliders.${category} kategorisi eksikti, oluşturuldu`);
            }
          });
        }
        
        // Eğer değişiklik yapıldıysa dosyayı güncelle
        if (isModified) {
          await fs.writeFile(watchlistPath, JSON.stringify(watchlist, null, 2), 'utf8');
          console.log('watchlist.json yapısı güncellendi');
        }
      } catch (error) {
        console.error('JSON ayrıştırma hatası, dosya yeniden oluşturuluyor:', error);
        // JSON ayrıştırılamadıysa, yeni bir dosya oluştur
        const emptyWatchlist = {
          movie: [],
          tv: [],
          anime: [],
          sliders: {
            movie: [
              {
                id: `movie-slider-${Date.now()}-1`,
                name: "İzleniyor",
                index: 0
              },
              {
                id: `movie-slider-${Date.now()}-2`,
                name: "İzlenecek",
                index: 1
              },
              {
                id: `movie-slider-${Date.now()}-3`,
                name: "İzlendi",
                index: 2
              }
            ],
            tv: [
              {
                id: `tv-slider-${Date.now()}-1`,
                name: "İzleniyor",
                index: 0
              },
              {
                id: `tv-slider-${Date.now()}-2`,
                name: "İzlenecek",
                index: 1
              },
              {
                id: `tv-slider-${Date.now()}-3`,
                name: "İzlendi",
                index: 2
              }
            ],
            anime: [
              {
                id: `anime-slider-${Date.now()}-1`,
                name: "İzleniyor",
                index: 0
              },
              {
                id: `anime-slider-${Date.now()}-2`,
                name: "İzlenecek",
                index: 1
              },
              {
                id: `anime-slider-${Date.now()}-3`,
                name: "İzlendi",
                index: 2
              }
            ]
          }
        };
        await fs.writeFile(watchlistPath, JSON.stringify(emptyWatchlist, null, 2), 'utf8');
        console.log(`watchlist.json dosyası yeniden oluşturuldu: ${watchlistPath}`);
      }
      
    } catch (error) {
      // Dosya yoksa oluştur - boş kategori yapısıyla
      const emptyWatchlist = {
        movie: [],
        tv: [],
        anime: [],
        sliders: {
          movie: [
            {
              id: `movie-slider-${Date.now()}-1`,
              name: "İzleniyor",
              index: 0
            },
            {
              id: `movie-slider-${Date.now()}-2`,
              name: "İzlenecek",
              index: 1
            },
            {
              id: `movie-slider-${Date.now()}-3`,
              name: "İzlendi",
              index: 2
            }
          ],
          tv: [
            {
              id: `tv-slider-${Date.now()}-1`,
              name: "İzleniyor",
              index: 0
            },
            {
              id: `tv-slider-${Date.now()}-2`,
              name: "İzlenecek",
              index: 1
            },
            {
              id: `tv-slider-${Date.now()}-3`,
              name: "İzlendi",
              index: 2
            }
          ],
          anime: [
            {
              id: `anime-slider-${Date.now()}-1`,
              name: "İzleniyor",
              index: 0
            },
            {
              id: `anime-slider-${Date.now()}-2`,
              name: "İzlenecek",
              index: 1
            },
            {
              id: `anime-slider-${Date.now()}-3`,
              name: "İzlendi",
              index: 2
            }
          ]
        }
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
    let watchlist = JSON.parse(watchlistData);
    
    // Sliders yapısını kontrol et
    if (watchlist.sliders && Array.isArray(watchlist.sliders)) {
      console.log('Eski slider yapısı tespit edildi, yeni yapıya dönüştürülüyor...');
      // Eski yapıyı yeni yapıya dönüştür
      watchlist.sliders = {
        movie: [],
        tv: [],
        anime: []
      };
      
      // Değişikliği kaydet
      await fs.writeFile(getWatchlistPath(), JSON.stringify(watchlist, null, 2), 'utf8');
      console.log('Slider yapısı güncellendi');
    }
    
    return watchlist;
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
    
    // Rating bilgisi varsa ekle (0 değeri de geçerli bir puan olduğu için 0 kontrolü de ekledik)
    if (item.rating !== undefined && item.rating !== null) {
      itemToSave.rating = item.rating;
      console.log(`${item.title} içeriğine ${item.rating} puanı ekleniyor`);
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

// İzleme listesine toplu içerik ekleme
const bulkAddToWatchlist = async (items) => {
  try {
    // Sonuç sayaçları
    let successCount = 0;
    let errorCount = 0;
    let errorMessages = [];
    
    console.log(`Toplu ekleme başlatılıyor: ${items.length} içerik eklenecek`);
    
    // Her bir öğe için addToWatchlist fonksiyonunu çağır
    for (const item of items) {
      try {
        console.log(`İçerik işleniyor: "${item.title}" (${item.type}), ID: ${item.id}, Puan: ${item.rating}`);
        const result = await addToWatchlist(item);
        if (result.success) {
          successCount++;
          console.log(`İçerik başarıyla eklendi: "${item.title}"`);
        } else {
          errorCount++;
          errorMessages.push(`${item.title}: ${result.error}`);
          console.error(`İçerik eklenemedi: "${item.title}" - Hata: ${result.error}`);
        }
      } catch (err) {
        errorCount++;
        errorMessages.push(`${item.title || 'Bilinmeyen içerik'}: ${err.message}`);
        console.error(`İçerik eklenirken istisna oluştu: "${item.title || 'Bilinmeyen içerik'}" - Hata: ${err.message}`);
      }
    }
    
    console.log(`Toplu ekleme tamamlandı: ${successCount} başarılı, ${errorCount} başarısız`);
    
    return {
      success: true,
      successCount,
      errorCount,
      errorMessages: errorMessages.length > 0 ? errorMessages : null
    };
  } catch (error) {
    console.error('Toplu içerik ekleme hatası:', error);
    return { 
      success: false, 
      successCount: 0,
      errorCount: items?.length || 0,
      error: error.message 
    };
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
      // Bu bölümü ekle
      if (!watchlist[category][itemIndex].watchedEpisodes.includes(episodeId)) {
        watchlist[category][itemIndex].watchedEpisodes.push(episodeId);
      }
      
      // Bu bölümden önceki tüm bölümleri de ekle
      if (watchlist[category][itemIndex].seasons) {
        for (const season of watchlist[category][itemIndex].seasons) {
          // Eğer sezon numarası seçili sezondan küçükse, bu sezonun tüm bölümlerini ekle
          if (season.seasonNumber < seasonNumber) {
            for (let i = 1; i <= season.episodeCount; i++) {
              const prevEpisodeId = `s${season.seasonNumber}e${i}`;
              if (!watchlist[category][itemIndex].watchedEpisodes.includes(prevEpisodeId)) {
                watchlist[category][itemIndex].watchedEpisodes.push(prevEpisodeId);
              }
            }
          }
          // Eğer aynı sezondaysak, seçili bölüme kadar olan bölümleri ekle
          else if (season.seasonNumber === seasonNumber) {
            for (let i = 1; i < episodeNumber; i++) {
              const prevEpisodeId = `s${seasonNumber}e${i}`;
              if (!watchlist[category][itemIndex].watchedEpisodes.includes(prevEpisodeId)) {
                watchlist[category][itemIndex].watchedEpisodes.push(prevEpisodeId);
              }
            }
          }
        }
      }
    } 
    // Eğer izlenmedi işaretlendiyse ve array'de varsa, çıkar
    else {
      const epIndex = watchlist[category][itemIndex].watchedEpisodes.indexOf(episodeId);
      if (epIndex !== -1) {
        watchlist[category][itemIndex].watchedEpisodes.splice(epIndex, 1);
      }
      
      // Bu bölümden sonraki tüm bölümleri de işareti kaldır
      // Çünkü bu bölümü izlemediyse sonrakileri de izlememiş olmalı
      if (watchlist[category][itemIndex].seasons) {
        for (const season of watchlist[category][itemIndex].seasons) {
          // Eğer sezon numarası seçili sezondan büyükse, bu sezonun tüm bölümlerinin işaretini kaldır
          if (season.seasonNumber > seasonNumber) {
            for (let i = 1; i <= season.episodeCount; i++) {
              const nextEpisodeId = `s${season.seasonNumber}e${i}`;
              const nextEpIndex = watchlist[category][itemIndex].watchedEpisodes.indexOf(nextEpisodeId);
              if (nextEpIndex !== -1) {
                watchlist[category][itemIndex].watchedEpisodes.splice(nextEpIndex, 1);
              }
            }
          }
          // Eğer aynı sezondaysak, seçili bölümden sonraki bölümlerin işaretini kaldır
          else if (season.seasonNumber === seasonNumber) {
            for (let i = episodeNumber + 1; i <= season.episodeCount; i++) {
              const nextEpisodeId = `s${seasonNumber}e${i}`;
              const nextEpIndex = watchlist[category][itemIndex].watchedEpisodes.indexOf(nextEpisodeId);
              if (nextEpIndex !== -1) {
                watchlist[category][itemIndex].watchedEpisodes.splice(nextEpIndex, 1);
              }
            }
          }
        }
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

// İzlendi olarak işaretle (artık renderer.js tarafından doğrudan yapılıyor)
const markAsWatched = async (data) => {
  // Bu fonksiyon artık kullanılmıyor, renderer.js'te direkt watchlist güncellemesi yapılıyor
  console.warn('markAsWatched fonksiyonu artık kullanımda değil. Renderer tarafında güncellemeler yapılıyor.');
  return { success: true };
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
    
    // Son yedekleme tarihini güncelle
    await setLastBackupDate();
    
    console.log(`İzleme listesi dışa aktarıldı: ${targetPath}`);
    return { success: true, path: targetPath };
  } catch (error) {
    console.error('İzleme listesi dışa aktarılırken hata:', error);
    return { success: false, error: error.message };
  }
};

// İzleme listesini güncelle
const updateWatchlist = async (watchlist) => {
  try {
    // JSON'u güncelle
    await fs.writeFile(getWatchlistPath(), JSON.stringify(watchlist, null, 2));
    return { success: true };
  } catch (error) {
    console.error('İzleme listesi güncelleme hatası:', error);
    return { success: false, error: error.message };
  }
};

// Son yedekleme tarihini al
const getLastBackupDate = async () => {
  try {
    const backupInfoPath = getBackupInfoPath();
    
    try {
      await fs.access(backupInfoPath);
    } catch (error) {
      // Dosya yoksa, boş bir bilgi dosyası oluştur
      await fs.writeFile(backupInfoPath, JSON.stringify({ lastBackupDate: null }), 'utf8');
      return null;
    }
    
    // Dosyayı oku
    const backupInfo = JSON.parse(await fs.readFile(backupInfoPath, 'utf8'));
    return backupInfo.lastBackupDate;
  } catch (error) {
    console.error('Son yedekleme tarihi alınırken hata:', error);
    return null;
  }
};

// Son yedekleme tarihini güncelle
const setLastBackupDate = async (date = new Date().toISOString()) => {
  try {
    const backupInfoPath = getBackupInfoPath();
    
    // Dosya yoksa, yeni bir dosya oluştur
    let backupInfo = { lastBackupDate: date };
    
    try {
      await fs.access(backupInfoPath);
      // Dosya varsa, içeriği oku ve güncelle
      backupInfo = JSON.parse(await fs.readFile(backupInfoPath, 'utf8'));
      backupInfo.lastBackupDate = date;
    } catch (error) {
      // Dosya yoksa, devam et ve yeni dosya oluştur
    }
    
    // Dosyayı güncelle
    await fs.writeFile(backupInfoPath, JSON.stringify(backupInfo, null, 2), 'utf8');
    return { success: true, lastBackupDate: date };
  } catch (error) {
    console.error('Son yedekleme tarihi güncellenirken hata:', error);
    return { success: false, error: error.message };
  }
};

// Modülü dışa aktar
module.exports = {
  getWatchlistPath,
  ensureWatchlistExists,
  getWatchlist,
  addToWatchlist,
  bulkAddToWatchlist,
  updateEpisodeStatus,
  updateContentRating,
  removeFromWatchlist,
  markAsWatched,
  exportWatchlist,
  updateWatchlist,
  getLastBackupDate,
  setLastBackupDate
}; 