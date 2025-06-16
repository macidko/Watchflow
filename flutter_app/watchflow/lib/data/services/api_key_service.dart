import 'dart:convert';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'dart:io' show Platform;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:hive/hive.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../config/app_config.dart';
import '../../utils/logger.dart';

/// API anahtarlarını güvenli bir şekilde yöneten servis
class ApiKeyService {
  /// Singleton instance
  static final ApiKeyService _instance = ApiKeyService._internal();
  
  factory ApiKeyService() => _instance;
  
  // Hangi depolama mekanizmasının kullanılacağını belirleyen değişken
  late final StorageInterface _storage;
  
  ApiKeyService._internal() {
    _storage = _initializeStorage();
    AppLogger.i('ApiKeyService başlatıldı: ${_storage.runtimeType}');
  }

  // Platform tipine göre en uygun depolama mekanizmasını seçme
  StorageInterface _initializeStorage() {
    if (kIsWeb) {
      return WebStorage();
    } else if (Platform.isAndroid || Platform.isIOS) {
      return MobileSecureStorage();
    } else {
      return DesktopStorage();
    }
  }
  
  /// TMDB API anahtarını kaydet
  Future<bool> saveTmdbApiKey(String apiKey) async {
    try {
      await _storage.write(AppConfig.tmdbApiKeyPref, apiKey);
      AppLogger.i('TMDB API anahtarı kaydedildi');
      return true;
    } catch (e) {
      AppLogger.e('TMDB API anahtarı kaydedilirken hata oluştu', e);
      return false;
    }
  }
  
  /// TMDB API anahtarını al
  Future<String?> getTmdbApiKey() async {
    try {
      return await _storage.read(AppConfig.tmdbApiKeyPref);
    } catch (e) {
      AppLogger.e('TMDB API anahtarı okunurken hata', e);
      return null;
    }
  }
  
  /// API anahtarlarının var olup olmadığını kontrol et
  Future<bool> hasApiKeys() async {
    final tmdbApiKey = await getTmdbApiKey();
    return tmdbApiKey != null && tmdbApiKey.isNotEmpty;
  }
  
  /// Tüm API anahtarlarını içeren map döndür
  Future<Map<String, String>> getAllApiKeys() async {
    final tmdbApiKey = await getTmdbApiKey() ?? '';
    final jikanApiKey = await getApiKey('jikan') ?? '';
    final anilistApiKey = await getApiKey('anilist') ?? '';
    final kitsuApiKey = await getApiKey('kitsu') ?? '';
    
    return {
      'TMDB_API_KEY': tmdbApiKey,
      'JIKAN_API_KEY': jikanApiKey,
      'ANILIST_API_KEY': anilistApiKey,
      'KITSU_API_KEY': kitsuApiKey,
    };
  }
  
  /// API anahtarını kaydet (genel)
  Future<bool> saveApiKey(String serviceName, String apiKey) async {
    try {
      await _storage.write('${serviceName}_api_key', apiKey);
      AppLogger.i('$serviceName API anahtarı kaydedildi');
      return true;
    } catch (e) {
      AppLogger.e('$serviceName API anahtarı kaydedilirken hata', e);
      return false;
    }
  }
  
  /// API anahtarını al (genel)
  Future<String?> getApiKey(String serviceName) async {
    try {
      return await _storage.read('${serviceName}_api_key');
    } catch (e) {
      AppLogger.e('$serviceName API anahtarı okunurken hata', e);
      return null;
    }
  }
  
  /// API anahtarlarını temizle
  Future<bool> clearApiKeys() async {
    try {
      await _storage.delete(AppConfig.tmdbApiKeyPref);
      // İhtiyaç halinde diğer anahtarlar için silme işlemleri eklenebilir
      AppLogger.i('API anahtarları temizlendi');
      return true;
    } catch (e) {
      AppLogger.e('API anahtarları temizlenirken hata', e);
      return false;
    }
  }
}

/// Depolama arayüzü
abstract class StorageInterface {
  Future<void> write(String key, String value);
  Future<String?> read(String key);
  Future<void> delete(String key);
}

/// Mobil için güvenli depolama
class MobileSecureStorage implements StorageInterface {
  final _storage = const FlutterSecureStorage();
  
  @override
  Future<void> write(String key, String value) async {
    await _storage.write(key: key, value: value);
  }
  
  @override
  Future<String?> read(String key) async {
    return await _storage.read(key: key);
  }
  
  @override
  Future<void> delete(String key) async {
    await _storage.delete(key: key);
  }
}

/// Desktop için Hive tabanlı çözüm
class DesktopStorage implements StorageInterface {
  static const String _boxName = 'api_keys';
  late Box _box;
  bool _isInitialized = false;
  
  DesktopStorage() {
    _initBox();
  }
  
  Future<void> _initBox() async {
    if (!_isInitialized) {
      await Hive.initFlutter('watchflow_storage');
      _box = await Hive.openBox(_boxName);
      _isInitialized = true;
    }
  }
  
  @override
  Future<void> write(String key, String value) async {
    await _ensureInitialized();
    // Basit bir obfuscation
    String obfuscatedValue = _obscureData(value);
    await _box.put(key, obfuscatedValue);
  }
  
  @override
  Future<String?> read(String key) async {
    await _ensureInitialized();
    String? obfuscatedValue = _box.get(key);
    if (obfuscatedValue == null) return null;
    
    return _deobscureData(obfuscatedValue);
  }
  
  @override
  Future<void> delete(String key) async {
    await _ensureInitialized();
    await _box.delete(key);
  }
  
  Future<void> _ensureInitialized() async {
    if (!_isInitialized) {
      await _initBox();
    }
  }
  
  String _obscureData(String value) {
    return base64Encode(utf8.encode(value));
  }
  
  String _deobscureData(String value) {
    return utf8.decode(base64Decode(value));
  }
}

/// Web için depolama
class WebStorage implements StorageInterface {
  @override
  Future<void> write(String key, String value) async {
    final prefs = await SharedPreferences.getInstance();
    String obscured = _obscureForWeb(value);
    await prefs.setString(key, obscured);
  }
  
  @override
  Future<String?> read(String key) async {
    final prefs = await SharedPreferences.getInstance();
    String? value = prefs.getString(key);
    return value != null ? _deobscureForWeb(value) : null;
  }
  
  @override
  Future<void> delete(String key) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(key);
  }
  
  String _obscureForWeb(String value) {
    // Web için basit bir obfuscation
    return base64Encode(utf8.encode(value.split('').reversed.join()));
  }
  
  String _deobscureForWeb(String value) {
    return utf8.decode(base64Decode(value)).split('').reversed.join();
  }
} 