import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../data/models/media_model.dart';
import '../../data/services/api_service.dart';
import '../../utils/logger.dart';

class ApiTestScreen extends StatefulWidget {
  const ApiTestScreen({super.key});

  @override
  State<ApiTestScreen> createState() => _ApiTestScreenState();
}

class _ApiTestScreenState extends State<ApiTestScreen> {
  late ApiService _apiService;
  final TextEditingController _apiKeyController = TextEditingController();
  final TextEditingController _searchController = TextEditingController();
  final TextEditingController _idController = TextEditingController();
  
  bool _isLoading = false;
  bool _isServiceReady = false;
  String _message = 'Servisler başlatılıyor...';
  List<MediaModel> _searchResults = [];
  Map<String, dynamic>? _detailedResult;
  
  @override
  void initState() {
    super.initState();
    _checkService();
    
    // Örnek TV şovu ID'si (Game of Thrones)
    _idController.text = '1399';
  }
  
  @override
  void dispose() {
    _apiKeyController.dispose();
    _searchController.dispose();
    _idController.dispose();
    super.dispose();
  }
  
  Future<void> _checkService() async {
    try {
      // Servisin hazır olup olmadığını kontrol et
      _apiService = Get.find<ApiService>();
      
      setState(() {
        _isServiceReady = true;
        _message = 'Servisler hazır';
      });
      
      _loadApiKey();
    } catch (e) {
      AppLogger.e('API servis bulunamadı', e);
      setState(() {
        _isServiceReady = false;
        _message = 'API servis hazır değil: $e';
      });
      
      // 3 saniye sonra tekrar dene
      await Future.delayed(const Duration(seconds: 3));
      _checkService();
    }
  }
  
  Future<void> _loadApiKey() async {
    try {
      final apiKeys = await _apiService.getAllApiKeys();
      if (apiKeys['TMDB_API_KEY']?.isNotEmpty ?? false) {
        _apiKeyController.text = apiKeys['TMDB_API_KEY']!;
        setState(() {
          _message = 'API anahtarı yüklendi';
        });
      } else {
        setState(() {
          _message = 'API anahtarı bulunamadı. Lütfen bir API anahtarı girin.';
        });
      }
    } catch (e) {
      AppLogger.e('API anahtarı yüklenirken hata', e);
      setState(() {
        _message = 'API anahtarı yüklenirken hata: $e';
      });
    }
  }
  
