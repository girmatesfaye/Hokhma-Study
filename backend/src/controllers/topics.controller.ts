import { Request, Response } from 'express';
import { Topic } from '../models/Topic.js';
import { Article } from '../models/Article.js';

// Retrieve all topic categories
export const getAllTopics = async (_req: Request, res: Response): Promise<void> => {
  try {
    const topics = await Topic.find().sort({ name: 1 });
    res.status(200).json(topics);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: 'Failed to retrieve topics.', error: err.message });
  }
};

// Retrieve a single topic by slug along with its associated published articles
export const getTopicBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const topic = await Topic.findOne({ slug });

    // Return 404 if topic not found
    if (!topic) {
      res.status(404).json({ message: 'Topic not found.' });
      return;
    }

    // Find all published articles belonging to this topic
    const articles = await Article.find({ topicSlug: slug, isPublished: true }).sort({ createdAt: -1 });

    res.status(200).json({ topic, articles });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: 'Failed to retrieve topic.', error: err.message });
  }
};

// Create a new topic category (admin authenticated)
export const createTopic = async (req: Request, res: Response): Promise<void> => {
  try {
    const topicData = req.body;

    // Check if topic slug is already taken
    const existing = await Topic.findOne({ slug: topicData.slug });
    if (existing) {
      res.status(400).json({ message: 'A topic with this slug already exists.' });
      return;
    }

    const newTopic = await Topic.create(topicData);
    res.status(201).json(newTopic);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: 'Failed to create topic.', error: err.message });
  }
};

// Update an existing topic by its URL slug (admin authenticated)
export const updateTopic = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const updated = await Topic.findOneAndUpdate({ slug }, req.body, { new: true, runValidators: true });

    // Return 404 if topic not found
    if (!updated) {
      res.status(404).json({ message: 'Topic not found.' });
      return;
    }

    res.status(200).json(updated);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: 'Failed to update topic.', error: err.message });
  }
};

// Delete a topic category by its URL slug (admin authenticated)
export const deleteTopic = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const deleted = await Topic.findOneAndDelete({ slug });

    // Return 404 if topic not found
    if (!deleted) {
      res.status(404).json({ message: 'Topic not found.' });
      return;
    }

    res.status(200).json({ message: 'Topic deleted successfully.' });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: 'Failed to delete topic.', error: err.message });
  }
};
