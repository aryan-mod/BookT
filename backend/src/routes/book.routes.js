const express = require('express');
const validateSearchQuery = require('../middlewares/validateSearchQuery.middleware');
const bookController = require('../controllers/book.controller');
const { protect, optionalProtect } = require('../middleware/auth');
const { searchLimiter } = require('../../config/rateLimit');

// Reuse existing internal book routes without breaking behavior.
const legacyBookRoutes = require('./bookRoutes');

const router = express.Router();

// Must be registered before legacy `/:id` routes.
// Search is public but rate-limited; when authenticated we can later personalize.
router.get(
  '/search',
  searchLimiter,
  validateSearchQuery,
  bookController.searchBooks
);

// Track preview clicks only for authenticated users.
router.post('/preview-click', protect, bookController.trackPreviewClick);

// User library routes - require authentication.
router.use('/', protect, legacyBookRoutes);

module.exports = router;


