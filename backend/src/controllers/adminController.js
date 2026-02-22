const { User, Book, BookRequest, AdminAction, RefreshToken } = require('../models');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

/**
 * GET /admin/users (protected, admin)
 * Returns all users, excluding password, sorted by createdAt descending.
 */
exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find()
    .select('-password')
    .sort('-createdAt')
    .lean();

  const normalized = users.map((u) => ({
    id: u._id,
    name: u.name,
    email: u.email,
    role: u.role,
    isBanned: u.isBanned ?? false,
    createdAt: u.createdAt,
  }));

  res.status(200).json({
    status: 'success',
    results: normalized.length,
    data: { users: normalized },
  });
});

/**
 * PATCH /admin/users/:id/toggle-ban (protected, admin)
 * Toggle isBanned true/false. Prevents admin from banning themselves.
 */
exports.toggleBanUser = catchAsync(async (req, res, next) => {
  const targetId = req.params.id;
  const currentUserId = req.user._id.toString();

  if (targetId === currentUserId) {
    return next(new AppError('You cannot ban yourself.', 400));
  }

  const user = await User.findById(targetId);
  if (!user) {
    return next(new AppError('User not found.', 404));
  }

  if (user.role === 'admin') {
    return res.status(400).json({
      status: 'fail',
      message: 'Cannot ban another admin',
    });
  }

  const previousStatus = user.isBanned;
  user.isBanned = !user.isBanned;
  await user.save({ validateBeforeSave: false });

  if (user.isBanned) {
    await RefreshToken.deleteMany({ userId: user._id });
  }

  await AdminAction.create({
    admin: req.user._id,
    action: user.isBanned ? 'BAN_USER' : 'UNBAN_USER',
    targetUser: user._id,
    metadata: { previousStatus },
  });

  const normalized = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isBanned: user.isBanned,
    createdAt: user.createdAt,
  };

  res.status(200).json({
    status: 'success',
    data: { user: normalized },
  });
});

/**
 * GET /admin/audit-logs (protected, admin)
 * Returns last 50 audit logs with populated admin and targetUser names.
 */
exports.getAuditLogs = catchAsync(async (req, res) => {
  const logs = await AdminAction.find()
    .sort('-createdAt')
    .limit(50)
    .populate('admin', 'name email')
    .populate('targetUser', 'name email')
    .lean();

  const normalized = logs.map((log) => ({
    id: log._id,
    admin: log.admin,
    action: log.action,
    targetUser: log.targetUser,
    targetRequest: log.targetRequest,
    targetBook: log.targetBook,
    metadata: log.metadata,
    createdAt: log.createdAt,
  }));

  res.status(200).json({
    status: 'success',
    results: normalized.length,
    data: { logs: normalized },
  });
});

/**
 * GET /admin/stats (protected, admin)
 * Returns counts for dashboard: totalUsers, totalBooks, pendingRequests, approvedToday.
 */
exports.getStats = catchAsync(async (req, res) => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [totalUsers, totalBooks, pendingRequests, approvedToday] = await Promise.all([
    User.countDocuments(),
    Book.countDocuments(),
    BookRequest.countDocuments({ status: 'pending', isDeleted: { $ne: true } }),
    BookRequest.countDocuments({
      status: 'approved',
      isDeleted: { $ne: true },
      reviewedAt: { $gte: startOfToday },
    }),
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      totalUsers,
      totalBooks,
      pendingRequests,
      approvedToday,
    },
  });
});
