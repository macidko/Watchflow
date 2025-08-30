import { useState, useEffect } from 'react';
import { 
  LAYOUT_MODES, 
  CARD_SIZES, 
  SLIDER_DENSITIES, 
  CARD_STYLES,
  LAYOUT_PRESETS,
  DEFAULT_LAYOUT,
  LAYOUT_STORAGE_KEY
} from '../config/layoutConfig';

export const useLayoutDynamic = () => {
  const [currentLayout, setCurrentLayout] = useState(() => {
    // Load saved layout from localStorage
    const saved = localStorage.getItem(LAYOUT_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.warn('Failed to parse saved layout, using default:', error);
      }
    }
    return DEFAULT_LAYOUT;
  });

  // Save to localStorage whenever layout changes
  useEffect(() => {
    try {
      localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(currentLayout));
    } catch (error) {
      console.warn('Failed to save layout to localStorage:', error);
    }
  }, [currentLayout]);

  // Apply preset configuration
  const applyPreset = (presetName) => {
    if (LAYOUT_PRESETS[presetName]) {
      setCurrentLayout({
        preset: presetName,
        ...LAYOUT_PRESETS[presetName]
      });
    } else {
      console.warn(`Preset ${presetName} not found`);
    }
  };

  // Update individual layout properties
  const updateLayout = (updates) => {
    setCurrentLayout(prev => ({
      ...prev,
      ...updates,
      preset: 'CUSTOM' // Mark as custom when individual properties are changed
    }));
  };

  // Update specific properties
  const updateMode = (mode) => updateLayout({ mode });
  const updateCardSize = (cardSize) => updateLayout({ cardSize });
  const updateDensity = (density) => updateLayout({ density });
  const updateStyle = (style) => updateLayout({ style });
  const updateGap = (gap) => updateLayout({ gap });

  // Reset to default
  const resetToDefault = () => {
    setCurrentLayout(DEFAULT_LAYOUT);
  };

  // Get current responsive breakpoint
  const getBreakpoint = () => {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  };

  // Calculate optimal items per view based on current settings
  const getOptimalItemsPerView = () => {
    const breakpoint = getBreakpoint();
    const { cardSize, density } = currentLayout;
    
    // Base calculations
    const cardWidth = {
      [CARD_SIZES.COMPACT]: 140,
      [CARD_SIZES.SMALL]: 180,
      [CARD_SIZES.MEDIUM]: 220,
      [CARD_SIZES.LARGE]: 280,
      [CARD_SIZES.EXTRA_LARGE]: 340
    }[cardSize] || 220;

    const gap = {
      [SLIDER_DENSITIES.TIGHT]: 8,
      [SLIDER_DENSITIES.NORMAL]: 16,
      [SLIDER_DENSITIES.RELAXED]: 24,
      [SLIDER_DENSITIES.SPACIOUS]: 32
    }[density] || 16;

    const containerWidth = {
      mobile: 320,
      tablet: 768,
      desktop: 1200
    }[breakpoint];

    const padding = 32; // Container padding
    const availableWidth = containerWidth - (padding * 2);
    
    // Calculate how many items can fit
    const itemsPerView = Math.floor(availableWidth / (cardWidth + gap));
    return Math.max(1, itemsPerView);
  };

  // Check if layout supports specific features
  const supportsNavigation = () => {
    return [LAYOUT_MODES.SLIDER, LAYOUT_MODES.CAROUSEL].includes(currentLayout.mode);
  };

  const supportsProgress = () => {
    return [LAYOUT_MODES.CAROUSEL, LAYOUT_MODES.TIMELINE].includes(currentLayout.mode);
  };

  const supportsVirtualization = () => {
    return [LAYOUT_MODES.GRID, LAYOUT_MODES.LIST, LAYOUT_MODES.MASONRY].includes(currentLayout.mode);
  };

  // Get CSS variables for current layout
  const getLayoutCSS = () => {
    const { cardSize, density, gap, style } = currentLayout;
    
    const cardConfig = {
      [CARD_SIZES.COMPACT]: { width: 140, height: 200 },
      [CARD_SIZES.SMALL]: { width: 180, height: 260 },
      [CARD_SIZES.MEDIUM]: { width: 220, height: 320 },
      [CARD_SIZES.LARGE]: { width: 280, height: 400 },
      [CARD_SIZES.EXTRA_LARGE]: { width: 340, height: 480 }
    }[cardSize] || { width: 220, height: 320 };

    const densityConfig = {
      [SLIDER_DENSITIES.TIGHT]: { gap: 8, padding: 12 },
      [SLIDER_DENSITIES.NORMAL]: { gap: 16, padding: 16 },
      [SLIDER_DENSITIES.RELAXED]: { gap: 24, padding: 20 },
      [SLIDER_DENSITIES.SPACIOUS]: { gap: 32, padding: 24 }
    }[density] || { gap: 16, padding: 16 };

    return {
      '--card-width': `${cardConfig.width}px`,
      '--card-height': `${cardConfig.height}px`,
      '--layout-gap': `${gap || densityConfig.gap}px`,
      '--layout-padding': `${densityConfig.padding}px`,
      '--items-per-view': getOptimalItemsPerView(),
      '--layout-mode': currentLayout.mode,
      '--card-style': style
    };
  };

  // Get responsive grid columns for grid layouts
  const getGridColumns = () => {
    const { cardSize } = currentLayout;
    const cardWidth = {
      [CARD_SIZES.COMPACT]: 140,
      [CARD_SIZES.SMALL]: 180, 
      [CARD_SIZES.MEDIUM]: 220,
      [CARD_SIZES.LARGE]: 280,
      [CARD_SIZES.EXTRA_LARGE]: 340
    }[cardSize] || 220;

    return `repeat(auto-fill, minmax(${cardWidth}px, 1fr))`;
  };

  return {
    // Current state
    currentLayout,
    
    // Actions
    applyPreset,
    updateLayout,
    updateMode,
    updateCardSize,
    updateDensity,
    updateStyle,
    updateGap,
    resetToDefault,
    
    // Getters
    getOptimalItemsPerView,
    getLayoutCSS,
    getGridColumns,
    getBreakpoint,
    
    // Feature support
    supportsNavigation,
    supportsProgress,
    supportsVirtualization,
    
    // Available options
    availablePresets: Object.keys(LAYOUT_PRESETS),
    availableModes: Object.values(LAYOUT_MODES),
    availableCardSizes: Object.values(CARD_SIZES),
    availableDensities: Object.values(SLIDER_DENSITIES),
    availableStyles: Object.values(CARD_STYLES)
  };
};
