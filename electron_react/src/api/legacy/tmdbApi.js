// TMDB API Wrapper (React)
// Not: API anahtarınızı .env dosyasına REACT_APP_TMDB_API_KEY olarak ekleyin.

const TMDB_API_BASE_URL = 'https://api.themoviedb.org/3';
// For Vite: use import.meta.env.VITE_TMDB_API_KEY
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

export async function searchTMDBMedia(searchText, type = 'multi', apiKey = TMDB_API_KEY) {
  if (!apiKey) throw new Error('TMDB API anahtarı bulunamadı!');
  let endpoint = '/search/multi';
  if (type === 'movie') endpoint = '/search/movie';
  else if (type === 'tv') endpoint = '/search/tv';
  const url = `${TMDB_API_BASE_URL}${endpoint}?api_key=${apiKey}&query=${encodeURIComponent(searchText)}&language=en-US`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`TMDB API Hata: ${response.status}`);
  const data = await response.json();
  return (data.results || []).map(item => ({
    id: item.id,
    title: item.title || item.name,
    type: item.media_type || type,
    year: item.release_date ? new Date(item.release_date).getFullYear() : null,
    imageUrl: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
    score: item.vote_average,
    overview: item.overview
  }));
}

// Belirli bir TV şovu için sezon ve bölüm bilgilerini alır
export async function getTvShowSeasons(tvId, apiKey = TMDB_API_KEY) {
  if (!apiKey) throw new Error('TMDB API anahtarı bulunamadı!');
  const showResponse = await fetch(
    `${TMDB_API_BASE_URL}/tv/${tvId}?api_key=${apiKey}&language=en-US`
  );
  if (!showResponse.ok) throw new Error(`TMDB API Hata: ${showResponse.status}`);
  const showData = await showResponse.json();
  const seasons = [];
  for (const season of showData.seasons) {
    if (season.season_number === 0 || season.episode_count < 1) continue;
    const seasonResponse = await fetch(
      `${TMDB_API_BASE_URL}/tv/${tvId}/season/${season.season_number}?api_key=${apiKey}&language=en-US`
    );
    if (!seasonResponse.ok) continue;
    const seasonData = await seasonResponse.json();
    const episodes = seasonData.episodes.map(ep => ({
      episodeId: ep.id,
      episodeNumber: ep.episode_number,
      title: ep.name,
      overview: ep.overview,
      stillUrl: ep.still_path ? `https://image.tmdb.org/t/p/original${ep.still_path}` : null,
      airDate: ep.air_date,
      voteAverage: ep.vote_average
    }));
    seasons.push({
      seasonNumber: season.season_number,
      seasonName: season.name,
      episodeCount: episodes.length,
      overview: season.overview,
      posterUrl: season.poster_path ? `https://image.tmdb.org/t/p/w500${season.poster_path}` : null,
      airDate: season.air_date,
      episodes
    });
  }
  return {
    id: showData.id,
    title: showData.name,
    overview: showData.overview,
    posterUrl: showData.poster_path ? `https://image.tmdb.org/t/p/w500${showData.poster_path}` : null,
    backdropUrl: showData.backdrop_path ? `https://image.tmdb.org/t/p/original${showData.backdrop_path}` : null,
    totalSeasons: seasons.length,
    seasons
  };
}
