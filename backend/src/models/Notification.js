const mongoose = require('mongoose');

/**
 * In-app notification for a user.
 */
const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'badge_earned',
        'goal_reached',
        'streak_milestone',
        'purchase_confirmed',
        'follower_new',
        'review_reply',
        'system',
      ],
      default: 'system',
    },
    title: { type: String, required: true, maxlength: 120 },
    message: { type: String, default: '', maxlength: 500 },
    isRead: { type: Boolean, default: false },
    link: { type: String, default: '' },
    icon: { type: String, default: '🔔' },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

// Auto-expire after 90 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
