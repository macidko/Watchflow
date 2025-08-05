import { ApiManager } from './ApiManager.js';
import { MediaTypes, ApiProviders } from './base/MediaTypes.js';

// Singleton instance
const apiManager = new ApiManager();

/**
 * Simple API Interface - Easy to use functions
 */

// ================== ANIME SEARCH ==================

/**
 * Anime arama fonksiyonu (AniList -> Kitsu -> Jikan fallback)
 * @param {string} query - Arama sorgusu
 * @param {Object} options - Arama seçenekleri
 * @returns {Promise<Array>} Anime sonuçları
 */
export const searchAnime = async (query, options = {}) => {
  const result = await apiManager.search(query, MediaTypes.ANIME, options);
  return result.results || [];
};

/**
 * Toplu anime arama fonksiyonu
 * @param {Array<string>} queries - Arama sorguları
 * @param {Object} options - Arama seçenekleri
 * @returns {Promise<Object>} Query -> Results mapping
 */
export const batchSearchAnime = async (queries, options = {}) => {
  return apiManager.batchSearch(queries, MediaTypes.ANIME, options);
};

/**
 * Anime detay bilgisi
 * @param {string|number} id - Anime ID'si
 * @param {string} provider - Belirli provider (opsiyonel)
 * @returns {Promise<Object>} Anime detayları
 */
export const getAnimeDetails = async (id, provider = null) => {
  return apiManager.getDetails(id, MediaTypes.ANIME, provider);
};

/**
 * Anime sezon/bölüm bilgileri
 * @param {string|number} id - Anime ID'si
 * @param {string} provider - Belirli provider (opsiyonel)
 * @returns {Promise<Array>} Sezon bilgileri
 */
export const getAnimeSeasons = async (id, provider = null) => {
  return apiManager.getSeasons(id, MediaTypes.ANIME, provider);
};

// ================== MOVIE SEARCH ==================

/**
 * Film arama fonksiyonu (TMDB)
 * @param {string} query - Arama sorgusu
 * @param {Object} options - Arama seçenekleri
 * @returns {Promise<Array>} Film sonuçları
 */
export const searchMovies = async (query, options = {}) => {
  const result = await apiManager.search(query, MediaTypes.MOVIE, options);
  return result.results || [];
};

/**
 * Film detay bilgisi
 * @param {string|number} id - Film ID'si
 * @param {string} provider - Belirli provider (opsiyonel)
 * @returns {Promise<Object>} Film detayları
 */
export const getMovieDetails = async (id, provider = null) => {
  return apiManager.getDetails(id, MediaTypes.MOVIE, provider);
};

// ================== TV SHOW SEARCH ==================

/**
 * TV şovu arama fonksiyonu (TMDB)
 * @param {string} query - Arama sorgusu
 * @param {Object} options - Arama seçenekleri
 * @returns {Promise<Array>} TV şovu sonuçları
 */
export const searchTvShows = async (query, options = {}) => {
  const result = await apiManager.search(query, MediaTypes.TV, options);
  return result.results || [];
};

/**
 * TV şovu detay bilgisi
 * @param {string|number} id - TV şovu ID'si
 * @param {string} provider - Belirli provider (opsiyonel)
 * @returns {Promise<Object>} TV şovu detayları
 */
export const getTvShowDetails = async (id, provider = null) => {
  return apiManager.getDetails(id, MediaTypes.TV, provider);
};

/**
 * TV şovu sezon ve bölüm bilgileri
 * @param {string|number} id - TV şovu ID'si
 * @param {string} provider - Belirli provider (opsiyonel)
 * @returns {Promise<Array>} Sezon ve bölüm bilgileri
 */
export const getTvShowSeasons = async (id, provider = null) => {
  return apiManager.getSeasons(id, MediaTypes.TV, provider);
};

// ================== MULTI SEARCH ==================

/**
 * Çoklu medya arama (film + anime)
 * @param {string} query - Arama sorgusu
 * @param {Object} options - Arama seçenekleri
 * @returns {Promise<Array>} Karma sonuçlar
 */
export const searchMultiMedia = async (query, options = {}) => {
  const result = await apiManager.search(query, MediaTypes.MULTI, options);
  return result.results || [];
};

