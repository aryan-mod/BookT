const express = require('express');
const router = express.Router();
const m = require('../controllers/marketplace.controller');
const { optionalProtect } = require('../middleware/auth');

router.get('/', optionalProtect, m.listMarketplace);
router.get('/featured', m.getFeatured);
router.get('/trending', m.getTrending);
router.get('/bestsellers', m.getBestsellers);
router.get('/categories', m.getCategories);
router.get('/:id', optionalProtect, m.getBookDetail);

module.exports = router;
