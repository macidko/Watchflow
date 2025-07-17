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
    return Container(
      margin: const EdgeInsets.only(bottom: 28),
      decoration: BoxDecoration(
        color: const Color(0xFF1e1e1e), // secondary-bg
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.25),
            blurRadius: 14,
            offset: const Offset(0, 6),
          ),
        ],
        border: Border.all(color: const Color(0xFF2a2a2a), width: 1.2), // border-color
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Başlık ve "Tümünü Gör" butonu
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      width: 4,
                      height: 22,
                      decoration: BoxDecoration(
                        color: const Color(0xFFFF4500), // accent-color
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Text(
                      widget.title,
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFFFF4500), // accent-color
                        letterSpacing: 0.7,
                        shadows: [
                          Shadow(
                            color: Colors.black26,
                            blurRadius: 4,
                            offset: Offset(0, 2),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                if (widget.items.isNotEmpty)
                  TextButton.icon(
                    onPressed: () => _showAllItemsModal(context),
                    style: ButtonStyle(
                      foregroundColor: MaterialStateProperty.all(const Color(0xFFFF4500)), // accent-color
                      textStyle: MaterialStateProperty.all(const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                      )),
                      padding: MaterialStateProperty.all(const EdgeInsets.symmetric(horizontal: 12, vertical: 8)),
                      shape: MaterialStateProperty.all(RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      )),
                      overlayColor: MaterialStateProperty.resolveWith<Color?>((states) {
                        if (states.contains(MaterialState.hovered) || states.contains(MaterialState.pressed)) {
                          return const Color(0xFFFF6A33).withOpacity(0.13); // hover-color
                        }
                        return null;
                      }),
                    ),
                    icon: const Icon(Icons.grid_view_rounded, size: 18),
                    label: const Text('Tümünü Gör'),
                  ),
              ],
            ),
            const SizedBox(height: 12),
            // İçerik slider'ı - Yüksekliği kart boyutuna göre ayarlandı
            SizedBox(
              height: 260,
              child: widget.items.isEmpty
                  ? _buildEmptyState()
                  : Stack(
                      alignment: Alignment.center,
                      children: [
                        ListView.separated(
                          controller: _scrollController,
                          scrollDirection: Axis.horizontal,
                          itemCount: widget.items.length,
                          padding: const EdgeInsets.only(bottom: 15),
                          separatorBuilder: (context, index) => const SizedBox(width: 18),
                          itemBuilder: (context, index) {
                            final item = widget.items[index];
                            return MouseRegion(
                              cursor: SystemMouseCursors.click,
                              child: AnimatedContainer(
                                duration: const Duration(milliseconds: 200),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF232323),
                                  borderRadius: BorderRadius.circular(16),
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.black.withOpacity(0.15),
                                      blurRadius: 6,
                                      offset: const Offset(0, 2),
                                    ),
                                  ],
                                ),
                                child: MediaCard(
                                  media: _convertToMediaEntity(item),
                                  onTap: () {},
                                ),
                              ),
                            );
                          },
                        ),
                        // Sol kaydırma butonu
                        if (_showLeftButton)
                          Positioned(
                            left: 0,
                            child: _buildScrollButton(Icons.arrow_back_ios_rounded, _scrollLeft, isLeft: true),
                          ),
                        // Sağ kaydırma butonu
                        if (_showRightButton)
                          Positioned(
                            right: 0,
                            child: _buildScrollButton(Icons.arrow_forward_ios_rounded, _scrollRight, isLeft: false),
                          ),
                      ],
                    ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildScrollButton(IconData icon, VoidCallback onPressed, {bool isLeft = false}) {
    return MouseRegion(
      cursor: SystemMouseCursors.click,
      child: GestureDetector(
        onTap: onPressed,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 150),
          width: 36,
          height: 36,
          decoration: BoxDecoration(
            color: Colors.black.withOpacity(0.7),
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: Colors.orange.withOpacity(0.4),
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Center(
            child: Icon(
              icon,
              color: Colors.white,
              size: 18,
            ),
          ),
        ),
      ),
    );
  }

  void _showAllItemsModal(BuildContext context) {
    showDialog(
      context: context,
      barrierColor: Colors.black.withOpacity(0.65),
      builder: (context) => Dialog(
        backgroundColor: Colors.transparent,
        insetPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 32),
        child: Container(
          constraints: BoxConstraints(
            maxWidth: MediaQuery.of(context).size.width > 900
                ? 900
                : MediaQuery.of(context).size.width * 0.98,
            maxHeight: MediaQuery.of(context).size.height * 0.88,
          ),
          decoration: BoxDecoration(
            color: const Color(0xFF23232A),
            borderRadius: BorderRadius.circular(22),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.32),
                blurRadius: 24,
                offset: const Offset(0, 10),
              ),
              BoxShadow(
                color: Colors.orange.withOpacity(0.08),
                blurRadius: 12,
                offset: const Offset(0, 2),
              ),
            ],
            border: Border.all(
              color: Colors.orange.withOpacity(0.13),
              width: 1.3,
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Modal başlık
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      widget.title,
                      style: TextStyle(
                        fontSize: 21,
                        fontWeight: FontWeight.w700,
                        color: Colors.orange[800],
                        letterSpacing: 0.7,
                        shadows: [
                          Shadow(
                            color: Colors.black.withOpacity(0.18),
                            blurRadius: 4,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close, color: Colors.white, size: 26),
                      splashRadius: 22,
                      onPressed: () => Navigator.of(context).pop(),
                    ),
                  ],
                ),
              ),
              const Divider(color: Color(0xFF3A3A3A), height: 1, thickness: 1),
              // İçerik grid'i
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.all(18),
                  child: GridView.builder(
                    gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
                      maxCrossAxisExtent: 200,
                      childAspectRatio: 0.67,
                      crossAxisSpacing: 22,
                      mainAxisSpacing: 22,
                    ),
                    itemCount: widget.items.length,
                    itemBuilder: (context, index) {
                      final item = widget.items[index];
                      return MouseRegion(
                        cursor: SystemMouseCursors.click,
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          decoration: BoxDecoration(
                            color: const Color(0xFF23232A),
                            borderRadius: BorderRadius.circular(18),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.13),
                                blurRadius: 8,
                                offset: const Offset(0, 2),
                              ),
                            ],
                          ),
                          child: MediaCard(
                            media: _convertToMediaEntity(item),
                            onTap: () {},
                          ),
                        ),
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
    // Ortak alanlar ve fallback'ler
    String? posterPath = item['poster_path'] ?? item['cover_image'] ?? item['image'];
    String? backdropPath = item['backdrop_path'] ?? item['banner_image'];
    String? title = item['title'] ?? item['name'] ?? item['romaji'] ?? item['native'] ?? '';
    String? originalTitle = item['original_title'] ?? item['original_name'] ?? item['romaji'] ?? item['native'];
    String? overview = item['overview'] ?? item['description'];
    String? mediaType = item['media_type'] ?? item['mediaType'] ?? 'unknown';
    String? releaseDate = item['release_date'] ?? item['first_air_date'] ?? item['start_date'];
    double? voteAverage = (item['vote_average'] ?? item['average_score'])?.toDouble();
    int? voteCount = item['vote_count'] ?? item['popularity'];
    int? numberOfSeasons = item['number_of_seasons'] ?? item['seasons'];
    int? numberOfEpisodes = item['number_of_episodes'] ?? item['episodes'];
    String? status = item['status'];

    return MediaEntity(
      id: item['id'],
      title: title ?? '',
      originalTitle: originalTitle,
      overview: overview,
      posterPath: posterPath,
      backdropPath: backdropPath,
      mediaType: mediaType,
      releaseDate: releaseDate,
      voteAverage: voteAverage,
      voteCount: voteCount,
      numberOfSeasons: numberOfSeasons,
      numberOfEpisodes: numberOfEpisodes,
      status: status,
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
