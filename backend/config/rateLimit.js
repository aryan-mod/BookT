const rateLimit = require('express-rate-limit');

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Generic API limiter for public endpoints (fallback).
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProduction ? 1000 : 5000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many requests. Please try again later.',
  },
});

/**
 * Search limiter: applied to book search endpoints to prevent abuse.
 */
const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: isProduction ? 60 : 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'You are searching too fast. Please slow down.',
  },
});

module.exports = {
  apiLimiter,
  searchLimiter,
};

