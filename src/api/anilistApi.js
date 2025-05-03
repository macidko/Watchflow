/**
 * AniList API Service
 * https://anilist.gitbook.io/anilist-apiv2-docs/
 */
const axios = require('axios');

// AniList API endpoint
const API_URL = 'https://graphql.anilist.co';

// Anime arama sorgusu
const SEARCH_ANIME_QUERY = `
query ($search: String) {
  Page(page: 1, perPage: 10) {
    media(search: $search, type: ANIME, sort: POPULARITY_DESC) {
      id
      title {
        romaji
        english
      }
      coverImage {
        large
        medium
      }
      startDate {
        year
      }
      format
      episodes
      status
      averageScore
    }
  }
}
`;

// Birden fazla anime için batch arama sorgusu
const BATCH_SEARCH_ANIME_QUERY = `
query ($searches: [String!]!) {
  searches: Page(page: 1, perPage: 50) {
    media(search_in: $searches, type: ANIME, sort: POPULARITY_DESC) {
      id
      title {
        romaji
        english
      }
      coverImage {
        large
        medium
      }
      startDate {
        year
      }
      format
      episodes
      status
      averageScore
      synonyms
    }
  }
}
`;

// Anime detay sorgusu
const ANIME_DETAILS_QUERY = `
query ($id: Int) {
  Media(id: $id, type: ANIME) {
    id
    title {
      romaji
      english
      native
    }
    coverImage {
      large
      medium
    }
    bannerImage
    format
    episodes
    duration
    status
    season
    seasonYear
    description
    averageScore
    genres
    studios {
      nodes {
        name
      }
    }
    startDate {
      year
      month
      day
    }
    endDate {
      year
      month
      day
    }
  }
}
`;

// Anime ilişkilerini (sequel, prequel, vb.) getiren sorgu
const ANIME_RELATIONS_QUERY = `
query ($id: Int) {
  Media(id: $id, type: ANIME) {
    id
    relations {
      edges {
        id
        relationType
        node {
          id
          title {
            romaji
            english
          }
          format
          type
          status
          episodes
          coverImage {
            medium
          }
          startDate {
            year
          }
        }
      }
    }
  }
}
`;

/**
 * GraphQL sorgusu yap
 * @param {string} query GraphQL sorgusu
 * @param {Object} variables Sorgu değişkenleri
 * @returns {Promise} API yanıtı
 */
