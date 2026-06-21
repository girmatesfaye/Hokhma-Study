/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Difficulty = 'beginner' | 'intermediate' | 'deep-dive';

export interface Topic {
  slug: string;
  name: string;
  description: string;
  articleCount: number;
  icon: string; // Lucide icon name
}

export interface ContentSection {
  type: 'paragraph' | 'header' | 'scripture' | 'list';
  text: string;
  level?: 2 | 3; // for headers
  items?: string[]; // for lists
  reference?: string; // for scripture
}

export interface Footnote {
  id: number;
  text: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  topicSlug: string;
  difficulty: Difficulty;
  readingTime: number; // in minutes
  publishDate: string; // e.g., '2026-06-15'
  excerpt: string;
  content: ContentSection[];
  footnotes: Footnote[];
  tags: string[];
  featured: boolean;
  isPublished: boolean;
  commentsAllowed: boolean;
  partInPath?: {
    pathSlug: string;
    position: number; // 1-indexed step
  };
  views: number;
  coverImage?: string;
  seoTitle?: string;
  seoDescription?: string;
}

export interface Question {
  id: string;
  text: string;
  topicSlug: string;
  difficulty: Difficulty;
  tags: string[];
  articleSlug: string;
  articleTitle: string;
  commonScore: number; // 0-100 for ranking popular questions
  addedDate: string; // for "recently added"
}

export interface LearningPath {
  slug: string;
  title: string;
  description: string;
  goal: string;
  articleCount: number;
  difficultyRange: string; // e.g., 'Beginner to Deep Dive'
  totalReadingTime: number; // in minutes
  articleSlugs: string[]; // Ordered list of article slugs
}

export interface Resource {
  id: string;
  category: 'Books' | 'Websites' | 'Podcasts' | 'Videos';
  title: string;
  author: string;
  description: string;
  link: string;
}

export interface Comment {
  id: string;
  articleSlug: string;
  authorName: string;
  text: string;
  timestamp: string;
  isApproved: boolean;
}

export interface AppRoute {
  path?: string;
  page?: string;
  slug?: string;
  id?: string;
}

