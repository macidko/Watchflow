/**
 * i18n (Internationalization) Module
 * Çoklu dil desteği sağlar ve config sistemi ile entegre çalışır
 */

const config = require('../config/config');
const trTranslations = require('../lang/tr.json');
const enTranslations = require('../lang/en.json');

// Tüm desteklenen diller ve çevirilerini içeren obje
const translations = {
  tr: trTranslations,
  en: enTranslations
};

// Varsayılan dili kontrol etmek için
const isValidLanguage = (lang) => {
  return translations[lang] !== undefined;
};

/**
 * Belirtilen dil için bir anahtar yolundaki değeri bulur (nested objeleri destekler)
 * Örnek: get('errors.notFound') => errors.notFound değerini döndürür
 * 
 * @param {string} path Nokta ile ayrılmış anahtar yolu
 * @param {string} lang Dil kodu (tr, en)
 * @param {object} params Çeviride kullanılacak parametreler (varsa)
 * @returns {string} Çevrilmiş metin
 */
const getTranslation = (path, lang, params = {}) => {
  // Dil parametresi verilmemişse config'den al
  const currentLang = lang || config.getLanguage() || 'tr';
  
  // Dil geçerli değilse varsayılan 'tr' kullan
  const validLang = isValidLanguage(currentLang) ? currentLang : 'tr';
  
  // Anahtar yolunu parçalara ayır
  const keys = path.split('.');
  
  // Çeviri nesnesinden değeri bul
  let value = translations[validLang];
  
  // Her bir anahtar seviyesini kontrol et
  for (const key of keys) {
    if (value && value[key] !== undefined) {
      value = value[key];
    } else {
      // Çeviri bulunamadı
      console.warn(`Translation not found: ${path} (${validLang})`);
      
      // Diğer dillerde var mı kontrol et
      for (const fallbackLang in translations) {
        if (fallbackLang !== validLang) {
          let fallbackValue = translations[fallbackLang];
          let found = true;
          
          for (const fallbackKey of keys) {
            if (fallbackValue && fallbackValue[fallbackKey] !== undefined) {
              fallbackValue = fallbackValue[fallbackKey];
            } else {
              found = false;
              break;
            }
          }
          
          if (found) {
            console.info(`Using fallback translation from ${fallbackLang}: ${path}`);
            value = fallbackValue;
            break;
          }
        }
      }
      
      // Yine bulunamadıysa path'i döndür
      if (value === undefined || value === null || typeof value !== 'string') {
        return path;
      }
    }
  }
  
  // Value hala bir nesne ise (son anahtar bir grup)
  if (typeof value === 'object') {
    return path;
  }
  
  // Varsa parametreleri değiştir
  let result = value;
  if (params && typeof params === 'object') {
    Object.keys(params).forEach(key => {
      const placeholder = `{{${key}}}`;
      result = result.replace(new RegExp(placeholder, 'g'), params[key]);
    });
  }
  
  return result;
};

/**
 * Çeviri yardımcı fonksiyonu (alias: getTranslation)
 * Usage: t('general.save') => "Kaydet" veya "Save" (dile göre)
 */
const t = getTranslation;

/**
 * Dili değiştirir ve config'e kaydeder
 * @param {string} lang Dil kodu (tr, en)
 * @returns {boolean} Başarılı ise true, değilse false
 */
const setLanguage = (lang) => {
  if (isValidLanguage(lang)) {
    config.setLanguage(lang);
    
    // Event sistemi varsa bir dil değişikliği eventi tetikleyebiliriz
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('language-changed', { detail: { language: lang } });
      window.dispatchEvent(event);
    }
    
    return true;
  }
  
  return false;
};

/**
 * Mevcut dil kodunu döndürür
 * @returns {string} Dil kodu (tr, en)
 */
const getLanguage = () => {
  return config.getLanguage() || 'tr';
};

/**
 * Desteklenen tüm dilleri döndürür
 * @returns {object} Dil kodları ve isimlerini içeren obje
 */
const getSupportedLanguages = () => {
  return {
    tr: "Türkçe",
    en: "English"
  };
};

// i18n modülünü dışa aktar
module.exports = {
  t,
  getTranslation,
  setLanguage,
  getLanguage,
  getSupportedLanguages,
  translations
}; 