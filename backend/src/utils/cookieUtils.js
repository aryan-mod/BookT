const COOKIE_NAME = process.env.REFRESH_TOKEN_COOKIE_NAME || 'refreshToken';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
const isProduction = process.env.NODE_ENV === 'production';

const getCookieOptions = (maxAge = COOKIE_MAX_AGE) => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'strict' : 'lax',
  maxAge,
  path: '/',
});

const setRefreshTokenCookie = (res, token, maxAge = COOKIE_MAX_AGE) => {
  res.cookie(COOKIE_NAME, token, getCookieOptions(maxAge));
};

const clearRefreshTokenCookie = (res) => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    path: '/',
  });
};

const getRefreshTokenFromCookie = (req) => req.cookies?.[COOKIE_NAME] || null;

module.exports = {
  COOKIE_NAME,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  getRefreshTokenFromCookie,
};
