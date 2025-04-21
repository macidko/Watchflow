/**
 * JikanAPI - MyAnimeList verilerine erişmek için API wrapper'ı
 * API Dökümantasyon: https://docs.api.jikan.moe/
 */

// Jikan API URL'i
const JIKAN_API_BASE_URL = 'https://api.jikan.moe/v4';

/**
 * Anime araması yapar
 * @param {string} searchText - Aranacak anime adı
 * @returns {Promise<Array>} - Bulunan animelerin listesi
 */
const searchAnime = async (searchText) => {
  try {
    // API isteği yapmadan önce 1 saniye bekleyelim, rate limit'e dikkat etmek için
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const response = await fetch(`${JIKAN_API_BASE_URL}/anime?q=${encodeURIComponent(searchText)}&sfw=true`);
    
    if (!response.ok) {
      throw new Error(`Jikan API Hata: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Yalnızca gerekli alanları döndür
    return data.data.map(anime => ({
      id: anime.mal_id,
      title: anime.title,
      type: anime.type,
      imageUrl: anime.images?.jpg?.image_url || '',
      year: anime.aired?.from ? new Date(anime.aired.from).getFullYear() : null,
      score: anime.score
    }));
  } catch (error) {
    console.error('Anime araması sırasında hata:', error);
    throw error;
  }
};

/**
 * Belirli bir anime için sezon ve bölüm bilgilerini alır
 * @param {number} animeId - Anime ID (MyAnimeList ID)
 * @returns {Promise<Object>} - Sezon ve bölüm bilgileri
 */
const getAnimeSeasons = async (animeId) => {
  try {
    // API isteği yapmadan önce 1 saniye bekleyelim, rate limit'e dikkat etmek için
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Anime detaylarını al
    const animeResponse = await fetch(`${JIKAN_API_BASE_URL}/anime/${animeId}`);
    
    if (!animeResponse.ok) {
      throw new Error(`Jikan API Hata: ${animeResponse.status}`);
    }
    
    const animeData = await animeResponse.json();
    const anime = animeData.data;
    
    // Bölüm listesini al
    const episodesResponse = await fetch(`${JIKAN_API_BASE_URL}/anime/${animeId}/episodes`);
    
    if (!episodesResponse.ok) {
      throw new Error(`Jikan API Hata: ${episodesResponse.status}`);
    }
    
    const episodesData = await episodesResponse.json();
    
    // Anime için sezon bilgisi çoğunlukla tek sezondur, ancak bazı durumlarda sequel'ler olabilir
    // Bu durumda ana bilgiyi döndürüyoruz
    return {
      id: anime.mal_id,
      title: anime.title,
      totalEpisodes: anime.episodes,
      seasons: [
        {
          seasonNumber: 1,
          episodeCount: anime.episodes,
          episodes: episodesData.data.map(ep => ({
            episodeId: ep.mal_id,
            episodeNumber: ep.mal_id,
            title: ep.title,
            aired: ep.aired
          }))
        }
      ]
    };
  } catch (error) {
    console.error('Anime sezon bilgileri alınırken hata:', error);
    throw error;
  }
};

module.exports = {
  searchAnime,
  getAnimeSeasons
};
