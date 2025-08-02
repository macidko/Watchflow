import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:watchflow/presentation/theme/app_colors.dart';
import 'package:get/get.dart';
import 'package:watchflow/domain/entities/media_entity.dart';
import 'package:watchflow/presentation/controllers/media_search_controller.dart';
import 'package:watchflow/presentation/widgets/search_result_item.dart';
import 'package:watchflow/data/repositories/tmdb_repository_impl.dart';
import 'package:watchflow/data/repositories/anime_repository_impl.dart';
import 'package:watchflow/data/models/media_model.dart';
import 'package:watchflow/data/services/api_service.dart';
import 'package:hive/hive.dart';
import 'package:watchflow/utils/slider_utils.dart';

class SearchModal extends StatefulWidget {
  const SearchModal({super.key});

  @override
  State<SearchModal> createState() => _SearchModalState();
}

class _SearchModalState extends State<SearchModal> with SingleTickerProviderStateMixin {
  final MediaSearchController _searchController =
      Get.put(MediaSearchController());
  late TabController _tabController;
  final List<String> _tabTitles = ['Movie', 'Series', 'Anime'];
  int _currentTabIndex = 0;
  // Tab index'e göre arama handler'ları: 0=Movie, 1=Series, 2=Anime
  final Map<int, Future<List<MediaEntity>> Function(String)> _searchHandlers = {};
  final TextEditingController _searchQueryController = TextEditingController();

  final List<MediaEntity> _dummyData = [
    MediaEntity(
      id: 1,
      title: 'Inception',
      mediaType: 'movie',
      releaseDate: '2010-07-16',
      posterPath: 'https://image.tmdb.org/t/p/w500/qmDpIHrmpJINaRKAfWQfftjCdyi.jpg',
    ),
    MediaEntity(
      id: 2,
      title: 'Breaking Bad',
      mediaType: 'tv',
      releaseDate: '2008-01-20',
      posterPath: 'https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
    ),
    MediaEntity(
      id: 3,
      title: 'Attack on Titan',
      mediaType: 'anime',
      releaseDate: '2013-04-07',
      posterPath: 'https://image.tmdb.org/t/p/w500/hTP1DtLGFamjfu8WqjnuQdP1n4i.jpg',
    ),
  ];

  Map<String, List<Map<String, dynamic>>> _slidersConfig = {};
  // Her medya için seçili slider'ı tutan map
  final Map<int, String?> _selectedSliderIds = {};
  
  // Uygulama başlatma işlemleri
  Future<void> _initializeApp() async {
    try {
      // Önce slider yapılandırmasının varlığından emin olalım
      await initSlidersIfNeeded();
      // Sonra yapılandırmayı yükle
      await _loadSlidersConfig();
    } catch (e) {
      print('Error initializing app: $e');
      // Hata durumunda varsayılan değerler kullan
      _setDefaultSlidersInMemory();
    }
  }
  
  // Hafızada varsayılan slider yapılandırması oluştur (Hive'dan bağımsız)
  void _setDefaultSlidersInMemory() {
    setState(() {
      final defaultSliders = [
        {'id': 'watching', 'title': 'İzleniyor', 'color': '#2196F3'},
        {'id': 'completed', 'title': 'İzlendi', 'color': '#4CAF50'},
        {'id': 'plan', 'title': 'İzlenecek', 'color': '#FF9800'}
      ];
      
      _slidersConfig = {
        'home': List<Map<String, dynamic>>.from(defaultSliders),
        'movie': List<Map<String, dynamic>>.from(defaultSliders),
        'series': List<Map<String, dynamic>>.from(defaultSliders),
        'anime': List<Map<String, dynamic>>.from(defaultSliders),
      };
      
      _slidersConfig['tv'] = _slidersConfig['series']!;
      
      print('Using default sliders in memory');
    });
  }


