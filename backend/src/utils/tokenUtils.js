const jwt = require('jsonwebtoken');

const ACCESS_TOKEN_EXPIRE = process.env.JWT_ACCESS_EXPIRE || '15m';
const REFRESH_TOKEN_EXPIRE_DAYS = 7;

/**
 * Sign access token. Include role so token payload is consistent with DB.
 * @param {string|ObjectId} userId
 * @param {string} [role='user']
 */
const signAccessToken = (userId, role = 'user') =>
  jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRE }
  );

const verifyAccessToken = (token) =>
  jwt.verify(token, process.env.JWT_SECRET);

const getRefreshTokenExpiry = () =>
  new Date(Date.now() + REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60 * 1000);

module.exports = {
  signAccessToken,
  verifyAccessToken,
  getRefreshTokenExpiry,
  ACCESS_TOKEN_EXPIRE,
};
