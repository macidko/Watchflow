// Legacy compatibility file - redirects to new API structure
// Bu dosya geriye uyumluluk için korunmuştur
// Yeni projeler için src/api/index.js kullanın

import { searchAnime } from './index.js';

/**
 * @deprecated Use searchAnime from './index.js' instead
 * Anime araması yapar, fallback zinciri ile (AniList -> Kitsu -> Jikan)
 * @param {string} searchText
 * @returns {Promise<Array>} Anime sonuçları
 */
export async function searchAnimeWithFallback(searchText) {
  console.warn('searchAnimeWithFallback is deprecated. Use searchAnime from ./index.js instead');
  return searchAnime(searchText);
}

// Re-export new functions for convenience
export { 
  searchAnime,
  batchSearchAnime,
  getAnimeDetails,
  getAnimeSeasons
} from './index.js';
