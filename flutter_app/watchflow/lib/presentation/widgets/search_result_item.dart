import 'package:flutter/material.dart';
import 'package:watchflow/presentation/theme/app_colors.dart';
import 'package:watchflow/domain/entities/media_entity.dart';

class SearchResultItem extends StatelessWidget {
  final MediaEntity media;
  final VoidCallback onTap;

  const SearchResultItem({
    super.key,
    required this.media,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        hoverColor: AppColors.secondaryBg,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          child: Row(
            children: [
              // Poster görseli
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: media.posterPath != null && media.posterPath!.isNotEmpty
                    ? Image.network(
                        media.posterPath!,
                        width: 60,
                        height: 90,
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) => Container(
                          width: 60,
                          height: 90,
                          color: AppColors.border,
                          child: const Icon(Icons.broken_image, size: 32, color: AppColors.secondaryText),
                        ),
                      )
                    : Container(
                        width: 60,
                        height: 90,
                        color: AppColors.border,
                        child: const Icon(Icons.broken_image, size: 32, color: AppColors.secondaryText),
                      ),
              ),
              const SizedBox(width: 16),
              // Başlık ve Alt Bilgi
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      media.title,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: AppColors.primaryText,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Text(
                          _getMediaTypeText(media.mediaType),
                          style: const TextStyle(
                            fontSize: 13,
                            color: AppColors.secondaryText,
                          ),
                        ),
                        if (media.releaseDate != null &&
                            media.releaseDate!.isNotEmpty)
                          Text(
                            ' • ${media.releaseDate!.split('-').first}',
                            style: const TextStyle(
                              fontSize: 13,
                              color: AppColors.secondaryText,
                            ),
                          ),
                      ],
                    ),
                  ],
                ),
              ),
              // Sağdaki ikon (isteğe bağlı, şimdilik boş)
              const Icon(Icons.chevron_right, color: AppColors.secondaryText),
            ],
          ),
        ),
      ),
    );
  }

  String _getMediaTypeText(String? mediaType) {
    switch (mediaType) {
      case 'movie':
        return 'Film';
      case 'tv':
        return 'Dizi';
      case 'anime':
        return 'Anime';
      default:
        return 'Medya';
    }
  }

  IconData _getIconForMediaType(String? mediaType) {
    switch (mediaType) {
      case 'movie':
        return Icons.movie_creation_outlined;
      case 'tv':
        return Icons.tv_outlined;
      case 'anime':
        return Icons.animation_outlined;
      default:
        return Icons.article_outlined;
    }
  }
}
