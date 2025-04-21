/**
 * API Test Dosyası
 * Her bir API için test işlevlerini içerir
 */

// .env dosyasından ortam değişkenlerini yükle
require('dotenv').config();

// API'leri içe aktar
const { jikanApi, omdbApi, tmdbApi } = require('./index');

// Sonuçları yazdırmak için yardımcı fonksiyon
const logResults = (title, data) => {
  console.log('\n' + '='.repeat(50));
  console.log(`${title}`);
  console.log('='.repeat(50));
  console.log(JSON.stringify(data, null, 2));
};

// OMDB API Testi - House dizisi
const testOmdbApi = async () => {
  try {
    console.log('\n📺 OMDB API Testi - "House" dizisi aranıyor...');
    
    // House dizisini ara
    const searchResults = await omdbApi.searchMedia('House', 'series');
    logResults('OMDB Arama Sonuçları', searchResults.slice(0, 3)); // İlk 3 sonucu göster
    
    // İlk sonucun ID'sini al (House dizisi olmalı)
    const houseId = searchResults[0]?.id;
    
    if (houseId) {
      console.log(`\n📺 OMDB API - "House" dizisi (${houseId}) sezon bilgileri alınıyor...`);
      const seasonResults = await omdbApi.getSeriesSeasons(houseId);
      
      // Sezon sayısı ve her sezonun bölüm sayısını yazdır
      console.log('\nHouse - Sezon Özeti:');
      console.log('='.repeat(50));
      console.log(`Toplam Sezon: ${seasonResults.totalSeasons}`);
      
      seasonResults.seasons.forEach(season => {
        console.log(`Sezon ${season.seasonNumber}: ${season.episodeCount} bölüm`);
      });
      
      // İlk sezonun ilk 3 bölümünü göster
      if (seasonResults.seasons.length > 0) {
        const firstSeason = seasonResults.seasons[0];
        logResults(`Sezon ${firstSeason.seasonNumber} - İlk 3 Bölüm`, firstSeason.episodes.slice(0, 3));
      }
    } else {
      console.error('House dizisi bulunamadı!');
    }
  } catch (error) {
    console.error('OMDB API Testi sırasında hata:', error.message);
  }
};

// TMDB API Testi - Prison Break dizisi
const testTmdbApi = async () => {
  try {
    console.log('\n📺 TMDB API Testi - "Prison Break" dizisi aranıyor...');
    
    // Prison Break dizisini ara
    const searchResults = await tmdbApi.searchMedia('Prison Break', 'tv');
    logResults('TMDB Arama Sonuçları', searchResults.slice(0, 3)); // İlk 3 sonucu göster
    
    // İlk sonucun ID'sini al (Prison Break dizisi olmalı)
    const prisonBreakId = searchResults[0]?.id;
    
    if (prisonBreakId) {
      console.log(`\n📺 TMDB API - "Prison Break" dizisi (${prisonBreakId}) sezon bilgileri alınıyor...`);
      const seasonResults = await tmdbApi.getTvShowSeasons(prisonBreakId);
      
      // Sezon sayısı ve her sezonun bölüm sayısını yazdır
      console.log('\nPrison Break - Sezon Özeti:');
      console.log('='.repeat(50));
      console.log(`Toplam Sezon: ${seasonResults.totalSeasons}`);
      
      seasonResults.seasons.forEach(season => {
        console.log(`Sezon ${season.seasonNumber} (${season.seasonName}): ${season.episodeCount} bölüm`);
      });
      
      // İlk sezonun ilk 3 bölümünü göster
      if (seasonResults.seasons.length > 0) {
        const firstSeason = seasonResults.seasons[0];
        logResults(`Sezon ${firstSeason.seasonNumber} - İlk 3 Bölüm`, firstSeason.episodes.slice(0, 3));
      }
    } else {
      console.error('Prison Break dizisi bulunamadı!');
    }
  } catch (error) {
    console.error('TMDB API Testi sırasında hata:', error.message);
  }
};

// Jikan API Testi - Monster animesi
const testJikanApi = async () => {
  try {
    console.log('\n🍙 Jikan API Testi - "Monster" animesi aranıyor...');
    
    // Monster animesini ara
    const searchResults = await jikanApi.searchAnime('Monster');
    logResults('Jikan Arama Sonuçları', searchResults.slice(0, 3)); // İlk 3 sonucu göster
    
    // İlk sonucun ID'sini al (Monster animesi olmalı)
    const monsterId = searchResults[0]?.id;
    
    if (monsterId) {
      console.log(`\n🍙 Jikan API - "Monster" animesi (${monsterId}) bölüm bilgileri alınıyor...`);
      const seasonResults = await jikanApi.getAnimeSeasons(monsterId);
      
      // Toplam bölüm sayısını yazdır
      console.log('\nMonster - Bölüm Özeti:');
      console.log('='.repeat(50));
      console.log(`Toplam Bölüm Sayısı: ${seasonResults.totalEpisodes}`);
      
      seasonResults.seasons.forEach(season => {
        console.log(`Sezon ${season.seasonNumber}: ${season.episodeCount} bölüm`);
      });
      
      // İlk 3 bölümü göster
      if (seasonResults.seasons.length > 0 && seasonResults.seasons[0].episodes.length > 0) {
        const episodes = seasonResults.seasons[0].episodes;
        logResults('İlk 3 Bölüm', episodes.slice(0, 3));
      }
    } else {
      console.error('Monster animesi bulunamadı!');
    }
  } catch (error) {
    console.error('Jikan API Testi sırasında hata:', error.message);
  }
};

// Ana test işlevi
const runTests = async () => {
  try {
    console.log('\n🧪 API Testleri Başlatılıyor...');
    
    await testOmdbApi();
    await testTmdbApi();
    await testJikanApi();
    
    console.log('\n✅ Tüm testler tamamlandı!');
  } catch (error) {
    console.error('Test işlemi sırasında hata:', error);
  }
};

// Testleri çalıştır
runTests(); 