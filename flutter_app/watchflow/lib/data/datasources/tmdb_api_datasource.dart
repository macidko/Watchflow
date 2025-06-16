import 'package:dio/dio.dart';
import '../models/media_model.dart';
import '../services/api_key_service.dart';
import '../../config/app_config.dart';
import '../../utils/logger.dart';
import 'api_client.dart';

/// TMDB API veri kaynağı
class TmdbApiDatasource {
  final ApiClient _apiClient;
  final ApiKeyService _apiKeyService;
  
  /// TMDB API temel URL
  final String _baseUrl = AppConfig.apiUrls.tmdb;
  
  /// Singleton instance
  static final TmdbApiDatasource _instance = TmdbApiDatasource._internal();
  
  factory TmdbApiDatasource() => _instance;
  
  TmdbApiDatasource._internal()
      : _apiClient = ApiClient(),
        _apiKeyService = ApiKeyService();
  
  /// Film veya dizi araması yapar
  Future<List<MediaModel>> searchMedia(String query, {String type = 'multi'}) async {
    try {
      // API anahtarını al
      final apiKey = await _apiKeyService.getTmdbApiKey();
      if (apiKey == null || apiKey.isEmpty) {
        throw Exception('TMDB API anahtarı tanımlanmamış');
      }
      
      // API endpoint'i belirle
      String endpoint = '/search/multi';
      
      if (type == 'movie') {
        endpoint = '/search/movie';
      } else if (type == 'tv') {
        endpoint = '/search/tv';
      }
      
      // API isteği yap
      final response = await _apiClient.get(
        endpoint,
        baseUrl: _baseUrl,
        queryParameters: {
          'query': query,
          'language': 'en-US',
          'include_adult': false,
        },
        apiKey: apiKey,
      );
      
      // Yanıtı işle
      final results = response.data['results'] as List;
      
      // Sonuçları MediaModel listesine dönüştür
      return results.map((item) {
        // API'den dönen medya türünü al, yoksa verilen type parametresini kullan
        final mediaTypeStr = item['media_type'] ?? type;
        
        // Medya türünü belirle
        MediaType mediaType;
        if (mediaTypeStr == 'movie') {
          mediaType = MediaType.movie;
        } else if (mediaTypeStr == 'tv') {
          mediaType = MediaType.tv;
        } else {
          // Varsayılan olarak film kabul et
          mediaType = MediaType.movie;
        }
        
        return MediaModel.fromMap(item, mediaType);
      }).toList();
    } catch (e) {
      AppLogger.e('TMDB arama sırasında hata', e);
      rethrow;
    }
  }
  
  /// Popüler TV şovlarını getirir
  Future<List<MediaModel>> getPopularTvShows({int page = 1}) async {
    try {
      // API anahtarını al
      final apiKey = await _apiKeyService.getTmdbApiKey();
      if (apiKey == null || apiKey.isEmpty) {
        throw Exception('TMDB API anahtarı tanımlanmamış');
      }
      
      // API isteği yap
      final response = await _apiClient.get(
        '/tv/popular',
        baseUrl: _baseUrl,
        queryParameters: {
          'language': 'en-US',
          'page': page,
        },
        apiKey: apiKey,
      );
      
      // Yanıtı işle
      final results = response.data['results'] as List;
      
      // Sonuçları MediaModel listesine dönüştür
      return results.map((item) => MediaModel.fromMap(item, MediaType.tv)).toList();
    } catch (e) {
      AppLogger.e('Popüler TV şovları alınırken hata', e);
      rethrow;
    }
  }
  
  /// Belirtilen ID'ye sahip TV şovunun sezon ve bölüm bilgilerini alır
  Future<Map<String, dynamic>> getTvShowSeasons(String tvId) async {
    try {
      // API anahtarını al
      final apiKey = await _apiKeyService.getTmdbApiKey();
      if (apiKey == null || apiKey.isEmpty) {
        throw Exception('TMDB API anahtarı tanımlanmamış');
      }
      
      // TV şovunun detaylarını al
      final showResponse = await _apiClient.get(
        '/tv/$tvId',
        baseUrl: _baseUrl,
        queryParameters: {
          'language': 'en-US',
        },
        apiKey: apiKey,
      );
      
      final showData = showResponse.data;
      
      // Sezon bilgilerini topla
      final List<Map<String, dynamic>> seasons = [];
      
      for (final season in showData['seasons']) {
        // Özel bölümler ve kısa sezonları atla
        if (season['season_number'] == 0 || season['episode_count'] < 1) {
          continue;
        }
        
        // Her sezon için detaylı bölüm bilgilerini al
        final seasonResponse = await _apiClient.get(
          '/tv/$tvId/season/${season['season_number']}',
          baseUrl: _baseUrl,
          queryParameters: {
            'language': 'en-US',
          },
          apiKey: apiKey,
        );
        
        final seasonData = seasonResponse.data;
        
        // Bölüm bilgilerini hazırla
        final episodes = (seasonData['episodes'] as List).map((ep) => {
          'episodeId': ep['id'],
          'episodeNumber': ep['episode_number'],
          'title': ep['name'],
          'overview': ep['overview'],
          'stillUrl': ep['still_path'] != null
              ? 'https://image.tmdb.org/t/p/original${ep['still_path']}'
              : null,
          'airDate': ep['air_date'],
          'voteAverage': ep['vote_average'],
        }).toList();
        
        seasons.add({
          'seasonNumber': season['season_number'],
          'seasonName': season['name'],
          'episodeCount': episodes.length,
          'overview': season['overview'],
          'posterUrl': season['poster_path'] != null
              ? 'https://image.tmdb.org/t/p/w500${season['poster_path']}'
              : null,
          'airDate': season['air_date'],
          'episodes': episodes,
        });
      }
      
      return {
        'id': showData['id'],
        'title': showData['name'],
        'overview': showData['overview'],
        'posterUrl': showData['poster_path'] != null
            ? 'https://image.tmdb.org/t/p/w500${showData['poster_path']}'
            : null,
        'backdropUrl': showData['backdrop_path'] != null
            ? 'https://image.tmdb.org/t/p/original${showData['backdrop_path']}'
            : null,
        'totalSeasons': seasons.length,
        'seasons': seasons,
      };
    } catch (e) {
      AppLogger.e('TV şovu sezon bilgileri alınırken hata', e);
      rethrow;
    }
  }
  
  /// Medya türünü string'den enum'a dönüştür
  MediaType _getMediaType(String type) {
    switch (type) {
      case 'movie':
        return MediaType.movie;
      case 'tv':
        return MediaType.tv;
      default:
        return MediaType.movie;
    }
  }
} 