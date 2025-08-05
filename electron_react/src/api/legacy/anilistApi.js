// AniList API Wrapper (React)
const ANILIST_API_URL = 'https://graphql.anilist.co';

const SEARCH_ANIME_QUERY = `
query ($search: String) {
  Page(page: 1, perPage: 10) {
    media(search: $search, type: ANIME, sort: POPULARITY_DESC) {
      id
      title { romaji english }
      coverImage { large medium }
      startDate { year }
      format
      episodes
      status
      averageScore
    }
  }
}`;

export async function searchAnilistAnime(searchText) {
  const response = await fetch(ANILIST_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ query: SEARCH_ANIME_QUERY, variables: { search: searchText } })
  });
  if (!response.ok) return [];
  const data = await response.json();
  const results = data?.data?.Page?.media || [];
  return results.map(item => ({
    id: item.id,
    title: item.title.english || item.title.romaji,
    type: 'anime',
    year: item.startDate?.year,
    imageUrl: item.coverImage?.large || item.coverImage?.medium,
    score: item.averageScore ? item.averageScore / 10 : null,
    status: item.status,
    episodes: item.episodes
  }));
}


// AniList'ten anime detay ve bölüm/sezon bilgisi alır
export async function getAnilistAnimeDetails(anilistId) {
  const DETAIL_QUERY = `
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        id
        title { romaji english native }
        coverImage { large }
        episodes
        season
        seasonYear
        description
        format
        status
        averageScore
        nextAiringEpisode { episode airingAt }
      }
    }
  `;
  const response = await fetch(ANILIST_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ query: DETAIL_QUERY, variables: { id: anilistId } })
  });
  if (!response.ok) throw new Error('AniList API hatası');
  const { data } = await response.json();
  if (!data?.Media) throw new Error('AniList: Anime bulunamadı');
  return {
    id: data.Media.id,
    title: data.Media.title,
    imageUrl: data.Media.coverImage?.large,
    episodes: data.Media.episodes,
    season: data.Media.season,
    seasonYear: data.Media.seasonYear,
    description: data.Media.description,
    format: data.Media.format,
    status: data.Media.status,
    averageScore: data.Media.averageScore,
    nextAiringEpisode: data.Media.nextAiringEpisode,
    source: 'anilist'
  };
}
