import 'package:get/get.dart';
import 'package:watchflow/domain/entities/media_entity.dart';
import 'package:watchflow/domain/usecases/get_watchlist_items_usecase.dart';

class HomeController extends GetxController {
  final GetWatchlistItemsUseCase _getWatchlistItemsUseCase = GetWatchlistItemsUseCase();
  
  var isLoading = true.obs;
  var watchingItems = <MediaEntity>[].obs;
  var planToWatchItems = <MediaEntity>[].obs;
  var completedItems = <MediaEntity>[].obs;
  
  final _customSliders = <String, RxList<MediaEntity>>{}.obs;
  
  @override
  void onInit() {
    super.onInit();
    loadWatchlistData();
  }
  
  Future<void> loadWatchlistData() async {
    isLoading(true);
    try {
      // Wacthing kategorisini yükle
      final watchingResult = await _getWatchlistItemsUseCase.call(
        status: 'watching', 
        mediaType: 'all'
      );
      watchingItems.value = watchingResult;
      
      // Plan to watch kategorisini yükle
      final planToWatchResult = await _getWatchlistItemsUseCase.call(
        status: 'plan_to_watch', 
        mediaType: 'all'
      );
      planToWatchItems.value = planToWatchResult;
      
      // Completed kategorisini yükle
      final completedResult = await _getWatchlistItemsUseCase.call(
        status: 'completed', 
        mediaType: 'all'
      );
      completedItems.value = completedResult;
      
      // Özel sliderları yükle
      await loadCustomSliders();
      
    } catch (e) {
      // Hata yönetimi
      print('Error loading watchlist data: $e');
    } finally {
      isLoading(false);
    }
  }
  
  Future<void> loadCustomSliders() async {
    try {
      // TODO: Mevcut özel sliderları getir
      // Şimdilik örnek veri
      _customSliders['custom_1'] = <MediaEntity>[].obs;
      
    } catch (e) {
      print('Error loading custom sliders: $e');
    }
  }
  
  List<MediaEntity> customSliderItems(String sliderId) {
    return _customSliders[sliderId]?.toList() ?? [];
  }
  
  void seeAllItems(String category) {
    // Tümünü göster sayfasına yönlendir
    Get.toNamed('/all-items', arguments: {
      'category': category,
      'title': getCategoryTitle(category),
    });
  }
  
  String getCategoryTitle(String category) {
    switch (category) {
      case 'watching':
        return 'İzleniyor';
      case 'plan_to_watch':
        return 'İzlenecekler';
      case 'completed':
        return 'İzlenenler';
      case 'custom_1':
        return 'Özel Liste 1';
      default:
        return 'İçerikler';
    }
  }
}
