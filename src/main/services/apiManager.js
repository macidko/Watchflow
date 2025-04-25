// API Yönetim Servisi
// API anahtarlarının yönetilmesi ve API isteklerinin yapılması

const Store = require('electron-store');
const dotenv = require('dotenv');
const path = require('path');

// API store'unu başlat
const store = new Store({
  name: 'watchflow-settings',
  encryptionKey: 'watchflow-app-secure-key',
});

// .env dosyasını yükle
const loadEnvFile = () => {
  try {
    const result = dotenv.config({ path: path.join(__dirname, '../../../.env') });
    if (result.error) {
      console.error('.env dosyası yüklenirken hata oluştu:', result.error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('.env dosyası yüklenirken beklenmeyen hata:', error);
    return false;
  }
};

// API anahtarlarını store'dan al ve çevre değişkenlerine ata
const loadApiKeys = () => {
  try {
    const tmdbKey = store.get('TMDB_API_KEY');
    
    if (!tmdbKey) {
      console.log('API anahtarları bulunamadı');
      return false;
    }
    
    // API anahtarlarını çevre değişkenlerine ata
    process.env.TMDB_API_KEY = tmdbKey;
    
    console.log('API anahtarları store\'dan yüklendi:');
    console.log('- TMDB_API_KEY:', process.env.TMDB_API_KEY ? 'Tanımlı' : 'Tanımlı değil');
    
    return true;
  } catch (error) {
    console.error('API anahtarları yüklenirken hata:', error);
    return false;
  }
};

// API anahtarlarını kaydet
const saveApiKeys = async (keys) => {
  try {
    // API anahtarlarını kaydet
    store.set('TMDB_API_KEY', keys.TMDB_API_KEY);
    
    // Çevre değişkenlerine de ata
    process.env.TMDB_API_KEY = keys.TMDB_API_KEY;
    
    return { success: true };
  } catch (error) {
    console.error('API anahtarı kaydedilirken hata:', error);
    return { success: false, error: error.message };
  }
};

// API anahtarlarını al
const getApiKeys = () => {
  try {
    return {
      TMDB_API_KEY: store.get('TMDB_API_KEY', '')
    };
  } catch (error) {
    console.error('API anahtarı okunurken hata:', error);
    return { TMDB_API_KEY: '' };
  }
};

// API anahtarlarının varlığını kontrol et
const checkApiKeys = () => {
  return loadApiKeys();
};

// API modüllerini yükle
const loadApiModules = () => {
  try {
    if (!process.env.TMDB_API_KEY) {
      return null;
    }
    
    // API modüllerini yükle
    const { tmdbApi, jikanApi } = require('../../api');
    return { tmdbApi, jikanApi };
  } catch (error) {
    console.error('API modülleri yüklenirken hata:', error);
    return null;
  }
};

// Modülü dışa aktar
module.exports = {
  loadEnvFile,
  loadApiKeys,
  saveApiKeys,
  getApiKeys,
  checkApiKeys,
  loadApiModules
}; 