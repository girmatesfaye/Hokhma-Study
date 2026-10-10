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

    // Escape regex characters for safe substring querying
    const escapedQuery = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedQuery, 'i');

    // Execute queries in parallel
    const [articles, questions, topics] = await Promise.all([
      // Search published articles by title, titleAm, excerpt, or tags
      Article.find({
        isPublished: true,
        $or: [
          { title: regex },
          { titleAm: regex },
          { excerpt: regex },
          { tags: regex }
        ]
      })
        .select('slug title titleAm excerpt excerptAm topicSlug difficulty readingTime publishDate tags')
        .limit(20),

      // Search theological questions by text or textAm
      Question.find({
        $or: [
          { text: regex },
          { textAm: regex },
          { tags: regex }
        ]
      }).limit(20),

      // Search topics by name, nameAm, or description
      Topic.find({
        $or: [
          { name: regex },
          { nameAm: regex },
          { description: regex }
        ]
      }).limit(10)
    ]);

    res.status(200).json({ articles, questions, topics });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: 'Search execution failed.', error: err.message });
  }
};
