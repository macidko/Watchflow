import 'package:flutter/material.dart';
import 'package:watchflow/domain/entities/media_entity.dart';

class MediaCard extends StatelessWidget {
  final MediaEntity media;
  final VoidCallback onTap;

  const MediaCard({
    Key? key,
    required this.media,
    required this.onTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 160,
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.surface,
          borderRadius: BorderRadius.circular(10),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.2),
              spreadRadius: 1,
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        clipBehavior: Clip.hardEdge,
        child: Stack(
          children: [
            // Arkaplan Görüntüsü
            Positioned.fill(
              child: media.posterPath != null
                  ? Image.network(
                      'https://image.tmdb.org/t/p/w500${media.posterPath}',
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) {
                        return Container(
                          color: Colors.grey.shade800,
                          child: const Center(
                            child: Icon(Icons.image_not_supported, color: Colors.white70),
                          ),
                        );
                      },
                    )
                  : Container(
                      color: Colors.grey.shade800,
                      child: const Center(
                        child: Icon(Icons.image_not_supported, color: Colors.white70),
                      ),
                    ),
            ),
            
            // Gradient overlay
            Positioned.fill(
              child: DecoratedBox(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      Colors.transparent,
                      Colors.black.withOpacity(0.7),
                      Colors.black.withOpacity(0.9),
                    ],
                    stops: const [0.6, 0.85, 1.0],
                  ),
                ),
              ),
            ),
            
            // İçerik Bilgisi
            Positioned(
              bottom: 10,
              left: 10,
              right: 10,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    media.title ?? 'İsimsiz',
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        media.releaseDate?.substring(0, 4) ?? '',
                        style: TextStyle(
                          color: Colors.white.withOpacity(0.7),
                          fontSize: 12,
                        ),
                      ),
                      if (media.mediaType == 'tv' || media.mediaType == 'anime')
                        Row(
                          children: [
                            Icon(
                              Icons.video_library,
                              color: Theme.of(context).colorScheme.primary,
                              size: 14,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              '${media.numberOfSeasons ?? 0}',
                              style: TextStyle(
                                color: Colors.white.withOpacity(0.9),
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
            
            // Rating Badge
            if (media.voteAverage != null)
              Positioned(
                top: 8,
                right: 8,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: Colors.black54,
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Row(
                    children: [
                      const Icon(
                        Icons.star,
                        color: Colors.amber,
                        size: 14,
                      ),
                      const SizedBox(width: 2),
                      Text(
                        media.voteAverage!.toStringAsFixed(1),
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            
            // Hızlı İşlem Butonu
            Positioned(
              bottom: 50,
              right: 8,
              child: GestureDetector(
                onTap: () {
                  // Hızlı işlem (durumu değiştir, vb.)
                },
                child: Container(
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    color: Colors.black54,
                    borderRadius: BorderRadius.circular(15),
                  ),
                  child: Icon(
                    Icons.library_add,
                    color: Theme.of(context).colorScheme.primary,
                    size: 16,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
