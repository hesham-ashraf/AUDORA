import { rateLimit } from 'express-rate-limit';

/**
 * Apply rate limiting to routes
 * @param {Object} options Rate limiting options
 * @returns {Function} Express middleware
 */
export const createRateLimiter = (options = {}) => {
  const defaultOptions = {
    windowMs: 60 * 1000, // 1 minute
    max: 30, // Limit each IP to 30 requests per minute
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: {
      status: 429,
      error: 'Too many requests, please try again later.'
    }
  };

  return rateLimit({
    ...defaultOptions,
    ...options
  });
};

/**
 * Rate limiter specifically configured for search endpoints
 * - More permissive for autocomplete endpoints
 * - Stricter for search endpoints
 */
export const searchRateLimiter = {
  // Standard search rate limit (20 requests per minute)
  standard: createRateLimiter({
    windowMs: 60 * 1000,
    max: 20,
    message: {
      status: 429,
      error: 'Too many search requests, please try again later.'
    }
  }),
  
  // Autocomplete rate limit (60 requests per minute)
  autocomplete: createRateLimiter({
    windowMs: 60 * 1000,
    max: 60,
    message: {
      status: 429,
      error: 'Too many autocomplete requests, please try again later.'
    }
  }),
  
  // History access rate limit (15 requests per minute)
  history: createRateLimiter({
    windowMs: 60 * 1000,
    max: 15,
    message: {
      status: 429,
      error: 'Too many history requests, please try again later.'
    }
  })
};

/**
 * Rate limiter for API endpoints
 */
export const apiRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per 15 minutes
  message: {
    status: 429,
    error: 'Too many API requests, please try again later.'
  }
}); 