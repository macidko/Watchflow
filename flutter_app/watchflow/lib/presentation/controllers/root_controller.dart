import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:watchflow/presentation/screens/anime_screen.dart';
import 'package:watchflow/presentation/screens/home_screen.dart';
import 'package:watchflow/presentation/screens/movie_screen.dart';
import 'package:watchflow/presentation/screens/settings_screen.dart';
import 'package:watchflow/presentation/screens/tv_screen.dart';

class RootController extends GetxController {
  final _currentIndex = 0.obs;
  
  int get currentIndex => _currentIndex.value;
  
  final List<Widget> pages = [
    const HomeScreen(showAppBar: true, showBottomNav: false),
    const MovieScreen(showAppBar: true, showBottomNav: false),
    const TvScreen(showAppBar: true, showBottomNav: false),
    const AnimeScreen(showAppBar: true, showBottomNav: false),
    const SettingsScreen(showAppBar: true, showBottomNav: false),
  ];
  
  void changePage(int index) {
    _currentIndex.value = index;
  }
} 