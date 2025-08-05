/**
 * API Usage Examples
 * Yeni API yapısının nasıl kullanılacağını gösteren örnekler
 */

import { 
  searchAnime, 
  searchMovies, 
  searchTvShows,
  batchSearchAnime,
  getAnimeDetails,
  getTvShowSeasons,
  searchWithProvider,
  MediaTypes,
  ApiProviders
} from './index.js';

// =================  TEMEL KULLANIM =================

/**
 * Basit anime arama
 */
export async function basicAnimeSearch() {
  try {
    const results = await searchAnime('Naruto');
    console.log('Anime search results:', results);
    return results;
  } catch (error) {
    console.error('Anime search failed:', error);
    return [];
  }
}

/**
 * Film arama
 */
export async function basicMovieSearch() {
  try {
    const results = await searchMovies('Inception');
    console.log('Movie search results:', results);
    return results;
  } catch (error) {
    console.error('Movie search failed:', error);
    return [];
  }
}

/**
 * TV şovu arama
 */
export async function basicTvSearch() {
  try {
    const results = await searchTvShows('Breaking Bad');
    console.log('TV show search results:', results);
    return results;
  } catch (error) {
    console.error('TV search failed:', error);
    return [];
  }
}

// =================  TOPLU ARAMA =================

/**
 * Birden fazla anime'yi aynı anda ara
 */
export async function batchAnimeSearchExample() {
  try {
    const queries = ['Naruto', 'One Piece', 'Attack on Titan', 'Death Note'];
    const results = await batchSearchAnime(queries);
    
    console.log('Batch search results:');
    Object.entries(results).forEach(([query, queryResults]) => {
      console.log(`${query}: ${queryResults.length} results found`);
    });
    
    return results;
  } catch (error) {
    console.error('Batch search failed:', error);
    return {};
  }
}

// =================  DETAY BİLGİLERİ =================

/**
 * Anime detay bilgilerini al
 */
export async function getAnimeDetailsExample() {
  try {
    // Önce anime ara
    const searchResults = await searchAnime('Your Name');
    if (searchResults.length === 0) {
      console.log('No anime found');
      return null;
    }

    // İlk sonucun detayını al
    const firstResult = searchResults[0];
    const details = await getAnimeDetails(firstResult.id, firstResult.provider);
    
    console.log('Anime details:', details);
    return details;
  } catch (error) {
    console.error('Get anime details failed:', error);
    return null;
  }
}

/**
 * TV şovu sezon bilgilerini al
 */
export async function getTvSeasonsExample() {
  try {
    // Önce TV şovu ara
    const searchResults = await searchTvShows('Game of Thrones');
    if (searchResults.length === 0) {
      console.log('No TV show found');
      return [];
    }

    // İlk sonucun sezon bilgilerini al
    const firstResult = searchResults[0];
    const seasons = await getTvShowSeasons(firstResult.id);
    
    console.log('TV show seasons:', seasons);
    return seasons;
  } catch (error) {
    console.error('Get TV seasons failed:', error);
    return [];
  }
}

// =================  İLERİ SEVİYE KULLANIM =================

/**
 * Belirli bir provider ile arama
 */
export async function providerSpecificSearch() {
  try {
    // Sadece AniList ile anime ara
    const anilistResults = await searchWithProvider(
      'Demon Slayer', 
      ApiProviders.ANILIST, 
      MediaTypes.ANIME
    );
    
    // Sadece TMDB ile film ara
    const tmdbResults = await searchWithProvider(
      'Avengers', 
      ApiProviders.TMDB, 
      MediaTypes.MOVIE
    );
    
    console.log('AniList results:', anilistResults);
    console.log('TMDB results:', tmdbResults);
    
    return { anilistResults, tmdbResults };
  } catch (error) {
    console.error('Provider specific search failed:', error);
    return { anilistResults: [], tmdbResults: [] };
  }
}

/**
 * Seçeneklerle arama
 */
export async function searchWithOptions() {
  try {
    // Limit ile arama
    const limitedResults = await searchAnime('Pokemon', { limit: 5 });
    
    // Sadece ilk provider kullan
    const firstProviderOnly = await searchAnime('Dragon Ball', { 
      useFirstProvider: true 
    });
    
    // Timeout ile arama
    const timeoutResults = await searchMovies('Marvel', { 
      timeout: 5000 // 5 saniye
    });
    
    console.log('Limited results:', limitedResults);
    console.log('First provider only:', firstProviderOnly);
    console.log('Timeout results:', timeoutResults);
    
    return { limitedResults, firstProviderOnly, timeoutResults };
  } catch (error) {
    console.error('Search with options failed:', error);
    return {};
  }
}

