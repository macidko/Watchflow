import '../datasources/anime_api_datasource.dart';
import '../models/media_model.dart';
import '../../domain/repositories/anime_repository.dart';
import '../../utils/logger.dart';

/// Anime Repository implementasyonu
class AnimeRepositoryImpl implements AnimeRepository {
  final AnimeApiDatasource _datasource;
  
  /// Singleton instance
  static final AnimeRepositoryImpl _instance = AnimeRepositoryImpl._internal();
  
  factory AnimeRepositoryImpl() => _instance;
  
  AnimeRepositoryImpl._internal() : _datasource = AnimeApiDatasource();
  
  @override
  Future<List<MediaModel>> searchAnime(String query) async {
    try {
      return await _datasource.searchAnime(query);
    } catch (e) {
      AppLogger.e('AnimeRepository searchAnime hatası', e);
      rethrow;
    }
  }
  
  @override
  Future<Map<String, List<MediaModel>>> batchSearchAnime(List<String> queries) async {
    try {
      return await _datasource.batchSearchAnime(queries);
    } catch (e) {
      AppLogger.e('AnimeRepository batchSearchAnime hatası', e);
      rethrow;
    }
  }
  
  @override
  Future<MediaModel> getAnimeDetails(String id) async {
    try {
      return await _datasource.getAnimeDetails(id);
    } catch (e) {
      AppLogger.e('AnimeRepository getAnimeDetails hatası', e);
      rethrow;
    }
  }
} 