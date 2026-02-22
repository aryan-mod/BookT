const { User, RefreshToken } = require('../models');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { signAccessToken } = require('../utils/tokenUtils');
const {
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  getRefreshTokenFromCookie,
} = require('../utils/cookieUtils');

/**
 * Sends access token in body and refresh token in HttpOnly cookie.
 * Access token is NOT stored in localStorage - frontend holds it in memory only.
 */
const createSendTokens = async (user, statusCode, res) => {
  const accessToken = signAccessToken(user._id, user.role);
  const { token, expiresAt } = await RefreshToken.createToken(user._id);

  setRefreshTokenCookie(res, token, expiresAt - Date.now());
  const userObj = user.toObject ? user.toObject() : user;
  delete userObj.password;

  res.status(statusCode).json({
    status: 'success',
    message: statusCode === 201 ? 'Registration successful.' : 'Login successful.',
    data: {
      user: userObj,
      accessToken,
      expiresIn: process.env.JWT_ACCESS_EXPIRE || '15m',
    },
  });
};

exports.register = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return next(new AppError('User with this email already exists.', 400));
  }

  const user = await User.create({ name, email, password });
  await createSendTokens(user, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select(
    '+password'
  );

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Invalid email or password.', 401));
  }

  if (user.isBanned) {
    return res.status(403).json({
      status: 'fail',
      message: 'Your account has been banned. Please contact support.',
    });
  }

  await createSendTokens(user, 200, res);
});

/**
 * Issues new access token using refresh token from HttpOnly cookie.
 * Supports future token rotation: old refresh token is invalidated, new one issued.
 */
exports.refresh = catchAsync(async (req, res, next) => {
  const refreshToken = getRefreshTokenFromCookie(req);
  if (!refreshToken) {
    return next(
      new AppError('Refresh token not found. Please log in again.', 401)
    );
  }

  const userId = await RefreshToken.verifyAndDelete(refreshToken);
  if (!userId) {
    return next(
      new AppError('Invalid or expired refresh token. Please log in again.', 401)
    );
  }

  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError('User no longer exists.', 401));
  }
  if (user.isBanned) {
    return res.status(403).json({
      status: 'fail',
      message: 'Your account has been banned. Please contact support.',
    });
  }

  const { token, expiresAt } = await RefreshToken.createToken(userId);
  setRefreshTokenCookie(res, token, expiresAt - Date.now());

  res.status(200).json({
    status: 'success',
    message: 'Token refreshed.',
    data: {
      accessToken: signAccessToken(user._id, user.role),
      expiresIn: process.env.JWT_ACCESS_EXPIRE || '15m',
    },
  });
});

exports.logout = catchAsync(async (req, res, next) => {
  const refreshToken = getRefreshTokenFromCookie(req);
  if (refreshToken) {
    await RefreshToken.deleteOne({ token: refreshToken });
  }

  clearRefreshTokenCookie(res);
  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully.',
  });
});

/**
 * GET /auth/me — Return current user. Must include _id, name, email, role.
 * Do not use .select() in a way that excludes role.
 */
exports.getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return next(new AppError('User no longer exists.', 401));
  }
  const userObj = user.toObject ? user.toObject() : { ...user };
  delete userObj.password;
  res.status(200).json({
    status: 'success',
    data: { user: userObj },
  });
});
