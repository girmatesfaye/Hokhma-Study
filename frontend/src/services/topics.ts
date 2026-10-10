import api from './api';
import { Topic, Article } from '../types';

// Retrieve all topic categories
export const getTopics = async (): Promise<Topic[]> => {
  const response = await api.get<Topic[]>('/topics');
  return response.data;
};

// Retrieve a single topic category along with its associated articles
export const getTopicBySlug = async (slug: string): Promise<{ topic: Topic; articles: Article[] }> => {
  const response = await api.get<{ topic: Topic; articles: Article[] }>(`/topics/${slug}`);
  return response.data;
};

// Create a new topic category (admin only)
export const createTopic = async (topic: Partial<Topic>): Promise<Topic> => {
  const response = await api.post<Topic>('/topics', topic);
  return response.data;
};

// Update an existing topic category by its slug (admin only)
export const updateTopic = async (slug: string, topic: Partial<Topic>): Promise<Topic> => {
  const response = await api.put<Topic>(`/topics/${slug}`, topic);
  return response.data;
};

// Delete a topic category by its slug (admin only)
export const deleteTopic = async (slug: string): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(`/topics/${slug}`);
  return response.data;
};
