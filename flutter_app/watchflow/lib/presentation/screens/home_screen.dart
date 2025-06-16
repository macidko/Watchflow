import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../config/theme.dart';
import '../../utils/theme_service.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Watchflow'),
        actions: [
          // Tema değiştirme butonu
          IconButton(
            icon: Icon(
              Get.isDarkMode ? Icons.wb_sunny_outlined : Icons.dark_mode_outlined,
              color: Get.isDarkMode ? Colors.yellow : Colors.grey.shade800,
            ),
            onPressed: () => ThemeService().changeThemeMode(),
          ),
        ],
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            // Logo
            Container(
              width: 100,
              height: 100,
              decoration: BoxDecoration(
                color: AppTheme.primaryColor,
                borderRadius: BorderRadius.circular(20),
              ),
              child: const Icon(
                Icons.movie_outlined,
                size: 60,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 32),
            
            // Başlık
            Text(
              'Watchflow',
              style: Theme.of(context).textTheme.displayMedium?.copyWith(
                    color: AppTheme.primaryColor,
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 16),
            
            // Alt başlık
            Text(
              'Film, Dizi ve Anime Takip Uygulaması',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 48),
            
            // Tema renk testi
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 32),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  _buildColorCard('Ana Renk', AppTheme.primaryColor),
                  _buildColorCard('Vurgu Rengi', AppTheme.accentColor),
                  _buildColorCard('Başarı', AppTheme.successColor),
                  _buildColorCard('Hata', AppTheme.errorColor),
                ],
              ),
            ),
            const SizedBox(height: 48),
            
            // Kategori butonları
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 32),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  _buildCategoryButton(context, 'Filmler', AppTheme.movieColor, Icons.movie),
                  _buildCategoryButton(context, 'Diziler', AppTheme.tvColor, Icons.tv),
                  _buildCategoryButton(context, 'Animeler', AppTheme.animeColor, Icons.animation),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
  
  // Renk kartı widget'ı
  Widget _buildColorCard(String title, Color color) {
    return Column(
      children: [
        Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.circular(10),
          ),
        ),
        const SizedBox(height: 8),
        Text(
          title,
          style: const TextStyle(fontSize: 12),
        ),
      ],
    );
  }
  
  // Kategori buton widget'ı
  Widget _buildCategoryButton(BuildContext context, String title, Color color, IconData icon) {
    return ElevatedButton(
      onPressed: () {},
      style: ElevatedButton.styleFrom(
        backgroundColor: color,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
      child: Column(
        children: [
          Icon(icon, color: Colors.white),
          const SizedBox(height: 8),
          Text(
            title,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 12,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }
} 