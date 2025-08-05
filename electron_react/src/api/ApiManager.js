import { AniListApi } from './providers/AniListApi.js';
import { KitsuApi } from './providers/KitsuApi.js';
import { JikanApi } from './providers/JikanApi.js';
import { TmdbApi } from './providers/TmdbApi.js';
import { MediaTypes, ApiProviders, ApiStatus } from './base/MediaTypes.js';

/**
 * API Manager - Strategy Pattern Implementation
 * Tüm API provider'ları yönetir ve fallback chain'leri sağlar
 */
export class ApiManager {
  constructor(config = {}) {
    this.providers = new Map();
    this.fallbackChains = new Map();
    this.config = {
      enableParallelSearch: false, // Parallel search for better performance
      defaultTimeout: 10000, // 10 seconds
      maxConcurrentRequests: 3,
      ...config
    };
    
    this.initializeProviders();
    this.setupFallbackChains();
  }

  /**
   * API provider'larını başlatır
   */
  initializeProviders() {
    try {
      this.providers.set(ApiProviders.ANILIST, new AniListApi());
      this.providers.set(ApiProviders.KITSU, new KitsuApi());
      this.providers.set(ApiProviders.JIKAN, new JikanApi());
      this.providers.set(ApiProviders.TMDB, new TmdbApi());
      
      console.log('API providers initialized successfully');
    } catch (error) {
      console.error('Failed to initialize API providers:', error);
    }
  }

  /**
   * Fallback chain'lerini kurar
   */
  setupFallbackChains() {
    // Anime için fallback chain: AniList -> Kitsu -> Jikan
    this.fallbackChains.set(MediaTypes.ANIME, [
      ApiProviders.ANILIST,
      ApiProviders.KITSU,
      ApiProviders.JIKAN
    ]);

    // Film için fallback chain: sadece TMDB
    this.fallbackChains.set(MediaTypes.MOVIE, [
      ApiProviders.TMDB
    ]);

    // TV şovu için fallback chain: sadece TMDB
    this.fallbackChains.set(MediaTypes.TV, [
      ApiProviders.TMDB
    ]);

    // Multi search için: tüm provider'lar
    this.fallbackChains.set(MediaTypes.MULTI, [
      ApiProviders.TMDB,
      ApiProviders.ANILIST
    ]);
  }

  /**
   * Ana arama fonksiyonu
   */
  async search(query, mediaType, options = {}) {
    const { 
      useFirstProvider = false,
      timeout = this.config.defaultTimeout,
      enableFallback = true 
    } = options;

    if (!query || query.trim().length === 0) {
      throw new Error('Search query cannot be empty');
    }

    const providers = this.fallbackChains.get(mediaType) || [];
    
    if (providers.length === 0) {
      throw new Error(`No providers configured for media type: ${mediaType}`);
    }

    // Eğer sadece ilk provider kullanılacaksa
    if (useFirstProvider) {
      return this.searchWithProvider(providers[0], query, mediaType, options);
    }

    // Parallel search enabled ise
    if (this.config.enableParallelSearch && mediaType === MediaTypes.MULTI) {
      return this.parallelSearch(query, providers, mediaType, options);
    }

    // Sequential fallback search
    return this.sequentialSearch(query, providers, mediaType, options, enableFallback);
  }

  /**
   * Belirli bir provider ile arama yapar
   */
  async searchWithProvider(providerName, query, mediaType, options = {}) {
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new Error(`Provider not found: ${providerName}`);
    }

