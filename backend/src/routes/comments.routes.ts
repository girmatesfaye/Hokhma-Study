import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  submitComment,
  getAllComments,
  approveComment,
  deleteComment
} from '../controllers/comments.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
// Import express-validator comment payload validation rules
import { validateComment } from '../middleware/validation.middleware.js';

const router = Router();

// Rate limiter for reader comments to prevent submission spam
const commentSubmissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 comments per IP per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many comment submissions. Please try again later.' }
});

// Submit a new reader comment for moderation with validation (public)
router.post('/', commentSubmissionLimiter, validateComment, submitComment);

// Retrieve all comments for moderation queue (admin only)
router.get('/', verifyToken, getAllComments);

// Approve a comment for public display (admin only)
router.patch('/:id/approve', verifyToken, approveComment);

// Delete a comment (admin only)
router.delete('/:id', verifyToken, deleteComment);

export default router;
