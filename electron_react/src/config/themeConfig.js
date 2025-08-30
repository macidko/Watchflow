// Theme configurations
export const THEMES = {
  DARK: 'dark',
  LIGHT: 'light',
  AUTO: 'auto'
};

export const ACCENT_COLORS = {
  ORANGE: 'orange',
  BLUE: 'blue', 
  GREEN: 'green',
  PURPLE: 'purple',
  RED: 'red',
  YELLOW: 'yellow'
};

export const THEME_CONFIG = {
  [THEMES.DARK]: {
    '--primary-bg': '#121212',
    '--secondary-bg': '#1e1e1e',
    '--primary-text': '#ffffff',
    '--secondary-text': '#b3b3b3',
    '--border-color': '#2a2a2a',
    '--input-bg': '#2c2c2c',
    '--dropdown-bg': '#1a1a1a',
    '--card-bg': '#1e1e1e',
    '--secondary-bg-transparent': 'rgba(30, 30, 30, 0.7)',
    '--hover-bg': 'rgba(40, 40, 45, 0.8)',
    '--border-color-hover': '#3a3a3a',
    '--tag-bg': 'rgba(50, 50, 54, 0.8)',
    '--overlay-bg': 'rgba(0, 0, 0, 0.8)',
    '--text-muted': '#8a8a8a'
  },
  [THEMES.LIGHT]: {
    '--primary-bg': '#ffffff',
    '--secondary-bg': '#f5f5f5',
    '--primary-text': '#1a1a1a',
    '--secondary-text': '#666666',
    '--border-color': '#e0e0e0',
    '--input-bg': '#ffffff',
    '--dropdown-bg': '#ffffff',
    '--card-bg': '#ffffff',
    '--secondary-bg-transparent': 'rgba(245, 245, 245, 0.9)',
    '--hover-bg': 'rgba(240, 240, 240, 0.8)',
    '--border-color-hover': '#d0d0d0',
    '--tag-bg': 'rgba(240, 240, 240, 0.8)',
    '--overlay-bg': 'rgba(255, 255, 255, 0.9)',
    '--text-muted': '#757575'
  }
};

export const ACCENT_CONFIG = {
  [ACCENT_COLORS.ORANGE]: {
    '--accent-color': '#ff4500',
    '--accent-color-rgb': '255, 69, 0',
    '--hover-color': '#ff6a33'
  },
  [ACCENT_COLORS.BLUE]: {
    '--accent-color': '#1976d2',
    '--accent-color-rgb': '25, 118, 210',
    '--hover-color': '#1565c0'
  },
  [ACCENT_COLORS.GREEN]: {
    '--accent-color': '#388e3c',
    '--accent-color-rgb': '56, 142, 60', 
    '--hover-color': '#2e7d32'
  },
  [ACCENT_COLORS.PURPLE]: {
    '--accent-color': '#7b1fa2',
    '--accent-color-rgb': '123, 31, 162',
    '--hover-color': '#6a1b9a'
  },
  [ACCENT_COLORS.RED]: {
    '--accent-color': '#d32f2f',
    '--accent-color-rgb': '211, 47, 47',
    '--hover-color': '#c62828'
  },
  [ACCENT_COLORS.YELLOW]: {
    '--accent-color': '#f57c00',
    '--accent-color-rgb': '245, 124, 0',
    '--hover-color': '#ef6c00'
  }
};

// Language configurations
export const LANGUAGES = {
  TR: 'tr',
  EN: 'en'
};

export const LANGUAGE_CONFIG = {
  [LANGUAGES.TR]: {
    name: 'Türkçe',
    flag: '🇹🇷',
    direction: 'ltr'
  },
  [LANGUAGES.EN]: {
    name: 'English',
    flag: '🇺🇸', 
    direction: 'ltr'
  }
};

// Settings storage keys
export const SETTINGS_KEYS = {
  THEME: 'watchflow_theme',
  ACCENT_COLOR: 'watchflow_accent_color',
  LANGUAGE: 'watchflow_language'
};

// Default settings
export const DEFAULT_SETTINGS = {
  theme: THEMES.DARK,
  accentColor: ACCENT_COLORS.ORANGE,
  language: LANGUAGES.TR
};