    try {
      console.log(`Searching with ${providerName} for "${query}"`);
      const startTime = Date.now();
      
      const results = await this.withTimeout(
        provider.search(query, { ...options, type: mediaType }),
        options.timeout || this.config.defaultTimeout
      );

      const duration = Date.now() - startTime;
      console.log(`${providerName} search completed in ${duration}ms, found ${results?.length || 0} results`);

      return {
        results: results || [],
        provider: providerName,
        status: ApiStatus.SUCCESS,
        duration,
        query
      };
    } catch (error) {
      console.error(`${providerName} search failed:`, error.message);
      return {
        results: [],
        provider: providerName,
        status: ApiStatus.FAILED,
        error: error.message,
        query
      };
    }
  }

  /**
   * Sequential search with fallback
   */
  async sequentialSearch(query, providers, mediaType, options, enableFallback) {
    let lastError = null;

    for (const providerName of providers) {
      try {
        const result = await this.searchWithProvider(providerName, query, mediaType, options);
        
        if (result.status === ApiStatus.SUCCESS && result.results.length > 0) {
          return result;
        }

        if (!enableFallback) {
          return result;
        }

        lastError = result.error;
      } catch (error) {
        lastError = error.message;
        console.warn(`Provider ${providerName} failed, trying next...`);
        continue;
      }
    }

    // Tüm provider'lar başarısız
    console.warn('All providers failed for search');
    return {
      results: [],
      provider: 'none',
      status: ApiStatus.FAILED,
      error: lastError || 'All providers failed',
      query
    };
  }

  /**
   * Parallel search (experimental)
   */
  async parallelSearch(query, providers, mediaType, options) {
    const promises = providers.map(providerName => 
      this.searchWithProvider(providerName, query, mediaType, options)
    );

    try {
      const results = await Promise.allSettled(promises);
      
      // İlk başarılı sonucu döndür
      for (const result of results) {
        if (result.status === 'fulfilled' && 
            result.value.status === ApiStatus.SUCCESS && 
            result.value.results.length > 0) {
          return result.value;
        }
      }

      // Hiçbiri başarılı değilse, en iyi sonucu döndür
      const fulfilled = results
        .filter(r => r.status === 'fulfilled')
        .map(r => r.value)
        .sort((a, b) => b.results.length - a.results.length);

      return fulfilled[0] || {
        results: [],
        provider: 'parallel',
        status: ApiStatus.FAILED,
        error: 'No results from parallel search',
        query
      };
    } catch (error) {
      console.error('Parallel search failed:', error);
      return {
        results: [],
        provider: 'parallel',
        status: ApiStatus.FAILED,
        error: error.message,
        query
      };
    }
  }

  /**
   * Batch search implementation
   */
  async batchSearch(queries, mediaType, options = {}) {
    const {
      useOptimizedBatch = true,
      chunkSize = 5
    } = options;

    if (!Array.isArray(queries) || queries.length === 0) {
      return {};
    }

    const providers = this.fallbackChains.get(mediaType) || [];
    if (providers.length === 0) {
      throw new Error(`No providers configured for media type: ${mediaType}`);
    }

    // İlk provider ile batch search dene
    const primaryProvider = this.providers.get(providers[0]);
    
    if (useOptimizedBatch && primaryProvider.batchSearch) {
      try {
        console.log(`Using optimized batch search with ${providers[0]}`);
        const results = await primaryProvider.batchSearch(queries, options);
        
        // Boş sonuçları fallback ile doldur
        const emptyQueries = Object.keys(results).filter(q => 
          !results[q] || results[q].length === 0
        );

        if (emptyQueries.length > 0) {
          console.log(`Filling ${emptyQueries.length} empty results with fallback`);
          for (const query of emptyQueries) {
            const fallbackResult = await this.search(query, mediaType, options);
            results[query] = fallbackResult.results || [];
          }
        }

        return results;
      } catch (error) {
        console.warn('Optimized batch search failed, falling back to sequential');
      }
    }

    // Sequential batch search
    return this.sequentialBatchSearch(queries, mediaType, options, chunkSize);
  }

  /**
   * Sequential batch search with chunking
   */
  async sequentialBatchSearch(queries, mediaType, options, chunkSize) {
    const results = {};
    
    // Chunk'lara böl
    const chunks = [];
    for (let i = 0; i < queries.length; i += chunkSize) {
      chunks.push(queries.slice(i, i + chunkSize));
    }

    for (const chunk of chunks) {
      const chunkPromises = chunk.map(async query => {
        const result = await this.search(query, mediaType, options);
        return { query, results: result.results || [] };
      });

      try {
        const chunkResults = await Promise.all(chunkPromises);
        chunkResults.forEach(({ query, results: queryResults }) => {
          results[query] = queryResults;
        });

        // Rate limiting between chunks
        if (chunks.indexOf(chunk) < chunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (error) {
        console.error('Chunk processing failed:', error);
        // Continue with next chunk
      }
    }

    return results;
  }

  /**
   * Get details for a specific item
   */
  async getDetails(id, mediaType, providerName = null) {
    const providers = providerName 
      ? [providerName] 
      : this.fallbackChains.get(mediaType) || [];

    for (const currentProvider of providers) {
      try {
        const provider = this.providers.get(currentProvider);
        if (!provider) continue;

        console.log(`Getting details with ${currentProvider} for ID: ${id}`);
        return await provider.getDetails(id, mediaType);
      } catch (error) {
        console.warn(`${currentProvider} getDetails failed:`, error.message);
        continue;
      }
    }

    throw new Error('All providers failed for getDetails');
  }

  /**
   * Get seasons for a TV show/anime
   */
  async getSeasons(id, mediaType, providerName = null) {
    const providers = providerName 
      ? [providerName] 
      : this.fallbackChains.get(mediaType) || [];

    for (const currentProvider of providers) {
      try {
        const provider = this.providers.get(currentProvider);
        if (!provider) continue;

        console.log(`Getting seasons with ${currentProvider} for ID: ${id}`);
        return await provider.getSeasons(id);
      } catch (error) {
        console.warn(`${currentProvider} getSeasons failed:`, error.message);
        continue;
      }
    }

    throw new Error('All providers failed for getSeasons');
  }

  /**
   * Timeout wrapper
   */
  async withTimeout(promise, timeout) {
    return Promise.race([
      promise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), timeout)
      )
    ]);
  }

  /**
   * Get available providers for a media type
   */
  getProvidersForMediaType(mediaType) {
    return this.fallbackChains.get(mediaType) || [];
  }

  /**
   * Check if a provider is available
   */
  isProviderAvailable(providerName) {
    return this.providers.has(providerName);
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig() {
    return { ...this.config };
  }
}
