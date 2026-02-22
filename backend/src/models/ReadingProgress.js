const mongoose = require('mongoose');

/**
 * User-specific reading progress. One document per user per book.
 */
const readingProgressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true,
    },
    currentPage: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['reading', 'completed'],
      default: 'reading',
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: null,
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
    percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    lastReadAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

readingProgressSchema.index({ user: 1, book: 1 }, { unique: true });

const ReadingProgress = mongoose.model('ReadingProgress', readingProgressSchema);
module.exports = ReadingProgress;
