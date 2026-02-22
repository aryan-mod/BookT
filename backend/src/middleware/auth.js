const { User } = require('../models');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { verifyAccessToken } = require('../utils/tokenUtils');

/**
 * Protects routes by verifying JWT access token from Authorization header.
 * Access token is sent by frontend (held in memory, not localStorage).
 */
exports.protect = catchAsync(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in. Please log in to access.', 401)
    );
  }

  const decoded = verifyAccessToken(token);
  const user = await User.findById(decoded.id);

  if (!user) {
    return next(new AppError('User no longer exists.', 401));
  }

  if (user.isBanned) {
    return res.status(403).json({
      status: 'fail',
      message: 'Account has been banned by admin',
    });
  }

  req.user = user;
  next();
});

/**
 * Optionally attach user from JWT. Does not fail if no token or invalid token.
 * Use for routes that return different data when authenticated (e.g. books with progress).
 */
exports.optionalProtect = catchAsync(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id);
    if (user) req.user = user;
  } catch {
    // Ignore invalid/expired token
  }
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action.', 403)
      );
    }
    next();
  };
};
