const mongoose = require('mongoose');

const uploadedBookReadingProgressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UploadedBook',
      required: true,
    },
    currentPage: {
      type: Number,
      default: 1,
    },
    totalPages: {
      type: Number,
      default: 1,
    },
    percentage: {
      type: Number,
      default: 0,
    },
    lastReadAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: {
      transform(_doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

uploadedBookReadingProgressSchema.index(
  { user: 1, book: 1 },
  { unique: true }
);

uploadedBookReadingProgressSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

const UploadedBookReadingProgress = mongoose.model(
  'UploadedBookReadingProgress',
  uploadedBookReadingProgressSchema
);
module.exports = UploadedBookReadingProgress;
