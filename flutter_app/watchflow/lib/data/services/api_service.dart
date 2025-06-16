import 'package:get/get.dart';
import '../repositories/tmdb_repository_impl.dart';
import '../repositories/anime_repository_impl.dart';
import '../../domain/repositories/tmdb_repository.dart';
import '../../domain/repositories/anime_repository.dart';
import '../models/media_model.dart';
import '../services/api_key_service.dart';
import '../../config/app_config.dart';
import '../../utils/logger.dart';

/// API servis sınıfı - Tüm API işlemlerini yönetir
class ApiService extends GetxService {
  late final TmdbRepository _tmdbRepository;
  late final AnimeRepository _animeRepository;
  final ApiKeyService _apiKeyService;
  
  /// API anahtarlarının var olup olmadığı
  final RxBool hasApiKeys = false.obs;
  
  ApiService()
      : _tmdbRepository = TmdbRepositoryImpl(),
        _animeRepository = AnimeRepositoryImpl(),
        _apiKeyService = ApiKeyService();
  
  /// Servisi başlat
  Future<ApiService> init() async {
    AppLogger.i('API Servisi başlatılıyor...');
    
    // API anahtarlarını kontrol et
    hasApiKeys.value = await _apiKeyService.hasApiKeys();
    
    AppLogger.i('API Servisi başlatıldı. API anahtarları var mı: ${hasApiKeys.value}');
    
    return this;
  }
  
  /// TMDB API ile film veya dizi arama
  Future<List<MediaModel>> searchMediaWithTmdb(String query, {String type = 'multi'}) {
    return _tmdbRepository.searchMedia(query, type: type);
  }
  
  /// TMDB API ile TV şovu sezon bilgileri alma
  Future<Map<String, dynamic>> getTvShowSeasons(String tvId) {
    return _tmdbRepository.getTvShowSeasons(tvId);
  }
  
  /// TMDB API ile popüler TV şovlarını getir
  Future<List<MediaModel>> getPopularTvShows({int page = 1}) {
    return _tmdbRepository.getPopularTvShows(page: page);
  }
  
  /// Anime arama
  Future<List<MediaModel>> searchAnime(String query) {
    return _animeRepository.searchAnime(query);
  }
  
  /// Toplu anime arama
  Future<Map<String, List<MediaModel>>> batchSearchAnime(List<String> queries) {
    return _animeRepository.batchSearchAnime(queries);
  }
  
  /// Anime detayları alma
  Future<MediaModel> getAnimeDetails(String id) {
    return _animeRepository.getAnimeDetails(id);
  }
  
  /// TMDB API anahtarını kaydet
  Future<bool> saveTmdbApiKey(String apiKey) async {
    final result = await _apiKeyService.saveTmdbApiKey(apiKey);
    if (result) {
      hasApiKeys.value = await _apiKeyService.hasApiKeys();
    }
    return result;
  }
  
  /// Jikan API anahtarını kaydet
  Future<bool> saveJikanApiKey(String apiKey) async {
    final result = await _apiKeyService.saveApiKey('jikan', apiKey);
    return result;
  }
  
  /// AniList API anahtarını kaydet
  Future<bool> saveAnilistApiKey(String apiKey) async {
    final result = await _apiKeyService.saveApiKey('anilist', apiKey);
    return result;
  }
  
  /// Kitsu API anahtarını kaydet
  Future<bool> saveKitsuApiKey(String apiKey) async {
    final result = await _apiKeyService.saveApiKey('kitsu', apiKey);
    return result;
  }
  
  /// Belirli bir servise ait API anahtarını al
  Future<String?> getApiKey(String serviceName) async {
    return _apiKeyService.getApiKey(serviceName);
  }
  
  /// TMDB API anahtarını al
  Future<String?> getTmdbApiKey() async {
    return _apiKeyService.getTmdbApiKey();
  }
  
  /// Tüm API anahtarlarını al
  Future<Map<String, String>> getAllApiKeys() {
    return _apiKeyService.getAllApiKeys();
  }
  
  /// API anahtarlarını temizle
  Future<bool> clearApiKeys() async {
    final result = await _apiKeyService.clearApiKeys();
    if (result) {
      hasApiKeys.value = false;
    }
    return result;
  }
} 