import 'package:dio/dio.dart';
import '../models/media_model.dart';
import '../../config/app_config.dart';
import '../../utils/logger.dart';
import 'api_client.dart';

/// Anime API DataSource sınıfı
/// AniList, Kitsu ve Jikan API'leri için fallback mekanizması içerir
class AnimeApiDatasource {
  final ApiClient _apiClient;
  
  // API temel URL'leri
  final String _anilistUrl = AppConfig.apiUrls.anilist;
  final String _kitsuUrl = AppConfig.apiUrls.kitsu;
  final String _jikanUrl = AppConfig.apiUrls.jikan;
  
  /// Singleton instance
  static final AnimeApiDatasource _instance = AnimeApiDatasource._internal();
  
  factory AnimeApiDatasource() => _instance;
  
  AnimeApiDatasource._internal() : _apiClient = ApiClient();
  
  /// Anime araması yapar
  Future<List<MediaModel>> searchAnime(String query) async {
    // Tüm API'leri sırayla dene
    try {
      AppLogger.i('AniList API ile anime aranıyor: $query');
      return await _searchAnimeWithAnilist(query);
    } catch (e) {
      AppLogger.w('AniList araması başarısız, Kitsu deneniyor');
      
      try {
        return await _searchAnimeWithKitsu(query);
      } catch (e) {
        AppLogger.w('Kitsu araması başarısız, Jikan deneniyor');
        
        try {
          return await _searchAnimeWithJikan(query);
        } catch (e) {
          AppLogger.e('Tüm anime API\'leri başarısız oldu', e);
          rethrow;
        }
      }
    }
  }
  
  /// Birden fazla anime için toplu arama yapar
  Future<Map<String, List<MediaModel>>> batchSearchAnime(List<String> queries) async {
    if (queries.isEmpty) {
      return {};
    }
    
    final Map<String, List<MediaModel>> results = {};
    
    try {
      // İlk olarak AniList batch API ile deneyelim
      AppLogger.i('AniList batch search ile ${queries.length} başlık aranıyor');
      final anilistResults = await _batchSearchWithAnilist(queries)
          .catchError((e) {
            AppLogger.w('AniList batch search başarısız: $e');
            return <String, List<MediaModel>>{};
          });
      
      // Bulunan sonuçları ekle
      results.addAll(anilistResults);
      
      // AniList'te bulunamayan başlıklar
      final missingTitles = queries.where(
        (title) => !results.containsKey(title) || results[title]!.isEmpty
      ).toList();
      
      if (missingTitles.isNotEmpty) {
        AppLogger.i('${missingTitles.length} başlık AniList\'te bulunamadı, Kitsu deneniyor');
        
        // Kitsu ile batch search deneyelim
        final kitsuResults = await _batchSearchWithKitsu(missingTitles)
            .catchError((e) {
              AppLogger.w('Kitsu batch search başarısız: $e');
              return <String, List<MediaModel>>{};
            });
        
        // Kitsu sonuçlarını ekle
        results.addAll(kitsuResults);
        
        // Hala bulunamayan başlıklar
        final stillMissingTitles = missingTitles.where(
          (title) => !results.containsKey(title) || results[title]!.isEmpty
        ).toList();
        
        // Jikan ile tek tek arama yap (batch desteği yok)
        if (stillMissingTitles.isNotEmpty) {
          AppLogger.i('${stillMissingTitles.length} başlık hala bulunamadı, Jikan deneniyor');
          
          for (final title in stillMissingTitles) {
            try {
              // Rate limit ile mücadele için bekle
              await Future.delayed(const Duration(milliseconds: 500));
              
              final animeList = await _searchAnimeWithJikan(title);
              results[title] = animeList;
            } catch (e) {
              AppLogger.w('Jikan araması başarısız ($title): $e');
              results[title] = [];
            }
          }
        }
      }
      
      return results;
    } catch (e) {
      AppLogger.e('Batch search sırasında beklenmeyen hata', e);
      rethrow;
    }
  }
  
  /// Anime detaylarını alır
  Future<MediaModel> getAnimeDetails(String id) async {
    // Tüm API'leri sırayla dene
    try {
      AppLogger.i('AniList API ile anime detayları alınıyor: $id');
      return await _getAnimeDetailsWithAnilist(id);
    } catch (e) {
      AppLogger.w('AniList anime detayları başarısız, Kitsu deneniyor');
      
      try {
        return await _getAnimeDetailsWithKitsu(id);
      } catch (e) {
        AppLogger.w('Kitsu anime detayları başarısız, Jikan deneniyor');
        
        try {
          return await _getAnimeDetailsWithJikan(id);
        } catch (e) {
          AppLogger.e('Tüm anime API\'leri başarısız oldu', e);
          rethrow;
        }
      }
    }
  }
  
