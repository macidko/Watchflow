import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Card } from '../ui/Card';
import { t } from '../../i18n';

/**
 * ShowAllModalContent - Presentational component for ShowAllModal
 * Handles filtering, sorting, view modes, and content display
 */
const ShowAllModalContent = ({ items = [], onCardClick }) => {
  const [viewMode, setViewMode] = useState('grid'); // grid, list
  const [sortBy, setSortBy] = useState('default'); // default, title, year, rating
  const [filterQuery, setFilterQuery] = useState('');

  // Filtreleme ve sıralama
  const processedItems = React.useMemo(() => {
    let filtered = items;

    // Filtreleme
    if (filterQuery.trim()) {
      const query = filterQuery.toLowerCase().trim();
      filtered = items.filter(item => {
        const title = item.title || item.name || item.apiData?.title || '';
        const originalTitle = item.original_title || item.original_name || item.apiData?.original_title || '';
        return title.toLowerCase().includes(query) || originalTitle.toLowerCase().includes(query);
      });
    }

    // Sıralama
    switch (sortBy) {
      case 'title':
        filtered.sort((a, b) => {
          const titleA = (a.title || a.name || a.apiData?.title || '').toLowerCase();
          const titleB = (b.title || b.name || b.apiData?.title || '').toLowerCase();
          return titleA.localeCompare(titleB);
        });
        break;
      case 'year':
        filtered.sort((a, b) => {
          const dateA = a.release_date || a.first_air_date || a.releaseDate || a.year || a.apiData?.release_date || '1900';
          const dateB = b.release_date || b.first_air_date || b.releaseDate || b.year || b.apiData?.release_date || '1900';
          const yearA = new Date(dateA).getFullYear();
          const yearB = new Date(dateB).getFullYear();
          return yearB - yearA;
        });
        break;
      case 'rating':
        filtered.sort((a, b) => {
          const ratingA = a.vote_average || a.rating || a.score || a.apiData?.rating || 0;
          const ratingB = b.vote_average || b.rating || b.score || b.apiData?.rating || 0;
          return ratingB - ratingA;
        });
        break;
      default:
        // Varsayılan sıralama korunur
        break;
    }

    return filtered;
  }, [items, filterQuery, sortBy]);

  const handleCardClick = (item) => {
    if (onCardClick) {
      onCardClick(item);
    }
  };

  return (
    <>
      {/* Controls */}
      <div className="show-all-modal-controls">
        {/* Search */}
        <div className="show-all-modal-search">
          <input
            type="text"
            placeholder={t('common.search')}
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
          />
        </div>

        {/* Sort */}
        <div className="show-all-modal-sort">
          <label>
            {t('common.sortBy')}:
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="default">{t('common.default')}</option>
            <option value="title">{t('common.title')}</option>
            <option value="year">{t('common.year')}</option>
            <option value="rating">{t('common.rating')}</option>
          </select>
        </div>

        {/* View Mode */}
        <div className="show-all-modal-view-toggle">
          <button
            onClick={() => setViewMode('grid')}
            className={viewMode === 'grid' ? 'active' : ''}
            title={t('common.gridView')}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={viewMode === 'list' ? 'active' : ''}
            title={t('common.listView')}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="show-all-modal-content">
        {processedItems.length === 0 ? (
          <div className="show-all-modal-empty-state">
            <div className="show-all-modal-empty-icon">
              <svg width="32" height="32" fill="none" stroke="var(--secondary-text)" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="show-all-modal-empty-title">
              {filterQuery ? t('common.noSearchResults') : t('common.noContent')}
            </h3>
            <p className="show-all-modal-empty-description">
              {filterQuery
                ? t('common.tryDifferentSearch')
                : t('common.noContentDescription')
              }
            </p>
          </div>
        ) : (
          <div className={`show-all-modal-grid ${viewMode}`}>
            {processedItems.map((item, index) => (
              <div key={item.id || index}>
                <Card
                  item={item}
                  onClick={handleCardClick}
                  size={viewMode === 'list' ? 'compact' : 'medium'}
                  variant={viewMode === 'list' ? 'compact' : 'modern'}
                  customCSS={{
                    width: '100%',
                    height: viewMode === 'list' ? '120px' : 'auto'
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

ShowAllModalContent.propTypes = {
  title: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.object),
  onCardClick: PropTypes.func
};

export default ShowAllModalContent;