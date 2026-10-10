import dotenv from 'dotenv';
dotenv.config();

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

// Route imports
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

// Error handler imports
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const app: Application = express();

// Security HTTP headers
app.use(helmet());

// Cross-Origin Resource Sharing configuration
const allowedOrigins = [
  process.env.CLIENT_ORIGIN,
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173'
].filter((origin): origin is string => Boolean(origin));

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server or development requests
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true
}));

// HTTP request logger
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Request body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check Endpoint (public)
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'hokhma-backend'
  });
});

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

// Catch-all 404 handler for unknown routes
app.use(notFoundHandler);

// Centralized error handler
app.use(errorHandler);

export default app;
