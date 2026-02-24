const COOKIE_NAME = process.env.REFRESH_TOKEN_COOKIE_NAME || 'refreshToken';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
const isProduction = process.env.NODE_ENV === 'production';

/**
 * Centralised cookie options for refresh token.
 *
 * In production with cross-domain frontend (Vercel) and backend (Render),
 * the refresh cookie MUST be:
 * - httpOnly: true          (cannot be read by JS)
 * - secure: true            (only over HTTPS)
 * - sameSite: 'none'        (so it is sent on cross-site XHR/fetch)
 * - domain: configurable    (usually backend host; can be overridden)
 */
const getCookieOptions = (maxAge = COOKIE_MAX_AGE) => {
  const base = {
    httpOnly: true,
    secure: isProduction,
    // For cross-site cookies (Vercel -> Render), SameSite must be 'none'
    sameSite: isProduction ? 'none' : 'lax',
    maxAge,
    path: '/',
  };

  if (isProduction && process.env.COOKIE_DOMAIN) {
    base.domain = process.env.COOKIE_DOMAIN;
  }

  return base;
};

const setRefreshTokenCookie = (res, token, maxAge = COOKIE_MAX_AGE) => {
  res.cookie(COOKIE_NAME, token, getCookieOptions(maxAge));
};

const clearRefreshTokenCookie = (res) => {
  // Force immediate expiry when clearing the cookie.
  const options = getCookieOptions(0);
  res.clearCookie(COOKIE_NAME, options);
};

const getRefreshTokenFromCookie = (req) => req.cookies?.[COOKIE_NAME] || null;

module.exports = {
  COOKIE_NAME,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  getRefreshTokenFromCookie,
};
