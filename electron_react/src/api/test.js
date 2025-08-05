/**
 * Simple Test Script for New API Structure
 * Bu dosyayı console'da çalıştırarak yeni API yapısını test edebilirsiniz
 */

// Test function to verify the new API structure works
async function testNewApiStructure() {
  console.log('🚀 Testing New API Structure...\n');

  try {
    // Import new API functions
    const { 
      searchAnime, 
      searchMovies,
      MediaTypes,
      ApiProviders,
      isProviderAvailable 
    } = await import('./index.js');

    console.log('✅ Imports successful');

    // Test provider availability
    console.log('\n📊 Provider Status:');
    console.log(`AniList: ${isProviderAvailable(ApiProviders.ANILIST) ? '✅' : '❌'}`);
    console.log(`TMDB: ${isProviderAvailable(ApiProviders.TMDB) ? '✅' : '❌'}`);
    console.log(`Kitsu: ${isProviderAvailable(ApiProviders.KITSU) ? '✅' : '❌'}`);
    console.log(`Jikan: ${isProviderAvailable(ApiProviders.JIKAN) ? '✅' : '❌'}`);

    // Test constants
    console.log('\n🔧 Constants Test:');
    console.log('MediaTypes:', MediaTypes);
    console.log('ApiProviders:', ApiProviders);

    // Test basic anime search
    console.log('\n🔍 Testing Anime Search...');
    try {
      const animeResults = await searchAnime('Naruto', { limit: 3 });
      console.log(`Found ${animeResults.length} anime results`);
      if (animeResults.length > 0) {
        console.log('First result:', {
          title: animeResults[0].title,
          type: animeResults[0].type,
          year: animeResults[0].year,
          provider: animeResults[0].provider
        });
      }
    } catch (error) {
      console.error('❌ Anime search failed:', error.message);
    }

    // Test basic movie search
    console.log('\n🎬 Testing Movie Search...');
    try {
      const movieResults = await searchMovies('Inception', { limit: 3 });
      console.log(`Found ${movieResults.length} movie results`);
      if (movieResults.length > 0) {
        console.log('First result:', {
          title: movieResults[0].title,
          type: movieResults[0].type,
          year: movieResults[0].year,
          provider: movieResults[0].provider
        });
      }
    } catch (error) {
      console.error('❌ Movie search failed:', error.message);
    }

    console.log('\n✅ Basic tests completed successfully!');
    console.log('\n📝 To run more comprehensive tests, use:');
    console.log('   import examples from "./examples.js";');
    console.log('   examples.runAllExamples();');

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.log('\n🔧 Possible issues:');
    console.log('   - Check if all files are in the correct location');
    console.log('   - Verify import paths are correct');
    console.log('   - Make sure VITE_TMDB_API_KEY is set for movie search');
  }
}

// Auto-run if this file is executed directly
if (typeof window !== 'undefined') {
  // Browser environment
  console.log('Run testNewApiStructure() in console to test the API');
  window.testNewApiStructure = testNewApiStructure;
} else if (typeof module !== 'undefined' && module.exports) {
  // Node.js environment
  module.exports = testNewApiStructure;
}

export default testNewApiStructure;
