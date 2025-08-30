import trTranslations from './tr.json';
import enTranslations from './en.json';

// Mevcut diller
const translations = {
  tr: trTranslations,
  en: enTranslations
};

// Varsayılan dil - localStorage'dan al veya Türkçe kullan
const getDefaultLang = () => {
  const savedLang = localStorage.getItem('watchflow_language');
  return savedLang && translations[savedLang] ? savedLang : 'tr';
};

let currentLang = getDefaultLang();

/**
 * İç içe geçmiş obje anahtarlarına erişim için yardımcı fonksiyon
 * Örnek: get(obj, 'pages.home.title') 
 */
function get(obj, path) {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * Çeviri hook'u - i18n standardına uygun
 * @param {string} key - Çeviri anahtarı (örn: 'pages.home.title')
 * @param {object} params - Template parametreleri (örn: {count: 5})
 * @returns {string} Çevrilmiş metin
 */
export function useTranslation() {
  const t = (key, params = {}) => {
    const translation = get(translations[currentLang], key);
    
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return key; // Anahtar bulunamazsa, anahtarın kendisini döndür
    }

    // Template parametrelerini değiştir (örn: {count} -> params.count)
    if (typeof translation === 'string' && Object.keys(params).length > 0) {
      return translation.replace(/\{(\w+)\}/g, (match, paramKey) => {
        return params[paramKey] !== undefined ? params[paramKey] : match;
      });
    }

    return translation;
  };

  return { t };
}

// Direkt export da ekleyelim kolay kullanım için
export const t = (key, params = {}) => {
  const translation = get(translations[currentLang], key);
  
  if (!translation) {
    console.warn(`Translation missing for key: ${key}`);
    return key;
  }

  if (typeof translation === 'string' && Object.keys(params).length > 0) {
    return translation.replace(/\{(\w+)\}/g, (match, paramKey) => {
      return params[paramKey] !== undefined ? params[paramKey] : match;
    });
  }

  return translation;
};

// Dil değiştirme fonksiyonu
export const changeLanguage = (newLang) => {
  if (translations[newLang]) {
    currentLang = newLang;
    localStorage.setItem('watchflow_language', newLang);
  }
};

// Mevcut dili al
export const getCurrentLanguage = () => currentLang;

// Mevcut dilleri al  
export const getAvailableLanguages = () => Object.keys(translations);
