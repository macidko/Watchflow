import React from 'react';

/**
 * Modern layout görünüm seçicisi component (List/Grid toggle)
 */
const ViewSwitcher = ({ viewMode, toggleViewMode }) => {
  return (
    <div className="view-switcher">
      <style jsx>{`
        .view-switcher {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .switcher-container {
          display: flex;
          align-items: center;
          background: var(--card-bg);
          border-radius: 16px;
          padding: 4px;
          border: 1px solid color-mix(in srgb, var(--border-color) 50%, transparent);
          box-shadow: var(--card-shadow);
          overflow: hidden;
        }
        
        .view-button {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 10px 12px;
          border: none;
          background: transparent;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 12px;
          font-size: 0;
          position: relative;
          overflow: hidden;
        }
        
        .view-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: var(--accent-color);
          opacity: 0;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: inherit;
        }
        
        .view-button:hover::before {
          opacity: 0.1;
        }
        
        .view-button:active {
          transform: scale(0.95);
        }
        
        .view-button.active {
          color: var(--primary-text);
          background: var(--accent-color);
          box-shadow: 
            0 4px 16px color-mix(in srgb, var(--accent-color) 20%, transparent),
            0 2px 8px color-mix(in srgb, var(--accent-color) 15%, transparent);
        }
        
        .view-button.active::before {
          opacity: 0;
        }
        
        .view-button:hover:not(.active) {
          color: var(--secondary-text);
          transform: translateY(-1px);
        }
        
        .view-icon {
          width: 18px;
          height: 18px;
          flex-shrink: 0;
          transition: transform 0.2s ease;
          position: relative;
          z-index: 1;
        }
        
        .view-button:active .view-icon {
          transform: scale(0.9);
        }
        
        @media (max-width: 768px) {
          .view-button {
            padding: 8px 10px;
          }
          
          .view-icon {
            width: 16px;
            height: 16px;
          }
        }
      `}</style>

      <div className="switcher-container">
        {/* Liste görünümü butonu */}
        <button
          onClick={() => viewMode !== 'normal' && toggleViewMode()}
          className={`view-button ${viewMode === 'normal' ? 'active' : ''}`}
          aria-label="Liste görünümü"
          title="Liste görünümü"
          disabled={viewMode === 'normal'}
        >
          <svg 
            className="view-icon" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            role="img"
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 6h16M4 10h16M4 14h16M4 18h16" 
            />
          </svg>
        </button>
        
        {/* Grid görünümü butonu */}
        <button
          onClick={() => viewMode !== 'grid' && toggleViewMode()}
          className={`view-button ${viewMode === 'grid' ? 'active' : ''}`}
          aria-label="Grid görünümü"
          title="Grid görünümü"
          disabled={viewMode === 'grid'}
        >
          <svg 
            className="view-icon" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            role="img"
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" 
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ViewSwitcher;
