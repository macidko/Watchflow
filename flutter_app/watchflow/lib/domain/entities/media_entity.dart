class MediaEntity {
  final int id;
  final String title;
  final String? originalTitle;
  final String? overview;
  final String? posterPath;
  final String? backdropPath;
  final String? mediaType; // 'movie', 'tv', 'anime'
  final String? releaseDate;
  final double? voteAverage;
  final int? voteCount;
  final int? numberOfSeasons;
  final int? numberOfEpisodes;
  final String? status;
  final int? userRating;
  final Map<String, dynamic>? additionalInfo;

  MediaEntity({
    required this.id,
    required this.title,
    this.originalTitle,
    this.overview,
    this.posterPath,
    this.backdropPath,
    this.mediaType,
    this.releaseDate,
    this.voteAverage,
    this.voteCount,
    this.numberOfSeasons,
    this.numberOfEpisodes,
    this.status,
    this.userRating,
    this.additionalInfo,
  });
}
