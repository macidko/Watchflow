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
        color: Color(0xFF212121), // Koyu tema arka plan rengi
        borderRadius: BorderRadius.vertical(top: Radius.circular(12)),
        boxShadow: [
          BoxShadow(
            color: Color(0x70000000),
            blurRadius: 10,
            spreadRadius: 0,
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          // Başlık ve Kapatma Butonu
          _buildHeader(context),
          
          // İçerik Bölümü
          Expanded(
            child: SingleChildScrollView(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Başlık ve Türü
                    _buildTitleSection(),
                    
                    const SizedBox(height: 16),
                    
                    // Poster ve Özet
                    _buildPosterAndOverview(),
                    
                    const SizedBox(height: 20),
                    
                    // Kullanıcı Puanı
                    _buildRatingSection(),
                    
                    const SizedBox(height: 16),
                    
                    // İzleme Durumu
                    _buildWatchStatus(),
                    
                    const SizedBox(height: 20),
                    
                    // Medya türüne göre farklı içerikler gösterelim
                    if (media.mediaType == 'tv' || media.mediaType == 'anime') ...[
                      // Bölümler Başlığı
                      _buildSectionHeader('Bölümler'),
                      
                      const SizedBox(height: 10),
                      
                      // Sezon Listesi
                      _buildSeasonSelection(),
                    
                      const SizedBox(height: 10),
                    
                      // Bölüm Butonları (Electron'daki gibi ızgara şeklinde)
                      _buildEpisodeGrid(),
                    
                      const SizedBox(height: 24),
                      
                      // İlişkili İçerikler
                      _buildSectionHeader('İlişkili İçerikler'),
                      
                      const SizedBox(height: 10),
                      
                      // İlişkili içerik listeleme
                      _buildRelatedContentList(),
                      
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
      decoration: const BoxDecoration(
        color: Color(0xFF1A1A1A), // Header daha koyu
        borderRadius: BorderRadius.vertical(top: Radius.circular(12)),
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
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              color: Colors.black26,
              borderRadius: BorderRadius.circular(16),
            ),
            child: IconButton(
              icon: const Icon(Icons.close, color: Colors.white70, size: 18),
              padding: EdgeInsets.zero,
              onPressed: () => Navigator.of(context).pop(),
            ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildTitleSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Orijinal başlık (varsa)
        if (media.originalTitle != null && media.originalTitle != media.title)
          Padding(
            padding: const EdgeInsets.only(bottom: 4),
            child: Text(
              media.originalTitle!,
              style: const TextStyle(
                color: Colors.white70,
                fontSize: 14,
                fontStyle: FontStyle.italic,
              ),
            ),
          ),
          
        // Tür, yıl ve durum bilgileri
        Wrap(
          spacing: 8,
          children: [
            _buildInfoChip(_getTypeText(media.mediaType), _getTypeColor(media.mediaType)),
            if (media.releaseDate != null)
              _buildInfoChip(media.releaseDate!.substring(0, 4), Colors.grey.shade800),
            if (media.status != null)
              _buildInfoChip(media.status!, Colors.grey.shade800),
            if (media.voteAverage != null)
              _buildInfoChip('${media.voteAverage!.toStringAsFixed(1)} ★', const Color(0xFF9C5400)),
          ],
        ),
      ],
    );
  }
  
  Widget _buildInfoChip(String label, Color color) {
    return Container(
      margin: const EdgeInsets.only(bottom: 4),
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(
        label,
        style: const TextStyle(
          color: Colors.white,
          fontSize: 12,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }
  
  Widget _buildPosterAndOverview() {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Poster
        ClipRRect(
          borderRadius: BorderRadius.circular(8),
          child: SizedBox(
            width: 120,
            height: 180,
            child: media.posterPath != null
                ? Image.network(
                    'https://image.tmdb.org/t/p/w500${media.posterPath}',
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) => Container(
                      color: Colors.grey.shade800,
                      child: const Center(child: Icon(Icons.broken_image, color: Colors.white30)),
                    ),
                  )
                : Container(
                    color: Colors.grey.shade800,
                    child: const Center(child: Icon(Icons.image_not_supported, color: Colors.white30)),
                  ),
          ),
        ),
        
        const SizedBox(width: 16),
        
        // Özet
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Özet',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                media.overview ?? 'Bu içerik için özet bilgisi bulunmuyor.',
                style: const TextStyle(
                  color: Colors.white70,
                  fontSize: 14,
                  height: 1.4,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
  
  Widget _buildRatingSection() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.black26,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.grey.shade800, width: 1),
      ),
      child: Row(
        children: [
          const Text(
            'Puanınız:',
            style: TextStyle(
              color: Colors.white,
              fontSize: 16,
              fontWeight: FontWeight.w500,
            ),
          ),
          const Spacer(),
          Row(
            children: List.generate(5, (index) {
              final rating = media.userRating ?? 0;
              final isActive = index < (rating / 2).ceil();
              return Icon(
                isActive ? Icons.star : Icons.star_border,
                color: isActive ? const Color(0xFFFF4500) : Colors.white38,
                size: 24,
              );
            }),
          ),
        ],
      ),
    );
  }
  
  Widget _buildWatchStatus() {
    // Electron'daki gibi izleme durumu
    final progress = (media.additionalInfo?['progress'] as num?) ?? 0;
    final inWatchlist = (media.additionalInfo?['inWatchlist'] as bool?) ?? false;
    
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.black26,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.grey.shade800, width: 1),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // İlerleme çubuğu
          Container(
            height: 8,
            width: double.infinity,
            decoration: BoxDecoration(
              color: Colors.black45,
              borderRadius: BorderRadius.circular(4),
            ),
            child: FractionallySizedBox(
              widthFactor: progress / 100,
              alignment: Alignment.centerLeft,
              child: Container(
                decoration: BoxDecoration(
                  color: const Color(0xFFFF4500),
                  borderRadius: BorderRadius.circular(4),
                ),
              ),
            ),
          ),
          
          const SizedBox(height: 12),
          
          // Durum Butonları
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              _buildStatusButton('İzledim', Icons.check_circle_outline, isActive: progress == 100),
              _buildStatusButton('İzliyorum', Icons.play_circle_outline, isActive: progress > 0 && progress < 100),
              _buildStatusButton('İzleyeceğim', Icons.bookmark_border, isActive: inWatchlist && progress == 0),
            ],
          ),
        ],
      ),
    );
  }
  
  Widget _buildStatusButton(String label, IconData icon, {bool isActive = false}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: isActive ? const Color(0xFFFF4500) : Colors.black38,
        borderRadius: BorderRadius.circular(6),
      ),
      child: Row(
        children: [
          Icon(icon, color: Colors.white, size: 16),
          const SizedBox(width: 6),
          Text(
            label,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 12,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildSectionHeader(String title) {
    return Row(
      children: [
        Container(
          width: 4,
          height: 18,
          decoration: const BoxDecoration(
            color: Color(0xFFFF4500),
            borderRadius: BorderRadius.all(Radius.circular(2)),
          ),
        ),
        const SizedBox(width: 8),
        Text(
          title,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }
  
  Widget _buildSeasonSelection() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.black26,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: Colors.grey.shade800, width: 1),
      ),
      child: Row(
        children: [
          const Text(
            'Sezon 1',
            style: TextStyle(
              color: Colors.white,
              fontSize: 14,
              fontWeight: FontWeight.bold,
            ),
          ),
          const Spacer(),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: const Color(0xFFFF4500),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Text(
              '24/24',
              style: TextStyle(
                color: Colors.white,
                fontSize: 12,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          const SizedBox(width: 4),
          const Icon(
            Icons.arrow_drop_down,
            color: Colors.white,
          ),
        ],
      ),
    );
  }
  
  Widget _buildEpisodeGrid() {
    // Electron'daki gibi bölüm grid'i
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 6,
        crossAxisSpacing: 8,
        mainAxisSpacing: 8,
        childAspectRatio: 1.5,
      ),
      itemCount: 24, // Örnek olarak 24 bölüm
      itemBuilder: (context, index) {
        final episodeNumber = index + 1;
        // Electron'daki gibi izlenen bölümler renkli
        final isWatched = episodeNumber <= 18; // İlk 18 bölüm izlendi varsayalım
        
        return Container(
          decoration: BoxDecoration(
            color: isWatched ? const Color(0xFFFF4500) : Colors.black26,
            borderRadius: BorderRadius.circular(4),
            border: isWatched ? null : Border.all(color: Colors.grey.shade800, width: 1),
          ),
          child: Center(
            child: Text(
              episodeNumber.toString(),
              style: TextStyle(
                color: isWatched ? Colors.white : Colors.white70,
                fontSize: 14,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        );
      },
    );
  }
  
  Widget _buildRelatedContentList() {
    // Electron'daki gibi ilişkili içerik listesi
    final items = [
      {
        'title': 'Steins;Gate: Egoistic Poriomania',
        'type': 'OVA',
        'year': '2012',
        'episodes': '1',
      },
      {
        'title': 'Steins;Gate 0',
        'type': 'TV',
        'year': '2018',
        'episodes': '23',
      },
      {
        'title': 'Steins;Gate: Kyoukaimenjou no Missing Link',
        'type': 'Film',
        'year': '2013',
        'episodes': null,
      },
    ];
    
    return Column(
      children: items.map((item) => _buildRelatedItem(item)).toList(),
    );
  }
  
  Widget _buildRelatedItem(Map<String, dynamic> item) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: Colors.black26,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: Colors.grey.shade800, width: 1),
      ),
      child: Row(
        children: [
          // Thumbnail
          Container(
            width: 40,
            height: 60,
            decoration: BoxDecoration(
              color: Colors.grey.shade800,
              borderRadius: BorderRadius.circular(4),
            ),
            child: const Center(
              child: Icon(Icons.movie, color: Colors.white30, size: 20),
            ),
          ),
          
          const SizedBox(width: 12),
          
          // Bilgiler
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item['title'] as String,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                
                const SizedBox(height: 4),
                
                // Alt bilgiler
                Wrap(
                  spacing: 6,
                  children: [
                    _buildTag(item['type'] as String),
                    _buildTag(item['year'] as String),
                    if (item['episodes'] != null)
                      _buildTag('${item['episodes']} Bölüm'),
                  ],
                ),
              ],
            ),
          ),
          
          // Aksiyon butonu
          Container(
            width: 30,
            height: 30,
            decoration: const BoxDecoration(
              color: Color(0xFFFF4500),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.add,
              color: Colors.white,
              size: 20,
            ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildTag(String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: Colors.black45,
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(
        text,
        style: const TextStyle(
          color: Colors.white70,
          fontSize: 12,
        ),
      ),
    );
  }
  
  Widget _buildMovieInfo() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionHeader('Film Bilgileri'),
        
        const SizedBox(height: 12),
        
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Colors.black26,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: Colors.grey.shade800, width: 1),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildInfoRow('Süre', '120 dakika'),
              _buildInfoRow('Bütçe', '\$150,000,000'),
              _buildInfoRow('Hasılat', '\$425,730,000'),
              _buildInfoRow('Yönetmen', 'Örnek Yönetmen'),
              _buildInfoRow('Yapım', 'Warner Bros.'),
            ],
          ),
        ),
        
        const SizedBox(height: 20),
        
        _buildSectionHeader('Benzer Filmler'),
        
        const SizedBox(height: 12),
        
        // Benzer filmler - basit örnek
        SizedBox(
          height: 180,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            itemCount: 5,
            itemBuilder: (context, index) {
              return Container(
                margin: const EdgeInsets.only(right: 8),
                width: 100,
                decoration: BoxDecoration(
                  color: Colors.grey.shade800,
                  borderRadius: BorderRadius.circular(6),
                ),
                child: const Center(
                  child: Icon(Icons.movie, color: Colors.white30),
                ),
              );
            },
          ),
        ),
      ],
    );
  }
  
  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          SizedBox(
            width: 80,
            child: Text(
              label,
              style: const TextStyle(
                color: Colors.white54,
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
              ),
            ),
          ),
        ],
      ),
    );
  }
  
  // Medya türüne göre renk döndürür
  Color _getTypeColor(String? mediaType) {
    switch (mediaType) {
      case 'movie':
        return const Color(0xFF3498DB); // Mavi
      case 'tv':
        return const Color(0xFF2ECC71); // Yeşil
      case 'anime':
        return const Color(0xFFE74C3C); // Kırmızı
      default:
        return const Color(0xFF95A5A6); // Gri
    }
  }
  
  // Medya türüne göre metin döndürür
  String _getTypeText(String? mediaType) {
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