import api from './api';
import { Article, Question, Topic } from '../types';

export interface SearchResults {
  articles: Article[];
  questions: Question[];
  topics: Topic[];
}

// Perform unified full-text and partial match search
export const searchAll = async (query: string): Promise<SearchResults> => {
  const response = await api.get<SearchResults>('/search', {
    params: { q: query }
  });
  return response.data;
};
