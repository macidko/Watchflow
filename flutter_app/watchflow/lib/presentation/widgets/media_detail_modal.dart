import 'package:flutter/material.dart';
import 'package:watchflow/domain/entities/media_entity.dart';

class MediaDetailModal extends StatelessWidget {
  final MediaEntity media;
  
  const MediaDetailModal({
    Key? key, 
    required this.media,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Color(0xFF212121),
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          // Başlık ve Kapatma Butonu
          _buildHeader(context),
          
          // İçerik Bölümü
          Flexible(
            child: SingleChildScrollView(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Kullanıcı Puanı
                    _buildRating(),
                    
                    const SizedBox(height: 16),
                    
                    // İzleme Durumu
                    _buildWatchProgress(),
                    
                    const SizedBox(height: 16),
                    
                    // Medya türüne göre farklı içerikler gösterelim
                    if (media.mediaType == 'tv' || media.mediaType == 'anime') ...[
                      // Sezon Bilgisi
                      _buildSeasonHeader(),
                    
                      const SizedBox(height: 8),
                    
                      // Bölüm Butonları
                      _buildEpisodeButtons(),
                    
                      const SizedBox(height: 24),
                    
                      const Divider(color: Colors.grey, height: 1),
                      const SizedBox(height: 16),
                      
                      // İlişkili İçerikler
                      _buildRelatedContent(),
                    ] else ...[
                      // Film için ekstra bilgiler
                      _buildMovieInfo(),
                    ],
                    
                    const SizedBox(height: 16),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildHeader(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Text(
              media.title,
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
              overflow: TextOverflow.ellipsis,
            ),
          ),
          IconButton(
            icon: const Icon(Icons.close, color: Colors.white),
            onPressed: () => Navigator.of(context).pop(),
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(),
          ),
        ],
      ),
    );
  }
  
  Widget _buildRating() {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Senin Puanın:',
            style: TextStyle(
              color: Colors.white,
              fontSize: 16,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 8),
          Row(
            children: List.generate(5, (index) {
              final rating = media.userRating ?? 0;
              final starFilled = index < (rating / 2).ceil();
              return Icon(
                starFilled ? Icons.star : Icons.star_border,
                color: starFilled ? Colors.amber : Colors.white54,
                size: 30,
              );
            }),
          ),
        ],
      ),
    );
  }
  
  Widget _buildWatchProgress() {
    // Örnek değerler, gerçek uygulamada bu veriler API'den gelmeli
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        LinearProgressIndicator(
          value: 1.0, // Örnek: %100 tamamlandı
          backgroundColor: Colors.grey.shade800,
          valueColor: AlwaysStoppedAnimation<Color>(Colors.orange.shade700),
          minHeight: 10,
          borderRadius: BorderRadius.circular(5),
        ),
        const SizedBox(height: 8),
        const Text(
          '100% tamamlandı (12/12 bölüm)', 
          style: TextStyle(color: Colors.white, fontSize: 14),
        ),
      ],
    );
  }
  
  Widget _buildSeasonHeader() {
    // İkinci görsele uygun olarak sadece "Sezon 1" ve sağda "12/12" gösterimi
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        const Text(
          'Sezon 1',
          style: TextStyle(
            color: Colors.white,
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: Colors.orange.shade700,
            borderRadius: BorderRadius.circular(16),
          ),
          child: const Text(
            '12/12',
            style: TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
      ],
    );
  }
  
  Widget _buildEpisodeButtons() {
    // İkinci görsele uygun olarak 12 bölümlü bir sezon için butonlar
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 5,
        childAspectRatio: 1.5,
        crossAxisSpacing: 8,
        mainAxisSpacing: 8,
      ),
      itemCount: 12,
      itemBuilder: (context, index) {
        return EpisodeButton(
          episodeNumber: index + 1,
          isWatched: true, // Tüm bölümler izlendi
          onPressed: () {
            // Bölüm izleme durumunu değiştirme işlevi
          },
        );
      },
    );
  }
  
  Widget _buildRelatedContent() {
    // İkinci görsele uygun olarak ilişkili içerikler
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'İlişkili Animeler',
          style: TextStyle(
            color: Colors.orange,
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 16),
        
        // Devam Serisi
        Row(
          children: [
            Container(
              width: 4,
              height: 16,
              color: Colors.orange,
            ),
            const SizedBox(width: 8),
            const Text(
              'Devam Serisi',
              style: TextStyle(
                color: Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        _buildRelatedMediaItem(
          'Bungo Stray Dogs 2', 
          '2016', 
          'TV', 
          '12 Bölüm',
        ),
        const SizedBox(height: 16),
        
        // Diğer
        Row(
          children: [
            Container(
              width: 4,
              height: 16,
              color: Colors.orange,
            ),
            const SizedBox(width: 8),
            const Text(
              'Diğer',
              style: TextStyle(
                color: Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        _buildRelatedMediaItem(
          'Bungo Stray Dogs: DEAD APPLE', 
          '2018', 
          'Film', 
          '1 Bölüm',
        ),
      ],
    );
  }
  
  Widget _buildMovieInfo() {
    // Birinci görsele uygun olarak film detayları
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Film Detayları',
          style: TextStyle(
            color: Colors.white,
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 8),
        
        // Film bilgileri
        _buildInfoRow('Süre', '118 dakika'),
        _buildInfoRow('Yönetmen', 'Örnek Yönetmen'),
        _buildInfoRow('Yapım Yılı', 'Bilinmiyor'),
        
        const SizedBox(height: 16),
        
        const Text(
          'Benzer Filmler',
          style: TextStyle(
            color: Colors.orange,
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 8),
        
        _buildRelatedMediaItem(
          'Örnek Film 1',
          '2022',
          'Film',
          '124 dakika',
        ),
        _buildRelatedMediaItem(
          'Örnek Film 2',
          '2021',
          'Film',
          '105 dakika',
        ),
      ],
    );
  }
  
  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 100,
            child: Text(
              label,
              style: TextStyle(
                color: Colors.grey.shade400,
                fontSize: 14,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 14,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildRelatedMediaItem(String title, String year, String type, String episodes) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: const Color(0xFF2A2A2A),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        children: [
          // Medya Posteri
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: Container(
              width: 50,
              height: 50,
              color: Colors.grey.shade800,
              child: const Center(
                child: Icon(Icons.image, color: Colors.white24),
              ),
            ),
          ),
          const SizedBox(width: 12),
          
          // Medya Bilgileri
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  '$year   $type   $episodes',
                  style: TextStyle(
                    color: Colors.grey.shade400,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
          
          // Ekle/İzle Butonu
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: Colors.orange.shade700,
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.playlist_add,
              color: Colors.white,
              size: 20,
            ),
          ),
        ],
      ),
    );
  }
}

class EpisodeButton extends StatelessWidget {
  final int episodeNumber;
  final bool isWatched;
  final VoidCallback onPressed;
  
  const EpisodeButton({
    Key? key,
    required this.episodeNumber,
    required this.isWatched,
    required this.onPressed,
  }) : super(key: key);
  
  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: onPressed,
      style: ElevatedButton.styleFrom(
        backgroundColor: isWatched ? Colors.orange.shade700 : Colors.grey.shade800,
        foregroundColor: Colors.white,
        padding: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
      ),
      child: Text(
        episodeNumber.toString(),
        style: const TextStyle(
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }
} 