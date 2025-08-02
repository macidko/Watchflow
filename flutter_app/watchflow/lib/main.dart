import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

import 'config/theme.dart';
import 'utils/theme_service.dart';
import 'data/services/service_bindings.dart';
import 'config/config_service.dart';
import 'utils/slider_utils.dart';
import 'presentation/screens/api_test_screen.dart';
import 'presentation/screens/home_screen.dart';
import 'presentation/screens/movie_screen.dart';
import 'presentation/screens/tv_screen.dart';
import 'presentation/screens/anime_screen.dart';
import 'presentation/screens/settings_screen.dart';
import 'presentation/screens/detail_screen.dart';
import 'presentation/screens/root_screen.dart';

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
  
  // Servisleri başlat
  await ServiceBindings().dependencies();

  // Slider yapılandırmasını Hive'da kontrol et ve gerekirse varsayılan değerleri yükle
  await initSlidersIfNeeded();

  // App configlerini yükle
  await ConfigService().loadConfigs();

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return GetMaterialApp(
      title: 'Watchflow',
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.dark, // Varsayılan olarak koyu tema
      debugShowCheckedModeBanner: false,
      defaultTransition: Transition.cupertino,
      getPages: [
        GetPage(name: '/', page: () => const HomeScreen()),
        GetPage(name: '/movies', page: () => const MovieScreen()),
        GetPage(name: '/tv', page: () => const TvScreen()),
        GetPage(name: '/anime', page: () => const AnimeScreen()),
        GetPage(name: '/settings', page: () => const SettingsScreen()),
        GetPage(name: '/detail/:id', page: () => const DetailScreen()),
        GetPage(name: '/api-test', page: () => const ApiTestScreen()),
      ],
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
    // 2 saniye sonra Ana Ekrana geçiş yap
    Future.delayed(const Duration(seconds: 2), () {
      Get.off(() => const RootScreen(), transition: Transition.fadeIn);
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
            // Logo
            SizedBox(
              width: 120,
              height: 120,
              child: Image.asset('assets/images/watchflow_logo.png'),
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
