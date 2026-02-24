const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const isProduction = process.env.NODE_ENV === 'production';

/**
 * Login rate limiter: strict in production, relaxed in development.
 * Applied only to POST /auth/login to prevent brute force attacks.
 */
const loginLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: isProduction
    ? (parseInt(process.env.AUTH_RATE_LIMIT_MAX, 10) || 5)
    : 100,
  message: {
    status: 'error',
    message: 'Too many login attempts. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Register rate limiter: same configuration as login.
 * Prevents abuse of registration endpoint.
 */
const registerLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: isProduction
    ? (parseInt(process.env.AUTH_RATE_LIMIT_MAX, 10) || 5)
    : 100,
  message: {
    status: 'error',
    message: 'Too many registration attempts. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Generic auth limiter for non-login flows (refresh, logout, etc.).
 * Much higher ceiling, but still prevents abuse.
 */
const authLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: isProduction ? 100 : 1000,
  message: {
    status: 'error',
    message: 'Too many auth requests. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const sanitizeData = () => mongoSanitize();

const sanitizeXss = () => xss();

module.exports = {
  loginLimiter,
  registerLimiter,
  authLimiter,
  sanitizeData,
  sanitizeXss,
};

