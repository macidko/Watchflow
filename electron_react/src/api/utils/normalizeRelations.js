/**
 * Tüm provider'lar için içerik ilişkilerini normalize eden yardımcı fonksiyon.
 * Her API'nin response'unu ortak modele çevirir.
 */

/**
 * Ortak model:
 * {
 *   status: 'finished' | 'airing' | 'upcoming' | 'cancelled',
 *   nextSeason: { seasonNumber, airDate } | null,
 *   nextEpisode: { episodeNumber, airDate } | null,
 *   prequel: [{ id, title, type }],
 *   sequel: [{ id, title, type }],
 *   collection: { id, name } | null
 * }
 */

export function normalizeRelations(raw, provider) {
  if (provider === 'tmdb') {
    // Dizi/film ayrımı
    const isSeries = !!raw.number_of_seasons;
    // Collect related items from recommendations/similar if available
    const related = [];
    const pushRelated = (r) => {
      if (!r) return;
      const id = r.id || r.media_id || r.tmdb_id;
      const title = r.title || r.name || r.original_title || r.original_name || '';
      const media_type = r.media_type || (raw.media_type ? raw.media_type : 'movie');
      // TMDB poster URL'ini oluştur
      const poster = r.poster_path ? `https://image.tmdb.org/t/p/w500${r.poster_path}` : null;
      if (id) related.push({ id, title, media_type, poster });
    };

    if (raw.recommendations && Array.isArray(raw.recommendations.results)) {
      raw.recommendations.results.forEach(pushRelated);
    }
    if (raw.similar && Array.isArray(raw.similar.results)) {
      raw.similar.results.forEach(pushRelated);
    }
    // If item belongs to a collection, include collection parts as related (useful for movie franchises)
    if (raw.belongs_to_collection && Array.isArray(raw.belongs_to_collection.parts)) {
      raw.belongs_to_collection.parts.forEach(pushRelated);
    }

    // Deduplicate related by id
    const seen = new Set();
    const dedupedRelated = [];
    related.forEach(r => {
      if (!r.id) return;
      if (!seen.has(r.id)) {
        seen.add(r.id);
        dedupedRelated.push(r);
      }
    });

    // TMDB next episode mapping
    let nextEpisode = null;
    if (raw.next_episode_to_air) {
      nextEpisode = {
        episodeNumber: raw.next_episode_to_air.episode_number,
        airDate: raw.next_episode_to_air.air_date
      };
    } else if (raw.nextAiringEpisode) {
      // fallback (ör. normalize edilmiş veri gelirse)
      nextEpisode = {
        episodeNumber: raw.nextAiringEpisode.episode,
        airDate: raw.nextAiringEpisode.airingAt ? new Date(raw.nextAiringEpisode.airingAt * 1000).toISOString().slice(0,10) : null
      };
    }
    
    console.log('TMDB normalizeRelations debug:', {
      rawNextEpisode: raw.next_episode_to_air,
      normalizedNextEpisode: nextEpisode,
      status: raw.status
    });

    return {
      status: raw.status === 'Ended' ? 'finished' : (raw.status === 'Returning Series' ? 'airing' : (raw.status === 'Planned' ? 'upcoming' : 'cancelled')),
      nextSeason: isSeries && raw.seasons ? getNextSeason(raw.seasons) : null,
      nextEpisode,
      prequel: [],
      sequel: [],
      related: dedupedRelated, // TMDB için recommendations/similar'ı related olarak döndür
      collection: raw.belongs_to_collection ? { id: raw.belongs_to_collection.id, name: raw.belongs_to_collection.name } : null
    };
  }
  if (provider === 'anilist') {
    // AniList next episode mapping
    let nextEpisode = null;
    if (raw.nextAiringEpisode) {
      nextEpisode = {
        episodeNumber: raw.nextAiringEpisode.episode,
        airDate: raw.nextAiringEpisode.airingAt ? new Date(raw.nextAiringEpisode.airingAt * 1000).toISOString().slice(0,10) : null
      };
    }
    
    console.log('AniList normalizeRelations debug:', {
      rawNextAiring: raw.nextAiringEpisode,
      normalizedNextEpisode: nextEpisode,
      status: raw.status
    });
    
    return {
      status: mapAniListStatus(raw.status),
      nextSeason: null, // AniList'te sezon bilgisi yok
      nextEpisode,
      prequel: (raw.relations?.edges || []).filter(r => r.relationType === 'PREQUEL').map(edge => mapAniListRelation(edge.node)),
      sequel: (raw.relations?.edges || []).filter(r => r.relationType === 'SEQUEL').map(edge => mapAniListRelation(edge.node)),
      collection: null
    };
  }
  if (provider === 'kitsu') {
    // Kitsu next episode mapping (örnek: airingEpisode veya custom alanlar varsa)
    let nextEpisode = null;
    if (raw.airingEpisode) {
      nextEpisode = {
        episodeNumber: raw.airingEpisode.number,
        airDate: raw.airingEpisode.airdate || null
      };
    }
    
    console.log('Kitsu normalizeRelations debug:', {
      rawAiringEpisode: raw.airingEpisode,
      normalizedNextEpisode: nextEpisode,
      status: raw.status
    });
    
    return {
      status: mapKitsuStatus(raw.status),
      nextSeason: null,
      nextEpisode,
      prequel: raw.relationships?.prequel?.data ? [mapKitsuRelation(raw.relationships.prequel.data)] : [],
      sequel: raw.relationships?.sequel?.data ? [mapKitsuRelation(raw.relationships.sequel.data)] : [],
      collection: null
    };
  }
  if (provider === 'jikan') {
    // Jikan next episode mapping (örnek: broadcast veya upcomingEpisode varsa)
    let nextEpisode = null;
    if (raw.broadcast && raw.broadcast.episode && raw.broadcast.airdate) {
      nextEpisode = {
        episodeNumber: raw.broadcast.episode,
        airDate: raw.broadcast.airdate
      };
    } else if (raw.upcomingEpisode) {
      nextEpisode = {
        episodeNumber: raw.upcomingEpisode.episode,
        airDate: raw.upcomingEpisode.airdate
      };
    }
    
    console.log('Jikan normalizeRelations debug:', {
      rawBroadcast: raw.broadcast,
      rawUpcomingEpisode: raw.upcomingEpisode,
      normalizedNextEpisode: nextEpisode,
      status: raw.status
    });
    
    return {
      status: mapJikanStatus(raw.status),
      nextSeason: null,
      nextEpisode,
      prequel: raw.related?.Prequel ? raw.related.Prequel.map(mapJikanRelation) : [],
      sequel: raw.related?.Sequel ? raw.related.Sequel.map(mapJikanRelation) : [],
      collection: null
    };
  }
  return {};
}

