import { Router } from 'express';
import {
  getAllQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion
} from '../controllers/questions.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

// Public list, admin-only writes.
router.get('/', getAllQuestions);
router.post('/', verifyToken, createQuestion);
router.put('/:id', verifyToken, updateQuestion);
router.delete('/:id', verifyToken, deleteQuestion);

export default router;
