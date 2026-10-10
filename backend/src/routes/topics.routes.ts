import { Router } from 'express';
import {
  getAllTopics,
  getTopicBySlug,
  createTopic,
  updateTopic,
  deleteTopic
} from '../controllers/topics.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

// Retrieve all topic categories
router.get('/', getAllTopics);

// Retrieve a single topic and its published articles
router.get('/:slug', getTopicBySlug);

// Create a new topic category (admin only)
router.post('/', verifyToken, createTopic);

// Update a topic category by slug (admin only)
router.put('/:slug', verifyToken, updateTopic);

// Delete a topic category by slug (admin only)
router.delete('/:slug', verifyToken, deleteTopic);

export default router;
