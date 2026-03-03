const mongoose = require('mongoose');

const previewClickSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    externalId: {
      type: String,
      required: true,
      trim: true,
    },
    source: {
      type: String,
      required: true,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

previewClickSchema.index({ externalId: 1, source: 1 });

const PreviewClick = mongoose.model('PreviewClick', previewClickSchema);
module.exports = PreviewClick;
