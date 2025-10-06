
import React, { useState, useRef } from 'react';
import { t } from '../i18n';
import { useSettings } from '../hooks/useSettings';
import { DataManagementService } from '../services/dataManagementService';
import { THEMES, ACCENT_COLORS, LANGUAGES, LANGUAGE_CONFIG } from '../config/themeConfig';
import { useLayoutDynamic } from '../hooks/useLayoutDynamic';
import { 
  LAYOUT_MODES, 
  CARD_SIZES, 
  SLIDER_DENSITIES,
  LAYOUT_PRESETS 
} from '../config/layoutConfig';
import Toast from '../components/ui/Toast';

const Ayarlar = () => {
  const { 
    settings, 
    updateTheme, 
    updateAccentColor, 
    updateLanguage
  } = useSettings();
  
  const { 
    currentLayout, 
    applyPreset, 
    updateMode, 
    updateCardSize, 
    updateDensity,
    resetToDefault
  } = useLayoutDynamic();
  
  const [showStorage, setShowStorage] = useState(false);
  const [storageInfo, setStorageInfo] = useState({ items: [], totalSize: '0 B', itemCount: 0 });
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [activeSection, setActiveSection] = useState('appearance');
  const [showResetModal, setShowResetModal] = useState(false);
  const [toast, setToast] = useState(null);
  const fileInputRef = useRef(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleShowStorage = () => {
    if (!showStorage) {
      const info = DataManagementService.getStorageInfo();
      setStorageInfo(info);
    }
    setShowStorage(!showStorage);
  };

  const toggleExpanded = (key) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedItems(newExpanded);
  };

  const formatJsonValue = (value) => {
    try {
      const parsed = JSON.parse(value);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return value;
    }
  };

  const handleExportData = () => {
    const result = DataManagementService.exportData();
    if (result.success) {
      showToast(t('toast.dataExported'));
    } else {
      showToast(result.message, 'error');
    }
  };

  const handleImportData = async (file) => {
    const result = await DataManagementService.importData(file);
    if (result.success) {
      showToast(t('toast.dataImported'));
      if (result.requiresReload) {
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } else {
      showToast(result.message, 'error');
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      handleImportData(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      handleImportData(file);
    }
  };

  const handleResetData = () => {
    const result = DataManagementService.resetAllData();
    if (result.success) {
      showToast(t('toast.dataReset'));
      setShowResetModal(false);
      if (result.requiresReload) {
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } else {
      showToast(result.message, 'error');
    }
  };

  const sections = [
    { id: 'appearance', title: t('pages.settings.sections.appearance'), icon: '🎨' },
    { id: 'layout', title: 'Layout Settings', icon: '📐' },
    { id: 'dataManagement', title: t('pages.settings.sections.dataManagement'), icon: '💾' },
    { id: 'language', title: t('pages.settings.sections.language'), icon: '🌍' },
    { id: 'about', title: t('pages.settings.sections.about'), icon: 'ℹ️' }
  ];

  const renderAppearanceSection = () => (
    <div className="settings-section">
      <h3 className="section-title">{t('pages.settings.appearance.title')}</h3>
      <p className="section-description">{t('pages.settings.appearance.description')}</p>
      
      {/* Theme Selection */}
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
                {theme === THEMES.DARK ? '🌙' : 
                 theme === THEMES.LIGHT ? '☀️' : '🌓'}
              </span>
              <span>{t(`pages.settings.appearance.themeOptions.${theme}`)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Accent Color Selection */}
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
        
        {/* Layout Mode */}
        <div className="setting-group">
          <label className="setting-label">Layout Mode</label>
          <div className="layout-options">
            {Object.values(LAYOUT_MODES).map(mode => (
              <button
                key={mode}
                className={`layout-option ${currentLayout.mode === mode ? 'active' : ''}`}
                onClick={() => updateMode(mode)}
              >
                <div className="layout-icon">
                  {layoutIcons[mode]}
                </div>
                <span className="layout-name">{mode.charAt(0).toUpperCase() + mode.slice(1)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Card Size */}
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

        {/* Spacing */}
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

        {/* Presets */}
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
            <button
              className="preset-option reset"
              onClick={resetToDefault}
            >
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
      
      {/* Export Data */}
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

      {/* Import Data */}
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
            <button 
              className="secondary-button import-button" 
              onClick={() => fileInputRef.current?.click()}
            >
              <span className="button-icon">📂</span>
              {t('pages.settings.dataManagement.import.selectFile')}
            </button>
          </div>
        </div>
        <div 
          className="drop-zone"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="drop-content">
            <span className="drop-icon">📤</span>
            <span>{t('pages.settings.dataManagement.import.dragDrop')}</span>
            <small>Desteklenen format: .json</small>
          </div>
        </div>
      </div>

      {/* Storage Info */}
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
                        <button 
                          className="expand-button"
                          onClick={() => toggleExpanded(key)}
                          title={isExpanded ? 'Daralt' : 'Genişlet'}
                        >
                          {isExpanded ? '🔽' : '▶️'}
                        </button>
                      )}
                    </div>
                    <div className="storage-size">{size}</div>
                    <div className="storage-preview">
                      {isExpanded && isJson ? (
                        <pre className="json-preview">{formatJsonValue(fullValue)}</pre>
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

      {/* Reset Data */}
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
            <button
              key={lang}
              className={`language-option ${settings.language === lang ? 'active' : ''}`}
              onClick={() => updateLanguage(lang)}
            >
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
        <div className="about-item">
          <strong>{t('pages.settings.about.version')}:</strong> 1.0.0
        </div>
        <div className="about-item">
          <strong>{t('pages.settings.about.author')}:</strong> Watchflow Team
        </div>
        <div className="about-item">
          <strong>{t('pages.settings.about.github')}:</strong> 
          <a href="https://github.com/macidko/watchflow" target="_blank" rel="noopener noreferrer">
            github.com/macidko/watchflow
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <div className="settings-page">
      {/* Header */}
      <div className="settings-header">
        <div className="container">
          <div className="header-content">
            <h1>{t('pages.settings.title')}</h1>
            <p>{t('pages.settings.description')}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="settings-content">
        <div className="container">
          <div className="settings-layout">
            {/* Sidebar */}
            <div className="settings-sidebar">
              <nav className="settings-nav">
                {sections.map(section => (
                  <button
                    key={section.id}
                    className={`nav-item ${activeSection === section.id ? 'active' : ''}`}
                    onClick={() => setActiveSection(section.id)}
                  >
                    <span className="nav-icon">{section.icon}</span>
                    <span className="nav-text">{section.title}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Main Content */}
            <div className="settings-main">
              {activeSection === 'appearance' && renderAppearanceSection()}
              {activeSection === 'layout' && renderLayoutSection()}
              {activeSection === 'dataManagement' && renderDataManagementSection()}
              {activeSection === 'language' && renderLanguageSection()}
              {activeSection === 'about' && renderAboutSection()}
            </div>
          </div>
        </div>
      </div>

      {/* Reset Modal */}
      {showResetModal && (
        <div className="modal-overlay" onClick={() => setShowResetModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{t('modals.confirmReset.title')}</h3>
            <p>{t('modals.confirmReset.message')}</p>
            <div className="modal-actions">
              <button className="secondary-button" onClick={() => setShowResetModal(false)}>
                {t('modals.confirmReset.cancel')}
              </button>
              <button className="danger-button" onClick={handleResetData}>
                {t('modals.confirmReset.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      <style jsx>{`
        .settings-page {
          min-height: 100vh;
          background: var(--primary-bg);
        }

        .settings-header {
          padding: 112px 16px 40px;
          background: var(--primary-bg);
        }

        .container {
          max-width: 1280px;
          margin: 0 auto;
        }

        .header-content {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .header-content h1 {
          font-size: 30px;
          font-weight: 600;
          color: var(--primary-text);
          margin: 0;
        }

        .header-content p {
          font-size: 18px;
          color: var(--text-muted);
          margin: 0;
        }

        .settings-content {
          padding: 0 32px 64px;
        }

        .settings-layout {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 40px;
        }

        .settings-sidebar {
          position: sticky;
          top: 120px;
          height: fit-content;
        }

        .settings-nav {
          background: var(--card-bg);
          border-radius: var(--border-radius-lg);
          padding: 8px;
          box-shadow: var(--card-shadow);
        }

        .nav-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border: none;
          background: none;
          color: var(--primary-text);
          border-radius: var(--border-radius-md);
          cursor: pointer;
          transition: var(--transition-standard);
          text-align: left;
        }

        .nav-item:hover {
          background: var(--hover-bg);
        }

        .nav-item.active {
          background: var(--accent-color);
          color: white;
        }

        .nav-icon {
          font-size: 18px;
        }

        .nav-text {
          font-weight: 500;
        }

        .settings-main {
          background: var(--card-bg);
          border-radius: var(--border-radius-lg);
          box-shadow: var(--card-shadow);
        }

        .settings-section {
          padding: 32px;
        }

        .section-title {
          font-size: 24px;
          font-weight: 600;
          color: var(--primary-text);
          margin: 0 0 8px 0;
        }

        .section-description {
          color: var(--text-muted);
          margin: 0 0 32px 0;
        }

        .setting-group {
          margin-bottom: 32px;
        }

        .setting-group:last-child {
          margin-bottom: 0;
        }

        .setting-label {
          display: block;
          font-weight: 600;
          color: var(--primary-text);
          margin-bottom: 12px;
        }

        .setting-item {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 16px;
        }

        .setting-item h4 {
          margin: 0 0 4px 0;
          color: var(--primary-text);
          font-weight: 600;
        }

        .setting-item p {
          margin: 0;
          color: var(--text-muted);
          font-size: 14px;
        }

        .warning-text {
          color: var(--danger-color);
          font-weight: 500;
        }

        .theme-options {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 12px;
        }

        .theme-option {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 16px;
          border: 2px solid var(--border-color);
          background: var(--secondary-bg);
          border-radius: var(--border-radius-md);
          cursor: pointer;
          transition: var(--transition-standard);
          color: var(--primary-text);
        }

        .theme-option:hover {
          border-color: var(--accent-color);
        }

        .theme-option.active {
          border-color: var(--accent-color);
          background: rgba(var(--accent-color-rgb), 0.1);
        }

        .theme-icon {
          font-size: 24px;
        }

        .accent-colors {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 12px;
        }

        .accent-color {
          padding: 12px 16px;
          border: 2px solid var(--border-color);
          background: var(--secondary-bg);
          border-radius: var(--border-radius-md);
          cursor: pointer;
          transition: var(--transition-standard);
          color: var(--primary-text);
        }

        .accent-color:hover {
          border-color: var(--accent-color);
        }

        .accent-color.active {
          border-color: var(--accent-color);
          background: rgba(var(--accent-color-rgb), 0.1);
        }

        .accent-color[data-color="orange"]:hover,
        .accent-color[data-color="orange"].active {
          border-color: #ff4500;
        }

        .accent-color[data-color="blue"]:hover,
        .accent-color[data-color="blue"].active {
          border-color: #1976d2;
        }

        .accent-color[data-color="green"]:hover,
        .accent-color[data-color="green"].active {
          border-color: #388e3c;
        }

        .accent-color[data-color="purple"]:hover,
        .accent-color[data-color="purple"].active {
          border-color: #7b1fa2;
        }

        .accent-color[data-color="red"]:hover,
        .accent-color[data-color="red"].active {
          border-color: #d32f2f;
        }

        .accent-color[data-color="yellow"]:hover,
        .accent-color[data-color="yellow"].active {
          border-color: #f57c00;
        }

        .language-options {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 12px;
        }

        .language-option {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          border: 2px solid var(--border-color);
          background: var(--secondary-bg);
          border-radius: var(--border-radius-md);
          cursor: pointer;
          transition: var(--transition-standard);
          color: var(--primary-text);
        }

        .language-option:hover {
          border-color: var(--accent-color);
        }

        .language-option.active {
          border-color: var(--accent-color);
          background: rgba(var(--accent-color-rgb), 0.1);
        }

        .language-flag {
          font-size: 20px;
        }

        .primary-button {
          padding: 10px 20px;
          background: var(--accent-color);
          color: white;
          border: none;
          border-radius: var(--border-radius-md);
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition-standard);
        }

        .primary-button:hover {
          background: var(--hover-color);
        }

        .secondary-button {
          padding: 10px 20px;
          background: var(--secondary-bg);
          color: var(--primary-text);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-md);
          font-weight: 500;
          cursor: pointer;
          transition: var(--transition-standard);
        }

        .secondary-button:hover {
          border-color: var(--accent-color);
        }

        .danger-button {
          padding: 10px 20px;
          background: var(--danger-color);
          color: white;
          border: none;
          border-radius: var(--border-radius-md);
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition-standard);
        }

        .danger-button:hover {
          background: #c62828;
        }

        .drop-zone {
          margin-top: 16px;
          padding: 40px 20px;
          border: 2px dashed var(--border-color);
          border-radius: var(--border-radius-md);
          text-align: center;
          color: var(--text-muted);
          transition: var(--transition-standard);
        }

        .drop-zone:hover {
          border-color: var(--accent-color);
          color: var(--accent-color);
        }

        .storage-details {
          margin-top: 16px;
          padding: 20px;
          background: var(--secondary-bg);
          border-radius: var(--border-radius-md);
          border: 1px solid var(--border-color);
        }

        .storage-summary {
          display: flex;
          gap: 20px;
          margin-bottom: 16px;
          font-weight: 600;
          color: var(--primary-text);
          padding: 12px;
          background: var(--card-bg);
          border-radius: var(--border-radius-sm);
        }

        .storage-items {
          max-height: 300px;
          overflow-y: auto;
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-sm);
        }

        .storage-item {
          display: grid;
          grid-template-columns: 280px 80px 1fr;
          gap: 16px;
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-color);
          font-size: 13px;
          transition: background-color 0.2s;
        }

        .storage-item:hover {
          background: color-mix(in srgb, var(--accent-color) 5%, var(--secondary-bg));
        }

        .storage-item:last-child {
          border-bottom: none;
        }

        .storage-key {
          font-weight: 600;
          color: var(--primary-text);
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          word-break: break-all;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .expand-button {
          background: none;
          border: none;
          cursor: pointer;
          padding: 2px 4px;
          border-radius: 4px;
          transition: background-color 0.2s;
          font-size: 12px;
        }

        .expand-button:hover {
          background: var(--border-color);
        }

        .storage-size {
          font-weight: 500;
          color: var(--accent-color);
          text-align: center;
        }

        .storage-preview {
          color: var(--text-muted);
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 12px;
          word-break: break-word;
          line-height: 1.4;
        }

        .json-preview {
          background: var(--card-bg);
          padding: 12px;
          border-radius: var(--border-radius-sm);
          border: 1px solid var(--border-color);
          margin: 8px 0;
          overflow-x: auto;
          white-space: pre-wrap;
          max-height: 300px;
          overflow-y: auto;
          font-size: 11px;
          line-height: 1.5;
        }

        .text-preview {
          display: block;
          padding: 4px 0;
        }

        .storage-size {
          color: var(--accent-color);
        }

        .storage-preview {
          color: var(--text-muted);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .about-info {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .about-item {
          color: var(--primary-text);
        }

        .about-item a {
          color: var(--accent-color);
          text-decoration: none;
        }

        .about-item a:hover {
          text-decoration: underline;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: var(--overlay-bg);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal {
          background: var(--card-bg);
          border-radius: var(--border-radius-lg);
          padding: 32px;
          max-width: 500px;
          margin: 20px;
          box-shadow: var(--popup-shadow);
        }

        .modal h3 {
          margin: 0 0 16px 0;
          color: var(--primary-text);
        }

        .modal p {
          margin: 0 0 24px 0;
          color: var(--text-muted);
        }

        .modal-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }

        @media (max-width: 768px) {
          .settings-layout {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .settings-sidebar {
            position: static;
          }

          .settings-nav {
            display: flex;
            overflow-x: auto;
            gap: 8px;
            padding: 8px;
          }

          .nav-item {
            flex-shrink: 0;
            min-width: 120px;
          }

          .setting-item {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }

          .theme-options,
          .accent-colors,
          .language-options {
            grid-template-columns: 1fr;
          }
        }

        /* Layout Settings Styles */
        .layout-options {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 12px;
          margin-top: 12px;
        }

        .layout-option {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 16px 12px;
          border: 2px solid var(--border-color);
          border-radius: var(--border-radius-md);
          background: var(--secondary-bg);
          color: var(--primary-text);
          cursor: pointer;
          transition: var(--transition-standard);
          text-align: center;
        }

        .layout-option:hover {
          border-color: var(--accent-color);
          background: color-mix(in srgb, var(--accent-color) 5%, var(--secondary-bg));
        }

        .layout-option.active {
          border-color: var(--accent-color);
          background: color-mix(in srgb, var(--accent-color) 10%, var(--secondary-bg));
          color: var(--accent-color);
        }

        .layout-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          color: var(--text-muted);
        }

        .layout-option.active .layout-icon {
          color: var(--accent-color);
        }

        .layout-name {
          font-size: 14px;
          font-weight: 500;
        }

        .size-options,
        .density-options,
        .style-options {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 12px;
        }

        .size-option,
        .density-option,
        .style-option {
          padding: 8px 16px;
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-md);
          background: var(--secondary-bg);
          color: var(--primary-text);
          cursor: pointer;
          transition: var(--transition-standard);
          font-size: 14px;
          font-weight: 500;
        }

        .size-option:hover,
        .density-option:hover,
        .style-option:hover {
          border-color: var(--accent-color);
          background: color-mix(in srgb, var(--accent-color) 5%, var(--secondary-bg));
        }

        .size-option.active,
        .density-option.active,
        .style-option.active {
          border-color: var(--accent-color);
          background: var(--accent-color);
          color: white;
        }

        .preset-options {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 8px;
          margin-top: 12px;
        }

        .preset-option {
          padding: 12px 16px;
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-md);
          background: var(--secondary-bg);
          color: var(--primary-text);
          cursor: pointer;
          transition: var(--transition-standard);
          font-size: 14px;
          font-weight: 500;
          text-align: center;
        }

        .preset-option:hover {
          border-color: var(--accent-color);
          background: color-mix(in srgb, var(--accent-color) 5%, var(--secondary-bg));
        }

        .preset-option.active {
          border-color: var(--accent-color);
          background: color-mix(in srgb, var(--accent-color) 10%, var(--secondary-bg));
          color: var(--accent-color);
        }

        .preset-option.reset {
          border-color: var(--danger-color);
          color: var(--danger-color);
        }

        .preset-option.reset:hover {
          background: color-mix(in srgb, var(--danger-color) 5%, var(--secondary-bg));
        }

        .size-label,
        .density-label,
        .style-label,
        .preset-label {
          white-space: nowrap;
        }

        .drop-zone {
          padding: 40px 20px;
          border: 2px dashed var(--border-color);
          border-radius: var(--border-radius-md);
          text-align: center;
          color: var(--text-muted);
          transition: var(--transition-standard);
          cursor: pointer;
        }

        .drop-zone:hover {
          border-color: var(--accent-color);
          color: var(--accent-color);
          background: color-mix(in srgb, var(--accent-color) 5%, transparent);
        }

        .drop-content {
          display: flex;
          flex-direction: column;
          gap: 8px;
          align-items: center;
        }

        .drop-icon {
          font-size: 24px;
        }

        .button-icon {
          margin-right: 8px;
        }

        .export-button,
        .import-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          font-weight: 500;
        }

        .info-text {
          color: var(--text-muted);
          font-size: 12px;
          margin-top: 4px;
        }
      `}</style>
    </div>
  );
};

export default Ayarlar;
