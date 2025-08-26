/**
 * Keyboard shortcuts system for enhanced accessibility
 */

/**
 * Keyboard shortcut manager
 */
export class KeyboardShortcuts {
  constructor() {
    this.shortcuts = new Map();
    this.isEnabled = true;
    this.handleKeyDown = this.handleKeyDown.bind(this);
    
    // Setup default shortcuts
    this.setupDefaultShortcuts();
    
    // Start listening
    document.addEventListener('keydown', this.handleKeyDown);
  }
  
  setupDefaultShortcuts() {
    // Search
    this.register('ctrl+k', () => this.triggerAction('openSearch'));
    this.register('cmd+k', () => this.triggerAction('openSearch'));
    
    // Navigation
    this.register('ctrl+1', () => this.triggerAction('navigateToHome'));
    this.register('ctrl+2', () => this.triggerAction('navigateToMovies'));
    this.register('ctrl+3', () => this.triggerAction('navigateToSeries'));
    this.register('ctrl+4', () => this.triggerAction('navigateToAnime'));
    this.register('ctrl+5', () => this.triggerAction('navigateToCalendar'));
    this.register('ctrl+6', () => this.triggerAction('navigateToSettings'));
    
    // List management
    this.register('ctrl+n', () => this.triggerAction('createNewList'));
    this.register('ctrl+shift+l', () => this.triggerAction('openListManager'));
    
    // View modes
    this.register('ctrl+shift+g', () => this.triggerAction('toggleGridView'));
    this.register('ctrl+shift+v', () => this.triggerAction('toggleViewMode'));
    
    // Accessibility
    this.register('alt+shift+h', () => this.triggerAction('showHelpDialog'));
    this.register('alt+shift+k', () => this.triggerAction('showKeyboardShortcuts'));
    
    // Quick actions
    this.register('escape', () => this.triggerAction('closeModal'));
    this.register('enter', () => this.triggerAction('confirmAction'));
    
    // Focus management
    this.register('ctrl+shift+f', () => this.triggerAction('focusFirstInput'));
    this.register('ctrl+shift+m', () => this.triggerAction('focusMainContent'));
  }
  
  register(shortcut, callback, options = {}) {
    const key = this.normalizeShortcut(shortcut);
    this.shortcuts.set(key, {
      callback,
      description: options.description || '',
      category: options.category || 'general',
      enabled: options.enabled !== false
    });
  }
  
  unregister(shortcut) {
    const key = this.normalizeShortcut(shortcut);
    this.shortcuts.delete(key);
  }
  
  normalizeShortcut(shortcut) {
    return shortcut.toLowerCase()
      .replace(/\s+/g, '')
      .split('+')
      .sort()
      .join('+');
  }
  
  handleKeyDown(event) {
    if (!this.isEnabled) return;
    
    // Skip if user is typing in an input
    const activeElement = document.activeElement;
    const isInput = activeElement && (
      activeElement.tagName === 'INPUT' ||
      activeElement.tagName === 'TEXTAREA' ||
      activeElement.contentEditable === 'true'
    );
    
    // Allow escape key even in inputs
    if (isInput && event.key !== 'Escape') return;
    
    const shortcut = this.getShortcutFromEvent(event);
    const shortcutData = this.shortcuts.get(shortcut);
    
    if (shortcutData && shortcutData.enabled) {
      event.preventDefault();
      event.stopPropagation();
      
      try {
        shortcutData.callback(event);
      } catch (error) {
        console.error('Keyboard shortcut error:', error);
      }
    }
  }
  
  getShortcutFromEvent(event) {
    const keys = [];
    
    if (event.ctrlKey || event.metaKey) keys.push('ctrl');
    if (event.altKey) keys.push('alt');
    if (event.shiftKey) keys.push('shift');
    
    // Normalize key names
    let key = event.key.toLowerCase();
    if (key === ' ') key = 'space';
    
    keys.push(key);
    
    return keys.sort().join('+');
  }
  
  triggerAction(action) {
    const event = new CustomEvent('keyboard-action', {
      detail: { action }
    });
    document.dispatchEvent(event);
  }
  
  enable() {
    this.isEnabled = true;
  }
  
  disable() {
    this.isEnabled = false;
  }
  
  getShortcuts() {
    return Array.from(this.shortcuts.entries()).map(([key, data]) => ({
      shortcut: key,
      ...data
    }));
  }
  
  destroy() {
    document.removeEventListener('keydown', this.handleKeyDown);
    this.shortcuts.clear();
  }
}

/**
 * Focus management utilities
 */
export class FocusManager {
  constructor() {
    this.focusStack = [];
    this.trapStack = [];
  }
  
