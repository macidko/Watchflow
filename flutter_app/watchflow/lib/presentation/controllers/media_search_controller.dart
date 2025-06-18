import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:watchflow/domain/entities/media_entity.dart';

enum SearchType { movie, tv, anime, all }

class MediaSearchController extends GetxController {
  final TextEditingController searchController = TextEditingController();
  
  var isLoading = false.obs;
  var hasSearched = false.obs;
  var searchResults = <MediaEntity>[].obs;
  var searchType = SearchType.movie.obs;

  void performSearch(String query) async {
    if (query.isEmpty) return;
    
    isLoading(true);
    searchResults.clear();
    
    try {
      // Şimdilik basitleştirilmiş mock veri
      await Future.delayed(const Duration(milliseconds: 800));
      
      _addMockResults(query);
      
      hasSearched(true);
    } catch (e) {
      print('Arama hatası: $e');
    } finally {
      isLoading(false);
    }
  }
  
  void performMultiSearch(List<String> queries) async {
    if (queries.isEmpty) return;
    
    isLoading(true);
    searchResults.clear();
    
    try {
      // Şimdilik basitleştirilmiş mock veri
      await Future.delayed(const Duration(milliseconds: 1200));
      
      // Her bir sorgu için sonuçlar ekle
      for (final query in queries) {
        if (query.trim().isNotEmpty) {
          _addMockResults(query);
        }
      }
      
      hasSearched(true);
    } catch (e) {
      print('Çoklu arama hatası: $e');
    } finally {
      isLoading(false);
    }
  }
  
  void _addMockResults(String query) {
    // Sorguya göre sonuç ekle
    final lowercaseQuery = query.toLowerCase();
    
    if (searchType.value == SearchType.movie || searchType.value == SearchType.all) {
      if ('inception'.contains(lowercaseQuery)) {
        searchResults.add(MediaEntity(
          id: 1,
          title: "Inception",
          overview: "Rüyalar içinde geçen bir bilim kurgu filmi",
          posterPath: "/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
          backdropPath: "/s3TBrRGB1iav7gFOCNx3H31MoES.jpg",
          voteAverage: 8.2,
          releaseDate: "2010-07-16",
          mediaType: "movie",
        ));
      }
      
      if ('interstellar'.contains(lowercaseQuery)) {
        searchResults.add(MediaEntity(
          id: 4,
          title: "Interstellar",
          overview: "Uzay ve zaman yolculuğu hakkında bir bilim kurgu filmi",
          posterPath: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
          backdropPath: "/xJHokMbljvjADYdit5fK5VQsXEG.jpg",
          voteAverage: 8.4,
          releaseDate: "2014-11-07",
          mediaType: "movie",
        ));
      }
    }
    
    if (searchType.value == SearchType.tv || searchType.value == SearchType.all) {
      if ('breaking bad'.contains(lowercaseQuery)) {
        searchResults.add(MediaEntity(
          id: 2,
          title: "Breaking Bad",
          overview: "Bir kimya öğretmeninin suç dünyasına girişi",
          posterPath: "/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
          backdropPath: "/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg",
          voteAverage: 8.5,
          releaseDate: "2008-01-20",
          mediaType: "tv",
        ));
      }
      
      if ('game of thrones'.contains(lowercaseQuery)) {
        searchResults.add(MediaEntity(
          id: 5,
          title: "Game of Thrones",
          overview: "Yedi krallığın taht mücadelesi",
          posterPath: "/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg",
          backdropPath: "/suopoADq0k8YZr4dQXcU6pToj6s.jpg",
          voteAverage: 8.3,
          releaseDate: "2011-04-17",
          mediaType: "tv",
        ));
      }
    }
    
    if (searchType.value == SearchType.anime || searchType.value == SearchType.all) {
      if ('attack on titan'.contains(lowercaseQuery)) {
        searchResults.add(MediaEntity(
          id: 3,
          title: "Attack on Titan",
          overview: "İnsanlığın dev yaratıklara karşı mücadelesi",
          posterPath: "/aiy35Evcofzl7hNzFdoEIwtZkS4.jpg",
          backdropPath: "/3OsZ6f1aKuk3krpZybyze6IlyI3.jpg",
          voteAverage: 8.7,
          releaseDate: "2013-04-07",
          mediaType: "anime",
        ));
      }
      
      if ('demon slayer'.contains(lowercaseQuery)) {
        searchResults.add(MediaEntity(
          id: 6,
          title: "Demon Slayer",
          overview: "Ailesi öldürülen bir gencin iblislerle savaşı",
          posterPath: "/xUfRZu2mi8jH6SzQEJGP6tjBuYj.jpg",
          backdropPath: "/nTvM4mhqNlHIvUkI1gVnW6XP7GG.jpg",
          voteAverage: 8.6,
          releaseDate: "2019-04-06",
          mediaType: "anime",
        ));
      }
    }
  }
  
  void clearSearch() {
    searchController.clear();
    searchResults.clear();
    hasSearched(false);
  }
  
  void setSearchType(SearchType type) {
    searchType.value = type;
  }
  
  Future<void> addToWatchlist(MediaEntity media) async {
    try {
      print('${media.title} izleme listesine eklendi');
      Get.snackbar(
        'Başarılı',
        '${media.title} izleme listesine eklendi',
        snackPosition: SnackPosition.BOTTOM,
      );
    } catch (e) {
      print('İzleme listesine ekleme hatası: $e');
      Get.snackbar(
        'Hata',
        'İçerik izleme listesine eklenemedi',
        snackPosition: SnackPosition.BOTTOM,
      );
    }
  }
} 