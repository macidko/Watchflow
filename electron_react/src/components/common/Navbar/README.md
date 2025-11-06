# Navbar Component

## Overview
Modular, accessible navigation bar component for Electron app with window controls, notifications, and responsive navigation links.

## Architecture

### Component Structure
```
Navbar/
├── Navbar.jsx                      # Main component
├── Navbar.module.css               # Scoped styles
├── NavbarLogo.jsx                  # Logo with animation
├── NavbarLinks.jsx                 # Navigation links
├── NavbarActions.jsx               # Window controls & notifications
├── NavbarSettings.jsx              # Settings link
├── useNavbarNotifications.js       # Notification logic hook
├── useNavbarWindowControls.js      # Window controls hook
├── useNavbarNavItems.js            # Nav items configuration hook
└── index.js                        # Exports
```

## Features

### ✅ Window Controls
- Minimize, Maximize, Close buttons
- Electron API integration
- Drag-to-move support
- Hover states with themed colors

### ✅ Notifications
- Real-time episode notifications
- Unread badge indicator
- LocalStorage persistence
- Calendar events integration

### ✅ Navigation
- Active route highlighting
- Smooth transitions
- Keyboard accessible
- i18n support

### ✅ Accessibility
- ARIA labels
- Semantic HTML
- Keyboard navigation
- Screen reader support

### ✅ Responsive Design
- Mobile-friendly
- Touch optimized
- Adaptive layouts

## Usage

```jsx
import Navbar from './components/common/Navbar';

<Navbar />
```

## Props

Navbar component doesn't accept props - all configuration is managed internally through hooks.

## Hooks

### useNavbarNotifications
Manages notification state and logic.

**Returns:**
- `showNotifications`: Panel visibility state
- `notifications`: Array of notification objects
- `hasUnread`: Unread status flag
- `handleNotificationClick()`: Toggle panel
- `handleCloseNotifications()`: Close panel

### useNavbarWindowControls
Handles Electron window operations.

**Returns:**
- `handleMinimize()`: Minimize window
- `handleMaximize()`: Maximize/restore window
- `handleClose()`: Close window

### useNavbarNavItems
Provides navigation items configuration.

**Returns:**
- `navItems`: Array of navigation item objects

## Sub-Components

### NavbarLogo
Displays animated logo with app name.

**Props:**
- `onDoubleClick` (function): Handler for double-click to maximize

### NavbarLinks
Renders navigation links with active state.

**Props:**
- `navItems` (array): Navigation items configuration

### NavbarActions
Window controls and notification button.

**Props:**
- `onMinimize` (function): Minimize handler
- `onMaximize` (function): Maximize handler
- `onClose` (function): Close handler
- `showNotifications` (boolean): Notification panel state
- `onNotificationClick` (function): Notification click handler
- `notifications` (array): Notifications array
- `hasUnread` (boolean): Unread status
- `onCloseNotifications` (function): Close notifications handler

### NavbarSettings
Settings button link.

**Props:** None

## CSS Modules

All styles are scoped using CSS Modules:
- `.navbarMain` - Main container
- `.header` - Header section with logo and controls
- `.navContainer` - Navigation section
- `.navLink` - Individual nav links
- `.navLinkActive` - Active link state
- `.notificationBtn` - Notification button
- `.windowBtn` - Window control buttons

## Theming

Uses CSS variables for theming:
- `--primary-bg`
- `--secondary-bg`
- `--primary-text`
- `--secondary-text`
- `--accent-color`
- `--accent-color-rgb` (for rgba values)
- `--border-color`
- `--hover-bg`

## Electron Integration

Requires `window.electronAPI` with:
- `minimize()`
- `maximize()`
- `close()`

## Dependencies

- React (hooks)
- React Router (Link, useLocation)
- PropTypes
- NotificationPanel component
- notificationService
- initialData store
- i18n

## Best Practices

1. **Window Controls**: Always check for `window.electronAPI` before calling methods
2. **Notifications**: Use localStorage for persistence across sessions
3. **Navigation**: Leverage React Router's `useLocation` for active states
4. **Accessibility**: Maintain ARIA labels for all interactive elements

## Example: Custom Nav Items

```jsx
const customNavItems = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: <DashboardIcon />
  }
];
```

## Animations

- Logo bounce animation (SVG animateTransform)
- Nav link underline on hover/active
- Smooth color transitions
- Window button hover effects

## Performance

- Memoized notification calculations
- LocalStorage debouncing
- Event listener cleanup
- Optimized re-renders

## Future Enhancements

- [ ] Breadcrumb navigation
- [ ] Search integration
- [ ] User profile dropdown
- [ ] Keyboard shortcuts display
- [ ] Theme switcher in navbar
