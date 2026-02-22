const mongoose = require('mongoose');

/**
 * User-submitted book request for the global catalogue.
 * Admin approves → creates Book; reject → status updated only.
 */
const bookRequestSchema = new mongoose.Schema(
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
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const BookRequest = mongoose.model('BookRequest', bookRequestSchema);
module.exports = BookRequest;
