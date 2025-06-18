import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../config/theme.dart';
import '../../utils/theme_service.dart';
import 'package:watchflow/presentation/controllers/home_controller.dart';
import 'package:watchflow/presentation/widgets/content_slider.dart';
import 'package:watchflow/presentation/widgets/app_drawer.dart';
import 'package:watchflow/presentation/widgets/watchflow_app_bar.dart';
import 'package:watchflow/presentation/widgets/bottom_nav_bar.dart';

class HomeScreen extends StatelessWidget {
  final bool showAppBar;
  final bool showBottomNav;

  const HomeScreen({
    super.key,
    this.showAppBar = true,
    this.showBottomNav = true,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: showAppBar ? const WatchflowAppBar() : null,
      body: SafeArea(
        child: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ContentSlider(
                  title: 'İzleniyor',
                  items: [
                    // Örnek veriler
                    {'id': 1, 'title': 'Breaking Bad', 'image': 'https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg'},
                    {'id': 2, 'title': 'Game of Thrones', 'image': 'https://image.tmdb.org/t/p/w500/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg'},
                    {'id': 3, 'title': 'The Witcher', 'image': 'https://image.tmdb.org/t/p/w500/7vjaCdMw15FEbXyLQTVa04URsPm.jpg'},
                  ],
                  onSeeAll: () => Get.toNamed('/all-items', arguments: {'category': 'watching'}),
                ),
                
                const SizedBox(height: 24),
                
                ContentSlider(
                  title: 'İzlenecekler',
                  items: [
                    // Örnek veriler
                    {'id': 4, 'title': 'Stranger Things', 'image': 'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg'},
                    {'id': 5, 'title': 'The Mandalorian', 'image': 'https://image.tmdb.org/t/p/w500/sWgBv7LV2PRoQgkxwlibdGXKz1S.jpg'},
                    {'id': 6, 'title': 'Dark', 'image': 'https://image.tmdb.org/t/p/w500/apbrbWs8M9lyOpJYU5WXrpFbk1Z.jpg'},
                  ],
                  onSeeAll: () => Get.toNamed('/all-items', arguments: {'category': 'plan_to_watch'}),
                ),
                
                const SizedBox(height: 24),
                
                ContentSlider(
                  title: 'İzlenenler',
                  items: [
                    // Örnek veriler
                    {'id': 7, 'title': 'Friends', 'image': 'https://image.tmdb.org/t/p/w500/f496cm9enuEsZkSPzCwnTESEK5s.jpg'},
                    {'id': 8, 'title': 'The Office', 'image': 'https://image.tmdb.org/t/p/w500/qWnJzyZhyy74gjpSjIXWmuk0ifX.jpg'},
                    {'id': 9, 'title': 'Sherlock', 'image': 'https://image.tmdb.org/t/p/w500/7WTsnHkbA0FaG6R9hAiIVrZjwUf.jpg'},
                  ],
                  onSeeAll: () => Get.toNamed('/all-items', arguments: {'category': 'completed'}),
                ),
              ],
            ),
          ),
        ),
      ),
      bottomNavigationBar: showBottomNav ? const BottomNavBar(currentIndex: 0, onTap: _dummyOnTap) : null,
    );
  }
  
  static void _dummyOnTap(int index) {
    // Boş fonksiyon, RootScreen'de zaten gerçek navigasyon işlemi yapılıyor
  }
} 