  // Save current focus and move to new element
  moveTo(element, save = true) {
    if (save && document.activeElement) {
      this.focusStack.push(document.activeElement);
    }
    
    if (element && typeof element.focus === 'function') {
      element.focus();
    }
  }
  
  // Restore previous focus
  restore() {
    const previous = this.focusStack.pop();
    if (previous && typeof previous.focus === 'function') {
      previous.focus();
    }
  }
  
  // Focus trap for modals
  trap(container) {
    if (!container) return null;
    
    const focusableElements = this.getFocusableElements(container);
    if (focusableElements.length === 0) return null;
    
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];
    
    const handleKeyDown = (event) => {
      if (event.key === 'Tab') {
        if (event.shiftKey) {
          if (document.activeElement === firstFocusable) {
            event.preventDefault();
            lastFocusable.focus();
          }
        } else {
          if (document.activeElement === lastFocusable) {
            event.preventDefault();
            firstFocusable.focus();
          }
        }
      }
    };
    
    container.addEventListener('keydown', handleKeyDown);
    
    // Focus first element
    firstFocusable.focus();
    
    const trapData = { container, handleKeyDown };
    this.trapStack.push(trapData);
    
    return () => this.releaseTrap(trapData);
  }
  
  releaseTrap(trapData) {
    if (!trapData) {
      trapData = this.trapStack.pop();
    } else {
      const index = this.trapStack.indexOf(trapData);
      if (index > -1) {
        this.trapStack.splice(index, 1);
      }
    }
    
    if (trapData) {
      trapData.container.removeEventListener('keydown', trapData.handleKeyDown);
    }
  }
  
  getFocusableElements(container) {
    const focusableSelectors = [
      'button:not([disabled])',
      'a[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"]):not([disabled])',
      '[contenteditable]:not([contenteditable="false"])'
    ];
    
    return Array.from(container.querySelectorAll(focusableSelectors.join(',')))
      .filter(element => {
        return element.offsetWidth > 0 && element.offsetHeight > 0;
      });
  }
  
  // Find next/previous focusable element
  getNextFocusable(current, direction = 1) {
    const focusables = this.getFocusableElements(document.body);
    const currentIndex = focusables.indexOf(current);
    
    if (currentIndex === -1) return null;
    
    const nextIndex = currentIndex + direction;
    if (nextIndex < 0) return focusables[focusables.length - 1];
    if (nextIndex >= focusables.length) return focusables[0];
    
    return focusables[nextIndex];
  }
}

/**
 * Accessibility announcements for screen readers
 */
export class ScreenReaderAnnouncer {
  constructor() {
    this.liveRegion = this.createLiveRegion();
  }
  
  createLiveRegion() {
    const existing = document.getElementById('screen-reader-announcements');
    if (existing) return existing;
    
    const liveRegion = document.createElement('div');
    liveRegion.id = 'screen-reader-announcements';
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `;
    
    document.body.appendChild(liveRegion);
    return liveRegion;
  }
  
  announce(message, priority = 'polite') {
    if (!message) return;
    
    this.liveRegion.setAttribute('aria-live', priority);
    this.liveRegion.textContent = message;
    
    // Clear after a delay to allow for re-announcing the same message
    setTimeout(() => {
      this.liveRegion.textContent = '';
    }, 1000);
  }
  
  announceImmediate(message) {
    this.announce(message, 'assertive');
  }
}

/**
 * Reduced motion detection and preferences
 */
export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * High contrast mode detection
 */
export function prefersHighContrast() {
  return window.matchMedia('(prefers-contrast: high)').matches;
}

/**
 * Color scheme preference detection
 */
export function getPreferredColorScheme() {
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  if (window.matchMedia('(prefers-color-scheme: light)').matches) {
    return 'light';
  }
  return 'no-preference';
}

// Global instances
let keyboardShortcuts = null;
let focusManager = null;
let screenReaderAnnouncer = null;

/**
 * Initialize accessibility system
 */
export function initializeAccessibility() {
  if (typeof window === 'undefined') return;
  
  keyboardShortcuts = new KeyboardShortcuts();
  focusManager = new FocusManager();
  screenReaderAnnouncer = new ScreenReaderAnnouncer();
  
  return {
    keyboardShortcuts,
    focusManager,
    screenReaderAnnouncer
  };
}

/**
 * Get global accessibility instances
 */
export function getAccessibility() {
  return {
    keyboardShortcuts,
    focusManager,
    screenReaderAnnouncer
  };
}

/**
 * Cleanup accessibility system
 */
export function cleanupAccessibility() {
  if (keyboardShortcuts) {
    keyboardShortcuts.destroy();
    keyboardShortcuts = null;
  }
  
  focusManager = null;
  screenReaderAnnouncer = null;
}
