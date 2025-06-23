import 'package:flutter/material.dart';
import 'package:watchflow/domain/entities/media_entity.dart';
import 'package:watchflow/presentation/widgets/media_detail_modal.dart';

class MediaCard extends StatefulWidget {
  final MediaEntity media;
  final VoidCallback onTap;

  const MediaCard({
    Key? key,
    required this.media,
    required this.onTap,
  }) : super(key: key);

  @override
  State<MediaCard> createState() => _MediaCardState();
}

class _MediaCardState extends State<MediaCard> with SingleTickerProviderStateMixin {
  bool _isHovered = false;
  late AnimationController _animationController;
  late Animation<double> _scaleAnimation;
  late Animation<double> _lineAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 350),
      vsync: this,
    );
    
    _scaleAnimation = Tween<double>(begin: 1.0, end: 1.03).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeOutCubic),
    );
    
    _lineAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _animationController, 
        curve: const Interval(0.2, 1.0, curve: Curves.easeOutCubic),
      ),
    );
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final bool hasProgress = widget.media.additionalInfo?['progress'] != null &&
                             widget.media.additionalInfo!['progress'] > 0 &&
                             widget.media.additionalInfo!['progress'] < 100;
    
    return MouseRegion(
      onEnter: (_) {
        setState(() {
          _isHovered = true;
        });
        _animationController.forward();
      },
      onExit: (_) {
        setState(() {
          _isHovered = false;
        });
        _animationController.reverse();
      },
      child: AnimatedBuilder(
        animation: _animationController,
        builder: (context, child) {
          return Transform.scale(
            scale: _scaleAnimation.value,
            child: GestureDetector(
              onTap: () {
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
                      child: MediaDetailModal(media: widget.media),
                    ),
                  ),
                );
              },
              child: Container(
                width: 160,
                height: 240,
                decoration: BoxDecoration(
                  color: const Color(0xFF121212),
                  borderRadius: BorderRadius.circular(8),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.3),
                      spreadRadius: 0,
                      blurRadius: _isHovered ? 10 : 5,
                      offset: const Offset(0, 3),
                    ),
                  ],
                ),
                clipBehavior: Clip.hardEdge,
                child: Stack(
                  children: [
                    // Poster Resmi
                    Positioned.fill(
                      child: widget.media.posterPath != null
                        ? Hero(
                            tag: 'media_image_${widget.media.id}',
                            child: Image.network(
                              'https://image.tmdb.org/t/p/w500${widget.media.posterPath}',
                              fit: BoxFit.cover,
                              errorBuilder: (context, error, stackTrace) {
                                return Container(
                                  color: const Color(0xFF1E1E1E),
                                  child: const Center(
                                    child: Icon(Icons.movie, color: Color(0xFF8A8A8A), size: 40),
                                  ),
                                );
                              },
                            ),
                          )
                        : Container(
                            color: const Color(0xFF1E1E1E),
                            child: const Center(
                              child: Icon(Icons.movie, color: Color(0xFF8A8A8A), size: 40),
                            ),
                          ),
                    ),
                    
                    // Alt Gradient (Başlık için)
                    Positioned(
                      left: 0,
                      right: 0,
                      bottom: 0,
                      child: Container(
                        height: 80,
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.bottomCenter,
                            end: Alignment.topCenter,
                            colors: [
                              Colors.black.withOpacity(0.9),
                              Colors.black.withOpacity(0.7),
                              Colors.black.withOpacity(0.0),
                            ],
                            stops: const [0.0, 0.5, 1.0],
                          ),
                        ),
                      ),
                    ),
                    
                    // Başlık ve Alt Bilgiler
                    Positioned(
                      left: 10,
                      right: 10,
                      bottom: 10,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            widget.media.title,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              height: 1.2,
                            ),
                          ),
                          const SizedBox(height: 4),
                          
                          // Yıl ve Sezon/Bölüm Bilgisi
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              // Yıl
                              if (widget.media.releaseDate != null)
                                Text(
                                  widget.media.releaseDate!.substring(0, 4),
                                  style: const TextStyle(
                                    color: Color(0xCCFFFFFF),
                                    fontSize: 12,
                                  ),
                                ),
                              
                              // Sezon/Bölüm Bilgisi
                              if (widget.media.numberOfSeasons != null)
                                Row(
                                  children: [
                                    const Icon(
                                      Icons.video_library,
                                      color: Colors.white70,
                                      size: 12,
                                    ),
                                    const SizedBox(width: 4),
                                    Text(
                                      '${widget.media.numberOfSeasons}',
                                      style: const TextStyle(
                                        color: Colors.white70,
                                        fontSize: 12,
                                      ),
                                    ),
                                  ],
                                ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    
                    // Puanlar ve Progress - Sağ Üstte
                    Positioned(
                      top: 8,
                      right: 8,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          // TMDB Puanı
                          if (widget.media.voteAverage != null)
                            Container(
                              margin: const EdgeInsets.only(bottom: 4),
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: const Color(0xFFFFD700),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const Icon(
                                    Icons.star,
                                    color: Colors.black,
                                    size: 12,
                                  ),
                                  const SizedBox(width: 2),
                                  Text(
                                    widget.media.voteAverage!.toStringAsFixed(1),
                                    style: const TextStyle(
                                      color: Colors.black,
                                      fontSize: 12,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          
                          // Kullanıcı Puanı (Varsa)
                          if (widget.media.userRating != null)
                            Container(
                              margin: const EdgeInsets.only(bottom: 4),
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: const Color(0xFFFF4500),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const Icon(
                                    Icons.favorite,
                                    color: Colors.white,
                                    size: 12,
                                  ),
                                  const SizedBox(width: 2),
                                  Text(
                                    '${widget.media.userRating}',
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 12,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            
                          // Progress Göstergesi (Yuvarlak)
                          if (hasProgress)
                            Container(
                              width: 32,
                              height: 32,
                              decoration: BoxDecoration(
                                color: Colors.black.withOpacity(0.6),
                                shape: BoxShape.circle,
                              ),
                              child: Stack(
                                children: [
                                  // Progress background
                                  Center(
                                    child: SizedBox(
                                      width: 24,
                                      height: 24,
                                      child: CircularProgressIndicator(
                                        value: widget.media.additionalInfo!['progress'] / 100,
                                        backgroundColor: Colors.grey.withOpacity(0.3),
                                        valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFFFF4500)),
                                        strokeWidth: 2.5,
                                      ),
                                    ),
                                  ),
                                  // Progress text
                                  Center(
                                    child: Text(
                                      '${widget.media.additionalInfo!['progress'].round()}%',
                                      style: const TextStyle(
                                        color: Colors.white,
                                        fontSize: 9,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                        ],
                      ),
                    ),
                    
                    // İzlenme Durumu - Sağ Altta
                    if (widget.media.additionalInfo?['watched'] == true)
                      Positioned(
                        bottom: 8,
                        right: 8,
                        child: Container(
                          padding: const EdgeInsets.all(4),
                          decoration: BoxDecoration(
                            color: Colors.green.withOpacity(0.8),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.check,
                            color: Colors.white,
                            size: 12,
                          ),
                        ),
                      ),
                      
                    // Hover durumunda alt çizgi (turuncu) - Animasyonlu
                    Positioned(
                      left: 0,
                      right: 0,
                      bottom: 3,
                      height: 3,
                      child: AnimatedBuilder(
                        animation: _lineAnimation,
                        builder: (context, child) {
                          return _isHovered 
                            ? Container(
                                decoration: BoxDecoration(
                                  boxShadow: [
                                    BoxShadow(
                                      color: const Color(0xFFFF4500).withOpacity(0.5),
                                      blurRadius: 4,
                                      spreadRadius: 0,
                                    ),
                                  ],
                                ),
                                child: ClipRect(
                                  child: Align(
                                    alignment: Alignment.centerLeft,
                                    widthFactor: _lineAnimation.value,
                                    child: Container(
                                      color: const Color(0xFFFF4500),
                                    ),
                                  ),
                                ),
                              )
                            : const SizedBox();
                        },
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
