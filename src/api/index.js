/**
 * API Modüllerini dışa aktaran ana dosya
 */

const jikanApi = require('./jikanApi');
const omdbApi = require('./omdbApi');
const tmdbApi = require('./tmdbApi');

module.exports = {
  jikanApi,
  omdbApi,
  tmdbApi
}; 