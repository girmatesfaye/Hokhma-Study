import api from './api';
import { Comment } from '../types';

// Submit an anonymous reader comment for administrative review
export const submitComment = async (comment: {
  articleSlug: string;
  authorName: string;
  text: string;
}): Promise<{ message: string; comment: Comment }> => {
  const response = await api.post<{ message: string; comment: Comment }>('/comments', comment);
  return response.data;
};

// Retrieve all reader comments for moderation queue (admin only)
export const getAllComments = async (): Promise<Comment[]> => {
  const response = await api.get<Comment[]>('/comments');
  return response.data;
};

// Approve a comment for public display on an article (admin only)
export const approveComment = async (id: string): Promise<{ message: string; comment: Comment }> => {
  const response = await api.patch<{ message: string; comment: Comment }>(`/comments/${id}/approve`);
  return response.data;
};

// Permanently delete a comment (admin only)
export const deleteComment = async (id: string): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(`/comments/${id}`);
  return response.data;
};
