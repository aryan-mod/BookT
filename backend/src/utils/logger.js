const isProduction = process.env.NODE_ENV === 'production';

/**
 * Minimal structured logger for authentication-related events.
 * Uses console under the hood but always logs JSON with a stable shape.
 */
const log = (level, event, meta = {}) => {
  const payload = {
    ts: new Date().toISOString(),
    level,
    event,
    env: process.env.NODE_ENV || 'development',
    ...meta,
  };

  // Avoid leaking secrets: never log tokens or passwords.
  // Callers should only pass ids and non-sensitive metadata.
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(payload));
};

const authLogger = {
  info: (event, meta) => log('info', event, meta),
  warn: (event, meta) => log(isProduction ? 'warn' : 'debug', event, meta),
  error: (event, meta) => log('error', event, meta),
};

module.exports = {
  authLogger,
};

