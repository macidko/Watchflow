import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:flutter/services.dart';
import 'package:watchflow/config/config_service.dart';
import 'package:watchflow/presentation/widgets/content_slider.dart';
import 'package:watchflow/presentation/widgets/watchflow_app_bar.dart';
import 'package:watchflow/presentation/widgets/bottom_nav_bar.dart';

class TvScreen extends StatelessWidget {
  final bool showAppBar;
  final bool showBottomNav;

  const TvScreen({
    Key? key,
    this.showAppBar = true,
    this.showBottomNav = true,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final sliders = ConfigService().getSlidersForTab('tv');

    return Scaffold(
      appBar: showAppBar ? const WatchflowAppBar(title: 'Diziler') : null,
      backgroundColor: Colors.black,
      body: SafeArea(
        child: FutureBuilder<String>(
          future: rootBundle.loadString('assets/dummy/media.json'),
          builder: (context, snapshot) {
            if (!snapshot.hasData) {
              return const Center(child: CircularProgressIndicator());
            }
            final jsonData = json.decode(snapshot.data!);
            final List tvs = jsonData['tv'] ?? [];
            return ListView.separated(
              padding: const EdgeInsets.all(24),
              itemCount: sliders.length,
              separatorBuilder: (_, __) => const SizedBox(height: 24),
              itemBuilder: (context, index) {
                final slider = sliders[index];
                final sliderTvs = tvs
                    .where((m) => m['status'] == slider.id)
                    .toList();
                return ContentSlider(
                  title: slider.title,
                  items: List<Map<String, dynamic>>.from(sliderTvs),
                );
              },
            );
          },
        ),
      ),
      bottomNavigationBar: showBottomNav ? const BottomNavBar(currentIndex: 2, onTap: _dummyOnTap) : null,
    );
  }

  static void _dummyOnTap(int index) {}
}
