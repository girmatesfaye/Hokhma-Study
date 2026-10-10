import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  submitContactMessage,
  getAllContactMessages,
  toggleReadStatus,
  deleteContactMessage
} from '../controllers/contact.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

// Rate limiter for contact inquiries to protect against inbox flooding
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 messages per IP per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many contact submissions. Please try again after 15 minutes.' }
});

// Submit a contact inquiry (public)
router.post('/', contactLimiter, submitContactMessage);

// Retrieve all contact inquiries (admin only)
router.get('/', verifyToken, getAllContactMessages);

// Toggle read status on a contact inquiry (admin only)
router.patch('/:id/read', verifyToken, toggleReadStatus);

// Delete a contact inquiry (admin only)
router.delete('/:id', verifyToken, deleteContactMessage);

export default router;
