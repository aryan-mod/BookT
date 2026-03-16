const express = require('express');
const router = express.Router();
const g = require('../controllers/gamification.controller');
const { protect, optionalProtect } = require('../middleware/auth');

router.get('/leaderboard', optionalProtect, g.getLeaderboard);
router.get('/badges', protect, g.getBadges);
router.post('/check-badges', protect, g.checkAndAwardBadges);

module.exports = router;
