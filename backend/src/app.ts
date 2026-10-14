import dotenv from 'dotenv';
dotenv.config();

import express, { Application, Request, Response } from 'express';
import './config/db.js';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

// Route imports
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.routes.js';
import articlesRoutes from './routes/articles.routes.js';
import topicsRoutes from './routes/topics.routes.js';
import questionsRoutes from './routes/questions.routes.js';
import pathsRoutes from './routes/paths.routes.js';
import resourcesRoutes from './routes/resources.routes.js';
import commentsRoutes from './routes/comments.routes.js';
import contactRoutes from './routes/contact.routes.js';
import submissionsRoutes from './routes/submissions.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import searchRoutes from './routes/search.routes.js';
// Import analytics routes for page-view tracking and visit reports
import analyticsRoutes from './routes/analytics.routes.js';

// Error handler imports
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const app: Application = express();

// Cross-Origin Resource Sharing configuration with origin whitelist
const allowedOrigins = [
  process.env.CLIENT_ORIGIN,
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173'
].filter((origin): origin is string => Boolean(origin));

// Security HTTP headers with strict Content Security Policy
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
      imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
      connectSrc: ["'self'", ...allowedOrigins]
    }
  },
  crossOriginEmbedderPolicy: false
}));

// CORS middleware enforcing authorized origin verification
app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests or verified whitelist origins
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Access Denied: CORS policy restricts access from this origin.'));
  },
  credentials: true
}));

// Global API rate limiter protecting all endpoints from automated flooding
const globalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests from this IP. Please try again later.' }
});
app.use('/api', globalApiLimiter);

// Structured HTTP request logger with sensitive parameter redaction
if (process.env.NODE_ENV !== 'test') {
  morgan.token('safe-url', (req: Request) => {
    const raw = req.originalUrl || req.url;
    return raw.replace(/([?&](token|password|secret|key)=)[^&]*/gi, '$1[REDACTED]');
  });
  app.use(morgan(':method :safe-url :status :res[content-length] - :response-time ms'));
}

// Request body parsers with capped size limits
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Health Check Endpoint (public)
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'hokhma-backend'
  });
});

import path from 'path';
import uploadRoutes from './routes/upload.routes.js';

// Static directory for serving uploaded files in local development
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

// Mount application API routes
app.use('/api/auth', authRoutes);
app.use('/api/articles', articlesRoutes);
app.use('/api/topics', topicsRoutes);
app.use('/api/questions', questionsRoutes);
app.use('/api/paths', pathsRoutes);
app.use('/api/resources', resourcesRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/submissions', submissionsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/upload', uploadRoutes);
// Mount analytics routes for traffic ingestion and reporting
app.use('/api/analytics', analyticsRoutes);

// Catch-all 404 handler for unknown routes
app.use(notFoundHandler);

// Centralized error handler
app.use(errorHandler);

export default app;
