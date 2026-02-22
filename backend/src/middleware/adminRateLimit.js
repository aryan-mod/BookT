const rateLimit = require('express-rate-limit');

/**
 * Admin route rate limiter: 50 requests per 15 minutes.
 * Protects admin endpoints from abuse.
 */
const adminRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: {
    status: 'fail',
    message: 'Too many requests. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = adminRateLimiter;
