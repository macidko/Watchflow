import React, { useState, useRef, useEffect } from 'react';

const SearchButton = () => {
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isBulkMode, setIsBulkMode] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (showModal && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  }, [showModal]);

  // Mock arama sonuçları - daha gerçekçi verilerle
  const mockResults = {
    movies: [
      { id: 1, title: "The Dark Knight", year: "2008", rating: "9.0", type: "Film", poster: "/api/placeholder/40/60" },
      { id: 2, title: "Inception", year: "2010", rating: "8.8", type: "Film", poster: "/api/placeholder/40/60" },
      { id: 3, title: "Interstellar", year: "2014", rating: "8.6", type: "Film", poster: "/api/placeholder/40/60" },
    ],
    series: [
      { id: 4, title: "Breaking Bad", year: "2008-2013", rating: "9.5", type: "Dizi", poster: "/api/placeholder/40/60" },
      { id: 5, title: "Game of Thrones", year: "2011-2019", rating: "9.3", type: "Dizi", poster: "/api/placeholder/40/60" },
      { id: 6, title: "Stranger Things", year: "2016-2022", rating: "8.7", type: "Dizi", poster: "/api/placeholder/40/60" },
    ],
    anime: [
      { id: 7, title: "Attack on Titan", year: "2013-2023", rating: "9.0", type: "Anime", poster: "/api/placeholder/40/60" },
      { id: 8, title: "Death Note", year: "2006-2007", rating: "9.0", type: "Anime", poster: "/api/placeholder/40/60" },
      { id: 9, title: "One Piece", year: "1999-devam", rating: "8.9", type: "Anime", poster: "/api/placeholder/40/60" },
    ]
  };

  const getFilteredResults = () => {
    if (activeTab === 'all') {
      return [...mockResults.movies, ...mockResults.series, ...mockResults.anime];
    }
    return mockResults[activeTab === 'movies' ? 'movies' : activeTab === 'series' ? 'series' : 'anime'];
  };

  const getSearchResults = () => {
    const allResults = getFilteredResults();
    if (!searchQuery.trim()) return [];
    
    if (isBulkMode) {
      const queries = searchQuery.split('\n').filter(q => q.trim());
      const results = [];
      queries.forEach(query => {
        const queryResults = allResults.filter(item =>
          item.title.toLowerCase().includes(query.trim().toLowerCase())
        );
        results.push(...queryResults);
      });
      return results.filter((item, index, self) => 
        index === self.findIndex(t => t.id === item.id)
      );
    }
    
    return allResults.filter(item =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filteredResults = getSearchResults();
  const hasSearchQuery = searchQuery.trim().length > 0;

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowModal(false);
    }
  };

  return (
    <>
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
          className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20"
          onKeyDown={handleKeyDown}
        >
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          
          {/* Modal */}
          <div className="relative w-full max-w-2xl bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
            {/* Search Header */}
            <div className="relative p-6 pb-4">
              <div className="flex items-center gap-3">
                {/* Compact Toggle Switch */}
                <button
                  onClick={() => setIsBulkMode(!isBulkMode)}
                  className={`relative inline-flex h-10 w-5 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                    isBulkMode ? 'bg-blue-500' : 'bg-orange-500'
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-300 ${
                      isBulkMode ? 'translate-y-5' : 'translate-y-0.5'
                    } ml-0.5`}
                  />
                </button>
                
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  
                  {isBulkMode ? (
                    <textarea
                      ref={inputRef}
                      placeholder="Search multiple titles (one per line)&#10;Breaking Bad&#10;The Dark Knight&#10;Attack on Titan"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      rows={4}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50/80 border border-gray-200/50 rounded-xl text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent resize-none font-medium text-sm transition-all"
                    />
                  ) : (
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder="Search movies, TV shows, anime..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50/80 border border-gray-200/50 rounded-xl text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent font-medium text-sm transition-all"
                    />
                  )}
                  
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors mt-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Category Pills */}
              <div className="flex gap-2 mt-4">
                {[
                  { key: 'all', label: 'All', icon: '⚡' },
                  { key: 'movies', label: 'Movies', icon: '🎬' },
                  { key: 'series', label: 'TV Shows', icon: '📺' },
                  { key: 'anime', label: 'Anime', icon: '🎌' }
                ].map(({ key, label, icon }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
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
            <div className="max-h-96 overflow-y-auto">
              {hasSearchQuery ? (
                <>
                  {filteredResults.length > 0 ? (
                    <>
                      {/* Results Header */}
                      <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-600 font-medium">
                            {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''} found
                            {isBulkMode && (
                              <span className="ml-2 text-orange-600">
                                ({searchQuery.split('\n').filter(q => q.trim()).length} queries)
                              </span>
                            )}
                          </p>
                          {isBulkMode && filteredResults.length > 0 && (
                            <button className="text-xs px-3 py-1.5 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors font-medium">
                              Add All
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {/* Results List */}
                      <div className="divide-y divide-gray-100">
                        {filteredResults.map((item) => (
                          <div
                            key={item.id}
                            className="px-6 py-4 hover:bg-gray-50/50 cursor-pointer transition-colors group"
                          >
                            <div className="flex items-center gap-4">
                              {/* Poster Placeholder */}
                              <div className="w-10 h-14 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex-shrink-0 flex items-center justify-center shadow-sm">
                                <span className="text-xs text-gray-500 font-medium">
                                  {item.type === 'Film' ? '🎬' : item.type === 'Dizi' ? '📺' : '🎌'}
                                </span>
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 text-sm mb-1 group-hover:text-orange-600 transition-colors">
                                  {item.title}
                                </h3>
                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                  <span className="bg-gray-100 px-2 py-1 rounded-full font-medium">
                                    {item.type}
                                  </span>
                                  <span>{item.year}</span>
                                  <div className="flex items-center gap-1">
                                    <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                    </svg>
                                    <span className="font-medium">{item.rating}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <button className="opacity-0 group-hover:opacity-100 p-2 text-orange-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="px-6 py-12 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <h3 className="text-gray-900 font-medium mb-2">No results found</h3>
                      <p className="text-gray-500 text-sm">Try different keywords or check your spelling</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="px-6 py-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-gray-900 font-medium mb-2">Start searching</h3>
                  <p className="text-gray-500 text-sm mb-6">Find your favorite movies, TV shows, and anime</p>
                  
                  {/* Quick suggestions */}
                  <div className="flex flex-wrap justify-center gap-2">
                    {['Breaking Bad', 'Inception', 'Attack on Titan'].map((term) => (
                      <button
                        key={term}
                        onClick={() => setSearchQuery(term)}
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors font-medium"
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
    </>
  );
};

export default SearchButton;
