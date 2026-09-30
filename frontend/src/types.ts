/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Difficulty = 'beginner' | 'intermediate' | 'deep-dive';

export interface Topic {
  slug: string;
  name: string;
  nameAm?: string;
  description: string;
  descriptionAm?: string;
  articleCount: number;
  icon: string; // Lucide icon name
}

export interface ContentSection {
  type: 'paragraph' | 'header' | 'scripture' | 'list';
  text: string;
  textAm?: string;
  level?: 2 | 3; // for headers
  items?: string[]; // for lists
  itemsAm?: string[]; // for lists
  reference?: string; // for scripture
  referenceAm?: string; // for scripture
}

export interface Footnote {
  id: number;
  text: string;
  textAm?: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  titleAm?: string;
  topicSlug: string;
  difficulty: Difficulty;
  readingTime: number; // in minutes
  publishDate: string; // e.g., '2026-06-15'
  excerpt: string;
  excerptAm?: string;
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
  seoTitleAm?: string;
  seoDescriptionAm?: string;
  lang?: 'en' | 'am' | 'bilingual';
}

export interface Question {
  id: string;
  text: string;
  textAm?: string;
  topicSlug: string;
  difficulty: Difficulty;
  tags: string[];
  articleSlug: string;
  articleTitle: string;
  articleTitleAm?: string;
  commonScore: number; // 0-100 for ranking popular questions
  addedDate: string; // for "recently added"
}

export interface LearningPath {
  slug: string;
  title: string;
  titleAm?: string;
  description: string;
  descriptionAm?: string;
  goal: string;
  goalAm?: string;
  articleCount: number;
  difficultyRange: string; // e.g., 'Beginner to Deep Dive'
  difficultyRangeAm?: string;
  totalReadingTime: number; // in minutes
  articleSlugs: string[]; // Ordered list of article slugs
  steps?: LearningPathStep[];
}

export interface LearningPathStep {
  id: string;
  level: number;
  title: string;
  titleAm?: string;
  purpose: string;
  purposeAm?: string;
  type: 'article' | 'resource' | 'milestone';
  articleSlug?: string;
  resourceId?: string;
  externalTitle?: string;
  externalUrl?: string;
}

export interface Resource {
  id: string;
  category: 'Books' | 'Websites' | 'Podcasts' | 'Videos';
  categoryAm?: string;
  title: string;
  titleAm?: string;
  author: string;
  authorAm?: string;
  description: string;
  descriptionAm?: string;
  link: string;
}

export interface FaithStatement {
  doctrine: string;
  belief: string;
}

export interface AuthorProfile {
  name: string;
  role: string;
  avatar: string;
  bio: string;
  email: string;
  tagline: string;
  mission: string;
}

export interface Comment {
  id: string;
  articleSlug: string;
  authorName: string;
  text: string;
  timestamp: string;
  isApproved: boolean;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  submittedAt: string;
}

export interface QuestionSubmission {
  id: string;
  text: string;
  submittedAt: string;
  status: 'pending' | 'reviewed';
}

export interface AppRoute {
  path?: string;
  page?: string;
  slug?: string;
  id?: string;
}

