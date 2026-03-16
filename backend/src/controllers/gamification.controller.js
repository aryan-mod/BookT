const { User, ReadingProgress, Notification } = require('../models');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/apiResponse');

const BADGES = {
  first_book: { id: 'first_book', name: 'First Chapter', icon: '📖', desc: 'Completed your first book' },
  five_books: { id: 'five_books', name: 'Bookworm', icon: '🐛', desc: 'Completed 5 books' },
  ten_books: { id: 'ten_books', name: 'Bibliophile', icon: '📚', desc: 'Completed 10 books' },
  streak_7: { id: 'streak_7', name: 'Week Warrior', icon: '🔥', desc: '7-day reading streak' },
  streak_30: { id: 'streak_30', name: 'Monthly Legend', icon: '⚡', desc: '30-day reading streak' },
  hundred_pages: { id: 'hundred_pages', name: 'Page Turner', icon: '📄', desc: 'Read 100 pages' },
  thousand_pages: { id: 'thousand_pages', name: 'Marathon Reader', icon: '🏃', desc: 'Read 1000 pages' },
  night_owl: { id: 'night_owl', name: 'Night Owl', icon: '🦉', desc: 'Read after midnight' },
  speed_reader: { id: 'speed_reader', name: 'Speed Reader', icon: '💨', desc: 'Finished a book in one day' },
};

/**
 * GET /gamification/badges
 * Return user's earned badges and list of all available badges.
 */
exports.getBadges = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id).select('badges coins').lean();
  const earnedSet = new Set(user?.badges || []);
  const allBadges = Object.values(BADGES).map((b) => ({
    ...b,
    earned: earnedSet.has(b.id),
  }));
  sendSuccess(res, {
    data: {
      earned: [...earnedSet],
      all: allBadges,
      coins: user?.coins || 0,
    },
  });
});

/**
 * GET /gamification/leaderboard
 * Top readers by completed books. Public.
 */
exports.getLeaderboard = catchAsync(async (req, res) => {
  const limit = Math.min(50, parseInt(req.query.limit) || 20);

  // Aggregate completed books per user
  const agg = await ReadingProgress.aggregate([
    { $match: { status: 'completed' } },
    { $group: { _id: '$user', completedBooks: { $sum: 1 } } },
    { $sort: { completedBooks: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user',
      },
    },
    { $unwind: '$user' },
    { $match: { 'user.isPublic': { $ne: false } } },
    {
      $project: {
        _id: 0,
        userId: '$_id',
        name: '$user.name',
        avatar: '$user.avatar',
        completedBooks: 1,
        badges: '$user.badges',
        coins: '$user.coins',
      },
    },
  ]);

  const ranked = agg.map((entry, idx) => ({ ...entry, rank: idx + 1 }));

  sendSuccess(res, { data: { leaderboard: ranked } });
});

/**
 * POST /gamification/check-badges  (protected, called internally or by frontend after milestones)
 * Check and award any newly-earned badges for the current user.
 */
exports.checkAndAwardBadges = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const user = await User.findById(userId).select('badges coins');
  const earnedSet = new Set(user.badges || []);
  const newBadges = [];

  // Count completed books
  const completedCount = await ReadingProgress.countDocuments({
    user: userId,
    status: 'completed',
  });

  const award = async (badgeId) => {
    if (!earnedSet.has(badgeId) && BADGES[badgeId]) {
      earnedSet.add(badgeId);
      newBadges.push(BADGES[badgeId]);
      await Notification.create({
        user: userId,
        type: 'badge_earned',
        title: `🏅 Badge Earned: ${BADGES[badgeId].name}`,
        message: BADGES[badgeId].desc,
        icon: BADGES[badgeId].icon,
      }).catch(() => {});
    }
  };

  if (completedCount >= 1) await award('first_book');
  if (completedCount >= 5) await award('five_books');
  if (completedCount >= 10) await award('ten_books');

  if (newBadges.length > 0) {
    user.badges = [...earnedSet];
    user.coins = (user.coins || 0) + newBadges.length * 25;
    await user.save({ validateBeforeSave: false });
  }

  sendSuccess(res, {
    data: {
      newBadges,
      allBadges: [...earnedSet],
      coins: user.coins,
    },
  });
});
