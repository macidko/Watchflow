import 'package:flutter/material.dart';
import 'package:hive/hive.dart';

/// Slider yapılandırması için model sınıfı
class SliderConfig {
  final String id;
  final String title;
  final String color;

  SliderConfig({required this.id, required this.title, required this.color});

  // Map'ten SliderConfig nesnesine dönüşüm
  factory SliderConfig.fromMap(Map<dynamic, dynamic> map) {
    return SliderConfig(
      id: map['id']?.toString() ?? '',
      title: map['title']?.toString() ?? '',
      color: map['color']?.toString() ?? '#2196F3',
    );
  }

  // SliderConfig nesnesinden Map'e dönüşüm
  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'title': title,
      'color': color,
    };
  }

  @override
  String toString() => 'SliderConfig(id: $id, title: $title)';
}

/// Varsayılan slider yapılandırmalarını içeren sabit
final defaultSliderConfigs = [
  SliderConfig(id: 'watching', title: 'İzleniyor', color: '#2196F3'),
  SliderConfig(id: 'completed', title: 'İzlendi', color: '#4CAF50'),
  SliderConfig(id: 'plan', title: 'İzlenecek', color: '#FF9800'),
];

/// Uygulama başlatıldığında çağrılır. Hive'da slider yapılandırması var mı
/// kontrol eder, yoksa varsayılan yapılandırmayı yükler.
Future<void> initSlidersIfNeeded() async {
  try {
    var box = await Hive.openBox('slidersBox');
    
    // Hive kutusu boşsa veya gerekli anahtarlar yoksa varsayılan verileri yükle
    if (box.isEmpty || !(box.containsKey('movie') && box.containsKey('series') && box.containsKey('anime'))) {
      print('Sliders box is empty or missing keys, initializing with default values');
      await _initDefaultSliders(box);
    } else {
      print('Sliders are already initialized in Hive');
    }
  } catch (e) {
    print('Error initializing sliders: $e');
    // Hata durumunda bile devam etmeye çalış
  }
}

/// Varsayılan slider yapılandırmasını oluşturur ve Hive'a kaydeder
Future<void> _initDefaultSliders(Box box) async {
  try {
    // Box parametresi ile aldığımız için tekrar açmamıza gerek yok
    await box.clear();
    
    // Tüm ekranlar için varsayılan slider yapılandırmaları
    final configMaps = defaultSliderConfigs.map((slider) => slider.toMap()).toList();
    
    // Tüm kategoriler için aynı varsayılan ayarları kullan
    final categories = ['home', 'movie', 'series', 'anime'];
    for (var category in categories) {
      await box.put(category, configMaps);
      print('Default sliders saved for $category');
    }
    
    // Doğrulama
    for (var category in categories) {
      final data = await box.get(category);
      if (data != null && data is List && data.isNotEmpty) {
        print('✅ Verified sliders for $category: ${data.length} items');
      } else {
        print('❌ Failed to verify sliders for $category');
      }
    }
    
    print('Default sliders initialized successfully');
  } catch (e) {
    print('Error initializing default sliders: $e');
  }
}

/// Belirli bir sekme için slider yapılandırmalarını Hive'dan alır.
Future<List<SliderConfig>> getSlidersForTab(String tab) async {
  try {
    var box = await Hive.openBox('slidersBox');
    
    // TV için series anahtarını kullan
    if (tab == 'tv') {
      tab = 'series';
    }
    
    dynamic rawData = box.get(tab);
    
    // Veri yoksa varsayılan değerleri döndür
    if (rawData == null) {
      print('No sliders found in Hive for $tab, returning defaults');
      return List.from(defaultSliderConfigs);
    }
    
    // Veriyi SliderConfig listesine dönüştür
    if (rawData is List) {
      return rawData.map<SliderConfig>((item) {
        if (item is Map) {
          return SliderConfig.fromMap(item);
        }
        // Geçersiz öğe durumunda boş bir yapılandırma döndür
        return SliderConfig(id: '', title: '', color: '#000000');
      }).where((slider) => slider.id.isNotEmpty).toList();
    }
    
    // Geçersiz veri formatı durumunda varsayılan değerleri döndür
    print('Invalid data format for $tab sliders, returning defaults');
    return List.from(defaultSliderConfigs);
  } catch (e) {
    print('Error getting sliders for $tab: $e');
    // Hata durumunda varsayılan değerleri döndür
    return List.from(defaultSliderConfigs);
  }
}

/// Tüm slider yapılandırmaları için ID-başlık eşleştirme haritaları oluşturur
Future<Map<String, Map<String, String>>> getSliderMappings() async {
  final result = <String, Map<String, String>>{
    'idToTitle': {},
    'titleToId': {},
  };
  
  try {
    // Tüm kategorilerden tüm slider yapılandırmalarını topla
    final categories = ['movie', 'series', 'anime'];
    for (var category in categories) {
      final sliders = await getSlidersForTab(category);
      
      // Her slider için eşleştirmeleri ekle
      for (var slider in sliders) {
        if (slider.id.isNotEmpty && slider.title.isNotEmpty) {
          result['idToTitle']![slider.id] = slider.title;
          result['titleToId']![slider.title] = slider.id;
        }
      }
    }
  } catch (e) {
    print('Error creating slider mappings: $e');
  }
  
  // Eşleştirme haritaları boşsa varsayılan değerleri ekle
  if (result['idToTitle']!.isEmpty) {
    for (var slider in defaultSliderConfigs) {
      result['idToTitle']![slider.id] = slider.title;
      result['titleToId']![slider.title] = slider.id;
    }
  }
  
  return result;
}

/// Kategori bazında içerikleri filtreler
List<Map<String, dynamic>> filterContentBySlider(
    List<Map<String, dynamic>> allContent,
    SliderConfig slider) {
  return allContent.where((item) {
    final status = item['status']?.toString() ?? '';
    return status == slider.id;
  }).toList();
}
