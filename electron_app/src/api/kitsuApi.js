const config = require('../config/config');
const { sleep, findBestMatch } = require('./apiUtils');

/**
 * Kitsu API Service
 * https://kitsu.docs.apiary.io/
 */
const axios = require('axios');

// Kitsu API endpoint
const API_URL = config.get('apiUrls').kitsu;

// API istek ayarları
const API_CONFIG = {
  headers: {
    'Accept': 'application/vnd.api+json',
    'Content-Type': 'application/vnd.api+json'
  }
};

/**
 * Anime ara
 * @param {string} searchText Arama metni
 * @returns {Promise<Array>} Anime sonuçları
 */
async function searchAnime(searchText) {
  try {
    const response = await axios.get(`${API_URL}/anime`, {
      ...API_CONFIG,
      params: {
        'filter[text]': searchText,
        'page[limit]': 10,
        'sort': '-userCount'
      }
    });
    
    if (!response.data || !response.data.data || !Array.isArray(response.data.data)) {
      return [];
    }
    
    // Kitsu sonuçlarını uygulama formatına dönüştür
    return response.data.data.map(item => {
      const attrs = item.attributes;
      
      return {
        id: item.id,
        title: attrs.titles.ja_jp || attrs.titles.en_jp || attrs.canonicalTitle || attrs.titles.en,
        original_title: attrs.titles.ja_jp,
        type: 'anime',
        year: attrs.startDate ? new Date(attrs.startDate).getFullYear() : null,
        imageUrl: attrs.posterImage?.medium || attrs.posterImage?.original,
        score: attrs.averageRating ? parseFloat(attrs.averageRating) / 10 : null, // 100 üzerinden 10 üzerine çevir
        status: attrs.status,
        episodes: attrs.episodeCount
      };
    });
  } catch (error) {
    console.error('Kitsu anime arama hatası:', error);
    throw error;
  }
}

/**
 * Birden fazla anime için toplu arama yap
 * @param {string[]} searchTexts Aranacak başlıkların dizisi
 * @returns {Promise<Object>} Her başlık için bulunan sonuçları içeren obje
 */
async function batchSearchAnime(searchTexts) {
  if (!searchTexts || !Array.isArray(searchTexts) || searchTexts.length === 0) {
    return {};
  }
  
  try {
    const results = {};
    const batchSize = 5; // Rate limit'e takılmamak için daha küçük batch boyutu
    
    // Başlıkları batchSize kadar grupla
    for (let i = 0; i < searchTexts.length; i += batchSize) {
      const batch = searchTexts.slice(i, i + batchSize);
      
      // Bu grup için paralel aramalar
      const searchPromises = batch.map(searchText => {
        // Her istek için promise döndür
        return axios.get(`${API_URL}/anime`, {
          ...API_CONFIG,
          params: {
            'filter[text]': searchText,
            'page[limit]': 5,
            'sort': '-userCount'
          }
        })
        .then(response => {
          if (!response.data || !response.data.data || !Array.isArray(response.data.data)) {
            return { searchText, results: [] };
          }
          
          // Sonuçları normalize et
          const normalizedResults = response.data.data.map(item => {
            const attrs = item.attributes;
            
            return {
              id: item.id,
              title: attrs.titles.ja_jp || attrs.titles.en_jp || attrs.canonicalTitle || attrs.titles.en,
              original_title: attrs.titles.ja_jp,
              type: 'anime',
              year: attrs.startDate ? new Date(attrs.startDate).getFullYear() : null,
              imageUrl: attrs.posterImage?.medium || attrs.posterImage?.original,
              score: attrs.averageRating ? parseFloat(attrs.averageRating) / 10 : null,
              status: attrs.status,
              episodes: attrs.episodeCount
            };
          });
          
          // En iyi eşleşmeyi bul
          const bestMatch = findBestMatch(searchText, normalizedResults);
          
          return { 
            searchText, 
            results: bestMatch ? [bestMatch] : []
          };
        })
        .catch(error => {
          console.error(`Kitsu arama hatası (${searchText}):`, error);
          return { searchText, results: [] };
        });
      });
      
      // Aynı anda batchSize kadar istek yap
      const batchResults = await Promise.all(searchPromises);
      
      // Sonuçları results objesine ekle
      batchResults.forEach(({ searchText, results: searchResults }) => {
        results[searchText] = searchResults;
      });
      
      // Bir sonraki batch'e geçmeden önce rate limit'e takılmamak için bekle
      if (i + batchSize < searchTexts.length) {
        await sleep(1000);
      }
    }
    
    return results;
  } catch (error) {
    console.error('Kitsu batch search hatası:', error);
    throw error;
  }
}



/**
 * Anime detaylarını al
 * @param {number|string} animeId Anime ID
 * @returns {Promise<Object>} Anime detayları
 */
async function getAnimeDetails(animeId) {
  try {
    const response = await axios.get(`${API_URL}/anime/${animeId}`, API_CONFIG);
    
    if (!response.data || !response.data.data || !response.data.data.attributes) {
      throw new Error('Anime detayları alınamadı');
    }
    
    const anime = response.data.data;
    const attrs = anime.attributes;
    
    // Kitsu verilerini uygulama formatına dönüştür
    return {
      id: anime.id,
      title: attrs.titles.ja_jp || attrs.titles.en_jp || attrs.canonicalTitle || attrs.titles.en,
      original_title: attrs.titles.ja_jp,
      native_title: attrs.titles.ja_jp,
      overview: attrs.synopsis,
      imageUrl: attrs.posterImage?.large || attrs.posterImage?.medium,
      backdrop_path: attrs.coverImage?.large || attrs.coverImage?.original,
      year: attrs.startDate ? new Date(attrs.startDate).getFullYear() : null,
      score: attrs.averageRating ? parseFloat(attrs.averageRating) / 10 : null,
      status: attrs.status,
      totalEpisodes: attrs.episodeCount,
      genres: [], // Kitsu kategoriler için ayrı bir istek gerekiyor, basitlik için boş bırakıyoruz
      episodeLength: attrs.episodeLength
    };
  } catch (error) {
    console.error('Kitsu anime detay hatası:', error);
    throw error;
  }
}

/**
 * Anime sezon bilgilerini al (Kitsu'da sezon kavramı farklı olduğundan basitleştirildi)
 * @param {number|string} animeId Anime ID
 * @returns {Promise<Object>} Sezon bilgileri
 */
async function getAnimeSeasons(animeId) {
  try {
    const details = await getAnimeDetails(animeId);
    
    if (!details) {
      throw new Error('Anime detayları alınamadı');
    }
    
    // Kitsu'da direkt sezon bilgisi olmadığından, bölüm bilgilerinden tahmin ediyoruz
    const episodes = details.totalEpisodes || 0;
    
    const seasons = [{
      seasonNumber: 1,
      episodeCount: episodes,
      name: details.title
    }];
    
    return {
      id: animeId,
      title: details.title,
      totalSeasons: 1,
      seasons: seasons
    };
  } catch (error) {
    console.error('Kitsu sezon bilgisi hatası:', error);
    throw error;
  }
}

module.exports = {
  searchAnime,
  getAnimeDetails,
  getAnimeSeasons,
  batchSearchAnime
}; 