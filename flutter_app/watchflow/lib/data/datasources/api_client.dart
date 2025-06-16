import 'package:dio/dio.dart';
import '../../config/app_config.dart';
import '../../utils/logger.dart';

/// API istekleri için kullanılan HTTP istemci sınıfı
class ApiClient {
  final Dio _dio;
  
  /// Singleton instance
  static final ApiClient _instance = ApiClient._internal();
  
  factory ApiClient() => _instance;
  
  ApiClient._internal() : _dio = Dio() {
    _initDio();
  }
  
  /// Dio yapılandırmasını başlat
  void _initDio() {
    _dio.options.connectTimeout = const Duration(seconds: 10);
    _dio.options.receiveTimeout = const Duration(seconds: 30);
    
    // Loglamanın yapılandırılması
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (RequestOptions options, RequestInterceptorHandler handler) {
          AppLogger.i('API İSTEĞİ [${options.method}] => ${options.uri}');
          AppLogger.d('Veri: ${options.data}');
          return handler.next(options);
        },
        onResponse: (Response response, ResponseInterceptorHandler handler) {
          AppLogger.i('API YANITI [${response.statusCode}] => ${response.requestOptions.uri}');
          AppLogger.d('Yanıt: ${response.data}');
          return handler.next(response);
        },
        onError: (DioException err, ErrorInterceptorHandler handler) {
          AppLogger.e('API HATASI [${err.response?.statusCode ?? 'BAĞLANTI HATASI'}] => ${err.requestOptions.uri}');
          AppLogger.e('Hata Mesajı: ${err.message}');
          return handler.next(err);
        },
      ),
    );
  }

  /// API anahtarı ekleyerek GET isteği gerçekleştirir
  Future<Response> get(
    String path, {
    Map<String, dynamic>? queryParameters,
    String? apiKey,
    String? baseUrl,
    Options? options,
    CancelToken? cancelToken,
  }) async {
    try {
      // API anahtarını ekle
      Map<String, dynamic> params = queryParameters ?? {};
      if (apiKey != null) {
        params['api_key'] = apiKey;
      }
      
      // Tam URL oluştur
      String fullUrl = path;
      if (baseUrl != null) {
        fullUrl = '$baseUrl$path';
      }
      
      final response = await _dio.get(
        fullUrl,
        queryParameters: params,
        options: options ?? Options(),
        cancelToken: cancelToken,
      );
      
      return response;
    } catch (e) {
      AppLogger.e('GET isteği sırasında hata: $e');
      rethrow;
    }
  }

  /// API anahtarı ekleyerek POST isteği gerçekleştirir
  Future<Response> post(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    String? apiKey,
    String? baseUrl,
    Options? options,
    CancelToken? cancelToken,
  }) async {
    try {
      // API anahtarını ekle
      Map<String, dynamic> params = queryParameters ?? {};
      if (apiKey != null) {
        params['api_key'] = apiKey;
      }

      // Tam URL oluştur
      String fullUrl = path;
      if (baseUrl != null) {
        fullUrl = '$baseUrl$path';
      }
      
      final response = await _dio.post(
        fullUrl,
        data: data,
        queryParameters: params,
        options: options ?? Options(),
        cancelToken: cancelToken,
      );
      
      return response;
    } catch (e) {
      AppLogger.e('POST isteği sırasında hata: $e');
      rethrow;
    }
  }
  
  /// API anahtarını ayarlamak için metod (eğer baseUrl değişiyorsa)
  void setBaseUrl(String url) {
    _dio.options.baseUrl = url;
  }
} 