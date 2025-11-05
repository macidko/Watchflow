import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useLayoutDynamic } from '../../hooks/useLayoutDynamic';
import { 
  LAYOUT_MODES, 
  CARD_SIZES, 
  SLIDER_DENSITIES,
  LAYOUT_PRESETS 
} from '../../config/layoutConfig';

const AdvancedViewSwitcher = ({ onLayoutChange }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { 
    currentLayout, 
    applyPreset, 
    updateMode, 
    updateCardSize, 
    updateDensity,
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
    )
  };

  const sizeIcons = {
    [CARD_SIZES.COMPACT]: "📱",
    [CARD_SIZES.MEDIUM]: "🖼️",
    [CARD_SIZES.LARGE]: "🖥️"
  };

  const densityIcons = {
    [SLIDER_DENSITIES.TIGHT]: "🤏",
    [SLIDER_DENSITIES.NORMAL]: "👌",
    [SLIDER_DENSITIES.RELAXED]: "🙌"
  };

  return (
    <div className="advanced-view-switcher">
      <style>{`
        .advanced-view-switcher {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .switcher-container {
          display: flex;
          align-items: center;
          background: var(--secondary-bg);
          border-radius: 12px;
          padding: 2px;
          border: 1px solid var(--border-color);
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .preset-dropdown {
          position: relative;
        }
        
        .preset-button {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          border: none;
          background: transparent;
          color: var(--primary-text);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 13px;
          font-weight: 500;
        }
        
        .preset-button:hover {
          background: var(--hover-bg);
        }
        
        .preset-menu {
          position: absolute;
          top: 100%;
          right: 0;
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          box-shadow: var(--popup-shadow);
          z-index: 100;
          margin-top: 4px;
          min-width: 180px;
          overflow: hidden;
        }
        
        .preset-item {
          display: block;
          width: 100%;
          padding: 8px 12px;
          text-align: left;
          border: none;
          background: none;
          color: var(--primary-text);
          cursor: pointer;
          transition: all 0.2s;
          font-size: 13px;
        }
        
        .preset-item:hover {
          background: var(--hover-bg);
        }
        
        .preset-item.active {
          background: color-mix(in srgb, var(--accent-color) 8%, transparent);
          color: var(--accent-color);
          font-weight: 500;
        }
        
        .mode-switcher {
          display: flex;
          align-items: center;
          gap: 2px;
        }
        
        .mode-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: none;
          background: transparent;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.2s;
          border-radius: 6px;
        }
        
        .mode-button:hover {
          background: var(--hover-bg);
          color: var(--primary-text);
        }
        
        .mode-button.active {
          background: var(--accent-color);
          color: white;
        }
        
        .settings-toggle {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: none;
          background: transparent;
          color: var(--text-muted);
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .settings-toggle:hover {
          background: var(--hover-bg);
          color: var(--primary-text);
        }
        
        .settings-toggle.active {
          background: var(--accent-color);
          color: white;
        }
        
        .advanced-panel {
          position: absolute;
          top: 100%;
          right: 0;
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          box-shadow: var(--popup-shadow);
          z-index: 100;
          margin-top: 8px;
          padding: 16px;
          min-width: 280px;
        }
        
        .advanced-section {
          margin-bottom: 16px;
        }
        
        .advanced-section:last-child {
          margin-bottom: 0;
        }
        
        .section-title {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-muted);
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .option-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(40px, 1fr));
          gap: 4px;
        }
        
        .option-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border: 1px solid var(--border-color);
          background: var(--secondary-bg);
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.2s;
          border-radius: 8px;
          font-size: 16px;
        }
        
        .option-button:hover {
          border-color: var(--accent-color);
          background: color-mix(in srgb, var(--accent-color) 5%, var(--secondary-bg));
          color: var(--primary-text);
        }
        
        .option-button.active {
          background: var(--accent-color);
          border-color: var(--accent-color);
          color: white;
        }
        
        @media (max-width: 768px) {
          .advanced-view-switcher {
            flex-wrap: wrap;
            gap: 6px;
          }
          
          .advanced-panel {
            position: fixed;
            top: auto;
            bottom: 20px;
            left: 20px;
            right: 20px;
            margin-top: 0;
          }
        }
      `}</style>

      <div className="switcher-container">
        {/* Preset Selector */}
        <div className="preset-dropdown">
          <button 
            className="preset-button"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <span>⚙️</span>
            <span>{currentLayout.preset || 'Layout'}</span>
          </button>
        </div>

        {/* Quick Mode Switcher */}
        <div className="mode-switcher">
          {Object.values(LAYOUT_MODES).map(mode => (
            <button
              key={mode}
              className={`mode-button ${currentLayout.mode === mode ? 'active' : ''}`}
              onClick={() => handleModeChange(mode)}
              title={`${mode.charAt(0).toUpperCase() + mode.slice(1)} Layout`}
            >
              {layoutIcons[mode]}
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Panel */}
      {showAdvanced && (
        <div className="advanced-panel">
          {/* Size Options */}
          <div className="advanced-section">
            <div className="section-title">Card Size</div>
            <div className="option-grid">
              {Object.values(CARD_SIZES).map(size => (
                <button
                  key={size}
                  className={`option-button ${currentLayout.cardSize === size ? 'active' : ''}`}
                  onClick={() => handleCardSizeChange(size)}
                  title={size.charAt(0).toUpperCase() + size.slice(1)}
                >
                  {sizeIcons[size]}
                </button>
              ))}
            </div>
          </div>

          {/* Density Options */}
          <div className="advanced-section">
            <div className="section-title">Spacing</div>
            <div className="option-grid">
              {Object.values(SLIDER_DENSITIES).map(density => (
                <button
                  key={density}
                  className={`option-button ${currentLayout.density === density ? 'active' : ''}`}
                  onClick={() => handleDensityChange(density)}
                  title={density.charAt(0).toUpperCase() + density.slice(1)}
                >
                  {densityIcons[density]}
                </button>
              ))}
            </div>
          </div>

          {/* Presets */}
          <div className="advanced-section">\n            <div className="section-title">Presets</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              {Object.keys(LAYOUT_PRESETS).map(presetName => (
                <button
                  key={presetName}
                  className={`preset-item ${currentLayout.preset === presetName ? 'active' : ''}`}
                  onClick={() => handlePresetChange(presetName)}
                  style={{ padding: '8px 12px', borderRadius: '6px', margin: 0 }}
                >
                  {presetName.replace('_', ' ')}
                </button>
              ))}
              <button
                className="preset-item"
                onClick={resetToDefault}
                style={{ padding: '8px 12px', borderRadius: '6px', margin: 0, color: 'var(--accent-color)' }}
              >
                🔄 Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

AdvancedViewSwitcher.propTypes = {
  onLayoutChange: PropTypes.func
};

AdvancedViewSwitcher.defaultProps = {
  onLayoutChange: undefined
};

export default AdvancedViewSwitcher;

