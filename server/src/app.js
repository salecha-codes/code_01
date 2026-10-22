import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import { authRoutes } from './routes/authRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import { feedbackRoutes } from './routes/feedbackRoutes.js';
import { adminRoutes } from './routes/adminRoutes.js';
import { errorMiddleware } from './middleware/errorMiddleware.js';
import { HttpError } from './utils/validation.js';
export function createApp(config) {
  const app = express();
  app.disable('x-powered-by');
  // Render is one proxy hop away. Do not blindly trust arbitrary forwarded IPs.
  if (config.production) app.set('trust proxy', 1);
  app.use(helmet());
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || config.origins.includes(origin)) callback(null, true);
        else callback(new HttpError(403, 'This origin is not allowed.'));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'X-CSRF-Token', 'X-ClubPulse-Request'],
    }),
  );
  app.use('/api', (req, res, next) => {
    res.set('Cache-Control', 'no-store');
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      if (!config.origins.includes(req.get('Origin')))
        return next(new HttpError(403, 'A trusted Origin header is required.'));
      if (!req.is('application/json') || req.get('X-ClubPulse-Request') !== '1')
        return next(new HttpError(415, 'Use the ClubPulse JSON API client.'));
    }
    next();
  });
  app.use(express.json({ limit: '16kb' }));
  app.use(cookieParser());
  const makeLimiter = (limit, message, windowMs = 15 * 60 * 1000) =>
    rateLimit({
      windowMs,
      limit,
      standardHeaders: 'draft-8',
      legacyHeaders: false,
      message: { error: { message } },
    });
  app.use('/api', makeLimiter(300, 'Too many requests. Please try again shortly.'));
  app.get('/api/health', (req, res) => {
    const connected = mongoose.connection.readyState === 1;
    res.status(connected ? 200 : 503).json({
      status: connected ? 'ok' : 'unavailable',
      database: connected ? 'connected' : 'disconnected',
    });
  });
  app.use('/api/events', eventRoutes);
  app.use(
    '/api/feedback',
    feedbackRoutes(
      makeLimiter(
        10,
        'You have sent several responses. Please wait 15 minutes before trying again.',
      ),
    ),
  );
  app.use(
    '/api/auth',
    authRoutes(config, makeLimiter(10, 'Too many login attempts. Please wait 15 minutes.')),
  );
  app.use('/api/admin', adminRoutes(config));
  app.use((req, res, next) => next(new HttpError(404, 'Endpoint not found.')));
  app.use(errorMiddleware);
  return app;
}
