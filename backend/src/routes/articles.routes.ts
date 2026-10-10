import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  getAllArticles,
  getArticleBySlug,
  reactToArticle,
  getArticleComments,
  createArticle,
  updateArticle,
  deleteArticle
} from '../controllers/articles.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

// Rate limiter for anonymous article reactions to prevent spamming
const reactionLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 reactions per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many reactions. Please wait a moment.' }
});

// Retrieve all articles with query filters
router.get('/', getAllArticles);

// Retrieve a single article by slug
router.get('/:slug', getArticleBySlug);

// Submit an anonymous reader reaction with rate limiting
router.post('/:slug/react', reactionLimiter, reactToArticle);

// Retrieve approved public comments for an article
router.get('/:slug/comments', getArticleComments);

// Create a new article (admin only)
router.post('/', verifyToken, createArticle);

// Update an existing article by ID (admin only)
router.put('/:id', verifyToken, updateArticle);

// Delete an article by ID (admin only)
router.delete('/:id', verifyToken, deleteArticle);

export default router;
