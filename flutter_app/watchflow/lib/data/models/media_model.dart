import 'package:hive/hive.dart';

/// Medya türü enum
enum MediaType { movie, tv, anime }

/// Medya durumu enum
enum MediaStatus { watching, completed, planToWatch, dropped }

/// Medya model sınıfı - Film, Dizi ve Anime için temel sınıf
class MediaModel {
  /// Medya ID
  final String id;
  
  /// Medya başlığı
  final String title;
  
  /// Orijinal başlık
  final String? originalTitle;
  
  /// Medya türü (film, dizi, anime)
  final MediaType mediaType;
  
  /// Açıklama
  final String? overview;
  
  /// Yayın yılı
  final int? year;
  
  /// Poster resmi URL
  final String? posterUrl;
  
  /// Backdrop resmi URL
  final String? backdropUrl;
  
  /// Oy ortalaması (10 üzerinden)
  final double? voteAverage;
  
  /// İzleme durumu
  final MediaStatus? status;
  
  /// Kullanıcı puanı (5 üzerinden)
  final double? userRating;
  
  /// Notlar
  final String? notes;
  
  /// Son güncelleme tarihi
  final DateTime? lastUpdated;
  
  /// Liste ekleme tarihi
  final DateTime? addedDate;
  
  /// Medya türünün string karşılığını döndür
  String get mediaTypeString => mediaType.toString().split('.').last;
  
  /// Medya durumunun string karşılığını döndür
  String? get statusString => status?.toString().split('.').last;
  
  MediaModel({
    required this.id,
    required this.title,
    this.originalTitle,
    required this.mediaType,
    this.overview,
    this.year,
    this.posterUrl,
    this.backdropUrl,
    this.voteAverage,
    this.status,
    this.userRating,
    this.notes,
    this.lastUpdated,
    this.addedDate,
  });
  
  /// Map'ten model oluştur
  factory MediaModel.fromMap(Map<String, dynamic> map, MediaType type) {
    return MediaModel(
      id: map['id']?.toString() ?? '',
      title: map['title'] ?? map['name'] ?? '',
      originalTitle: map['original_title'] ?? map['original_name'],
      mediaType: type,
      overview: map['overview'],
      year: map['release_date'] != null
          ? DateTime.tryParse(map['release_date'])?.year
          : map['first_air_date'] != null
              ? DateTime.tryParse(map['first_air_date'])?.year
              : null,
      posterUrl: map['poster_path'] != null
          ? 'https://image.tmdb.org/t/p/w500${map['poster_path']}'
          : null,
      backdropUrl: map['backdrop_path'] != null
          ? 'https://image.tmdb.org/t/p/original${map['backdrop_path']}'
          : null,
      voteAverage: map['vote_average']?.toDouble(),
      status: map['status'] != null
          ? MediaStatus.values.firstWhere(
              (e) => e.toString().split('.').last == map['status'],
              orElse: () => MediaStatus.planToWatch,
            )
          : null,
      userRating: map['user_rating']?.toDouble(),
      notes: map['notes'],
      lastUpdated: map['last_updated'] != null
          ? DateTime.tryParse(map['last_updated'])
          : null,
      addedDate: map['added_date'] != null
          ? DateTime.tryParse(map['added_date'])
          : null,
    );
  }
  
  /// Model'den map oluştur
  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'title': title,
      'original_title': originalTitle,
      'media_type': mediaTypeString,
      'overview': overview,
      'year': year,
      'poster_path': posterUrl?.replaceAll('https://image.tmdb.org/t/p/w500', ''),
      'backdrop_path': backdropUrl?.replaceAll('https://image.tmdb.org/t/p/original', ''),
      'vote_average': voteAverage,
      'status': statusString,
      'user_rating': userRating,
      'notes': notes,
      'last_updated': lastUpdated?.toIso8601String(),
      'added_date': addedDate?.toIso8601String(),
    };
  }
  
  /// Kopyalama ile yeni model oluştur
  MediaModel copyWith({
    String? id,
    String? title,
    String? originalTitle,
    MediaType? mediaType,
    String? overview,
    int? year,
    String? posterUrl,
    String? backdropUrl,
    double? voteAverage,
    MediaStatus? status,
    double? userRating,
    String? notes,
    DateTime? lastUpdated,
    DateTime? addedDate,
  }) {
    return MediaModel(
      id: id ?? this.id,
      title: title ?? this.title,
      originalTitle: originalTitle ?? this.originalTitle,
      mediaType: mediaType ?? this.mediaType,
      overview: overview ?? this.overview,
      year: year ?? this.year,
      posterUrl: posterUrl ?? this.posterUrl,
      backdropUrl: backdropUrl ?? this.backdropUrl,
      voteAverage: voteAverage ?? this.voteAverage,
      status: status ?? this.status,
      userRating: userRating ?? this.userRating,
      notes: notes ?? this.notes,
      lastUpdated: lastUpdated ?? this.lastUpdated,
      addedDate: addedDate ?? this.addedDate,
    );
  }
} 