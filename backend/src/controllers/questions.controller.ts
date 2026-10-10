import { Request, Response } from 'express';
import { Question } from '../models/Question.js';
import { Article } from '../models/Article.js';

// Retrieve all theological questions with optional topic and difficulty filters
export const getAllQuestions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { topic, difficulty } = req.query;
    const filter: Record<string, any> = {};

    // Filter by topic slug when present
    if (topic) {
      filter.topicSlug = String(topic);
    }

    // Filter by difficulty when present
    if (difficulty) {
      filter.difficulty = String(difficulty);
    }

    const questions = await Question.find(filter).sort({ commonScore: -1, createdAt: -1 });
    res.status(200).json(questions);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: 'Failed to retrieve questions.', error: err.message });
  }
};

// Retrieve a single theological question by its database ID
export const getQuestionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const question = await Question.findById(id);

    // Return 404 if question not found
    if (!question) {
      res.status(404).json({ message: 'Question not found.' });
      return;
    }

    res.status(200).json(question);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: 'Failed to retrieve question.', error: err.message });
  }
};

// Create or map a new theological question to an article (admin authenticated)
export const createQuestion = async (req: Request, res: Response): Promise<void> => {
  try {
    const questionData = req.body;

    // Automatically denormalize articleTitle from Article model if missing
    if (questionData.articleSlug && (!questionData.articleTitle || !questionData.articleTitleAm)) {
      const linkedArticle = await Article.findOne({ slug: questionData.articleSlug });
      if (linkedArticle) {
        questionData.articleTitle = questionData.articleTitle || linkedArticle.title;
        questionData.articleTitleAm = questionData.articleTitleAm || linkedArticle.titleAm;
      }
    }

    // Set default addedDate if omitted
    if (!questionData.addedDate) {
      questionData.addedDate = new Date().toISOString().split('T')[0];
    }

    const newQuestion = await Question.create(questionData);
    res.status(201).json(newQuestion);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: 'Failed to create question.', error: err.message });
  }
};

// Update an existing theological question by ID (admin authenticated)
export const updateQuestion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updated = await Question.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    // Return 404 if question not found
    if (!updated) {
      res.status(404).json({ message: 'Question not found.' });
      return;
    }

    res.status(200).json(updated);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: 'Failed to update question.', error: err.message });
  }
};

// Delete a theological question by ID (admin authenticated)
export const deleteQuestion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await Question.findByIdAndDelete(id);

    // Return 404 if question not found
    if (!deleted) {
      res.status(404).json({ message: 'Question not found.' });
      return;
    }

    res.status(200).json({ message: 'Question deleted successfully.' });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: 'Failed to delete question.', error: err.message });
  }
};
