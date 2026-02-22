const express = require('express');
const bookRequestController = require('../controllers/bookRequestController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/', bookRequestController.createBookRequest);

router.get('/pending', restrictTo('admin'), bookRequestController.getPendingRequests);
router.post('/:id/approve', restrictTo('admin'), bookRequestController.approveRequest);
router.post('/:id/reject', restrictTo('admin'), bookRequestController.rejectRequest);
router.delete('/:id', restrictTo('admin'), bookRequestController.deleteRequest);

module.exports = router;
