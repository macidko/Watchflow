import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:watchflow/domain/entities/media_entity.dart';
import 'package:watchflow/presentation/controllers/media_search_controller.dart';
import 'package:watchflow/presentation/widgets/search_result_item.dart';

class SearchModal extends StatefulWidget {
  const SearchModal({super.key});

  @override
  State<SearchModal> createState() => _SearchModalState();
}

class _SearchModalState extends State<SearchModal>
    with SingleTickerProviderStateMixin {
  final MediaSearchController _searchController =
      Get.put(MediaSearchController());
  late final TabController _tabController;
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

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
    _tabController.addListener(() {
      if (!_tabController.indexIsChanging) {
        setState(() {
          _searchController
              .setSearchType(SearchType.values[_tabController.index]);
        });
        // Sekme değiştiğinde arama metni varsa aramayı tetikle
        if (_searchQueryController.text.trim().isNotEmpty) {
          _onSearch();
        }
      }
    });
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
    _searchController.setSearchType(SearchType.values[_tabController.index]);

    if (query.isEmpty) {
      // Dummy data göster
      setState(() {
        _searchController.searchResults.value = _dummyData;
        _searchController.hasSearched.value = true; // Arama yapıldı olarak işaretle
      });
    } else {
      _searchController.performSearch(query);
    }
  }

  @override
  Widget build(BuildContext context) {
    // Ekran görüntüsünden ilham alan sade ve temiz bir tasarım
    return Dialog(
      backgroundColor: Colors.white,
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
            const Divider(height: 1, color: Colors.black12),
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
        style: const TextStyle(fontSize: 16),
        decoration: InputDecoration(
          hintText: 'Film, Dizi veya Anime Ara...',
          prefixIcon: const Icon(Icons.search, size: 24),
          suffixIcon: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (_searchQueryController.text.isNotEmpty)
                IconButton(
                  icon: const Icon(Icons.close_rounded),
                  tooltip: 'Temizle',
                  onPressed: () {
                    _searchQueryController.clear();
                  },
                ),
              IconButton(
                icon: const Icon(Icons.arrow_forward_rounded),
                tooltip: 'Ara',
                color: Theme.of(context).primaryColor,
                onPressed: _onSearch,
              ),
            ],
          ),
          filled: true,
          fillColor: Colors.grey[100],
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
        labelColor: Theme.of(context).primaryColor,
        unselectedLabelColor: Colors.black54,
        indicatorColor: Theme.of(context).primaryColor,
        indicatorWeight: 2.5,
        labelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
        unselectedLabelStyle:
            const TextStyle(fontWeight: FontWeight.normal, fontSize: 15),
        tabs: const [
          Tab(text: 'Film'),
          Tab(text: 'Dizi'),
          Tab(text: 'Anime'),
          Tab(text: 'Hepsi'),
        ],
      ),
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
    return ListView.separated(
      padding: const EdgeInsets.symmetric(vertical: 8),
      itemCount: _searchController.searchResults.length,
      separatorBuilder: (context, index) =>
          const Divider(height: 1, indent: 16, endIndent: 16),
      itemBuilder: (context, index) {
        final media = _searchController.searchResults[index];
        return SearchResultItem(
          media: media,
          onTap: () {
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
        style: TextStyle(fontSize: 16, color: Colors.grey.shade600),
      ),
    );
  }

  Widget _buildNoResults() {
    return Center(
      child: Text(
        'Bu arama için sonuç bulunamadı.',
        style: TextStyle(fontSize: 16, color: Colors.grey.shade600),
      ),
    );
  }
}