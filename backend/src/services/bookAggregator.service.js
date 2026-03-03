const AppError = require('../utils/AppError');
const cache = require('./cache.service');
const googleBooks = require('./googleBooks.service');
const openLibrary = require('./openLibrary.service');
const { logger } = require('../utils/logger');

const CACHE_TTL_MS = 5 * 60 * 1000;

const safeString = (v) => (typeof v === 'string' ? v : v == null ? '' : String(v));
const safeArrayOfStrings = (arr) =>
  Array.isArray(arr) ? arr.map(safeString).filter((s) => s.trim().length > 0) : [];

const normalizeGoogleItem = (item) => {
  const info = (item && item.volumeInfo) || {};
  const imageLinks = info.imageLinks || {};
  const previewLinkRaw = info.previewLink;

  return {
    id: safeString(item && item.id),
    title: safeString(info.title) || 'Untitled',
    authors: safeArrayOfStrings(info.authors),
    description: safeString(info.description),
    thumbnail: safeString(imageLinks.thumbnail || imageLinks.smallThumbnail),
    pageCount: Number(info.pageCount) || 0,
    publishedDate: safeString(info.publishedDate),
    source: 'google',
    previewLink: typeof previewLinkRaw === 'string' && previewLinkRaw.trim() ? previewLinkRaw : null,
  };
};

const normalizeOpenLibraryDoc = (doc) => {
  const coverId = doc && doc.cover_i;
  const coverUrl = coverId
    ? `https://covers.openlibrary.org/b/id/${encodeURIComponent(coverId)}-M.jpg`
    : '';

  const publishedDate = doc && doc.first_publish_year
    ? safeString(doc.first_publish_year)
    : Array.isArray(doc && doc.publish_date) && doc.publish_date.length > 0
      ? safeString(doc.publish_date[0])
      : '';

  const workKey = doc && doc.key;
  const previewLink =
    workKey && typeof workKey === 'string' && workKey.trim().startsWith('/')
      ? `https://openlibrary.org${workKey}`
      : null;

  return {
    id: safeString((doc && (doc.key || doc.cover_edition_key)) || (doc && doc.edition_key && doc.edition_key[0])),
    title: safeString(doc && doc.title) || 'Untitled',
    authors: safeArrayOfStrings(doc && doc.author_name),
    description: '',
    thumbnail: coverUrl,
    pageCount: Number(doc && doc.number_of_pages_median) || 0,
    publishedDate,
    source: 'open-library',
    previewLink,
  };
};

const buildCacheKey = ({ q, page, limit }) => {
  const normalizedQ = safeString(q).trim().toLowerCase();
  return `books:search:${normalizedQ}:${page}:${limit}`;
};

const searchBooks = async ({ q, page, limit }) => {
  const cacheKey = buildCacheKey({ q, page, limit });

  return cache.wrap(
    cacheKey,
    async () => {
      const qLen = safeString(q).length;
      const startedAt = Date.now();

      let googleResult = null;
      try {
        googleResult = await googleBooks.search({ q, page, limit });
        if (googleResult.items && googleResult.items.length > 0) {
          const normalized = googleResult.items.map(normalizeGoogleItem);
          logger.info('books.search.google.success', {
            page,
            limit,
            qLen,
            count: normalized.length,
            ms: Date.now() - startedAt,
          });
          return normalized;
        }
      } catch (err) {
        logger.warn('books.search.google.failed', {
          page,
          limit,
          qLen,
          provider: 'google',
          name: err && err.name,
          status: err && err.status,
          circuitOpen: err && err.name === 'CircuitOpenError',
        });
      }

      if (googleResult && Array.isArray(googleResult.items) && googleResult.items.length === 0) {
        logger.info('books.search.google.empty', { page, limit, qLen });
      }

      try {
        const open = await openLibrary.search({ q, page, limit });
        const normalized = (open.docs || []).map(normalizeOpenLibraryDoc);
        logger.info('books.search.open_library.success', {
          page,
          limit,
          qLen,
          count: normalized.length,
          ms: Date.now() - startedAt,
        });
        return normalized;
      } catch (err) {
        logger.warn('books.search.open_library.failed', {
          page,
          limit,
          qLen,
          provider: 'open-library',
          name: err && err.name,
          status: err && err.status,
        });

        // If Google completed successfully (even if empty), return empty result set.
        if (googleResult && Array.isArray(googleResult.items)) {
          return [];
        }

        throw new AppError('Book search service temporarily unavailable', 503);
      }
    },
    CACHE_TTL_MS
  );
};

module.exports = {
  searchBooks,
};

