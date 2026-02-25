const { User, RefreshToken } = require('../models');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { signAccessToken } = require('../utils/tokenUtils');
const {
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  getRefreshTokenFromCookie,
} = require('../utils/cookieUtils');
const { authLogger } = require('../utils/logger');
const { OAuth2Client } = require('google-auth-library');
const crypto = require('crypto');

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClient = googleClientId ? new OAuth2Client(googleClientId) : null;

/**
 * Sends access token in body and refresh token in HttpOnly cookie.
 * Access token is NOT stored in localStorage - frontend holds it in memory only.
 */
const createSendTokens = async (user, req, res, statusCode) => {
  const accessToken = signAccessToken(user._id, user.role);

  const { token: refreshToken, expiresAt } = await RefreshToken.createToken(
    user._id,
    {
      ip: req.ip,
      userAgent: req.get('user-agent'),
    }
  );

  setRefreshTokenCookie(res, refreshToken, expiresAt - Date.now());
  const userObj = user.toObject ? user.toObject() : user;
  delete userObj.password;

  authLogger.info('auth.login-or-register.success', {
    userId: user._id,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    statusCode,
  });

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
  await createSendTokens(user, req, res, 201);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select(
    '+password'
  );

  if (!user || !(await user.correctPassword(password, user.password))) {
    authLogger.warn('auth.login.failed', {
      email,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
    return next(new AppError('Invalid email or password.', 401));
  }

  if (user.isBanned) {
    authLogger.warn('auth.login.banned-user', {
      userId: user._id,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
    return res.status(403).json({
      status: 'fail',
      message: 'Your account has been banned. Please contact support.',
    });
  }

  await createSendTokens(user, req, res, 200);
});

/**
 * Issues new access token using refresh token from HttpOnly cookie.
 * - Validates JWT signature
 * - Rotates refresh token and revokes old one
 * - Detects reuse and revokes all active sessions on theft
 */
exports.refresh = catchAsync(async (req, res, next) => {
  const refreshToken = getRefreshTokenFromCookie(req);
  if (!refreshToken) {
    return next(
      new AppError('Refresh token not found. Please log in again.', 401)
    );
  }

  const result = await RefreshToken.rotateToken(refreshToken, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
    revokeOnReuse: true,
  });

  if (result.status === 'reused') {
    // Token reuse indicates possible theft. Revoke all sessions and clear cookie.
    clearRefreshTokenCookie(res);
    authLogger.warn('auth.refresh.reuse-detected', {
      userId: result.userId,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
    return next(
      new AppError(
        'Suspicious activity detected. All sessions have been revoked. Please log in again.',
        401
      )
    );
  }

  if (result.status !== 'rotated') {
    clearRefreshTokenCookie(res);
    authLogger.warn('auth.refresh.invalid', {
      status: result.status,
      reason: result.reason,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
    return next(
      new AppError('Invalid or expired refresh token. Please log in again.', 401)
    );
  }

  const user = await User.findById(result.userId);
  if (!user) {
    clearRefreshTokenCookie(res);
    return next(new AppError('User no longer exists.', 401));
  }
  if (user.isBanned) {
    clearRefreshTokenCookie(res);
    return res.status(403).json({
      status: 'fail',
      message: 'Your account has been banned. Please contact support.',
    });
  }

  setRefreshTokenCookie(res, result.token, result.expiresAt - Date.now());

  authLogger.info('auth.refresh.success', {
    userId: user._id,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

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
    // Best-effort: decode and revoke all sessions for this user.
    const userId = RefreshToken.getUserIdFromToken(refreshToken);
    if (userId) {
      await RefreshToken.revokeByUserId(userId, 'user-logout', {
        ip: req.ip,
      });
    }
  }

  clearRefreshTokenCookie(res);

  authLogger.info('auth.logout.success', {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully.',
  });
});

exports.googleLogin = catchAsync(async (req, res, next) => {
  if (!googleClient) {
    return next(
      new AppError(
        'Google login is not configured. Please contact support.',
        500
      )
    );
  }

  const { credential } = req.body || {};

  if (!credential) {
    return next(new AppError('Google credential is required.', 400));
  }

  let ticket;
  try {
    ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: googleClientId,
    });
  } catch (err) {
    authLogger.warn('auth.google.verify-failed', {
      error: err.message,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
    return next(new AppError('Invalid Google token.', 401));
  }

  const payload = ticket.getPayload();
  if (!payload || !payload.email) {
    return next(
      new AppError('Unable to retrieve email from Google account.', 400)
    );
  }

  const email = payload.email.toLowerCase();
  const name = payload.name || email.split('@')[0];
  const picture = payload.picture;

  let user = await User.findOne({ email });

  if (user && user.isBanned) {
    authLogger.warn('auth.google.banned-user', {
      userId: user._id,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
    return res.status(403).json({
      status: 'fail',
      message: 'Your account has been banned. Please contact support.',
    });
  }

  const isNewUser = !user;

  if (!user) {
    const randomPassword = crypto.randomBytes(32).toString('hex');

    user = await User.create({
      name,
      email,
      password: randomPassword,
      provider: 'google',
    });
  }

  await createSendTokens(user, req, res, isNewUser ? 201 : 200);
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
