const axios = require('axios');

const client = axios.create({
  baseURL: 'https://openlibrary.org',
  timeout: 5000,
});

const buildParams = ({ q, page, limit }) => {
  const offset = (page - 1) * limit;
  return {
    q,
    limit,
    offset,
  };
};

const wrapAxiosError = (err) => {
  const e = new Error('Open Library request failed');
  e.name = 'ExternalProviderError';
  e.provider = 'open-library';
  e.isTimeout = Boolean(err && err.code === 'ECONNABORTED');
  e.status = err && err.response ? err.response.status : null;
  e.cause = err;
  return e;
};

/**
 * Returns raw Open Library docs.
 * { docs: Array, numFound: number }
 */
const search = async ({ q, page, limit }) => {
  try {
    const res = await client.get('/search.json', { params: buildParams({ q, page, limit }) });
    return {
      docs: Array.isArray(res.data && res.data.docs) ? res.data.docs : [],
      numFound: Number(res.data && res.data.numFound) || 0,
    };
  } catch (err) {
    throw wrapAxiosError(err);
  }
};

module.exports = {
  search,
};

