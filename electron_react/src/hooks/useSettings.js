import { useState, useEffect } from 'react';
import { 
  THEMES, 
  ACCENT_COLORS, 
  LANGUAGES,
  THEME_CONFIG, 
  ACCENT_CONFIG,
  SETTINGS_KEYS,
  DEFAULT_SETTINGS 
} from '../config/themeConfig';

export const useSettings = () => {
  const [settings, setSettings] = useState(() => {
    // Load settings from localStorage
    const savedTheme = localStorage.getItem(SETTINGS_KEYS.THEME) || DEFAULT_SETTINGS.theme;
    const savedAccentColor = localStorage.getItem(SETTINGS_KEYS.ACCENT_COLOR) || DEFAULT_SETTINGS.accentColor;
    const savedLanguage = localStorage.getItem(SETTINGS_KEYS.LANGUAGE) || DEFAULT_SETTINGS.language;
    
    return {
      theme: savedTheme,
      accentColor: savedAccentColor,
      language: savedLanguage
    };
  });

  // Apply theme to CSS variables
  const applyTheme = (theme, accentColor) => {
    const root = document.documentElement;
    
    // Determine actual theme (handle auto mode)
    let actualTheme = theme;
    if (theme === THEMES.AUTO) {
      actualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches 
        ? THEMES.DARK 
        : THEMES.LIGHT;
    }
    
    // Apply theme variables
    const themeVars = THEME_CONFIG[actualTheme];
    if (themeVars) {
      Object.entries(themeVars).forEach(([property, value]) => {
        root.style.setProperty(property, value);
      });
    }
    
    // Apply accent color variables
    const accentVars = ACCENT_CONFIG[accentColor];
    if (accentVars) {
      Object.entries(accentVars).forEach(([property, value]) => {
        root.style.setProperty(property, value);
      });
    }
    
    // Add theme class to body for additional styling
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    document.body.classList.add(`theme-${actualTheme}`);
  };

  // Update theme
  const updateTheme = (newTheme) => {
    const updatedSettings = { ...settings, theme: newTheme };
    setSettings(updatedSettings);
    localStorage.setItem(SETTINGS_KEYS.THEME, newTheme);
    applyTheme(newTheme, settings.accentColor);
  };

  // Update accent color
  const updateAccentColor = (newAccentColor) => {
    const updatedSettings = { ...settings, accentColor: newAccentColor };
    setSettings(updatedSettings);
    localStorage.setItem(SETTINGS_KEYS.ACCENT_COLOR, newAccentColor);
    applyTheme(settings.theme, newAccentColor);
  };

  // Update language
  const updateLanguage = (newLanguage) => {
    const updatedSettings = { ...settings, language: newLanguage };
    setSettings(updatedSettings);
    localStorage.setItem(SETTINGS_KEYS.LANGUAGE, newLanguage);
    
    // Reload page to apply language changes
    window.location.reload();
  };

  // Reset to defaults
  const resetSettings = () => {
    const defaultSettings = DEFAULT_SETTINGS;
    setSettings(defaultSettings);
    
    // Clear localStorage
    localStorage.removeItem(SETTINGS_KEYS.THEME);
    localStorage.removeItem(SETTINGS_KEYS.ACCENT_COLOR);
    localStorage.removeItem(SETTINGS_KEYS.LANGUAGE);
    
    // Apply default theme
    applyTheme(defaultSettings.theme, defaultSettings.accentColor);
  };

  // Initialize theme on mount
  useEffect(() => {
    applyTheme(settings.theme, settings.accentColor);
    
    // Listen for system theme changes if auto mode is enabled
    if (settings.theme === THEMES.AUTO) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme(settings.theme, settings.accentColor);
      
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [settings.theme, settings.accentColor]);

  return {
    settings,
    updateTheme,
    updateAccentColor,
    updateLanguage,
    resetSettings,
    availableThemes: Object.values(THEMES),
    availableAccentColors: Object.values(ACCENT_COLORS),
    availableLanguages: Object.values(LANGUAGES)
  };
};

