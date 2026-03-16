const mongoose = require('mongoose');

/**
 * Global book metadata only. User-specific progress lives in ReadingProgress.
 * Extended with marketplace, ratings and gamification fields.
 */
const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Book title is required'],
      trim: true,
    },
    author: {
      type: String,
      required: [true, 'Author is required'],
      trim: true,
    },
    pages: {
      type: Number,
      default: 0,
      min: 0,
    },
    cover: {
      type: String,
      default: '',
    },
    genre: [
      {
        type: String,
        trim: true,
      },
    ],
    description: {
      type: String,
      default: '',
    },
    tags: [{ type: String, trim: true }],

    // ── Marketplace ────────────────────────────────────────────────────────
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
    salesCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ── Ratings (denormalized for fast reads) ──────────────────────────────
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ── Publishing metadata ────────────────────────────────────────────────
    publishedDate: { type: String, default: '' },
    isbn: { type: String, default: '' },
    language: { type: String, default: 'English' },

    // Optional: if this book has an attached PDF (uploaded/admin-managed).
    // Uploaded user PDFs are stored in UploadedBook; this is for global Book docs only.
    pdfUrl: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Performance indexes
bookSchema.index({ title: 'text', author: 'text', description: 'text' });
bookSchema.index({ genre: 1, isFeatured: -1 });
bookSchema.index({ salesCount: -1 });
bookSchema.index({ averageRating: -1 });
bookSchema.index({ price: 1 });
bookSchema.index({ isPremium: 1, isApproved: 1 });
bookSchema.index({ createdAt: -1 });

const Book = mongoose.model('Book', bookSchema);
module.exports = Book;
