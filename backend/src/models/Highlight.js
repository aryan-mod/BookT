const mongoose = require('mongoose');

const highlightSchema = new mongoose.Schema(
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
    text: {
      type: String,
      required: [true, 'Highlighted text is required'],
    },
    color: {
      type: String,
      default: '#ffff00',
    },
    page: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

const Highlight = mongoose.model('Highlight', highlightSchema);
module.exports = Highlight;
