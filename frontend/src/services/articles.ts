import api from './api';
import { Article, Comment } from '../types';

// Fetch articles from the REST API with optional filtering criteria
export const getArticles = async (params?: {
  topic?: string;
  difficulty?: string;
  lang?: string;
  featured?: boolean;
  all?: boolean;
}): Promise<Article[]> => {
  const response = await api.get<Article[]>('/articles', { params });
  return response.data;
};

// Retrieve a single detailed article by its URL slug
export const getArticleBySlug = async (slug: string): Promise<Article> => {
  const response = await api.get<Article>(`/articles/${slug}`);
  return response.data;
};

// Toggle an anonymous reader reaction on an article atomically
export const toggleArticleReaction = async (
  slug: string,
  reaction: 'helpful' | 'insightful' | 'rigorous',
  delta: 1 | -1
): Promise<{ reactions: Record<string, number> }> => {
  const response = await api.post<{ reactions: Record<string, number> }>(`/articles/${slug}/react`, {
    reaction,
    delta
  });
  return response.data;
};

// Fetch all approved public comments for a given article
export const getArticleComments = async (slug: string): Promise<Comment[]> => {
  const response = await api.get<Comment[]>(`/articles/${slug}/comments`);
  return response.data;
};

// Create a new article document (admin only)
export const createArticle = async (article: Partial<Article>): Promise<Article> => {
  const response = await api.post<Article>('/articles', article);
  return response.data;
};

// Update an existing article by database ID (admin only)
export const updateArticle = async (id: string, article: Partial<Article>): Promise<Article> => {
  const response = await api.put<Article>(`/articles/${id}`, article);
  return response.data;
};

// Delete an article document by database ID (admin only)
export const deleteArticle = async (id: string): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(`/articles/${id}`);
  return response.data;
};
