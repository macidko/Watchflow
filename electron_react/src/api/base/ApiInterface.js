/**
 * Base API Interface
 * Tüm API provider'ların implement etmesi gereken temel sınıf
 */
export class ApiInterface {
  constructor(baseUrl, config = {}) {
    this.baseUrl = baseUrl;
    this.config = config;
  }

  /**
   * Medya arama fonksiyonu
   * @param {string} _query - Arama sorgusu
   * @param {Object} _options - Arama seçenekleri
   * @returns {Promise<Array>} Normalize edilmiş sonuçlar
   */
  async search(_query, _options = {}) {
    throw new Error('search method must be implemented');
  }

  /**
   * Medya detay bilgisi getirme
   * @param {string|number} _id - Medya ID'si
   * @param {string} _mediaType - Medya tipi
   * @returns {Promise<Object>} Detay bilgileri
   */
  async getDetails(_id, _mediaType) {
    throw new Error('getDetails method must be implemented');
  }

  /**
   * Sezon bilgilerini getirme (TV şovları için)
   * @param {string|number} _id - Medya ID'si
   * @returns {Promise<Array>} Sezon ve bölüm bilgileri
   */
  async getSeasons(_id) {
    throw new Error('getSeasons method must be implemented');
  }

  /**
   * Batch arama fonksiyonu (opsiyonel)
   * @param {Array<string>} queries - Arama sorguları
   * @param {Object} options - Arama seçenekleri
   * @returns {Promise<Object>} Query -> Results mapping
   */
  async batchSearch(queries, options = {}) {
    // Default implementation: sequential search
    const results = {};
    for (const query of queries) {
      try {
        results[query] = await this.search(query, options);
        // Rate limiting için kısa bekleme
        if (queries.indexOf(query) < queries.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      } catch (error) {
        console.warn(`Batch search failed for query "${query}":`, error.message);
        results[query] = [];
      }
    }
    return results;
  }

  /**
   * API yanıtını standart formata normalize eder
   * @param {Object} data - Ham API verisi
   * @param {string} mediaType - Medya tipi
   * @returns {Object} Normalize edilmiş veri
   */
  normalizeResponse(data, mediaType) {
    return {
      id: data.id,
      title: data.title || data.name,
      originalTitle: data.originalTitle,
      type: mediaType,
      year: data.year,
      imageUrl: data.imageUrl,
      score: data.score,
      status: data.status,
      episodes: data.episodes,
      seasons: data.seasons,
      overview: data.overview,
      genres: data.genres,
      duration: data.duration,
      provider: this.constructor.name.replace('Api', '').toLowerCase()
    };
  }

  /**
   * HTTP request helper
   * @param {string} url - Request URL
   * @param {Object} options - Fetch options
   * @returns {Promise<Object>} JSON response
   */
  async makeRequest(url, options = {}) {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Request failed for ${url}:`, error.message);
      throw error;
    }
  }

  /**
   * Rate limiting helper
   * @param {number} ms - Bekleme süresi (millisaniye)
   */
  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
