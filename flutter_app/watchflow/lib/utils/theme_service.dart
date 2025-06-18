import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Tema tercihlerini yöneten servis sınıfı
class ThemeService {
  final _key = 'isDarkMode';
  
  /// Tema modunu yükleyen fonksiyon, varsayılan olarak karanlık tema
  Future<bool> loadThemeMode() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool(_key) ?? true;
  }

  /// Tema modunu kaydeden fonksiyon
  Future<void> _saveThemeMode(bool isDarkMode) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_key, isDarkMode);
  }

  /// Temayı değiştiren fonksiyon
  void switchTheme() async {
    bool isDarkMode = await loadThemeMode();
    Get.changeThemeMode(isDarkMode ? ThemeMode.light : ThemeMode.dark);
    await _saveThemeMode(!isDarkMode);
  }
  
  /// Mevcut tema modunu döndüren fonksiyon
  Future<ThemeMode> getThemeMode() async {
    bool isDarkMode = await loadThemeMode();
    return isDarkMode ? ThemeMode.dark : ThemeMode.light;
  }
} 