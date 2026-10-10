import api from './api';
import { LearningPath } from '../types';

// Retrieve all structured learning paths
export const getPaths = async (): Promise<LearningPath[]> => {
  const response = await api.get<LearningPath[]>('/paths');
  return response.data;
};

// Retrieve a single learning path by its URL slug
export const getPathBySlug = async (slug: string): Promise<LearningPath> => {
  const response = await api.get<LearningPath>(`/paths/${slug}`);
  return response.data;
};

// Create a new learning path (admin only)
export const createPath = async (path: Partial<LearningPath>): Promise<LearningPath> => {
  const response = await api.post<LearningPath>('/paths', path);
  return response.data;
};

// Update an existing learning path by its slug (admin only)
export const updatePath = async (slug: string, path: Partial<LearningPath>): Promise<LearningPath> => {
  const response = await api.put<LearningPath>(`/paths/${slug}`, path);
  return response.data;
};

// Delete a learning path by its slug (admin only)
export const deletePath = async (slug: string): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(`/paths/${slug}`);
  return response.data;
};
