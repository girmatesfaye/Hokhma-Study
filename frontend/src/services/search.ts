import api from './api';
import { Article, Question, Topic } from '../types';

export interface SearchResults {
  articles: Article[];
  questions: Question[];
  topics: Topic[];
}

// Perform unified full-text and partial match search across articles, questions, and topics
export const searchAll = async (query: string, difficulty?: string): Promise<SearchResults> => {
  // Build query parameter dictionary
  const params: Record<string, string> = { q: query };
  if (difficulty && difficulty !== 'all') {
    params.difficulty = difficulty;
  }
  const response = await api.get<SearchResults>('/search', { params });
  return response.data;
};
