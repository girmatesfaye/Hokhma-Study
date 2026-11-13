import { Router } from 'express';
import { submitComment, getAllComments, approveComment, deleteComment } from '../controllers/comments.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { validateComment } from '../middleware/validation.middleware.js';
import { makeLimiter } from '../middleware/rateLimit.js';

const router = Router();

// Public comment submission (10 per 15 minutes per IP) goes to the moderation queue.
router.post(
  '/',
  makeLimiter(15 * 60 * 1000, 10, 'Too many comment submissions. Please try again later.'),
  validateComment,
  submitComment
);

// Admin-only moderation.
router.get('/', verifyToken, getAllComments);
router.patch('/:id/approve', verifyToken, approveComment);
router.delete('/:id', verifyToken, deleteComment);

export default router;
