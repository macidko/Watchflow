import 'package:watchflow/domain/entities/media_entity.dart';

class GetWatchlistItemsUseCase {
  // Normalde burada bir repository dependency injection yapılır
  // final WatchlistRepository repository;
  // GetWatchlistItemsUseCase(this.repository);
  
  // execute yerine call metodu ile çağrılabilir bir fonksiyon yapıyoruz
  Future<List<MediaEntity>> call({String? status, String? mediaType}) async {
    // Mock veri:
    await Future.delayed(const Duration(milliseconds: 800));
    
    // Status filtrelemesi için mockup veriler
    if (status == 'watching') {
      return [
        MediaEntity(
          id: 1,
          title: "Inception",
          overview: "Rüyalar içinde geçen bir bilim kurgu filmi",
          posterPath: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
          backdropPath: "https://image.tmdb.org/t/p/original/s3TBrRGB1iav7gFOCNx3H31MoES.jpg",
          voteAverage: 8.2,
          releaseDate: "2010-07-16",
          mediaType: "movie",
          status: "watching",
        ),
      ];
    } else if (status == 'plan_to_watch') {
      return [
        MediaEntity(
          id: 2,
          title: "Breaking Bad",
          overview: "Bir kimya öğretmeninin suç dünyasına girişi",
          posterPath: "https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
          backdropPath: "https://image.tmdb.org/t/p/original/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg",
          voteAverage: 8.5,
          releaseDate: "2008-01-20",
          mediaType: "tv",
          status: "plan_to_watch",
        ),
      ];
    } else if (status == 'completed') {
      return [
        MediaEntity(
          id: 3,
          title: "Attack on Titan",
          overview: "İnsanlığın dev yaratıklara karşı mücadelesi",
          posterPath: "https://image.tmdb.org/t/p/w500/aiy35Evcofzl7hNzFdoEIwtZkS4.jpg",
          backdropPath: "https://image.tmdb.org/t/p/original/3OsZ6f1aKuk3krpZybyze6IlyI3.jpg",
          voteAverage: 8.7,
          releaseDate: "2013-04-07",
          mediaType: "anime",
          status: "completed",
        ),
      ];
    }
    
    // Default tüm listeyi döndür
    return [
      MediaEntity(
        id: 1,
        title: "Inception",
        overview: "Rüyalar içinde geçen bir bilim kurgu filmi",
        posterPath: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
        backdropPath: "https://image.tmdb.org/t/p/original/s3TBrRGB1iav7gFOCNx3H31MoES.jpg",
        voteAverage: 8.2,
        releaseDate: "2010-07-16",
        mediaType: "movie",
        status: "watching",
      ),
      MediaEntity(
        id: 2,
        title: "Breaking Bad",
        overview: "Bir kimya öğretmeninin suç dünyasına girişi",
        posterPath: "https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
        backdropPath: "https://image.tmdb.org/t/p/original/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg",
        voteAverage: 8.5,
        releaseDate: "2008-01-20",
        mediaType: "tv",
        status: "plan_to_watch",
      ),
            MediaEntity(
        id: 2,
        title: "Breaking Bad",
        overview: "Bir kimya öğretmeninin suç dünyasına girişi",
        posterPath: "https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
        backdropPath: "https://image.tmdb.org/t/p/original/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg",
        voteAverage: 8.5,
        releaseDate: "2008-01-20",
        mediaType: "tv",
        status: "plan_to_watch",
      ),
            MediaEntity(
        id: 2,
        title: "Breaking Bad",
        overview: "Bir kimya öğretmeninin suç dünyasına girişi",
        posterPath: "https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
        backdropPath: "https://image.tmdb.org/t/p/original/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg",
        voteAverage: 8.5,
        releaseDate: "2008-01-20",
        mediaType: "tv",
        status: "plan_to_watch",
      ),
            MediaEntity(
        id: 2,
        title: "Breaking Bad",
        overview: "Bir kimya öğretmeninin suç dünyasına girişi",
        posterPath: "https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
        backdropPath: "https://image.tmdb.org/t/p/original/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg",
        voteAverage: 8.5,
        releaseDate: "2008-01-20",
        mediaType: "tv",
        status: "plan_to_watch",
      ),
            MediaEntity(
        id: 2,
        title: "Breaking Bad",
        overview: "Bir kimya öğretmeninin suç dünyasına girişi",
        posterPath: "https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
        backdropPath: "https://image.tmdb.org/t/p/original/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg",
        voteAverage: 8.5,
        releaseDate: "2008-01-20",
        mediaType: "tv",
        status: "plan_to_watch",
      ),
            MediaEntity(
        id: 2,
        title: "Breaking Bad",
        overview: "Bir kimya öğretmeninin suç dünyasına girişi",
        posterPath: "https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
        backdropPath: "https://image.tmdb.org/t/p/original/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg",
        voteAverage: 8.5,
        releaseDate: "2008-01-20",
        mediaType: "tv",
        status: "plan_to_watch",
      ),
            MediaEntity(
        id: 2,
        title: "Breaking Bad",
        overview: "Bir kimya öğretmeninin suç dünyasına girişi",
        posterPath: "https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
        backdropPath: "https://image.tmdb.org/t/p/original/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg",
        voteAverage: 8.5,
        releaseDate: "2008-01-20",
        mediaType: "tv",
        status: "plan_to_watch",
      ),
            MediaEntity(
        id: 2,
        title: "Breaking Bad",
        overview: "Bir kimya öğretmeninin suç dünyasına girişi",
        posterPath: "https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
        backdropPath: "https://image.tmdb.org/t/p/original/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg",
        voteAverage: 8.5,
        releaseDate: "2008-01-20",
        mediaType: "tv",
        status: "plan_to_watch",
      ),
            MediaEntity(
        id: 2,
        title: "Breaking Bad",
        overview: "Bir kimya öğretmeninin suç dünyasına girişi",
        posterPath: "https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
        backdropPath: "https://image.tmdb.org/t/p/original/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg",
        voteAverage: 8.5,
        releaseDate: "2008-01-20",
        mediaType: "tv",
        status: "plan_to_watch",
      ),
            MediaEntity(
        id: 2,
        title: "Breaking Bad",
        overview: "Bir kimya öğretmeninin suç dünyasına girişi",
        posterPath: "https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
        backdropPath: "https://image.tmdb.org/t/p/original/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg",
        voteAverage: 8.5,
        releaseDate: "2008-01-20",
        mediaType: "tv",
        status: "plan_to_watch",
      ),
      MediaEntity(
        id: 3,
        title: "Attack on Titan",
        overview: "İnsanlığın dev yaratıklara karşı mücadelesi",
        posterPath: "https://image.tmdb.org/t/p/w500/aiy35Evcofzl7hNzFdoEIwtZkS4.jpg",
        backdropPath: "https://image.tmdb.org/t/p/original/3OsZ6f1aKuk3krpZybyze6IlyI3.jpg",
        voteAverage: 8.7,
        releaseDate: "2013-04-07",
        mediaType: "anime",
        status: "completed",
      ),
    ];
  }
}
