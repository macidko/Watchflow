import 'package:flutter/material.dart';
import 'package:watchflow/domain/entities/media_entity.dart';
import 'package:watchflow/config/theme.dart';

class DetailScreen extends StatelessWidget {
  final MediaEntity? media;
  
  const DetailScreen({Key? key, this.media}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    if (media == null) {
      return const Scaffold(
        body: Center(
          child: Text('Medya bulunamadı'),
        ),
      );
    }
    
    return Scaffold(
      appBar: AppBar(
        title: Text(media!.title),
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Posterler ve başlık
            AspectRatio(
              aspectRatio: 16 / 9,
              child: media!.backdropPath != null
                ? Image.network(
                    media!.backdropPath!,
                    fit: BoxFit.cover,
                  )
                : Container(
                    color: Colors.grey,
                    child: const Center(
                      child: Text('Görsel yok'),
                    ),
                  ),
            ),
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    media!.title,
                    style: Theme.of(context).textTheme.headlineMedium,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    media!.overview ?? 'Açıklama bulunmuyor',
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
