/// Uygulama sabitleri ve yapılandırma değerlerini içerir
class AppConfig {
  /// Singleton instance
  static final AppConfig _instance = AppConfig._internal();
  
  factory AppConfig() => _instance;
  
  AppConfig._internal();
  
  /// API URL'leri
  static const apiUrls = ApiUrls();
  
  /// Uygulama sürümü
  static const String appVersion = '0.9.1';
  
  /// Cache süreleri (dakika)
  static const int cacheExpirationMinutes = 60;
  
  /// API Anahtarı saklama anahtarları
  static const String tmdbApiKeyPref = 'TMDB_API_KEY';
  static const String jikanApiKeyPref = 'JIKAN_API_KEY';
  static const String anilistApiKeyPref = 'ANILIST_API_KEY';
  static const String kitsuApiKeyPref = 'KITSU_API_KEY';
  
  /// Locale anahtarı
  static const String localePref = 'app_locale';
  
  /// Tema modu anahtarı
  static const String darkModePref = 'is_dark_mode';
}

/// API URL'leri sınıfı
class ApiUrls {
  const ApiUrls();
  
  /// TMDB API URL
  final String tmdb = 'https://api.themoviedb.org/3';
  
  /// TMDB Resim URL
  final String tmdbImage = 'https://image.tmdb.org/t/p';
  
  /// Jikan API URL
  final String jikan = 'https://api.jikan.moe/v4';
  
  /// AniList API URL
  final String anilist = 'https://graphql.anilist.co';
  
  /// Kitsu API URL
  final String kitsu = 'https://kitsu.io/api/edge';
} 