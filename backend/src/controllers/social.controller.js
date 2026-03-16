const { User, ReadingProgress } = require('../models');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/apiResponse');
const mongoose = require('mongoose');

/**
 * GET /social/profile/:userId
 * Returns public profile of a user.
 */
exports.getPublicProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.userId)
    .select('name avatar bio isPublic badges coins following followers createdAt')
    .lean();

  if (!user) return next(new AppError('User not found.', 404));
  if (!user.isPublic) return next(new AppError('This profile is private.', 403));

  // Stats
  const [completedBooks, currentlyReading] = await Promise.all([
    ReadingProgress.countDocuments({ user: user._id, status: 'completed' }),
    ReadingProgress.countDocuments({ user: user._id, status: 'reading' }),
  ]);

  const recentBooks = await ReadingProgress.find({
    user: user._id,
    status: 'completed',
  })
    .populate('book', 'title author cover')
    .sort({ updatedAt: -1 })
    .limit(6)
    .lean();

  const isFollowing = req.user
    ? user.followers?.some((id) => String(id) === String(req.user._id))
    : false;

  sendSuccess(res, {
    data: {
      profile: {
        _id: user._id,
        name: user.name,
        avatar: user.avatar,
        bio: user.bio,
        badges: user.badges || [],
        coins: user.coins || 0,
        followersCount: user.followers?.length || 0,
        followingCount: user.following?.length || 0,
        memberSince: user.createdAt,
      },
      stats: { completedBooks, currentlyReading },
      recentBooks: recentBooks.map((p) => p.book).filter(Boolean),
      isFollowing,
    },
  });
});

/**
 * POST /social/follow/:userId
 * Follow a user.
 */
exports.follow = catchAsync(async (req, res, next) => {
  const targetId = req.params.userId;
  const me = req.user._id;

  if (String(targetId) === String(me)) {
    return next(new AppError('You cannot follow yourself.', 400));
  }

  const target = await User.findById(targetId).select('_id isPublic followers');
  if (!target) return next(new AppError('User not found.', 404));

  const targetObjId = target._id;
  const meObjId = new mongoose.Types.ObjectId(String(me));

  // Add follower to target, add following to me
  await Promise.all([
    User.findByIdAndUpdate(targetId, {
      $addToSet: { followers: meObjId },
    }),
    User.findByIdAndUpdate(me, {
      $addToSet: { following: targetObjId },
    }),
  ]);

  sendSuccess(res, { data: { message: 'Now following.' } });
});

/**
 * DELETE /social/follow/:userId
 * Unfollow a user.
 */
exports.unfollow = catchAsync(async (req, res, next) => {
  const targetId = req.params.userId;
  const me = req.user._id;

  await Promise.all([
    User.findByIdAndUpdate(targetId, { $pull: { followers: me } }),
    User.findByIdAndUpdate(me, { $pull: { following: targetId } }),
  ]);

  sendSuccess(res, { data: { message: 'Unfollowed.' } });
});

/**
 * GET /social/me/following
 * List of users the current user follows.
 */
exports.getFollowing = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select('following')
    .populate('following', 'name avatar bio badges')
    .lean();

  sendSuccess(res, { data: { following: user?.following || [] } });
});
