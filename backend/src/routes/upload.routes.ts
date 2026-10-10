import { Router } from 'express';
import { uploadMiddleware } from '../middleware/upload.middleware.js';
import { uploadImage } from '../controllers/upload.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

// Upload cover image to Cloudinary (admin authenticated)
router.post('/', verifyToken, uploadMiddleware.single('image'), uploadImage);

export default router;
