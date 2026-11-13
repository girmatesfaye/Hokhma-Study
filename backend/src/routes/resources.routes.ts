import { Router } from 'express';
import {
  getAllResources,
  createResource,
  updateResource,
  deleteResource
} from '../controllers/resources.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

// Public list, admin-only writes.
router.get('/', getAllResources);
router.post('/', verifyToken, createResource);
router.put('/:id', verifyToken, updateResource);
router.delete('/:id', verifyToken, deleteResource);

export default router;
