import 'package:flutter/material.dart';
import 'package:get/get.dart';

class ContentSlider extends StatelessWidget {
  final String title;
  final List<Map<String, dynamic>> items;
  final VoidCallback? onSeeAll;

  const ContentSlider({
    Key? key,
    required this.title,
    required this.items,
    this.onSeeAll,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Başlık ve "Tümünü Gör" butonu
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              title,
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
            if (onSeeAll != null)
              TextButton(
                onPressed: onSeeAll,
                child: Text(
                  'Tümünü Gör',
                  style: TextStyle(
                    color: Colors.orange[800],
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
          ],
        ),
        const SizedBox(height: 12),
        
        // İçerik slider'ı
        SizedBox(
          height: 180,
          child: items.isEmpty
              ? _buildEmptyState()
              : ListView.builder(
                  scrollDirection: Axis.horizontal,
                  itemCount: items.length,
                  itemBuilder: (context, index) {
                    final item = items[index];
                    return _buildMediaCard(context, item);
                  },
                ),
        ),
      ],
    );
  }

  Widget _buildMediaCard(BuildContext context, Map<String, dynamic> item) {
    return GestureDetector(
      onTap: () => Get.toNamed('/detail', arguments: {'id': item['id']}),
      child: Container(
        margin: const EdgeInsets.only(right: 12),
        width: 120,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Poster
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: Stack(
                children: [
                  // Poster resmi
                  Image.network(
                    item['image'],
                    width: 120,
                    height: 150,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) {
                      return Container(
                        width: 120,
                        height: 150,
                        color: Colors.grey[800],
                        child: const Center(
                          child: Icon(
                            Icons.image_not_supported,
                            color: Colors.white54,
                          ),
                        ),
                      );
                    },
                  ),
                  
                  // İzleme durumu göstergesi
                  if (item['progress'] != null)
                    Positioned(
                      bottom: 0,
                      left: 0,
                      right: 0,
                      child: LinearProgressIndicator(
                        value: item['progress'] / 100,
                        backgroundColor: Colors.black54,
                        valueColor: AlwaysStoppedAnimation<Color>(Colors.orange[800]!),
                      ),
                    ),
                ],
              ),
            ),
            
            // Başlık
            Padding(
              padding: const EdgeInsets.only(top: 6),
              child: Text(
                item['title'],
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                  color: Colors.white,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.movie_filter,
            size: 48,
            color: Colors.grey[700],
          ),
          const SizedBox(height: 8),
          Text(
            'Henüz içerik eklenmemiş',
            style: TextStyle(
              color: Colors.grey[500],
              fontSize: 14,
            ),
          ),
        ],
      ),
    );
  }
}
