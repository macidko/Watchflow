import React, { useState } from 'react';
import { useLayoutDynamic } from '../hooks/useLayoutDynamic';
import { 
  LAYOUT_MODES, 
  CARD_SIZES, 
  SLIDER_DENSITIES, 
  CARD_STYLES,
  LAYOUT_PRESETS 
} from '../config/layoutConfig';

const AdvancedViewSwitcher = ({ onLayoutChange }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { 
    currentLayout, 
    applyPreset, 
    updateMode, 
    updateCardSize, 
    updateDensity, 
    updateStyle,
    resetToDefault
  } = useLayoutDynamic();

  const handlePresetChange = (presetName) => {
    applyPreset(presetName);
    if (onLayoutChange) {
      onLayoutChange(LAYOUT_PRESETS[presetName]);
    }
  };

  const handleModeChange = (mode) => {
    updateMode(mode);
    if (onLayoutChange) {
      onLayoutChange({ ...currentLayout, mode });
    }
  };

  const handleCardSizeChange = (size) => {
    updateCardSize(size);
    if (onLayoutChange) {
      onLayoutChange({ ...currentLayout, cardSize: size });
    }
  };

  const handleDensityChange = (density) => {
    updateDensity(density);
    if (onLayoutChange) {
      onLayoutChange({ ...currentLayout, density });
    }
  };

  const handleStyleChange = (style) => {
    updateStyle(style);
    if (onLayoutChange) {
      onLayoutChange({ ...currentLayout, style });
    }
  };

  const layoutIcons = {
    [LAYOUT_MODES.SLIDER]: (
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>
    ),
    [LAYOUT_MODES.GRID]: (
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
      </svg>
    ),
    [LAYOUT_MODES.LIST]: (
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
      </svg>
    ),
    [LAYOUT_MODES.MASONRY]: (
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 11a1 1 0 011-1h4a1 1 0 011 1v8a1 1 0 01-1 1h-4a1 1 0 01-1-1v-8z" />
      </svg>
    ),
    [LAYOUT_MODES.CAROUSEL]: (
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16l13-8L7 4z" />
      </svg>
    ),
    [LAYOUT_MODES.TIMELINE]: (
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  };

  const sizeIcons = {
    [CARD_SIZES.COMPACT]: "📱",
    [CARD_SIZES.SMALL]: "📋",
    [CARD_SIZES.MEDIUM]: "🖼️",
    [CARD_SIZES.LARGE]: "🖥️",
    [CARD_SIZES.EXTRA_LARGE]: "📺"
  };

  const densityIcons = {
    [SLIDER_DENSITIES.TIGHT]: "🤏",
    [SLIDER_DENSITIES.NORMAL]: "👌",
    [SLIDER_DENSITIES.RELAXED]: "✋",
    [SLIDER_DENSITIES.SPACIOUS]: "🙌"
  };

  const styleIcons = {
    [CARD_STYLES.MODERN]: "✨",
    [CARD_STYLES.MINIMAL]: "🎯",
    [CARD_STYLES.CLASSIC]: "📽️",
    [CARD_STYLES.COMPACT]: "📊",
    [CARD_STYLES.ARTISTIC]: "🎨",
    [CARD_STYLES.PROFESSIONAL]: "💼"
  };

  return (
    <div className="advanced-view-switcher">
      <style jsx>{`
        .advanced-view-switcher {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        
        .switcher-container {
          display: flex;
          align-items: center;
          background: var(--card-bg);
          border-radius: 16px;
          padding: 4px;
          border: 1px solid color-mix(in srgb, var(--border-color) 50%, transparent);
          box-shadow: var(--card-shadow);
        }
        
        .preset-dropdown {
          position: relative;
        }
        
        .preset-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border: 1px solid var(--border-color);
          background: var(--secondary-bg);
          color: var(--primary-text);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 14px;
          font-weight: 500;
        }
        
        .preset-button:hover {
          border-color: var(--accent-color);
          background: color-mix(in srgb, var(--accent-color) 10%, var(--secondary-bg));
        }
        
        .preset-menu {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          box-shadow: var(--popup-shadow);
          z-index: 100;
          margin-top: 4px;
          overflow: hidden;
        }
        
        .preset-item {
          display: block;
          width: 100%;
          padding: 12px 16px;
          text-align: left;
          border: none;
          background: none;
          color: var(--primary-text);
          cursor: pointer;
          transition: all 0.2s;
          border-bottom: 1px solid var(--border-color);
        }
        
        .preset-item:last-child {
          border-bottom: none;
        }
        
        .preset-item:hover {
          background: var(--hover-bg);
        }
        
        .preset-item.active {
          background: color-mix(in srgb, var(--accent-color) 10%, transparent);
          color: var(--accent-color);
        }
        
        .control-group {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--secondary-bg);
          border-radius: 12px;
          padding: 4px;
          border: 1px solid var(--border-color);
        }
        
        .control-button {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px;
          border: none;
          background: transparent;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.2s;
          border-radius: 8px;
          min-width: 36px;
          min-height: 36px;
        }
        
        .control-button:hover {
          background: var(--hover-bg);
          color: var(--primary-text);
        }
        
        .control-button.active {
          background: var(--accent-color);
          color: white;
        }
        
        .control-button.active:hover {
          background: var(--hover-color);
        }
        
        .toggle-advanced {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border: 1px solid var(--border-color);
          background: var(--secondary-bg);
          color: var(--text-muted);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .toggle-advanced:hover {
          border-color: var(--accent-color);
          color: var(--accent-color);
        }
        
        .toggle-advanced.active {
          background: var(--accent-color);
          border-color: var(--accent-color);
          color: white;
        }
        
        .advanced-controls {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        
        .control-label {
          font-size: 12px;
          color: var(--text-muted);
          margin-right: 4px;
        }
        
        @media (max-width: 768px) {
          .advanced-view-switcher {
            flex-direction: column;
            align-items: stretch;
            gap: 8px;
          }
          
          .advanced-controls {
            justify-content: center;
          }
        }
      `}</style>

      {/* Quick Preset Selector */}
      <div className="preset-dropdown">
        <button 
          className="preset-button"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <span>📋</span>
          <span>{currentLayout.preset || 'CUSTOM'}</span>
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {showAdvanced && (
          <div className="preset-menu">
            {Object.keys(LAYOUT_PRESETS).map(presetName => (
              <button
                key={presetName}
                className={`preset-item ${currentLayout.preset === presetName ? 'active' : ''}`}
                onClick={() => {
                  handlePresetChange(presetName);
                  setShowAdvanced(false);
                }}
              >
                <div style={{ fontWeight: 500, marginBottom: '2px' }}>
                  {presetName.replace('_', ' ')}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {LAYOUT_PRESETS[presetName].mode} • {LAYOUT_PRESETS[presetName].cardSize} • {LAYOUT_PRESETS[presetName].style}
                </div>
              </button>
            ))}
            <button
              className="preset-item"
              onClick={() => {
                resetToDefault();
                setShowAdvanced(false);
              }}
            >
              <div style={{ fontWeight: 500, color: 'var(--accent-color)' }}>
                🔄 Reset to Default
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Quick Mode Switcher */}
      <div className="control-group">
        <span className="control-label">Mode</span>
        {Object.values(LAYOUT_MODES).slice(0, 4).map(mode => (
          <button
            key={mode}
            className={`control-button ${currentLayout.mode === mode ? 'active' : ''}`}
            onClick={() => handleModeChange(mode)}
            title={mode.charAt(0).toUpperCase() + mode.slice(1)}
          >
            {layoutIcons[mode]}
          </button>
        ))}
      </div>

      {/* Advanced Controls Toggle */}
      <button 
        className={`toggle-advanced ${showAdvanced ? 'active' : ''}`}
        onClick={() => setShowAdvanced(!showAdvanced)}
        title="Advanced Options"
      >
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
        </svg>
      </button>

      {/* Advanced Controls */}
      {showAdvanced && (
        <div className="advanced-controls">
          {/* Card Size */}
          <div className="control-group">
            <span className="control-label">Size</span>
            {Object.values(CARD_SIZES).map(size => (
              <button
                key={size}
                className={`control-button ${currentLayout.cardSize === size ? 'active' : ''}`}
                onClick={() => handleCardSizeChange(size)}
                title={size.charAt(0).toUpperCase() + size.slice(1)}
              >
                <span style={{ fontSize: '14px' }}>{sizeIcons[size]}</span>
              </button>
            ))}
          </div>

          {/* Density */}
          <div className="control-group">
            <span className="control-label">Density</span>
            {Object.values(SLIDER_DENSITIES).map(density => (
              <button
                key={density}
                className={`control-button ${currentLayout.density === density ? 'active' : ''}`}
                onClick={() => handleDensityChange(density)}
                title={density.charAt(0).toUpperCase() + density.slice(1)}
              >
                <span style={{ fontSize: '14px' }}>{densityIcons[density]}</span>
              </button>
            ))}
          </div>

          {/* Style */}
          <div className="control-group">
            <span className="control-label">Style</span>
            {Object.values(CARD_STYLES).map(style => (
              <button
                key={style}
                className={`control-button ${currentLayout.style === style ? 'active' : ''}`}
                onClick={() => handleStyleChange(style)}
                title={style.charAt(0).toUpperCase() + style.slice(1)}
              >
                <span style={{ fontSize: '14px' }}>{styleIcons[style]}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedViewSwitcher;