async function fetchGraphQL(query, variables = {}) {
  try {
    const response = await axios.post(API_URL, {
      query,
      variables
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('AniList API hatası:', error);
    throw error;
  }
}

/**
 * Anime ara
 * @param {string} searchText Arama metni
 * @returns {Promise<Array>} Anime sonuçları
 */
async function searchAnime(searchText) {
  try {
    const data = await fetchGraphQL(SEARCH_ANIME_QUERY, { search: searchText });
    
    if (!data || !data.data || !data.data.Page || !data.data.Page.media) {
      return [];
    }
    
    // AniList sonuçlarını uygulama formatına dönüştür
    return data.data.Page.media.map(item => ({
      id: item.id,
      title: item.title.english || item.title.romaji,
      original_title: item.title.romaji,
      type: 'anime',
      year: item.startDate.year,
      imageUrl: item.coverImage.large || item.coverImage.medium,
      score: item.averageScore ? item.averageScore / 10 : null, // 100 üzerinden 10 üzerine çevir
      status: item.status,
      episodes: item.episodes
    }));
  } catch (error) {
    console.error('AniList anime arama hatası:', error);
    throw error;
  }
}

/**
 * Anime detaylarını al
 * @param {number} animeId Anime ID
 * @returns {Promise<Object>} Anime detayları
 */
async function getAnimeDetails(animeId) {
  try {
    const data = await fetchGraphQL(ANIME_DETAILS_QUERY, { id: parseInt(animeId) });
    
    if (!data || !data.data || !data.data.Media) {
      throw new Error('Anime detayları alınamadı');
    }
    
    const anime = data.data.Media;
    
    // AniList verilerini uygulama formatına dönüştür
    return {
      id: anime.id,
      title: anime.title.english || anime.title.romaji,
      original_title: anime.title.romaji,
      native_title: anime.title.native,
      overview: anime.description,
      imageUrl: anime.coverImage.large || anime.coverImage.medium,
      backdrop_path: anime.bannerImage,
      year: anime.startDate.year,
      score: anime.averageScore ? anime.averageScore / 10 : null,
      status: anime.status,
      totalEpisodes: anime.episodes,
      genres: anime.genres
    };
  } catch (error) {
    console.error('AniList anime detay hatası:', error);
    throw error;
  }
}

/**
 * Anime sezon bilgilerini al
 * @param {number} animeId Anime ID
 * @returns {Promise<Object>} Sezon bilgileri
 */
async function getAnimeSeasons(animeId) {
  try {
    // AniList sezon yapısı farklı olduğundan, detay bilgisi kullanarak sezon bilgisi oluşturuyoruz
    const details = await getAnimeDetails(animeId);
    
    if (!details) {
      throw new Error('Anime detayları alınamadı');
    }
    
    // AniList doğrudan sezon bilgisi sağlamıyor, bu yüzden tek sezon varsayıyoruz
    // ve toplam bölüm sayısını kullanıyoruz
    const episodes = details.totalEpisodes || 0;
    
    const seasons = [{
      seasonNumber: 1,
      episodeCount: episodes,
      name: details.title
    }];
    
    return {
      id: animeId,
      title: details.title,
      totalSeasons: 1,
      seasons: seasons
    };
  } catch (error) {
    console.error('AniList sezon bilgisi hatası:', error);
    throw error;
  }
}

/**
 * Birden fazla anime için toplu arama yap
 * @param {string[]} searchTexts Aranacak başlıkların dizisi 
 * @returns {Promise<Object>} Her başlık için bulunan sonuçlar
 */
async function batchSearchAnime(searchTexts) {
  if (!searchTexts || !Array.isArray(searchTexts) || searchTexts.length === 0) {
    return {};
  }
  
  try {
    // En fazla 20 başlık için optimize edelim
    const batchSize = 20;
    const results = {};
    
    // Başlıkları batch_size kadar gruplara ayırıp, ayrı ayrı sorgulayalım
    for (let i = 0; i < searchTexts.length; i += batchSize) {
      const batch = searchTexts.slice(i, i + batchSize);
      
      // Her bir grup için GraphQL sorgusu hazırla
      const query = batch.map((_, idx) => `
        search${idx}: Page(page: 1, perPage: 5) {
          media(search: $search${idx}, type: ANIME, sort: POPULARITY_DESC) {
            id
            title {
              romaji
              english
            }
            coverImage {
              large
              medium
            }
            startDate {
              year
            }
            format
            episodes
            status
            averageScore
            synonyms
          }
        }
      `).join('\n');
      
      // Tüm sorguları birleştir
      const fullQuery = `query(${batch.map((_, idx) => `$search${idx}: String`).join(', ')}) {
        ${query}
      }`;
      
      // Variables objesini hazırla
      const variables = {};
      batch.forEach((searchText, idx) => {
        variables[`search${idx}`] = searchText;
      });
      
      // GraphQL sorgusu yap
      const data = await fetchGraphQL(fullQuery, variables);
      
      if (!data || !data.data) {
        console.error("AniList batch search hatası: Beklenmeyen yanıt formatı");
        continue;
      }
      
      // Her başlık için sonuçları işle
      batch.forEach((searchText, idx) => {
        const key = `search${idx}`;
        if (data.data[key] && data.data[key].media) {
          // Sonuçları normalize et
          const normalizedResults = data.data[key].media.map(item => ({
            id: item.id,
            title: item.title.english || item.title.romaji,
            original_title: item.title.romaji,
            type: 'anime',
            year: item.startDate?.year,
            imageUrl: item.coverImage?.large || item.coverImage?.medium,
            score: item.averageScore ? item.averageScore / 10 : null,
            status: item.status,
            episodes: item.episodes,
            synonyms: item.synonyms || []
          }));
          
          // Her başlık için en iyi eşleşmeyi bul
          const bestMatch = findBestMatch(searchText, normalizedResults);
          
          // Başlığı key olarak kullan ve sonuçları ekle
          results[searchText] = bestMatch ? [bestMatch] : [];
        } else {
          results[searchText] = [];
        }
      });
      
      // Rate limit aşımını önlemek için bekle
      if (i + batchSize < searchTexts.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  } catch (error) {
    console.error('AniList batch search hatası:', error);
    throw error;
  }
}

/**
 * Bir başlık için en iyi eşleşmeyi bul
 * @param {string} searchText Aranan başlık
 * @param {Array} results Arama sonuçları
 * @returns {Object|null} En iyi eşleşen sonuç veya null
 */
function findBestMatch(searchText, results) {
  if (!results || results.length === 0) return null;
  
  const normalizedSearchText = searchText.toLowerCase().trim();
  
  // Tam eşleşme kontrolü
  for (const result of results) {
    const title = (result.title || "").toLowerCase().trim();
    const originalTitle = (result.original_title || "").toLowerCase().trim();
    
    if (title === normalizedSearchText || originalTitle === normalizedSearchText) {
      return result;
    }
    
    // Synonyms içinde de kontrol et
    if (result.synonyms && Array.isArray(result.synonyms)) {
      for (const synonym of result.synonyms) {
        if (synonym.toLowerCase().trim() === normalizedSearchText) {
          return result;
        }
      }
    }
  }
  
  // En iyi eşleşmeyi bul (ilk sonuç en popüler olduğu için genelde en iyi eşleşmedir)
  return results[0];
}

// AniList'ten anime ilişkilerini (sequel, prequel vb.) getir
async function getAnimeRelations(animeId) {
  try {
    const data = await fetchGraphQL(ANIME_RELATIONS_QUERY, { id: parseInt(animeId) });
    
    if (!data || !data.data || !data.data.Media || !data.data.Media.relations) {
      console.warn('İlişkili anime bulunamadı');
      return [];
    }
    
    const relations = data.data.Media.relations.edges;
    
    // İlişkili animeleri gruplandır
    const groupedRelations = relations.reduce((groups, relation) => {
      // İlişki tipini belirle
      const relationType = relation.relationType;
      
      // Anime verilerini hazırla
      const nodeData = relation.node;
      
      if (nodeData.type === 'ANIME') {
        const anime = {
          id: nodeData.id,
          title: nodeData.title.english || nodeData.title.romaji,
          type: 'anime',
          format: nodeData.format,
          episodes: nodeData.episodes,
          year: nodeData.startDate?.year,
          imageUrl: nodeData.coverImage?.medium
        };
        
        // İlişki grubuna ekle
        if (!groups[relationType]) {
          groups[relationType] = [];
        }
        groups[relationType].push(anime);
      }
      
      return groups;
    }, {});
    
    // Format değiştirip dizi olarak döndür
    const result = Object.entries(groupedRelations).map(([relation, entries]) => ({
      relation,
      entries
    }));
    
    return result;
  } catch (error) {
    console.error('AniList ilişkili anime getirme hatası:', error);
    throw error;
  }
}

module.exports = {
  searchAnime,
  getAnimeDetails,
  getAnimeSeasons,
  batchSearchAnime,
  getAnimeRelations
}; 