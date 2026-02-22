const express = require('express');
const adminController = require('../controllers/adminController');
const { protect, restrictTo } = require('../middleware/auth');
const adminRateLimiter = require('../middleware/adminRateLimit');

const router = express.Router();

router.use(protect);
router.use(restrictTo('admin'));
router.use(adminRateLimiter);

router.get('/stats', adminController.getStats);
router.get('/users', adminController.getAllUsers);
router.get('/audit-logs', adminController.getAuditLogs);
router.patch('/users/:id/toggle-ban', adminController.toggleBanUser);

module.exports = router;
