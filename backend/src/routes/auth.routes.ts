import { Router } from 'express';
import { login, getMe } from '../controllers/auth.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { validateLogin } from '../middleware/validation.middleware.js';
import { makeLimiter } from '../middleware/rateLimit.js';

const router = Router();

// Admin sign-in (10 attempts per 15 minutes per IP) and current-identity check.
router.post(
  '/login',
  makeLimiter(15 * 60 * 1000, 10, 'Too many login attempts from this IP. Please try again after 15 minutes.'),
  validateLogin,
  login
);
router.get('/me', verifyToken, getMe);

export default router;
