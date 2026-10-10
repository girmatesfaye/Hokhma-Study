import { Router } from 'express';
import {
  getAllQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion
} from '../controllers/questions.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

// Retrieve all theological questions
router.get('/', getAllQuestions);

// Retrieve a single question by ID
router.get('/:id', getQuestionById);

// Create or map a new question to an article (admin only)
router.post('/', verifyToken, createQuestion);

// Update a question by ID (admin only)
router.put('/:id', verifyToken, updateQuestion);

// Delete a question by ID (admin only)
router.delete('/:id', verifyToken, deleteQuestion);

export default router;
