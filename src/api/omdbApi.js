/**
 * OMDB API - Film ve dizi verilerine erişmek için API wrapper'ı
 * API Dökümantasyon: http://www.omdbapi.com/
 */

// OMDB API URL'i ve API Key'i
const OMDB_API_BASE_URL = 'http://www.omdbapi.com/';
// OMDB için bir API anahtarı gerekli, bu değeri kendi anahtarınızla değiştirin
const OMDB_API_KEY = process.env.OMDB_API_KEY; 

/**
 * Film veya dizi araması yapar
 * @param {string} searchText - Aranacak film veya dizi adı
 * @param {string} type - Arama tipi ('movie', 'series', 'episode', 'all')
 * @returns {Promise<Array>} - Bulunan içeriklerin listesi
 */
const searchMedia = async (searchText, type = 'all') => {
  try {
    // Type parametresini API formatına çevir
    const apiType = type === 'all' ? '' : `&type=${type}`;
    
    const response = await fetch(`${OMDB_API_BASE_URL}?apikey=${OMDB_API_KEY}&s=${encodeURIComponent(searchText)}${apiType}`);
    
    if (!response.ok) {
      throw new Error(`OMDB API Hata: ${response.status}`);
    }
    
    const data = await response.json();
    
    // API hata döndürürse
    if (data.Response === 'False') {
      return [];
    }
    
    // Yalnızca gerekli alanları döndür
    return data.Search.map(item => ({
      id: item.imdbID,
      title: item.Title,
      type: item.Type,
      year: item.Year,
      imageUrl: item.Poster !== 'N/A' ? item.Poster : ''
    }));
  } catch (error) {
    console.error('OMDB araması sırasında hata:', error);
    throw error;
  }
};

/**
 * Belirli bir dizi için sezon ve bölüm bilgilerini alır
 * @param {string} imdbId - IMDB ID
 * @returns {Promise<Object>} - Sezon ve bölüm bilgileri
 */
const getSeriesSeasons = async (imdbId) => {
  try {
    // Önce dizi hakkında temel bilgileri alalım
    const seriesResponse = await fetch(`${OMDB_API_BASE_URL}?apikey=${OMDB_API_KEY}&i=${imdbId}&plot=short`);
    
    if (!seriesResponse.ok) {
      throw new Error(`OMDB API Hata: ${seriesResponse.status}`);
    }
    
    const seriesData = await seriesResponse.json();
    
    // API hata döndürürse veya film ise (sezonlar için dizi olmalı)
    if (seriesData.Response === 'False' || seriesData.Type !== 'series') {
      throw new Error('Geçersiz IMDB ID veya film tipi');
    }
    
    // Toplam sezon sayısını alalım
    const totalSeasons = parseInt(seriesData.totalSeasons) || 0;
    
    // Her sezon için bölüm bilgilerini toplayalım
    const seasons = [];
    
    for (let seasonNum = 1; seasonNum <= totalSeasons; seasonNum++) {
      const seasonResponse = await fetch(`${OMDB_API_BASE_URL}?apikey=${OMDB_API_KEY}&i=${imdbId}&Season=${seasonNum}`);
      
      if (!seasonResponse.ok) {
        console.warn(`${seasonNum}. sezon bilgileri alınamadı`);
        continue;
      }
      
      const seasonData = await seasonResponse.json();
      
      if (seasonData.Response === 'False') {
        console.warn(`${seasonNum}. sezon bilgileri bulunamadı`);
        continue;
      }
      
      const episodes = seasonData.Episodes.map(ep => ({
        episodeId: ep.imdbID,
        episodeNumber: parseInt(ep.Episode),
        title: ep.Title,
        released: ep.Released
      }));
      
      seasons.push({
        seasonNumber: seasonNum,
        episodeCount: episodes.length,
        episodes: episodes
      });
    }
    
    return {
      id: seriesData.imdbID,
      title: seriesData.Title,
      totalSeasons: totalSeasons,
      seasons: seasons
    };
  } catch (error) {
    console.error('Dizi sezon bilgileri alınırken hata:', error);
    throw error;
  }
};

module.exports = {
  searchMedia,
  getSeriesSeasons
};
