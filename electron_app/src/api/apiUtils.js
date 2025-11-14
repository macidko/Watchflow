/**
 * Shared API Utilities
 * Common functions used across multiple API implementations
 */

/**
 * Sleep/delay function for rate limiting
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise} Promise that resolves after the delay
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Find best match for a search query from results
 * @param {string} searchText - The original search query
 * @param {Array} results - Array of search results
 * @returns {Object|null} Best matching result or null if no results
 */
function findBestMatch(searchText, results) {
  if (!results || results.length === 0) return null;
  
  const normalizedSearchText = searchText.toLowerCase().trim();
  
  // Check for exact match
  for (const result of results) {
    const title = (result.title || "").toLowerCase().trim();
    const originalTitle = (result.original_title || "").toLowerCase().trim();
    
    if (title === normalizedSearchText || originalTitle === normalizedSearchText) {
      return result;
    }
    
    // Check synonyms if available
    if (result.synonyms && Array.isArray(result.synonyms)) {
      for (const synonym of result.synonyms) {
        if (synonym.toLowerCase().trim() === normalizedSearchText) {
          return result;
        }
      }
    }
  }
  
  // Return first result as best match (typically most popular)
  return results[0];
}

/**
 * Retry mechanism for API requests
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} delayMs - Delay between retries in milliseconds
 * @returns {Promise} Result of the function call
 */
async function retryWithBackoff(fn, maxRetries = 3, delayMs = 1000) {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt < maxRetries) {
        const backoffDelay = delayMs * Math.pow(2, attempt);
        console.log(`Retry attempt ${attempt + 1}/${maxRetries}, waiting ${backoffDelay}ms...`);
        await sleep(backoffDelay);
      }
    }
  }
  
  throw lastError || new Error('Maximum retry attempts reached');
}

module.exports = {
  sleep,
  findBestMatch,
  retryWithBackoff
};
