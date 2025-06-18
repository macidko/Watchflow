import 'package:flutter/material.dart';
import 'package:watchflow/config/theme.dart';
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
    return Scaffold(
      appBar: showAppBar ? const WatchflowAppBar(title: 'Diziler') : null,
      backgroundColor: Colors.black,
      body: Center(
        child: Text(
          'Dizi Ekranı',
          style: TextStyle(color: Colors.white),
        ),
      ),
      bottomNavigationBar: showBottomNav ? const BottomNavBar(currentIndex: 2, onTap: _dummyOnTap) : null,
    );
  }
  
  static void _dummyOnTap(int index) {
    // Boş fonksiyon, RootScreen'de zaten gerçek navigasyon işlemi yapılıyor
  }
}
