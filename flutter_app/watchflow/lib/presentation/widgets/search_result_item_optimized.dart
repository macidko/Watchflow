import 'package:flutter/material.dart';
import 'package:watchflow/presentation/theme/app_colors.dart';
import 'package:watchflow/domain/entities/media_entity.dart';
import 'package:watchflow/utils/slider_utils_optimized.dart';

/// Arama sonuçlarında gösterilen her bir öğe
class SearchResultItem extends StatelessWidget {
  final MediaEntity media;
  final VoidCallback onAdd;
  final List<String> sliderTitles;
  final String? selectedSlider;
  final ValueChanged<String?>? onSliderChanged;

  const SearchResultItem({
    super.key,
    required this.media,
    required this.onAdd,
    required this.sliderTitles,
    this.selectedSlider,
    this.onSliderChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      color: AppColors.primaryBg,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            // Poster
            _buildPosterImage(),
            const SizedBox(width: 14),
            // Başlık ve tarih
            Expanded(
              flex: 2,
              child: _buildTitleSection(),
            ),
            // Dropdown
            if (sliderTitles.isNotEmpty) ...[
              const SizedBox(width: 10),
              _buildSliderDropdown(),
            ],
            const SizedBox(width: 10),
            // Ekle butonu
            _buildAddButton(),
          ],
        ),
      ),
    );
  }
  
  Widget _buildPosterImage() {
    return ClipRRect(
      borderRadius: BorderRadius.circular(8),
      child: media.posterPath != null && media.posterPath!.isNotEmpty
          ? Image.network(
              media.posterPath!,
              width: 56,
              height: 80,
              fit: BoxFit.cover,
              errorBuilder: (context, error, stackTrace) => _buildPlaceholder(),
            )
          : _buildPlaceholder(),
    );
  }
  
  Widget _buildPlaceholder() {
    return Container(
      width: 56,
      height: 80,
      color: AppColors.border,
      child: const Icon(Icons.broken_image, size: 28, color: AppColors.secondaryText),
    );
  }
  
  Widget _buildTitleSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisAlignment: MainAxisAlignment.center,
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
        if (media.releaseDate != null && media.releaseDate!.isNotEmpty)
          Text(
            _formatReleaseDate(media.releaseDate!),
            style: const TextStyle(
              fontSize: 13,
              color: AppColors.secondaryText,
            ),
          ),
      ],
    );
  }
  
  Widget _buildSliderDropdown() {
    return Container(
      constraints: const BoxConstraints(maxWidth: 120, minHeight: 36),
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 0),
      decoration: BoxDecoration(
        color: AppColors.secondaryBg,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.border, width: 1),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: selectedSlider,
          hint: const Text('Kategori', 
            style: TextStyle(fontSize: 13, color: AppColors.secondaryText)),
          icon: const Icon(Icons.arrow_drop_down, color: AppColors.secondaryText),
          isDense: true,
          items: sliderTitles.map((title) => DropdownMenuItem(
            value: title,
            child: Text(title, style: const TextStyle(fontSize: 13)),
          )).toList(),
          onChanged: onSliderChanged,
          isExpanded: true,
          style: const TextStyle(fontSize: 13, color: AppColors.primaryText),
          dropdownColor: AppColors.primaryBg,
          alignment: Alignment.centerLeft,
        ),
      ),
    );
  }
  
  Widget _buildAddButton() {
    return SizedBox(
      height: 36,
      child: ElevatedButton(
        onPressed: onAdd,
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.accent,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 0),
          textStyle: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          elevation: 1,
          minimumSize: const Size(0, 36),
          maximumSize: const Size(120, 36),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: const [
            Icon(Icons.add, size: 18),
            SizedBox(width: 4),
            Text('Ekle'),
          ],
        ),
      ),
    );
  }
  
  // Tarih formatını düzenle: YYYY-MM-DD -> YYYY
  String _formatReleaseDate(String date) {
    if (date.isEmpty) return '';
    final parts = date.split('-');
    if (parts.isNotEmpty) {
      return parts.first; // Sadece yılı göster
    }
    return date;
  }
}