function getNextSeason(seasons) {
  // TMDB: En güncel "future" sezonu bul
  const future = seasons.filter(s => s.air_date && new Date(s.air_date) > new Date());
  if (future.length === 0) return null;
  const next = future.sort((a,b) => new Date(a.air_date) - new Date(b.air_date))[0];
  return { seasonNumber: next.season_number, airDate: next.air_date };
}

function mapAniListStatus(status) {
  if (status === 'FINISHED') return 'finished';
  if (status === 'RELEASING') return 'airing';
  if (status === 'NOT_YET_RELEASED') return 'upcoming';
  if (status === 'CANCELLED') return 'cancelled';
  return 'unknown';
}
function mapKitsuStatus(status) {
  if (status === 'finished') return 'finished';
  if (status === 'current') return 'airing';
  if (status === 'upcoming') return 'upcoming';
  if (status === 'cancelled') return 'cancelled';
  return 'unknown';
}
function mapJikanStatus(status) {
  if (status === 'Finished Airing') return 'finished';
  if (status === 'Currently Airing') return 'airing';
  if (status === 'Not yet aired') return 'upcoming';
  return 'unknown';
}
function mapAniListRelation(rel) {
  return { 
    id: rel.id, 
    title: rel.title?.english || rel.title?.romaji || rel.title?.native || 'Unknown', 
    type: rel.format || rel.type || 'Unknown',
    poster: rel.coverImage?.large || rel.coverImage?.medium
  };
}
function mapKitsuRelation(rel) {
  return { 
    id: rel.id, 
    title: rel.attributes?.canonicalTitle || '', 
    type: rel.type || '',
    poster: rel.attributes?.posterImage?.original || rel.attributes?.posterImage?.large
  };
}
function mapJikanRelation(rel) {
  return { 
    id: rel.mal_id, 
    title: rel.name, 
    type: rel.type,
    poster: rel.images?.jpg?.large_image_url || rel.images?.jpg?.image_url
  };
}
