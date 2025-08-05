import { ApiInterface } from '../base/ApiInterface.js';
import { MediaTypes, MediaStatus } from '../base/MediaTypes.js';

/**
 * Jikan API Provider
 * MyAnimeList veritabanı için unofficial API
 */
export class JikanApi extends ApiInterface {
  constructor() {
    super('https://api.jikan.moe/v4');
    this.rateLimitDelay = 1000; // 1 second between requests
  }

  async search(query, options = {}) {
    const { limit = 10, maxRetries = 3 } = options;
    
    return this.retryWithBackoff(async () => {
      const url = `${this.baseUrl}/anime?q=${encodeURIComponent(query)}&limit=${limit}&order_by=popularity&sort=desc`;
      const response = await this.makeRequest(url);

      const results = response.data || [];
      
      return results.map(item => this.normalizeResponse({
        id: item.mal_id,
        title: item.title,
        originalTitle: item.title_japanese,
        year: item.aired?.from ? new Date(item.aired.from).getFullYear() : null,
        imageUrl: item.images?.jpg?.image_url || item.images?.jpg?.large_image_url,
        score: item.score,
        status: this.normalizeStatus(item.status),
        episodes: item.episodes,
        overview: item.synopsis,
        genres: item.genres?.map(g => g.name) || [],
        duration: item.duration ? this.parseDuration(item.duration) : null
      }, MediaTypes.ANIME));
    }, maxRetries);
  }

  async getDetails(id) {
    return this.retryWithBackoff(async () => {
      const url = `${this.baseUrl}/anime/${id}/full`;
      const response = await this.makeRequest(url);

      const item = response.data;
      
      return this.normalizeResponse({
        id: item.mal_id,
        title: item.title,
        originalTitle: item.title_japanese,
        year: item.aired?.from ? new Date(item.aired.from).getFullYear() : null,
        imageUrl: item.images?.jpg?.large_image_url || item.images?.jpg?.image_url,
        score: item.score,
        status: this.normalizeStatus(item.status),
        episodes: item.episodes,
        overview: item.synopsis,
        genres: item.genres?.map(g => g.name) || [],
        duration: item.duration ? this.parseDuration(item.duration) : null,
        studios: item.studios?.map(s => s.name) || [],
        source: item.source,
        rating: item.rating
      }, MediaTypes.ANIME);
    });
  }

  async getSeasons(id) {
    // Jikan doesn't have direct season support for anime
    // Get related anime instead
    return this.retryWithBackoff(async () => {
      try {
        const url = `${this.baseUrl}/anime/${id}/relations`;
        const response = await this.makeRequest(url);

        const relations = response.data || [];
        const seasons = [];

        for (const relation of relations) {
          if (relation.relation === 'Sequel' || relation.relation === 'Prequel') {
            for (const entry of relation.entry || []) {
              if (entry.type === 'anime') {
                seasons.push({
                  seasonNumber: seasons.length + 1,
                  title: entry.name,
                  id: entry.mal_id,
                  type: relation.relation,
                  url: entry.url
                });
              }
            }
          }
        }

        return seasons;
      } catch (error) {
        console.warn('Jikan getSeasons error:', error.message);
        return [];
      }
    });
  }

  /**
   * Retry logic with exponential backoff for rate limiting
   */
  async retryWithBackoff(operation, maxRetries = 3) {
    let retries = 0;
    
    while (retries <= maxRetries) {
      try {
        const result = await operation();
        return result;
      } catch (error) {
        if (error.message.includes('429') && retries < maxRetries) {
          // Rate limited, wait with exponential backoff
          const delay = this.rateLimitDelay * Math.pow(2, retries);
          console.warn(`Jikan rate limited, waiting ${delay}ms before retry ${retries + 1}`);
          await this.delay(delay);
          retries++;
          continue;
        }
        
        if (retries < maxRetries) {
          // Other error, shorter retry delay
          await this.delay(1000 * (retries + 1));
          retries++;
          continue;
        }
        
        throw error;
      }
    }
  }

  /**
   * Override batch search with proper rate limiting
   */
  async batchSearch(queries, options = {}) {
    const results = {};
    
    for (const query of queries) {
      try {
        results[query] = await this.search(query, options);
        
        // Strict rate limiting for Jikan
        if (queries.indexOf(query) < queries.length - 1) {
          await this.delay(this.rateLimitDelay);
        }
      } catch (error) {
        console.warn(`Jikan batch search failed for query "${query}":`, error.message);
        results[query] = [];
      }
    }

    return results;
  }

  /**
   * Jikan status'unu normalize eder
   */
  normalizeStatus(status) {
    const statusMap = {
      'Finished Airing': MediaStatus.FINISHED,
      'Currently Airing': MediaStatus.RELEASING,
      'Not yet aired': MediaStatus.NOT_YET_RELEASED
    };
    
    return statusMap[status] || status;
  }

  /**
   * Duration string'ini dakika olarak parse eder
   */
  parseDuration(durationString) {
    if (!durationString) return null;
    
    // "24 min per ep" gibi formatları parse et
    const match = durationString.match(/(\d+)/);
    return match ? parseInt(match[1]) : null;
  }

  /**
   * Override makeRequest to handle Jikan-specific responses
   */
  async makeRequest(url, options = {}) {
    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          ...options.headers
        },
        ...options
      });

      if (response.status === 429) {
        throw new Error('429 Rate Limited');
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Jikan API Request failed for ${url}:`, error.message);
      throw error;
    }
  }
}
