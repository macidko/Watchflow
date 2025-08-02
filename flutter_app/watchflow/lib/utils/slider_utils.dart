import 'package:flutter/material.dart';
import 'package:hive/hive.dart';

/// Uygulama başlatıldığında çağrılır. Hive'da slider yapılandırması var mı
/// kontrol eder, yoksa varsayılan yapılandırmayı yükler.
Future<void> initSlidersIfNeeded() async {
  var box = await Hive.openBox('slidersBox');
  
  // Hive kutusu boşsa veya gerekli anahtarlar yoksa varsayılan verileri yükle
  if (box.isEmpty || !(box.containsKey('movie') && box.containsKey('series') && box.containsKey('anime'))) {
    print('Sliders box is empty or missing keys, initializing with default values');
    await initDefaultSliders();
  } else {
    print('Sliders are already initialized in Hive');
  }
}

/// Varsayılan slider yapılandırmasını oluşturur ve Hive'a kaydeder
Future<void> initDefaultSliders() async {
  try {
    var box = await Hive.openBox('slidersBox');
    await box.clear();
    
    // Tüm ekranlar için varsayılan slider yapılandırmaları
    final defaultSliders = {
      'home': [
        {'id': 'watching', 'title': 'İzleniyor', 'color': '#2196F3'},
        {'id': 'completed', 'title': 'İzlendi', 'color': '#4CAF50'},
        {'id': 'plan', 'title': 'İzlenecek', 'color': '#FF9800'}
      ],
      'movie': [
        {'id': 'watching', 'title': 'İzleniyor', 'color': '#2196F3'},
        {'id': 'completed', 'title': 'İzlendi', 'color': '#4CAF50'},
        {'id': 'plan', 'title': 'İzlenecek', 'color': '#FF9800'}
      ],
      'series': [
        {'id': 'watching', 'title': 'İzleniyor', 'color': '#2196F3'},
        {'id': 'completed', 'title': 'İzlendi', 'color': '#4CAF50'},
        {'id': 'plan', 'title': 'İzlenecek', 'color': '#FF9800'}
      ],
      'anime': [
        {'id': 'watching', 'title': 'İzleniyor', 'color': '#2196F3'},
        {'id': 'completed', 'title': 'İzlendi', 'color': '#4CAF50'},
        {'id': 'plan', 'title': 'İzlenecek', 'color': '#FF9800'}
      ]
    };
    
    // Her sekme için slider verilerini Hive'a kaydet
    defaultSliders.forEach((key, value) async {
      try {
        await box.put(key, value);
        print('Default sliders saved for $key: $value');
      } catch (e) {
        print('Error saving default sliders for $key: $e');
      }
    });
    
    print('Default sliders initialized successfully');
    
    // Doğrulama yapalım - kaydedilen verileri okuyup kontrol edelim
    try {
      final movieData = await box.get('movie');
      print('Verification - saved movie sliders: $movieData');
    } catch (e) {
      print('Error verifying saved sliders: $e');
    }
  } catch (e) {
    print('Error initializing default sliders: $e');
  }
}

/// Belirli bir sekme için slider yapılandırmalarını Hive'dan alır.
/// Eğer ilgili sekme için veri yoksa boş liste döner.
Future<List<dynamic>> getSlidersForTab(String tab) async {
  var box = await Hive.openBox('slidersBox');
  final sliders = box.get(tab);
  
  // Debug bilgisi
  print('Getting slider data for $tab from Hive');
  
  if (sliders == null) {
    print('No sliders found in Hive for $tab');
    
    // Özel tab isimleri için yedek kontrol
    // TV için series anahtarını dene
    if (tab == 'tv') {
      final seriesSliders = box.get('series');
      if (seriesSliders != null) {
        print('Found sliders for tv using series key');
        return List<dynamic>.from(seriesSliders);
      }
    }
    
    print('Returning empty list for $tab');
    return [];
  }
  
  print('Slider data for $tab: $sliders');
  
  try {
    // Tip dönüşümünde hata olmaması için güvenli dönüşüm
    if (sliders is List) {
      return sliders.map((item) {
        if (item is Map) {
          // Her bir öğeyi Map<String, dynamic> olarak düzenle
          return Map<String, dynamic>.from(
            item.map((key, value) => MapEntry(key.toString(), value))
          );
        }
        return <String, dynamic>{};
      }).toList();
    }
    return [];
  } catch (e) {
    print('Error converting slider data: $e');
    return [];
  }
}

/// Yeni bir slider yapılandırması ekler veya mevcut olanı günceller
Future<void> saveSliderConfig(String tab, List<Map<String, dynamic>> config) async {
  var box = await Hive.openBox('slidersBox');
  await box.put(tab, config);
  print('Slider config for $tab saved to Hive');
}
