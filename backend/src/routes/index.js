const express = require('express');
const authRoutes = require('./authRoutes');
const bookRoutes = require('./bookRoutes');
const bookRequestRoutes = require('./bookRequestRoutes');
const adminRoutes = require('./adminRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/books', bookRoutes);
router.use('/book-requests', bookRequestRoutes);
router.use('/admin', adminRoutes);

/**
 * Lightweight health/debug endpoint.
 * Exposes:
 * - request origin
 * - whether any cookies are present
 * - environment mode
 * - CORS allowed origins (from app.locals)
 *
 * Does NOT expose secrets or raw tokens.
 */
router.get('/health', (req, res) => {
  const origin = req.headers.origin || null;
  const cookiesPresent = Boolean(req.headers.cookie);
  const env = process.env.NODE_ENV || 'development';
  const corsAllowedOrigins =
    (req.app && req.app.locals && req.app.locals.corsAllowedOrigins) || [];

  res.status(200).json({
    status: 'ok',
    message: 'API is running',
    data: {
      env,
      origin,
      cookiesPresent,
      cors: {
        credentials: true,
        allowedOrigins: corsAllowedOrigins,
      },
    },
  });
});

module.exports = router;
