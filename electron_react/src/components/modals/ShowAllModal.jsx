import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import DynamicCard from '../ui/DynamicCard';
import { t } from '../../i18n';
import { CARD_SIZES } from '../../config/layoutConfig';
import '../../css/components/modals/ShowAllModal.css';

const ShowAllModal = ({ title, items = [], onClose, onCardClick }) => {
  const modalRef = useRef(null);
  const [viewMode, setViewMode] = useState('grid'); // grid, list
  const [sortBy, setSortBy] = useState('default'); // default, title, year, rating
  const [filterQuery, setFilterQuery] = useState('');

  // Modal açıldığında focus yönetimi
  useEffect(() => {
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
        onClose();
      } else if (e.key === 'Tab') {
        // Tab navigation için focus trap
        const firstFocusable = focusables[0];
        const lastFocusable = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        } else if (!e.shiftKey && document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

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

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="show-all-modal-backdrop" 
      onClick={handleBackdropClick}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      }}
      role="presentation"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <div 
        ref={modalRef}
        className="show-all-modal"
        style={{
          background: 'var(--card-bg)',
          borderRadius: '20px',
          border: '1px solid var(--border-color)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
          width: '100%',
          maxWidth: '1200px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div 
          className="show-all-modal-header"
          style={{
            padding: '24px 32px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: 'var(--primary-text)',
              margin: 0
            }}>
              {title}
            </h2>
            <div style={{
              padding: '4px 12px',
              borderRadius: '20px',
              background: 'var(--accent-color)',
              fontSize: '14px',
              fontWeight: '500',
              color: 'var(--primary-text)'
            }}>
              {processedItems.length} {t('common.content')}
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              background: 'var(--secondary-bg)',
              color: 'var(--secondary-text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'var(--hover-bg)';
              e.target.style.color = 'var(--primary-text)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'var(--secondary-bg)';
              e.target.style.color = 'var(--secondary-text)';
            }}
            title={t('common.close')}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Controls */}
        <div 
          className="show-all-modal-controls"
          style={{
            padding: '20px 32px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            flexWrap: 'wrap',
            flexShrink: 0
          }}
        >
          {/* Search */}
          <div style={{ flex: '1', minWidth: '200px' }}>
            <input
              type="text"
              placeholder={t('common.search')}
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                background: 'var(--secondary-bg)',
                color: 'var(--primary-text)',
                fontSize: '14px'
              }}
            />
          </div>

          {/* Sort */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '14px', color: 'var(--secondary-text)' }}>
              {t('common.sortBy')}:
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                background: 'var(--secondary-bg)',
                color: 'var(--primary-text)',
                fontSize: '14px'
              }}
            >
              <option value="default">{t('common.default')}</option>
              <option value="title">{t('common.title')}</option>
              <option value="year">{t('common.year')}</option>
              <option value="rating">{t('common.rating')}</option>
            </select>
          </div>

          {/* View Mode */}
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                padding: '8px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                background: viewMode === 'grid' ? 'var(--accent-color)' : 'var(--secondary-bg)',
                color: viewMode === 'grid' ? 'var(--primary-text)' : 'var(--secondary-text)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              title={t('common.gridView')}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={{
                padding: '8px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                background: viewMode === 'list' ? 'var(--accent-color)' : 'var(--secondary-bg)',
                color: viewMode === 'list' ? 'var(--primary-text)' : 'var(--secondary-text)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              title={t('common.listView')}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div 
          className="show-all-modal-content"
          style={{
            flex: 1,
            overflow: 'auto',
            padding: '24px 32px'
          }}
        >
          {processedItems.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '300px',
              textAlign: 'center'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'var(--secondary-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}>
                <svg width="32" height="32" fill="none" stroke="var(--secondary-text)" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                color: 'var(--primary-text)', 
                marginBottom: '8px' 
              }}>
                {filterQuery ? t('common.noSearchResults') : t('common.noContent')}
              </h3>
              <p style={{ 
                color: 'var(--secondary-text)', 
                fontSize: '14px',
                maxWidth: '400px'
              }}>
                {filterQuery 
                  ? t('common.tryDifferentSearch') 
                  : t('common.noContentDescription')
                }
              </p>
            </div>
          ) : (
            <div 
              className={`show-all-modal-grid ${viewMode}`}
              style={{
                display: viewMode === 'grid' ? 'grid' : 'flex',
                flexDirection: viewMode === 'list' ? 'column' : undefined,
                gridTemplateColumns: viewMode === 'grid' 
                  ? 'repeat(auto-fill, minmax(180px, 1fr))' 
                  : undefined,
                gap: viewMode === 'grid' ? '20px' : '12px'
              }}
            >
              {processedItems.map((item, index) => (
                <div key={item.id || index}>
                  <DynamicCard
                    item={item}
                    onClick={handleCardClick}
                    cardSize={viewMode === 'list' ? CARD_SIZES.SMALL : CARD_SIZES.MEDIUM}
                    cardStyle={viewMode === 'list' ? 'compact' : 'modern'}
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
      </div>
    </div>
  );
};

ShowAllModal.propTypes = {
  title: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.object),
  onClose: PropTypes.func.isRequired,
  onCardClick: PropTypes.func
};

export default ShowAllModal;