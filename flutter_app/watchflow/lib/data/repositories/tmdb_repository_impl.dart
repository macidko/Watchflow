import '../datasources/tmdb_api_datasource.dart';
import '../models/media_model.dart';
import '../../domain/repositories/tmdb_repository.dart';
import '../../utils/logger.dart';

/// TMDB Repository implementasyonu
class TmdbRepositoryImpl implements TmdbRepository {
  final TmdbApiDatasource _datasource;
  
  /// Singleton instance
  static final TmdbRepositoryImpl _instance = TmdbRepositoryImpl._internal();
  
  factory TmdbRepositoryImpl() => _instance;
  
  TmdbRepositoryImpl._internal() : _datasource = TmdbApiDatasource();
  
  @override
  Future<List<MediaModel>> searchMedia(String query, {String type = 'multi'}) async {
    try {
      return await _datasource.searchMedia(query, type: type);
    } catch (e) {
      AppLogger.e('TmdbRepository searchMedia hatası', e);
      rethrow;
    }
  }
  
  @override
  Future<Map<String, dynamic>> getTvShowSeasons(String tvId) async {
    try {
      return await _datasource.getTvShowSeasons(tvId);
    } catch (e) {
      AppLogger.e('TmdbRepository getTvShowSeasons hatası', e);
      rethrow;
    }
  }
  
  @override
  Future<List<MediaModel>> getPopularTvShows({int page = 1}) async {
    try {
      return await _datasource.getPopularTvShows(page: page);
    } catch (e) {
      AppLogger.e('TmdbRepository getPopularTvShows hatası', e);
      rethrow;
    }
  }
} 