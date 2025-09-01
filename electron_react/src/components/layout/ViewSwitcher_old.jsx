import React from 'react';

/**
 * Layout görünüm seçicisi component (List/Grid toggle)
 */
const ViewSwitcher = ({ viewMode, toggleViewMode }) => {
  return (
    <div className="flex items-center gap-3">
      <div 
        className="flex items-center rounded-full bg-opacity-20 overflow-hidden"
        style={{ background: 'var(--input-bg)' }}
      >
        {/* Liste görünümü butonu */}
        <button
          onClick={() => viewMode !== 'normal' && toggleViewMode()}
          className={`flex items-center justify-center p-2 transition-all duration-200 ${
            viewMode === 'normal' 
              ? 'bg-opacity-90 text-white' 
              : 'text-gray-400 hover:text-gray-300'
          }`}
          style={viewMode === 'normal' ? { background: 'var(--accent-color)' } : {}}
          aria-label="Liste görünümü"
          title="Liste görünümü"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M2 2.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h12a.5.5 0 0 0 .5-.5V3a.5.5 0 0 0-.5-.5H2zM2 6.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h12a.5.5 0 0 0 .5-.5V7a.5.5 0 0 0-.5-.5H2zM2 10.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h12a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5H2z"/>
          </svg>
        </button>
        
        {/* Grid görünümü butonu */}
        <button
          onClick={() => viewMode !== 'grid' && toggleViewMode()}
          className={`flex items-center justify-center p-2 transition-all duration-200 ${
            viewMode === 'grid' 
              ? 'bg-opacity-90 text-white' 
              : 'text-gray-400 hover:text-gray-300'
          }`}
          style={viewMode === 'grid' ? { background: 'var(--accent-color)' } : {}}
          aria-label="Grid görünümü"
          title="Grid görünümü"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
            <path d="M1 2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V2zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V2zM1 7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V7zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V7zM1 12a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1v-2zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-2zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-2z"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ViewSwitcher;
