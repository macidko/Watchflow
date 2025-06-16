import 'package:get/get.dart';
import '../../utils/logger.dart';
import 'api_key_service.dart';
import 'api_service.dart';

/// API ve diğer servisler için GetX bağlayıcısı
class ServiceBindings extends Bindings {
  @override
  void dependencies() {
    // API Servisi
    _initApiService();
    
    // API Key Servisi
    _initApiKeyService();
  }
  
  Future<void> _initApiService() async {
    try {
      AppLogger.i('API Servisi başlatılıyor...');
      final apiService = await ApiService().init();
      Get.put<ApiService>(apiService, permanent: true);
      AppLogger.i('API Servisi başarıyla başlatıldı.');
    } catch (e) {
      AppLogger.e('API Servisi başlatılırken hata oluştu', e);
    }
  }
  
  void _initApiKeyService() {
    try {
      AppLogger.i('API Key Servisi başlatılıyor...');
      final apiKeyService = ApiKeyService();
      Get.put<ApiKeyService>(apiKeyService, permanent: true);
      AppLogger.i('API Key Servisi başarıyla başlatıldı.');
    } catch (e) {
      AppLogger.e('API Key Servisi başlatılırken hata oluştu', e);
    }
  }
} 