// =================  ERROR HANDLİNG =================

/**
 * Hata yönetimi örneği
 */
export async function errorHandlingExample() {
  try {
    // Geçersiz arama
    const emptyResults = await searchAnime('');
  } catch (error) {
    console.log('Empty query error handled:', error.message);
  }

  try {
    // Timeout örneği
    const timeoutResults = await searchAnime('Test', { timeout: 1 }); // 1ms timeout
  } catch (error) {
    console.log('Timeout error handled:', error.message);
  }

  try {
    // Geçersiz provider
    const invalidProvider = await searchWithProvider(
      'Test', 
      'invalid_provider', 
      MediaTypes.ANIME
    );
  } catch (error) {
    console.log('Invalid provider error handled:', error.message);
  }
}

// =================  GERÇEK DÜNYA ÖRNEKLERİ =================

/**
 * Watchlist için arama
 */
export async function watchlistSearchExample() {
  const watchlistItems = [
    { name: 'Your Name', type: 'anime' },
    { name: 'Inception', type: 'movie' },
    { name: 'Breaking Bad', type: 'tv' },
    { name: 'Attack on Titan', type: 'anime' }
  ];

  const results = {};

  for (const item of watchlistItems) {
    try {
      let searchResults = [];
      
      switch (item.type) {
        case 'anime':
          searchResults = await searchAnime(item.name);
          break;
        case 'movie':
          searchResults = await searchMovies(item.name);
          break;
        case 'tv':
          searchResults = await searchTvShows(item.name);
          break;
      }

      results[item.name] = {
        type: item.type,
        results: searchResults,
        found: searchResults.length > 0
      };

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`Failed to search for ${item.name}:`, error);
      results[item.name] = {
        type: item.type,
        results: [],
        found: false,
        error: error.message
      };
    }
  }

  console.log('Watchlist search results:', results);
  return results;
}

/**
 * Arama sonuçlarını filtreleme ve sıralama
 */
export async function filterAndSortResults() {
  try {
    const results = await searchAnime('Dragon Ball');
    
    // Skoruna göre filtrele (>7.0)
    const highRated = results.filter(item => item.score && item.score > 7.0);
    
    // Yıla göre sırala (en yeni önce)
    const sortedByYear = results.sort((a, b) => (b.year || 0) - (a.year || 0));
    
    // Sadece tamamlanmış anime'leri filtrele
    const completed = results.filter(item => 
      item.status && item.status.toLowerCase().includes('finished')
    );
    
    console.log('High rated:', highRated);
    console.log('Sorted by year:', sortedByYear);
    console.log('Completed only:', completed);
    
    return { highRated, sortedByYear, completed };
  } catch (error) {
    console.error('Filter and sort failed:', error);
    return {};
  }
}

// =================  TEST FONKSİYONU =================

/**
 * Tüm örnekleri test et
 */
export async function runAllExamples() {
  console.log('=== Running API Examples ===');
  
  try {
    console.log('\n1. Basic searches...');
    await basicAnimeSearch();
    await basicMovieSearch();
    await basicTvSearch();
    
    console.log('\n2. Batch search...');
    await batchAnimeSearchExample();
    
    console.log('\n3. Detail queries...');
    await getAnimeDetailsExample();
    await getTvSeasonsExample();
    
    console.log('\n4. Advanced usage...');
    await providerSpecificSearch();
    await searchWithOptions();
    
    console.log('\n5. Error handling...');
    await errorHandlingExample();
    
    console.log('\n6. Real world examples...');
    await watchlistSearchExample();
    await filterAndSortResults();
    
    console.log('\n=== All examples completed ===');
  } catch (error) {
    console.error('Example execution failed:', error);
  }
}

// Default export
export default {
  basicAnimeSearch,
  basicMovieSearch,
  basicTvSearch,
  batchAnimeSearchExample,
  getAnimeDetailsExample,
  getTvSeasonsExample,
  providerSpecificSearch,
  searchWithOptions,
  errorHandlingExample,
  watchlistSearchExample,
  filterAndSortResults,
  runAllExamples
};
