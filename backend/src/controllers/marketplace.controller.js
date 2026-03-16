const { Book, Review } = require('../models');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/apiResponse');

/**
 * GET /marketplace
 * Paginated, filterable book catalogue.
 * Query params: page, limit, genre, minPrice, maxPrice, sort, featured, search
 */
exports.listMarketplace = catchAsync(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(48, Math.max(1, parseInt(req.query.limit) || 12));
  const skip = (page - 1) * limit;

  const filter = { isApproved: true };

  if (req.query.genre) {
    filter.genre = { $in: [req.query.genre] };
  }
  if (req.query.featured === 'true') {
    filter.isFeatured = true;
  }
  if (req.query.minPrice || req.query.maxPrice) {
    filter.price = {};
    if (req.query.minPrice) filter.price.$gte = parseFloat(req.query.minPrice);
    if (req.query.maxPrice) filter.price.$lte = parseFloat(req.query.maxPrice);
  }
  if (req.query.search) {
    filter.$text = { $search: req.query.search };
  }

  const sortMap = {
    newest: { createdAt: -1 },
    popular: { salesCount: -1 },
    rating: { averageRating: -1 },
    'price-asc': { price: 1 },
    'price-desc': { price: -1 },
  };
  const sort = sortMap[req.query.sort] || { createdAt: -1 };

  const [books, total] = await Promise.all([
    Book.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Book.countDocuments(filter),
  ]);

  sendSuccess(res, {
    data: {
      books,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    },
  });
});

/**
 * GET /marketplace/featured
 * Featured books for hero carousel (max 8).
 */
exports.getFeatured = catchAsync(async (req, res) => {
  const books = await Book.find({ isFeatured: true, isApproved: true })
    .sort({ salesCount: -1 })
    .limit(8)
    .lean();

  sendSuccess(res, { data: { books } });
});

/**
 * GET /marketplace/trending
 * Top books by sales this month, max 12.
 */
exports.getTrending = catchAsync(async (req, res) => {
  const books = await Book.find({ isApproved: true, salesCount: { $gt: 0 } })
    .sort({ salesCount: -1 })
    .limit(12)
    .lean();

  // Fallback: just newest books if none have sales yet
  if (!books.length) {
    const fallback = await Book.find({ isApproved: true })
      .sort({ createdAt: -1 })
      .limit(12)
      .lean();
    return sendSuccess(res, { data: { books: fallback } });
  }

  sendSuccess(res, { data: { books } });
});

/**
 * GET /marketplace/bestsellers
 * Highest-rated books with at least 1 review.
 */
exports.getBestsellers = catchAsync(async (req, res) => {
  const books = await Book.find({ isApproved: true, reviewCount: { $gte: 1 } })
    .sort({ averageRating: -1, reviewCount: -1 })
    .limit(12)
    .lean();

  // Fallback to popular books
  if (!books.length) {
    const fallback = await Book.find({ isApproved: true })
      .sort({ salesCount: -1 })
      .limit(12)
      .lean();
    return sendSuccess(res, { data: { books: fallback } });
  }

  sendSuccess(res, { data: { books } });
});

/**
 * GET /marketplace/categories
 * All distinct genres with counts.
 */
exports.getCategories = catchAsync(async (req, res) => {
  const agg = await Book.aggregate([
    { $match: { isApproved: true } },
    { $unwind: '$genre' },
    { $group: { _id: '$genre', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $project: { name: '$_id', count: 1, _id: 0 } },
  ]);

  sendSuccess(res, { data: { categories: agg } });
});

/**
 * GET /marketplace/:id
 * Single book detail with reviews.
 */
exports.getBookDetail = catchAsync(async (req, res, next) => {
  const book = await Book.findById(req.params.id).lean();
  if (!book) return next(new AppError('Book not found.', 404));

  const reviews = await Review.find({ book: req.params.id })
    .populate('user', 'name avatar')
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  // Check if requesting user has purchased this book
  let isPurchased = false;
  if (req.user) {
    const User = require('../models').User;
    const u = await User.findById(req.user._id).select('purchasedBooks').lean();
    isPurchased = u?.purchasedBooks?.some(
      (bid) => String(bid) === String(book._id)
    ) ?? false;
  }

  sendSuccess(res, { data: { book, reviews, isPurchased } });
});
