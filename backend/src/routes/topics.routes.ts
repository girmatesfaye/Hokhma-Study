import { Router } from 'express';
import { getAllTopics, createTopic, updateTopic, deleteTopic } from '../controllers/topics.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

// Public list, admin-only writes.
router.get('/', getAllTopics);
router.post('/', verifyToken, createTopic);
router.put('/:slug', verifyToken, updateTopic);
router.delete('/:slug', verifyToken, deleteTopic);

export default router;
