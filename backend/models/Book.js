const mongoose = require('mongoose');

const highlightSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  page: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const bookSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    title: {
      type: String,
      required: [true, 'Please provide a book title'],
      trim: true,
    },
    author: {
      type: String,
      required: [true, 'Please provide an author name'],
      trim: true,
    },
    cover: {
      type: String,
      default: '',
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    pages: {
      type: Number,
      default: 0,
    },
    genre: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['wishlist', 'reading', 'completed'],
      default: 'wishlist',
    },
    startDate: {
      type: String,
      default: '',
    },
    endDate: {
      type: String,
      default: '',
    },
    currentPage: {
      type: Number,
      default: 0,
    },
    highlights: {
      type: [highlightSchema],
      default: [],
    },
    review: {
      type: String,
      default: '',
    },
    reactions: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Book', bookSchema);
