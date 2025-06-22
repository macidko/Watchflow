import 'package:flutter/material.dart';
import 'package:watchflow/domain/entities/media_entity.dart';
import 'package:watchflow/presentation/widgets/media_detail_modal.dart';

class SearchResultItem extends StatelessWidget {
  final MediaEntity media;
  final VoidCallback onTap;

  const SearchResultItem({
    Key? key,
    required this.media,
    required this.onTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () {
        // Detay modalını açma işlevi
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
        padding: const EdgeInsets.symmetric(vertical: 8.0, horizontal: 4.0),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Poster
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: SizedBox(
                width: 80,
                height: 120,
                child: media.posterPath != null
                    ? Image.network(
                        'https://image.tmdb.org/t/p/w200${media.posterPath}',
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) {
                          return Container(
                            color: Colors.grey[800],
                            child: const Center(
                              child: Icon(
                                Icons.image_not_supported,
                                color: Colors.white54,
                              ),
                            ),
                          );
                        },
                      )
                    : Container(
                        color: Colors.grey[800],
                        child: const Center(
                          child: Icon(
                            Icons.image_not_supported,
                            color: Colors.white54,
                          ),
                        ),
                      ),
              ),
            ),
            
            const SizedBox(width: 12),
            
            // İçerik bilgileri
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Başlık
                  Text(
                    media.title,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  
                  const SizedBox(height: 4),
                  
                  // Tür ve yıl
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: _getMediaTypeColor(media.mediaType),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          _getMediaTypeText(media.mediaType),
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 12,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      if (media.releaseDate != null && media.releaseDate!.isNotEmpty)
                        Text(
                          media.releaseDate!.split('-')[0], // Sadece yıl
                          style: TextStyle(
                            color: Colors.grey[400],
                            fontSize: 12,
                          ),
                        ),
                    ],
                  ),
                  
                  const SizedBox(height: 8),
                  
                  // Açıklama
                  if (media.overview != null && media.overview!.isNotEmpty)
                    Text(
                      media.overview!,
                      style: TextStyle(
                        color: Colors.grey[300],
                        fontSize: 12,
                      ),
                      maxLines: 3,
                      overflow: TextOverflow.ellipsis,
                    ),
                    
                  const SizedBox(height: 4),
                  
                  // Puan
                  if (media.voteAverage != null)
                    Row(
                      children: [
                        Icon(
                          Icons.star,
                          color: Colors.amber,
                          size: 16,
                        ),
                        const SizedBox(width: 4),
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
                ],
              ),
            ),
            
            // Sağ taraf - Ekle butonu
            IconButton(
              icon: const Icon(
                Icons.add_circle_outline,
                color: Colors.white,
              ),
              onPressed: () {
                // TODO: İzleme listesine ekle
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('${media.title} izleme listesine eklendi'),
                    backgroundColor: Colors.green,
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
  
  Color _getMediaTypeColor(String? mediaType) {
    switch (mediaType) {
      case 'movie':
        return Colors.blue[700]!;
      case 'tv':
        return Colors.purple[700]!;
      case 'anime':
        return Colors.orange[700]!;
      default:
        return Colors.grey[700]!;
    }
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
        return 'Bilinmiyor';
    }
  }
}
