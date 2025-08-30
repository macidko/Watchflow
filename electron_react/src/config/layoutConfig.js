// Layout Configuration System - Dynamic Slider & Card Layouts

export const LAYOUT_MODES = {
  SLIDER: 'slider',
  GRID: 'grid',
  LIST: 'list',
  MASONRY: 'masonry',
  CAROUSEL: 'carousel',
  TIMELINE: 'timeline'
};

export const CARD_SIZES = {
  COMPACT: 'compact',       // 140x200
  SMALL: 'small',          // 180x260  
  MEDIUM: 'medium',        // 220x320 (default)
  LARGE: 'large',          // 280x400
  EXTRA_LARGE: 'xl'        // 340x480
};

export const SLIDER_DENSITIES = {
  TIGHT: 'tight',          // 8px gap, 4-6 cards visible
  NORMAL: 'normal',        // 16px gap, 3-5 cards visible (default)
  RELAXED: 'relaxed',      // 24px gap, 2-4 cards visible
  SPACIOUS: 'spacious'     // 32px gap, 1-3 cards visible
};

export const CARD_STYLES = {
  MODERN: 'modern',        // Current style with gradients
  MINIMAL: 'minimal',      // Clean, flat design
  CLASSIC: 'classic',      // Traditional poster style
  COMPACT: 'compact',      // Information dense
  ARTISTIC: 'artistic',    // Creative layouts
  PROFESSIONAL: 'professional' // Corporate style
};

export const LAYOUT_PRESETS = {
  // Netflix-style horizontal scrolling
  NETFLIX: {
    mode: LAYOUT_MODES.SLIDER,
    cardSize: CARD_SIZES.MEDIUM,
    density: SLIDER_DENSITIES.NORMAL,
    style: CARD_STYLES.MODERN,
    gap: 16,
    itemsPerView: 'auto',
    showNavigation: true,
    showProgress: false
  },
  
  // IMDb-style grid layout
  GRID_CLASSIC: {
    mode: LAYOUT_MODES.GRID,
    cardSize: CARD_SIZES.SMALL,
    density: SLIDER_DENSITIES.NORMAL,
    style: CARD_STYLES.CLASSIC,
    columns: 'auto-fill',
    gap: 20,
    showNavigation: false,
    showProgress: false
  },
  
  // Compact list view
  COMPACT_LIST: {
    mode: LAYOUT_MODES.LIST,
    cardSize: CARD_SIZES.COMPACT,
    density: SLIDER_DENSITIES.TIGHT,
    style: CARD_STYLES.COMPACT,
    itemHeight: 80,
    gap: 8,
    showNavigation: false,
    showProgress: false
  },
  
  // Pinterest-style masonry
  MASONRY: {
    mode: LAYOUT_MODES.MASONRY,
    cardSize: CARD_SIZES.MEDIUM,
    density: SLIDER_DENSITIES.NORMAL,
    style: CARD_STYLES.ARTISTIC,
    columns: 'auto-fill',
    gap: 16,
    showNavigation: false,
    showProgress: false
  },
  
  // Carousel with large cards
  CAROUSEL_LARGE: {
    mode: LAYOUT_MODES.CAROUSEL,
    cardSize: CARD_SIZES.LARGE,
    density: SLIDER_DENSITIES.RELAXED,
    style: CARD_STYLES.MODERN,
    itemsPerView: 1,
    gap: 24,
    showNavigation: true,
    showProgress: true,
    autoplay: false
  },
  
  // Timeline view for chronological content
  TIMELINE: {
    mode: LAYOUT_MODES.TIMELINE,
    cardSize: CARD_SIZES.SMALL,
    density: SLIDER_DENSITIES.NORMAL,
    style: CARD_STYLES.MINIMAL,
    orientation: 'vertical',
    gap: 16,
    showNavigation: false,
    showProgress: true
  }
};

export const CARD_SIZE_CONFIG = {
  [CARD_SIZES.COMPACT]: {
    width: 140,
    height: 200,
    titleSize: '14px',
    metaSize: '11px',
    padding: '8px',
    borderRadius: '8px'
  },
  [CARD_SIZES.SMALL]: {
    width: 180,
    height: 260,
    titleSize: '15px',
    metaSize: '12px',
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
  },
  [CARD_SIZES.EXTRA_LARGE]: {
    width: 340,
    height: 480,
    titleSize: '20px',
    metaSize: '15px',
    padding: '20px',
    borderRadius: '20px'
  }
};

export const DENSITY_CONFIG = {
  [SLIDER_DENSITIES.TIGHT]: {
    gap: 8,
    padding: '12px',
    itemsVisible: { mobile: 2, tablet: 4, desktop: 6 }
  },
  [SLIDER_DENSITIES.NORMAL]: {
    gap: 16,
    padding: '16px',
    itemsVisible: { mobile: 1.5, tablet: 3, desktop: 5 }
  },
  [SLIDER_DENSITIES.RELAXED]: {
    gap: 24,
    padding: '20px',
    itemsVisible: { mobile: 1.2, tablet: 2.5, desktop: 4 }
  },
  [SLIDER_DENSITIES.SPACIOUS]: {
    gap: 32,
    padding: '24px',
    itemsVisible: { mobile: 1, tablet: 2, desktop: 3 }
  }
};

// Default layout settings
export const DEFAULT_LAYOUT = {
  preset: 'NETFLIX',
  ...LAYOUT_PRESETS.NETFLIX
};

// Storage key for user preferences
export const LAYOUT_STORAGE_KEY = 'watchflow_layout_preferences';
