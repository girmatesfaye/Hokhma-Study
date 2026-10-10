import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { recordEvent, getReport } from '../controllers/analytics.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

// Ingestion rate limiter: 120 events per minute per IP address
const ingestionLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many analytics events. Please slow down.' }
});

// Public ingestion route for anonymous page-view events
router.post('/events', ingestionLimiter, recordEvent);

// Protected report route accessible only to authenticated admins
router.get('/report', verifyToken, getReport);

export default router;
