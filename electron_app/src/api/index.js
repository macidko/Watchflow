/**
 * API Services Index
 */

// Her API servisini içe aktar
const tmdbApi = require('./tmdbApi');
const animeApi = require('./animeApi'); // Fallback sistemi içeren anime API
const jikanApi = require('./jikanApi');
const anilistApi = require('./anilistApi');
const kitsuApi = require('./kitsuApi');

// Tüm servisleri dışa aktar
module.exports = {
  tmdb: tmdbApi,
  anime: animeApi, // Fallback mekanizmalı anime API
  jikan: jikanApi,  // Jikan API direkt erişim için
  anilist: anilistApi, // AniList API direkt erişim için
  kitsu: kitsuApi // Kitsu API direkt erişim için
}; 