const isProduction = process.env.NODE_ENV === 'production';

const LEVELS = Object.freeze({
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
});

const DEFAULT_LEVEL = isProduction ? 'info' : 'debug';
const ACTIVE_LEVEL =
  process.env.LOG_LEVEL && LEVELS[process.env.LOG_LEVEL]
    ? process.env.LOG_LEVEL
    : DEFAULT_LEVEL;

const write = (stream, payload) => {
  try {
    stream.write(`${JSON.stringify(payload)}\n`);
  } catch (_) {
    // If serialization fails, swallow to avoid crashing request handling.
  }
};

const baseLog = (level, event, meta = {}) => {
  if (LEVELS[level] < LEVELS[ACTIVE_LEVEL]) return;

  const payload = {
    ts: new Date().toISOString(),
    level,
    event,
    env: process.env.NODE_ENV || 'development',
    ...meta,
  };

  const stream = level === 'error' ? process.stderr : process.stdout;
  write(stream, payload);
};

const logger = {
  debug: (event, meta) => baseLog('debug', event, meta),
  info: (event, meta) => baseLog('info', event, meta),
  warn: (event, meta) => baseLog('warn', event, meta),
  error: (event, meta) => baseLog('error', event, meta),
};

// Backwards compatible export for existing auth flows.
// Important: in development, `warn` must log as `debug` level,
// while in production it should log as `warn`.
const authLogger = {
  info: (event, meta) => logger.info(event, meta),
  warn: (event, meta) =>
    isProduction ? logger.warn(event, meta) : logger.debug(event, meta),
  error: (event, meta) => logger.error(event, meta),
};

module.exports = {
  logger,
  authLogger,
};

