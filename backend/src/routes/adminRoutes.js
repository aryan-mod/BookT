const express = require('express');
const adminController = require('../controllers/adminController');
const { protect, restrictTo } = require('../middleware/auth');
const adminRateLimiter = require('../middleware/adminRateLimit');
const { Book } = require('../models');

const router = express.Router();

router.use(protect);
router.use(restrictTo('admin'));
router.use(adminRateLimiter);

router.get('/stats', adminController.getStats);
router.get('/users', adminController.getAllUsers);
router.get('/audit-logs', adminController.getAuditLogs);
router.patch('/users/:id/toggle-ban', adminController.toggleBanUser);

// ── Marketplace admin controls ─────────────────────────────────────────────
router.patch('/marketplace/books/:id', async (req, res, next) => {
  try {
    const allowed = ['price', 'isPremium', 'isFeatured', 'isApproved', 'tags'];
    const update = {};
    allowed.forEach((k) => { if (req.body[k] !== undefined) update[k] = req.body[k]; });
    const book = await Book.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!book) return res.status(404).json({ success: false, message: 'Book not found.' });
    res.json({ success: true, data: { book } });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

