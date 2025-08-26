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
import { validateSearchQuery } from '../utils/validation.js';
import { t } from '../i18n';

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
  const [selectedAlternatives, setSelectedAlternatives] = useState({ query: '', results: [], originalIndex: null });
  const [allSearchResults, setAllSearchResults] = useState({}); // Store all results for alternatives
  
  // Dropdown states
  const [showDropdownFor, setShowDropdownFor] = useState(null);
  const [dropdownStatuses, setDropdownStatuses] = useState([]);
  const [showAddAllDropdown, setShowAddAllDropdown] = useState(false);
  
  // Toast states
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  const inputRef = useRef(null);
  const modalRef = useRef(null);

  // Focus trap ve ESC ile kapama (hook sadece fonksiyonun başında ve koşulsuz)
  useEffect(() => {
    if (!showModal) return;
    const focusableSelectors = [
      'button', 'a[href]', 'input', 'select', 'textarea', '[tabindex]:not([tabindex="-1"])'
    ];
    const node = modalRef.current;
    if (!node) return;
    // İlk odaklanabilir elemana odaklan
    const focusables = node.querySelectorAll(focusableSelectors.join(','));
    if (focusables.length) focusables[0].focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setShowModal(false);
      }
      if (e.key === 'Tab') {
        // Focus trap
        const focusable = Array.from(node.querySelectorAll(focusableSelectors.join(',')));
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };
    node.addEventListener('keydown', handleKeyDown);
    return () => node.removeEventListener('keydown', handleKeyDown);
  }, [showModal]);

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
    try {
      const validatedQuery = validateSearchQuery(query);
      
      setIsLoading(true);
      setSearchError('');

      let results = [];

      if (isBulkMode) {
        // Toplu arama modu - Smart Result Limiting
        const queries = validatedQuery.split('\n').filter(q => q.trim());
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
      // Check if this is a validation error
      if (error.message === 'Search query cannot be empty') {
        setSearchResults([]);
        return;
      }
      
      if (error.message.includes('Search query')) {
        setSearchError(error.message);
        setSearchResults([]);
        setIsLoading(false);
        return;
      }
      
      console.error('Search failed:', error);
      setSearchError('Search failed. Please try again.');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [isBulkMode]);

  // Manual arama fonksiyonu
  const handleManualSearch = () => {
    if (searchQuery.trim()) {
      performSearch(searchQuery, activeTab);
    } else {
      setSearchResults([]);
    }
  };

  // Enter tuşu ile arama
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleManualSearch();
    }
  };

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
  const showAlternativesModal = (query, originalIndex = null) => {
    const alternatives = allSearchResults[query] || [];
    setSelectedAlternatives({
      query,
      results: alternatives,
      originalIndex
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

  // Bulk add all results to selected status - open dropdown
  const handleAddAll = (event) => {
    if (!filteredResults.length) return;
    
    event.stopPropagation();
    
    // Get all available statuses from all pages
    const allPages = getPages();
    const availableStatuses = [];
    
    allPages.forEach(page => {
      const statuses = getStatusesByPage(page.id) || [];
      statuses.forEach(status => {
        availableStatuses.push({
          ...status,
          pageId: page.id,
          pageName: page.title
        });
      });
    });
    
    setDropdownStatuses(availableStatuses);
    setShowAddAllDropdown(true);
  };

  // Add all results to selected status
  const addAllToStatus = async (status) => {
    if (!filteredResults.length) return;

    let addedCount = 0;
    for (const item of filteredResults) {
      // Duplicate check
      const existing = getContentsByPageAndStatus(status.pageId, status.id).find(c => {
        const providerKey = item.provider + 'Id';
        return c.apiData && c.apiData[providerKey] === item.id;
      });
      
      if (!existing) {
        try {
          const contentData = {
            pageId: status.pageId,
            statusId: status.id,
            apiData: {
              title: item.title,
              originalTitle: item.originalTitle,
              overview: item.overview || item.description || '',
              poster: item.imageUrl,
              rating: item.score || item.rating || 0,
              releaseDate: item.year || item.releaseDate || '',
              genres: Array.isArray(item.genres)
                ? item.genres.map(g => typeof g === 'string' ? g : String(g))
                : (item.genre ? [String(item.genre)] : []),
              [item.provider + 'Id']: item.id,
              provider: item.provider
            }
          };
          addContent(contentData);
          addedCount++;
        } catch (error) {
          console.error('Error adding content:', error);
        }
      }
    }
    
    setToastMessage(`${addedCount} içerik "${status.title}" listesine eklendi! ✅`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
    setShowAddAllDropdown(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowDropdownFor(null);
      setShowAddAllDropdown(false);
    };
    
    if (showDropdownFor || showAddAllDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showDropdownFor, showAddAllDropdown]);

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
          background-color: var(--secondary-text);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: var(--border-color-hover);
        }
      `}</style>
      {/* Minimal Dark Search Trigger */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold transition-all duration-300 ease-out shadow-xl border flex items-center gap-2 hover:scale-105 group focus-visible:outline-none focus-visible:ring-2"
        style={{ color: 'var(--primary-text)', background: 'var(--accent-color)', borderColor: 'color-mix(in srgb, var(--accent-color) 30%, transparent)', boxShadow: '0 4px 24px 0 color-mix(in srgb, var(--accent-color) 15%, transparent)' }}
        title={t('components.search.searchButton')}
      >
  <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-label={t('components.search.searchButton')} focusable="false">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span>Ara</span>
      </button>

      {/* Professional Search Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-20"
          tabIndex={-1}
        >
          {/* Backdrop */}
          <div 
            className="absolute inset-0 backdrop-blur-sm"
            style={{ background: 'var(--overlay-bg)' }}
            onClick={() => setShowModal(false)}
          />
          {/* Modal */}
          <div ref={modalRef} className="relative w-full max-w-xl max-h-[85vh] backdrop-blur-xl rounded-xl shadow-2xl border overflow-hidden flex flex-col" tabIndex={0} style={{ background: 'var(--secondary-bg-transparent)', borderColor: 'var(--border-color)' }}>

            {/* Search Header */}
            <div className="relative p-4 sm:p-5 pb-3 flex-shrink-0" style={{ background: 'var(--hover-bg)', borderBottomColor: 'var(--border-color)' }}>
              <div className="flex items-center gap-3">
                {/* Horizontal Toggle Switch */}
                <button
                  onClick={() => setIsBulkMode(!isBulkMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus-visible:outline-none`}
                  style={{ background: isBulkMode ? 'var(--accent-color)' : 'var(--hover-bg)' }}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full shadow transition-transform duration-300 ${
                      isBulkMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                    style={{ background: 'var(--primary-text)' }}
                  />
                </button>
                
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <svg className="w-4 h-4" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-label="Arama" focusable="false">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  
                  {isBulkMode ? (
                    <textarea
                      ref={inputRef}
                      placeholder="Search multiple titles (one per line)&#10;Breaking Bad&#10;The Dark Knight&#10;Attack on Titan"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={handleKeyDown}
                      rows={3}
                      className="w-full pl-10 pr-12 py-2.5 rounded-lg focus:outline-none resize-none font-normal text-sm transition-all"
                      style={{ background: 'var(--input-bg)', borderColor: 'var(--border-color)', color: 'var(--primary-text)' }}
                    />
                  ) : (
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder="Search movies, TV shows, anime..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="w-full pl-10 pr-12 py-2.5 rounded-lg focus:outline-none font-normal text-sm transition-all"
                      style={{ background: 'var(--input-bg)', borderColor: 'var(--border-color)', color: 'var(--primary-text)' }}
                    />
                  )}
                  
                  {/* Arama ve Temizle Butonları */}
                  <div className="absolute inset-y-0 right-1 flex items-center gap-1">
                    {searchQuery && (
                      <button
                        onClick={handleManualSearch}
                        disabled={isLoading}
                        className="p-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 rounded"
                        style={{ color: 'var(--accent-color)' }}
                        title={t('common.search')}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-label={t('common.search')} focusable="false">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </button>
                    )}
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="p-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 rounded"
                        style={{ color: 'var(--secondary-text)' }}
                        title="Temizle"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-label="Temizle" focusable="false">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2"
                  style={{ color: 'var(--secondary-text)' }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-label="Kapat" focusable="false">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Category Pills */}
              <div className="flex gap-1.5 mt-2 sm:mt-3">
        {[ 
                  { key: 'all', label: 'All', icon: '⚡' },
                  { key: 'movies', label: 'Movies', icon: '🎬' },
                  { key: 'series', label: 'TV Shows', icon: '📺' },
                  { key: 'anime', label: 'Anime', icon: '🎌' }
                ].map(({ key, label, icon }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all focus-visible:outline-none`}
          style={ activeTab === key ? { background: 'linear-gradient(to right, var(--accent-color), var(--hover-color))', color: 'var(--primary-text)', boxShadow: '0 8px 24px rgba(0,0,0,0.25)' } : { background: 'var(--dropdown-bg)', color: 'var(--secondary-text)' } }
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
                  ? '180px' 
                  : 'auto',
                scrollbarWidth: 'thin',
          scrollbarColor: 'var(--text-muted) transparent'
              }}
            >
              {hasSearchQuery ? (
                <>
                  {isLoading ? (
                      <div className="px-4 py-6 text-center">
                        <div className="w-6 h-6 mx-auto mb-3 rounded-full animate-spin" style={{ border: '2px solid var(--accent-color)', borderTopColor: 'transparent', width: '24px', height: '24px' }}></div>
                        <h3 style={{ color: 'var(--primary-text)', fontWeight: 500, marginBottom: '0.25rem', fontSize: '0.875rem' }}>Searching...</h3>
                        <p style={{ color: 'var(--secondary-text)', fontSize: '0.75rem' }}>Finding the best results for you</p>
                      </div>
                  ) : searchError ? (
                      <div className="px-4 py-6 text-center">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ background: 'rgba(139, 0, 0, 0.25)' }}>
                          <svg className="w-6 h-6" style={{ color: 'var(--success-color)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                        </div>
                        <h3 style={{ color: 'var(--primary-text)', fontWeight: 500, marginBottom: '0.25rem', fontSize: '0.875rem' }}>Search Error</h3>
                        <p style={{ color: 'var(--secondary-text)', fontSize: '0.75rem', marginBottom: '0.75rem' }}>{searchError}</p>
                        <button 
                          onClick={() => performSearch(searchQuery, activeTab)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium focus-visible:outline-none"
                          style={{ background: 'var(--accent-color)', color: 'var(--primary-text)' }}
                        >
                          Try Again
                        </button>
                      </div>
                  ) : filteredResults.length > 0 ? (
                    <>
                      {/* Results Header */}
                      <div className="px-4 py-2" style={{ borderTop: '1px solid var(--border-color)', background: 'var(--hover-bg)' }}>
                        <div className="flex items-center justify-between">
                          <p className="text-xs" style={{ color: 'var(--secondary-text)', fontWeight: 500 }}>
                            {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''} found
                            {isBulkMode && (
                              <span className="ml-2" style={{ color: 'var(--hover-color)' }}>
                                ({searchQuery.split('\n').filter(q => q.trim()).length} queries)
                              </span>
                            )}
                          </p>
                          {isBulkMode && filteredResults.length > 0 && (
                            <div className="relative">
                              <button 
                                onClick={handleAddAll}
                                className="text-xs px-2 py-1 rounded-full font-medium focus-visible:outline-none"
                                style={{ background: 'var(--success-color)', color: 'var(--primary-text)' }}
                              >
                                Add All
                              </button>
                              
                              {/* Add All Dropdown */}
                              {showAddAllDropdown && (
                                <div className="absolute top-full right-0 mt-1 w-64 rounded-lg z-50 overflow-hidden" style={{ background: 'var(--secondary-bg)', boxShadow: 'var(--dropdown-shadow)', border: '1px solid var(--border-color)' }}>
                                  <div className="p-2.5" style={{ background: 'var(--secondary-bg)', borderBottom: '1px solid var(--border-color)' }}>
                                    <h4 style={{ color: 'var(--primary-text)', fontWeight: 600, fontSize: '0.75rem' }}>Tüm İçerikleri Ekle</h4>
                                    <p style={{ color: 'var(--secondary-text)', fontSize: '0.75rem', marginTop: '0.125rem' }}>{filteredResults.length} içerik için liste seçin</p>
                                  </div>
                                  
                                      <div className="max-h-48 overflow-y-auto custom-scrollbar">
                                    {dropdownStatuses.length > 0 ? (
                                      <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
                                        {dropdownStatuses.map((status) => (
                                          <button
                                            key={`${status.pageId}-${status.id}`}
                                            className="w-full px-4 py-3 text-left transition-colors focus-visible:outline-none"
                                            onClick={() => addAllToStatus(status)}
                                          >
                                            <div className="flex items-center justify-between">
                                              <div className="flex-1 min-w-0">
                                                <h5 className="font-medium text-sm truncate" style={{ color: 'var(--primary-text)' }}>
                                                  {status.title}
                                                </h5>
                                                <p className="text-xs mt-0.5" style={{ color: 'var(--secondary-text)' }}>
                                                  {status.pageName}
                                                </p>
                                              </div>
                                              
                                              <div className="flex items-center gap-2 ml-2">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium`} style={{ background: 'var(--tag-bg)', color: 'var(--secondary-text)' }}>
                                                  {status.pageName}
                                                </span>
                                              </div>
                                            </div>
                                          </button>
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="p-4 text-center text-sm" style={{ color: 'var(--secondary-text)' }}>
                                        Uygun liste bulunamadı
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Results List */}
                      <div className="divide-y divide-gray-700/50">
                        {filteredResults.map((item, index) => (
                          <div
                            key={`${item.id}-${item.provider}-${index}`}
                            className="px-4 py-3 cursor-pointer transition-colors group"
                            style={{ transition: 'background 0.2s ease' }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--hover-bg)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            <div className="flex items-center gap-3">
                              {/* Poster */}
                              <div className="w-8 h-12 rounded-lg flex-shrink-0 flex items-center justify-center shadow-sm overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(40,40,40,1), rgba(30,30,30,1))' }}>
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
                                <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                                  {item.type === 'movie' ? '🎬' : 
                                   item.type === 'tv' ? '📺' : 
                                   item.type === 'anime' ? '🎌' : '🔍'}
                                </span>
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                {/* Bulk mode indicators */}
                                {isBulkMode && item.originalQuery && (
                                  <div className="flex items-center gap-1.5 mb-1">
                                    <span className="text-xs px-1.5 py-0.5 rounded-full font-medium" style={{ background: 'rgba(10, 25, 45, 0.6)', color: 'var(--secondary-text)' }}>
                                      Query: {item.originalQuery}
                                    </span>
                                    {item.confidence && (
                                      <span className="text-xs px-1.5 py-0.5 rounded-full font-medium" style={{ background: item.confidence > 0.8 ? 'rgba(76,175,80,0.15)' : item.confidence > 0.6 ? 'rgba(255,193,7,0.12)' : 'rgba(255,140,0,0.12)', color: item.confidence > 0.8 ? 'var(--success-color)' : item.confidence > 0.6 ? 'var(--hover-color)' : 'var(--accent-color)' }}>
                                        {Math.round(item.confidence * 100)}%
                                      </span>
                                    )}
                                    {item.hasAlternatives && (
                                      <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: 'var(--tag-bg)', color: 'var(--secondary-text)' }}>
                                          +{item.alternativeCount}
                                        </span>
                                    )}
                                  </div>
                                )}
                                
                                <h3 className="font-semibold text-sm mb-1 leading-tight" style={{ color: 'var(--primary-text)' }}>
                                  {item.title}
                                  {item.originalTitle && item.originalTitle !== item.title && (
                                    <span className="ml-1 text-xs font-normal" style={{ color: 'var(--secondary-text)' }}>
                                      ({item.originalTitle})
                                    </span>
                                  )}
                                </h3>
                                <div className="flex items-center gap-2 text-xs mb-1" style={{ color: 'var(--secondary-text)' }}>
                                  <span className="px-1.5 py-0.5 rounded-full font-medium capitalize" style={{ background: 'var(--tag-bg)', color: 'var(--secondary-text)' }}>
                                    {item.type === 'movie' ? 'Film' : 
                                     item.type === 'tv' ? 'TV Show' : 
                                     item.type === 'anime' ? 'Anime' : item.type}
                                  </span>
                                  {item.year && <span>{item.year}</span>}
                                  {item.score && (
                                    <div className="flex items-center gap-0.5">
                                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--star-color)' }}>
                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                      </svg>
                                      <span className="font-medium">{typeof item.score === 'number' ? item.score.toFixed(1) : item.score}</span>
                                    </div>
                                  )}
                                  {item.provider && (
                                    <span className="px-1.5 py-0.5 rounded-full text-xs font-medium" style={{ background: 'rgba(10,25,45,0.6)', color: 'var(--secondary-text)' }}>
                                      {item.provider}
                                    </span>
                                  )}
                                </div>
                                {item.overview && (
                                  <p className="text-xs overflow-hidden leading-relaxed" style={{
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical'
                                  }}>
                                    {item.overview.length > 80 ? `${item.overview.substring(0, 80)}...` : item.overview}
                                  </p>
                                )}
                              </div>
                              
              <div className="flex flex-col gap-1">
                {isBulkMode ? (
                  /* Bulk Mode - Dropdown gibi single search */
                  <div className="relative">
                    <button 
                      className="p-2 rounded-lg transition-colors focus-visible:outline-none"
                      style={{ color: 'var(--accent-color)' }}
                      onClick={(e) => handleShowDropdown(item, e)}
                      title="Listeye ekle"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-label="Listeye ekle" focusable="false">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                    
                    {/* Dropdown aynı single search gibi */}
                    {showDropdownFor === item.id && (
                      <div className="absolute top-full right-0 mt-2 w-72 rounded-xl z-50 overflow-hidden" style={{ background: 'var(--secondary-bg)', boxShadow: 'var(--dropdown-shadow)', border: '1px solid var(--border-color)' }}>
                        <div className="p-3" style={{ background: 'var(--secondary-bg)', borderBottom: '1px solid var(--border-color)' }}>
                          <h4 className="font-semibold text-sm" style={{ color: 'var(--primary-text)' }}>Listeye Ekle</h4>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--secondary-text)' }}>&quot;{item.title}&quot; için bir durum seçin</p>
                        </div>
                        
                        <div className="max-h-64 overflow-y-auto custom-scrollbar" style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--text-muted) transparent' }}>
                          {dropdownStatuses.length > 0 ? (
                            <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
                              {dropdownStatuses.map((status) => (
                                <button
                                  key={`${status.pageId}-${status.id}`}
                                  className="w-full px-4 py-3 text-left transition-colors focus-visible:outline-none"
                                  onClick={() => addDirectlyToStatus(item, status)}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                      <h5 className="font-medium text-sm truncate" style={{ color: 'var(--primary-text)' }}>
                                        {status.title}
                                      </h5>
                                      <p className="text-xs mt-0.5" style={{ color: 'var(--secondary-text)' }}>
                                        {status.pageName}
                                      </p>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 ml-2">
                                      <span className={`px-2 py-1 rounded-full text-xs font-medium`} style={{ background: 'var(--tag-bg)', color: 'var(--secondary-text)' }}>
                                        {status.pageId === 'film' ? '🎬' :
                                         status.pageId === 'dizi' ? '📺' :
                                         status.pageId === 'anime' ? '🎌' : '⚡'}
                                      </span>
                                      
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--secondary-text)' }}>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                      </svg>
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="p-6 text-center">
                              <div className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ background: 'var(--card-bg)' }}>
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-label="Uyarı" focusable="false" style={{ color: 'var(--secondary-text)' }}>
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                              </div>
                              <p className="text-sm font-normal" style={{ color: 'var(--secondary-text)' }}>Uygun liste yok</p>
                              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Bu içerik türü için önce bir liste oluşturun</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Normal Mode - Dropdown */
                  <div className="relative">
                    <button 
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all focus-visible:outline-none"
                      style={{ color: 'var(--accent-color)' }}
                      onClick={(e) => handleShowDropdown(item, e)}
                      title="Add to list"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                    {/* Inline Dropdown */}
                                  {showDropdownFor === item.id && (
                                    <div className="absolute top-full right-0 mt-1 w-64 rounded-lg z-50 overflow-hidden" style={{ background: 'var(--secondary-bg)', boxShadow: 'var(--dropdown-shadow)', border: '1px solid var(--border-color)' }}>
                                      <div className="p-2.5" style={{ background: 'var(--secondary-bg)', borderBottom: '1px solid var(--border-color)' }}>
                                        <h4 className="font-semibold text-xs" style={{ color: 'var(--primary-text)' }}>Listeye Ekle</h4>
                                        <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--secondary-text)' }}>&quot;{item.title}&quot; için bir durum seçin</p>
                                      </div>
                                      
                                      <div className="max-h-48 overflow-y-auto custom-scrollbar" style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--text-muted) transparent' }}>
                                        {dropdownStatuses.length > 0 ? (
                                          <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
                                            {dropdownStatuses.map((status) => (
                                              <button
                                                key={`${status.pageId}-${status.id}`}
                                                className="w-full px-4 py-3 text-left transition-colors focus-visible:outline-none"
                                                onClick={() => addDirectlyToStatus(item, status)}
                                              >
                                                <div className="flex items-center justify-between">
                                                  <div className="flex-1 min-w-0">
                                                    <h5 className="font-medium text-sm truncate" style={{ color: 'var(--primary-text)' }}>
                                                      {status.title}
                                                    </h5>
                                                    <p className="text-xs mt-0.5" style={{ color: 'var(--secondary-text)' }}>
                                                      {status.pageName}
                                                    </p>
                                                  </div>
                                                  
                                                  <div className="flex items-center gap-2 ml-2">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium`} style={{ background: 'var(--tag-bg)', color: 'var(--secondary-text)' }}>
                                                      {status.pageId === 'film' ? '🎬' :
                                                       status.pageId === 'dizi' ? '📺' :
                                                       status.pageId === 'anime' ? '🎌' : '⚡'}
                                                    </span>
                                                    
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--secondary-text)' }}>
                                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                    </svg>
                                                  </div>
                                                </div>
                                              </button>
                                            ))}
                                          </div>
                                        ) : (
                                          <div className="p-6 text-center">
                                            <div className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ background: 'var(--card-bg)' }}>
                                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-label="Uyarı" focusable="false" style={{ color: 'var(--secondary-text)' }}>
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                              </svg>
                                            </div>
                                            <p className="text-sm font-normal" style={{ color: 'var(--secondary-text)' }}>Uygun liste yok</p>
                                            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Bu içerik türü için önce bir liste oluşturun</p>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                                )}
                                
                                {isBulkMode && item.hasAlternatives && (
                                  <button 
                                    className="opacity-0 group-hover:opacity-100 p-2 rounded-lg transition-all focus-visible:outline-none"
                                    style={{ color: 'var(--accent-color)' }}
                                    onClick={() => showAlternativesModal(item.originalQuery, index)}
                                    title={`Show ${item.alternativeCount} more results`}
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--accent-color)' }}>
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
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ background: 'var(--card-bg)' }}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--secondary-text)' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <h3 className="font-normal mb-1 text-sm" style={{ color: 'var(--primary-text)' }}>Sonuç bulunamadı</h3>
                      <p className="text-xs" style={{ color: 'var(--secondary-text)' }}>Farklı anahtar kelimeler deneyin veya yazımınızı kontrol edin</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="px-4 py-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(var(--accent-color-rgb),0.15), rgba(255,140,0,0.08))' }}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--accent-color)' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="font-normal mb-1 text-sm" style={{ color: 'var(--primary-text)' }}>{t('components.search.placeholder.title')}</h3>
                  <p className="text-xs" style={{ color: 'var(--secondary-text)', marginBottom: '1rem' }}>{t('components.search.placeholder.subtitle')}</p>
                  
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
                          className="px-2.5 py-1 rounded-full text-xs font-medium focus-visible:outline-none"
                          style={{ background: 'var(--tag-bg)', color: 'var(--secondary-text)' }}
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
            className="absolute inset-0 backdrop-blur-sm"
            style={{ background: 'var(--overlay-bg)' }}
            onClick={() => setShowAlternatives(false)}
          />
          
          {/* Modal */}
          <div className="relative w-full max-w-3xl backdrop-blur-xl rounded-2xl shadow-2xl border overflow-hidden max-h-[80vh]" style={{ background: 'var(--secondary-bg-transparent)', borderColor: 'var(--border-color)' }}>
            {/* Header */}
            <div className="p-6" style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--hover-bg)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold" style={{ color: 'var(--primary-text)' }}>
                    Alternatif Sonuçlar
                  </h2>
                  <p className="text-sm mt-1" style={{ color: 'var(--secondary-text)' }}>
                    Tüm sonuçlar: <span className="font-normal" style={{ color: 'var(--hover-color)' }}>&quot;{selectedAlternatives.query}&quot;</span>
                  </p>
                </div>
                <button
                  onClick={() => setShowAlternatives(false)}
                  className="p-2 rounded-lg transition-colors focus-visible:outline-none"
                  style={{ color: 'var(--secondary-text)' }}
                  aria-label="Kapat"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-label="Kapat" focusable="false">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Results */}
                <div className="overflow-y-auto max-h-96 custom-scrollbar" style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--text-muted) transparent' }}>
              {selectedAlternatives.results.length > 0 ? (
                <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
                  {selectedAlternatives.results.map((item, index) => (
                    <div
                      key={`alt-${item.id}-${item.provider}-${index}`}
                      className="px-6 py-4 cursor-pointer transition-colors group"
                      style={{ transition: 'background 0.15s ease' }}
                    >
                      <div className="flex items-center gap-4">
                        {/* Poster */}
                        <div className="w-12 h-16 rounded-lg flex-shrink-0 flex items-center justify-center shadow-sm overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(40,40,40,1), rgba(30,30,30,1))' }}>
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
                          <span className="text-xs font-medium" style={{ color: 'var(--secondary-text)' }}>
                            {item.type === 'movie' ? '🎬' : 
                             item.type === 'tv' ? '📺' : 
                             item.type === 'anime' ? '🎌' : '🔍'}
                          </span>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          {/* Confidence and Rank */}
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs px-2 py-1 rounded-full font-normal" style={{ background: 'var(--tag-bg)', color: 'var(--secondary-text)' }}>
                              #{index + 1}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full font-normal`} style={{ background: item.confidence > 0.8 ? 'rgba(76,175,80,0.12)' : item.confidence > 0.6 ? 'rgba(255,193,7,0.12)' : 'rgba(255,140,0,0.12)', color: item.confidence > 0.8 ? 'var(--success-color)' : item.confidence > 0.6 ? 'var(--hover-color)' : 'var(--accent-color)' }}>
                              {Math.round(item.confidence * 100)}% match
                            </span>
                            {index === 0 && (
                              <span className="text-xs px-2 py-1 rounded-full font-normal" style={{ background: 'var(--accent-color)', color: 'var(--primary-text)' }}>
                                Best Match
                              </span>
                            )}
                          </div>

                          <h3 className="font-semibold text-base mb-1" style={{ color: 'var(--primary-text)' }}>
                            {item.title}
                              {item.originalTitle && item.originalTitle !== item.title && (
                              <span className="ml-2 text-sm font-normal" style={{ color: 'var(--secondary-text)' }}>
                                ({item.originalTitle})
                              </span>
                            )}
                          </h3>
                          
                          <div className="flex items-center gap-3 text-sm mb-2" style={{ color: 'var(--secondary-text)' }}>
                            <span className="px-2 py-1 rounded-full font-medium capitalize" style={{ background: 'var(--tag-bg)', color: 'var(--secondary-text)' }}>
                              {item.type === 'movie' ? 'Film' : 
                               item.type === 'tv' ? 'TV Show' : 
                               item.type === 'anime' ? 'Anime' : item.type}
                            </span>
                            {item.year && <span>{item.year}</span>}
                            {item.score && (
                              <div className="flex items-center gap-1">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--star-color)' }}>
                                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                </svg>
                                <span className="font-normal">{typeof item.score === 'number' ? item.score.toFixed(1) : item.score}</span>
                              </div>
                            )}
                            {item.provider && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ background: 'var(--tag-bg)', color: 'var(--secondary-text)' }}>
                                {item.provider}
                              </span>
                            )}
                          </div>

                          {item.overview && (
                            <p className="text-sm overflow-hidden" style={{
                              display: '-webkit-box',
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: 'vertical'
                            , color: 'var(--secondary-text)'}}>
                              {item.overview}
                            </p>
                          )}
                        </div>
                        
                        <div className="relative">
                          <button 
                            className="opacity-0 group-hover:opacity-100 p-2 rounded-lg transition-all focus-visible:outline-none"
                            style={{ color: 'var(--accent-color)' }}
                            onClick={() => {
                              // Seçilen alternatifi ana result'a uygula
                              if (selectedAlternatives.originalIndex !== null) {
                                const updatedResults = [...searchResults];
                                updatedResults[selectedAlternatives.originalIndex] = {
                                  ...item,
                                  originalQuery: selectedAlternatives.query
                                };
                                setSearchResults(updatedResults);
                              }
                              setShowAlternatives(false);
                            }}
                            title="Bu alternatifi seç"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-label="Bu alternatifi seç" focusable="false">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-6 py-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'var(--card-bg)' }}>
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--secondary-text)' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="font-normal mb-2" style={{ color: 'var(--primary-text)' }}>Alternatif bulunamadı</h3>
                  <p className="text-sm" style={{ color: 'var(--secondary-text)' }}>Bu sorgu için başka sonuç yok</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4" style={{ background: 'var(--dropdown-bg)', borderTop: '1px solid var(--border-color)' }}>
              <div className="flex items-center justify-between">
                <p className="text-sm" style={{ color: 'var(--secondary-text)' }}>
                  {selectedAlternatives.results.length} toplam sonuç bulundu
                </p>
                <button
                  onClick={() => setShowAlternatives(false)}
                  className="px-4 py-2 rounded-lg text-sm font-semibold focus-visible:outline-none"
                  style={{ background: 'var(--accent-color)', color: 'var(--primary-text)' }}
                  aria-label="Kapat"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-6 right-6 z-70 transform transition-all duration-300 ease-in-out">
          <div className="rounded-xl shadow-2xl p-4 max-w-sm" style={{ background: 'var(--secondary-bg-transparent)', border: '1px solid var(--border-color)' }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(76,175,80,0.12)' }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--success-color)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium break-words" style={{ color: 'var(--primary-text)' }}>
                  {toastMessage}
                </p>
              </div>
              <button
                onClick={() => setShowToast(false)}
                className="p-1 rounded-md transition-colors flex-shrink-0 focus-visible:outline-none"
                style={{ color: 'var(--secondary-text)' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-label="Kapat" focusable="false" style={{ color: 'var(--secondary-text)' }}>
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
