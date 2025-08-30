
import React, { useState, useRef } from 'react';
import { t } from '../i18n';
import { useSettings } from '../hooks/useSettings';
import { DataManagementService } from '../services/dataManagementService';
import { THEMES, ACCENT_COLORS, LANGUAGES, LANGUAGE_CONFIG } from '../config/themeConfig';
import Toast from '../components/Toast';

const Ayarlar = () => {
  const { 
    settings, 
    updateTheme, 
    updateAccentColor, 
    updateLanguage
  } = useSettings();
  
  const [showStorage, setShowStorage] = useState(false);
  const [storageInfo, setStorageInfo] = useState({ items: [], totalSize: '0 B', itemCount: 0 });
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
          </div>
          <button className="primary-button" onClick={handleExportData}>
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
              className="secondary-button" 
              onClick={() => fileInputRef.current?.click()}
            >
              {t('pages.settings.dataManagement.import.selectFile')}
            </button>
          </div>
        </div>
        <div 
          className="drop-zone"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {t('pages.settings.dataManagement.import.dragDrop')}
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
              {storageInfo.items.map(({ key, size, preview }) => (
                <div key={key} className="storage-item">
                  <div className="storage-key">{key}</div>
                  <div className="storage-size">{size}</div>
                  <div className="storage-preview">{preview}</div>
                </div>
              ))}
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
        }

        .storage-summary {
          display: flex;
          gap: 20px;
          margin-bottom: 16px;
          font-weight: 600;
          color: var(--primary-text);
        }

        .storage-items {
          max-height: 300px;
          overflow-y: auto;
        }

        .storage-item {
          display: grid;
          grid-template-columns: 200px 80px 1fr;
          gap: 16px;
          padding: 12px 0;
          border-bottom: 1px solid var(--border-color);
          font-size: 13px;
        }

        .storage-item:last-child {
          border-bottom: none;
        }

        .storage-key {
          font-weight: 600;
          color: var(--primary-text);
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
      `}</style>
    </div>
  );
};

export default Ayarlar;
