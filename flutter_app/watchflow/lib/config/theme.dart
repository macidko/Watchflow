import 'package:flutter/material.dart';

/// Watchflow teması için renk, stil ve tema tanımlamaları
class AppTheme {
  static const Color primaryColor = Color(0xFFFF4500); // Turuncu ana renk
  static const Color primaryDark = Color(0xFFE03D00);
  static const Color primaryLight = Color(0xFFFF6A33);
  
  static const Color darkBg = Color(0xFF121212);
  static const Color darkSurface = Color(0xFF1E1E1E);
  static const Color darkCard = Color(0xFF252525);
  
  static const Color lightBg = Color(0xFFF5F5F5);
  static const Color lightSurface = Color(0xFFFFFFFF);
  static const Color lightCard = Color(0xFFF0F0F0);

  // Statik arka plan rengi (sistem bar için)
  static const Color backgroundColor = darkBg;

  // Logo için özel renkler
  static const Color logoColor = primaryColor;
  
  // Derecelendirme yıldızları rengi
  static const Color ratingColor = Color(0xFFFFD700); // Altın sarısı
  
  // Statüs renkleri
  static const Color watchingColor = Color(0xFF4CAF50); // İzleniyor
  static const Color completedColor = Color(0xFF2196F3); // İzlendi
  static const Color planToWatchColor = Color(0xFFFF9800); // İzlenecek
  
  // Medya türleri için renk kodları
  static const Color movieColor = Color(0xFFE91E63); // Film
  static const Color tvColor = Color(0xFF9C27B0); // Dizi
  static const Color animeColor = Color(0xFF673AB7); // Anime

  /// Koyu tema
  static final ThemeData darkTheme = ThemeData(
    useMaterial3: true,
    brightness: Brightness.dark,
    colorScheme: const ColorScheme.dark(
      primary: primaryColor,
      secondary: primaryLight,
      surface: darkSurface,
      background: darkBg,
      error: Colors.redAccent,
      onPrimary: Colors.white,
      onSecondary: Colors.white,
      onSurface: Colors.white,
      onBackground: Colors.white,
      onError: Colors.white,
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: darkBg,
      foregroundColor: Colors.white,
      elevation: 0,
    ),
    scaffoldBackgroundColor: darkBg,
    cardTheme: CardThemeData(
      color: darkCard,
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(10),
      ),
    ),
    dialogTheme: DialogThemeData(
      backgroundColor: darkSurface,
      elevation: 5,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
    ),
    bottomNavigationBarTheme: const BottomNavigationBarThemeData(
      backgroundColor: darkBg,
      selectedItemColor: primaryColor,
      unselectedItemColor: Colors.grey,
    ),
    floatingActionButtonTheme: const FloatingActionButtonThemeData(
      backgroundColor: primaryColor,
      foregroundColor: Colors.white,
    ),
    inputDecorationTheme: InputDecorationTheme(
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Colors.grey),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: primaryColor, width: 2),
      ),
      filled: true,
      fillColor: darkCard,
    ),
    textButtonTheme: TextButtonThemeData(
      style: TextButton.styleFrom(
        foregroundColor: primaryColor,
      ),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: primaryColor,
        foregroundColor: Colors.white,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
      ),
    ),
    textTheme: const TextTheme(
      titleLarge: TextStyle(fontWeight: FontWeight.bold),
      bodyLarge: TextStyle(fontSize: 16),
    ),
  );

  /// Açık tema
  static final ThemeData lightTheme = ThemeData(
    useMaterial3: true,
    brightness: Brightness.light,
    colorScheme: const ColorScheme.light(
      primary: primaryColor,
      secondary: primaryDark,
      surface: lightSurface,
      background: lightBg,
      error: Colors.red,
      onPrimary: Colors.white,
      onSecondary: Colors.white,
      onSurface: Colors.black,
      onBackground: Colors.black,
      onError: Colors.white,
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: lightBg,
      foregroundColor: Colors.black,
      elevation: 0,
    ),
    scaffoldBackgroundColor: lightBg,
    cardTheme: CardThemeData(
      color: lightSurface,
      elevation: 1,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(10),
      ),
    ),
    dialogTheme: DialogThemeData(
      backgroundColor: lightSurface,
      elevation: 5,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
    ),
    bottomNavigationBarTheme: const BottomNavigationBarThemeData(
      backgroundColor: lightSurface,
      selectedItemColor: primaryColor,
      unselectedItemColor: Colors.grey,
    ),
    floatingActionButtonTheme: const FloatingActionButtonThemeData(
      backgroundColor: primaryColor,
      foregroundColor: Colors.white,
    ),
    inputDecorationTheme: InputDecorationTheme(
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: Colors.grey.shade400),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: primaryColor, width: 2),
      ),
      filled: true,
      fillColor: Colors.white,
    ),
    textButtonTheme: TextButtonThemeData(
      style: TextButton.styleFrom(
        foregroundColor: primaryColor,
      ),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: primaryColor,
        foregroundColor: Colors.white,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
      ),
    ),
    textTheme: const TextTheme(
      titleLarge: TextStyle(fontWeight: FontWeight.bold),
      bodyLarge: TextStyle(fontSize: 16),
    ),
  );
  
  // Özelleştirilmiş metin teması
  static TextTheme _customTextTheme(TextTheme base, [
    Color textColor = primaryColor,
    Color secondaryTextColor = Colors.grey,
  ]) {
    return base.copyWith(
      displayLarge: base.displayLarge?.copyWith(
        color: textColor,
        fontSize: 32,
        fontWeight: FontWeight.bold,
      ),
      displayMedium: base.displayMedium?.copyWith(
        color: textColor,
        fontSize: 28,
        fontWeight: FontWeight.bold,
      ),
      displaySmall: base.displaySmall?.copyWith(
        color: textColor,
        fontSize: 24,
        fontWeight: FontWeight.bold,
      ),
      headlineMedium: base.headlineMedium?.copyWith(
        color: textColor,
        fontSize: 22,
        fontWeight: FontWeight.w600,
      ),
      headlineSmall: base.headlineSmall?.copyWith(
        color: textColor,
        fontSize: 20,
        fontWeight: FontWeight.w600,
      ),
      titleLarge: base.titleLarge?.copyWith(
        color: textColor,
        fontSize: 18,
        fontWeight: FontWeight.w600,
      ),
      titleMedium: base.titleMedium?.copyWith(
        color: textColor,
        fontSize: 16,
        fontWeight: FontWeight.w600,
      ),
      titleSmall: base.titleSmall?.copyWith(
        color: textColor,
        fontSize: 14,
        fontWeight: FontWeight.w600,
      ),
      bodyLarge: base.bodyLarge?.copyWith(
        color: textColor,
        fontSize: 16,
      ),
      bodyMedium: base.bodyMedium?.copyWith(
        color: textColor,
        fontSize: 14,
      ),
      bodySmall: base.bodySmall?.copyWith(
        color: secondaryTextColor,
        fontSize: 12,
      ),
      labelLarge: base.labelLarge?.copyWith(
        color: textColor,
        fontSize: 14,
        fontWeight: FontWeight.w600,
      ),
      labelSmall: base.labelSmall?.copyWith(
        color: secondaryTextColor,
        fontSize: 10,
      ),
    );
  }
} 