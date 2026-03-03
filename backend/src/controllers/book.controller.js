const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/apiResponse');
const bookAggregatorService = require('../services/bookAggregator.service');
const PreviewClick = require('../models/PreviewClick');
const AppError = require('../utils/AppError');
const { logger } = require('../utils/logger');

const trackPreviewClick = catchAsync(async (req, res, next) => {
  const { externalId, source } = req.body;
  const userId = req.user?._id;

  if (!userId || typeof externalId !== 'string' || !externalId.trim()) {
    return next(new AppError('Invalid payload', 400));
  }

  const validSources = ['google', 'open-library'];
  if (!validSources.includes(source)) {
    return next(new AppError('Invalid source', 400));
  }

  await PreviewClick.create({
    user: userId,
    externalId: externalId.trim(),
    source,
  });

  return sendSuccess(res, { message: 'Preview tracked' });
});

const searchBooks = async (req, res, next) => {
  const started = process.hrtime.bigint();

  try {
    const { q, page, limit } = req.searchQuery || {};
    const data = await bookAggregatorService.searchBooks({ q, page, limit });

    const ms = Number(process.hrtime.bigint() - started) / 1e6;
    logger.debug('books.search.request.complete', {
      page,
      limit,
      qLen: typeof q === 'string' ? q.length : 0,
      count: Array.isArray(data) ? data.length : 0,
      ms: Math.round(ms),
    });

    return sendSuccess(res, {
      data,
      message: 'Books fetched successfully',
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  searchBooks,
  trackPreviewClick,
};

