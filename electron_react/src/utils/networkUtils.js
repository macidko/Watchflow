/**
 * Network utilities with timeout and abort controller support
 */

/**
 * Enhanced fetch with timeout and abort controller
 */
export async function fetchWithTimeout(url, options = {}) {
  const { timeout = 10000, ...fetchOptions } = options;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    
    throw error;
  }
}

/**
 * Retry mechanism with exponential backoff
 */
export async function retryWithBackoff(operation, maxRetries = 3, baseDelay = 1000) {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Don't retry on certain errors
      if (error.message.includes('404') || error.message.includes('401')) {
        throw error;
      }
      
      if (attempt === maxRetries) {
        break;
      }
      
      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

/**
 * Concurrent request limiter
 */
export class ConcurrentLimiter {
  constructor(maxConcurrent = 3) {
    this.maxConcurrent = maxConcurrent;
    this.running = 0;
    this.queue = [];
  }
  
  async execute(operation) {
    return new Promise((resolve, reject) => {
      this.queue.push({ operation, resolve, reject });
      this.process();
    });
  }
  
  async process() {
    if (this.running >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }
    
    this.running++;
    const { operation, resolve, reject } = this.queue.shift();
    
    try {
      const result = await operation();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.running--;
      this.process();
    }
  }
}

/**
 * Network status checker
 */
export function isOnline() {
  return navigator.onLine;
}

/**
 * Connection quality checker
 */
export async function checkConnectionQuality() {
  if (!isOnline()) {
    return { quality: 'offline', latency: Infinity };
  }
  
  try {
    const start = Date.now();
    await fetch('/favicon.ico', { 
      mode: 'no-cors',
      cache: 'no-cache',
      signal: AbortSignal.timeout(5000)
    });
    const latency = Date.now() - start;
    
    let quality;
    if (latency < 100) quality = 'excellent';
    else if (latency < 300) quality = 'good';
    else if (latency < 1000) quality = 'fair';
    else quality = 'poor';
    
    return { quality, latency };
  } catch {
    return { quality: 'offline', latency: Infinity };
  }
}

/**
 * Request cache with TTL
 */
export class RequestCache {
  constructor(ttl = 300000) { // 5 minutes default
    this.cache = new Map();
    this.ttl = ttl;
  }
  
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }
  
  set(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
  
  clear() {
    this.cache.clear();
  }
  
  size() {
    return this.cache.size;
  }
}

/**
 * Batch request processor
 */
export class BatchProcessor {
  constructor(batchSize = 5, delay = 100) {
    this.batchSize = batchSize;
    this.delay = delay;
    this.queue = [];
    this.processing = false;
  }
  
  add(request) {
    return new Promise((resolve, reject) => {
      this.queue.push({ request, resolve, reject });
      this.process();
    });
  }
  
  async process() {
    if (this.processing || this.queue.length === 0) {
      return;
    }
    
    this.processing = true;
    
    while (this.queue.length > 0) {
      const batch = this.queue.splice(0, this.batchSize);
      
      // Process batch concurrently
      const promises = batch.map(async ({ request, resolve, reject }) => {
        try {
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      
      await Promise.allSettled(promises);
      
      // Delay between batches
      if (this.queue.length > 0) {
        await new Promise(resolve => setTimeout(resolve, this.delay));
      }
    }
    
    this.processing = false;
  }
}

/**
 * Progress tracker for long operations
 */
export class ProgressTracker {
  constructor(total = 100) {
    this.total = total;
    this.current = 0;
    this.callbacks = [];
  }
  
  onProgress(callback) {
    this.callbacks.push(callback);
  }
  
  update(value) {
    this.current = Math.min(value, this.total);
    const percentage = (this.current / this.total) * 100;
    
    this.callbacks.forEach(callback => {
      try {
        callback(percentage, this.current, this.total);
      } catch (error) {
        
      }
    });
  }
  
  increment(value = 1) {
    this.update(this.current + value);
  }
  
  reset() {
    this.current = 0;
    this.update(0);
  }
  
  complete() {
    this.update(this.total);
  }
}

/**
 * Debounced fetch for search queries
 */
export function createDebouncedFetch(delay = 300) {
  let timeoutId;
  let lastController;
  
  return function debouncedFetch(url, options = {}) {
    return new Promise((resolve, reject) => {
      // Cancel previous request
      if (lastController) {
        lastController.abort();
      }
      
      // Clear previous timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      timeoutId = setTimeout(async () => {
        try {
          lastController = new AbortController();
          const response = await fetchWithTimeout(url, {
            ...options,
            signal: lastController.signal
          });
          resolve(response);
        } catch (error) {
          if (error.name !== 'AbortError') {
            reject(error);
          }
        }
      }, delay);
    });
  };
}