  /// AniList API ile anime arama
  Future<List<MediaModel>> _searchAnimeWithAnilist(String query) async {
    try {
      // GraphQL sorgusu
      final String graphQuery = '''
      query {
        Page(page: 1, perPage: 10) {
          media(search: "$query", type: ANIME) {
            id
            title {
              romaji
              english
              native
            }
            description
            seasonYear
            coverImage {
              large
              extraLarge
            }
            averageScore
            episodes
          }
        }
      }
      ''';
      
      final response = await _apiClient.post(
        '',
        baseUrl: _anilistUrl,
        data: {
          'query': graphQuery,
        },
      );
      
      final data = response.data;
      final results = data['data']['Page']['media'] as List;
      
      return results.map((item) {
        return MediaModel(
          id: item['id']?.toString() ?? '',
          title: item['title']['english'] ?? item['title']['romaji'] ?? '',
          originalTitle: item['title']['native'],
          mediaType: MediaType.anime,
          overview: item['description'],
          year: item['seasonYear'],
          posterUrl: item['coverImage']['large'],
          backdropUrl: item['coverImage']['extraLarge'],
          voteAverage: (item['averageScore'] != null) 
              ? (item['averageScore'] as num).toDouble() / 10 
              : null,
        );
      }).toList();
    } catch (e) {
      AppLogger.e('AniList anime araması sırasında hata', e);
      rethrow;
    }
  }
  
  /// Kitsu API ile anime arama
  Future<List<MediaModel>> _searchAnimeWithKitsu(String query) async {
    try {
      final response = await _apiClient.get(
        '/anime',
        baseUrl: _kitsuUrl,
        queryParameters: {
          'filter[text]': query,
          'page[limit]': '10',
        },
      );
      
      final data = response.data;
      final results = data['data'] as List;
      
      return results.map((item) {
        final attrs = item['attributes'];
        return MediaModel(
          id: item['id']?.toString() ?? '',
          title: attrs['canonicalTitle'] ?? attrs['titles']['en'] ?? '',
          originalTitle: attrs['titles']['ja_jp'],
          mediaType: MediaType.anime,
          overview: attrs['synopsis'],
          year: attrs['startDate'] != null 
              ? DateTime.tryParse(attrs['startDate'])?.year 
              : null,
          posterUrl: attrs['posterImage']?['medium'],
          backdropUrl: attrs['coverImage']?['large'],
          voteAverage: (attrs['averageRating'] != null) 
              ? (double.tryParse(attrs['averageRating']) ?? 0) / 10 
              : null,
        );
      }).toList();
    } catch (e) {
      AppLogger.e('Kitsu anime araması sırasında hata', e);
      rethrow;
    }
  }
  
  /// Jikan API ile anime arama
  Future<List<MediaModel>> _searchAnimeWithJikan(String query) async {
    try {
      final response = await _apiClient.get(
        '/anime',
        baseUrl: _jikanUrl,
        queryParameters: {
          'q': query,
          'limit': '10',
        },
      );
      
      final data = response.data;
      final results = data['data'] as List;
      
      return results.map((item) {
        return MediaModel(
          id: item['mal_id']?.toString() ?? '',
          title: item['title'] ?? '',
          originalTitle: item['title_japanese'],
          mediaType: MediaType.anime,
          overview: item['synopsis'],
          year: item['aired']?['from'] != null 
              ? DateTime.tryParse(item['aired']['from'])?.year 
              : null,
          posterUrl: item['images']?['jpg']?['image_url'],
          backdropUrl: null,
          voteAverage: item['score'] != null 
              ? (item['score'] as num).toDouble() 
              : null,
        );
      }).toList();
    } catch (e) {
      AppLogger.e('Jikan anime araması sırasında hata', e);
      rethrow;
    }
  }
  
  /// AniList API ile toplu anime arama
  Future<Map<String, List<MediaModel>>> _batchSearchWithAnilist(List<String> queries) async {
    // GraphQL ile batch sorgu oluştur
    final Map<String, dynamic> queryMap = {};
    
    // Her sorgu için bir GraphQL fragment oluştur
    String fullQuery = '';
    
    for (var i = 0; i < queries.length; i++) {
      final query = queries[i].replaceAll('"', '\\"');
      fullQuery += '''
      search$i: Page(page: 1, perPage: 3) {
        media(search: "$query", type: ANIME) {
          id
          title {
            romaji
            english
            native
          }
          description
          seasonYear
          coverImage {
            large
            extraLarge
          }
          averageScore
          episodes
        }
      }
      ''';
    }
    
    // Tam sorguyu oluştur
    final String graphQuery = '''
    query {
      $fullQuery
    }
    ''';
    
    try {
      final response = await _apiClient.post(
        '',
        baseUrl: _anilistUrl,
        data: {
          'query': graphQuery,
        },
      );
      
      final data = response.data;
      final Map<String, List<MediaModel>> results = {};
      
      // Her sorgu için sonuçları işle
      for (var i = 0; i < queries.length; i++) {
        final query = queries[i];
        final searchData = data['data']?['search$i'];
        
        if (searchData != null && searchData['media'] is List) {
          final animeList = (searchData['media'] as List).map((item) {
            return MediaModel(
              id: item['id']?.toString() ?? '',
              title: item['title']['english'] ?? item['title']['romaji'] ?? '',
              originalTitle: item['title']['native'],
              mediaType: MediaType.anime,
              overview: item['description'],
              year: item['seasonYear'],
              posterUrl: item['coverImage']['large'],
              backdropUrl: item['coverImage']['extraLarge'],
              voteAverage: (item['averageScore'] != null) 
                  ? (item['averageScore'] as num).toDouble() / 10 
                  : null,
            );
          }).toList();
          
          results[query] = animeList;
        } else {
          results[query] = [];
        }
      }
      
      return results;
    } catch (e) {
      AppLogger.e('AniList batch search sırasında hata', e);
      rethrow;
    }
  }
  
