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
      duration: const Duration(milliseconds: 300),
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
    final hasProgress = _hasProgress;
    return MouseRegion(
      onEnter: (_) => _onHover(true),
      onExit: (_) => _onHover(false),
      child: AnimatedBuilder(
        animation: _animationController,
        builder: (context, child) => Transform.scale(
          scale: _scaleAnimation.value,
          child: GestureDetector(
            onTap: () => _showDetailModal(context),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              width: 160,
              height: 240,
              decoration: BoxDecoration(
                color: const Color(0xFF1e1e1e),
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(_isHovered ? 0.4 : 0.3),
                    blurRadius: _isHovered ? 28 : 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              transform: _isHovered
                  ? (Matrix4.identity()..translate(0.0, -4.0)..scale(1.03))
                  : Matrix4.identity(),
              clipBehavior: Clip.hardEdge,
              child: Stack(
                children: [
                  _buildPosterImage(),
                  _buildGradientOverlay(),
                  _buildTitleAndInfo(),
                  _buildRatingsAndProgress(hasProgress),
                  if (widget.media.additionalInfo?['watched'] == true)
                    _buildWatchedIndicator(),
                  _buildHoverIndicator(),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  bool get _hasProgress =>
      widget.media.additionalInfo?['progress'] != null &&
      widget.media.additionalInfo!['progress'] > 0 &&
      widget.media.additionalInfo!['progress'] < 100;

  void _onHover(bool isHovered) {
    setState(() => _isHovered = isHovered);
    isHovered ? _animationController.forward() : _animationController.reverse();
  }

  void _showDetailModal(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      isDismissible: true,
      useSafeArea: true,
      constraints: BoxConstraints(
        maxWidth: MediaQuery.of(context).size.width > 420
            ? 420
            : MediaQuery.of(context).size.width,
      ),
      builder: (context) => Center(
        child: SizedBox(
          height: MediaQuery.of(context).size.height * 0.8,
          child: MediaDetailModal(media: widget.media),
        ),
      ),
    );
  }

  Widget _buildPosterImage() {
    return Positioned.fill(
      child: widget.media.posterPath != null
          ? Hero(
              tag: 'media_image_${widget.media.id}',
              child: Image.network(
                'https://image.tmdb.org/t/p/w500${widget.media.posterPath}',
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => _buildPlaceholder(),
                loadingBuilder: (context, child, loadingProgress) {
                  if (loadingProgress == null) return child;
                  return _buildPlaceholder();
                },
              ),
            )
          : _buildPlaceholder(),
    );
  }

  Widget _buildPlaceholder() {
    return Container(
      color: const Color(0xFF232323),
      child: const Center(
        child: Icon(Icons.movie, color: Colors.white54, size: 40),
      ),
    );
  }

  Widget _buildGradientOverlay() {
    return Positioned(
      left: 0,
      right: 0,
      bottom: 0,
      child: Container(
        height: 100,
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.bottomCenter,
            end: Alignment.topCenter,
            colors: [
              Color.fromRGBO(0, 0, 0, 0.95),
              Color.fromRGBO(0, 0, 0, 0.7),
              Color.fromRGBO(0, 0, 0, 0.4),
              Colors.transparent,
            ],
            stops: [0.0, 0.3, 0.6, 1.0],
          ),
        ),
      ),
    );
  }

  Widget _buildTitleAndInfo() {
    return Positioned(
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
              fontWeight: FontWeight.bold,
              height: 1.2,
              fontSize: 16,
              letterSpacing: 0.4,
              shadows: [
                Shadow(
                  color: Colors.black54,
                  blurRadius: 3,
                  offset: Offset(0, 1),
                ),
              ],
            ),
          ),
          const SizedBox(height: 4),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              if (widget.media.releaseDate != null)
                Text(
                  widget.media.releaseDate!.substring(0, 4),
                  style: const TextStyle(
                    color: Colors.white70,
                    fontSize: 12,
                    shadows: [
                      Shadow(
                        color: Colors.black54,
                        blurRadius: 2,
                        offset: Offset(0, 1),
                      ),
                    ],
                  ),
                ),
              if (widget.media.numberOfSeasons != null)
                Row(
                  children: [
                    Icon(
                      Icons.video_library,
                      color: Colors.orange,
                      size: 13,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      '${widget.media.numberOfSeasons}',
                      style: const TextStyle(
                        color: Colors.white70,
                        fontSize: 12,
                        shadows: [
                          Shadow(
                            color: Colors.black87,
                            blurRadius: 3,
                            offset: Offset(0, 1),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildRatingsAndProgress(bool hasProgress) {
    return Positioned(
      top: 8,
      right: 8,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          if (widget.media.voteAverage != null)
            _buildRatingBadge(
              Colors.orange[800]!,
              Colors.white,
              Icons.star,
              widget.media.voteAverage!.toStringAsFixed(1),
            ),
          if (widget.media.userRating != null)
            _buildRatingBadge(
              Colors.red[700]!,
              Colors.white,
              Icons.favorite,
              '${widget.media.userRating}',
            ),
          if (hasProgress) _buildProgressIndicator(),
        ],
      ),
    );
  }

  Widget _buildRatingBadge(Color bgColor, Color textColor, IconData icon, String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Container(
        decoration: BoxDecoration(
          color: bgColor.withOpacity(0.85),
          borderRadius: BorderRadius.circular(6),
          boxShadow: [
            BoxShadow(
              color: bgColor.withOpacity(0.25),
              blurRadius: 6,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, color: textColor, size: 12),
            const SizedBox(width: 2),
            Text(
              text,
              style: TextStyle(
                color: textColor,
                fontWeight: FontWeight.bold,
                fontSize: 12,
                shadows: [
                  Shadow(
                    color: Colors.black.withOpacity(0.3),
                    blurRadius: 2,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProgressIndicator() {
    final progress = widget.media.additionalInfo!['progress'];
    return Container(
      width: 32,
      height: 32,
      decoration: BoxDecoration(
        color: Colors.black.withOpacity(0.7),
        shape: BoxShape.circle,
      ),
      child: Stack(
        children: [
          Center(
            child: SizedBox(
              width: 24,
              height: 24,
              child: CircularProgressIndicator(
                value: progress / 100,
                backgroundColor: Colors.white24,
                valueColor: AlwaysStoppedAnimation<Color>(Colors.orange),
                strokeWidth: 2.5,
              ),
            ),
          ),
          Center(
            child: Text(
              '${progress.round()}%',
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 10,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildWatchedIndicator() {
    return Positioned(
      bottom: 8,
      right: 8,
      child: Container(
        padding: const EdgeInsets.all(4),
        decoration: BoxDecoration(
          color: Colors.orange[800]!.withOpacity(0.8),
          shape: BoxShape.circle,
        ),
        child: const Icon(
          Icons.check,
          color: Colors.white,
          size: 12,
        ),
      ),
    );
  }

  Widget _buildHoverIndicator() {
    return Positioned(
      left: 0,
      right: 0,
      bottom: 0,
      height: 3,
      child: AnimatedBuilder(
        animation: _lineAnimation,
        builder: (context, _) {
          return _isHovered
              ? Container(
                  decoration: BoxDecoration(
                    boxShadow: [
                      BoxShadow(
                        color: Colors.orange.withOpacity(0.5),
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
                        color: Colors.orange,
                      ),
                    ),
                  ),
                )
              : const SizedBox();
        },
      ),
    );
  }
}