import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  submitQuestion,
  getAllSubmissions,
  updateSubmissionStatus,
  deleteSubmission
} from '../controllers/submissions.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
// Import express-validator question submission validation rules
import { validateQuestionSubmission } from '../middleware/validation.middleware.js';

const router = Router();

// Rate limiter for question submissions to avoid automated spam
const submissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 submissions per IP per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many submissions. Please try again after 15 minutes.' }
});

// Submit a question or objection with rate limiting and payload validation (public)
router.post('/', submissionLimiter, validateQuestionSubmission, submitQuestion);

// Retrieve all question submissions (admin only)
router.get('/', verifyToken, getAllSubmissions);

// Update status of a question submission (admin only)
router.patch('/:id/status', verifyToken, updateSubmissionStatus);

// Delete a question submission (admin only)
router.delete('/:id', verifyToken, deleteSubmission);

export default router;
