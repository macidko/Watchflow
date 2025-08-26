import trTranslations from './tr.json';

// Şu an sadece Türkçe var, gelecekte başka diller eklenebilir
const translations = {
  tr: trTranslations
};

// Varsayılan dil
const defaultLang = 'tr';

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
    const translation = get(translations[defaultLang], key);
    
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
  const translation = get(translations[defaultLang], key);
  
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
