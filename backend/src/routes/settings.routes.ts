import { Router } from 'express';
import {
  getPublicSettings,
  updateAuthorProfile,
  updateFaithStatements
} from '../controllers/settings.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

// Retrieve public author profile and statement of faith
router.get('/public', getPublicSettings);

// Update author profile (admin only)
router.put('/profile', verifyToken, updateAuthorProfile);

// Update statement of faith (admin only)
router.put('/faith', verifyToken, updateFaithStatements);

export default router;
