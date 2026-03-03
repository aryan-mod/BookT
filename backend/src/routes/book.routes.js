const express = require('express');
const validateSearchQuery = require('../middlewares/validateSearchQuery.middleware');
const bookController = require('../controllers/book.controller');
const { protect } = require('../middleware/auth');

// Reuse existing internal book routes without breaking behavior.
const legacyBookRoutes = require('./bookRoutes');

const router = express.Router();

// Must be registered before legacy `/:id` routes.
router.get('/search', validateSearchQuery, bookController.searchBooks);
router.post('/preview-click', protect, bookController.trackPreviewClick);

router.use('/', legacyBookRoutes);

module.exports = router;

