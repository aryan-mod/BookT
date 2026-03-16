const mongoose = require('mongoose');

/**
 * User-specific reading progress. One document per user per book.
 * Extended with reader annotations: bookmarks, highlights, notes.
 */
const bookmarkSchema = new mongoose.Schema({
  page: { type: Number, required: true },
  label: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

const highlightSchema = new mongoose.Schema({
  text: { type: String, required: true },
  page: { type: Number, required: true },
  color: { type: String, default: '#FBBF24' },
  note: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

const noteSchema = new mongoose.Schema({
  content: { type: String, required: true },
  page: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

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
    externalId: {
      type: String,
      default: null,
      index: true,
      trim: true,
    },
    externalSource: {
      type: String,
      enum: ['google', 'open-library'],
      default: null,
      index: true,
      trim: true,
    },
    currentPage: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['wishlist', 'reading', 'completed'],
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

    // ── Reader annotations ─────────────────────────────────────────────────
    bookmarks: { type: [bookmarkSchema], default: [] },
    userHighlights: { type: [highlightSchema], default: [] },
    notes: { type: [noteSchema], default: [] },
  },
  {
    timestamps: true,
  }
);

readingProgressSchema.index({ user: 1, book: 1 }, { unique: true });
readingProgressSchema.index(
  { user: 1, externalSource: 1, externalId: 1 },
  { unique: true, sparse: true }
);

const ReadingProgress = mongoose.model('ReadingProgress', readingProgressSchema);
module.exports = ReadingProgress;
