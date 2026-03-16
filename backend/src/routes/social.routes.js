const express = require('express');
const router = express.Router();
const s = require('../controllers/social.controller');
const { protect, optionalProtect } = require('../middleware/auth');

router.get('/profile/:userId', optionalProtect, s.getPublicProfile);
router.post('/follow/:userId', protect, s.follow);
router.delete('/follow/:userId', protect, s.unfollow);
router.get('/me/following', protect, s.getFollowing);

module.exports = router;
