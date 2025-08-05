// Kitsu API Wrapper (React)
const KITSU_API_URL = 'https://kitsu.io/api/edge';

export async function searchKitsuAnime(searchText) {
  const response = await fetch(`${KITSU_API_URL}/anime?filter[text]=${encodeURIComponent(searchText)}&page[limit]=10&sort=-userCount`, {
    headers: {
      'Accept': 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json'
    }
  });
  if (!response.ok) return [];
  const data = await response.json();
  if (!data.data || !Array.isArray(data.data)) return [];
  return data.data.map(item => {
    const attrs = item.attributes;
    return {
      id: item.id,
      title: attrs.titles.ja_jp || attrs.titles.en_jp || attrs.canonicalTitle || attrs.titles.en,
      original_title: attrs.titles.ja_jp,
      type: 'anime',
      year: attrs.startDate ? new Date(attrs.startDate).getFullYear() : null,
      imageUrl: attrs.posterImage?.medium || attrs.posterImage?.original,
      score: attrs.averageRating ? parseFloat(attrs.averageRating) / 10 : null,
      status: attrs.status,
      episodes: attrs.episodeCount
    };
  });
}
