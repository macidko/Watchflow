import 'dart:ui';
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
    final theme = Theme.of(context);
    final safeAreaPadding = MediaQuery.of(context).padding.bottom;
    final screenWidth = MediaQuery.of(context).size.width;
    const itemCount = 5;
    final itemWidth = screenWidth / itemCount;
    const indicatorWidth = 30.0;

    return Container(
      height: 60 + safeAreaPadding,
      padding: EdgeInsets.only(bottom: safeAreaPadding),
      decoration: BoxDecoration(
        color: const Color(0xFF1A1B20),
        border: Border(top: BorderSide(color: Colors.white.withOpacity(0.1), width: 0.5)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.5),
            blurRadius: 20,
            offset: const Offset(0, -5),
          ),
        ],
      ),
      child: Stack(
        children: [
          AnimatedPositioned(
            duration: const Duration(milliseconds: 300),
            curve: Curves.easeOut,
            top: 0,
            left: (itemWidth * currentIndex) + (itemWidth - indicatorWidth) / 2,
            child: Container(
              width: indicatorWidth,
              height: 3.0,
              decoration: BoxDecoration(
                borderRadius: const BorderRadius.all(Radius.circular(2)),
                gradient: LinearGradient(
                  colors: [
                    Colors.orange[600]!,
                    Colors.orange[800]!,
                  ],
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.orange.withOpacity(0.5),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  )
                ],
              ),
            ),
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildNavItem(context, Icons.home_rounded, 'Anasayfa', 0),
              _buildNavItem(context, Icons.movie_rounded, 'Film', 1),
              _buildNavItem(context, Icons.tv_rounded, 'Dizi', 2),
              _buildNavItem(context, Icons.rocket_launch_rounded, 'Anime', 3),
              _buildNavItem(context, Icons.settings_rounded, 'Ayarlar', 4),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildNavItem(BuildContext context, IconData icon, String label, int index) {
    final bool isSelected = currentIndex == index;
    return Expanded(
      child: MouseRegion(
        cursor: SystemMouseCursors.click,
        child: GestureDetector(
          onTap: () => onTap(index),
          behavior: HitTestBehavior.opaque,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                icon,
                size: 26,
                color: isSelected ? Colors.white : Colors.blueGrey[200],
              ),
              AnimatedOpacity(
                duration: const Duration(milliseconds: 250),
                opacity: isSelected ? 1.0 : 0.0,
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 250),
                  height: isSelected ? 18 : 0,
                  child: isSelected
                      ? Padding(
                          padding: const EdgeInsets.only(top: 4.0),
                          child: Text(
                            label,
                            style: TextStyle(
                              color: Colors.orange[100],
                              fontWeight: FontWeight.w600,
                              fontSize: 11.5,
                              shadows: [
                                Shadow(
                                  color: Colors.black.withOpacity(0.5),
                                  blurRadius: 4,
                                )
                              ]
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        )
                      : null,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
