const { Notification } = require('../models');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/apiResponse');

/**
 * GET /notifications
 * Paginated notifications for the current user.
 */
exports.getNotifications = catchAsync(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, parseInt(req.query.limit) || 20);

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Notification.countDocuments({ user: req.user._id }),
    Notification.countDocuments({ user: req.user._id, isRead: false }),
  ]);

  sendSuccess(res, {
    data: {
      notifications,
      unreadCount,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    },
  });
});

/**
 * PATCH /notifications/:id/read
 * Mark a single notification as read.
 */
exports.markRead = catchAsync(async (req, res) => {
  await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { isRead: true }
  );
  sendSuccess(res, { data: { message: 'Marked as read.' } });
});

/**
 * PATCH /notifications/read-all
 * Mark all notifications as read.
 */
exports.markAllRead = catchAsync(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
  sendSuccess(res, { data: { message: 'All marked as read.' } });
});

/**
 * DELETE /notifications/:id
 * Delete a notification.
 */
exports.deleteNotification = catchAsync(async (req, res) => {
  await Notification.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  sendSuccess(res, { data: { message: 'Notification deleted.' } });
});
