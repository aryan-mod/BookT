const mongoose = require('mongoose');

/**
 * Purchase order – one per checkout. Books are added to user.purchasedBooks on success.
 */
const orderItemSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true,
  },
  price: { type: Number, required: true, min: 0 },
  title: { type: String, default: '' },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
    },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['pending', 'completed', 'refunded'],
      default: 'completed',
    },
    // Simulated payment reference (no real gateway needed)
    paymentRef: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

orderSchema.index({ user: 1, createdAt: -1 });

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
