import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:watchflow/config/theme.dart';
import 'package:watchflow/utils/theme_service.dart';
import 'package:watchflow/presentation/widgets/watchflow_app_bar.dart';
import 'package:watchflow/presentation/widgets/bottom_nav_bar.dart';

class SettingsScreen extends StatefulWidget {
  final bool showAppBar;
  final bool showBottomNav;

  const SettingsScreen({
    Key? key,
    this.showAppBar = true,
    this.showBottomNav = true,
  }) : super(key: key);

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  final ThemeService _themeService = ThemeService();
  bool _isDarkMode = true;
  
  @override
  void initState() {
    super.initState();
    _loadThemeMode();
  }
  
  Future<void> _loadThemeMode() async {
    _isDarkMode = await _themeService.loadThemeMode();
    setState(() {});
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: widget.showAppBar ? const WatchflowAppBar(title: 'Ayarlar') : null,
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: ListView(
        padding: const EdgeInsets.all(16.0),
        children: [
          _buildSectionTitle('Görünüm'),
          _buildThemeSelector(),
          const Divider(height: 32),
          
          _buildSectionTitle('Uygulama'),
          _buildSettingItem(
            'Dil',
            'Türkçe',
            Icons.language,
            () {
              // Dil seçimi işlevi
            },
          ),
          _buildSettingItem(
            'Bildirimler',
            'Açık',
            Icons.notifications,
            () {
              // Bildirim ayarları
            },
          ),
          const Divider(height: 32),
          
          _buildSectionTitle('İçerik'),
          _buildSettingItem(
            'Varsayılan İçerik Türü',
            'Tümü',
            Icons.category,
            () {
              // İçerik türü seçimi
            },
          ),
          _buildSettingItem(
            'Yetişkin İçerik Filtresi',
            'Açık',
            Icons.block,
            () {
              // İçerik filtresi ayarları
            },
          ),
          const Divider(height: 32),
          
          _buildSectionTitle('Hesap'),
          _buildSettingItem(
            'Profil',
            'Düzenle',
            Icons.person,
            () {
              // Profil düzenleme
            },
          ),
          _buildSettingItem(
            'Çıkış Yap',
            '',
            Icons.logout,
            () {
              // Çıkış işlemi
            },
            isDestructive: true,
          ),
          const Divider(height: 32),
          
          _buildSectionTitle('Hakkında'),
          _buildSettingItem(
            'Uygulama Sürümü',
            '1.0.0',
            Icons.info,
            () {
              // Sürüm bilgisi
            },
            isClickable: false,
          ),
          
          const Divider(height: 32),
          
          _buildSectionTitle('Geliştirici'),
          _buildSettingItem(
            'API Test Ekranı',
            'API servislerini test et',
            Icons.code,
            () {
              Get.toNamed('/api-test');
            },
          ),
        ],
      ),
      bottomNavigationBar: widget.showBottomNav ? const BottomNavBar(currentIndex: 4, onTap: _dummyOnTap) : null,
    );
  }
  
  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Text(
        title,
        style: TextStyle(
          fontSize: 18,
          fontWeight: FontWeight.bold,
          color: AppTheme.primaryColor,
        ),
      ),
    );
  }
  
  Widget _buildThemeSelector() {
    return Card(
      elevation: 0,
      color: Theme.of(context).colorScheme.surface,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Tema',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _buildThemeOption(
                  'Koyu',
                  Icons.dark_mode,
                  _isDarkMode,
                  () {
                    if (!_isDarkMode) {
                      setState(() {
                        _isDarkMode = true;
                      });
                      _themeService.switchTheme();
                    }
                  },
                ),
                _buildThemeOption(
                  'Açık',
                  Icons.light_mode,
                  !_isDarkMode,
                  () {
                    if (_isDarkMode) {
                      setState(() {
                        _isDarkMode = false;
                      });
                      _themeService.switchTheme();
                    }
                  },
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
  
  Widget _buildThemeOption(String title, IconData icon, bool isSelected, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        width: 120,
        padding: const EdgeInsets.symmetric(vertical: 16.0, horizontal: 8.0),
        decoration: BoxDecoration(
          color: isSelected ? AppTheme.primaryColor.withOpacity(0.2) : Colors.transparent,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? AppTheme.primaryColor : Colors.grey.withOpacity(0.3),
            width: 2,
          ),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              size: 32,
              color: isSelected ? AppTheme.primaryColor : Colors.grey,
            ),
            const SizedBox(height: 8),
            Text(
              title,
              style: TextStyle(
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                color: isSelected ? AppTheme.primaryColor : null,
              ),
            ),
          ],
        ),
      ),
    );
  }
  
  Widget _buildSettingItem(
    String title,
    String subtitle,
    IconData icon,
    VoidCallback onTap, {
    bool isDestructive = false,
    bool isClickable = true,
  }) {
    return ListTile(
      leading: Icon(
        icon,
        color: isDestructive ? Colors.red : AppTheme.primaryColor,
      ),
      title: Text(
        title,
        style: TextStyle(
          color: isDestructive ? Colors.red : null,
          fontWeight: FontWeight.w500,
        ),
      ),
      subtitle: subtitle.isNotEmpty ? Text(subtitle) : null,
      trailing: isClickable ? const Icon(Icons.chevron_right) : null,
      onTap: isClickable ? onTap : null,
      contentPadding: const EdgeInsets.symmetric(vertical: 4.0, horizontal: 16.0),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
    );
  }
  
  static void _dummyOnTap(int index) {
    // Boş fonksiyon, RootScreen'de zaten gerçek navigasyon işlemi yapılıyor
  }
}
