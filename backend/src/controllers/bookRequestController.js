const { BookRequest, Book, User, AdminAction } = require('../models');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

const BOOK_META_FIELDS = ['title', 'author', 'pages', 'cover', 'genre', 'description'];

function pick(obj, keys) {
  return keys.reduce((acc, k) => {
    if (obj != null && obj.hasOwnProperty(k)) acc[k] = obj[k];
    return acc;
  }, {});
}

function normalizeRequest(doc) {
  const o = doc.toObject ? doc.toObject() : { ...doc };
  o.id = o._id;
  return o;
}

/**
 * POST /book-requests (protected, user)
 * Create a new book request (status: pending).
 */
exports.createBookRequest = catchAsync(async (req, res, next) => {
  const meta = pick(req.body, BOOK_META_FIELDS);
  if (!meta.title || !meta.author) {
    return next(new AppError('Title and author are required.', 400));
  }
  const request = await BookRequest.create({
    ...meta,
    requestedBy: req.user._id,
    status: 'pending',
  });
  const populated = await BookRequest.findById(request._id).populate('requestedBy', 'name email');
  res.status(201).json({
    status: 'success',
    data: { request: normalizeRequest(populated) },
  });
});

/**
 * GET /book-requests/pending (protected, admin)
 * List all pending book requests.
 */
exports.getPendingRequests = catchAsync(async (req, res, next) => {
  const requests = await BookRequest.find({
    status: 'pending',
    isDeleted: { $ne: true },
  })
    .populate('requestedBy', 'name email')
    .sort('-createdAt');
  const normalized = requests.map(normalizeRequest);
  res.status(200).json({
    status: 'success',
    results: normalized.length,
    data: { requests: normalized },
  });
});

/**
 * POST /book-requests/:id/approve (protected, admin)
 * Approve request: create Book if not duplicate (title+author), then update request.
 */
exports.approveRequest = catchAsync(async (req, res, next) => {
  const request = await BookRequest.findById(req.params.id).populate('requestedBy', 'name email');
  if (!request) {
    return next(new AppError('Book request not found.', 404));
  }
  if (request.status !== 'pending') {
    return next(new AppError('This request has already been reviewed.', 400));
  }

  const titleRegex = new RegExp(`^${escapeRegex(request.title.trim())}$`, 'i');
  const authorRegex = new RegExp(`^${escapeRegex(request.author.trim())}$`, 'i');
  const existing = await Book.findOne({
    title: titleRegex,
    author: authorRegex,
  });
  if (existing) {
    request.status = 'rejected';
    request.reviewedAt = new Date();
    request.reviewedBy = req.user._id;
    await request.save();
    return next(
      new AppError(
        'A book with this title and author already exists in the catalogue.',
        400
      )
    );
  }

  const bookMeta = pick(
    {
      title: request.title,
      author: request.author,
      pages: request.pages,
      cover: request.cover,
      genre: request.genre,
      description: request.description,
    },
    BOOK_META_FIELDS
  );
  const book = await Book.create(bookMeta);
  request.status = 'approved';
  request.reviewedAt = new Date();
  request.reviewedBy = req.user._id;
  await request.save();

  await AdminAction.create({
    admin: req.user._id,
    action: 'APPROVE_REQUEST',
    targetRequest: request._id,
    targetBook: book._id,
    metadata: { title: request.title, author: request.author },
  });

  const bookObj = { ...book.toObject(), id: book._id };
  if (bookObj.cover != null) bookObj.coverImage = bookObj.cover;
  if (bookObj.genre != null) bookObj.categories = bookObj.genre;

  res.status(200).json({
    status: 'success',
    data: {
      request: normalizeRequest(request),
      book: bookObj,
    },
  });
});

/**
 * POST /book-requests/:id/reject (protected, admin)
 * Reject a pending request.
 */
exports.rejectRequest = catchAsync(async (req, res, next) => {
  const request = await BookRequest.findById(req.params.id).populate('requestedBy', 'name email');
  if (!request) {
    return next(new AppError('Book request not found.', 404));
  }
  if (request.status !== 'pending') {
    return next(new AppError('This request has already been reviewed.', 400));
  }
  request.status = 'rejected';
  request.reviewedAt = new Date();
  request.reviewedBy = req.user._id;
  await request.save();

  await AdminAction.create({
    admin: req.user._id,
    action: 'REJECT_REQUEST',
    targetRequest: request._id,
    metadata: { title: request.title, author: request.author },
  });

  res.status(200).json({
    status: 'success',
    data: { request: normalizeRequest(request) },
  });
});

/**
 * DELETE /book-requests/:id (protected, admin)
 * Delete a book request permanently. Does not delete approved books.
 */
exports.deleteRequest = catchAsync(async (req, res, next) => {
  const request = await BookRequest.findById(req.params.id);
  if (!request) {
    return next(new AppError('Book request not found.', 404));
  }
  request.isDeleted = true;
  await request.save({ validateBeforeSave: false });

  await AdminAction.create({
    admin: req.user._id,
    action: 'DELETE_REQUEST',
    targetRequest: request._id,
    metadata: { title: request.title, author: request.author },
  });

  res.status(200).json({
    status: 'success',
    message: 'Request deleted permanently',
  });
});

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
