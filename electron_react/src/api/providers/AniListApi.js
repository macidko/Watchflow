
import { ApiInterface } from '../base/ApiInterface.js';
import { MediaTypes, MediaStatus } from '../base/MediaTypes.js';
import { normalizeRelations } from '../utils/normalizeRelations.js';

/**
 * AniList API Provider
 * GraphQL tabanlı anime veritabanı API'si
 */
export class AniListApi extends ApiInterface {
  constructor() {
    super('/anilist');
  }

  async search(query, options = {}) {
    const { limit = 10 } = options;
    
    const SEARCH_QUERY = `
      query ($search: String, $perPage: Int) {
        Page(page: 1, perPage: $perPage) {
          media(search: $search, type: ANIME, sort: POPULARITY_DESC) {
            id
            title { romaji english native }
            coverImage { large medium }
            startDate { year }
            format
            episodes
            status
            averageScore
            genres
            duration
            description
          }
        }
      }
    `;

    try {
      const response = await this.makeRequest(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          query: SEARCH_QUERY,
          variables: { search: query, perPage: limit }
        })
      });

      const results = response?.data?.Page?.media || [];
      
      return results.map(item => this.normalizeResponse({
        id: item.id,
        title: item.title.english || item.title.romaji,
        originalTitle: item.title.romaji,
        year: item.startDate?.year,
        imageUrl: item.coverImage?.large || item.coverImage?.medium,
        score: item.averageScore ? item.averageScore / 10 : null,
        status: this.normalizeStatus(item.status),
        episodes: item.episodes,
        overview: item.description,
        genres: item.genres,
        duration: item.duration
      }, MediaTypes.ANIME));
    } catch (error) {
      
      throw error;
    }
  }

  async getDetails(id) {
    const DETAIL_QUERY = `
      query ($id: Int) {
        Media(id: $id, type: ANIME) {
          id
          title { romaji english native }
          coverImage { large }
          episodes
          status
          description
          genres
          averageScore
          startDate { year month day }
          endDate { year month day }
          duration
          format
          nextAiringEpisode { episode airingAt }
          relations {
            edges {
              relationType
              node {
                id
                title { romaji english }
                format
                coverImage { large }
              }
            }
          }
        }
      }
    `;

    try {
      const response = await this.makeRequest(this.baseUrl, {
        method: 'POST',
        body: JSON.stringify({
          query: DETAIL_QUERY,
          variables: { id: parseInt(id) }
        })
      });

      const media = response?.data?.Media;
      if (!media) throw new Error('Anime not found');

      return {
        ...this.normalizeResponse({
          id: media.id,
          title: media.title.english || media.title.romaji,
          originalTitle: media.title.romaji,
          imageUrl: media.coverImage?.large,
          episodes: media.episodes,
          status: this.normalizeStatus(media.status),
          overview: media.description,
          genres: media.genres,
          score: media.averageScore ? media.averageScore / 10 : null,
          year: media.startDate?.year,
          duration: media.duration
        }, MediaTypes.ANIME),
        relations: normalizeRelations(media, 'anilist')
      };
    } catch (error) {
      
      throw error;
    }
  }

  async getSeasons(id) {
    // AniList'te sezon kavramı farklı, related anime'leri döndürüyoruz
    const details = await this.getDetails(id);
    const relations = details.relations || [];
    
    // Sequel, prequel ve side story'leri season benzeri olarak döndür
    const seasonTypes = ['SEQUEL', 'PREQUEL', 'SIDE_STORY', 'ALTERNATIVE'];
    const seasons = relations
      .filter(rel => seasonTypes.includes(rel.type))
      .map((rel, index) => ({
        seasonNumber: index + 1,
        title: rel.title,
        id: rel.id,
        type: rel.type
      }));

    return seasons;
  }

  /**
   * AniList status'unu normalize eder
   */
  normalizeStatus(status) {
    const statusMap = {
      'FINISHED': MediaStatus.FINISHED,
      'RELEASING': MediaStatus.RELEASING,
      'NOT_YET_RELEASED': MediaStatus.NOT_YET_RELEASED,
      'CANCELLED': MediaStatus.CANCELLED
    };
    
    return statusMap[status] || status;
  }

  /**
   * Batch GraphQL query desteği
   */
  async batchSearch(queries, options = {}) {
    const { limit = 10 } = options;
    
    // GraphQL alias kullanarak tek sorguda birden fazla arama yapabiliriz
    const batchQuery = queries.map((query, index) => 
      `search${index}: Page(page: 1, perPage: ${limit}) {
        media(search: "${query.replace(/"/g, '\\"')}", type: ANIME, sort: POPULARITY_DESC) {
          id
          title { romaji english }
          coverImage { large medium }
          startDate { year }
          status
          averageScore
          episodes
        }
      }`
    ).join('\n');

    const BATCH_QUERY = `query { ${batchQuery} }`;

    try {
      const response = await this.makeRequest(this.baseUrl, {
        method: 'POST',
        body: JSON.stringify({ query: BATCH_QUERY })
      });

      const results = {};
      queries.forEach((query, index) => {
        const searchResults = response?.data?.[`search${index}`]?.media || [];
        results[query] = searchResults.map(item => this.normalizeResponse({
          id: item.id,
          title: item.title.english || item.title.romaji,
          originalTitle: item.title.romaji,
          year: item.startDate?.year,
          imageUrl: item.coverImage?.large || item.coverImage?.medium,
          score: item.averageScore ? item.averageScore / 10 : null,
          status: this.normalizeStatus(item.status),
          episodes: item.episodes
        }, MediaTypes.ANIME));
      });

      return results;
    } catch (error) {
      
      // Fallback to sequential search
      return super.batchSearch(queries, options);
    }
  }
}

