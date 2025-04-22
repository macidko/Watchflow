/**
 * API Modüllerini dışa aktaran ana dosya
 */

const jikanApi = require('./jikanApi');
const tmdbApi = require('./tmdbApi');

module.exports = {
  jikanApi,
  tmdbApi
}; 