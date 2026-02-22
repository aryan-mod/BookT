const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetBooks: {
      type: Number,
      required: [true, 'Target books is required'],
      min: 1,
    },
    completedBooks: {
      type: Number,
      default: 0,
      min: 0,
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
    },
  },
  {
    timestamps: true,
  }
);

goalSchema.index({ user: 1, year: 1 }, { unique: true });

const Goal = mongoose.model('Goal', goalSchema);
module.exports = Goal;
