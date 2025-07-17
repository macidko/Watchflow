import 'dart:convert';
import 'package:flutter/services.dart' show rootBundle;
import 'package:flutter/material.dart';
import 'package:watchflow/presentation/theme/app_colors.dart';
import 'package:get/get.dart';
import 'package:watchflow/domain/entities/media_entity.dart';
import 'package:watchflow/presentation/controllers/media_search_controller.dart';
import 'package:watchflow/presentation/widgets/search_result_item.dart';

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


  Future<void> _loadSlidersConfig() async {
    final String jsonStr = await rootBundle.loadString('assets/config/sliders_config.json');
    final Map<String, dynamic> jsonMap = json.decode(jsonStr);
    setState(() {
      _slidersConfig = (jsonMap['sliders'] as Map<String, dynamic>).map((key, value) => MapEntry(
        key,
        (value as List).map((e) => Map<String, dynamic>.from(e)).toList(),
      ));
    });
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
    // Varsayılan her tab için handler dummy olarak atanıyor, API entegrasyonunda değiştirilebilir
    _searchHandlers[0] = _searchMovies;
    _searchHandlers[1] = _searchTv;
    _searchHandlers[2] = _searchAnime;
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
  Future<List<MediaEntity>> _searchMovies(String query) async {
    await Future.delayed(const Duration(milliseconds: 500));
    // Burada gerçek API çağrısı yapılacak
    return _dummyData.where((e) => e.mediaType == 'movie' && e.title.toLowerCase().contains(query.toLowerCase())).toList();
  }

  Future<List<MediaEntity>> _searchTv(String query) async {
    await Future.delayed(const Duration(milliseconds: 500));
    // Burada gerçek API çağrısı yapılacak
    return _dummyData.where((e) => e.mediaType == 'tv' && e.title.toLowerCase().contains(query.toLowerCase())).toList();
  }

  Future<List<MediaEntity>> _searchAnime(String query) async {
    await Future.delayed(const Duration(milliseconds: 500));
    // Burada gerçek API çağrısı yapılacak
    return _dummyData.where((e) => e.mediaType == 'anime' && e.title.toLowerCase().contains(query.toLowerCase())).toList();
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
    final sliders = _slidersConfig[tabKey] ?? [];
    return ListView.separated(
      padding: const EdgeInsets.symmetric(vertical: 8),
      itemCount: _searchController.searchResults.length,
      separatorBuilder: (context, index) =>
          const Divider(height: 1, indent: 16, endIndent: 16),
      itemBuilder: (context, index) {
        final media = _searchController.searchResults[index];
        return SearchResultItem(
          media: media,
          sliders: sliders.map((e) => e['title'] as String).toList(),
          selectedSlider: _selectedSliderIds[media.id],
          onSliderChanged: (val) {
            setState(() {
              _selectedSliderIds[media.id] = val;
            });
          },
          onAdd: () {
            Get.back(result: media);
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