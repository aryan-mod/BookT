const mongoose = require('mongoose');
const { Readable } = require('stream');
const cloudinary = require('../../config/cloudinary');
const UploadedBook = require('../models/UploadedBook');
const UploadedBookReadingProgress = require('../models/UploadedBookReadingProgress');
const UploadedBookReadingSession = require('../models/UploadedBookReadingSession');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/apiResponse');

const uploadPdf = catchAsync(async (req, res, next) => {
  if (!req.file || !req.file.buffer) {
    return next(new AppError('No file provided.', 400));
  }

  const title = typeof req.body?.title === 'string' ? req.body.title.trim() : '';
  if (!title) {
    return next(new AppError('Title is required.', 400));
  }

  const uploadOptions = {
    resource_type: 'raw',
    folder: 'bookt/pdfs',
  };

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      async (err, result) => {
        if (err) {
          return reject(
            new AppError(
              err.message || 'Failed to upload file to storage.',
              502
            )
          );
        }
        if (!result || !result.secure_url || !result.public_id) {
          return reject(new AppError('Invalid upload response.', 502));
        }

        try {
          const uploadedBook = await UploadedBook.create({
            user: req.user._id,
            title,
            fileUrl: result.secure_url,
            publicId: result.public_id,
            fileSize: req.file.size,
            mimeType: req.file.mimetype,
          });

          return resolve(
            sendSuccess(res, {
              data: uploadedBook,
              statusCode: 201,
            })
          );
        } catch (createErr) {
          return reject(
            new AppError(
              createErr.message || 'Failed to save book metadata.',
              500
            )
          );
        }
      }
    );

    const readable = Readable.from(req.file.buffer);
    readable.pipe(uploadStream);
  });
});

const getBook = catchAsync(async (req, res, next) => {
  const { bookId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(bookId)) {
    return next(new AppError('Invalid book ID.', 400));
  }

  const book = await UploadedBook.findById(bookId);

  if (!book) {
    return next(new AppError('Book not found.', 404));
  }

  if (book.user.toString() !== req.user._id.toString()) {
    return next(new AppError('You do not have access to this book.', 403));
  }

  return sendSuccess(res, { data: book });
});

const updateProgress = catchAsync(async (req, res, next) => {
  const { bookId, currentPage, totalPages } = req.body;

  if (!bookId) {
    return next(new AppError('bookId is required.', 400));
  }

  if (!mongoose.Types.ObjectId.isValid(bookId)) {
    return next(new AppError('Invalid bookId.', 400));
  }

  const page = Number(currentPage);
  const total = Number(totalPages);

  if (!Number.isInteger(page) || page < 1) {
    return next(new AppError('currentPage must be an integer >= 1.', 400));
  }
  if (!Number.isInteger(total) || total < 1) {
    return next(new AppError('totalPages must be an integer >= 1.', 400));
  }
  if (page > total) {
    return next(
      new AppError('currentPage must not exceed totalPages.', 400)
    );
  }

  const book = await UploadedBook.findById(bookId);

  if (!book) {
    return next(new AppError('Book not found.', 404));
  }

  if (book.user.toString() !== req.user._id.toString()) {
    return next(new AppError('You do not have access to this book.', 403));
  }

  const percentage = Math.round((page / total) * 100);
  const now = new Date();

  const progress = await UploadedBookReadingProgress.findOneAndUpdate(
    { user: req.user._id, book: bookId },
    {
      currentPage: page,
      totalPages: total,
      percentage,
      lastReadAt: now,
      updatedAt: now,
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
    }
  ).populate('book', 'title fileUrl totalPages');

  return sendSuccess(res, { data: progress });
});

const getProgress = catchAsync(async (req, res, next) => {
  const { bookId } = req.query;

  if (!bookId) {
    return next(new AppError('bookId is required.', 400));
  }

  if (!mongoose.Types.ObjectId.isValid(bookId)) {
    return next(new AppError('Invalid bookId.', 400));
  }

  const book = await UploadedBook.findById(bookId);

  if (!book) {
    return next(new AppError('Book not found.', 404));
  }

  if (book.user.toString() !== req.user._id.toString()) {
    return next(new AppError('You do not have access to this book.', 403));
  }

  const progress = await UploadedBookReadingProgress.findOne({
    user: req.user._id,
    book: bookId,
  });

  if (!progress) {
    return sendSuccess(res, {
      data: {
        currentPage: 1,
        totalPages: 1,
        percentage: 0,
      },
    });
  }

  return sendSuccess(res, { data: progress });
});

const createSession = catchAsync(async (req, res, next) => {
  const { bookId, durationInSeconds } = req.body;

  if (!bookId) {
    return next(new AppError('bookId is required.', 400));
  }

  if (!mongoose.Types.ObjectId.isValid(bookId)) {
    return next(new AppError('Invalid bookId.', 400));
  }

  const duration = Number(durationInSeconds);
  if (!Number.isFinite(duration) || duration < 0) {
    return next(new AppError('durationInSeconds must be a non-negative number.', 400));
  }

  const book = await UploadedBook.findById(bookId);
  if (!book) {
    return next(new AppError('Book not found.', 404));
  }
  if (book.user.toString() !== req.user._id.toString()) {
    return next(new AppError('You do not have access to this book.', 403));
  }

  await UploadedBookReadingSession.create({
    user: req.user._id,
    book: bookId,
    durationInSeconds: Math.round(duration),
  });

  return sendSuccess(res, { data: { ok: true }, statusCode: 201 });
});

module.exports = {
  uploadPdf,
  getBook,
  getProgress,
  updateProgress,
  createSession,
};
