import React from 'react';
import PropTypes from 'prop-types';
import { t } from '../../i18n';
import { THEMES, ACCENT_COLORS, LANGUAGES, LANGUAGE_CONFIG } from '../../config/themeConfig';
import { LAYOUT_MODES, CARD_SIZES, SLIDER_DENSITIES, LAYOUT_PRESETS } from '../../config/layoutConfig';

export default function SettingsPanel({
  section,
  settings,
  currentLayout,
  updateTheme,
  updateAccentColor,
  updateMode,
  updateCardSize,
  updateDensity,
  applyPreset,
  onResetToDefault,
  handleShowStorage,
  storageInfo,
  expandedItems,
  toggleExpanded,
  handleExportData,
  handleFileSelect,
  handleDragOver,
  handleDrop,
  setShowResetModal,
  fileInputRef,
  updateLanguage,
  showStorage
}) {
  const renderAppearanceSection = () => (
    <div className="settings-section">
      <h3 className="section-title">{t('pages.settings.appearance.title')}</h3>
      <p className="section-description">{t('pages.settings.appearance.description')}</p>

      <div className="setting-group">
        <label className="setting-label">{t('pages.settings.appearance.theme')}</label>
        <div className="theme-options">
          {Object.values(THEMES).map(theme => (
            <button
              key={theme}
              className={`theme-option ${settings.theme === theme ? 'active' : ''}`}
              onClick={() => updateTheme(theme)}
            >
              <span className="theme-icon">
                {theme === THEMES.DARK ? '🌙' : theme === THEMES.LIGHT ? '☀️' : '🌓'}
              </span>
              <span>{t(`pages.settings.appearance.themeOptions.${theme}`)}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="setting-group">
        <label className="setting-label">{t('pages.settings.appearance.accentColor')}</label>
        <div className="accent-colors">
          {Object.values(ACCENT_COLORS).map(color => (
            <button
              key={color}
              className={`accent-color ${settings.accentColor === color ? 'active' : ''}`}
              onClick={() => updateAccentColor(color)}
              data-color={color}
            >
              <span>{t(`pages.settings.appearance.accentColors.${color}`)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderLayoutSection = () => {
    const layoutIcons = {
      [LAYOUT_MODES.SLIDER]: (
        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
      ),
      [LAYOUT_MODES.GRID]: (
        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
        </svg>
      ),
      [LAYOUT_MODES.LIST]: (
        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      ),
      [LAYOUT_MODES.MASONRY]: (
        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 11a1 1 0 011-1h4a1 1 0 011 1v8a1 1 0 01-1 1h-4a1 1 0 01-1-1v-8z" />
        </svg>
      ),
      [LAYOUT_MODES.CAROUSEL]: (
        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16l13-8L7 4z" />
        </svg>
      ),
      [LAYOUT_MODES.TIMELINE]: (
        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    };

    const sizeLabels = {
      [CARD_SIZES.COMPACT]: 'Compact',
      [CARD_SIZES.SMALL]: 'Small',
      [CARD_SIZES.MEDIUM]: 'Medium',
      [CARD_SIZES.LARGE]: 'Large',
      [CARD_SIZES.EXTRA_LARGE]: 'Extra Large'
    };

    const densityLabels = {
      [SLIDER_DENSITIES.TIGHT]: 'Tight',
      [SLIDER_DENSITIES.NORMAL]: 'Normal',
      [SLIDER_DENSITIES.RELAXED]: 'Relaxed'
    };

    return (
      <div className="settings-section">
        <h3 className="section-title">Layout Settings</h3>
        <p className="section-description">Customize how content is displayed and organized in your app.</p>

        <div className="setting-group">
          <label className="setting-label">Layout Mode</label>
          <div className="layout-options">
            {Object.values(LAYOUT_MODES).map(mode => (
              <button
                key={mode}
                className={`layout-option ${currentLayout.mode === mode ? 'active' : ''}`}
                onClick={() => updateMode(mode)}
              >
                <div className="layout-icon">{layoutIcons[mode]}</div>
                <span className="layout-name">{mode.charAt(0).toUpperCase() + mode.slice(1)}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="setting-group">
          <label className="setting-label">Card Size</label>
          <div className="size-options">
            {Object.values(CARD_SIZES).map(size => (
              <button
                key={size}
                className={`size-option ${currentLayout.cardSize === size ? 'active' : ''}`}
                onClick={() => updateCardSize(size)}
              >
                <span className="size-label">{sizeLabels[size]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="setting-group">
          <label className="setting-label">Spacing</label>
          <div className="density-options">
            {Object.values(SLIDER_DENSITIES).map(density => (
              <button
                key={density}
                className={`density-option ${currentLayout.density === density ? 'active' : ''}`}
                onClick={() => updateDensity(density)}
              >
                <span className="density-label">{densityLabels[density]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="setting-group">
          <label className="setting-label">Quick Presets</label>
          <div className="preset-options">
            {Object.keys(LAYOUT_PRESETS).map(presetName => (
              <button
                key={presetName}
                className={`preset-option ${currentLayout.preset === presetName ? 'active' : ''}`}
                onClick={() => applyPreset(presetName)}
              >
                <span className="preset-label">{presetName.replace('_', ' ')}</span>
              </button>
            ))}
            <button className="preset-option reset" onClick={onResetToDefault}>
              <span className="preset-label">Reset to Default</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderDataManagementSection = () => (
    <div className="settings-section">
      <h3 className="section-title">{t('pages.settings.dataManagement.title')}</h3>
      <p className="section-description">{t('pages.settings.dataManagement.description')}</p>

      <div className="setting-group">
        <div className="setting-item">
          <div>
            <h4>{t('pages.settings.dataManagement.export.title')}</h4>
            <p>{t('pages.settings.dataManagement.export.description')}</p>
            <small className="info-text">📁 JSON formatında indirilir</small>
          </div>
          <button className="primary-button export-button" onClick={handleExportData}>
            <span className="button-icon">⬇️</span>
            {t('pages.settings.dataManagement.export.button')}
          </button>
        </div>
      </div>

      <div className="setting-group">
        <div className="setting-item">
          <div>
            <h4>{t('pages.settings.dataManagement.import.title')}</h4>
            <p>{t('pages.settings.dataManagement.import.description')}</p>
            <small className="info-text">📤 JSON dosyasını sürükle-bırak veya seç</small>
          </div>
          <div className="import-controls">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <button className="secondary-button import-button" onClick={() => fileInputRef.current?.click()}>
              <span className="button-icon">📂</span>
              {t('pages.settings.dataManagement.import.selectFile')}
            </button>
          </div>
        </div>
        <div className="drop-zone" onDragOver={handleDragOver} onDrop={handleDrop}>
          <div className="drop-content">
            <span className="drop-icon">📤</span>
            <span>{t('pages.settings.dataManagement.import.dragDrop')}</span>
            <small>{t('pages.settings.dataManagement.import.supportedFormat')}</small>
          </div>
        </div>
      </div>

      <div className="setting-group">
        <div className="setting-item">
          <div>
            <h4>{t('pages.settings.dataManagement.storage.title')}</h4>
            <p>{t('pages.settings.dataManagement.storage.description')}</p>
          </div>
          <button className="secondary-button" onClick={handleShowStorage}>
            {showStorage ? t('pages.settings.dataManagement.storage.hide') : t('pages.settings.dataManagement.storage.show')}
          </button>
        </div>
        {showStorage && (
          <div className="storage-details">
            <div className="storage-summary">
              <span>Toplam: {storageInfo.totalSize}</span>
              <span>Öğe Sayısı: {storageInfo.itemCount}</span>
            </div>
            <div className="storage-items">
              {storageInfo.items.map(({ key, size, preview }) => {
                const isExpanded = expandedItems.has(key);
                const fullValue = localStorage.getItem(key) || '';
                const isJson = fullValue.startsWith('{') || fullValue.startsWith('[');

                return (
                  <div key={key} className="storage-item">
                    <div className="storage-key">
                      {key}
                      {isJson && (
                        <button className="expand-button" onClick={() => toggleExpanded(key)} title={isExpanded ? 'Daralt' : 'Genişlet'}>
                          {isExpanded ? '🔽' : '▶️'}
                        </button>
                      )}
                    </div>
                    <div className="storage-size">{size}</div>
                    <div className="storage-preview">
                      {isExpanded && isJson ? (
                        <pre className="json-preview">{(function(){try{return JSON.stringify(JSON.parse(fullValue),null,2)}catch{return fullValue}})()}</pre>
                      ) : (
                        <span className="text-preview">{preview}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="setting-group">
        <div className="setting-item">
          <div>
            <h4>{t('pages.settings.dataManagement.reset.title')}</h4>
            <p>{t('pages.settings.dataManagement.reset.description')}</p>
            <small className="warning-text">{t('pages.settings.dataManagement.reset.warning')}</small>
          </div>
          <button className="danger-button" onClick={() => setShowResetModal(true)}>
            {t('pages.settings.dataManagement.reset.button')}
          </button>
        </div>
      </div>
    </div>
  );

  const renderLanguageSection = () => (
    <div className="settings-section">
      <h3 className="section-title">{t('pages.settings.language.title')}</h3>
      <p className="section-description">{t('pages.settings.language.description')}</p>

      <div className="setting-group">
        <label className="setting-label">{t('pages.settings.language.availableLanguages')}</label>
        <div className="language-options">
          {Object.values(LANGUAGES).map(lang => (
            <button key={lang} className={`language-option ${settings.language === lang ? 'active' : ''}`} onClick={() => updateLanguage(lang)}>
              <span className="language-flag">{LANGUAGE_CONFIG[lang].flag}</span>
              <span>{LANGUAGE_CONFIG[lang].name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAboutSection = () => (
    <div className="settings-section">
      <h3 className="section-title">{t('pages.settings.about.title')}</h3>
      <p className="section-description">{t('pages.settings.about.description')}</p>

      <div className="about-info">
        <div className="about-item"><strong>{t('pages.settings.about.version')}:</strong> 1.0.0</div>
        <div className="about-item"><strong>{t('pages.settings.about.author')}:</strong> Watchflow Team</div>
        <div className="about-item"><strong>{t('pages.settings.about.github')}:</strong>
          <a href="https://github.com/macidko/watchflow" target="_blank" rel="noopener noreferrer">github.com/macidko/watchflow</a>
        </div>
      </div>
    </div>
  );

  switch (section) {
    case 'appearance':
      return renderAppearanceSection();
    case 'layout':
      return renderLayoutSection();
    case 'dataManagement':
      return renderDataManagementSection();
    case 'language':
      return renderLanguageSection();
    case 'about':
      return renderAboutSection();
    default:
      return null;
  }
}

SettingsPanel.propTypes = {
  section: PropTypes.string,
  settings: PropTypes.object.isRequired,
  currentLayout: PropTypes.object.isRequired,
  updateTheme: PropTypes.func.isRequired,
  updateAccentColor: PropTypes.func.isRequired,
  updateMode: PropTypes.func.isRequired,
  updateCardSize: PropTypes.func.isRequired,
  updateDensity: PropTypes.func.isRequired,
  applyPreset: PropTypes.func.isRequired,
  onResetToDefault: PropTypes.func,
  handleShowStorage: PropTypes.func.isRequired,
  storageInfo: PropTypes.shape({
    totalSize: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    itemCount: PropTypes.number,
    items: PropTypes.array
  }),
  expandedItems: PropTypes.instanceOf(Set),
  toggleExpanded: PropTypes.func.isRequired,
  handleExportData: PropTypes.func.isRequired,
  handleFileSelect: PropTypes.func.isRequired,
  handleDragOver: PropTypes.func.isRequired,
  handleDrop: PropTypes.func.isRequired,
  setShowResetModal: PropTypes.func.isRequired,
  fileInputRef: PropTypes.object,
  updateLanguage: PropTypes.func.isRequired,
  showStorage: PropTypes.bool
};

SettingsPanel.defaultProps = {
  section: 'appearance',
  storageInfo: { totalSize: 0, itemCount: 0, items: [] },
  expandedItems: new Set(),
  fileInputRef: { current: null },
  showStorage: false
};
