import { Request, Response } from 'express';
import { LearningPath } from '../models/LearningPath.js';

// Retrieve all structured learning paths
export const getAllPaths = async (_req: Request, res: Response): Promise<void> => {
  try {
    const paths = await LearningPath.find().sort({ createdAt: 1 });
    res.status(200).json(paths);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: 'Failed to retrieve learning paths.', error: err.message });
  }
};

// Retrieve a single learning path by its URL slug
export const getPathBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const path = await LearningPath.findOne({ slug });

    // Return 404 if path not found
    if (!path) {
      res.status(404).json({ message: 'Learning path not found.' });
      return;
    }

    res.status(200).json(path);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: 'Failed to retrieve learning path.', error: err.message });
  }
};

// Create a new learning path (admin authenticated)
export const createPath = async (req: Request, res: Response): Promise<void> => {
  try {
    const pathData = req.body;

    // Check if learning path slug already exists
    const existing = await LearningPath.findOne({ slug: pathData.slug });
    if (existing) {
      res.status(400).json({ message: 'A learning path with this slug already exists.' });
      return;
    }

    const newPath = await LearningPath.create(pathData);
    res.status(201).json(newPath);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: 'Failed to create learning path.', error: err.message });
  }
};

// Update an existing learning path by its slug (admin authenticated)
export const updatePath = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const updated = await LearningPath.findOneAndUpdate({ slug }, req.body, { new: true, runValidators: true });

    // Return 404 if path not found
    if (!updated) {
      res.status(404).json({ message: 'Learning path not found.' });
      return;
    }

    res.status(200).json(updated);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: 'Failed to update learning path.', error: err.message });
  }
};

// Delete a learning path by its slug (admin authenticated)
export const deletePath = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const deleted = await LearningPath.findOneAndDelete({ slug });

    // Return 404 if path not found
    if (!deleted) {
      res.status(404).json({ message: 'Learning path not found.' });
      return;
    }

    res.status(200).json({ message: 'Learning path deleted successfully.' });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: 'Failed to delete learning path.', error: err.message });
  }
};
