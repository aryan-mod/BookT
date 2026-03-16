const express = require('express');
const authRoutes = require('./authRoutes');
const bookRoutes = require('./book.routes');
const bookRequestRoutes = require('./bookRequestRoutes');
const adminRoutes = require('./adminRoutes');
const readerRoutes = require('./reader.routes');
const marketplaceRoutes = require('./marketplace.routes');
const aiRoutes = require('./ai.routes');
const orderRoutes = require('./order.routes');
const reviewRoutes = require('./review.routes');
const gamificationRoutes = require('./gamification.routes');
const socialRoutes = require('./social.routes');
const notificationRoutes = require('./notification.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/books', bookRoutes);
router.use('/book-requests', bookRequestRoutes);
router.use('/admin', adminRoutes);
router.use('/reader', readerRoutes);
router.use('/marketplace', marketplaceRoutes);
router.use('/ai', aiRoutes);
router.use('/orders', orderRoutes);
router.use('/reviews', reviewRoutes);
router.use('/gamification', gamificationRoutes);
router.use('/social', socialRoutes);
router.use('/notifications', notificationRoutes);

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
