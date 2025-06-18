import 'package:flutter/material.dart';
import 'package:watchflow/config/theme.dart';

class AppDrawer extends StatelessWidget {
  const AppDrawer({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Drawer(
      child: ListView(
        padding: EdgeInsets.zero,
        children: [
          DrawerHeader(
            decoration: BoxDecoration(
              color: AppTheme.primaryColor,
            ),
            child: const Text(
              'Watchflow',
              style: TextStyle(
                color: Colors.white,
                fontSize: 24,
              ),
            ),
          ),
          ListTile(
            leading: const Icon(Icons.home),
            title: const Text('Ana Sayfa'),
            onTap: () {
              Navigator.pushReplacementNamed(context, '/');
            },
          ),
          ListTile(
            leading: const Icon(Icons.movie),
            title: const Text('Filmler'),
            onTap: () {
              Navigator.pushReplacementNamed(context, '/movies');
            },
          ),
          ListTile(
            leading: const Icon(Icons.tv),
            title: const Text('Diziler'),
            onTap: () {
              Navigator.pushReplacementNamed(context, '/tv');
            },
          ),
          ListTile(
            leading: const Icon(Icons.animation),
            title: const Text('Animeler'),
            onTap: () {
              Navigator.pushReplacementNamed(context, '/anime');
            },
          ),
          ListTile(
            leading: const Icon(Icons.settings),
            title: const Text('Ayarlar'),
            onTap: () {
              Navigator.pushReplacementNamed(context, '/settings');
            },
          ),
        ],
      ),
    );
  }
}
