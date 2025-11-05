// Layout Configuration System - Simplified & Functional

export const LAYOUT_MODES = {
  SLIDER: 'slider',    // Horizontal scrolling (Netflix-style) - PRIMARY
  GRID: 'grid',        // Responsive grid layout - SECONDARY
  LIST: 'list'         // Compact vertical list - TERTIARY
};

export const CARD_SIZES = {
  COMPACT: 'compact',  // 160x230 - Mobile optimized
  MEDIUM: 'medium',    // 220x320 - Default, balanced
  LARGE: 'large'       // 280x400 - Desktop, detailed
};

export const SLIDER_DENSITIES = {
  TIGHT: 'tight',      // 12px gap - More items visible
  NORMAL: 'normal',    // 20px gap - Balanced (default)
  RELAXED: 'relaxed'   // 32px gap - Fewer items, spacious
};

export const LAYOUT_PRESETS = {
  // Default: Netflix-style horizontal scrolling
  DEFAULT: {
    mode: LAYOUT_MODES.SLIDER,
    cardSize: CARD_SIZES.MEDIUM,
    density: SLIDER_DENSITIES.NORMAL,
    gap: 20
  },
  
  // Compact: Smaller cards, tighter spacing
  COMPACT: {
    mode: LAYOUT_MODES.SLIDER,
    cardSize: CARD_SIZES.COMPACT,
    density: SLIDER_DENSITIES.TIGHT,
    gap: 12
  },
  
  // Grid: Responsive grid layout
  GRID: {
    mode: LAYOUT_MODES.GRID,
    cardSize: CARD_SIZES.MEDIUM,
    density: SLIDER_DENSITIES.NORMAL,
    gap: 20
  },
  
  // Gallery: Large cards in grid
  GALLERY: {
    mode: LAYOUT_MODES.GRID,
    cardSize: CARD_SIZES.LARGE,
    density: SLIDER_DENSITIES.RELAXED,
    gap: 32
  },
  
  // List: Compact vertical list
  LIST: {
    mode: LAYOUT_MODES.LIST,
    cardSize: CARD_SIZES.COMPACT,
    density: SLIDER_DENSITIES.TIGHT,
    gap: 8
  }
};

export const CARD_SIZE_CONFIG = {
  [CARD_SIZES.COMPACT]: {
    width: 160,
    height: 230,
    titleSize: '14px',
    metaSize: '11px',
    padding: '10px',
    borderRadius: '10px'
  },
  [CARD_SIZES.MEDIUM]: {
    width: 220,
    height: 320,
    titleSize: '16px',
    metaSize: '13px',
    padding: '12px',
    borderRadius: '12px'
  },
  [CARD_SIZES.LARGE]: {
    width: 280,
    height: 400,
    titleSize: '18px',
    metaSize: '14px',
    padding: '16px',
    borderRadius: '16px'
  }
};

export const DENSITY_CONFIG = {
  [SLIDER_DENSITIES.TIGHT]: {
    gap: 12,
    padding: '12px'
  },
  [SLIDER_DENSITIES.NORMAL]: {
    gap: 20,
    padding: '16px'
  },
  [SLIDER_DENSITIES.RELAXED]: {
    gap: 32,
    padding: '24px'
  }
};

// Default layout settings
export const DEFAULT_LAYOUT = {
  preset: 'DEFAULT',
  ...LAYOUT_PRESETS.DEFAULT
};

// Storage key for user preferences
export const LAYOUT_STORAGE_KEY = 'watchflow_layout_preferences';

