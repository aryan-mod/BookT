const mongoose = require('mongoose');

/**
 * Global book metadata only. User-specific progress lives in ReadingProgress.
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
  },
  {
    timestamps: true,
  }
);

const Book = mongoose.model('Book', bookSchema);
module.exports = Book;
