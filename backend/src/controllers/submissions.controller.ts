import { Request, Response } from 'express';
import { QuestionSubmission } from '../models/QuestionSubmission.js';

// Submit an anonymous reader objection or theological inquiry (public)
export const submitQuestion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { text } = req.body;

    // Validate submission text
    if (!text || !text.trim()) {
      res.status(400).json({ message: 'Submission text is required.' });
      return;
    }

    const newSubmission = await QuestionSubmission.create({
      text: text.trim(),
      submittedAt: new Date().toISOString(),
      status: 'pending'
    });

    res.status(201).json({
      message: 'Question submitted successfully. Thank you for your inquiry.',
      submission: newSubmission
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: 'Failed to submit question.', error: err.message });
  }
};

// Retrieve all question submissions for administrative review (admin authenticated)
export const getAllSubmissions = async (_req: Request, res: Response): Promise<void> => {
  try {
    const submissions = await QuestionSubmission.find().sort({ createdAt: -1 });
    res.status(200).json(submissions);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: 'Failed to retrieve question submissions.', error: err.message });
  }
};

// Update submission moderation status between pending and reviewed (admin authenticated)
export const updateSubmissionStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status value
    if (!['pending', 'reviewed'].includes(status)) {
      res.status(400).json({ message: 'Invalid status. Must be pending or reviewed.' });
      return;
    }

    const updated = await QuestionSubmission.findByIdAndUpdate(id, { status }, { new: true });

    // Return 404 if submission not found
    if (!updated) {
      res.status(404).json({ message: 'Submission not found.' });
      return;
    }

    res.status(200).json({ message: 'Submission status updated successfully.', submission: updated });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: 'Failed to update submission status.', error: err.message });
  }
};

// Delete a question submission document (admin authenticated)
export const deleteSubmission = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await QuestionSubmission.findByIdAndDelete(id);

    // Return 404 if submission not found
    if (!deleted) {
      res.status(404).json({ message: 'Submission not found.' });
      return;
    }

    res.status(200).json({ message: 'Submission deleted successfully.' });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: 'Failed to delete submission.', error: err.message });
  }
};
