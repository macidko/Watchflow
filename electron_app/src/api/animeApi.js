/**
 * Anime API Manager - Birden fazla API için fallback mekanizması
 */

// Tüm API'leri içe aktar
const anilistApi = require('./anilistApi');
const kitsuApi = require('./kitsuApi');
const jikanApi = require('./jikanApi');

/**
 * Fallback ile API fonksiyonunu çalıştır
 * 
 * @param {Function[]} apiFunctions Sırayla denenecek API fonksiyonları dizisi
 * @param {any[]} args Fonksiyonlara gönderilecek parametreler
 * @returns {Promise<any>} İlk başarılı sonuç
 */
async function runWithFallback(apiFunctions, args) {
  let lastError = null;
  
  // Her API'yi sırayla dene
  for (const apiFunction of apiFunctions) {
    try {
      console.log(`${apiFunction.name} çağrılıyor...`);
      // API fonksiyonunu çağır
      const result = await apiFunction(...args);
      console.log(`${apiFunction.name} başarılı`);
      return result;
    } catch (error) {
      console.log(`${apiFunction.name} başarısız oldu, alternatif deneniyor... Hata: ${error.message}`);
      lastError = error;
      // Hata durumunda bir sonraki API'ye geç
      continue;
    }
  }
  
  // Tüm API'ler başarısız olursa son hatayı fırlat
  console.error('Tüm API\'ler başarısız oldu');
  throw lastError || new Error('Tüm API\'ler başarısız oldu');
}

/**
 * Anime ara - Fallback mekanizmalı
 * @param {string} searchText Arama metni
 * @returns {Promise<Array>} Anime sonuçları
 */
async function searchAnime(searchText) {
  const apiFunctions = [
    anilistApi.searchAnime,
    kitsuApi.searchAnime,
    jikanApi.searchAnime
  ];
  
  return runWithFallback(apiFunctions, [searchText]);
}

/**
 * Birden fazla anime için toplu arama yap (batch search)
 * @param {string[]} searchTexts Aranacak başlıkların dizisi
 * @returns {Promise<Object>} Her başlık için bulunan sonuçlar
 */
async function batchSearchAnime(searchTexts) {
  if (!searchTexts || !Array.isArray(searchTexts) || searchTexts.length === 0) {
    return {};
  }
  
  // Sonuç objesi - Her başlık için sonuçları içerecek
  const results = {};
  
  try {
    // İlk olarak AniList batch API ile deneyelim
    console.log(`AniList batch search ile ${searchTexts.length} başlık aranıyor...`);
    const anilistResults = await anilistApi.batchSearchAnime(searchTexts)
      .catch(error => {
        console.error('AniList batch search hatası:', error.message);
        return {}; // Hata durumunda boş obje
      });
    
    // Bulunan sonuçları results objesine ekleyelim
    Object.assign(results, anilistResults);
    
    // AniList'te bulunamayan başlıkları topla
    const missingTitles = searchTexts.filter(title => 
      !results[title] || !results[title].length || results[title].length === 0
    );
    
    if (missingTitles.length > 0) {
      console.log(`${missingTitles.length} başlık AniList'te bulunamadı, Kitsu ile deneniyor...`);
      
      // Kitsu ile batch search deneyelim
      const kitsuResults = await kitsuApi.batchSearchAnime(missingTitles)
        .catch(error => {
          console.error('Kitsu batch search hatası:', error.message);
          return {}; // Hata durumunda boş obje
        });
      
      // Kitsu sonuçlarını ekle
      Object.assign(results, kitsuResults);
      
      // Hala bulunamayan başlıkları listele
      const stillMissingTitles = missingTitles.filter(title => 
        !results[title] || !results[title].length || results[title].length === 0
      );
      
      // Jikan ile tek tek arama yap (batch desteği yok)
      if (stillMissingTitles.length > 0) {
        console.log(`${stillMissingTitles.length} başlık hala bulunamadı, Jikan ile tek tek deneniyor...`);
        
        // Her başlık için Jikan API ile tek tek arama yap
        for (const title of stillMissingTitles) {
          console.log(`Jikan ile aranıyor: "${title}"`);
          
          try {
            // Rate limit ile mücadele için 1 saniye bekle
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Jikan ile ara
            const jikanResults = await jikanApi.searchAnime(title);
            
            // En iyi eşleşmeyi bul
            const bestMatch = findBestMatch(title, jikanResults);
            
            // Sonuçları ekle
            results[title] = bestMatch ? [bestMatch] : [];
          } catch (error) {
            console.error(`Jikan arama hatası (${title}):`, error.message);
            results[title] = []; // Hata durumunda boş dizi
          }
        }
      }
    }
    
    return results;
  } catch (error) {
    console.error('Batch search hatası:', error);
    throw error;
  }
}

/**
 * Bir başlık için en iyi eşleşmeyi bul
 * @param {string} searchText Aranan başlık
 * @param {Array} results Arama sonuçları
 * @returns {Object|null} En iyi eşleşen sonuç veya null
 */
function findBestMatch(searchText, results) {
  if (!results || results.length === 0) return null;
  
  const normalizedSearchText = searchText.toLowerCase().trim();
  
  // Tam eşleşme kontrolü
  for (const result of results) {
    const title = (result.title || "").toLowerCase().trim();
    const originalTitle = (result.original_title || "").toLowerCase().trim();
    
    if (title === normalizedSearchText || originalTitle === normalizedSearchText) {
      return result;
    }
  }
  
  // En iyi eşleşmeyi bul (ilk sonuç en popüler olduğu için genelde en iyi eşleşmedir)
  return results[0];
}

/**
 * Anime detaylarını al - Fallback mekanizmalı
 * @param {number|string} animeId Anime ID
 * @returns {Promise<Object>} Anime detayları
 */
async function getAnimeDetails(animeId) {
  const apiFunctions = [
    anilistApi.getAnimeDetails,
    kitsuApi.getAnimeDetails,
    jikanApi.getAnimeDetails
  ];
  
  return runWithFallback(apiFunctions, [animeId]);
}

/**
 * Anime sezon bilgilerini al - Fallback mekanizmalı
 * @param {number|string} animeId Anime ID
 * @returns {Promise<Object>} Sezon bilgileri
 */
async function getAnimeSeasons(animeId) {
  const apiFunctions = [
    anilistApi.getAnimeSeasons,
    kitsuApi.getAnimeSeasons,
    jikanApi.getAnimeSeasons
  ];
  
  return runWithFallback(apiFunctions, [animeId]);
}

/**
 * Anime ilişkilerini (sequel, prequel, vb.) al - Fallback mekanizmalı
 * @param {number|string} animeId Anime ID
 * @returns {Promise<Array>} İlişkili animeler
 */
async function getAnimeRelations(animeId) {
  // Kitsu API'de relations özelliği olmadığından sadece AniList ve Jikan kullanıyoruz
  const apiFunctions = [
    anilistApi.getAnimeRelations,
    jikanApi.getAnimeRelations
  ];
  
  return runWithFallback(apiFunctions, [animeId]);
}

// Orijinal API'leri ayrı ayrı dışa aktar
module.exports = {
  searchAnime,
  getAnimeDetails,
  getAnimeSeasons,
  getAnimeRelations,
  batchSearchAnime,
  // Doğrudan erişim için orijinal API'ler
  anilist: anilistApi,
  kitsu: kitsuApi,
  jikan: jikanApi
}; 