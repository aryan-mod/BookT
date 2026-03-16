const { Review, Book } = require('../models');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/apiResponse');

/**
 * GET /reviews/:bookId
 * Get reviews for a book.
 */
exports.getBookReviews = catchAsync(async (req, res, next) => {
  const bookId = req.params.bookId;
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(20, parseInt(req.query.limit) || 10);

  const book = await Book.findById(bookId).select('_id').lean();
  if (!book) return next(new AppError('Book not found.', 404));

  const [reviews, total] = await Promise.all([
    Review.find({ book: bookId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Review.countDocuments({ book: bookId }),
  ]);

  sendSuccess(res, {
    data: {
      reviews,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    },
  });
});

/**
 * POST /reviews/:bookId
 * Create or update the requesting user's review.
 */
exports.upsertReview = catchAsync(async (req, res, next) => {
  const bookId = req.params.bookId;
  const { rating, title, body } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return next(new AppError('Rating must be between 1 and 5.', 400));
  }

  const book = await Book.findById(bookId).select('_id').lean();
  if (!book) return next(new AppError('Book not found.', 404));

  const review = await Review.findOneAndUpdate(
    { user: req.user._id, book: bookId },
    { rating, title: title || '', body: body || '' },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
  );

  // Trigger recalc (post-save hook handles new reviews; manual call for updates)
  await Review.recalcBook(bookId);

  sendSuccess(res, { statusCode: 201, data: { review } });
});

/**
 * DELETE /reviews/:bookId
 * Delete the requesting user's review.
 */
exports.deleteReview = catchAsync(async (req, res, next) => {
  const deleted = await Review.findOneAndDelete({
    user: req.user._id,
    book: req.params.bookId,
  });
  if (!deleted) return next(new AppError('Review not found.', 404));
  sendSuccess(res, { data: { message: 'Review deleted.' } });
});

/**
 * GET /reviews/my/:bookId  
 * Get the current user's review for a book.
 */
exports.getMyReview = catchAsync(async (req, res) => {
  const review = await Review.findOne({
    user: req.user._id,
    book: req.params.bookId,
  }).lean();
  sendSuccess(res, { data: { review: review || null } });
});