  Future<void> _loadSlidersConfig() async {
    // Önce slider yapılandırmasının varlığından emin olalım
    await initSlidersIfNeeded();
    
    var box = await Hive.openBox('slidersBox');
    
    try {
      // Tüm slider yapılandırmalarını al
      final home = box.get('home') ?? [];
      final movie = box.get('movie') ?? [];
      final series = box.get('series') ?? [];
      final anime = box.get('anime') ?? [];
      
      // Güvenli dönüşüm fonksiyonu
      List<Map<String, dynamic>> convertToMapList(dynamic data) {
        if (data is List) {
          return data.map<Map<String, dynamic>>((item) {
            if (item is Map) {
              // Map<dynamic, dynamic>'dan Map<String, dynamic>'a dönüştür
              return Map<String, dynamic>.from(item.map((key, value) => 
                MapEntry(key.toString(), value)));
            }
            return <String, dynamic>{};
          }).toList();
        }
        return [];
      }
      
      setState(() {
        _slidersConfig = {
          'home': convertToMapList(home),
          'movie': convertToMapList(movie),
          'series': convertToMapList(series),
          'anime': convertToMapList(anime),
        };
        
        // TV için seriesi kullan
        _slidersConfig['tv'] = _slidersConfig['series']!;
      });
    } catch (e) {
      print('Error loading slider config: $e');
      // Hata durumunda varsayılan değerler kullan
      _setDefaultSlidersInMemory();
    }
    
    print('Sliders config loaded from Hive: ${_slidersConfig.keys}');
    print('Movie sliders: ${_slidersConfig['movie']?.length ?? 0} sliders found');
    for (var slider in _slidersConfig['movie'] ?? []) {
      print('Movie slider: ${slider['id']} - ${slider['title']}');
    }
  }

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: _tabTitles.length, vsync: this);
    _tabController.addListener(() {
      if (!_tabController.indexIsChanging) {
        setState(() {
          _currentTabIndex = _tabController.index;
        });
        _loadSlidersConfig();
        if (_searchQueryController.text.trim().isNotEmpty) {
          _onSearch();
        }
      }
    });
    
    // Başlangıçta slider yapılandırmasını yükle ve varsayılan değerleri oluştur
    _initializeApp();
    // Tab'a göre API handler'ları
    _searchHandlers[0] = _searchMoviesFromTmdb;
    _searchHandlers[1] = _searchTvFromTmdb;
    _searchHandlers[2] = _searchAnimeFromAnilist;
    _searchQueryController.addListener(() {
      setState(() {}); // Temizle butonunu göstermek/gizlemek için yeniden çiz
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    _searchQueryController.dispose();
    super.dispose();
  }

  void _onSearch() {
    FocusScope.of(context).unfocus();
    final query = _searchQueryController.text.trim();
    if (query.isEmpty) {
      setState(() {
        _searchController.searchResults.value = _dummyData;
        _searchController.hasSearched.value = true;
      });
    } else {
      final handler = _searchHandlers[_currentTabIndex];
      if (handler != null) {
        _searchController.isLoading.value = true;
        handler(query).then((results) {
          _searchController.searchResults.value = results;
          _searchController.hasSearched.value = true;
        }).whenComplete(() {
          _searchController.isLoading.value = false;
        });
      } else {
        _searchController.performSearch(query);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    // Ekran görüntüsünden ilham alan sade ve temiz bir tasarım
    return Dialog(
      backgroundColor: AppColors.secondaryBg,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      insetPadding:
          const EdgeInsets.symmetric(horizontal: 100.0, vertical: 80.0),
      child: SizedBox(
        width: 700,
        height: 600,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildNewSearchBar(),
            _buildTabs(),
            const Divider(height: 1, color: AppColors.border),
            Expanded(child: _buildBody()),
          ],
        ),
      ),
    );
  }

  Widget _buildNewSearchBar() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
      child: TextField(
        controller: _searchQueryController,
        autofocus: true,
        style: const TextStyle(fontSize: 16, color: AppColors.primaryText),
        decoration: InputDecoration(
          hintText: 'Film, Dizi veya Anime Ara...',
          hintStyle: const TextStyle(color: AppColors.secondaryText),
          prefixIcon: const Icon(Icons.search, size: 24, color: AppColors.secondaryText),
          suffixIcon: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (_searchQueryController.text.isNotEmpty)
                IconButton(
                  icon: const Icon(Icons.close_rounded, color: AppColors.secondaryText),
                  tooltip: 'Temizle',
                  onPressed: () {
                    _searchQueryController.clear();
                  },
                ),
              IconButton(
                icon: const Icon(Icons.arrow_forward_rounded, color: AppColors.accent),
                tooltip: 'Ara',
                onPressed: _onSearch,
              ),
            ],
          ),
          filled: true,
          fillColor: AppColors.primaryBg,
          contentPadding: const EdgeInsets.symmetric(vertical: 16),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide.none,
          ),
        ),
        onSubmitted: (value) => _onSearch(),
      ),
    );
  }

  Widget _buildTabs() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0),
      child: TabBar(
        controller: _tabController,
        labelColor: AppColors.accent,
        unselectedLabelColor: AppColors.secondaryText,
        indicatorColor: AppColors.accent,
        indicatorWeight: 2.5,
        labelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
        unselectedLabelStyle:
            const TextStyle(fontWeight: FontWeight.normal, fontSize: 15),
        tabs: _tabTitles.map((title) => Tab(text: title)).toList(),
      ),
    );
  }

  // Dummy API fonksiyonları, burada gerçek API entegrasyonu yapılabilir
  // TMDB'den film arama
  Future<List<MediaEntity>> _searchMoviesFromTmdb(String query) async {
    final apiService = Get.find<ApiService>();
    final mediaModels = await apiService.searchMediaWithTmdb(query, type: 'movie');
    return mediaModels.map(_mediaModelToEntity).toList();
  }

  // TMDB'den dizi arama
  Future<List<MediaEntity>> _searchTvFromTmdb(String query) async {
    final apiService = Get.find<ApiService>();
    final mediaModels = await apiService.searchMediaWithTmdb(query, type: 'tv');
    return mediaModels.map(_mediaModelToEntity).toList();
  }

  // AniList'ten anime arama
  Future<List<MediaEntity>> _searchAnimeFromAnilist(String query) async {
    final apiService = Get.find<ApiService>();
    final mediaModels = await apiService.searchAnime(query);
    return mediaModels.map(_mediaModelToEntity).toList();
  }

  // MediaModel'den MediaEntity'ye tek ve doğru dönüşüm
  MediaEntity _mediaModelToEntity(MediaModel m) {
    int safeId;
    try {
      safeId = int.tryParse(m.id) ?? m.id.hashCode;
    } catch (_) {
      safeId = m.id.hashCode;
    }
    return MediaEntity(
      id: safeId,
      title: m.title,
      mediaType: m.mediaTypeString ?? '',
      releaseDate: m.year != null ? m.year.toString() : '',
      posterPath: m.posterUrl ?? '',
      overview: m.overview ?? '',
    );
  }

  Widget _buildBody() {
    return Obx(() {
      if (_searchController.isLoading.value) {
        return const Center(child: CircularProgressIndicator());
      }

      if (!_searchController.hasSearched.value) {
        return _buildInitialState();
      } else if (_searchController.searchResults.isEmpty) {
        return _buildNoResults();
      } else {
        return _buildResultsList();
      }
    });
  }

  Widget _buildResultsList() {
    String tabKey = _tabTitles[_currentTabIndex].toLowerCase();
    
    // TV için series anahtarını kullan
    if (tabKey == 'tv') tabKey = 'series';
    
    // Sliders boşsa tekrar yükle
    if ((_slidersConfig[tabKey] ?? []).isEmpty) {
      print('No sliders found for $tabKey, reloading...');
      // Şimdi reload yapacağız ama widget güncellemesi için future kullanıyoruz
      Future.microtask(() => _loadSlidersConfig());
    }
    
    final sliders = _slidersConfig[tabKey] ?? [];
    
    print('Building results list for $tabKey with sliders: $sliders');
    print('Sliders count: ${sliders.length}');
    
    // ID ve başlık eşleştirmelerini yap
    final Map<String, String> sliderTitleToId = {};
    final Map<String, String> sliderIdToTitle = {};
    
    if (sliders.isNotEmpty) {
      for (var slider in sliders) {
        final id = slider['id']?.toString() ?? '';
        final title = slider['title']?.toString() ?? '';
        if (id.isNotEmpty && title.isNotEmpty) {
          sliderTitleToId[title] = id;
          sliderIdToTitle[id] = title;
          print('Slider mapping: $title -> $id');
        }
      }
    } else {
      // Varsayılan mapping - her zaman mevcut olmalı
      sliderTitleToId['İzleniyor'] = 'watching';
      sliderTitleToId['İzlendi'] = 'completed';
      sliderTitleToId['İzlenecek'] = 'plan';
      
      sliderIdToTitle['watching'] = 'İzleniyor';
      sliderIdToTitle['completed'] = 'İzlendi';
      sliderIdToTitle['plan'] = 'İzlenecek';
      
      print('Using default slider mappings');
    }
    
    return ListView.separated(
      padding: const EdgeInsets.symmetric(vertical: 8),
      itemCount: _searchController.searchResults.length,
      separatorBuilder: (context, index) =>
          const Divider(height: 1, indent: 16, endIndent: 16),
      itemBuilder: (context, index) {
        final media = _searchController.searchResults[index];
        
        // Slider ID'ye göre başlık göster
        final selectedSliderId = _selectedSliderIds[media.id];
        final selectedSliderTitle = selectedSliderId != null ? 
            sliderIdToTitle[selectedSliderId] : null;
        
        // Sliders'ı string listesine dönüştür ve null-safety kontrolü yap
        List<String> sliderTitles = [];
        if (sliders.isNotEmpty) {
          sliderTitles = sliders.map((e) {
            final title = e['title'];
            return title != null ? title.toString() : '';
          }).where((title) => title.isNotEmpty).toList();
        } 
        
        // Her durumda varsayılan değerleri kullan - dropdown'da hep bir seçenek olmasını sağlar
        if (sliderTitles.isEmpty) {
          sliderTitles = ['İzleniyor', 'İzlendi', 'İzlenecek'];
        }
        
        print('Available slider titles for item ${media.title}: $sliderTitles');
        
        return SearchResultItem(
          media: media,
          sliders: sliderTitles,
          selectedSlider: selectedSliderTitle,
          onSliderChanged: (title) {
            setState(() {
              // Başlıktan ID'ye çevir ve kaydet
              final sliderId = title != null ? sliderTitleToId[title] : null;
              _selectedSliderIds[media.id] = sliderId;
              print('Selected slider for ${media.title}: ID=$sliderId, Title=$title');
            });
          },
          onAdd: () async {
            // Eğer slider seçilmediyse uyarı göster
            if (_selectedSliderIds[media.id] == null || _selectedSliderIds[media.id]!.isEmpty) {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Lütfen önce bir kategori seçiniz')),
              );
              return;
            }
            
            // Aktif tab'a göre ilgili Hive kutusuna ekle
            final tabKey = _tabTitles[_currentTabIndex].toLowerCase();
            
            // TV için 'tv' yerine 'series' kullan (boxName değil, sadece JSON içinde)
            final boxName = tabKey + 'Box';
            // MediaEntity'yi JSON string olarak sakla
            // media.json ile birebir aynı anahtarlar
            Map<String, dynamic> jsonMap;
            if (tabKey == 'movie') {
              jsonMap = {
                'id': media.id,
                'title': media.title,
                'original_title': media.title, // varsa farklı, yoksa aynı
                'overview': media.overview,
                'poster_path': media.posterPath,
                'backdrop_path': '', // eklenebilir
                'media_type': 'movie',
                'release_date': media.releaseDate,
                'vote_average': 0,
                'vote_count': 0,
                'status': _selectedSliderIds[media.id] ?? '', // Slider ID'sini kaydediyoruz, başlığını değil
              };
            } else if (tabKey == 'tv' || tabKey == 'series') {
              jsonMap = {
                'id': media.id,
                'name': media.title,
                'original_name': media.title,
                'overview': media.overview,
                'poster_path': media.posterPath,
                'backdrop_path': '',
                'media_type': 'tv',
                'first_air_date': media.releaseDate,
                'vote_average': 0,
                'vote_count': 0,
                'status': _selectedSliderIds[media.id] ?? '', // Slider ID'sini kaydediyoruz, başlığını değil
              };
            } else if (tabKey == 'anime') {
              jsonMap = {
                'id': media.id,
                'title': media.title,
                'romaji': media.title,
                'native': media.title,
                'description': media.overview,
                'cover_image': media.posterPath,
                'banner_image': '',
                'media_type': 'anime',
                'start_date': media.releaseDate,
                'average_score': 0,
                'popularity': 0,
                'status': _selectedSliderIds[media.id] ?? '', // Slider ID'sini kaydediyoruz, başlığını değil
              };
            } else {
              jsonMap = {};
            }
            // Debug: İçeriği kontrol et
            print('Saving to box: $boxName');
            print('Media status ID: ${_selectedSliderIds[media.id]}');
            final selectedTitle = sliderIdToTitle[_selectedSliderIds[media.id]!];
            print('Media status Title: $selectedTitle');
            print('JSON: ${jsonMap}');
            
            final jsonString = json.encode(jsonMap);
            var box = await Hive.openBox<String>(boxName);
            await box.add(jsonString);
            
            // Diğer ekranları da güncelle
            setState(() {
              // Ekleme işlemi başarılı olduğunda seçili slider'ı temizle
              _selectedSliderIds.remove(media.id);
            });
            
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('Kaydedildi: ${media.title} ($tabKey)')),
            );
          },
        );
      },
    );
  }

  Widget _buildInitialState() {
    return Center(
      child: Text(
        'Aramak için yukarıdaki alanı kullanın.',
        style: const TextStyle(fontSize: 16, color: AppColors.secondaryText),
      ),
    );
  }

  Widget _buildNoResults() {
    return Center(
      child: Text(
        'Bu arama için sonuç bulunamadı.',
        style: const TextStyle(fontSize: 16, color: AppColors.secondaryText),
      ),
    );
  }
}