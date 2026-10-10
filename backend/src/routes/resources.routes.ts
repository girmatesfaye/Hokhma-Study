import { Router } from 'express';
import {
  getAllResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource
} from '../controllers/resources.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

// Retrieve all reference resources with category filter
router.get('/', getAllResources);

// Retrieve a single resource by ID
router.get('/:id', getResourceById);

// Create a new reference resource (admin only)
router.post('/', verifyToken, createResource);

// Update a reference resource by ID (admin only)
router.put('/:id', verifyToken, updateResource);

// Delete a reference resource by ID (admin only)
router.delete('/:id', verifyToken, deleteResource);

export default router;
