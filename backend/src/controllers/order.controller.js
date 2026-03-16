const { Order, Book, ReadingProgress, Notification } = require('../models');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/apiResponse');
const mongoose = require('mongoose');

/**
 * POST /orders/checkout
 * Body: { items: [{ bookId, price }] }
 * Simulated purchase – marks books as purchased and adds to library.
 */
exports.checkout = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return next(new AppError('Cart is empty.', 400));
  }

  // Validate all books exist
  const bookIds = items.map((i) => i.bookId);
  const books = await Book.find({ _id: { $in: bookIds } }).lean();

  if (books.length !== bookIds.length) {
    return next(new AppError('One or more books not found.', 404));
  }

  const User = require('../models').User;
  const user = await User.findById(userId);

  // Filter out already-purchased books
  const alreadyOwned = new Set(user.purchasedBooks.map(String));
  const newBooks = books.filter((b) => !alreadyOwned.has(String(b._id)));

  const orderItems = newBooks.map((b) => ({
    book: b._id,
    price: b.price || 0,
    title: b.title,
  }));

  const total = orderItems.reduce((sum, i) => sum + i.price, 0);

  // Create order
  const order = await Order.create({
    user: userId,
    items: orderItems,
    total,
    status: 'completed',
    paymentRef: `SIM-${Date.now()}`,
  });

  // Add to user's purchasedBooks
  if (newBooks.length > 0) {
    user.purchasedBooks.push(...newBooks.map((b) => b._id));
    user.coins = (user.coins || 0) + newBooks.length * 10; // reward coins
    await user.save({ validateBeforeSave: false });

    // Auto-add to reading library via ReadingProgress
    for (const book of newBooks) {
      await ReadingProgress.findOneAndUpdate(
        { user: userId, book: book._id },
        { status: 'reading', currentPage: 0 },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    // Increment salesCount
    await Book.updateMany(
      { _id: { $in: newBooks.map((b) => b._id) } },
      { $inc: { salesCount: 1 } }
    );

    // Create notification
    await Notification.create({
      user: userId,
      type: 'purchase_confirmed',
      title: '🛒 Purchase Complete!',
      message: `${newBooks.length} book${newBooks.length > 1 ? 's' : ''} added to your library.`,
      icon: '🛒',
      link: '/dashboard',
    });
  }

  sendSuccess(res, {
    statusCode: 201,
    data: {
      order: {
        _id: order._id,
        items: orderItems,
        total,
        status: order.status,
        purchasedAt: order.createdAt,
      },
      newBooksAdded: newBooks.length,
    },
  });
});

/**
 * GET /orders/my
 * User's purchase history.
 */
exports.getMyOrders = catchAsync(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(20, parseInt(req.query.limit) || 10);

  const orders = await Order.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('items.book', 'title cover author')
    .lean();

  const total = await Order.countDocuments({ user: req.user._id });

  sendSuccess(res, {
    data: {
      orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    },
  });
});
