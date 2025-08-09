import slidersData from './sliders.json';

// LocalStorage key for saved data
const STORAGE_KEY = 'watchflow_sliders_data';

// Cache for data to avoid repeated JSON parsing
let dataCache = null;
let lastCacheTime = 0;
const CACHE_DURATION = 5000; // 5 seconds

// Throttle function for frequent operations
const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Get slider data from cache, localStorage or fallback to default JSON
 * @returns {Object} Complete slider data structure
 */
export const getSliderData = () => {
  const now = Date.now();
  
  // Return cached data if still valid
  if (dataCache && (now - lastCacheTime) < CACHE_DURATION) {
    return dataCache;
  }

  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    dataCache = savedData ? JSON.parse(savedData) : slidersData;
    lastCacheTime = now;
    return dataCache;
  } catch (error) {
    console.warn('Error loading slider data from localStorage:', error);
    dataCache = slidersData;
    lastCacheTime = now;
    return dataCache;
  }
};

/**
 * Save slider data to localStorage with throttling
 * @param {Object} data - Complete slider data structure
 */
const saveSliderDataImmediate = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    // Update cache
    dataCache = data;
    lastCacheTime = Date.now();
  } catch (error) {
    console.error('Error saving slider data to localStorage:', error);
  }
};

// Throttled version to prevent too frequent saves
export const saveSliderData = throttle(saveSliderDataImmediate, 1000);

/**
 * Force immediate save (for critical operations)
 */
export const saveSliderDataNow = saveSliderDataImmediate;

/**
 * Get sliders for a specific page (cached version)
 * @param {string} page - Page name ('anasayfa', 'filmler', 'dizi', 'anime')
 * @returns {Array} Array of slider objects
 */
export const getPageSliders = (page) => {
  const data = getSliderData();
  const pageData = data.pages?.[page];
  
  if (!pageData || !pageData.sliders) {
    console.warn(`Page not found: ${page}`);
    return [];
  }

  // Only return visible sliders, sorted by order
  return pageData.sliders
    .filter(slider => slider.visible)
    .sort((a, b) => a.order - b.order);
};

/**
 * Get all sliders for a page (including hidden ones)
 * @param {string} page - Page name
 * @returns {Array} Array of all slider objects
 */
export const getAllPageSliders = (page) => {
  const data = getSliderData();
  const pageData = data.pages?.[page];
  
  if (!pageData || !pageData.sliders) {
    return [];
  }

  return pageData.sliders.sort((a, b) => a.order - b.order);
};

/**
 * Add a new slider to a page (optimized)
 * @param {string} page - Page name
 * @param {Object} sliderData - Slider configuration
 * @returns {Object} Created slider object
 */
