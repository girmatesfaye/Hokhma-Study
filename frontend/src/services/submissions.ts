import api from './api';
import { QuestionSubmission } from '../types';

// Submit an anonymous reader question or objection
export const submitQuestion = async (submission: { text: string }): Promise<{ message: string; submission: QuestionSubmission }> => {
  const response = await api.post<{ message: string; submission: QuestionSubmission }>('/submissions', submission);
  return response.data;
};

// Retrieve all reader question submissions (admin only)
export const getAllSubmissions = async (): Promise<QuestionSubmission[]> => {
  const response = await api.get<QuestionSubmission[]>('/submissions');
  return response.data;
};

// Update submission review status between pending and reviewed (admin only)
export const updateSubmissionStatus = async (
  id: string,
  status: 'pending' | 'reviewed'
): Promise<{ message: string; submission: QuestionSubmission }> => {
  const response = await api.patch<{ message: string; submission: QuestionSubmission }>(`/submissions/${id}/status`, {
    status
  });
  return response.data;
};

// Delete a question submission (admin only)
export const deleteSubmission = async (id: string): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(`/submissions/${id}`);
  return response.data;
};
