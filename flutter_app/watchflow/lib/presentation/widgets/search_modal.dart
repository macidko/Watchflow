import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:watchflow/domain/entities/media_entity.dart';
import 'package:watchflow/presentation/controllers/media_search_controller.dart';
import 'package:watchflow/presentation/widgets/search_result_item.dart';

class SearchModal extends StatefulWidget {
  const SearchModal({Key? key}) : super(key: key);

  @override
  State<SearchModal> createState() => _SearchModalState();
}

class _SearchModalState extends State<SearchModal> {
  final MediaSearchController _searchController = Get.put(MediaSearchController());
  SearchType _selectedType = SearchType.movie;
  final TextEditingController _textController = TextEditingController();
  bool _showResults = false;
  bool _isMultiSearch = false; // Çoklu arama modu

  @override
  void dispose() {
    _textController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => FocusScope.of(context).unfocus(),
      child: Container(
        color: Colors.black,
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Başlık ve Kapatma Butonu
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'İçerik Ara',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, color: Colors.white),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                ],
              ),
              
              // Arama Modu Seçimi (Tek/Çoklu)
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text(
                    'Tek Arama',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 14,
                    ),
                  ),
                  Switch(
                    value: _isMultiSearch,
                    onChanged: (value) {
                      setState(() {
                        _isMultiSearch = value;
                        _textController.clear();
                        _showResults = false;
                      });
                    },
                    activeColor: Colors.orange[800],
                    activeTrackColor: Colors.orange[800]!.withOpacity(0.5),
                  ),
                  const Text(
                    'Çoklu Arama',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 14,
                    ),
                  ),
                ],
              ),
              
              const SizedBox(height: 16),
              
              // Arama Girişi (Tek Arama veya Çoklu Arama)
              if (!_isMultiSearch)
                // Tek Arama - Input
                TextField(
                  controller: _textController,
                  style: const TextStyle(color: Colors.white),
                  decoration: InputDecoration(
                    hintText: 'İçerik ara...',
                    hintStyle: TextStyle(color: Colors.grey[400]),
                    filled: true,
                    fillColor: const Color(0xFF1A1A1A),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8.0),
                      borderSide: BorderSide(color: Colors.orange[800]!),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8.0),
                      borderSide: BorderSide(color: Colors.orange[800]!),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8.0),
                      borderSide: BorderSide(color: Colors.orange[800]!, width: 2.0),
                    ),
                    suffixIcon: IconButton(
                      icon: const Icon(Icons.clear, color: Colors.grey),
                      onPressed: () {
                        _textController.clear();
                        setState(() {
                          _showResults = false;
                        });
                      },
                    ),
                  ),
                  onSubmitted: (value) {
                    if (value.isNotEmpty) {
                      _searchController.setSearchType(_selectedType);
                      _searchController.performSearch(value);
                      setState(() {
                        _showResults = true;
                      });
                    }
                  },
                )
              else
                // Çoklu Arama - TextBox
                Container(
                  height: 150,
                  decoration: BoxDecoration(
                    color: const Color(0xFF1A1A1A),
                    borderRadius: BorderRadius.circular(8.0),
                    border: Border.all(color: Colors.orange[800]!),
                  ),
                  child: TextField(
                    controller: _textController,
                    style: const TextStyle(color: Colors.white),
                    maxLines: null,
                    expands: true,
                    textAlignVertical: TextAlignVertical.top,
                    decoration: InputDecoration(
                      hintText: 'Her satıra bir içerik adı yazın...',
                      hintStyle: TextStyle(color: Colors.grey[400]),
                      border: InputBorder.none,
                      contentPadding: const EdgeInsets.all(12),
                      suffixIcon: Padding(
                        padding: const EdgeInsets.only(top: 4.0),
                        child: IconButton(
                          icon: const Icon(Icons.clear, color: Colors.grey),
                          onPressed: () {
                            _textController.clear();
                            setState(() {
                              _showResults = false;
                            });
                          },
                        ),
                      ),
                    ),
                  ),
                ),
              
              // Kategori Seçimleri
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 16.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    _buildCategoryButton('Film', SearchType.movie),
                    const SizedBox(width: 10),
                    _buildCategoryButton('Dizi', SearchType.tv),
                    const SizedBox(width: 10),
                    _buildCategoryButton('Anime', SearchType.anime),
                  ],
                ),
              ),
              
              // Arama Butonu
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  icon: const Icon(Icons.search, color: Colors.white),
                  label: Text(
                    _isMultiSearch ? 'Çoklu Ara' : 'Ara', 
                    style: const TextStyle(color: Colors.white)
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.orange[800],
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  onPressed: () {
                    if (_textController.text.isNotEmpty) {
                      if (_isMultiSearch) {
                        // Çoklu arama işlemi
                        final List<String> queries = _textController.text
                            .split('\n')
                            .where((line) => line.trim().isNotEmpty)
                            .toList();
                        
                        if (queries.isNotEmpty) {
                          _searchController.setSearchType(_selectedType);
                          _searchController.performMultiSearch(queries);
                          setState(() {
                            _showResults = true;
                          });
                        }
                      } else {
                        // Tek arama işlemi
                        _searchController.setSearchType(_selectedType);
                        _searchController.performSearch(_textController.text);
                        setState(() {
                          _showResults = true;
                        });
                      }
                      // Klavyeyi kapat
                      FocusScope.of(context).unfocus();
                    }
                  },
                ),
              ),

              // Arama Sonuçları
              if (_showResults)
                Obx(() {
                  if (_searchController.isLoading.value) {
                    return const Padding(
                      padding: EdgeInsets.all(20.0),
                      child: Center(
                        child: CircularProgressIndicator(
                          color: Colors.orange,
                        ),
                      ),
                    );
                  } else if (_searchController.hasSearched.value && _searchController.searchResults.isEmpty) {
                    return const Padding(
                      padding: EdgeInsets.all(20.0),
                      child: Center(
                        child: Column(
                          children: [
                            Icon(Icons.search_off, size: 50, color: Colors.grey),
                            SizedBox(height: 16),
                            Text(
                              'Sonuç bulunamadı',
                              style: TextStyle(color: Colors.white),
                            ),
                          ],
                        ),
                      ),
                    );
                  } else if (_searchController.searchResults.isNotEmpty) {
                    return Expanded(
                      child: ListView.builder(
                        shrinkWrap: true,
                        itemCount: _searchController.searchResults.length,
                        itemBuilder: (context, index) {
                          return SearchResultItem(
                            media: _searchController.searchResults[index],
                            onTap: () {
                              Get.back();
                              Get.toNamed('/detail', arguments: _searchController.searchResults[index]);
                            },
                          );
                        },
                      ),
                    );
                  } else if (!_searchController.hasSearched.value) {
                    return Padding(
                      padding: const EdgeInsets.all(20.0),
                      child: Center(
                        child: Column(
                          children: [
                            const Icon(Icons.search, size: 50, color: Colors.grey),
                            const SizedBox(height: 16),
                            Text(
                              _isMultiSearch
                                  ? 'Her satıra bir içerik adı yazarak\nçoklu arama yapabilirsiniz'
                                  : 'İzleme listenize eklemek istediğiniz\niçeriği aramak için arama kutusunu\nkullanın',
                              textAlign: TextAlign.center,
                              style: TextStyle(color: Colors.grey[400]),
                            ),
                          ],
                        ),
                      ),
                    );
                  }
                  return const SizedBox.shrink();
                }),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCategoryButton(String title, SearchType type) {
    final bool isSelected = _selectedType == type;
    
    return ElevatedButton(
      style: ElevatedButton.styleFrom(
        backgroundColor: isSelected ? Colors.orange[800] : const Color(0xFF333333),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(4),
        ),
      ),
      onPressed: () {
        setState(() {
          _selectedType = type;
        });
      },
      child: Text(
        title,
        style: TextStyle(
          color: isSelected ? Colors.white : Colors.grey[300],
        ),
      ),
    );
  }
} 