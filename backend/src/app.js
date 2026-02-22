const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const {
  sanitizeData,
  sanitizeXss,
} = require('./middleware/security');

const app = express();

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// Credential-based auth: exact origins only (no wildcard when credentials: true)
const frontendUrl = process.env.FRONTEND_URL || process.env.CORS_ORIGIN?.split(',')[0]?.trim();
const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean)
  : [];
const defaultDevOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'http://localhost:3000',
];
const envOrigins = frontendUrl
  ? [frontendUrl, ...corsOrigins]
  : corsOrigins;
const allowedOrigins = [...new Set([...envOrigins, ...defaultDevOrigins])];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 204,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '10kb' }));

app.use(sanitizeData());
app.use(sanitizeXss());

app.use('/api/v1', routes);

app.all('*', (req, res, next) => {
  const err = new (require('./utils/AppError'))(
    `Cannot find ${req.originalUrl} on this server`,
    404
  );
  next(err);
});

app.use(errorHandler);

module.exports = app;
