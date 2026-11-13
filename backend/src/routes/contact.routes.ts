import { Router } from 'express';
import {
  submitContactMessage,
  getAllContactMessages,
  deleteContactMessage
} from '../controllers/contact.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { validateContactMessage } from '../middleware/validation.middleware.js';
import { makeLimiter } from '../middleware/rateLimit.js';

const router = Router();

// Public contact form (5 per 15 minutes per IP) and admin-only inbox management.
router.post(
  '/',
  makeLimiter(15 * 60 * 1000, 5, 'Too many contact submissions. Please try again after 15 minutes.'),
  validateContactMessage,
  submitContactMessage
);
router.get('/', verifyToken, getAllContactMessages);
router.delete('/:id', verifyToken, deleteContactMessage);

export default router;
