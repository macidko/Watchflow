import { ApiInterface } from '../base/ApiInterface.js';
import { MediaTypes, MediaStatus } from '../base/MediaTypes.js';

/**
 * TMDB API Provider
 * Film ve TV şovu veritabanı API'si
 */
export class TmdbApi extends ApiInterface {
  constructor(apiKey = null) {
    super('https://api.themoviedb.org/3');
    this.apiKey = apiKey || import.meta.env.VITE_TMDB_API_KEY;
    
    if (!this.apiKey) {
      console.error('TMDB API key not found. Set VITE_TMDB_API_KEY in your environment.');
      console.log('Available env vars:', Object.keys(import.meta.env));
    } else {
      console.log('TMDB API key loaded successfully');
    }
  }

  async search(query, options = {}) {
    const { type = MediaTypes.MULTI, limit = 10 } = options;
    
    console.log('TMDB search called with:', { query, type, limit });
    console.log('TMDB API key available:', !!this.apiKey);
    
    if (!this.apiKey) {
      throw new Error('TMDB API key required');
    }

    let endpoint = '/search/multi';
    if (type === MediaTypes.MOVIE) endpoint = '/search/movie';
    else if (type === MediaTypes.TV) endpoint = '/search/tv';

    try {
      const url = `${this.baseUrl}${endpoint}?api_key=${this.apiKey}&query=${encodeURIComponent(query)}&language=en-US`;
      console.log('TMDB request URL:', url.replace(this.apiKey, '[API_KEY]'));
      
      const response = await this.makeRequest(url);
      
      console.log('TMDB response:', { 
        total_results: response.total_results, 
        results_count: response.results?.length || 0 
      });
      
      const results = response.results || [];
      
      return results.slice(0, limit).map(item => this.normalizeResponse({
        id: item.id,
        title: item.title || item.name,
        originalTitle: item.original_title || item.original_name,
        year: this.extractYear(item.release_date || item.first_air_date),
        imageUrl: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
        score: item.vote_average,
        overview: item.overview,
        genres: item.genre_ids // TMDB returns genre IDs in search
      }, item.media_type || type));
    } catch (error) {
      console.error('TMDB search error:', error);
      throw error;
    }
  }

  async getDetails(id, mediaType) {
    if (!this.apiKey) {
      throw new Error('TMDB API key required');
    }

    const endpoint = mediaType === MediaTypes.MOVIE ? `/movie/${id}` : `/tv/${id}`;
    
    try {
      const url = `${this.baseUrl}${endpoint}?api_key=${this.apiKey}&language=en-US`;
      const response = await this.makeRequest(url);
      
      return this.normalizeResponse({
        id: response.id,
        title: response.title || response.name,
        originalTitle: response.original_title || response.original_name,
        year: this.extractYear(response.release_date || response.first_air_date),
        imageUrl: response.poster_path ? `https://image.tmdb.org/t/p/w500${response.poster_path}` : null,
        score: response.vote_average,
        overview: response.overview,
        genres: response.genres?.map(g => g.name) || [],
        status: this.normalizeStatus(response.status),
        duration: response.runtime || response.episode_run_time?.[0],
        seasons: response.seasons?.length || null,
        episodes: response.number_of_episodes || null
      }, mediaType);
    } catch (error) {
      console.error('TMDB getDetails error:', error);
      throw error;
    }
  }

  async getSeasons(id) {
    if (!this.apiKey) {
      throw new Error('TMDB API key required');
    }

    try {
      // Önce TV şovu bilgilerini al
      const showResponse = await this.makeRequest(
        `${this.baseUrl}/tv/${id}?api_key=${this.apiKey}&language=en-US`
      );

      const seasons = [];
      
      // Her sezon için detay bilgileri al
      for (const season of showResponse.seasons || []) {
        if (season.season_number === 0 || season.episode_count < 1) continue;
        
        try {
          const seasonResponse = await this.makeRequest(
            `${this.baseUrl}/tv/${id}/season/${season.season_number}?api_key=${this.apiKey}&language=en-US`
          );

          const episodes = seasonResponse.episodes?.map(ep => ({
            episodeId: ep.id,
            episodeNumber: ep.episode_number,
            title: ep.name,
            overview: ep.overview,
            stillUrl: ep.still_path ? `https://image.tmdb.org/t/p/original${ep.still_path}` : null,
            airDate: ep.air_date,
            voteAverage: ep.vote_average,
            runtime: ep.runtime
          })) || [];

          seasons.push({
            seasonNumber: season.season_number,
            seasonId: season.id,
            title: season.name,
            overview: season.overview,
            posterUrl: season.poster_path ? `https://image.tmdb.org/t/p/w500${season.poster_path}` : null,
            airDate: season.air_date,
            episodeCount: season.episode_count,
            episodes
          });

          // Rate limiting
          await this.delay(100);
        } catch (error) {
          console.warn(`Failed to fetch season ${season.season_number}:`, error.message);
          continue;
        }
      }

      return seasons;
    } catch (error) {
      console.error('TMDB getSeasons error:', error);
      throw error;
    }
  }

  /**
   * Batch search implementation
   */
  async batchSearch(queries, options = {}) {
    // TMDB doesn't support batch queries, use sequential with rate limiting
    const results = {};
    
    for (const query of queries) {
      try {
        results[query] = await this.search(query, options);
        
        // Rate limiting - TMDB allows 40 requests per 10 seconds
        if (queries.indexOf(query) < queries.length - 1) {
          await this.delay(250);
        }
      } catch (error) {
        console.warn(`TMDB batch search failed for query "${query}":`, error.message);
        results[query] = [];
      }
    }

    return results;
  }

  /**
   * Yıl bilgisini tarihten çıkarır
   */
  extractYear(dateString) {
    if (!dateString) return null;
    return new Date(dateString).getFullYear();
  }

  /**
   * TMDB status'unu normalize eder
   */
  normalizeStatus(status) {
    const statusMap = {
      'Released': MediaStatus.FINISHED,
      'Ended': MediaStatus.FINISHED,
      'Returning Series': MediaStatus.RELEASING,
      'In Production': MediaStatus.RELEASING,
      'Planned': MediaStatus.NOT_YET_RELEASED,
      'Canceled': MediaStatus.CANCELLED,
      'Cancelled': MediaStatus.CANCELLED
    };
    
    return statusMap[status] || status;
  }

  /**
   * Specific search methods for convenience
   */
  async searchMovies(query, options = {}) {
    return this.search(query, { ...options, type: MediaTypes.MOVIE });
  }

  async searchTvShows(query, options = {}) {
    return this.search(query, { ...options, type: MediaTypes.TV });
  }
}
