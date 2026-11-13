import { Router } from 'express';
import { recordEvent, getReport } from '../controllers/analytics.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { makeLimiter } from '../middleware/rateLimit.js';

const router = Router();

// Public page-view ingestion (120 per minute per IP) and the admin-only aggregated report.
router.post('/events', makeLimiter(60 * 1000, 120, 'Too many analytics events. Please slow down.'), recordEvent);
router.get('/report', verifyToken, getReport);

export default router;