  /// Kitsu API ile toplu anime arama
  Future<Map<String, List<MediaModel>>> _batchSearchWithKitsu(List<String> queries) async {
    final Map<String, List<MediaModel>> results = {};
    
    // Her sorgu için ayrı istek yap (Kitsu'nun gerçek batch API'si yok)
    for (final query in queries) {
      try {
        final animeList = await _searchAnimeWithKitsu(query);
        results[query] = animeList;
      } catch (e) {
        AppLogger.w('Kitsu araması başarısız ($query): $e');
        results[query] = [];
      }
    }
    
    return results;
  }
  
  /// AniList API ile anime detayları alma
  Future<MediaModel> _getAnimeDetailsWithAnilist(String id) async {
    try {
      // GraphQL sorgusu
      final String graphQuery = '''
      query {
        Media(id: $id, type: ANIME) {
          id
          title {
            romaji
            english
            native
          }
          description
          seasonYear
          coverImage {
            large
            extraLarge
          }
          bannerImage
          averageScore
          episodes
          status
          genres
          duration
          source
          studios {
            nodes {
              name
            }
          }
        }
      }
      ''';
      
      final response = await _apiClient.post(
        '',
        baseUrl: _anilistUrl,
        data: {
          'query': graphQuery,
        },
      );
      
      final data = response.data;
      final item = data['data']['Media'];
      
      return MediaModel(
        id: item['id']?.toString() ?? '',
        title: item['title']['english'] ?? item['title']['romaji'] ?? '',
        originalTitle: item['title']['native'],
        mediaType: MediaType.anime,
        overview: item['description'],
        year: item['seasonYear'],
        posterUrl: item['coverImage']['large'],
        backdropUrl: item['bannerImage'] ?? item['coverImage']['extraLarge'],
        voteAverage: (item['averageScore'] != null) 
            ? (item['averageScore'] as num).toDouble() / 10 
            : null,
      );
    } catch (e) {
      AppLogger.e('AniList anime detayları alınırken hata', e);
      rethrow;
    }
  }
  
  /// Kitsu API ile anime detayları alma
  Future<MediaModel> _getAnimeDetailsWithKitsu(String id) async {
    try {
      final response = await _apiClient.get(
        '/anime/$id',
        baseUrl: _kitsuUrl,
      );
      
      final data = response.data;
      final item = data['data'];
      
      final attrs = item['attributes'];
      return MediaModel(
        id: item['id']?.toString() ?? '',
        title: attrs['canonicalTitle'] ?? attrs['titles']['en'] ?? '',
        originalTitle: attrs['titles']['ja_jp'],
        mediaType: MediaType.anime,
        overview: attrs['synopsis'],
        year: attrs['startDate'] != null 
            ? DateTime.tryParse(attrs['startDate'])?.year 
            : null,
        posterUrl: attrs['posterImage']?['medium'],
        backdropUrl: attrs['coverImage']?['large'],
        voteAverage: (attrs['averageRating'] != null) 
            ? (double.tryParse(attrs['averageRating']) ?? 0) / 10 
            : null,
      );
    } catch (e) {
      AppLogger.e('Kitsu anime detayları alınırken hata', e);
      rethrow;
    }
  }
  
  /// Jikan API ile anime detayları alma
  Future<MediaModel> _getAnimeDetailsWithJikan(String id) async {
    try {
      final response = await _apiClient.get(
        '/anime/$id/full',
        baseUrl: _jikanUrl,
      );
      
      final data = response.data;
      final item = data['data'];
      
      return MediaModel(
        id: item['mal_id']?.toString() ?? '',
        title: item['title'] ?? '',
        originalTitle: item['title_japanese'],
        mediaType: MediaType.anime,
        overview: item['synopsis'],
        year: item['aired']?['from'] != null 
            ? DateTime.tryParse(item['aired']['from'])?.year 
            : null,
        posterUrl: item['images']?['jpg']?['image_url'],
        backdropUrl: null,
        voteAverage: item['score'] != null 
            ? (item['score'] as num).toDouble() 
            : null,
      );
    } catch (e) {
      AppLogger.e('Jikan anime detayları alınırken hata', e);
      rethrow;
    }
  }
}