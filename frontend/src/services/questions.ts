import api from './api';
import { Question } from '../types';

// Retrieve theological questions with optional topic and difficulty filters
export const getQuestions = async (params?: { topic?: string; difficulty?: string }): Promise<Question[]> => {
  const response = await api.get<Question[]>('/questions', { params });
  return response.data;
};

// Retrieve a single theological question by its ID
export const getQuestionById = async (id: string): Promise<Question> => {
  const response = await api.get<Question>(`/questions/${id}`);
  return response.data;
};

// Create and map a theological question or objection to an article (admin only)
export const createQuestion = async (question: Partial<Question>): Promise<Question> => {
  const response = await api.post<Question>('/questions', question);
  return response.data;
};

// Update an existing theological question by ID (admin only)
export const updateQuestion = async (id: string, question: Partial<Question>): Promise<Question> => {
  const response = await api.put<Question>(`/questions/${id}`, question);
  return response.data;
};

// Delete a theological question by ID (admin only)
export const deleteQuestion = async (id: string): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(`/questions/${id}`);
  return response.data;
};
