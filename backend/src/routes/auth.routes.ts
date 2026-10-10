import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { login, getMe } from '../controllers/auth.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
// Import express-validator login payload validation rules
import { validateLogin } from '../middleware/validation.middleware.js';

const router = Router();

// Rate limiter for admin login endpoint to prevent brute-force attacks
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 attempts per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many login attempts from this IP. Please try again after 15 minutes.'
  }
});

// Admin sign-in with rate limiting and payload validation
router.post('/login', loginLimiter, validateLogin, login);

// Admin current identity verification
router.get('/me', verifyToken, getMe);

export default router;
