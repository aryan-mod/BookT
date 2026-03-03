const AppError = require('../utils/AppError');

const parsePositiveInt = (value) => {
  if (value == null || value === '') return null;
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) return null;
  return n;
};

const validateSearchQuery = (req, res, next) => {
  const q = req.query.q;

  if (q == null || q === '') {
    return next(new AppError('Query parameter "q" is required', 400));
  }
  if (typeof q !== 'string') {
    return next(new AppError('Query parameter "q" must be a string', 400));
  }
  const trimmedQ = q.trim();
  if (trimmedQ.length === 0) {
    return next(new AppError('Query parameter "q" is required', 400));
  }

  const pageRaw = req.query.page;
  const limitRaw = req.query.limit;

  const page = pageRaw == null ? 1 : parsePositiveInt(pageRaw);
  if (page == null) {
    return next(new AppError('Query parameter "page" must be a positive integer', 400));
  }

  const limit = limitRaw == null ? 10 : parsePositiveInt(limitRaw);
  if (limit == null) {
    return next(new AppError('Query parameter "limit" must be a positive integer', 400));
  }
  if (limit > 20) {
    return next(new AppError('Query parameter "limit" must be at most 20', 400));
  }

  req.searchQuery = {
    q: trimmedQ,
    page,
    limit,
  };

  return next();
};

module.exports = validateSearchQuery;

