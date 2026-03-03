const express = require('express');
const bookController = require('../controllers/bookController');
const { protect, optionalProtect } = require('../middleware/auth');

const router = express.Router();

router.get('/explore', optionalProtect, bookController.getExploreBooks);
// Must be defined before legacy `/:id` route to avoid being treated as an id.
router.get('/user-external-ids', protect, bookController.getUserExternalIds);
router.route('/').get(optionalProtect, bookController.getAllBooks);
router.route('/:id').get(optionalProtect, bookController.getBook);

router.use(protect);

router.post('/add-external', bookController.addExternalBook);

router.route('/').post(bookController.createBook);
router.post('/:id/add-to-library', bookController.addToLibrary);
router.route('/:id').put(bookController.updateBook).delete(bookController.deleteBook);

module.exports = router;
