import 'package:get/get.dart';
import '../../utils/logger.dart';
import '../../domain/usecases/get_watchlist_items_usecase.dart';
import 'api_key_service.dart';
import 'api_service.dart';

/// API ve diğer servisler için GetX bağlayıcısı
class ServiceBindings extends Bindings {
  @override
  Future<void> dependencies() async {
    // API Servisi
    await _initApiService();
    
    // API Key Servisi
    _initApiKeyService();
    
    // Use-case'leri kaydet
    _initUseCases();
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
  
  void _initUseCases() {
    try {
      AppLogger.i('Use-case\'ler başlatılıyor...');
      // Watchlist Items Use-Case
      final watchlistItemsUseCase = GetWatchlistItemsUseCase();
      Get.put<GetWatchlistItemsUseCase>(watchlistItemsUseCase, permanent: true);
      AppLogger.i('Use-case\'ler başarıyla başlatıldı.');
    } catch (e) {
      AppLogger.e('Use-case\'ler başlatılırken hata oluştu', e);
    }
  }
} 