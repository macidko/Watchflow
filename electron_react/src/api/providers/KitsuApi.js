
import { ApiInterface } from '../base/ApiInterface.js';
import { MediaTypes, MediaStatus } from '../base/MediaTypes.js';
import { normalizeRelations } from '../utils/normalizeRelations.js';

/**
 * Kitsu API Provider
 * Anime ve manga veritabanı API'si
 */
export class KitsuApi extends ApiInterface {
  constructor() {
    super('https://kitsu.io/api/edge');
  }

  async search(query, options = {}) {
    const { limit = 10 } = options;
    
    try {
      const url = `${this.baseUrl}/anime?filter[text]=${encodeURIComponent(query)}&page[limit]=${limit}&sort=-userCount`;
      const response = await this.makeRequest(url, {
        headers: {
          'Accept': 'application/vnd.api+json',
          'Content-Type': 'application/vnd.api+json'
        }
      });

      const results = response.data || [];
      
      return results.map(item => {
        const attrs = item.attributes;
        return this.normalizeResponse({
          id: item.id,
          title: attrs.titles?.en_jp || attrs.canonicalTitle || attrs.titles?.en,
          originalTitle: attrs.titles?.ja_jp,
          year: attrs.startDate ? new Date(attrs.startDate).getFullYear() : null,
          imageUrl: attrs.posterImage?.medium || attrs.posterImage?.original,
          score: attrs.averageRating ? parseFloat(attrs.averageRating) / 10 : null,
          status: this.normalizeStatus(attrs.status),
          episodes: attrs.episodeCount,
          overview: attrs.synopsis,
          genres: [], // Kitsu requires separate call for genres
          duration: attrs.episodeLength
        }, MediaTypes.ANIME);
      });
    } catch (error) {
      
      throw error;
    }
  }

  async getDetails(id) {
    try {
      const url = `${this.baseUrl}/anime/${id}?include=genres,categories,media-relationships,destination`;
      const response = await this.makeRequest(url, {
        headers: {
          'Accept': 'application/vnd.api+json'
        }
      });

      const item = response.data;
      const attrs = item.attributes;
      
      // Extract genres from included data
      const genres = response.included
        ?.filter(inc => inc.type === 'genres' || inc.type === 'categories')
        ?.map(genre => genre.attributes.name) || [];

      return {
        ...this.normalizeResponse({
          id: item.id,
          title: attrs.titles?.en_jp || attrs.canonicalTitle || attrs.titles?.en,
          originalTitle: attrs.titles?.ja_jp,
          year: attrs.startDate ? new Date(attrs.startDate).getFullYear() : null,
          imageUrl: attrs.posterImage?.original || attrs.posterImage?.large,
          score: attrs.averageRating ? parseFloat(attrs.averageRating) / 10 : null,
          status: this.normalizeStatus(attrs.status),
          episodes: attrs.episodeCount,
          overview: attrs.synopsis,
          genres,
          duration: attrs.episodeLength,
          totalLength: attrs.totalLength
        }, MediaTypes.ANIME),
        relations: normalizeRelations(item, 'kitsu')
      };
    } catch (error) {
      
      throw error;
    }
  }

  async getSeasons(id) {
    // Kitsu doesn't have a direct season concept for anime
    // Return empty array or related media if available
    try {
      const url = `${this.baseUrl}/anime/${id}/relationships/media-relationships?include=destination`;
      const response = await this.makeRequest(url, {
        headers: {
          'Accept': 'application/vnd.api+json'
        }
      });

      const relationships = response.data || [];
      const relatedMedia = response.included || [];

      const seasons = relationships
        .filter(rel => rel.attributes.role === 'sequel' || rel.attributes.role === 'prequel')
        .map((rel, index) => {
          const related = relatedMedia.find(media => media.id === rel.relationships?.destination?.data?.id);
          if (!related) return null;

          return {
            seasonNumber: index + 1,
            title: related.attributes.canonicalTitle,
            id: related.id,
            type: rel.attributes.role,
            year: related.attributes.startDate ? new Date(related.attributes.startDate).getFullYear() : null
          };
        })
        .filter(Boolean);

      return seasons;
    } catch (error) {
      
      return [];
    }
  }

  /**
   * Kitsu status'unu normalize eder
   */
  normalizeStatus(status) {
    const statusMap = {
      'finished': MediaStatus.FINISHED,
      'current': MediaStatus.RELEASING,
      'upcoming': MediaStatus.NOT_YET_RELEASED,
      'unreleased': MediaStatus.NOT_YET_RELEASED
    };
    
    return statusMap[status] || status;
  }

  /**
   * Rate limiting için override
   */
  async batchSearch(queries, options = {}) {
    const results = {};
    
    for (const query of queries) {
      try {
        results[query] = await this.search(query, options);
        
        // Kitsu rate limiting: be conservative
        if (queries.indexOf(query) < queries.length - 1) {
          await this.delay(500);
        }
      } catch (error) {
        
        results[query] = [];
      }
    }

    return results;
  }
}

