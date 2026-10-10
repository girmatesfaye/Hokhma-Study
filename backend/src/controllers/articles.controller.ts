import { Request, Response } from 'express';
import { Article } from '../models/Article.js';
import { Comment } from '../models/Comment.js';
import { Topic } from '../models/Topic.js';

// Retrieve all articles with optional topic, difficulty, language, and featured filters
export const getAllArticles = async (req: Request, res: Response): Promise<void> => {
  try {
    const { topic, difficulty, lang, featured, all } = req.query;
    const filter: Record<string, any> = {};

    // Only filter by published status if not explicitly requesting all articles (admin view)
    if (all !== 'true') {
      filter.isPublished = true;
    }

    // Apply topic filter when provided
    if (topic) {
      filter.topicSlug = String(topic);
    }

    // Apply difficulty filter when provided
    if (difficulty) {
      filter.difficulty = String(difficulty);
    }

    // Apply language filter when provided
    if (lang) {
      filter.lang = String(lang);
    }

    // Apply featured filter when requested
    if (featured === 'true') {
      filter.featured = true;
    }

    const articles = await Article.find(filter).sort({ createdAt: -1 });
    res.status(200).json(articles);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: 'Failed to retrieve articles.', error: err.message });
  }
};

// Retrieve a single article by its unique URL slug
export const getArticleBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const article = await Article.findOne({ slug });

    // Return 404 if article not found
    if (!article) {
      res.status(404).json({ message: 'Article not found.' });
      return;
    }

    res.status(200).json(article);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: 'Failed to retrieve article.', error: err.message });
  }
};

// Toggle an anonymous reader reaction atomically using MongoDB $inc
export const reactToArticle = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const { reaction, delta } = req.body;

    // Validate reaction type
    if (!['helpful', 'insightful', 'rigorous'].includes(reaction)) {
      res.status(400).json({ message: 'Invalid reaction category.' });
      return;
    }

    // Enforce delta increment/decrement constraints
    const numericDelta = delta === -1 ? -1 : 1;
    const fieldPath = `reactions.${reaction}`;

    const updatedArticle = await Article.findOneAndUpdate(
      { slug },
      { $inc: { [fieldPath]: numericDelta } },
      { new: true }
    );

    // Return 404 if article doesn't exist
    if (!updatedArticle) {
      res.status(404).json({ message: 'Article not found.' });
      return;
    }

    // Prevent counter from dropping below zero
    if (updatedArticle.reactions && updatedArticle.reactions[reaction as keyof typeof updatedArticle.reactions] < 0) {
      await Article.updateOne({ slug }, { $set: { [fieldPath]: 0 } });
      updatedArticle.reactions[reaction as keyof typeof updatedArticle.reactions] = 0;
    }

    res.status(200).json({ reactions: updatedArticle.reactions });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: 'Failed to update reaction.', error: err.message });
  }
};

// Retrieve approved public comments for a specific article
export const getArticleComments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const comments = await Comment.find({ articleSlug: slug, isApproved: true }).sort({ createdAt: -1 });
    res.status(200).json(comments);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: 'Failed to retrieve comments.', error: err.message });
  }
};

// Create a new article document (admin authenticated)
export const createArticle = async (req: Request, res: Response): Promise<void> => {
  try {
    const articleData = req.body;

    // Check if an article with the same slug already exists
    const existing = await Article.findOne({ slug: articleData.slug });
    if (existing) {
      res.status(400).json({ message: 'An article with this slug already exists.' });
      return;
    }

    const newArticle = await Article.create(articleData);

    // Increment topic article count
    if (newArticle.topicSlug) {
      await Topic.updateOne({ slug: newArticle.topicSlug }, { $inc: { articleCount: 1 } });
    }

    res.status(201).json(newArticle);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: 'Failed to create article.', error: err.message });
  }
};

// Update an existing article by its database ID (admin authenticated)
export const updateArticle = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updated = await Article.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    // Return 404 if article not found
    if (!updated) {
      res.status(404).json({ message: 'Article not found.' });
      return;
    }

    res.status(200).json(updated);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: 'Failed to update article.', error: err.message });
  }
};

// Delete an article document by its database ID (admin authenticated)
export const deleteArticle = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await Article.findByIdAndDelete(id);

    // Return 404 if article not found
    if (!deleted) {
      res.status(404).json({ message: 'Article not found.' });
      return;
    }

    // Decrement topic article count
    if (deleted.topicSlug) {
      await Topic.updateOne({ slug: deleted.topicSlug }, { $inc: { articleCount: -1 } });
    }

    res.status(200).json({ message: 'Article deleted successfully.' });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: 'Failed to delete article.', error: err.message });
  }
};
