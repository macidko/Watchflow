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
      const backdrop = r.backdrop_path ? `https://image.tmdb.org/t/p/w1280${r.backdrop_path}` : null;
      
      // **KRİTİK FIX**: TÜM detaylı bilgileri ekle
      if (id) {
        related.push({ 
          id, 
          title,
          originalTitle: r.original_title || r.original_name,
          type: media_type,        // ✅ EKSTRA: 'type' alanı ekle (filtreleme için)
          media_type,              // ✅ TMDB'nin orijinal alanı
          poster,
          backdrop,
          // **EKSTRA BİLGİLER**
          overview: r.overview || '',
          rating: r.vote_average || 0,
          voteCount: r.vote_count || 0,
          popularity: r.popularity || 0,
          releaseDate: r.release_date || r.first_air_date || '',
          year: (r.release_date || r.first_air_date || '').split('-')[0] || '',
          genres: r.genre_ids || r.genres || [],
          adult: r.adult || false,
          // Provider bilgisi
          tmdbId: id,
          provider: 'tmdb'
        });
      }
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
    
    // **KRİTİK FIX**: Relations için detaylı mapping
    const mapAniListRelationDetailed = (edge) => {
      const node = edge.node;
      return {
        id: node.id,
        title: node.title?.english || node.title?.romaji || node.title?.native || 'Unknown',
        originalTitle: node.title?.romaji || node.title?.native,
        type: node.format || node.type || 'anime',
        poster: node.coverImage?.large || node.coverImage?.medium,
        backdrop: node.bannerImage || node.coverImage?.extraLarge,
        // **EKSTRA BİLGİLER**
        overview: node.description || '',
        rating: node.averageScore ? node.averageScore / 10 : 0,
        popularity: node.popularity || 0,
        year: node.startDate?.year || node.seasonYear || '',
        releaseDate: node.startDate ? `${node.startDate.year}-${String(node.startDate.month || 1).padStart(2, '0')}-${String(node.startDate.day || 1).padStart(2, '0')}` : '',
        genres: node.genres || [],
        episodes: node.episodes,
        status: node.status,
        // Provider bilgisi
        anilistId: node.id,
        provider: 'anilist'
      };
    };
    
    return {
      status: mapAniListStatus(raw.status),
      nextSeason: null, // AniList'te sezon bilgisi yok
      nextEpisode,
      prequel: (raw.relations?.edges || []).filter(r => r.relationType === 'PREQUEL').map(mapAniListRelationDetailed),
      sequel: (raw.relations?.edges || []).filter(r => r.relationType === 'SEQUEL').map(mapAniListRelationDetailed),
      // **KRİTİK FIX**: Diğer relation type'ları da ekle
      related: (raw.relations?.edges || [])
        .filter(r => !['PREQUEL', 'SEQUEL'].includes(r.relationType))
        .map(mapAniListRelationDetailed),
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
    
    // **KRİTİK FIX**: Kitsu relations için detaylı mapping
    const mapKitsuRelationDetailed = (rel) => {
      const attrs = rel.attributes || {};
      return {
        id: rel.id,
        title: attrs.canonicalTitle || attrs.titles?.en || '',
        originalTitle: attrs.titles?.en_jp || attrs.titles?.ja_jp,
        type: rel.type || 'anime',
        poster: attrs.posterImage?.original || attrs.posterImage?.large || attrs.posterImage?.medium,
        backdrop: attrs.coverImage?.original || attrs.coverImage?.large,
        // **EKSTRA BİLGİLER**
        overview: attrs.synopsis || attrs.description || '',
        rating: attrs.averageRating ? parseFloat(attrs.averageRating) / 10 : 0,
        popularity: attrs.popularityRank || 0,
        year: attrs.startDate ? attrs.startDate.split('-')[0] : '',
        releaseDate: attrs.startDate || '',
        genres: [], // Kitsu'da genres ayrı endpoint'te
        episodes: attrs.episodeCount,
        status: attrs.status,
        // Provider bilgisi
        kitsuId: rel.id,
        provider: 'kitsu'
      };
    };
    
    return {
      status: mapKitsuStatus(raw.status),
      nextSeason: null,
      nextEpisode,
      prequel: raw.relationships?.prequel?.data ? [mapKitsuRelationDetailed(raw.relationships.prequel.data)] : [],
      sequel: raw.relationships?.sequel?.data ? [mapKitsuRelationDetailed(raw.relationships.sequel.data)] : [],
      // **KRİTİK FIX**: Diğer relations da ekle
      related: [],
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
    
    // **KRİTİK FIX**: Jikan relations için detaylı mapping
    const mapJikanRelationDetailed = (rel) => {
      return {
        id: rel.mal_id,
        title: rel.name || rel.title,
        originalTitle: rel.title_japanese || rel.title,
        type: rel.type || 'anime',
        poster: rel.images?.jpg?.large_image_url || rel.images?.jpg?.image_url,
        backdrop: rel.images?.jpg?.large_image_url,
        // **EKSTRA BİLGİLER**
        overview: rel.synopsis || '',
        rating: rel.score || 0,
        popularity: rel.popularity || 0,
        year: rel.year || (rel.aired?.from ? new Date(rel.aired.from).getFullYear() : ''),
        releaseDate: rel.aired?.from || '',
        genres: rel.genres?.map(g => g.name) || [],
        episodes: rel.episodes,
        status: rel.status,
        // Provider bilgisi
        jikanId: rel.mal_id,
        malId: rel.mal_id,
        provider: 'jikan'
      };
    };
    
    return {
      status: mapJikanStatus(raw.status),
      nextSeason: null,
      nextEpisode,
      prequel: raw.related?.Prequel ? raw.related.Prequel.map(mapJikanRelationDetailed) : [],
      sequel: raw.related?.Sequel ? raw.related.Sequel.map(mapJikanRelationDetailed) : [],
      // **KRİTİK FIX**: Diğer relation type'ları da ekle
      related: Object.keys(raw.related || {})
        .filter(key => !['Prequel', 'Sequel'].includes(key))
        .flatMap(key => (raw.related[key] || []).map(mapJikanRelationDetailed)),
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
