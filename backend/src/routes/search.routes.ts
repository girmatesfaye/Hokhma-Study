import { Router } from 'express';
import { searchAll } from '../controllers/search.controller.js';

const router = Router();

// Full-text and substring search endpoint (public)
router.get('/', searchAll);

export default router;
