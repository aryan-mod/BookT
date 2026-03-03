const express = require('express');
const { protect } = require('../middleware/auth');
const { handleUpload } = require('../middlewares/upload.middleware');
const readerController = require('../controllers/reader.controller');

const router = express.Router();

router.use(protect);

router.post('/upload', handleUpload, readerController.uploadPdf);
router.post('/session', readerController.createSession);
router.get('/progress', readerController.getProgress);
router.patch('/progress', readerController.updateProgress);
router.post('/progress', readerController.updateProgress);
router.get('/:bookId', readerController.getBook);

module.exports = router;
