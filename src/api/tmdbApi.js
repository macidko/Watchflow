/**
 * TMDB API - Film ve dizi verilerine erişmek için API wrapper'ı
 * API Dökümantasyon: https://developers.themoviedb.org/3
 */

// TMDB API URL'i
const TMDB_API_BASE_URL = 'https://api.themoviedb.org/3';
// API anahtarını çevre değişkeninden al
const TMDB_API_KEY = process.env.TMDB_API_KEY;

// API anahtarını kontrol et
if (!TMDB_API_KEY) {
  console.error('TMDB API anahtarı bulunamadı! process.env içinde anahtar yok.');
  console.error('process.env değerlerinin bir kısmı:', Object.keys(process.env).slice(0, 10).join(', '));
} else {
  console.log('TMDB API anahtarı yüklendi (tmdbApi.js):', TMDB_API_KEY.substring(0, 6) + '...');
}

/**
 * Film veya dizi araması yapar
 * @param {string} searchText - Aranacak film veya dizi adı
 * @param {string} type - Arama tipi ('movie', 'tv', 'multi')
 * @param {string} [apiKey] - Opsiyonel API anahtarı
 * @returns {Promise<Array>} - Bulunan içeriklerin listesi
 */
const searchMedia = async (searchText, type = 'multi', apiKey = TMDB_API_KEY) => {
  try {
    // API anahtarı kontrolü
    if (!apiKey) {
      throw new Error('TMDB API anahtarı tanımlanmamış. Lütfen .env dosyasını kontrol edin.');
    }
    
    // API endpoint'i belirle
    let endpoint = '/search/multi';
    
    if (type === 'movie') {
      endpoint = '/search/movie';
    } else if (type === 'tv') {
      endpoint = '/search/tv';
    }
    
    const response = await fetch(
      `${TMDB_API_BASE_URL}${endpoint}?api_key=${apiKey}&query=${encodeURIComponent(searchText)}&language=en-US`
    );
    
    if (!response.ok) {
      throw new Error(`TMDB API Hata: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Yalnızca gerekli alanları döndür
    return data.results.map(item => {
      // Ortak alanları hazırla
      const result = {
        id: item.id,
        title: item.title || item.name,
        type: item.media_type || type,
        overview: item.overview,
        year: item.release_date ? new Date(item.release_date).getFullYear() : 
              item.first_air_date ? new Date(item.first_air_date).getFullYear() : null,
        imageUrl: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
        backdropUrl: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : null,
        voteAverage: item.vote_average
      };
      
      return result;
    });
  } catch (error) {
    console.error('TMDB araması sırasında hata:', error);
    throw error;
  }
};

/**
 * Belirli bir TV şovu için sezon ve bölüm bilgilerini alır
 * @param {number} tvId - TMDB TV şovu ID'si
 * @param {string} [apiKey] - Opsiyonel API anahtarı
 * @returns {Promise<Object>} - Sezon ve bölüm bilgileri
 */
const getTvShowSeasons = async (tvId, apiKey = TMDB_API_KEY) => {
  try {
    // API anahtarı kontrolü
    if (!apiKey) {
      throw new Error('TMDB API anahtarı tanımlanmamış. Lütfen .env dosyasını kontrol edin.');
    }
    
    // TV şovunun detaylarını al
    const showResponse = await fetch(
      `${TMDB_API_BASE_URL}/tv/${tvId}?api_key=${apiKey}&language=en-US`
    );
    
    if (!showResponse.ok) {
      throw new Error(`TMDB API Hata: ${showResponse.status}`);
    }
    
    const showData = await showResponse.json();
    
    // Sezon bilgilerini toplayalım
    const seasons = [];
    
    for (const season of showData.seasons) {
      // Özel bölümler ve kısa sezonları atla (isteğe bağlı)
      if (season.season_number === 0 || season.episode_count < 1) {
        continue;
      }
      
      // Her sezon için detaylı bölüm bilgilerini alalım
      const seasonResponse = await fetch(
        `${TMDB_API_BASE_URL}/tv/${tvId}/season/${season.season_number}?api_key=${apiKey}&language=en-US`
      );
      
      if (!seasonResponse.ok) {
        console.warn(`Sezon ${season.season_number} bilgileri alınamadı`);
        continue;
      }
      
      const seasonData = await seasonResponse.json();
      
      // Bölüm bilgilerini hazırla
      const episodes = seasonData.episodes.map(ep => ({
        episodeId: ep.id,
        episodeNumber: ep.episode_number,
        title: ep.name,
        overview: ep.overview,
        stillUrl: ep.still_path ? `https://image.tmdb.org/t/p/original${ep.still_path}` : null,
        airDate: ep.air_date,
        voteAverage: ep.vote_average
      }));
      
      seasons.push({
        seasonNumber: season.season_number,
        seasonName: season.name,
        episodeCount: episodes.length,
        overview: season.overview,
        posterUrl: season.poster_path ? `https://image.tmdb.org/t/p/w500${season.poster_path}` : null,
        airDate: season.air_date,
        episodes: episodes
      });
    }
    
    return {
      id: showData.id,
      title: showData.name,
      overview: showData.overview,
      posterUrl: showData.poster_path ? `https://image.tmdb.org/t/p/w500${showData.poster_path}` : null,
      backdropUrl: showData.backdrop_path ? `https://image.tmdb.org/t/p/original${showData.backdrop_path}` : null,
      totalSeasons: seasons.length,
      seasons: seasons
    };
  } catch (error) {
    console.error('TV şovu sezon bilgileri alınırken hata:', error);
    throw error;
  }
};

module.exports = {
  searchMedia,
  getTvShowSeasons
};
