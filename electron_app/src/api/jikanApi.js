/**
 * JikanAPI - MyAnimeList verilerine erişmek için API wrapper'ı
 * API Dökümantasyon: https://docs.api.jikan.moe/
 */

const axios = require('axios');
const { sleep } = require('./apiUtils');

// Jikan API URL'i
const JIKAN_API_BASE_URL = 'https://api.jikan.moe/v4';

// Rate limit delay (1 second between requests)
const API_DELAY = 1000;

/**
 * Retry mekanizması ile API isteği yap
 * @param {string} url - API endpoint URL'i
 * @param {Object} options - Fetch options
 * @param {number} maxRetries - Maksimum deneme sayısı
 * @returns {Promise<Object>} - API yanıtı
 */
const fetchWithRetry = async (url, options = {}, maxRetries = 3) => {
  let retries = 0;
  let lastError;

  while (retries <= maxRetries) {
    try {
      // İlk denemeden sonra beklemeler artsın
      if (retries > 0) {
        // Exponential backoff: 4s, 8s, 16s...
        const delay = 4000 * Math.pow(2, retries - 1);
        console.log(`Jikan API yeniden deneniyor (${retries}/${maxRetries}), ${delay}ms bekleniyor...`);
        await sleep(delay);
      }

      const response = await fetch(url, options);
      
      // Rate limit kontrolü
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After') || 5;
        console.warn(`Jikan API rate limit aşıldı. ${retryAfter} saniye bekleniyor...`);
        await sleep(parseInt(retryAfter) * 1000 || 5000);
        retries++;
        continue;
      }
      
      if (!response.ok) {
        throw new Error(`Jikan API Hata: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      lastError = error;
      console.warn(`Jikan API istek hatası (${retries}/${maxRetries}): ${error.message}`);
      
      // Bağlantı hatası veya timeout gibi durumlarda retry
      if (error.name === 'TypeError' || error.message.includes('timeout')) {
        retries++;
        continue;
      }
      
      // API 429 hatası için özel durum
      if (error.message.includes('429')) {
        retries++;
        await sleep(5000 * retries); // Artan bekleme süresi
        continue;
      }
      
      // Diğer API hataları için (403, 404, 500, vb) yeniden deneme
      if (error.message.includes('Jikan API Hata')) {
        retries++;
        await sleep(2000 * retries);
        continue;
      }
      
      // Diğer hatalar için direkt fırlat
      throw error;
    }
  }
  
  // Maksimum deneme sayısına ulaşıldı
  throw lastError || new Error('Jikan API maksimum deneme sayısına ulaşıldı');
};

/**
 * Anime araması yapar
 * @param {string} searchText - Aranacak anime adı
 * @returns {Promise<Array>} - Bulunan animelerin listesi
 */
const searchAnime = async (searchText) => {
  try {
    // API isteği yapmadan önce bekleyelim, rate limit'e dikkat etmek için
    await sleep(1000);
    
    const data = await fetchWithRetry(
      `${JIKAN_API_BASE_URL}/anime?q=${encodeURIComponent(searchText)}&sfw=true`
    );
    
    if (!data || !data.data || !Array.isArray(data.data)) {
      console.warn('Jikan API beklenmeyen yanıt formatı:', data);
      return [];
    }
    
    // Sonuçları dönüştür
    return data.data.map(anime => ({
      id: anime.mal_id,
      title: anime.title_japanese || anime.title,
      original_title: anime.title_japanese || anime.title,
      type: 'anime',
      imageUrl: anime.images?.jpg?.image_url || null,
      year: anime.aired?.from ? new Date(anime.aired.from).getFullYear() : null,
      score: anime.score,
      status: anime.status,
      episodes: anime.episodes,
      synopsis: anime.synopsis
    }));
  } catch (error) {
    console.error('Anime araması sırasında bir hata oluştu:', error);
    throw new Error(`Anime araması sırasında bir hata oluştu: ${error.message}`);
  }
};

/**
 * Anime sezon bilgilerini al
 * @param {number} animeId - Anime ID
 * @returns {Promise<Object>} - Sezon bilgileri
 */
const getAnimeSeasons = async (animeId) => {
  try {
    // API isteği yapmadan önce bekleyelim
    await sleep(1000);
    
    const data = await fetchWithRetry(
      `${JIKAN_API_BASE_URL}/anime/${animeId}/episodes`
    );
    
    if (!data || !data.data) {
      console.warn('Jikan API beklenmeyen yanıt formatı:', data);
      return [];
    }
    
    // Bölüm sayısı
    const episodeCount = data.data.length;
    
    // Tüm sezon bilgilerini getir
    const seasonData = {
      seasonNumber: 1, // Varsayılan olarak 1. sezon
      episodeCount: episodeCount,
      episodes: data.data.map(episode => ({
        number: episode.mal_id,
        title: episode.title,
        aired: episode.aired
      }))
    };
    
    return [seasonData]; // Bir dizi olarak döndür (çoklu sezon desteği için)
  } catch (error) {
    console.error('Anime sezon bilgileri alınırken hata:', error);
    throw new Error(`Anime sezon bilgileri alınırken hata: ${error.message}`);
  }
};

/**
 * Anime detaylarını al
 * @param {number} animeId - Anime ID
 * @returns {Promise<Object>} - Anime detayları
 */
const getAnimeDetails = async (animeId) => {
  try {
    // API isteği yapmadan önce bekleyelim
    await sleep(1000);
    
    const data = await fetchWithRetry(
      `${JIKAN_API_BASE_URL}/anime/${animeId}/full`
    );
    
    if (!data || !data.data) {
      console.warn('Jikan API beklenmeyen yanıt formatı:', data);
      return null;
    }
    
    const anime = data.data;
    
    // Detayları dönüştür
    return {
      id: anime.mal_id,
      title: anime.title_japanese || anime.title,
      original_title: anime.title_japanese || anime.title,
      type: 'anime',
      imageUrl: anime.images?.jpg?.image_url || null,
      year: anime.aired?.from ? new Date(anime.aired.from).getFullYear() : null,
      score: anime.score,
      status: anime.status,
      episodes: anime.episodes,
      synopsis: anime.synopsis,
      genres: anime.genres?.map(g => g.name) || [],
      studios: anime.studios?.map(s => s.name) || [],
      duration: anime.duration,
      rating: anime.rating,
      popularity: anime.popularity,
      members: anime.members,
      favorites: anime.favorites,
      season: anime.season,
      year: anime.year
    };
  } catch (error) {
    console.error('Anime detayları alınırken hata:', error);
    throw new Error(`Anime detayları alınırken hata: ${error.message}`);
  }
};

/**
 * Anime ilişkilerini al (sequel, prequel, vb.)
 * 
 * @param {number|string} animeId Anime ID
 * @returns {Promise<Array>} İlişkili anime bilgilerinin Array'i
 */
async function getAnimeRelations(animeId) {
  try {
    // Anime ilişkileri endpoint'i
    const endpoint = `${JIKAN_API_BASE_URL}/anime/${animeId}/relations`;
    
    console.log(`Jikan API Anime İlişkileri isteği: ${endpoint}`);
    
    // Hız sınırlaması için bekle
    console.log(`Jikan API hız sınırı için bekleniyor (${API_DELAY}ms)...`);
    await new Promise(resolve => setTimeout(resolve, API_DELAY));
    
    // İstekteki son şansımız bu olduğundan retry ile deniyoruz
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount <= maxRetries) {
      try {
        const response = await axios.get(endpoint);
        
        if (!response.data || !response.data.data) {
          console.warn('Jikan API anime ilişkileri yanıtı boş veya eksik');
          return [];
        }
        
        // İlişkili anime bilgilerini gruplandır
        const relationGroups = {};
        
        // Jikan API yanıtını dolaş
        for (const relation of response.data.data) {
          const relationType = relation.relation.toUpperCase().replace(/\s+/g, '_');
          
          if (!relationGroups[relationType]) {
            relationGroups[relationType] = [];
          }
          
          // İlişkili animeleri dolaş
          for (const entry of relation.entry) {
            // Sadece anime türünde olanları al
            if (entry.type === 'anime') {
              relationGroups[relationType].push({
                id: entry.mal_id,
                title: entry.name,
                type: 'anime',
                imageUrl: entry.images?.jpg?.image_url
              });
            }
          }
        }
        
        // Boş grupları kaldır
        Object.keys(relationGroups).forEach(key => {
          if (relationGroups[key].length === 0) {
            delete relationGroups[key];
          }
        });
        
        // AniList API formatına dönüştür
        const formattedRelations = Object.entries(relationGroups).map(([relation, entries]) => ({
          relation,
          entries
        }));
        
        return formattedRelations;
      } catch (error) {
        retryCount++;
        console.error(`Jikan API anime ilişkileri hatası (deneme ${retryCount}/${maxRetries}):`, error.message);
        
        if (retryCount <= maxRetries) {
          const delayMs = API_DELAY * retryCount;
          console.log(`${delayMs}ms bekleyip tekrar denenecek...`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
        } else {
          throw error;
        }
      }
    }
  } catch (error) {
    console.error('Jikan API anime ilişkileri getirme hatası:', error);
    throw error;
  }
}

// API modülü olarak dışa aktar
module.exports = {
  searchAnime,
  getAnimeSeasons,
  getAnimeDetails,
  getAnimeRelations
};
