const mongoose = require('mongoose');

const uploadedBookSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
    totalPages: {
      type: Number,
      default: 0,
    },
    fileSize: {
      type: Number,
    },
    mimeType: {
      type: String,
    },
    createdAt: {
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

uploadedBookSchema.index({ user: 1, createdAt: -1 });

const UploadedBook = mongoose.model('UploadedBook', uploadedBookSchema);
module.exports = UploadedBook;
