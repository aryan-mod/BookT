const express = require('express');
const router = express.Router();
const r = require('../controllers/review.controller');
const { protect } = require('../middleware/auth');

// IMPORTANT: specific routes before parameterized routes
router.get('/my/:bookId', protect, r.getMyReview);

// Get reviews for a book (public)
router.get('/:bookId', r.getBookReviews);

// Protected: create/update, delete
router.post('/:bookId', protect, r.upsertReview);
router.delete('/:bookId', protect, r.deleteReview);

module.exports = router;
