const { Book, ReadingProgress } = require('../models');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

/** Book metadata fields only (for create/update). */
const BOOK_META_FIELDS = ['title', 'author', 'pages', 'cover', 'genre', 'description'];

/** Normalize body: map legacy field names to current schema. */
function normalizeBookMeta(body) {
  const meta = pick(body, BOOK_META_FIELDS);
  if (body.coverImage != null && meta.cover === undefined) meta.cover = body.coverImage;
  if (body.categories != null && meta.genre === undefined) meta.genre = body.categories;
  return meta;
}

/** Progress fields stored in ReadingProgress. */
const PROGRESS_FIELDS = ['currentPage', 'status', 'rating', 'startDate', 'endDate', 'percentage', 'lastReadAt'];

function pick(obj, keys) {
  return keys.reduce((acc, k) => {
    if (obj != null && obj.hasOwnProperty(k)) acc[k] = obj[k];
    return acc;
  }, {});
}

/**
 * Merge book document and optional progress document for API response.
 * Preserves _id as id and flattens progress onto the book object so frontend format is unchanged.
 */
function mergeBookWithProgress(bookDoc, progressDoc) {
  const book = bookDoc.toObject ? bookDoc.toObject() : { ...bookDoc };
  const id = book._id;
  const out = { ...book, id: id || book.id };
  if (out.cover != null && out.coverImage === undefined) out.coverImage = out.cover;
  if (out.genre != null && out.categories === undefined) out.categories = out.genre;
  if (progressDoc) {
    const prog = progressDoc.toObject ? progressDoc.toObject() : { ...progressDoc };
    out.currentPage = prog.currentPage;
    out.status = prog.status;
    out.rating = prog.rating;
    out.startDate = prog.startDate;
    out.endDate = prog.endDate;
    out.percentage = prog.percentage;
    out.lastReadAt = prog.lastReadAt;
  }
  return out;
}

/**
 * GET /books/explore
 * Global catalogue: all books from Book collection, no progress.
 * Works with or without auth (optionalProtect).
 */
exports.getExploreBooks = catchAsync(async (req, res, next) => {
  const books = await Book.find().sort('-createdAt');
  const normalized = books.map((b) => {
    const o = { ...b.toObject(), id: b._id };
    if (o.cover != null) o.coverImage = o.cover;
    if (o.genre != null) o.categories = o.genre;
    return o;
  });
  res.status(200).json({
    status: 'success',
    results: normalized.length,
    data: { books: normalized },
  });
});

/**
 * GET /books
 * With auth: returns books that the user has progress for, with progress joined.
 * Without auth: returns all books (no progress).
 */
exports.getAllBooks = catchAsync(async (req, res, next) => {
  if (req.user) {
    const progresses = await ReadingProgress.find({ user: req.user._id })
      .populate('book')
      .sort('-updatedAt');
    const books = progresses
      .filter((p) => p.book)
      .map((p) => mergeBookWithProgress(p.book, p));
    return res.status(200).json({
      status: 'success',
      results: books.length,
      data: { books },
    });
  }
  const books = await Book.find().sort('-createdAt');
  const normalized = books.map((b) => {
    const o = { ...b.toObject(), id: b._id };
    if (o.cover != null) o.coverImage = o.cover;
    if (o.genre != null) o.categories = o.genre;
    return o;
  });
  res.status(200).json({
    status: 'success',
    results: normalized.length,
    data: { books: normalized },
  });
});

/**
 * GET /books/:id
 * Returns book by id. If user is logged in, includes their progress.
 */
exports.getBook = catchAsync(async (req, res, next) => {
  const book = await Book.findById(req.params.id);
  if (!book) {
    return next(new AppError('Book not found.', 404));
  }
  let progress = null;
  if (req.user) {
    progress = await ReadingProgress.findOne({
      user: req.user._id,
      book: req.params.id,
    });
  }
  const data = mergeBookWithProgress(book, progress);
  res.status(200).json({
    status: 'success',
    data: { book: data },
  });
});

/**
 * POST /books (protected)
 * Creates a new book (metadata) and the user's reading progress (from body).
 */
exports.createBook = catchAsync(async (req, res, next) => {
  const meta = normalizeBookMeta(req.body);
  const progressInput = pick(req.body, PROGRESS_FIELDS);
  const book = await Book.create(meta);
  const progress = await ReadingProgress.create({
    user: req.user._id,
    book: book._id,
    ...progressInput,
  });
  const data = mergeBookWithProgress(book, progress);
  res.status(201).json({
    status: 'success',
    data: { book: data },
  });
});

/**
 * PUT /books/:id (protected)
 * Updates book metadata and upserts the user's reading progress.
 */
exports.updateBook = catchAsync(async (req, res, next) => {
  const bookId = req.params.id;
  const book = await Book.findById(bookId);
  if (!book) {
    return next(new AppError('Book not found.', 404));
  }
  const meta = normalizeBookMeta(req.body);
  const progressInput = pick(req.body, PROGRESS_FIELDS);
  if (Object.keys(meta).length > 0) {
    await Book.findByIdAndUpdate(bookId, meta, {
      new: true,
      runValidators: true,
    });
  }
  const progress = await ReadingProgress.findOneAndUpdate(
    { user: req.user._id, book: bookId },
    progressInput,
    { upsert: true, new: true, runValidators: true }
  );
  const updatedBook = await Book.findById(bookId);
  const data = mergeBookWithProgress(updatedBook, progress);
  res.status(200).json({
    status: 'success',
    data: { book: data },
  });
});

/**
 * DELETE /books/:id (protected)
 * Removes this book from the user's library (deletes ReadingProgress only).
 * Does not delete the Book document so other users are unaffected.
 */
exports.deleteBook = catchAsync(async (req, res, next) => {
  const deleted = await ReadingProgress.findOneAndDelete({
    user: req.user._id,
    book: req.params.id,
  });
  if (!deleted) {
    return next(new AppError('Book not found in your library.', 404));
  }
  res.status(200).json({
    status: 'success',
    message: 'Book deleted successfully.',
  });
});

/**
 * POST /books/:id/add-to-library (protected)
 * Adds an existing global book to the user's library by creating ReadingProgress only.
 * Does not create a new Book document (no duplicates).
 */
exports.addToLibrary = catchAsync(async (req, res, next) => {
  const bookId = req.params.id;
  const book = await Book.findById(bookId);
  if (!book) {
    return next(new AppError('Book not found.', 404));
  }
  const progressInput = pick(req.body, PROGRESS_FIELDS);
  const progress = await ReadingProgress.findOneAndUpdate(
    { user: req.user._id, book: bookId },
    { ...progressInput, currentPage: progressInput.currentPage ?? 0, status: progressInput.status || 'reading' },
    { upsert: true, new: true, runValidators: true }
  );
  const data = mergeBookWithProgress(book, progress);
  res.status(201).json({
    status: 'success',
    data: { book: data },
  });
});
