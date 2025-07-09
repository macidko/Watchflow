import 'package:flutter/material.dart';
import 'package:watchflow/domain/entities/media_entity.dart';
import 'package:watchflow/presentation/theme/app_colors.dart';

class MediaDetailModal extends StatefulWidget {
  final MediaEntity media;
  
  const MediaDetailModal({
    Key? key, 
    required this.media,
  }) : super(key: key);

  @override
  State<MediaDetailModal> createState() => _MediaDetailModalState();
}

class _MediaDetailModalState extends State<MediaDetailModal> {
  Set<int> _selectedEpisodes = {};

  @override
  Widget build(BuildContext context) {
    final media = widget.media;
    return Container(
      decoration: BoxDecoration(
        color: AppColors.secondaryBg,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
        boxShadow: const [
          BoxShadow(
            color: Color(0x90000000),
            blurRadius: 24,
            spreadRadius: 0,
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          // Poster ve başlık
          _buildPosterHeader(context),
          Expanded(
            child: SingleChildScrollView(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildTitleSection(),
                    const SizedBox(height: 16),
                    _buildRatingSection(),
                    const SizedBox(height: 16),
                    _buildProgressBar(),
                    const SizedBox(height: 20),
                    if (media.mediaType == 'tv' || media.mediaType == 'anime') ...[
                      _buildSeasonSection(),
                      const SizedBox(height: 24),
                      if (media.mediaType == 'anime') ...[
                        _buildSectionHeader('İlişkili Animeler'),
                        const SizedBox(height: 10),
                        _buildRelatedContentList(),
                      ],
                    ] else ...[
                      _buildMovieInfo(),
                    ],
                    const SizedBox(height: 16),
                    _buildActionButtons(context),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPosterHeader(BuildContext context) {
    final media = widget.media;
    return Stack(
      children: [
        // Poster görseli
        Container(
          width: double.infinity,
          height: 220,
          decoration: BoxDecoration(
            borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
            image: media.posterPath != null
                ? DecorationImage(
                    image: NetworkImage('https://image.tmdb.org/t/p/w500${media.posterPath}'),
                    fit: BoxFit.cover,
                  )
                : null,
            color: AppColors.secondaryBg,
          ),
          child: media.posterPath == null
              ? const Center(child: Icon(Icons.movie, color: Colors.white54, size: 60))
              : null,
        ),
        // Gradient overlay
        Positioned.fill(
          child: Container(
            decoration: const BoxDecoration(
              borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
              gradient: LinearGradient(
                begin: Alignment.bottomCenter,
                end: Alignment.topCenter,
                colors: [
                  Color.fromRGBO(0, 0, 0, 0.85),
                  Color.fromRGBO(0, 0, 0, 0.3),
                  Colors.transparent,
                ],
                stops: [0.0, 0.7, 1.0],
              ),
            ),
          ),
        ),
        // Badge ve kapatma butonu
        Positioned(
          top: 16,
          left: 16,
          child: Row(
            children: [
              if (media.voteAverage != null)
                _buildInfoChip('${media.voteAverage!.toStringAsFixed(1)} ★', const Color(0xFF9C5400)),
              if (media.releaseDate != null)
                Padding(
                  padding: const EdgeInsets.only(left: 8),
                  child: _buildInfoChip(media.releaseDate!.substring(0, 4), Colors.grey.shade800),
                ),
              if (media.mediaType != null)
                Padding(
                  padding: const EdgeInsets.only(left: 8),
                  child: _buildInfoChip(_getTypeText(media.mediaType), _getTypeColor(media.mediaType)),
                ),
            ],
          ),
        ),
        // Kapatma butonu
        Positioned(
          top: 16,
          right: 16,
          child: Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: Colors.black38,
              borderRadius: BorderRadius.circular(18),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.2),
                  blurRadius: 6,
                ),
              ],
            ),
            child: IconButton(
              icon: const Icon(Icons.close, color: Colors.white70, size: 20),
              padding: EdgeInsets.zero,
              onPressed: () => Navigator.of(context).pop(),
            ),
          ),
        ),
        // Başlık
        Positioned(
          left: 20,
          right: 20,
          bottom: 18,
          child: Text(
            media.title,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.bold,
              fontSize: 22,
              letterSpacing: 0.5,
              shadows: [
                Shadow(
                  color: Colors.black54,
                  blurRadius: 6,
                  offset: Offset(0, 2),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
  
  Widget _buildHeader(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.secondaryBg,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Text(
              widget.media.title,
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
        if (widget.media.originalTitle != null && widget.media.originalTitle != widget.media.title)
          Padding(
            padding: const EdgeInsets.only(bottom: 4),
            child: Text(
              widget.media.originalTitle!,
              style: const TextStyle(
                color: AppColors.secondaryText,
                fontSize: 14,
                fontStyle: FontStyle.italic,
              ),
            ),
          ),
          
        // Tür, yıl ve durum bilgileri
        Wrap(
          spacing: 8,
          children: [
            _buildInfoChip(_getTypeText(widget.media.mediaType), _getTypeColor(widget.media.mediaType)),
            if (widget.media.releaseDate != null)
              _buildInfoChip(widget.media.releaseDate!.substring(0, 4), Colors.grey.shade800),
            if (widget.media.status != null)
              _buildInfoChip(widget.media.status!, Colors.grey.shade800),
            if (widget.media.voteAverage != null)
              _buildInfoChip('${widget.media.voteAverage!.toStringAsFixed(1)} ★', const Color(0xFF9C5400)),
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
          color: AppColors.primaryText,
          fontSize: 12,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }
  
  Widget _buildRatingSection() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.secondaryBg,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.border, width: 1),
      ),
      child: Row(
        children: [
          const Text(
            'Senin Puanın:',
            style: TextStyle(
              color: Colors.white,
              fontSize: 16,
              fontWeight: FontWeight.w600,
            ),
          ),
          const Spacer(),
          Row(
            children: List.generate(5, (index) {
              final rating = widget.media.userRating ?? 0;
              final isActive = index < (rating / 2).ceil();
              return Padding(
                padding: const EdgeInsets.symmetric(horizontal: 2.5),
                child: Icon(
                  isActive ? Icons.star : Icons.star_border,
                  color: isActive ? const Color(0xFFFFB400) : const Color(0xFF8A8A8A),
                  size: 24,
                ),
              );
            }),
          ),
        ],
      ),
    );
  }
  
  Widget _buildProgressBar() {
    final progress = (widget.media.additionalInfo?['progress'] as num?) ?? 0;
    final totalEpisodes = (widget.media.additionalInfo?['totalEpisodes'] as int?) ?? 12;
    final watchedEpisodes = (widget.media.additionalInfo?['watchedEpisodes'] as int?) ?? totalEpisodes;
    return Container(
      margin: const EdgeInsets.only(top: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.secondaryBg,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.border, width: 1),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: LinearProgressIndicator(
                    value: progress / 100,
                    minHeight: 10,
                    backgroundColor: AppColors.border,
                    valueColor: const AlwaysStoppedAnimation<Color>(AppColors.accent),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.accent,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Text(
                  '$watchedEpisodes/$totalEpisodes',
                  style: const TextStyle(
                    color: AppColors.primaryText,
                    fontWeight: FontWeight.bold,
                    fontSize: 13,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            '${progress.toStringAsFixed(0)}% tamamlandı ($watchedEpisodes/$totalEpisodes bölüm)',
            style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w500),
          ),
        ],
      ),
    );
  }
  
  Widget _buildSeasonSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Text(
              'Sezon 1',
              style: const TextStyle(
                color: Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
            const Spacer(),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: AppColors.hover,
                borderRadius: BorderRadius.circular(16),
              ),
              child: const Text(
                '12/12',
                style: TextStyle(
                  color: AppColors.primaryText,
                  fontWeight: FontWeight.bold,
                  fontSize: 13,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        _buildEpisodeGrid(),
      ],
    );
  }
  
  Widget _buildEpisodeGrid() {
    final totalEpisodes = (widget.media.additionalInfo?['totalEpisodes'] as int?) ?? 12;
    final watchedEpisodes = (widget.media.additionalInfo?['watchedEpisodes'] as int?) ?? 0;
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 5,
        crossAxisSpacing: 8,
        mainAxisSpacing: 8,
        childAspectRatio: 40/28,
      ),
      itemCount: totalEpisodes,
      itemBuilder: (context, index) {
        final episodeNumber = index + 1;
        final isWatched = episodeNumber <= watchedEpisodes;
        final isSelected = _selectedEpisodes.contains(episodeNumber) || isWatched;
        return GestureDetector(
          onTap: () {
            setState(() {
              if (_selectedEpisodes.contains(episodeNumber)) {
                _selectedEpisodes.remove(episodeNumber);
              } else {
                _selectedEpisodes.add(episodeNumber);
              }
            });
          },
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 180),
            decoration: BoxDecoration(
              color: isSelected
                  ? AppColors.accent
                  : AppColors.secondaryBg,
              borderRadius: BorderRadius.circular(4),
              border: Border.all(
                color: isSelected ? AppColors.accent : AppColors.border,
                width: 2,
              ),
              boxShadow: isSelected
                  ? [
                      BoxShadow(
                        color: AppColors.hover.withOpacity(0.15),
                        blurRadius: 4,
                        spreadRadius: 1,
                      ),
                    ]
                  : [],
            ),
            width: 40,
            height: 28,
            child: Center(
              child: Text(
                episodeNumber.toString(),
                style: TextStyle(
                  color: isSelected ? AppColors.primaryText : AppColors.secondaryText,
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                ),
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
        color: AppColors.secondaryBg,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.border, width: 1),
      ),
      child: Row(
        children: [
          // Thumbnail
          Container(
            width: 40,
            height: 60,
            decoration: BoxDecoration(
              color: AppColors.border,
              borderRadius: BorderRadius.circular(4),
            ),
            child: const Center(
              child: Icon(Icons.movie, color: AppColors.secondaryText, size: 20),
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
              color: AppColors.accent,
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.add,
              color: AppColors.primaryText,
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
        color: AppColors.border.withOpacity(0.5),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(
        text,
        style: const TextStyle(
          color: AppColors.secondaryText,
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
            color: AppColors.secondaryBg.withOpacity(0.7),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: AppColors.border, width: 1),
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
                  color: AppColors.border,
                  borderRadius: BorderRadius.circular(6),
                ),
                child: const Center(
                  child: Icon(Icons.movie, color: AppColors.secondaryText),
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
  
  Widget _buildSectionHeader(String title) {
    return Row(
      children: [
        Container(
          width: 4,
          height: 18,
          decoration: const BoxDecoration(
            color: AppColors.accent,
            borderRadius: BorderRadius.all(Radius.circular(2)),
          ),
        ),
        const SizedBox(width: 8),
        Text(
          title,
          style: const TextStyle(
            color: AppColors.primaryText,
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }
  
  Widget _buildActionButtons(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: 16, bottom: 8),
      child: Column(
        children: [
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.border,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
                elevation: 0,
              ),
              onPressed: () {},
              child: const Text(
                'KALDIR',
                style: TextStyle(
                  color: AppColors.primaryText,
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                  letterSpacing: 1.1,
                ),
              ),
            ),
          ),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.hover,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
                elevation: 0,
              ),
              onPressed: () {},
              child: const Text(
                'İZLENDİ OLARAK İŞARETLE',
                style: TextStyle(
                  color: AppColors.primaryText,
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                  letterSpacing: 1.1,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
  
  // Medya türüne göre renk döndürür
  Color _getTypeColor(String? mediaType) {
    // Tüm medya türleri için accent rengi kullanılıyor
    return AppColors.accent;
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