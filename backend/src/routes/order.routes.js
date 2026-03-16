const express = require('express');
const router = express.Router();
const o = require('../controllers/order.controller');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/checkout', o.checkout);
router.get('/my', o.getMyOrders);

module.exports = router;
