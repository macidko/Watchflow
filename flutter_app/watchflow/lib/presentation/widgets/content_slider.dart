import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:watchflow/domain/entities/media_entity.dart';
import 'package:watchflow/presentation/widgets/media_detail_modal.dart';

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
        
        // İçerik slider'ı - Yüksekliği küçültüldü
        SizedBox(
          height: 160,
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
                        return _buildMediaCard(context, item);
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
                    gridDelegate: SliverGridDelegateWithMaxCrossAxisExtent(
                      maxCrossAxisExtent: 120,
                      childAspectRatio: 0.55,
                      crossAxisSpacing: 10,
                      mainAxisSpacing: 10,
                    ),
                    itemCount: widget.items.length,
                    itemBuilder: (context, index) {
                      final item = widget.items[index];
                      return _buildAllItemsCard(context, item);
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

  Widget _buildAllItemsCard(BuildContext context, Map<String, dynamic> item) {
    // ContentSlider için basit bir MediaEntity dönüştürmesi yapıyoruz
    final media = MediaEntity(
      id: item['id'],
      title: item['title'],
      posterPath: item['image'],
      mediaType: item['mediaType'] ?? 'unknown',
      releaseDate: item['year']?.toString(),
      voteAverage: item['rating'],
      numberOfSeasons: item['seasons'],
      numberOfEpisodes: item['episodes'],
      // progress bilgisini additionalInfo içinde saklıyoruz
      additionalInfo: {'progress': item['progress']},
    );
    
    return GestureDetector(
      onTap: () {
        // Detay modalını gösteriyoruz, mevcut modalı kapatmadan
        showModalBottomSheet(
          context: context,
          backgroundColor: Colors.transparent,
          isScrollControlled: true,
          isDismissible: true,
          constraints: BoxConstraints(
            maxWidth: MediaQuery.of(context).size.width > 600 
                ? 600 
                : MediaQuery.of(context).size.width,
          ),
          builder: (context) => Center(
            child: SizedBox(
              height: MediaQuery.of(context).size.height * 0.8,
              child: MediaDetailModal(media: media),
            ),
          ),
        );
      },
      child: SizedBox(
        width: 110,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Poster - Ana sayfadakiyle aynı boyutlar
            ClipRRect(
              borderRadius: BorderRadius.circular(6),
              child: Stack(
                children: [
                  // Poster resmi
                  Image.network(
                    item['image'],
                    width: 110,
                    height: 140,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) {
                      return Container(
                        width: 110,
                        height: 140,
                        color: Colors.grey[800],
                        child: const Center(
                          child: Icon(
                            Icons.image_not_supported,
                            color: Colors.white54,
                            size: 20,
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
                    
                  // Bölüm/Sezon Bilgisi Etiketi
                  if (item['mediaType'] == 'tv' || item['mediaType'] == 'anime')
                    Positioned(
                      top: 5,
                      right: 5,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                        decoration: BoxDecoration(
                          color: Colors.black.withOpacity(0.7),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          '${item['seasons']} S',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 9,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),
            
            // Başlık ve Alt Bilgiler
            Padding(
              padding: const EdgeInsets.only(top: 4),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    item['title'],
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  if (item['year'] != null)
                    Text(
                      item['year'],
                      style: TextStyle(
                        fontSize: 9,
                        color: Colors.grey[400],
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMediaCard(BuildContext context, Map<String, dynamic> item) {
    return GestureDetector(
      onTap: () {
        // ContentSlider için basit bir MediaEntity dönüştürmesi yapıyoruz
        final media = MediaEntity(
          id: item['id'],
          title: item['title'],
          posterPath: item['image'],
          mediaType: item['mediaType'] ?? 'unknown',
          releaseDate: item['year']?.toString(),
          voteAverage: item['rating'],
          numberOfSeasons: item['seasons'],
          numberOfEpisodes: item['episodes'],
          // progress bilgisini additionalInfo içinde saklıyoruz
          additionalInfo: {'progress': item['progress']},
        );
        
        // Detay modalını gösteriyoruz
        showModalBottomSheet(
          context: context,
          backgroundColor: Colors.transparent,
          isScrollControlled: true,
          isDismissible: true,
          constraints: BoxConstraints(
            maxWidth: MediaQuery.of(context).size.width > 600 
                ? 600 
                : MediaQuery.of(context).size.width,
          ),
          builder: (context) => Center(
            child: SizedBox(
              height: MediaQuery.of(context).size.height * 0.8,
              child: MediaDetailModal(media: media),
            ),
          ),
        );
      },
      child: Container(
        margin: const EdgeInsets.only(right: 4),
        width: 100,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            // Poster - Küçültüldü
            ClipRRect(
              borderRadius: BorderRadius.circular(6),
              child: Stack(
                children: [
                  // Poster resmi
                  Image.network(
                    item['image'],
                    width: 100,
                    height: 120,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) {
                      return Container(
                        width: 100,
                        height: 120,
                        color: Colors.grey[800],
                        child: const Center(
                          child: Icon(
                            Icons.image_not_supported,
                            color: Colors.white54,
                            size: 20,
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
                    
                  // Bölüm/Sezon Bilgisi Etiketi
                  if (item['mediaType'] == 'tv' || item['mediaType'] == 'anime')
                    Positioned(
                      top: 5,
                      right: 5,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                        decoration: BoxDecoration(
                          color: Colors.black.withOpacity(0.7),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          '${item['seasons']} S',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 9,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),
            
            // Başlık ve Alt Bilgiler
            Padding(
              padding: const EdgeInsets.only(top: 4),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    item['title'],
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  if (item['year'] != null)
                    Text(
                      item['year'],
                      style: TextStyle(
                        fontSize: 9,
                        color: Colors.grey[400],
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                ],
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
