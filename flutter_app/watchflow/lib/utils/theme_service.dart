import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Tema tercihlerini yöneten servis sınıfı
class ThemeService {
  final _darkModeKey = 'isDarkMode';
  
  /// Tema modunu Get.isDarkMode üzerinden almak
  bool get isDarkMode => Get.isDarkMode;
  
  /// Tema tercihi - karanlık mod için true
  Future<bool> loadThemeMode() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    return prefs.getBool(_darkModeKey) ?? true; // Varsayılan olarak karanlık tema
  }
  
  /// Tema ayarını kaydetme
  Future<void> saveThemeMode(bool isDarkMode) async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_darkModeKey, isDarkMode);
  }
  
  /// Temayı değiştirme
  Future<void> changeThemeMode() async {
    Get.changeThemeMode(Get.isDarkMode ? ThemeMode.light : ThemeMode.dark);
    await saveThemeMode(!Get.isDarkMode);
  }
  
  /// Belirli bir tema moduna geçme
  Future<void> setThemeMode(bool isDark) async {
    Get.changeThemeMode(isDark ? ThemeMode.dark : ThemeMode.light);
    await saveThemeMode(isDark);
  }
} 