// ================== ADVANCED FUNCTIONS ==================

/**
 * Belirli provider ile arama
 * @param {string} query - Arama sorgusu
 * @param {string} provider - Provider adı
 * @param {string} mediaType - Medya tipi
 * @param {Object} options - Arama seçenekleri
 * @returns {Promise<Array>} Sonuçlar
 */
export const searchWithProvider = async (query, provider, mediaType, options = {}) => {
  const result = await apiManager.searchWithProvider(provider, query, mediaType, options);
  return result.results || [];
};

/**
 * Tüm provider'lardan paralel arama (experimental)
 * @param {string} query - Arama sorgusu
 * @param {string} mediaType - Medya tipi
 * @param {Object} options - Arama seçenekleri
 * @returns {Promise<Object>} Provider -> Results mapping
 */
export const searchAllProviders = async (query, mediaType, options = {}) => {
  const providers = apiManager.getProvidersForMediaType(mediaType);
  const promises = providers.map(provider => 
    apiManager.searchWithProvider(provider, query, mediaType, options)
  );
  
  const results = await Promise.allSettled(promises);
  const output = {};
  
  results.forEach((result, index) => {
    const providerName = providers[index];
    if (result.status === 'fulfilled') {
      output[providerName] = result.value.results || [];
    } else {
      output[providerName] = [];
    }
  });
  
  return output;
};

// ================== UTILITY FUNCTIONS ==================

/**
 * API Manager konfigürasyonunu güncelle
 * @param {Object} config - Yeni konfigürasyon
 */
export const updateApiConfig = (config) => {
  apiManager.updateConfig(config);
};

/**
 * Mevcut konfigürasyonu al
 * @returns {Object} Mevcut konfigürasyon
 */
export const getApiConfig = () => {
  return apiManager.getConfig();
};

/**
 * Belirli medya tipi için kullanılabilir provider'ları al
 * @param {string} mediaType - Medya tipi
 * @returns {Array<string>} Provider listesi
 */
export const getAvailableProviders = (mediaType) => {
  return apiManager.getProvidersForMediaType(mediaType);
};

/**
 * Provider'ın kullanılabilir olup olmadığını kontrol et
 * @param {string} provider - Provider adı
 * @returns {boolean} Kullanılabilir mi
 */
export const isProviderAvailable = (provider) => {
  return apiManager.isProviderAvailable(provider);
};

// ================== LEGACY COMPATIBILITY ==================

/**
 * Eski animeSearch.js ile uyumluluk için
 * @deprecated Use searchAnime instead
 */
export const searchAnimeWithFallback = searchAnime;

/**
 * Eski tmdbApi.js ile uyumluluk için
 * @deprecated Use searchMovies or searchTvShows instead
 */
export const searchTMDBMedia = async (searchText, type = 'multi') => {
  const mediaType = type === 'movie' ? MediaTypes.MOVIE : 
                   type === 'tv' ? MediaTypes.TV : MediaTypes.MULTI;
  return searchWithProvider(searchText, ApiProviders.TMDB, mediaType);
};

/**
 * Eski tmdbApi.js ile uyumluluk için
 * @deprecated Use getTvShowSeasons instead
 */
export const getTvShowSeasons_Legacy = getTvShowSeasons;

// ================== EXPORTS ==================

// Export constants for external use
export { MediaTypes, ApiProviders } from './base/MediaTypes.js';

// Export ApiManager for advanced usage
export { ApiManager };

// Default export for convenience
export default {
  // Anime
  searchAnime,
  batchSearchAnime,
  getAnimeDetails,
  getAnimeSeasons,
  
  // Movies
  searchMovies,
  getMovieDetails,
  
  // TV Shows
  searchTvShows,
  getTvShowDetails,
  getTvShowSeasons,
  
  // Multi
  searchMultiMedia,
  
  // Advanced
  searchWithProvider,
  searchAllProviders,
  
  // Utility
  updateApiConfig,
  getApiConfig,
  getAvailableProviders,
  isProviderAvailable,
  
  // Constants
  MediaTypes,
  ApiProviders
};
