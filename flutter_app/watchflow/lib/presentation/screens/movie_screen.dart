import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:flutter/services.dart';
import 'package:watchflow/presentation/widgets/content_slider.dart';
import 'package:watchflow/presentation/widgets/watchflow_app_bar.dart';
import 'package:watchflow/presentation/widgets/bottom_nav_bar.dart';
import 'package:hive/hive.dart';
import 'package:watchflow/utils/slider_utils.dart';

class MovieScreen extends StatelessWidget {
  // Slider fonksiyonları utils/slider_utils.dart'a taşındı
  Future<List<Map<String, dynamic>>> _getMoviesFromHive() async {
    var box = await Hive.openBox<String>('movieBox');
    return box.values.map((e) => json.decode(e) as Map<String, dynamic>).toList();
  }
  final bool showAppBar;
  final bool showBottomNav;

  const MovieScreen({
    Key? key,
    this.showAppBar = true,
    this.showBottomNav = true,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: showAppBar ? const WatchflowAppBar(title: 'Filmler') : null,
      backgroundColor: Colors.black,
      body: SafeArea(
        child: FutureBuilder<List<dynamic>>(
          future: Future.wait([
            getSlidersForTab('movie'),
            _getMoviesFromHive(),
          ]),
          builder: (context, snapshot) {
            // Yükleme durumunda
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const Center(child: CircularProgressIndicator());
            }
            
            // Hata durumunda
            if (snapshot.hasError) {
              print('Error loading Movie screen: ${snapshot.error}');
              return Center(child: Text('Veri yüklenirken hata oluştu: ${snapshot.error}', 
                style: TextStyle(color: Colors.white)));
            }
            
            // Veri yok durumunda
            if (!snapshot.hasData || snapshot.data == null || snapshot.data!.isEmpty) {
              print('No data available for Movie screen');
              return const Center(child: Text('Veri bulunamadı', style: TextStyle(color: Colors.white)));
            }
            
            // Slider ve içerik verileri yoksa
            final sliders = snapshot.data![0] as List<dynamic>;
            final movies = snapshot.data![1] as List<Map<String, dynamic>>;
            
            if (sliders.isEmpty) {
              print('No sliders found for Movie screen');
              return const Center(child: Text('Slider yapılandırması bulunamadı', style: TextStyle(color: Colors.white)));
            }
            return ListView.separated(
              padding: const EdgeInsets.all(24),
              itemCount: sliders.length,
              separatorBuilder: (_, __) => const SizedBox(height: 24),
              itemBuilder: (context, index) {
                final slider = sliders[index] as Map;
                final id = slider['id']?.toString() ?? '';
                final title = slider['title']?.toString() ?? 'Kategori';
                
                // Debug: Filter işlemini kontrol et
                print('Filtering movies for slider: $id, title: $title');
                print('Total movies in Hive: ${movies.length}');
                
                final sliderMovies = movies
                    .where((m) {
                      final status = m['status']?.toString() ?? '';
                      final matches = status == id;
                      print('Movie: ${m['title']}, status: $status, matches slider $id: $matches');
                      return matches;
                    })
                    .toList();
                return ContentSlider(
                  title: title,
                  items: List<Map<String, dynamic>>.from(sliderMovies),
                );
              },
            );
          },
        ),
      ),
      bottomNavigationBar: showBottomNav ? const BottomNavBar(currentIndex: 1, onTap: _dummyOnTap) : null,
    );
  }

  static void _dummyOnTap(int index) {}
}


