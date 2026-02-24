const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const REFRESH_TOKEN_DAYS =
  parseInt(process.env.REFRESH_TOKEN_EXPIRE_DAYS, 10) || 7;

const getRefreshSecret = () =>
  process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET;

const refreshTokenSchema = new mongoose.Schema(
  {
    // Token identifier (jti). The actual refresh token stored in the cookie is a JWT
    // that embeds this jti plus the userId.
    token: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ip: String,
    userAgent: String,
    isRevoked: {
      type: Boolean,
      default: false,
    },
    revokedAt: Date,
    revokedByIp: String,
    revokedReason: String,
    replacedByToken: String,
    reusedAt: Date,
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

// Automatic cleanup of expired refresh tokens
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

/**
 * Create a new refresh token for a user.
 * - Persists token "family" in Mongo for rotation and revocation.
 * - Returns a signed JWT that is stored in the HttpOnly cookie.
 */
refreshTokenSchema.statics.createToken = async function (
  userId,
  { ip, userAgent } = {}
) {
  const tokenId = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(
    Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000
  );

  await this.create({
    token: tokenId,
    userId,
    ip,
    userAgent,
    expiresAt,
    isRevoked: false,
  });

  const refreshToken = jwt.sign(
    { sub: userId.toString(), jti: tokenId },
    getRefreshSecret(),
    { expiresIn: `${REFRESH_TOKEN_DAYS}d` }
  );

  return { token: refreshToken, tokenId, expiresAt };
};

/**
 * Rotate a refresh token:
 * - Verifies JWT signature and expiry
 * - Detects reuse (token missing or already revoked)
 * - Marks old token as revoked and issues a new one
 * - Optionally revokes all user sessions on reuse
 */
refreshTokenSchema.statics.rotateToken = async function (
  refreshToken,
  { ip, userAgent, revokeOnReuse = true } = {}
) {
  let payload;
  try {
    payload = jwt.verify(refreshToken, getRefreshSecret());
  } catch (err) {
    return { status: 'invalid', userId: null, reason: err.name || 'verify-failed' };
  }

  const userId = payload.sub || payload.id;
  const tokenId = payload.jti;

  if (!userId || !tokenId) {
    return { status: 'invalid', userId: null, reason: 'missing-claims' };
  }

  const existing = await this.findOne({ token: tokenId, userId });

  // If the DB record is gone or already revoked, this is most likely a reused token.
  if (!existing || existing.isRevoked) {
    if (revokeOnReuse) {
      await this.revokeByUserId(userId, 'reuse-detected', { ip });
    }
    return {
      status: 'reused',
      userId,
      reason: 'refresh-token-reuse-detected',
    };
  }

  if (existing.expiresAt <= new Date()) {
    existing.isRevoked = true;
    existing.revokedAt = new Date();
    existing.revokedByIp = ip;
    existing.revokedReason = 'expired';
    await existing.save();

    return {
      status: 'expired',
      userId,
      reason: 'refresh-token-expired',
    };
  }

  // Create new token and mark the old one as revoked/replaced.
  const { token: newRefreshToken, tokenId: newTokenId, expiresAt } =
    await this.createToken(userId, { ip, userAgent });

  existing.isRevoked = true;
  existing.revokedAt = new Date();
  existing.revokedByIp = ip;
  existing.revokedReason = 'rotated';
  existing.replacedByToken = newTokenId;
  await existing.save();

  return {
    status: 'rotated',
    userId,
    token: newRefreshToken,
    expiresAt,
  };
};

/**
 * Revoke all refresh tokens for a user (e.g., on logout or theft detection).
 */
refreshTokenSchema.statics.revokeByUserId = async function (
  userId,
  reason = 'user-logout',
  { ip } = {}
) {
  await this.updateMany(
    { userId, isRevoked: false },
    {
      $set: {
        isRevoked: true,
        revokedAt: new Date(),
        revokedByIp: ip,
        revokedReason: reason,
      },
    }
  );
};

/**
 * Safely decode a refresh token JWT and return the associated userId (or null).
 * Does NOT rotate or revoke tokens; intended for logout flows.
 */
refreshTokenSchema.statics.getUserIdFromToken = function (refreshToken) {
  try {
    const payload = jwt.verify(refreshToken, getRefreshSecret());
    return payload.sub || payload.id || null;
  } catch {
    return null;
  }
};

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);
module.exports = RefreshToken;
