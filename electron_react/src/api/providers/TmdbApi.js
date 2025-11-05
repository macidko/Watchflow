import { ApiInterface } from "../base/ApiInterface.js";
import { MediaTypes, MediaStatus } from "../base/MediaTypes.js";
import { t } from "../../i18n";
import { normalizeRelations } from "../utils/normalizeRelations.js";

/**
 * TMDB API Provider
 * Film ve TV şovu veritabanı API'si
 */
export class TmdbApi extends ApiInterface {
  constructor(apiKey = null) {
    super("https://api.themoviedb.org/3");
    this.apiKey = apiKey || import.meta.env.VITE_TMDB_API_KEY;
  }

  async search(query, options = {}) {
    const { type = MediaTypes.MULTI, limit = 10 } = options;

    if (!this.apiKey) {
      throw new Error("TMDB API key required");
    }

    let endpoint = "/search/multi";
    if (type === MediaTypes.MOVIE) endpoint = "/search/movie";
    else if (type === MediaTypes.TV) endpoint = "/search/tv";

    try {
      const url = `${this.baseUrl}${endpoint}?api_key=${
        this.apiKey
      }&query=${encodeURIComponent(query)}&language=en-US`;
      const response = await this.makeRequest(url);
      const results = response.results || [];

      return results.slice(0, limit).map((item) =>
        this.normalizeResponse(
          {
            id: item.id,
            title: item.title || item.name,
            originalTitle: item.original_title || item.original_name,
            year: this.extractYear(item.release_date || item.first_air_date),
            imageUrl: item.poster_path
              ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
              : null,
            score: item.vote_average,
            overview: item.overview,
            genres:
              item.genre_ids?.map((id) => {
                const key = `genres.${id}`;
                const translated = t(key);
                return translated === key ? `Genre ${id}` : translated;
              }) || [], // Convert genre IDs to names (use i18n)
          },
          item.media_type || type
        )
      );
    } catch (error) {
      console.error("TMDB search error:", error);
      throw error;
    }
  }

  async getDetails(id, mediaType) {
    if (!this.apiKey) {
      throw new Error("TMDB API key required");
    }

    const endpoint =
      mediaType === MediaTypes.MOVIE ? `/movie/${id}` : `/tv/${id}`;

    try {
      // Film için ek detaylar (credits, budget vs.) almak için append_to_response kullanıyoruz
      // Include recommendations and similar in the details response so we can show related items for movies/TV
      const appendParam = "&append_to_response=credits,recommendations,similar";
      const url = `${this.baseUrl}${endpoint}?api_key=${this.apiKey}&language=en-US${appendParam}`;
      const response = await this.makeRequest(url);

      // Film için ek detayları işle
      let additionalDetails = {};
      if (mediaType === MediaTypes.MOVIE) {
        additionalDetails = {
          budget: response.budget || 0,
          revenue: response.revenue || 0,
          runtime: response.runtime || 0,
          cast:
            response.credits?.cast?.slice(0, 10).map((actor) => ({
              name: actor.name,
              character: actor.character,
            })) || [],
          director:
            response.credits?.crew?.find((person) => person.job === "Director")
              ?.name || null,
        };
      }

      const normalizedResponse = this.normalizeResponse(
        {
          id: response.id,
          title: response.title || response.name,
          originalTitle: response.original_title || response.original_name,
          year: this.extractYear(
            response.release_date || response.first_air_date
          ),
          imageUrl: response.poster_path
            ? `https://image.tmdb.org/t/p/w500${response.poster_path}`
            : null,
          score: response.vote_average,
          overview: response.overview,
          genres: response.genres?.map((g) => g.name) || [],
          status: this.normalizeStatus(response.status),
          duration: response.runtime || response.episode_run_time?.[0],
          seasons: response.seasons?.length || null,
          episodes: response.number_of_episodes || null,
          ...additionalDetails, // Film detaylarını ekle
        },
        mediaType
      );

      // relations alanını ekle
      return {
        ...normalizedResponse,
        relations: normalizeRelations(response, "tmdb"),
      };
    } catch (error) {
      console.error("TMDB getDetails error:", error);
      throw error;
    }
  }

  async getSeasons(id) {
    if (!this.apiKey) {
      throw new Error("TMDB API key required");
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

          const episodes =
            seasonResponse.episodes?.map((ep) => ({
              episodeId: ep.id,
              episodeNumber: ep.episode_number,
              title: ep.name,
              overview: ep.overview,
              stillUrl: ep.still_path
                ? `https://image.tmdb.org/t/p/original${ep.still_path}`
                : null,
              airDate: ep.air_date,
              voteAverage: ep.vote_average,
              runtime: ep.runtime,
            })) || [];

          seasons.push({
            seasonNumber: season.season_number,
            seasonId: season.id,
            title: season.name,
            overview: season.overview,
            posterUrl: season.poster_path
              ? `https://image.tmdb.org/t/p/w500${season.poster_path}`
              : null,
            airDate: season.air_date,
            episodeCount: season.episode_count,
            episodes,
          });

          // Rate limiting
          await this.delay(100);
        } catch (error) {
          console.warn(
            `Failed to fetch season ${season.season_number}:`,
            error.message
          );
          continue;
        }
      }

      return seasons;
    } catch (error) {
      console.error("TMDB getSeasons error:", error);
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
        console.warn(
          `TMDB batch search failed for query "${query}":`,
          error.message
        );
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
      Released: MediaStatus.FINISHED,
      Ended: MediaStatus.FINISHED,
      "Returning Series": MediaStatus.RELEASING,
      "In Production": MediaStatus.RELEASING,
      Planned: MediaStatus.NOT_YET_RELEASED,
      Canceled: MediaStatus.CANCELLED,
      Cancelled: MediaStatus.CANCELLED,
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
