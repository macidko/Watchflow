import React, { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useLayoutDynamic } from '../../hooks/useLayoutDynamic';

const LayoutController = ({ children }) => {
  const { currentLayout, getLayoutCSS } = useLayoutDynamic();

  // Memoize layout CSS to prevent recalculation
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const layoutCSS = useMemo(() => getLayoutCSS(), [currentLayout]);

  useEffect(() => {
    // Apply layout CSS to document root
    const root = document.documentElement;
    const appliedProperties = [];
    
    Object.entries(layoutCSS).forEach(([property, value]) => {
      root.style.setProperty(property, value);
      appliedProperties.push(property);
    });

    // Apply responsive classes efficiently
    const bodyClassList = document.body.classList;
    
    // Store previous classes for cleanup
    const layoutClasses = [
      'layout-slider', 'layout-grid', 'layout-list', 
      'layout-masonry', 'layout-carousel', 'layout-timeline'
    ];
    const cardSizeClasses = [
      'card-compact', 'card-small', 'card-medium', 
      'card-large', 'card-extra-large'
    ];
    const styleClasses = [
      'style-modern', 'style-minimal', 'style-classic',
      'style-compact', 'style-artistic', 'style-professional'
    ];
    
    // Remove all layout-related classes at once
    bodyClassList.remove(...layoutClasses, ...cardSizeClasses, ...styleClasses);
    
    // Add new classes
    bodyClassList.add(
      `layout-${currentLayout.mode}`,
      `card-${currentLayout.cardSize.replace('_', '-')}`,
      `style-${currentLayout.style}`
    );
    
    // Cleanup function
    return () => {
      // Remove applied CSS custom properties
      appliedProperties.forEach(property => {
        root.style.removeProperty(property);
      });
      
      // Remove applied classes
      bodyClassList.remove(
        `layout-${currentLayout.mode}`,
        `card-${currentLayout.cardSize.replace('_', '-')}`,
        `style-${currentLayout.style}`
      );
    };
  }, [currentLayout, layoutCSS]);

  return (
    <>
      <style>{`
        /* Global Layout Styles */
        .layout-slider .dynamic-slider {
          --layout-flow: row;
          --layout-wrap: nowrap;
          --layout-overflow: auto;
        }
        
        .layout-grid .dynamic-slider {
          --layout-flow: row;
          --layout-wrap: wrap;
          --layout-overflow: visible;
        }
        
        .layout-list .dynamic-slider {
          --layout-flow: column;
          --layout-wrap: nowrap;
          --layout-overflow: visible;
        }
        
        .layout-masonry .dynamic-slider {
          --layout-flow: column;
          --layout-wrap: wrap;
          --layout-overflow: visible;
        }
        
        .layout-carousel .dynamic-slider {
          --layout-flow: row;
          --layout-wrap: nowrap;
          --layout-overflow: hidden;
        }
        
        .layout-timeline .dynamic-slider {
          --layout-flow: column;
          --layout-wrap: nowrap;
          --layout-overflow: visible;
        }
        
        /* Card Size Responsive Adjustments */
        @media (max-width: 768px) {
          .card-extra-large,
          .card-large {
            --card-width: var(--card-width-medium);
            --card-height: var(--card-height-medium);
          }
        }
        
        @media (max-width: 480px) {
          .card-extra-large,
          .card-large,
          .card-medium {
            --card-width: var(--card-width-small);
            --card-height: var(--card-height-small);
          }
          
          .layout-grid .dynamic-slider {
            --grid-columns: 2;
          }
          
          .layout-masonry .dynamic-slider {
            --masonry-columns: 2;
          }
        }
        
        /* Animation Preferences */
        @media (prefers-reduced-motion: reduce) {
          .dynamic-slider * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
        
        /* High Contrast Mode */
        @media (prefers-contrast: high) {
          .dynamic-card {
            border-width: 2px;
            border-style: solid;
          }
          
          .control-button {
            border-width: 2px;
          }
        }
        
        /* Print Styles */
        @media print {
          .layout-slider .dynamic-slider,
          .layout-carousel .dynamic-slider {
            display: grid !important;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)) !important;
            gap: 16px !important;
          }
          
          .advanced-view-switcher,
          .carousel-navigation,
          .slider-controls {
            display: none !important;
          }
        }
        
        /* Dark Mode Enhancements */
        @media (prefers-color-scheme: dark) {
          .style-minimal .dynamic-card {
            backdrop-filter: blur(12px);
          }
          
          .style-artistic .dynamic-card {
            box-shadow: 
              0 8px 32px rgba(0, 0, 0, 0.4),
              inset 0 1px 0 rgba(255, 255, 255, 0.1);
          }
        }
        
        /* Performance Optimizations */
        .dynamic-slider {
          contain: layout style paint;
        }
        
        .dynamic-card {
          contain: layout style paint;
        }
        
        /* Only apply will-change during interactions */
        .dynamic-slider:hover .dynamic-card,
        .dynamic-card:hover {
          will-change: transform;
        }
        
        .layout-carousel .dynamic-card,
        .layout-slider .dynamic-card {
          transform: translateZ(0);
          backface-visibility: hidden;
        }
        
        /* Focus Management */
        .dynamic-slider:focus-within .dynamic-card:not(:focus-within) {
          opacity: 0.7;
          transition: opacity 0.2s ease;
        }
        
        .dynamic-card:focus-within {
          z-index: 10;
          outline: 3px solid var(--accent-color);
          outline-offset: 3px;
          /* Avoid transform during focus for keyboard users */
        }
        
        /* Only scale on mouse interactions, not keyboard */
        @media (hover: hover) and (pointer: fine) {
          .dynamic-card:hover {
            transform: scale(1.02);
          }
        }
        
        /* Loading States */
        .dynamic-slider.loading {
          pointer-events: none;
        }
        
        .dynamic-slider.loading .dynamic-card {
          opacity: 0.6;
          animation: pulse 2s ease-in-out infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 0.8; }
        }
        
        /* Drag and Drop States */
        .dynamic-slider.drag-active {
          outline: 2px dashed var(--accent-color);
          outline-offset: 4px;
          background: color-mix(in srgb, var(--accent-color) 5%, transparent);
        }
        
        .dynamic-card.dragging {
          opacity: 0.8;
          transform: rotate(3deg) scale(0.95);
          z-index: 1000;
          box-shadow: 
            0 20px 40px rgba(0, 0, 0, 0.3),
            0 10px 20px rgba(0, 0, 0, 0.2);
        }
        
        /* Accessibility Enhancements */
        .dynamic-slider[aria-busy="true"] .dynamic-card {
          cursor: wait;
        }
        
        .dynamic-card[aria-selected="true"] {
          outline: 3px solid var(--accent-color);
          outline-offset: 2px;
        }
        
        /* Custom Scrollbars for Webkit */
        .layout-slider .dynamic-slider::-webkit-scrollbar {
          height: 8px;
        }
        
        .layout-slider .dynamic-slider::-webkit-scrollbar-track {
          background: var(--secondary-bg);
          border-radius: 4px;
        }
        
        .layout-slider .dynamic-slider::-webkit-scrollbar-thumb {
          background: var(--border-color);
          border-radius: 4px;
        }
        
        .layout-slider .dynamic-slider::-webkit-scrollbar-thumb:hover {
          background: var(--accent-color);
        }
      `}</style>
      {children}
    </>
  );
};

LayoutController.propTypes = {
  children: PropTypes.node.isRequired
};

export default LayoutController;
