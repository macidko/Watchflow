import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

import 'config/theme.dart';
import 'utils/theme_service.dart';
import 'data/services/service_bindings.dart';
import 'presentation/screens/api_test_screen.dart';

void main() async {
  // Flutter widget bağlamını başlat
  WidgetsFlutterBinding.ensureInitialized();
  
  // Durum çubuğu stilini ayarla
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      systemNavigationBarColor: AppTheme.backgroundColor,
      systemNavigationBarIconBrightness: Brightness.light,
    ),
  );
  
  // Ekran yönünü dikey olarak sabitle
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);
  
  // Hive veritabanını başlat
  await Hive.initFlutter();
  
  // Kayıtlı tema modunu yükle
  final themeService = ThemeService();
  final isDarkMode = await themeService.loadThemeMode();
  
  runApp(MyApp(isDarkMode: isDarkMode));
}

class MyApp extends StatelessWidget {
  final bool isDarkMode;
  
  const MyApp({super.key, required this.isDarkMode});

  @override
  Widget build(BuildContext context) {
    return GetMaterialApp(
      title: 'Watchflow',
      debugShowCheckedModeBanner: false, // Debug banner'ı kaldır
      
      // Tema yapılandırması
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: isDarkMode ? ThemeMode.dark : ThemeMode.light,
      
      // Servis bağlayıcıları
      initialBinding: ServiceBindings(),
      
      // Çoklu dil desteği
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: const [
        Locale('tr', 'TR'), // Türkçe
        Locale('en', 'US'), // İngilizce
      ],
      locale: const Locale('tr', 'TR'), // Varsayılan dil
      
      // Ana sayfa
      home: const SplashScreen(),
    );
  }
}

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    // 2 saniye sonra API test ekranına geçiş yap
    Future.delayed(const Duration(seconds: 2), () {
      Get.off(() => const ApiTestScreen(), transition: Transition.fadeIn);
    });
  }

  @override
  Widget build(BuildContext context) {
    // Geçici splash ekranı
    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Logo animasyonu burada yer alacak
            const SizedBox(
              width: 120,
              height: 120,
              child: FlutterLogo(size: 120),
            ),
            const SizedBox(height: 24),
            Text(
              'Watchflow',
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                color: AppTheme.primaryColor,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Film, Dizi ve Anime Takip Uygulaması',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
          ],
        ),
      ),
    );
  }
}
