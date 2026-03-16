const express = require('express');
const router = express.Router();
const n = require('../controllers/notification.controller');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', n.getNotifications);
router.patch('/read-all', n.markAllRead);
router.patch('/:id/read', n.markRead);
router.delete('/:id', n.deleteNotification);

module.exports = router;
