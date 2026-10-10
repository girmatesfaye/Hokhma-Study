import { Request, Response } from 'express';
import { Article } from '../models/Article.js';
import { Question } from '../models/Question.js';
import { Topic } from '../models/Topic.js';

// Perform unified full-text and substring search across articles, questions, and topics
export const searchAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const q = req.query.q ? String(req.query.q).trim() : '';

    // If query is empty, return empty collections
    if (!q) {
      res.status(200).json({ articles: [], questions: [], topics: [] });
      return;
    }

    // Optional difficulty filter from query params
    const difficulty = req.query.difficulty ? String(req.query.difficulty).trim() : '';

    // Escape regex characters for safe substring querying
    const escapedQuery = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedQuery, 'i');

    // Build article match query filters
    const articleFilter: Record<string, unknown> = { isPublished: true };
    if (difficulty && difficulty !== 'all') {
      articleFilter.difficulty = difficulty;
    }

    // Build question match query filters
    const questionFilter: Record<string, unknown> = {};
    if (difficulty && difficulty !== 'all') {
      questionFilter.difficulty = difficulty;
    }

    // Search articles using regex for prefix/substring matching
    const regexArticles = await Article.find({
      ...articleFilter,
      $or: [
        { title: regex },
        { titleAm: regex },
        { excerpt: regex },
        { tags: regex }
      ]
    })
      .select('slug title titleAm excerpt excerptAm topicSlug difficulty readingTime publishDate tags')
      .limit(20);

    // Complement with MongoDB text search for broader vocabulary hits
    let fullTextArticles: typeof regexArticles = [];
    try {
      fullTextArticles = await Article.find({
        ...articleFilter,
        $text: { $search: q },
        _id: { $nin: regexArticles.map((a) => a._id) }
      })
        .select('slug title titleAm excerpt excerptAm topicSlug difficulty readingTime publishDate tags')
        .limit(Math.max(0, 20 - regexArticles.length));
    } catch {
      // Gracefully continue if text index is not yet built in local environment
      fullTextArticles = [];
    }
    const articles = [...regexArticles, ...fullTextArticles];

    // Search questions using regex
    const regexQuestions = await Question.find({
      ...questionFilter,
      $or: [
        { text: regex },
        { textAm: regex },
        { tags: regex }
      ]
    }).limit(20);

    // Complement questions with MongoDB text search
    let fullTextQuestions: typeof regexQuestions = [];
    try {
      fullTextQuestions = await Question.find({
        ...questionFilter,
        $text: { $search: q },
        _id: { $nin: regexQuestions.map((item) => item._id) }
      }).limit(Math.max(0, 20 - regexQuestions.length));
    } catch {
      // Gracefully continue if question text index is pending
      fullTextQuestions = [];
    }
    const questions = [...regexQuestions, ...fullTextQuestions];

    // Search topics by name, nameAm, or description
    const topics = await Topic.find({
      $or: [
        { name: regex },
        { nameAm: regex },
        { description: regex }
      ]
    }).limit(10);

    res.status(200).json({ articles, questions, topics });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: 'Search execution failed.', error: err.message });
  }
};
