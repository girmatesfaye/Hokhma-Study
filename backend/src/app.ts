import dotenv from 'dotenv';
dotenv.config();

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

const app: Application = express();

// Security middleware
app.use(helmet());

// Cross-Origin Resource Sharing
const allowedOrigins = [
  process.env.CLIENT_ORIGIN,
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173'
].filter((origin): origin is string => Boolean(origin));

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (such as mobile apps, curl, or server-to-server)
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    return callback(null, true); // Permissive in development
  },
  credentials: true
}));

// HTTP Request Logger
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

import authRoutes from './routes/auth.routes.js';

// Health Check Endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'hokhma-backend'
  });
});

// API Routes
app.use('/api/auth', authRoutes);

export default app;
