// Jikan API Wrapper (React)
const JIKAN_API_BASE_URL = 'https://api.jikan.moe/v4';

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

export async function searchJikanAnime(searchText, maxRetries = 2) {
  let retries = 0;
  while (retries <= maxRetries) {
    try {
      const response = await fetch(`${JIKAN_API_BASE_URL}/anime?q=${encodeURIComponent(searchText)}&limit=10`);
      if (response.status === 429) {
        await sleep(4000 * Math.pow(2, retries));
        retries++;
        continue;
      }
      if (!response.ok) throw new Error(`Jikan API Hata: ${response.status}`);
      const data = await response.json();
      if (!data.data || !Array.isArray(data.data)) return [];
      return data.data.map(item => ({
        id: item.mal_id,
        title: item.title,
        type: 'anime',
        year: item.aired?.from ? new Date(item.aired.from).getFullYear() : null,
        imageUrl: item.images?.jpg?.image_url,
        score: item.score,
        status: item.status,
        episodes: item.episodes
      }));
    } catch (error) {
      
      retries++;
      if (retries > maxRetries) return [];
      await sleep(2000 * retries);
    }
  }
  return [];
}

