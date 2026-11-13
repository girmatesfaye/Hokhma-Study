import { Router } from 'express';
import {
  getAllArticles,
  getArticleBySlug,
  reactToArticle,
  getArticleComments,
  createArticle,
  updateArticle,
  deleteArticle
} from '../controllers/articles.controller.js';
import { verifyToken, optionalAuth } from '../middleware/auth.middleware.js';
import { validateArticle } from '../middleware/validation.middleware.js';
import { makeLimiter } from '../middleware/rateLimit.js';

const router = Router();

// Public reads (drafts are only returned to an authenticated admin), reactions, and approved comments.
router.get('/', optionalAuth, getAllArticles);
router.get('/:slug', optionalAuth, getArticleBySlug);
router.post('/:slug/react', makeLimiter(60 * 1000, 30, 'Too many reactions. Please wait a moment.'), reactToArticle);
router.get('/:slug/comments', getArticleComments);

// Admin-only writes.
router.post('/', verifyToken, validateArticle, createArticle);
router.put('/:id', verifyToken, validateArticle, updateArticle);
router.delete('/:id', verifyToken, deleteArticle);

export default router;