  Future<void> _saveApiKey() async {
    if (_apiKeyController.text.isEmpty) {
      setState(() {
        _message = 'API anahtarı boş olamaz';
      });
      return;
    }
    
    setState(() {
      _isLoading = true;
      _message = 'API anahtarı kaydediliyor...';
    });
    
    try {
      final result = await _apiService.saveTmdbApiKey(_apiKeyController.text);
      
      setState(() {
        _message = result ? 'API anahtarı başarıyla kaydedildi' : 'API anahtarı kaydedilemedi';
      });
    } catch (e) {
      AppLogger.e('API anahtarı kaydedilirken hata', e);
      setState(() {
        _message = 'Hata: $e';
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }
  
  // TMDB çoklu arama (film, dizi, kişi)
  Future<void> _searchTmdb() async {
    if (_searchController.text.isEmpty) {
      setState(() {
        _message = 'Arama metni boş olamaz';
      });
      return;
    }
    
    setState(() {
      _isLoading = true;
      _message = 'TMDB\'de aranıyor...';
      _searchResults = [];
      _detailedResult = null;
    });
    
    try {
      final results = await _apiService.searchMediaWithTmdb(_searchController.text);
      
      setState(() {
        _searchResults = results;
        _message = '${results.length} sonuç bulundu';
      });
      AppLogger.i('TMDB araması başarılı: ${results.length} sonuç bulundu');
    } catch (e) {
      AppLogger.e('TMDB araması sırasında hata', e);
      setState(() {
        _message = 'Arama hatası: $e';
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }
  
  // Sadece film araması
  Future<void> _searchMovies() async {
    if (_searchController.text.isEmpty) {
      setState(() {
        _message = 'Arama metni boş olamaz';
      });
      return;
    }
    
    setState(() {
      _isLoading = true;
      _message = 'TMDB\'de filmler aranıyor...';
      _searchResults = [];
      _detailedResult = null;
    });
    
    try {
      final results = await _apiService.searchMediaWithTmdb(_searchController.text, type: 'movie');
      
      setState(() {
        _searchResults = results;
        _message = '${results.length} film bulundu';
      });
      AppLogger.i('Film araması başarılı: ${results.length} sonuç bulundu');
    } catch (e) {
      AppLogger.e('Film araması sırasında hata', e);
      setState(() {
        _message = 'Film arama hatası: $e';
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }
  
  // Toplu film araması
  Future<void> _batchSearchMovies() async {
    if (_searchController.text.isEmpty) {
      setState(() {
        _message = 'Arama metni boş olamaz';
      });
      return;
    }
    
    setState(() {
      _isLoading = true;
      _message = 'Toplu film araması yapılıyor...';
      _searchResults = [];
      _detailedResult = null;
    });
    
    try {
      // Virgülle ayrılmış başlıkları listeye dönüştür
      final queries = _searchController.text
          .split(',')
          .map((s) => s.trim())
          .where((s) => s.isNotEmpty)
          .toList();
      
      if (queries.isEmpty) {
        setState(() {
          _message = 'Geçerli arama metni girilmedi';
          _isLoading = false;
        });
        return;
      }
      
      // Tüm sonuçları birleştir
      final allResults = <MediaModel>[];
      
      // Her başlık için arama yap
      for (final query in queries) {
        final results = await _apiService.searchMediaWithTmdb(query, type: 'movie');
        allResults.addAll(results);
      }
      
      setState(() {
        _searchResults = allResults;
        _message = '${queries.length} başlık için toplam ${allResults.length} film bulundu';
      });
      AppLogger.i('Toplu film araması başarılı: ${allResults.length} sonuç bulundu');
    } catch (e) {
      AppLogger.e('Toplu film araması sırasında hata', e);
      setState(() {
        _message = 'Toplu film arama hatası: $e';
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }
  
  // Sadece dizi araması
  Future<void> _searchTvShows() async {
    if (_searchController.text.isEmpty) {
      setState(() {
        _message = 'Arama metni boş olamaz';
      });
      return;
    }
    
    setState(() {
      _isLoading = true;
      _message = 'TMDB\'de diziler aranıyor...';
      _searchResults = [];
      _detailedResult = null;
    });
    
    try {
      final results = await _apiService.searchMediaWithTmdb(_searchController.text, type: 'tv');
      
      setState(() {
        _searchResults = results;
        _message = '${results.length} dizi bulundu';
      });
      AppLogger.i('Dizi araması başarılı: ${results.length} sonuç bulundu');
    } catch (e) {
      AppLogger.e('Dizi araması sırasında hata', e);
      setState(() {
        _message = 'Dizi arama hatası: $e';
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }
  
  // Toplu dizi araması
  Future<void> _batchSearchTvShows() async {
    if (_searchController.text.isEmpty) {
      setState(() {
        _message = 'Arama metni boş olamaz';
      });
      return;
    }
    
    setState(() {
      _isLoading = true;
      _message = 'Toplu dizi araması yapılıyor...';
      _searchResults = [];
      _detailedResult = null;
    });
    
    try {
      // Virgülle ayrılmış başlıkları listeye dönüştür
      final queries = _searchController.text
          .split(',')
          .map((s) => s.trim())
          .where((s) => s.isNotEmpty)
          .toList();
      
      if (queries.isEmpty) {
        setState(() {
          _message = 'Geçerli arama metni girilmedi';
          _isLoading = false;
        });
        return;
      }
      
      // Tüm sonuçları birleştir
      final allResults = <MediaModel>[];
      
      // Her başlık için arama yap
      for (final query in queries) {
        final results = await _apiService.searchMediaWithTmdb(query, type: 'tv');
        allResults.addAll(results);
      }
      
      setState(() {
        _searchResults = allResults;
        _message = '${queries.length} başlık için toplam ${allResults.length} dizi bulundu';
      });
      AppLogger.i('Toplu dizi araması başarılı: ${allResults.length} sonuç bulundu');
    } catch (e) {
      AppLogger.e('Toplu dizi araması sırasında hata', e);
      setState(() {
        _message = 'Toplu dizi arama hatası: $e';
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }
  
  // Popüler TV şovlarını getir
  Future<void> _getPopularTvShows() async {
    setState(() {
      _isLoading = true;
      _message = 'Popüler TV şovları alınıyor...';
      _searchResults = [];
      _detailedResult = null;
    });
    
    try {
      final results = await _apiService.getPopularTvShows();
      
      setState(() {
        _searchResults = results;
        _message = '${results.length} popüler TV şovu bulundu';
      });
      AppLogger.i('Popüler TV şovları başarıyla alındı: ${results.length} sonuç');
    } catch (e) {
      AppLogger.e('Popüler TV şovları alınırken hata', e);
      setState(() {
        _message = 'Popüler TV şovları hatası: $e';
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }
  
  // TV şovu sezon ve bölüm bilgileri
  Future<void> _getTvShowSeasons() async {
    if (_idController.text.isEmpty) {
      setState(() {
        _message = 'TV şovu ID\'si boş olamaz';
      });
      return;
    }
    
    setState(() {
      _isLoading = true;
      _message = 'TV şovu sezon bilgileri alınıyor...';
      _searchResults = [];
      _detailedResult = null;
    });
    
    try {
      final result = await _apiService.getTvShowSeasons(_idController.text);
      
      setState(() {
        _detailedResult = result;
        _message = '${result['title']} dizisi için ${result['totalSeasons']} sezon bilgisi alındı';
      });
      AppLogger.i('TV şovu sezon bilgileri başarıyla alındı');
    } catch (e) {
      AppLogger.e('TV şovu sezon bilgileri alınırken hata', e);
      setState(() {
        _message = 'Sezon bilgileri hatası: $e';
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }
  
  // Anime araması
  Future<void> _searchAnime() async {
    if (_searchController.text.isEmpty) {
      setState(() {
        _message = 'Arama metni boş olamaz';
      });
      return;
    }
    
    setState(() {
      _isLoading = true;
      _message = 'Anime aranıyor...';
      _searchResults = [];
      _detailedResult = null;
    });
    
    try {
      final results = await _apiService.searchAnime(_searchController.text);
      
      setState(() {
        _searchResults = results;
        _message = '${results.length} anime bulundu';
      });
      AppLogger.i('Anime araması başarılı: ${results.length} sonuç bulundu');
    } catch (e) {
      AppLogger.e('Anime arama hatası', e);
      setState(() {
        _message = 'Anime arama hatası: $e';
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }
  
  // Toplu anime araması
  Future<void> _batchSearchAnime() async {
    if (_searchController.text.isEmpty) {
      setState(() {
        _message = 'Arama metni boş olamaz';
      });
      return;
    }
    
    setState(() {
      _isLoading = true;
      _message = 'Toplu anime araması yapılıyor...';
      _searchResults = [];
      _detailedResult = null;
    });
    
    try {
      // Virgülle ayrılmış başlıkları listeye dönüştür
      final queries = _searchController.text
          .split(',')
          .map((s) => s.trim())
          .where((s) => s.isNotEmpty)
          .toList();
      
      if (queries.isEmpty) {
        setState(() {
          _message = 'Geçerli arama metni girilmedi';
          _isLoading = false;
        });
        return;
      }
      
      final results = await _apiService.batchSearchAnime(queries);
      
      // Tüm sonuçları düzleştir
      final allResults = <MediaModel>[];
      results.forEach((key, value) {
        allResults.addAll(value);
      });
      
      setState(() {
        _searchResults = allResults;
        _message = '${queries.length} başlık için toplam ${allResults.length} anime bulundu';
      });
      AppLogger.i('Toplu anime araması başarılı: ${allResults.length} sonuç bulundu');
    } catch (e) {
      AppLogger.e('Toplu anime araması sırasında hata', e);
      setState(() {
        _message = 'Toplu arama hatası: $e';
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('API Test Ekranı'),
      ),
      body: !_isServiceReady
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const CircularProgressIndicator(),
                  const SizedBox(height: 16),
                  Text(_message),
                ],
              ),
            )
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // API Anahtarı bölümü
                  TextField(
                    controller: _apiKeyController,
                    decoration: const InputDecoration(
                      labelText: 'TMDB API Anahtarı',
                      hintText: 'API anahtarını girin',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 8),
                  ElevatedButton(
                    onPressed: _isLoading ? null : _saveApiKey,
                    child: const Text('API Anahtarını Kaydet'),
                  ),
                  
                  const Divider(height: 32),
                  
                  // Arama bölümü
                  TextField(
                    controller: _searchController,
                    decoration: const InputDecoration(
                      labelText: 'Arama Metni',
                      hintText: 'Film, dizi veya anime adı girin (toplu arama için virgülle ayırın)',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 8),
                  
                  // TMDB Arama Butonları
                  const Text('TMDB Aramaları:', style: TextStyle(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 4),
                  
                  // Tekli aramalar
                  Row(
                    children: [
                      Expanded(
                        child: ElevatedButton(
                          onPressed: _isLoading ? null : _searchTmdb,
                          child: const Text('Çoklu Ara'),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: ElevatedButton(
                          onPressed: _isLoading ? null : _searchMovies,
                          child: const Text('Film Ara'),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: ElevatedButton(
                          onPressed: _isLoading ? null : _searchTvShows,
                          child: const Text('Dizi Ara'),
                        ),
                      ),
                    ],
                  ),
                  
                  const SizedBox(height: 8),
                  
                  // Toplu aramalar
                  Row(
                    children: [
                      Expanded(
                        child: ElevatedButton(
                          onPressed: _isLoading ? null : _batchSearchMovies,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.orange,
                            foregroundColor: Colors.white,
                          ),
                          child: const Text('Toplu Film Ara'),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: ElevatedButton(
                          onPressed: _isLoading ? null : _batchSearchTvShows,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.teal,
                            foregroundColor: Colors.white,
                          ),
                          child: const Text('Toplu Dizi Ara'),
                        ),
                      ),
                    ],
                  ),
                  
                  const SizedBox(height: 8),
                  ElevatedButton(
                    onPressed: _isLoading ? null : _getPopularTvShows,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.deepPurple,
                      foregroundColor: Colors.white,
                    ),
                    child: const Text('Popüler TV Şovlarını Getir'),
                  ),
                  
                  const SizedBox(height: 16),
                  
                  // TV Şovu Sezon Bilgileri
                  const Text('TV Şovu Sezon Bilgileri:', style: TextStyle(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Expanded(
                        flex: 2,
                        child: TextField(
                          controller: _idController,
                          decoration: const InputDecoration(
                            labelText: 'TV Şovu ID',
                            hintText: 'TMDB TV şovu ID girin (örn: 1399 - Game of Thrones)',
                            border: OutlineInputBorder(),
                          ),
                          keyboardType: TextInputType.number,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        flex: 1,
                        child: ElevatedButton(
                          onPressed: _isLoading ? null : _getTvShowSeasons,
                          child: const Text('Sezonları Al'),
                        ),
                      ),
                    ],
                  ),
                  
                  const SizedBox(height: 16),
                  
                  // Anime Arama Butonları
                  const Text('Anime Aramaları:', style: TextStyle(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Expanded(
                        child: ElevatedButton(
                          onPressed: _isLoading ? null : _searchAnime,
                          child: const Text('Anime Ara'),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: ElevatedButton(
                          onPressed: _isLoading ? null : _batchSearchAnime,
                          child: const Text('Toplu Anime Ara'),
                        ),
                      ),
                    ],
                  ),
                  
                  const SizedBox(height: 16),
                  
                  // Durum mesajı
                  Container(
                    padding: const EdgeInsets.all(8),
                    color: Colors.grey.shade200,
                    child: Text(
                      _message,
                      style: const TextStyle(fontWeight: FontWeight.bold),
                      textAlign: TextAlign.center,
                    ),
                  ),
                  
                  const Divider(height: 24),
                  
                  // Yükleniyor göstergesi
                  if (_isLoading)
                    const Center(child: CircularProgressIndicator()),
                  
                  // Detaylı sonuç gösterimi (TV şovu sezon bilgileri)
                  if (_detailedResult != null) ...[
                    const Text('Detaylı Sonuç:', style: TextStyle(fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              '${_detailedResult!['title']}',
                              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                            ),
                            const SizedBox(height: 8),
                            Text('Toplam Sezon: ${_detailedResult!['totalSeasons']}'),
                            const SizedBox(height: 16),
                            const Text('Sezonlar:', style: TextStyle(fontWeight: FontWeight.bold)),
                            const SizedBox(height: 8),
                            for (var season in _detailedResult!['seasons'])
                              ListTile(
                                title: Text('${season['seasonName']}'),
                                subtitle: Text('${season['episodeCount']} bölüm'),
                                leading: const Icon(Icons.tv),
                              ),
                          ],
                        ),
                      ),
                    ),
                  ],
                  
                  // Sonuç listesi
                  if (_searchResults.isNotEmpty) ...[
                    const SizedBox(height: 16),
                    const Text('Arama Sonuçları:', style: TextStyle(fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: _searchResults.length,
                      itemBuilder: (context, index) {
                        final media = _searchResults[index];
                        return Card(
                          margin: const EdgeInsets.only(bottom: 8),
                          child: ListTile(
                            leading: media.posterUrl != null
                                ? Image.network(
                                    media.posterUrl!,
                                    width: 50,
                                    errorBuilder: (_, __, ___) => const Icon(Icons.image_not_supported),
                                  )
                                : const Icon(Icons.movie),
                            title: Text(media.title),
                            subtitle: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('Tür: ${media.mediaType.name}'),
                                if (media.year != null) Text('Yıl: ${media.year}'),
                                if (media.voteAverage != null) Text('Puan: ${media.voteAverage!.toStringAsFixed(1)}/10'),
                              ],
                            ),
                            isThreeLine: true,
                          ),
                        );
                      },
                    ),
                  ],
                ],
              ),
            ),
    );
  }
} 