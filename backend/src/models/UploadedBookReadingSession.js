const mongoose = require('mongoose');

const uploadedBookReadingSessionSchema = new mongoose.Schema(
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
    durationInSeconds: {
      type: Number,
      required: true,
      min: 0,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

uploadedBookReadingSessionSchema.index({ user: 1, book: 1, date: -1 });

const UploadedBookReadingSession = mongoose.model(
  'UploadedBookReadingSession',
  uploadedBookReadingSessionSchema
);
module.exports = UploadedBookReadingSession;
