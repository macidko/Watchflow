import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:watchflow/domain/entities/media_entity.dart';
import 'package:watchflow/presentation/widgets/media_detail_modal.dart';
import 'package:watchflow/presentation/widgets/media_card.dart';

class ContentSlider extends StatefulWidget {
  final String title;
  final List<Map<String, dynamic>> items;

  const ContentSlider({
    Key? key,
    required this.title,
    required this.items,
  }) : super(key: key);

  @override
  State<ContentSlider> createState() => _ContentSliderState();
}

class _ContentSliderState extends State<ContentSlider> {
  final ScrollController _scrollController = ScrollController();
  bool _showLeftButton = false;
  bool _showRightButton = true;

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_updateScrollButtons);
  }

  @override
  void dispose() {
    _scrollController.removeListener(_updateScrollButtons);
    _scrollController.dispose();
    super.dispose();
  }

  void _updateScrollButtons() {
    setState(() {
      _showLeftButton = _scrollController.position.pixels > 0;
      _showRightButton = _scrollController.position.pixels < _scrollController.position.maxScrollExtent;
    });
  }

  void _scrollLeft() {
    final double currentOffset = _scrollController.offset;
    final double scrollAmount = currentOffset - 200.0;
    _scrollController.animateTo(
      scrollAmount < 0.0 ? 0.0 : scrollAmount,
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeInOut,
    );
  }

  void _scrollRight() {
    final double currentOffset = _scrollController.offset;
    final double scrollAmount = currentOffset + 200.0;
    final double maxOffset = _scrollController.position.maxScrollExtent;
    _scrollController.animateTo(
      scrollAmount > maxOffset ? maxOffset : scrollAmount,
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeInOut,
    );
  }

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
              widget.title,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
            if (widget.items.isNotEmpty)
              TextButton(
                onPressed: () => _showAllItemsModal(context),
                child: Text(
                  'Tümünü Gör',
                  style: TextStyle(
                    color: Colors.orange[800],
                    fontWeight: FontWeight.bold,
                    fontSize: 12,
                  ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        
        // İçerik slider'ı - Yüksekliği kart boyutuna göre ayarlandı
        SizedBox(
          height: 260,
          child: widget.items.isEmpty
              ? _buildEmptyState()
              : Stack(
                  alignment: Alignment.center,
                  children: [
                    ListView.builder(
                      controller: _scrollController,
                  scrollDirection: Axis.horizontal,
                      itemCount: widget.items.length,
                                        itemBuilder: (context, index) {
                        final item = widget.items[index];
                        return Padding(
                          padding: const EdgeInsets.only(right: 12),
                          child: MediaCard(
                            media: _convertToMediaEntity(item),
                            onTap: () {},
                          ),
                        );
                      },
                    ),
                    
                    // Sol kaydırma butonu
                    if (_showLeftButton)
                      Positioned(
                        left: 0,
                        child: _buildScrollButton(Icons.arrow_back_ios_rounded, _scrollLeft),
                      ),
                    
                    // Sağ kaydırma butonu
                    if (_showRightButton)
                      Positioned(
                        right: 0,
                        child: _buildScrollButton(Icons.arrow_forward_ios_rounded, _scrollRight),
                      ),
                  ],
                ),
        ),
      ],
    );
  }

  Widget _buildScrollButton(IconData icon, VoidCallback onPressed) {
    return Container(
      width: 32,
      height: 32,
      decoration: BoxDecoration(
        color: Colors.black.withOpacity(0.7),
        shape: BoxShape.circle,
      ),
      child: IconButton(
        padding: EdgeInsets.zero,
        icon: Icon(icon, color: Colors.white, size: 18),
        onPressed: onPressed,
      ),
    );
  }

  void _showAllItemsModal(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => Dialog(
        backgroundColor: Colors.transparent,
        insetPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 40),
        child: Container(
          constraints: BoxConstraints(
            maxWidth: MediaQuery.of(context).size.width > 800 
                ? 800 
                : MediaQuery.of(context).size.width * 0.9,
            maxHeight: MediaQuery.of(context).size.height * 0.8,
          ),
          decoration: const BoxDecoration(
            color: Color(0xFF212121),
            borderRadius: BorderRadius.all(Radius.circular(16)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Modal başlık
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      widget.title,
                      style: const TextStyle(
                        fontSize: 18, 
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close, color: Colors.white),
                      onPressed: () => Navigator.of(context).pop(),
                    ),
                  ],
                ),
              ),
              
              const Divider(color: Colors.grey, height: 1),
              
              // İçerik grid'i
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.all(8),
                  child: GridView.builder(
                    gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
                      maxCrossAxisExtent: 180,
                      childAspectRatio: 0.67,
                      crossAxisSpacing: 12,
                      mainAxisSpacing: 12,
                    ),
                    itemCount: widget.items.length,
                    itemBuilder: (context, index) {
                      final item = widget.items[index];
                      return MediaCard(
                        media: _convertToMediaEntity(item),
                        onTap: () {},
                      );
                    },
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }



  MediaEntity _convertToMediaEntity(Map<String, dynamic> item) {
    return MediaEntity(
      id: item['id'],
      title: item['title'],
      posterPath: item['image'],
      mediaType: item['mediaType'] ?? 'unknown',
      releaseDate: item['year']?.toString(),
      voteAverage: item['rating'],
      numberOfSeasons: item['seasons'],
      numberOfEpisodes: item['episodes'],
      additionalInfo: {
        'progress': item['progress'],
        'watched': item['progress'] != null && item['progress'] >= 95,
      },
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
