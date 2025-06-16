import 'package:flutter/material.dart';

/// Watchflow teması için renk, stil ve tema tanımlamaları
class AppTheme {
  static const Color primaryColor = Color(0xFFFF4500); // Turuncu ana renk
  static const Color accentColor = Color(0xFF2E6BEF); // Mavi vurgu rengi
  static const Color backgroundColor = Color(0xFF121212); // Koyu arka plan
  static const Color cardColor = Color(0xFF1E1E1E); // Kart arka plan
  static const Color surfaceColor = Color(0xFF252525); // Yüzey rengi
  static const Color textColor = Color(0xFFFFFFFF); // Beyaz metin
  static const Color secondaryTextColor = Color(0xFFAAAAAA); // İkincil metin rengi
  static const Color errorColor = Color(0xFFE53935); // Hata rengi
  static const Color successColor = Color(0xFF43A047); // Başarı rengi
  static const Color dividerColor = Color(0xFF323232); // Ayırıcı çizgi rengi

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
  static ThemeData get darkTheme {
    final ThemeData base = ThemeData.dark();
    
    return base.copyWith(
      primaryColor: primaryColor,
      colorScheme: const ColorScheme.dark(
        primary: primaryColor,
        secondary: accentColor,
        surface: surfaceColor,
        background: backgroundColor,
        error: errorColor,
      ),
      cardColor: cardColor,
      dialogBackgroundColor: cardColor,
      scaffoldBackgroundColor: backgroundColor,
      dividerColor: dividerColor,
      
      // Metin temaları
      textTheme: _customTextTheme(base.textTheme),
      primaryTextTheme: _customTextTheme(base.primaryTextTheme),
      
      // AppBar teması
      appBarTheme: const AppBarTheme(
        color: backgroundColor,
        elevation: 0,
        centerTitle: false,
        iconTheme: IconThemeData(color: primaryColor),
        titleTextStyle: TextStyle(
          color: textColor,
          fontWeight: FontWeight.bold,
          fontSize: 20,
        ),
      ),
      
      // Bottom Navigation teması
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: backgroundColor,
        selectedItemColor: primaryColor,
        unselectedItemColor: secondaryTextColor,
        type: BottomNavigationBarType.fixed,
        showUnselectedLabels: true,
      ),
      
      // Card teması - CardTheme yerine CardThemeData kullanıldı
      cardTheme: CardThemeData(
        color: cardColor,
        elevation: 4,
        shadowColor: Colors.black.withOpacity(0.4),
        margin: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
      
      // FloatingActionButton teması
      floatingActionButtonTheme: const FloatingActionButtonThemeData(
        backgroundColor: primaryColor,
        foregroundColor: textColor,
      ),
      
      // Input teması
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: surfaceColor,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide.none,
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: primaryColor),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: errorColor),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      ),
      
      // Button teması
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ButtonStyle(
          backgroundColor: MaterialStateProperty.all<Color>(primaryColor),
          foregroundColor: MaterialStateProperty.all<Color>(textColor),
          padding: MaterialStateProperty.all<EdgeInsetsGeometry>(
            const EdgeInsets.symmetric(horizontal: 16, vertical: 12)
          ),
          shape: MaterialStateProperty.all<RoundedRectangleBorder>(
            RoundedRectangleBorder(borderRadius: BorderRadius.circular(8.0))
          ),
        ),
      ),
      
      // Icon teması
      iconTheme: const IconThemeData(
        color: primaryColor,
        size: 24,
      ),
    );
  }

  /// Açık tema
  static ThemeData get lightTheme {
    final ThemeData base = ThemeData.light();
    
    const Color lightBackgroundColor = Color(0xFFF5F5F5);
    const Color lightSurfaceColor = Colors.white;
    const Color lightTextColor = Color(0xFF212121);
    const Color lightSecondaryTextColor = Color(0xFF757575);
    const Color lightDividerColor = Color(0xFFE0E0E0);
    
    return base.copyWith(
      primaryColor: primaryColor,
      colorScheme: const ColorScheme.light(
        primary: primaryColor,
        secondary: accentColor,
        surface: lightSurfaceColor,
        background: lightBackgroundColor,
        error: errorColor,
      ),
      cardColor: lightSurfaceColor,
      dialogBackgroundColor: lightSurfaceColor,
      scaffoldBackgroundColor: lightBackgroundColor,
      dividerColor: lightDividerColor,
      
      // Metin temaları
      textTheme: _customTextTheme(base.textTheme, lightTextColor, lightSecondaryTextColor),
      primaryTextTheme: _customTextTheme(base.primaryTextTheme, lightTextColor, lightSecondaryTextColor),
      
      // AppBar teması
      appBarTheme: const AppBarTheme(
        color: primaryColor,
        elevation: 0,
        centerTitle: false,
        iconTheme: IconThemeData(color: Colors.white),
        titleTextStyle: TextStyle(
          color: Colors.white,
          fontWeight: FontWeight.bold,
          fontSize: 20,
        ),
      ),
      
      // Bottom Navigation teması
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: lightSurfaceColor,
        selectedItemColor: primaryColor,
        unselectedItemColor: lightSecondaryTextColor,
        type: BottomNavigationBarType.fixed,
        showUnselectedLabels: true,
      ),
      
      // Card teması - CardTheme yerine CardThemeData kullanıldı
      cardTheme: CardThemeData(
        color: lightSurfaceColor,
        elevation: 2,
        shadowColor: Colors.black.withOpacity(0.1),
        margin: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
      
      // FloatingActionButton teması
      floatingActionButtonTheme: const FloatingActionButtonThemeData(
        backgroundColor: primaryColor,
        foregroundColor: Colors.white,
      ),
      
      // Input teması
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.white,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFFE0E0E0)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFFE0E0E0)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: primaryColor),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: errorColor),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      ),
      
      // Button teması
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ButtonStyle(
          backgroundColor: MaterialStateProperty.all<Color>(primaryColor),
          foregroundColor: MaterialStateProperty.all<Color>(Colors.white),
          padding: MaterialStateProperty.all<EdgeInsetsGeometry>(
            const EdgeInsets.symmetric(horizontal: 16, vertical: 12)
          ),
          shape: MaterialStateProperty.all<RoundedRectangleBorder>(
            RoundedRectangleBorder(borderRadius: BorderRadius.circular(8.0))
          ),
        ),
      ),
      
      // Icon teması
      iconTheme: const IconThemeData(
        color: primaryColor,
        size: 24,
      ),
    );
  }
  
  // Özelleştirilmiş metin teması
  static TextTheme _customTextTheme(TextTheme base, [
    Color textColor = textColor,
    Color secondaryTextColor = secondaryTextColor,
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