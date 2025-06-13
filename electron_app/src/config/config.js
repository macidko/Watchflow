/**
 * Config Manager
 * Kullanıcı tercihlerini yönetir ve localStorage'da saklar
 */

// Varsayılan konfigürasyon
const defaultConfig = {
  // Uygulama dili (tr: Türkçe, en: İngilizce)
  language: 'tr',
  
  // Tema (default, light-theme, blue-theme, purple-theme)
  theme: 'default',
  
  // Bildirim ayarları
  notifications: {
    enabled: true,
    duration: 5000
  },
  
  // Yedekleme hatırlatıcısı
  backupReminder: {
    enabled: true,
    intervalDays: 30
  },
  
  // API ayarları
  api: {
    preferredAnimeSource: 'anilist', // anilist, kitsu, jikan
  },

  // API Temel URL'leri
  apiUrls: {
    tmdb: 'https://api.themoviedb.org/3',
    anilist: 'https://graphql.anilist.co',
    kitsu: 'https://kitsu.io/api/edge'
  },

  // Dış Bağlantılar
  externalLinks: {
    tmdbApiSettings: 'https://www.themoviedb.org/settings/api'
  },

  // Pencere Varsayılanları
  windowDefaults: {
    mainWindow: {
      width: 500,
      height: 900
    },
    settingsWindow: {
      width: 600,
      height: 650
    }
  },

  // Dosya Yolları (uygulama kök dizinine göre)
  paths: {
    languageDirectory: 'src/lang',
    watchlistFile: 'watchlist.json',      // İzleme listesi dosya adı
    backupInfoFile: 'backup_info.json'   // Yedekleme bilgi dosya adı
  },

  // Zaman Aşımları (milisaniye cinsinden)
  timeouts: {
    buttonReset: 2000,          // Hata/başarı sonrası buton sıfırlama süresi
    messageAutoHide: 3000,      // Mesajların otomatik gizlenme süresi
    longNotification: 8000      // Uzun süreli bildirimler için
  }
};

const Store = require('electron-store');
const store = new Store({
  encryptionKey: 'watchflow-app-secure-key'
});

// localStorage kullanımlarını değiştir
// Örnek:
const saveConfig = (config) => {
  try {
    store.set('watchflow_config', config);
    return true;
  } catch (error) {
    console.error('Config kaydedilirken hata:', error);
    return false;
  }
};

const loadConfig = () => {
  try {
    const savedConfig = store.get('watchflow_config');
    if (savedConfig) {
      return { ...defaultConfig, ...savedConfig };
    }
  } catch (error) {
    console.error('Config yüklenirken hata:', error);
  }
  return { ...defaultConfig };
};

// Mevcut config objesi
let currentConfig = loadConfig();

// Config modülü
const config = {
  // Tüm config'i döndür
  getAll: () => {
    return { ...currentConfig };
  },
  
  // Belirli bir ayarı getir
  get: (key) => {
    return currentConfig[key];
  },
  
  // Belirli bir ayarı güncelle
  set: (key, value) => {
    currentConfig[key] = value;
    saveConfig(currentConfig);
    return true;
  },
  
  // Bir nesne olarak birden fazla ayarı güncelle
  update: (newValues) => {
    currentConfig = { ...currentConfig, ...newValues };
    saveConfig(currentConfig);
    return true;
  },
  
  // Config'i varsayılan değerlere sıfırla
  reset: () => {
    currentConfig = { ...defaultConfig };
    saveConfig(currentConfig);
    return true;
  },
  
  // Dil ayarını güncelle
  setLanguage: (lang) => {
    if (lang === 'tr' || lang === 'en') {
      currentConfig.language = lang;
      saveConfig(currentConfig);
      return true;
    }
    return false;
  },
  
  // Mevcut dili getir
  getLanguage: () => {
    return currentConfig.language;
  }
};

// Config modülünü dışa aktar
module.exports = config; 