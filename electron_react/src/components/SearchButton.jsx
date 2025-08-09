import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  searchAnime, 
  searchMovies, 
  searchTvShows, 
  batchSearchAnime,
  MediaTypes 
} from '../api/index.js';
import { TmdbApi } from '../api/providers/TmdbApi.js';
import useContentStore from '../config/initialData.js';

const SearchButton = () => {
  // Store
  const {
    getPages,
    getStatusesByPage,
    addContent,
    getContentsByPageAndStatus,
    initializeStore
  } = useContentStore();

  // Local state
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [selectedAlternatives, setSelectedAlternatives] = useState({ query: '', results: [] });
  const [allSearchResults, setAllSearchResults] = useState({}); // Store all results for alternatives
  
  // Dropdown states
  const [showDropdownFor, setShowDropdownFor] = useState(null);
  const [dropdownStatuses, setDropdownStatuses] = useState([]);
  
  // Toast states
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  const inputRef = useRef(null);

  // Initialize store on component mount
  useEffect(() => {
    initializeStore();
  }, [initializeStore]);

  useEffect(() => {
    if (showModal && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  }, [showModal]);

  // String similarity helper
  const calculateSimilarity = (str1, str2) => {
    if (!str1 || !str2) return 0;
    
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    // Simple Levenshtein distance approximation
    const editDistance = longer.length - shorter.length;
    const similarity = (longer.length - editDistance) / longer.length;
    
    // Bonus for exact matches or starts with
    const lowerLonger = longer.toLowerCase();
    const lowerShorter = shorter.toLowerCase();
    
    if (lowerLonger === lowerShorter) return 1.0;
    if (lowerLonger.startsWith(lowerShorter) || lowerShorter.startsWith(lowerLonger)) {
      return Math.max(similarity, 0.9);
    }
    
    return similarity;
  };

  // Arama fonksiyonu - gerçek API çağrıları
  const performSearch = useCallback(async (query, category = 'all') => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    setSearchError('');

    try {
      let results = [];

      if (isBulkMode) {
        // Toplu arama modu - Smart Result Limiting
        const queries = query.split('\n').filter(q => q.trim());
        if (queries.length === 0) {
          setSearchResults([]);
          return;
        }

        console.log(`Bulk search for ${queries.length} queries`);
        const bulkResults = [];
        const allResults = {}; // Store all results for alternatives

        if (category === 'all' || category === 'anime') {
          try {
            const batchResults = await batchSearchAnime(queries, { limit: 10 }); // Increased limit for alternatives
            
            // Her query için en iyi match'i bul ve tüm sonuçları sakla
            queries.forEach(singleQuery => {
              const queryResults = batchResults[singleQuery] || [];
              if (queryResults.length > 0) {
                // Store all results for this query
                allResults[singleQuery] = queryResults.map(item => ({
                  ...item,
                  confidence: calculateSimilarity(singleQuery.toLowerCase(), item.title.toLowerCase()),
                  originalQuery: singleQuery
                })).sort((a, b) => b.confidence - a.confidence);

                // Get best match for display
                const bestMatch = allResults[singleQuery][0];
                if (bestMatch.confidence > 0.3) {
                  bulkResults.push({
                    ...bestMatch,
                    hasAlternatives: allResults[singleQuery].length > 1,
                    alternativeCount: allResults[singleQuery].length - 1
                  });
                }
              }
            });
          } catch (error) {
            console.warn('Batch anime search failed:', error);
          }
        }

        // Film ve TV için optimize edilmiş sequential search
        const movieTvQueries = category === 'all' ? queries : 
                             category === 'movies' ? queries : 
                             category === 'series' ? queries : [];

        for (const singleQuery of movieTvQueries) {
          try {
            const searchPromises = [];
            
            if (category === 'all' || category === 'movies') {
              searchPromises.push(
                searchMovies(singleQuery.trim(), { limit: 10 }).catch(() => [])
              );
            }

            if (category === 'all' || category === 'series') {
              searchPromises.push(
                searchTvShows(singleQuery.trim(), { limit: 10 }).catch(() => [])
              );
            }

            const [movieResults = [], tvResults = []] = await Promise.all(searchPromises);
            const combinedResults = [...movieResults, ...tvResults];

            if (combinedResults.length > 0) {
              // Store all results for alternatives
              const scoredResults = combinedResults.map(item => ({
                ...item,
                confidence: calculateSimilarity(singleQuery.toLowerCase(), item.title.toLowerCase()),
                originalQuery: singleQuery
              })).sort((a, b) => b.confidence - a.confidence);

              // Merge with existing results for this query
              if (allResults[singleQuery]) {
                allResults[singleQuery] = [...allResults[singleQuery], ...scoredResults]
                  .sort((a, b) => b.confidence - a.confidence);
              } else {
                allResults[singleQuery] = scoredResults;
              }

              const bestMatch = allResults[singleQuery][0];
              if (bestMatch.confidence > 0.3) {
                // Remove existing result for this query if it exists
                const existingIndex = bulkResults.findIndex(r => r.originalQuery === singleQuery);
                if (existingIndex >= 0) {
                  bulkResults.splice(existingIndex, 1);
                }

                bulkResults.push({
                  ...bestMatch,
                  hasAlternatives: allResults[singleQuery].length > 1,
                  alternativeCount: allResults[singleQuery].length - 1
                });
              }
            }

            // Rate limiting
            await new Promise(resolve => setTimeout(resolve, 200));
          } catch (error) {
            console.warn(`Search failed for "${singleQuery}":`, error);
          }
        }

        // Store all results for alternatives modal
        setAllSearchResults(allResults);
        results = bulkResults;
      } else {
        // Normal arama modu
        const searchPromises = [];

        if (category === 'all' || category === 'anime') {
          searchPromises.push(
            searchAnime(query, { limit: 10 }).catch(error => {
              console.warn('Anime search failed:', error);
              return [];
            })
          );
        }

        if (category === 'all' || category === 'movies') {
          searchPromises.push(
            searchMovies(query, { limit: 10 }).catch(error => {
              console.warn('Movie search failed:', error);
              return [];
            })
          );
        }

        if (category === 'all' || category === 'series') {
          searchPromises.push(
            searchTvShows(query, { limit: 10 }).catch(error => {
              console.warn('TV search failed:', error);
              return [];
            })
          );
        }

        const searchResults = await Promise.all(searchPromises);
        results = searchResults.flat();
      }

      // Duplicates'i kaldır (ID ve title'a göre)
      const uniqueResults = results.filter((item, index, self) => 
        index === self.findIndex(t => t.id === item.id && t.title === item.title)
      );

      setSearchResults(uniqueResults);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchError('Search failed. Please try again.');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [isBulkMode]);

  // Debounced arama
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch(searchQuery, activeTab);
      } else {
        setSearchResults([]);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery, activeTab, isBulkMode, performSearch]);

  // Tab değiştiğinde arama sonuçlarını filtrele
  const getFilteredResults = () => {
    if (activeTab === 'all') {
      return searchResults;
    }
    
    const typeMap = {
      'movies': MediaTypes.MOVIE,
      'series': MediaTypes.TV,
      'anime': MediaTypes.ANIME
    };
    
    const targetType = typeMap[activeTab];
    return searchResults.filter(item => item.type === targetType);
  };
  const filteredResults = getFilteredResults();
  const hasSearchQuery = searchQuery.trim().length > 0;

  // Show alternatives modal
  const showAlternativesModal = (query) => {
    const alternatives = allSearchResults[query] || [];
    setSelectedAlternatives({
      query,
      results: alternatives
    });
    setShowAlternatives(true);
  };

  // Inline dropdown handler - yeni store sistemi
  const handleShowDropdown = useCallback((item, event) => {
    event.stopPropagation();
    
    // Get all pages and their statuses
    const pages = getPages();
    const availableStatuses = [];
    
    pages.forEach(page => {
      // Determine if this page is compatible with the item type
      const isCompatible = 
        (item.type === MediaTypes.MOVIE && page.id === 'film') ||
        (item.type === MediaTypes.TV && page.id === 'dizi') ||
        (item.type === MediaTypes.ANIME && page.id === 'anime') ||
        (activeTab === 'all' && ['film', 'dizi', 'anime'].includes(page.id));
        
      if (isCompatible) {
        const pageStatuses = getStatusesByPage(page.id);
        pageStatuses.forEach(status => {
          availableStatuses.push({
            ...status,
            pageName: page.title,
            displayName: `${page.title} - ${status.title}`
          });
        });
      }
    });
    
    console.log('Available statuses for item:', item.title, availableStatuses);
    
    setDropdownStatuses(availableStatuses);
    setShowDropdownFor(item.id);
  }, [activeTab, getPages, getStatusesByPage]);

  // Add directly to status from dropdown - yeni store sistemi
  const addDirectlyToStatus = async (item, status) => {
    // Duplicate check: same pageId, statusId, and providerId
    const existing = getContentsByPageAndStatus(status.pageId, status.id).find(c => {
      const providerKey = item.provider + 'Id';
      return c.apiData && c.apiData[providerKey] === item.id;
    });
    if (existing) {
      setToastMessage(`"${item.title}" zaten "${status.pageName} - ${status.title}" listesinde! ⚠️`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      setShowDropdownFor(null);
      return;
    }

    try {
      setToastMessage(`"${item.title}" ekleniyor... ⏳`);
      setShowToast(true);
      
      let detailedApiData = {
        title: item.title,
        originalTitle: item.originalTitle,
        overview: item.overview || item.description || '',
        poster: item.imageUrl,
        rating: item.score || item.rating || 0,
        releaseDate: item.year || item.releaseDate || '',
        genres: Array.isArray(item.genres)
          ? item.genres.map(g => typeof g === 'string' ? g : String(g))
          : (item.genre ? [String(item.genre)] : []),
        // Provider specific data
        [item.provider + 'Id']: item.id, // tmdbId, kitsuId, etc.
        provider: item.provider
      };

      // Film için TMDB'den detaylı bilgileri çek
      if (item.provider === 'tmdb' && status.pageId === 'film') {
        try {
          console.log('Fetching detailed movie data for:', item.title);
          const tmdbApi = new TmdbApi();
          const detailedData = await tmdbApi.getDetails(item.id, MediaTypes.MOVIE);
          
          // Detaylı bilgileri ekle
          detailedApiData = {
            ...detailedApiData,
            runtime: detailedData.duration, // duration olarak normalize ediliyor
            budget: detailedData.budget,
            revenue: detailedData.revenue,
            cast: detailedData.cast,
            director: detailedData.director,
            vote_average: detailedData.score // TMDB puanını kaydet
          };
          
          console.log('Detailed movie data fetched:', {
            title: item.title,
            runtime: detailedData.duration,
            budget: detailedData.budget,
            revenue: detailedData.revenue,
            castCount: detailedData.cast?.length,
            director: detailedData.director
          });
        } catch (error) {
          console.warn('Failed to fetch detailed movie data:', error);
          // Hata olursa temel bilgilerle devam et
        }
      }

      // Prepare content data for the new store structure
      const contentData = {
        pageId: status.pageId,
        statusId: status.id,
        apiData: detailedApiData,
        // Initialize seasons if TV/Anime
        seasons: (item.type === MediaTypes.TV || item.type === MediaTypes.ANIME) ? {} : undefined
      };

      console.log('Adding content to store:', { 
        pageId: status.pageId, 
        statusId: status.id, 
        title: item.title,
        hasDetailedData: !!detailedApiData.runtime
      });
      
      addContent(contentData);
      setToastMessage(`"${item.title}" added to "${status.pageName} - ${status.title}"! ✅`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      setShowDropdownFor(null);
    } catch (error) {
      console.error('Error adding content:', error);
      setToastMessage('Failed to add content! ❌');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowDropdownFor(null);
    };
    
    if (showDropdownFor) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showDropdownFor]);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowModal(false);
    }
  };

  return (
    <>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #d1d5db;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #9ca3af;
        }
      `}</style>
      {/* Professional Search Trigger */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-6 right-6 z-50 group"
        title="Search content"
      >
        <div className="relative">
          <div className="w-14 h-14 bg-gradient-to-br from-orange-500/90 to-red-500/90 backdrop-blur-xl border border-white/30 rounded-2xl shadow-2xl hover:shadow-orange-500/25 hover:scale-105 transition-all duration-300 flex items-center justify-center">
            <svg className="w-6 h-6 text-white drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div className="absolute -inset-2 bg-gradient-to-r from-orange-500/30 to-red-500/30 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
          <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
      </button>

      {/* Professional Search Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 z-50 flex items-start justify-center p-20"
          onKeyDown={handleKeyDown}
        >
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          
          {/* Modal */}
          <div className="relative w-full max-w-xl max-h-[85vh] bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/20 overflow-hidden flex flex-col">
            {/* Search Header */}
            <div className="relative p-4 pb-3 flex-shrink-0">
              <div className="flex items-center gap-3">
                {/* Horizontal Toggle Switch */}
                <button
                  onClick={() => setIsBulkMode(!isBulkMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                    isBulkMode ? 'bg-blue-500' : 'bg-orange-500'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-300 ${
                      isBulkMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  
                  {isBulkMode ? (
                    <textarea
                      ref={inputRef}
                      placeholder="Search multiple titles (one per line)&#10;Breaking Bad&#10;The Dark Knight&#10;Attack on Titan"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      rows={3}
                      className="w-full pl-10 pr-3 py-2.5 bg-gray-50/80 border border-gray-200/50 rounded-lg text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent resize-none font-medium text-sm transition-all"
                    />
                  ) : (
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder="Search movies, TV shows, anime..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 bg-gray-50/80 border border-gray-200/50 rounded-lg text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent font-medium text-sm transition-all"
                    />
                  )}
                  
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Category Pills */}
              <div className="flex gap-1.5 mt-3">
                {[
                  { key: 'all', label: 'All', icon: '⚡' },
                  { key: 'movies', label: 'Movies', icon: '🎬' },
                  { key: 'series', label: 'TV Shows', icon: '📺' },
                  { key: 'anime', label: 'Anime', icon: '🎌' }
                ].map(({ key, label, icon }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      activeTab === key
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                        : 'bg-gray-100/80 text-gray-700 hover:bg-gray-200/80 hover:shadow-sm'
                    }`}
                  >
                    <span className="text-xs">{icon}</span>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Results Section */}
            <div 
              className="flex-1 overflow-y-auto custom-scrollbar" 
              style={{ 
                maxHeight: hasSearchQuery && (isLoading || searchError || filteredResults.length > 0) 
                  ? 'calc(85vh - 120px)' 
                  : 'auto',
                minHeight: hasSearchQuery && filteredResults.length === 0 && !isLoading && !searchError 
                  ? '200px' 
                  : 'auto',
                scrollbarWidth: 'thin',
                scrollbarColor: '#d1d5db transparent'
              }}
            >
              {hasSearchQuery ? (
                <>
                  {isLoading ? (
                    <div className="px-4 py-6 text-center">
                      <div className="w-6 h-6 mx-auto mb-3 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                      <h3 className="text-gray-900 font-medium mb-1 text-sm">Searching...</h3>
                      <p className="text-gray-500 text-xs">Finding the best results for you</p>
                    </div>
                  ) : searchError ? (
                    <div className="px-4 py-6 text-center">
                      <div className="w-12 h-12 mx-auto mb-3 bg-red-100 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      </div>
                      <h3 className="text-gray-900 font-medium mb-1 text-sm">Search Error</h3>
                      <p className="text-gray-500 text-xs mb-3">{searchError}</p>
                      <button 
                        onClick={() => performSearch(searchQuery, activeTab)}
                        className="px-3 py-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-xs font-medium"
                      >
                        Try Again
                      </button>
                    </div>
                  ) : filteredResults.length > 0 ? (
                    <>
                      {/* Results Header */}
                      <div className="px-4 py-2 border-t border-gray-100 bg-gray-50/50">
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-600 font-medium">
                            {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''} found
                            {isBulkMode && (
                              <span className="ml-2 text-orange-600">
                                ({searchQuery.split('\n').filter(q => q.trim()).length} queries)
                              </span>
                            )}
                          </p>
                          {isBulkMode && filteredResults.length > 0 && (
                            <button className="text-xs px-2 py-1 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors font-medium">
                              Add All
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {/* Results List */}
                      <div className="divide-y divide-gray-100">
                        {filteredResults.map((item, index) => (
                          <div
                            key={`${item.id}-${item.provider}-${index}`}
                            className="px-4 py-3 hover:bg-gray-50/50 cursor-pointer transition-colors group"
                          >
                            <div className="flex items-center gap-3">
                              {/* Poster */}
                              <div className="w-8 h-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex-shrink-0 flex items-center justify-center shadow-sm overflow-hidden">
                                {item.imageUrl ? (
                                  <img 
                                    src={item.imageUrl} 
                                    alt={item.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      e.target.nextSibling.style.display = 'flex';
                                    }}
                                  />
                                ) : null}
                                <span className="text-xs text-gray-500 font-medium">
                                  {item.type === 'movie' ? '🎬' : 
                                   item.type === 'tv' ? '📺' : 
                                   item.type === 'anime' ? '🎌' : '🔍'}
                                </span>
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                {/* Bulk mode indicators */}
                                {isBulkMode && item.originalQuery && (
                                  <div className="flex items-center gap-1.5 mb-1">
                                    <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-medium">
                                      Query: {item.originalQuery}
                                    </span>
                                    {item.confidence && (
                                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                                        item.confidence > 0.8 ? 'bg-green-100 text-green-700' :
                                        item.confidence > 0.6 ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-orange-100 text-orange-700'
                                      }`}>
                                        {Math.round(item.confidence * 100)}%
                                      </span>
                                    )}
                                    {item.hasAlternatives && (
                                      <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
                                        +{item.alternativeCount}
                                      </span>
                                    )}
                                  </div>
                                )}
                                
                                <h3 className="font-semibold text-gray-900 text-sm mb-1 group-hover:text-orange-600 transition-colors leading-tight">
                                  {item.title}
                                  {item.originalTitle && item.originalTitle !== item.title && (
                                    <span className="ml-1 text-xs text-gray-500 font-normal">
                                      ({item.originalTitle})
                                    </span>
                                  )}
                                </h3>
                                <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                                  <span className="bg-gray-100 px-1.5 py-0.5 rounded-full font-medium capitalize">
                                    {item.type === 'movie' ? 'Film' : 
                                     item.type === 'tv' ? 'TV Show' : 
                                     item.type === 'anime' ? 'Anime' : item.type}
                                  </span>
                                  {item.year && <span>{item.year}</span>}
                                  {item.score && (
                                    <div className="flex items-center gap-0.5">
                                      <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                      </svg>
                                      <span className="font-medium">{typeof item.score === 'number' ? item.score.toFixed(1) : item.score}</span>
                                    </div>
                                  )}
                                  {item.provider && (
                                    <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full text-xs font-medium">
                                      {item.provider}
                                    </span>
                                  )}
                                </div>
                                {item.overview && (
                                  <p className="text-xs text-gray-600 overflow-hidden leading-relaxed" style={{
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical'
                                  }}>
                                    {item.overview.length > 80 ? `${item.overview.substring(0, 80)}...` : item.overview}
                                  </p>
                                )}
                              </div>
                              
                              <div className="flex flex-col gap-1">
                                <div className="relative">
                                  <button 
                                    className="opacity-0 group-hover:opacity-100 p-1.5 text-orange-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
                                    onClick={(e) => handleShowDropdown(item, e)}
                                    title="Add to list"
                                  >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                  </button>
                                  
                                  {/* Inline Dropdown */}
                                  {showDropdownFor === item.id && (
                                    <div className="absolute top-full right-0 mt-1 w-64 bg-white shadow-2xl rounded-lg border border-gray-200 z-50 overflow-hidden">
                                      <div className="p-2.5 bg-gradient-to-r from-orange-50 to-red-50 border-b border-gray-100">
                                        <h4 className="font-medium text-gray-900 text-xs">Add to List</h4>
                                        <p className="text-xs text-gray-600 mt-0.5 truncate">Choose a status for "{item.title}"</p>
                                      </div>
                                      
                                      <div className="max-h-48 overflow-y-auto custom-scrollbar" style={{
                                        scrollbarWidth: 'thin',
                                        scrollbarColor: '#d1d5db transparent'
                                      }}>
                                        {dropdownStatuses.length > 0 ? (
                                          <div className="divide-y divide-gray-100">
                                            {dropdownStatuses.map((status) => (
                                              <button
                                                key={`${status.pageId}-${status.id}`}
                                                className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                                                onClick={() => addDirectlyToStatus(item, status)}
                                              >
                                                <div className="flex items-center justify-between">
                                                  <div className="flex-1 min-w-0">
                                                    <h5 className="font-medium text-gray-900 text-sm truncate">
                                                      {status.title}
                                                    </h5>
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                      {status.pageName}
                                                    </p>
                                                  </div>
                                                  
                                                  <div className="flex items-center gap-2 ml-2">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                      status.pageId === 'film' ? 'bg-blue-100 text-blue-700' :
                                                      status.pageId === 'dizi' ? 'bg-green-100 text-green-700' :
                                                      status.pageId === 'anime' ? 'bg-purple-100 text-purple-700' :
                                                      'bg-gray-100 text-gray-700'
                                                    }`}>
                                                      {status.pageId === 'film' ? '🎬' :
                                                       status.pageId === 'dizi' ? '📺' :
                                                       status.pageId === 'anime' ? '🎌' : '⚡'}
                                                    </span>
                                                    
                                                    <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                    </svg>
                                                  </div>
                                                </div>
                                              </button>
                                            ))}
                                          </div>
                                        ) : (
                                          <div className="p-6 text-center">
                                            <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                                              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                              </svg>
                                            </div>
                                            <p className="text-sm text-gray-600 font-medium">No compatible lists</p>
                                            <p className="text-xs text-gray-500 mt-1">Create a list for this content type first</p>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                                
                                {isBulkMode && item.hasAlternatives && (
                                  <button 
                                    className="opacity-0 group-hover:opacity-100 p-2 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                    onClick={() => showAlternativesModal(item.originalQuery)}
                                    title={`Show ${item.alternativeCount} more results`}
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="px-4 py-6 text-center">
                      <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <h3 className="text-gray-900 font-medium mb-1 text-sm">No results found</h3>
                      <p className="text-gray-500 text-xs">Try different keywords or check your spelling</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="px-4 py-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-gray-900 font-medium mb-1 text-sm">Start searching</h3>
                  <p className="text-gray-500 text-xs mb-4">Find your favorite movies, TV shows, and anime</p>
                  
                  {/* Quick suggestions */}
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {[
                      { term: 'Breaking Bad', type: 'TV Show' },
                      { term: 'Inception', type: 'Movie' }, 
                      { term: 'Attack on Titan', type: 'Anime' },
                      { term: 'Naruto', type: 'Anime' },
                      { term: 'The Dark Knight', type: 'Movie' }
                    ].map(({ term, type }) => (
                      <button
                        key={term}
                        onClick={() => setSearchQuery(term)}
                        className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs rounded-full hover:bg-gray-200 transition-colors font-medium"
                        title={`Search for ${type}: ${term}`}
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Alternatives Modal */}
      {showAlternatives && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            onClick={() => setShowAlternatives(false)}
          />
          
          {/* Modal */}
          <div className="relative w-full max-w-3xl bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden max-h-[80vh]">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Alternative Results
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    All results for: <span className="font-medium text-blue-600">"{selectedAlternatives.query}"</span>
                  </p>
                </div>
                <button
                  onClick={() => setShowAlternatives(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Results */}
            <div className="overflow-y-auto max-h-96 custom-scrollbar" style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#d1d5db transparent'
            }}>
              {selectedAlternatives.results.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {selectedAlternatives.results.map((item, index) => (
                    <div
                      key={`alt-${item.id}-${item.provider}-${index}`}
                      className="px-6 py-4 hover:bg-gray-50/50 cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        {/* Poster */}
                        <div className="w-12 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex-shrink-0 flex items-center justify-center shadow-sm overflow-hidden">
                          {item.imageUrl ? (
                            <img 
                              src={item.imageUrl} 
                              alt={item.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <span className="text-xs text-gray-500 font-medium">
                            {item.type === 'movie' ? '🎬' : 
                             item.type === 'tv' ? '📺' : 
                             item.type === 'anime' ? '🎌' : '🔍'}
                          </span>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          {/* Confidence and Rank */}
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">
                              #{index + 1}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              item.confidence > 0.8 ? 'bg-green-100 text-green-700' :
                              item.confidence > 0.6 ? 'bg-yellow-100 text-yellow-700' :
                              'bg-orange-100 text-orange-700'
                            }`}>
                              {Math.round(item.confidence * 100)}% match
                            </span>
                            {index === 0 && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                                Best Match
                              </span>
                            )}
                          </div>

                          <h3 className="font-semibold text-gray-900 text-base mb-1 group-hover:text-blue-600 transition-colors">
                            {item.title}
                            {item.originalTitle && item.originalTitle !== item.title && (
                              <span className="ml-2 text-sm text-gray-500 font-normal">
                                ({item.originalTitle})
                              </span>
                            )}
                          </h3>
                          
                          <div className="flex items-center gap-3 text-sm text-gray-500 mb-2">
                            <span className="bg-gray-100 px-2 py-1 rounded-full font-medium capitalize">
                              {item.type === 'movie' ? 'Film' : 
                               item.type === 'tv' ? 'TV Show' : 
                               item.type === 'anime' ? 'Anime' : item.type}
                            </span>
                            {item.year && <span>{item.year}</span>}
                            {item.score && (
                              <div className="flex items-center gap-1">
                                <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                </svg>
                                <span className="font-medium">{typeof item.score === 'number' ? item.score.toFixed(1) : item.score}</span>
                              </div>
                            )}
                            {item.provider && (
                              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                                {item.provider}
                              </span>
                            )}
                          </div>

                          {item.overview && (
                            <p className="text-sm text-gray-600 overflow-hidden" style={{
                              display: '-webkit-box',
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: 'vertical'
                            }}>
                              {item.overview}
                            </p>
                          )}
                        </div>
                        
                        <div className="relative">
                          <button 
                            className="opacity-0 group-hover:opacity-100 p-2 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            onClick={(e) => handleShowDropdown(item, e)}
                            title="Add to list"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </button>
                          
                          {/* Same dropdown structure for alternatives modal */}
                          {showDropdownFor === item.id && (
                            <div className="absolute top-full right-0 mt-2 w-72 bg-white shadow-2xl rounded-xl border border-gray-200 z-50 overflow-hidden">
                              <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
                                <h4 className="font-medium text-gray-900 text-sm">Add to List</h4>
                                <p className="text-xs text-gray-600 mt-0.5">Choose a status for "{item.title}"</p>
                              </div>
                              
                              <div className="max-h-64 overflow-y-auto custom-scrollbar" style={{
                                scrollbarWidth: 'thin',
                                scrollbarColor: '#d1d5db transparent'
                              }}>
                                {dropdownStatuses.length > 0 ? (
                                  <div className="divide-y divide-gray-100">
                                    {dropdownStatuses.map((status) => (
                                      <button
                                        key={`${status.pageId}-${status.id}`}
                                        className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                                        onClick={() => addDirectlyToStatus(item, status)}
                                      >
                                        <div className="flex items-center justify-between">
                                          <div className="flex-1 min-w-0">
                                            <h5 className="font-medium text-gray-900 text-sm truncate">
                                              {status.title}
                                            </h5>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                              {status.pageName}
                                            </p>
                                          </div>
                                          
                                          <div className="flex items-center gap-2 ml-2">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                              status.pageId === 'film' ? 'bg-blue-100 text-blue-700' :
                                              status.pageId === 'dizi' ? 'bg-green-100 text-green-700' :
                                              status.pageId === 'anime' ? 'bg-purple-100 text-purple-700' :
                                              'bg-gray-100 text-gray-700'
                                            }`}>
                                              {status.pageId === 'film' ? '🎬' :
                                               status.pageId === 'dizi' ? '📺' :
                                               status.pageId === 'anime' ? '🎌' : '⚡'}
                                            </span>
                                            
                                            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                          </div>
                                        </div>
                                      </button>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="p-6 text-center">
                                    <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                      </svg>
                                    </div>
                                    <p className="text-sm text-gray-600 font-medium">No compatible lists</p>
                                    <p className="text-xs text-gray-500 mt-1">Create a list for this content type first</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-6 py-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-gray-900 font-medium mb-2">No alternatives found</h3>
                  <p className="text-gray-500 text-sm">No other results available for this query</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {selectedAlternatives.results.length} total result{selectedAlternatives.results.length !== 1 ? 's' : ''} found
                </p>
                <button
                  onClick={() => setShowAlternatives(false)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-6 right-6 z-70 transform transition-all duration-300 ease-in-out">
          <div className="bg-white/95 backdrop-blur-xl border border-green-200 rounded-xl shadow-2xl p-4 max-w-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 break-words">
                  {toastMessage}
                </p>
              </div>
              <button
                onClick={() => setShowToast(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-md transition-colors flex-shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SearchButton;
