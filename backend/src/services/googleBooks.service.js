const axios = require('axios');

const client = axios.create({
  baseURL: 'https://www.googleapis.com/books/v1',
  timeout: 5000,
});

const CIRCUIT_FAILURE_THRESHOLD = 5;
const CIRCUIT_OPEN_MS = 2 * 60 * 1000;

const circuit = {
  consecutiveFailures: 0,
  openUntil: 0,
};

const isCircuitOpen = () => Date.now() < circuit.openUntil;

const recordSuccess = () => {
  circuit.consecutiveFailures = 0;
  circuit.openUntil = 0;
};

const recordFailure = () => {
  circuit.consecutiveFailures += 1;
  if (circuit.consecutiveFailures >= CIRCUIT_FAILURE_THRESHOLD) {
    circuit.openUntil = Date.now() + CIRCUIT_OPEN_MS;
  }
};

const buildParams = ({ q, page, limit }) => {
  const startIndex = (page - 1) * limit;
  const params = {
    q,
    startIndex,
    maxResults: limit,
  };

  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
  if (apiKey) params.key = apiKey;

  return params;
};

const wrapAxiosError = (err) => {
  const e = new Error('Google Books request failed');
  e.name = 'ExternalProviderError';
  e.provider = 'google';
  e.isTimeout = Boolean(err && err.code === 'ECONNABORTED');
  e.status = err && err.response ? err.response.status : null;
  e.cause = err;
  return e;
};

/**
 * Returns raw Google Books items.
 * { items: Array, totalItems: number }
 */
const search = async ({ q, page, limit }) => {
  if (isCircuitOpen()) {
    const e = new Error('Google Books circuit open');
    e.name = 'CircuitOpenError';
    e.provider = 'google';
    throw e;
  }

  try {
    const res = await client.get('/volumes', { params: buildParams({ q, page, limit }) });
    recordSuccess();
    return {
      items: Array.isArray(res.data && res.data.items) ? res.data.items : [],
      totalItems: Number(res.data && res.data.totalItems) || 0,
    };
  } catch (err) {
    recordFailure();
    throw wrapAxiosError(err);
  }
};

module.exports = {
  search,
  _circuit: circuit,
};

