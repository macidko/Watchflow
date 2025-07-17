import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:watchflow/presentation/controllers/root_controller.dart';
import 'package:watchflow/presentation/screens/home_screen.dart';
import 'package:watchflow/presentation/screens/movie_screen.dart';
import 'package:watchflow/presentation/screens/tv_screen.dart';
import 'package:watchflow/presentation/screens/anime_screen.dart';
import 'package:watchflow/presentation/screens/settings_screen.dart';
import 'package:watchflow/presentation/widgets/watchflow_app_bar.dart';
import 'package:watchflow/presentation/widgets/bottom_nav_bar.dart';
import 'package:watchflow/presentation/widgets/search_modal.dart';

class RootScreen extends StatelessWidget {
  const RootScreen({Key? key}) : super(key: key);

  void _showSearchModal(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      isDismissible: true,
      enableDrag: false,
      showDragHandle: false,
      backgroundColor: Colors.transparent,
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.9,
        minChildSize: 0.5,
        maxChildSize: 0.95,
        builder: (_, scrollController) {
          return ClipRRect(
            borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
            child: Column(
              children: [
                // Modal içeriği
                Expanded(
                  child: SingleChildScrollView(
                    controller: scrollController,
                    child: const SearchModal(),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final RootController controller = Get.put(RootController());
    
    return Scaffold(
      backgroundColor: Colors.black,
      body: Obx(() => AnimatedSwitcher(
        duration: const Duration(milliseconds: 350),
        switchInCurve: Curves.easeInOut,
        switchOutCurve: Curves.easeInOut,
        transitionBuilder: (child, animation) => FadeTransition(
          opacity: animation,
          child: child,
        ),
        child: controller.pages[controller.currentIndex],
      )),
      bottomNavigationBar: Obx(() => BottomNavBar(
        currentIndex: controller.currentIndex,
        onTap: controller.changePage,
      )),
      floatingActionButton: Container(
        margin: const EdgeInsets.only(bottom: 10),
        height: 56,
        width: 56,
        child: FloatingActionButton(
          onPressed: () => _showSearchModal(context),
          backgroundColor: Colors.orange[800],
          elevation: 4,
          highlightElevation: 8,
          child: const Icon(Icons.search, color: Colors.white, size: 28),
        ),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.endFloat,
    );
  }
}

// Ana sayfa içerik widget'ı
class HomeContent extends StatelessWidget {
  const HomeContent({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return const HomeScreen(showAppBar: false, showBottomNav: false);
  }
}

// Film içerik widget'ı
class MovieContent extends StatelessWidget {
  const MovieContent({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return const MovieScreen(showAppBar: false, showBottomNav: false);
  }
}

// Dizi içerik widget'ı
class TvContent extends StatelessWidget {
  const TvContent({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return const TvScreen(showAppBar: false, showBottomNav: false);
  }
}

// Anime içerik widget'ı
class AnimeContent extends StatelessWidget {
  const AnimeContent({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return const AnimeScreen(showAppBar: false, showBottomNav: false);
  }
}

// Ayarlar içerik widget'ı
class SettingsContent extends StatelessWidget {
  const SettingsContent({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return const SettingsScreen(showAppBar: false, showBottomNav: false);
  }
} 