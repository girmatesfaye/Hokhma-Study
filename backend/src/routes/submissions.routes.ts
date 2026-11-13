import { Router } from 'express';
import {
  submitQuestion,
  getAllSubmissions,
  updateSubmissionStatus,
  deleteSubmission
} from '../controllers/submissions.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { validateQuestionSubmission } from '../middleware/validation.middleware.js';
import { makeLimiter } from '../middleware/rateLimit.js';

const router = Router();

// Public question submission (10 per 15 minutes per IP) and admin-only review queue.
router.post(
  '/',
  makeLimiter(15 * 60 * 1000, 10, 'Too many submissions. Please try again after 15 minutes.'),
  validateQuestionSubmission,
  submitQuestion
);
router.get('/', verifyToken, getAllSubmissions);
router.patch('/:id/status', verifyToken, updateSubmissionStatus);
router.delete('/:id', verifyToken, deleteSubmission);

export default router;
