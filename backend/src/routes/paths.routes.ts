import { Router } from 'express';
import {
  getAllPaths,
  createPath,
  updatePath,
  deletePath
} from '../controllers/paths.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

// Retrieve all learning paths
router.get('/', getAllPaths);

// Create a new learning path (admin only)
router.post('/', verifyToken, createPath);

// Update a learning path by slug (admin only)
router.put('/:slug', verifyToken, updatePath);

// Delete a learning path by slug (admin only)
router.delete('/:slug', verifyToken, deletePath);

export default router;
