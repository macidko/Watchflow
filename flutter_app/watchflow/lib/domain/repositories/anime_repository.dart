import '../../data/models/media_model.dart';

/// Anime repository arayüzü
abstract class AnimeRepository {
  /// Anime araması yapar
  Future<List<MediaModel>> searchAnime(String query);
  
  /// Birden fazla anime için toplu arama yapar
  Future<Map<String, List<MediaModel>>> batchSearchAnime(List<String> queries);
  
  /// Anime detaylarını alır
  Future<MediaModel> getAnimeDetails(String id);
} 