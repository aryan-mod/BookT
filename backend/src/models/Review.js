const mongoose = require('mongoose');

/**
 * User review for a book. One review per user per book (upsert on re-submit).
 * After save/delete, Book.averageRating and reviewCount are recomputed via a static method.
 */
const reviewSchema = new mongoose.Schema(
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
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: { type: String, default: '', maxlength: 120, trim: true },
    body: { type: String, default: '', maxlength: 2000, trim: true },
  },
  {
    timestamps: true,
  }
);

// One review per user per book
reviewSchema.index({ user: 1, book: 1 }, { unique: true });
reviewSchema.index({ book: 1, createdAt: -1 });

/**
 * Recompute averageRating and reviewCount on the parent Book.
 */
reviewSchema.statics.recalcBook = async function (bookId) {
  const [agg] = await this.aggregate([
    { $match: { book: new mongoose.Types.ObjectId(String(bookId)) } },
    {
      $group: {
        _id: '$book',
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);
  const Book = mongoose.model('Book');
  await Book.findByIdAndUpdate(bookId, {
    averageRating: agg ? Math.round(agg.avgRating * 10) / 10 : 0,
    reviewCount: agg ? agg.count : 0,
  });
};

reviewSchema.post('save', async function () {
  await this.constructor.recalcBook(this.book);
});

reviewSchema.post('findOneAndDelete', async function (doc) {
  if (doc) await doc.constructor.recalcBook(doc.book);
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
