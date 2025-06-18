import 'package:flutter/material.dart';

class BottomNavBar extends StatelessWidget {
  final int currentIndex;
  final Function(int) onTap;

  const BottomNavBar({
    Key? key,
    required this.currentIndex,
    required this.onTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return BottomNavigationBar(
      currentIndex: currentIndex,
      onTap: onTap,
      type: BottomNavigationBarType.fixed,
      backgroundColor: Colors.black,
      selectedItemColor: Colors.orange[800],
      unselectedItemColor: Colors.grey,
      selectedFontSize: 12,
      unselectedFontSize: 12,
      items: const [
        BottomNavigationBarItem(
          icon: Icon(Icons.home),
          label: 'Anasayfa',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.movie),
          label: 'Film',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.tv),
          label: 'Dizi',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.animation),
          label: 'Anime',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.settings),
          label: 'Ayarlar',
        ),
      ],
    );
  }
}
