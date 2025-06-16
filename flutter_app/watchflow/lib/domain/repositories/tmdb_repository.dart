import '../../data/models/media_model.dart';

/// TMDB repository arayüzü
abstract class TmdbRepository {
  /// Film veya dizi araması yapar
  Future<List<MediaModel>> searchMedia(String query, {String type = 'multi'});
  
  /// TV şovunun sezon ve bölüm bilgilerini alır
  Future<Map<String, dynamic>> getTvShowSeasons(String tvId);
  
  /// Popüler TV şovlarını getirir
  Future<List<MediaModel>> getPopularTvShows({int page = 1});
} 