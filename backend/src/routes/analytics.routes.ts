import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  recordEvent,
  getReport,
  getSummary,
  getTimeseries,
  getPages,
  getReferrers
} from '../controllers/analytics.controller.js';
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

// Protected report route returning full aggregated metrics (admin only)
router.get('/report', verifyToken, getReport);

// Protected summary route (admin only)
router.get('/summary', verifyToken, getSummary);

// Protected timeseries chart route (admin only)
router.get('/timeseries', verifyToken, getTimeseries);

// Protected popular pages route (admin only)
router.get('/pages', verifyToken, getPages);

// Protected traffic referrers route (admin only)
router.get('/referrers', verifyToken, getReferrers);

export default router;
