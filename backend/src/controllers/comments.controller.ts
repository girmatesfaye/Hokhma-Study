import { Request, Response } from 'express';
import { Comment } from '../models/Comment.js';

// Submit a new reader comment into the moderation queue (defaults isApproved: false)
export const submitComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { articleSlug, authorName, text } = req.body;

    // Validate required fields
    if (!articleSlug || !authorName || !text) {
      res.status(400).json({ message: 'Article slug, author name, and comment text are required.' });
      return;
    }

    const newComment = await Comment.create({
      articleSlug,
      authorName: authorName.trim(),
      text: text.trim(),
      timestamp: new Date().toISOString(),
      isApproved: false
    });

    res.status(201).json({
      message: 'Comment submitted successfully and pending moderation.',
      comment: newComment
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: 'Failed to submit comment.', error: err.message });
  }
};

// Retrieve all comments for administrative moderation (admin authenticated)
export const getAllComments = async (_req: Request, res: Response): Promise<void> => {
  try {
    const comments = await Comment.find().sort({ createdAt: -1 });
    res.status(200).json(comments);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: 'Failed to retrieve comments.', error: err.message });
  }
};

// Approve a comment for public display (admin authenticated)
export const approveComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const comment = await Comment.findByIdAndUpdate(id, { isApproved: true }, { new: true });

    // Return 404 if comment not found
    if (!comment) {
      res.status(404).json({ message: 'Comment not found.' });
      return;
    }

    res.status(200).json({ message: 'Comment approved successfully.', comment });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: 'Failed to approve comment.', error: err.message });
  }
};

// Delete a comment document (admin authenticated)
export const deleteComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await Comment.findByIdAndDelete(id);

    // Return 404 if comment not found
    if (!deleted) {
      res.status(404).json({ message: 'Comment not found.' });
      return;
    }

    res.status(200).json({ message: 'Comment deleted successfully.' });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: 'Failed to delete comment.', error: err.message });
  }
};
