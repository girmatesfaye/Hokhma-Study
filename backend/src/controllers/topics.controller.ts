import { Request, Response } from 'express';
import { Topic } from '../models/Topic.js';
import { Article } from '../models/Article.js';

// Retrieve all topic categories
export const getAllTopics = async (_req: Request, res: Response): Promise<void> => {
  try {
    const topics = await Topic.find().sort({ name: 1 });

    // articleCount is derived from published articles so it can never drift out of sync
    const counts = await Article.aggregate<{ _id: string; count: number }>([
      { $match: { isPublished: true } },
      { $group: { _id: '$topicSlug', count: { $sum: 1 } } }
    ]);
    const countBySlug = new Map(counts.map((c) => [c._id, c.count]));

    res.status(200).json(topics.map((t) => ({ ...t.toJSON(), articleCount: countBySlug.get(t.slug) || 0 })));
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: 'Failed to retrieve topics.', error: err.message });
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

    // Refuse to orphan articles that still belong to this topic
    if (await Article.exists({ topicSlug: slug })) {
      res.status(409).json({ message: 'Move or delete this topic\'s articles before deleting the topic.' });
      return;
    }

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
