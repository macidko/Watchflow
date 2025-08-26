/**
 * Input validation utilities for security and data integrity
 */

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHtml(html) {
  if (typeof html !== 'string') return '';
  
  // Remove potentially dangerous HTML tags and attributes
  return html
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
    .replace(/<object[^>]*>.*?<\/object>/gi, '')
    .replace(/<embed[^>]*>.*?<\/embed>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/<style[^>]*>.*?<\/style>/gi, '')
    .trim();
}

/**
 * Validate and sanitize search query
 */
export function validateSearchQuery(query) {
  if (typeof query !== 'string') return '';
  
  const trimmed = query.trim();
  
  // Check length
  if (trimmed.length === 0) {
    throw new Error('Search query cannot be empty');
  }
  
  if (trimmed.length > 100) {
    throw new Error('Search query too long (max 100 characters)');
  }
  
  // Remove potentially dangerous characters
  const sanitized = trimmed
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '');
  
  return sanitized;
}

/**
 * Validate slider/status title
 */
export function validateTitle(title) {
  if (typeof title !== 'string') return '';
  
  const trimmed = title.trim();
  
  if (trimmed.length < 3) {
    throw new Error('Title must be at least 3 characters long');
  }
  
  if (trimmed.length > 50) {
    throw new Error('Title too long (max 50 characters)');
  }
  
  // Remove HTML tags and dangerous content
  const sanitized = sanitizeHtml(trimmed);
  
  return sanitized;
}

/**
 * Validate and sanitize user notes
 */
export function validateNotes(notes) {
  if (typeof notes !== 'string') return '';
  
  const trimmed = notes.trim();
  
  if (trimmed.length > 1000) {
    throw new Error('Notes too long (max 1000 characters)');
  }
  
  return sanitizeHtml(trimmed);
}

/**
 * Validate URL format
 */
export function validateUrl(url) {
  if (typeof url !== 'string') return '';
  
  const trimmed = url.trim();
  
  if (trimmed.length === 0) return '';
  
  // Basic URL validation
  const urlPattern = /^https?:\/\/.+/i;
  
  if (!urlPattern.test(trimmed)) {
    throw new Error('Invalid URL format');
  }
  
  return trimmed;
}

/**
 * Validate rating value
 */
export function validateRating(rating) {
  const num = parseFloat(rating);
  
  if (isNaN(num)) {
    throw new Error('Rating must be a number');
  }
  
  if (num < 0 || num > 10) {
    throw new Error('Rating must be between 0 and 10');
  }
  
  return num;
}

/**
 * Validate episode number
 */
export function validateEpisode(episode) {
  const num = parseInt(episode, 10);
  
  if (isNaN(num)) {
    throw new Error('Episode must be a number');
  }
  
  if (num < 1 || num > 9999) {
    throw new Error('Episode must be between 1 and 9999');
  }
  
  return num;
}

/**
 * Validate JSON data before parsing
 */
export function safeJsonParse(jsonString, fallback = null) {
  try {
    if (typeof jsonString !== 'string') return fallback;
    
    // Basic JSON validation
    const trimmed = jsonString.trim();
    if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
      return fallback;
    }
    
    return JSON.parse(trimmed);
  } catch (error) {
    console.warn('JSON parse failed:', error);
    return fallback;
  }
}

/**
 * Sanitize localStorage key
 */
export function validateStorageKey(key) {
  if (typeof key !== 'string') {
    throw new Error('Storage key must be a string');
  }
  
  const trimmed = key.trim();
  
  if (trimmed.length === 0) {
    throw new Error('Storage key cannot be empty');
  }
  
  if (trimmed.length > 100) {
    throw new Error('Storage key too long');
  }
  
  // Only allow alphanumeric, dash, underscore
  const sanitized = trimmed.replace(/[^a-zA-Z0-9_-]/g, '');
  
  if (sanitized !== trimmed) {
    throw new Error('Storage key contains invalid characters');
  }
  
  return sanitized;
}

/**
 * Rate limiting utility
 */
export class RateLimiter {
  constructor(maxRequests = 10, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = [];
  }
  
  canMakeRequest() {
    const now = Date.now();
    
    // Remove old requests outside the window
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    
    return this.requests.length < this.maxRequests;
  }
  
  makeRequest() {
    if (!this.canMakeRequest()) {
      throw new Error('Rate limit exceeded');
    }
    
    this.requests.push(Date.now());
    return true;
  }
  
  getTimeUntilReset() {
    if (this.requests.length === 0) return 0;
    
    const oldestRequest = Math.min(...this.requests);
    const resetTime = oldestRequest + this.windowMs;
    const now = Date.now();
    
    return Math.max(0, resetTime - now);
  }
}

/**
 * File upload validation
 */
export function validateFileUpload(file) {
  if (!file) {
    throw new Error('No file provided');
  }
  
  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('File too large (max 10MB)');
  }
  
  // Check file type
  const allowedTypes = ['application/json', 'text/plain'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Only JSON and text files allowed');
  }
  
  return true;
}

/**
 * Deep clone with validation to prevent prototype pollution
 */
export function safeClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  
  try {
    const jsonString = JSON.stringify(obj);
    const parsed = JSON.parse(jsonString);
    
    // Check for dangerous keys
    const dangerousKeys = ['__proto__', 'constructor', 'prototype'];
    
    function checkObject(object) {
      if (object && typeof object === 'object') {
        for (const key of dangerousKeys) {
          if (key in object) {
            delete object[key];
          }
        }
        
        for (const value of Object.values(object)) {
          if (value && typeof value === 'object') {
            checkObject(value);
          }
        }
      }
    }
    
    checkObject(parsed);
    return parsed;
  } catch (error) {
    console.warn('Safe clone failed:', error);
    return {};
  }
}