export const addSlider = (page, sliderData) => {
  const data = getSliderData();
  
  if (!data.pages) {
    data.pages = {};
  }
  
  if (!data.pages[page]) {
    data.pages[page] = { sliders: [] };
  }

  const newSlider = {
    id: `slider_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    order: data.pages[page].sliders.length + 1,
    visible: true,
    createdAt: new Date().toISOString().split('T')[0],
    items: [],
    ...sliderData
  };
  
  data.pages[page].sliders.push(newSlider);
  saveSliderDataNow(data); // Immediate save for new items
  return newSlider;
};

/**
 * Update slider order for a page (batch operation)
 * @param {string} page - Page name
 * @param {Array} slidersOrder - Array of slider IDs in new order
 */
export const reorderSliders = (page, slidersOrder) => {
  const data = getSliderData();
  
  if (!data.pages?.[page]) return;
  
  // Batch update orders
  const slidersMap = new Map(data.pages[page].sliders.map(s => [s.id, s]));
  
  slidersOrder.forEach((sliderId, index) => {
    const slider = slidersMap.get(sliderId);
    if (slider) {
      slider.order = index + 1;
    }
  });
  
  data.pages[page].sliders.sort((a, b) => a.order - b.order);
  saveSliderData(data); // Throttled save for reordering
};

/**
 * Batch update multiple sliders
 * @param {string} page - Page name
 * @param {Array} updates - Array of {id, updates} objects
 */
export const batchUpdateSliders = (page, updates) => {
  const data = getSliderData();
  
  if (!data.pages?.[page]) return;
  
  const slidersMap = new Map(data.pages[page].sliders.map(s => [s.id, s]));
  
  updates.forEach(({ id, updates: sliderUpdates }) => {
    const slider = slidersMap.get(id);
    if (slider) {
      Object.assign(slider, sliderUpdates);
    }
  });
  
  saveSliderData(data);
};

/**
 * Toggle slider visibility (optimized)
 * @param {string} page - Page name
 * @param {string} sliderId - Slider ID
 */
export const toggleSliderVisibility = (page, sliderId) => {
  const data = getSliderData();
  
  if (!data.pages?.[page]) return;
  
  const slider = data.pages[page].sliders.find(s => s.id === sliderId);
  if (slider) {
    slider.visible = !slider.visible;
    saveSliderData(data);
  }
};

/**
 * Delete a slider (immediate save)
 * @param {string} page - Page name
 * @param {string} sliderId - Slider ID
 */
export const deleteSlider = (page, sliderId) => {
  const data = getSliderData();
  
  if (!data.pages?.[page]) return;
  
  data.pages[page].sliders = data.pages[page].sliders.filter(s => s.id !== sliderId);
  saveSliderDataNow(data); // Immediate save for deletions
};

/**
 * Update slider metadata (optimized)
 * @param {string} page - Page name
 * @param {string} sliderId - Slider ID
 * @param {Object} updates - Updates to apply
 */
export const updateSlider = (page, sliderId, updates) => {
  const data = getSliderData();
  
  if (!data.pages?.[page]) return;
  
  const slider = data.pages[page].sliders.find(s => s.id === sliderId);
  if (slider) {
    Object.assign(slider, updates);
    saveSliderData(data); // Throttled save for updates
  }
};

/**
 * Move item between sliders (batch operation)
 * @param {string} fromPage - Source page
 * @param {string} fromSliderId - Source slider ID
 * @param {string} toPage - Target page
 * @param {string} toSliderId - Target slider ID
 * @param {number} itemId - Item ID to move
 */
export const moveItemBetweenSliders = (fromPage, fromSliderId, toPage, toSliderId, itemId) => {
  const data = getSliderData();
  
  let item = null;
  
  // Find and remove item from source slider
  if (data.pages?.[fromPage]) {
    const sourceSlider = data.pages[fromPage].sliders.find(s => s.id === fromSliderId);
    if (sourceSlider) {
      const itemIndex = sourceSlider.items.findIndex(i => i.id === itemId);
      if (itemIndex !== -1) {
        item = sourceSlider.items.splice(itemIndex, 1)[0];
      }
    }
  }
  
  // Add item to target slider
  if (item && data.pages?.[toPage]) {
    const targetSlider = data.pages[toPage].sliders.find(s => s.id === toSliderId);
    if (targetSlider) {
      // Update item metadata for new location
      item.addedDate = new Date().toISOString().split('T')[0];
      targetSlider.items.push(item);
    }
  }
  
  saveSliderDataNow(data); // Immediate save for item moves
};

/**
 * Move card between sliders using card object
 * @param {Object} cardItem - The card item to move
 * @param {string} fromSliderId - Source slider ID
 * @param {string} toSliderId - Target slider ID
 * @param {string} page - Page name (movies, series, anime)
 */
export const moveCardBetweenSliders = (cardItem, fromSliderId, toSliderId, page) => {
  console.log('moveCardBetweenSliders called with:', { cardItem, fromSliderId, toSliderId, page });
  
  const data = getSliderData();
  console.log('Current slider data:', data);
  
  if (!data.pages?.[page]) {
    console.log('Page not found:', page);
    return false;
  }
  
  // Find source slider
  const sourceSlider = data.pages[page].sliders.find(s => s.id === fromSliderId);
  if (!sourceSlider) {
    console.log('Source slider not found:', fromSliderId);
    return false;
  }
  
  // Find target slider
  const targetSlider = data.pages[page].sliders.find(s => s.id === toSliderId);
  if (!targetSlider) {
    console.log('Target slider not found:', toSliderId);
    return false;
  }
  
  console.log('Source slider items:', sourceSlider.items);
  console.log('Target slider items before:', targetSlider.items);
  
  // Find item in source slider by comparing key properties
  const itemIndex = sourceSlider.items.findIndex(item => {
    // Compare by id if available, otherwise by title and other unique properties
    if (cardItem.id && item.id) {
      return item.id === cardItem.id;
    }
    
    // Fallback comparison for items without ID
    const cardTitle = cardItem.title || cardItem.apiData?.title;
    const itemTitle = item.title || item.apiData?.title;
    
    return cardTitle === itemTitle && 
           (cardItem.apiData?.tmdbId === item.apiData?.tmdbId ||
            cardItem.apiData?.kitsuId === item.apiData?.kitsuId);
  });
  
  console.log('Found item at index:', itemIndex);
  
  if (itemIndex === -1) {
    console.log('Item not found in source slider');
    return false;
  }
  
  // Remove from source slider
  const [movedItem] = sourceSlider.items.splice(itemIndex, 1);
  console.log('Moved item:', movedItem);
  
  // Update item metadata
  movedItem.addedDate = new Date().toISOString().split('T')[0];
  
  // Add to target slider
  targetSlider.items.push(movedItem);
  console.log('Target slider items after:', targetSlider.items);
  
  // Save immediately
  saveSliderDataNow(data);
  console.log('Data saved successfully');
  return true;
};

/**
 * Add item to a slider (optimized)
 * @param {string} page - Page name
 * @param {string} sliderId - Slider ID
 * @param {Object} itemData - Item data
 */
export const addItemToSlider = (page, sliderId, itemData) => {
  const data = getSliderData();
  
  if (!data.pages?.[page]) return;
  
  const slider = data.pages[page].sliders.find(s => s.id === sliderId);
  if (slider) {
    const newItem = {
      id: Date.now() + Math.random(),
      addedDate: new Date().toISOString().split('T')[0],
      ...itemData
    };
    
    slider.items.push(newItem);
    saveSliderData(data);
    return newItem;
  }
};

/**
 * Remove item from slider (immediate save)
 * @param {string} page - Page name
 * @param {string} sliderId - Slider ID
 * @param {number} itemId - Item ID
 */
export const removeItemFromSlider = (page, sliderId, itemId) => {
  const data = getSliderData();
  
  if (!data.pages?.[page]) return;
  
  const slider = data.pages[page].sliders.find(s => s.id === sliderId);
  if (slider) {
    slider.items = slider.items.filter(item => item.id !== itemId);
    saveSliderDataNow(data); // Immediate save for removals
  }
};

/**
 * Find item by ID across all pages and sliders (cached)
 * @param {number} id - Item ID
 * @returns {Object|null} Found item with location info or null
 */
export const findItemById = (id) => {
  const data = getSliderData();
  
  for (const [pageName, pageData] of Object.entries(data.pages || {})) {
    for (const slider of pageData.sliders || []) {
      const item = slider.items?.find(item => item.id === id);
      if (item) {
        return {
          item,
          page: pageName,
          sliderId: slider.id,
          sliderTitle: slider.title
        };
      }
    }
  }
  return null;
};

/**
 * Get items by genre across all sliders (cached with memoization)
 * @param {string} genre - Genre name
 * @returns {Array} Array of items with location info
 */
const genreCache = new Map();
export const getItemsByGenre = (genre) => {
  // Check cache first
  const cacheKey = `genre_${genre}_${lastCacheTime}`;
  if (genreCache.has(cacheKey)) {
    return genreCache.get(cacheKey);
  }

  const data = getSliderData();
  const results = [];
  
  for (const [pageName, pageData] of Object.entries(data.pages || {})) {
    for (const slider of pageData.sliders || []) {
      const filteredItems = slider.items?.filter(item => 
        item.genre && item.genre.includes(genre)
      ) || [];
      
      filteredItems.forEach(item => {
        results.push({
          ...item,
          page: pageName,
          sliderId: slider.id,
          sliderTitle: slider.title
        });
      });
    }
  }
  
  // Cache results
  genreCache.set(cacheKey, results);
  
  // Clear old cache entries
  if (genreCache.size > 50) {
    const entries = Array.from(genreCache.entries());
    entries.slice(0, 25).forEach(([key]) => genreCache.delete(key));
  }
  
  return results;
};

/**
 * Get items by watch status (cached)
 * @param {string} watchStatus - Watch status
 * @returns {Array} Array of items with location info
 */
export const getItemsByWatchStatus = (watchStatus) => {
  const data = getSliderData();
  const results = [];
  
  for (const [pageName, pageData] of Object.entries(data.pages || {})) {
    for (const slider of pageData.sliders || []) {
      const filteredItems = slider.items?.filter(item => 
        item.watchStatus === watchStatus
      ) || [];
      
      filteredItems.forEach(item => {
        results.push({
          ...item,
          page: pageName,
          sliderId: slider.id,
          sliderTitle: slider.title
        });
      });
    }
  }
  
  return results;
};

/**
 * Sort items by rating (memoized)
 * @param {Array} items - Items array
 * @param {string} order - Sort order ('asc' or 'desc')
 * @returns {Array} Sorted items
 */
export const sortItemsByRating = (items, order = 'desc') => {
  return [...items].sort((a, b) => {
    const ratingA = parseFloat(a.rating) || 0;
    const ratingB = parseFloat(b.rating) || 0;
    
    return order === 'asc' ? ratingA - ratingB : ratingB - ratingA;
  });
};

/**
 * Get all available pages (cached)
 * @returns {Array} Array of page names
 */
export const getPages = () => {
  const data = getSliderData();
  return Object.keys(data.pages || {});
};

/**
 * Get settings (cached)
 * @returns {Object} Settings object
 */
export const getSettings = () => {
  const data = getSliderData();
  return data.settings || {};
};

/**
 * Update settings (immediate save)
 * @param {Object} updates - Settings updates
 */
export const updateSettings = (updates) => {
  const data = getSliderData();
  data.settings = { ...data.settings, ...updates };
  saveSliderDataNow(data);
};

/**
 * Clear cache (useful for testing or forced refresh)
 */
export const clearCache = () => {
  dataCache = null;
  lastCacheTime = 0;
  genreCache.clear();
};

/**
 * Reset data to default
 */
export const resetToDefault = () => {
  localStorage.removeItem(STORAGE_KEY);
  clearCache();
};

// Backward compatibility function
export const getSliderData_Legacy = (page, category = null) => {
  return getPageSliders(page);
};

export default {
  getSliderData,
  saveSliderData,
  saveSliderDataNow,
  getPageSliders,
  getAllPageSliders,
  addSlider,
  reorderSliders,
  batchUpdateSliders,
  toggleSliderVisibility,
  deleteSlider,
  updateSlider,
  moveItemBetweenSliders,
  addItemToSlider,
  removeItemFromSlider,
  findItemById,
  getItemsByGenre,
  getItemsByWatchStatus,
  sortItemsByRating,
  getPages,
  getSettings,
  updateSettings,
  clearCache,
  resetToDefault
};
