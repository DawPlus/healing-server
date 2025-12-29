// Cache for tracking API requests to prevent request flooding
const requestCache = {
  // Map to track when each request was last made
  lastRequested: new Map(),
  // Minimum time (in ms) between duplicate requests
  minRequestInterval: 5000, // 5 seconds (increased from 2s)
  // Map to track failed request attempts
  failedAttempts: new Map(),
  // Maximum retry attempts for failed requests
  maxRetryAttempts: 3,
  // Set to track 404 errors (endpoints that don't exist)
  notFoundEndpoints: new Set()
};

// 전역 네임스페이스에 requestCache 노출
window.requestCache = requestCache;

/**
 * Check if a request should be allowed based on rate limiting and retry logic
 * @param {string} requestKey - Unique identifier for the request
 * @returns {boolean} True if request should proceed, false if it should be skipped
 */
export const shouldAllowRequest = (requestKey) => {
  if (!requestKey) {
    console.error('[RequestUtils] Missing request key');
    return false;
  }
  
  // If this endpoint returned 404 before, don't retry
  if (requestCache.notFoundEndpoints.has(requestKey)) {
    console.log(`[RequestUtils] Request ${requestKey} previously returned 404, not retrying`);
    return false;
  }
  
  const now = Date.now();
  const lastRequest = requestCache.lastRequested.get(requestKey) || 0;
  const failedCount = requestCache.failedAttempts.get(requestKey) || 0;
  
  // Check if this request has failed too many times
  if (failedCount >= requestCache.maxRetryAttempts) {
    console.log(`[RequestUtils] Request ${requestKey} has failed ${failedCount} times, not retrying`);
    return false;
  }
  
  // Check if this request was made too recently
  if (now - lastRequest < requestCache.minRequestInterval) {
    console.log(`[RequestUtils] Request ${requestKey} was made too recently, skipping`);
    return false;
  }
  
  // Update last request time
  requestCache.lastRequested.set(requestKey, now);
  return true;
};

/**
 * Mark a request as successful, resetting its failed attempts counter
 * @param {string} requestKey - Unique identifier for the request
 */
export const markRequestSuccess = (requestKey) => {
  if (!requestKey) return;
  
  requestCache.failedAttempts.set(requestKey, 0);
};

/**
 * Mark a request as failed, incrementing its failed attempts counter
 * @param {string} requestKey - Unique identifier for the request
 * @param {Object} [error] - The error object if available
 * @returns {number} The updated number of failed attempts
 */
export const markRequestFailed = (requestKey, error = null) => {
  if (!requestKey) return 0;
  
  // If this was a 404 error, mark the endpoint as not found to prevent future retries
  if (error && error.response && error.response.status === 404) {
    console.log(`[RequestUtils] Marking ${requestKey} as a 404 endpoint`);
    requestCache.notFoundEndpoints.add(requestKey);
    
    // Set high failed count to ensure it doesn't retry
    requestCache.failedAttempts.set(requestKey, requestCache.maxRetryAttempts);
    return requestCache.maxRetryAttempts;
  }
  
  const currentAttempts = requestCache.failedAttempts.get(requestKey) || 0;
  const newAttempts = currentAttempts + 1;
  requestCache.failedAttempts.set(requestKey, newAttempts);
  
  return newAttempts;
};

/**
 * Mark an endpoint as returning a 404 Not Found
 * @param {string} requestKey - Unique identifier for the request
 */
export const markEndpointNotFound = (requestKey) => {
  if (!requestKey) return;
  
  console.log(`[RequestUtils] Manually marking ${requestKey} as a 404 endpoint`);
  requestCache.notFoundEndpoints.add(requestKey);
  requestCache.failedAttempts.set(requestKey, requestCache.maxRetryAttempts);
};

/**
 * Generate a unique key for a request based on type and ID
 * @param {string} type - The type of request (e.g., 'reservation', 'place', 'expense')
 * @param {string|number} id - The item ID
 * @returns {string} A unique request key
 */
export const getRequestKey = (type, id) => {
  return `${type}_${id}`;
};

/**
 * Reset the request cache for a specific request or all requests
 * @param {string} [requestKey] - Optional key to reset. If not provided, resets all caches.
 */
export const resetRequestCache = (requestKey = null) => {
  if (requestKey) {
    requestCache.lastRequested.delete(requestKey);
    requestCache.failedAttempts.delete(requestKey);
  } else {
    requestCache.lastRequested.clear();
    requestCache.failedAttempts.clear();
  }
}; 