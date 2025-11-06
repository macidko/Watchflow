# DynamicSlider Component

## Overview
DynamicSlider is a highly modular, reusable slider component that supports multiple layout modes (Slider, Grid, List) with drag-and-drop functionality, responsive design, and comprehensive accessibility features.

## Architecture

### Component Structure
```
DynamicSlider/
├── DynamicSlider.jsx              # Main component
├── DynamicSlider.module.css       # Scoped styles
├── DynamicSliderHeader.jsx        # Header with navigation
├── DynamicSliderEmpty.jsx         # Empty state component
├── DynamicSliderCompact.jsx       # Compact view for drag operations
├── DynamicSliderLoading.jsx       # Loading skeleton
├── SliderLayout.jsx               # Horizontal slider layout
├── GridLayout.jsx                 # Grid layout
├── ListLayout.jsx                 # List layout
├── useDynamicSliderScroll.js      # Scroll management hook
├── useDynamicSliderDrag.js        # Drag & drop hook
├── useDynamicSliderState.js       # State management hook
└── index.js                       # Exports
```

## Features

### ✅ Multiple Layout Modes
- **Slider Mode**: Horizontal scrolling slider
- **Grid Mode**: Responsive grid layout
- **List Mode**: Vertical list with compact cards

### ✅ Drag & Drop
- Global drag state management
- Visual feedback on drag over
- Cross-slider item movement
- Compact view during drag operations

### ✅ Performance Optimizations
- Debounced scroll and resize handlers
- Memoized layout calculations
- Lazy rendering
- Optimized re-renders with hooks

### ✅ Accessibility
- ARIA labels and roles
- Keyboard navigation
- Focus management
- Screen reader support

### ✅ Responsive Design
- Mobile-first approach
- Touch-friendly interactions
- Adaptive layouts

## Usage

```jsx
import DynamicSlider from './components/layout/DynamicSlider';

<DynamicSlider
  title="My Movies"
  items={movieItems}
  sliderId="movies-slider"
  onCardClick={handleCardClick}
  onCardMove={handleCardMove}
  onQuickMove={handleQuickMove}
  onShowAll={handleShowAll}
  isLoading={false}
  customLayout={{
    mode: 'grid',
    cardSize: 'medium',
    style: 'modern',
    gap: 16
  }}
/>
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| title | string \| element | Yes | - | Slider title |
| items | array | No | [] | Array of items to display |
| sliderId | string | Yes | - | Unique slider identifier |
| onCardClick | function | No | - | Card click handler |
| onCardMove | function | No | - | Card move handler (drag & drop) |
| onQuickMove | function \| object | No | - | Quick move handler |
| onShowAll | function | No | - | Show all items handler |
| isLoading | boolean | No | false | Loading state |
| customLayout | object | No | null | Custom layout configuration |
| rootRef | ref | No | - | Reference to root element |

## Hooks

### useDynamicSliderScroll
Manages scroll position, navigation, and scroll state.

**Returns:**
- `scrollPosition`: Current scroll position
- `canScrollLeft`: Can scroll left flag
- `canScrollRight`: Can scroll right flag
- `sliderRef`: Ref to slider container
- `scroll(direction)`: Scroll function
- `handleScroll()`: Scroll event handler

### useDynamicSliderDrag
Manages drag and drop operations.

**Returns:**
- `draggedItem`: Currently dragged item
- `isDragOver`: Drag over state
- `handleCardDragStart()`: Drag start handler
- `handleCardDragEnd()`: Drag end handler
- `handleDragOver()`: Drag over handler
- `handleDragLeave()`: Drag leave handler
- `handleDrop()`: Drop handler

### useDynamicSliderState
Manages component state (hover, etc.).

**Returns:**
- `isHovered`: Hover state
- `handleMouseEnter()`: Mouse enter handler
- `handleMouseLeave()`: Mouse leave handler

## Layout Modes

### Slider Mode (Default)
Horizontal scrolling with navigation buttons.

### Grid Mode
Responsive grid layout with auto-fill columns.

### List Mode
Vertical list with compact cards (full width, fixed height).

## CSS Modules

All styles are scoped using CSS Modules to avoid conflicts. The main stylesheet includes:
- Layout-specific styles
- Compact view animations
- Empty state styling
- Navigation controls
- Drop zone indicators

## Accessibility

- Semantic HTML elements
- ARIA labels for navigation
- Keyboard navigation support
- Focus management
- Screen reader announcements

## Performance

- Debounced resize handling (120ms)
- Optimized scroll calculations
- Conditional rendering based on state
- Memoized layout computations

## Best Practices

1. **Always provide unique `sliderId`** for proper drag & drop functionality
2. **Use `customLayout`** to override global layout settings per slider
3. **Implement `onCardMove`** for drag & drop support
4. **Handle loading states** with `isLoading` prop
5. **Provide meaningful titles** for accessibility

## Example: Custom Layout

```jsx
const customLayout = {
  mode: 'grid',
  cardSize: 'large',
  style: 'modern',
  gap: 20
};

<DynamicSlider
  title="Featured Movies"
  items={movies}
  sliderId="featured"
  customLayout={customLayout}
/>
```

## Dependencies

- React (hooks: useState, useRef, useEffect, useCallback)
- PropTypes (runtime type checking)
- DragContext (global drag state)
- layoutConfig (layout constants)
- Card component (item rendering)
- i18n (internationalization)

## Migration from Old Version

If you're migrating from the old DynamicSlider:

1. Import from the new location: `./components/layout/DynamicSlider`
2. Remove `useDynamicSliderController` imports (now internal)
3. PropTypes remain the same
4. CSS is now scoped (no global conflicts)

## Future Enhancements

- [ ] Virtual scrolling for large datasets
- [ ] Infinite scroll support
- [ ] Advanced filtering/sorting
- [ ] Custom card renderers
- [ ] Animation presets
