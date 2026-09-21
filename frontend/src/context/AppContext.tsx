/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Article, Topic, Question, LearningPath, Resource, Comment, AppRoute, Difficulty } from '../types';
import {
  INITIAL_ARTICLES,
  INITIAL_TOPICS,
  INITIAL_QUESTIONS,
  INITIAL_PATHS,
  INITIAL_RESOURCES,
  INITIAL_COMMENTS,
} from '../data';

interface AppContextType {
  currentRoute: AppRoute;
  navigateTo: (route: string) => void;
  articles: Article[];
  topics: Topic[];
  questions: Question[];
  paths: LearningPath[];
  resources: Resource[];
  comments: Comment[];
  isAdmin: boolean;
  loginAdmin: () => void;
  logoutAdmin: () => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  progress: Record<string, string[]>; // Record<pathSlug, articleSlugsValue[]>
  toggleStepProgress: (pathSlug: string, articleSlug: string) => void;
  addArticle: (article: Article) => void;
  updateArticle: (article: Article) => void;
  deleteArticle: (id: string) => void;
  addComment: (comment: Comment) => void;
  approveComment: (id: string) => void;
  deleteComment: (id: string) => void;
  addQuestion: (q: Question) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function parseHash(hash: string): AppRoute {
  if (!hash || hash === '#' || hash === '#/') {
    return { page: 'home' };
  }
  const cleanHash = hash.replace(/^#/, '');
  
  // Handle search query
  if (cleanHash.startsWith('/search')) {
    const qIndex = cleanHash.indexOf('?q=');
    if (qIndex !== -1) {
      const query = decodeURIComponent(cleanHash.substring(qIndex + 3));
      return { page: 'search', slug: query };
    }
    return { page: 'search' };
  }

  const parts = cleanHash.split('/').filter(Boolean);
  if (parts[0] === 'topics') {
    if (parts[1]) {
      return { page: 'topic-detail', slug: parts[1] };
    }
    return { page: 'topics' };
  }
  if (parts[0] === 'articles') {
    if (parts[1]) {
      return { page: 'article-detail', slug: parts[1] };
    }
  }
  if (parts[0] === 'paths') {
    if (parts[1]) {
      return { page: 'path-detail', slug: parts[1] };
    }
    return { page: 'paths' };
  }
  if (parts[0] === 'tags') {
    if (parts[1]) {
      return { page: 'tag-detail', slug: parts[1] };
    }
  }
  if (parts[0] === 'questions') {
    return { page: 'questions' };
  }
  if (parts[0] === 'about') {
    return { page: 'about' };
  }
  if (parts[0] === 'resources') {
    return { page: 'resources' };
  }
  if (parts[0] === 'admin') {
    if (parts[1] === 'login') {
      return { page: 'admin-login' };
    }
    if (parts[1] === 'articles' && parts[2] && parts[3] === 'edit') {
      return { page: 'article-editor', id: parts[2] };
    }
    return { page: 'admin-dashboard' };
  }
  
  return { page: 'home' };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  // State initialization with localStorage safety checks
  const getStoredValue = <T,>(key: string, defaultValue: T): T => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) return JSON.parse(stored);
      // Fallback to legacy apologia key prefix
      const legacyKey = key.replace('hokhma_', 'apologia_');
      const legacyStored = localStorage.getItem(legacyKey);
      return legacyStored ? JSON.parse(legacyStored) : defaultValue;
    } catch {
      return defaultValue;
    }
  };

  const setStoredValue = <T,>(key: string, value: T) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Failed to write to localStorage:', e);
    }
  };

  const [currentRoute, setCurrentRoute] = useState<AppRoute>(() => parseHash(window.location.hash));
  const [articles, setArticles] = useState<Article[]>(() => getStoredValue('hokhma_articles', INITIAL_ARTICLES));
  const [topics, setTopics] = useState<Topic[]>(() => getStoredValue('hokhma_topics', INITIAL_TOPICS));
  const [questions, setQuestions] = useState<Question[]>(() => getStoredValue('hokhma_questions', INITIAL_QUESTIONS));
  const [paths, setPaths] = useState<LearningPath[]>(() => getStoredValue('hokhma_paths', INITIAL_PATHS));
  const [resources, setResources] = useState<Resource[]>(() => getStoredValue('hokhma_resources', INITIAL_RESOURCES));
  const [comments, setComments] = useState<Comment[]>(() => getStoredValue('hokhma_comments', INITIAL_COMMENTS));
  const [isAdmin, setIsAdmin] = useState<boolean>(() => getStoredValue('hokhma_is_admin', false));
  const [darkMode, setDarkMode] = useState<boolean>(() => getStoredValue('hokhma_dark_mode', false));
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [progress, setProgress] = useState<Record<string, string[]>>(() => getStoredValue('hokhma_progress', {}));

  // Route Synchronization
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentRoute(parseHash(window.location.hash));
    };

    window.addEventListener('hashchange', handleHashChange);
    // Initial check
    handleHashChange();

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const navigateTo = (routeString: string) => {
    window.location.hash = routeString;
  };

  // Dark Mode effect
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    setStoredValue('hokhma_dark_mode', darkMode);
  }, [darkMode]);

  // Persists state changes safely
  useEffect(() => {
    setStoredValue('hokhma_articles', articles);
  }, [articles]);

  useEffect(() => {
    setStoredValue('hokhma_topics', topics);
  }, [topics]);

  useEffect(() => {
    setStoredValue('hokhma_questions', questions);
  }, [questions]);

  useEffect(() => {
    setStoredValue('hokhma_paths', paths);
  }, [paths]);

  useEffect(() => {
    setStoredValue('hokhma_resources', resources);
  }, [resources]);

  useEffect(() => {
    setStoredValue('hokhma_comments', comments);
  }, [comments]);

  useEffect(() => {
    setStoredValue('hokhma_is_admin', isAdmin);
  }, [isAdmin]);

  useEffect(() => {
    setStoredValue('hokhma_progress', progress);
  }, [progress]);

  // Actions
  const loginAdmin = () => setIsAdmin(true);
  const logoutAdmin = () => setIsAdmin(false);

  const toggleStepProgress = (pathSlug: string, articleSlug: string) => {
    setProgress((prev) => {
      const currentPathProgress = prev[pathSlug] || [];
      const isCompleted = currentPathProgress.includes(articleSlug);
      const nextProgress = isCompleted
        ? currentPathProgress.filter((s) => s !== articleSlug)
        : [...currentPathProgress, articleSlug];
      return { ...prev, [pathSlug]: nextProgress };
    });
  };

  const addArticle = (newArt: Article) => {
    setArticles((prev) => [newArt, ...prev]);
    // Sync topics count
    setTopics((topicsPrev) =>
      topicsPrev.map((t) => {
        if (t.slug === newArt.topicSlug) {
          return { ...t, articleCount: t.articleCount + 1 };
        }
        return t;
      })
    );
  };

  const updateArticle = (updatedArt: Article) => {
    const oldArt = articles.find((a) => a.id === updatedArt.id);
    setArticles((prev) => prev.map((art) => (art.id === updatedArt.id ? updatedArt : art)));
    
    // Update topics counts if topicSlug changed
    if (oldArt && oldArt.topicSlug !== updatedArt.topicSlug) {
      setTopics((topicsPrev) =>
        topicsPrev.map((t) => {
          if (t.slug === oldArt.topicSlug) {
            return { ...t, articleCount: Math.max(0, t.articleCount - 1) };
          }
          if (t.slug === updatedArt.topicSlug) {
            return { ...t, articleCount: t.articleCount + 1 };
          }
          return t;
        })
      );
    }
  };

  const deleteArticle = (id: string) => {
    const target = articles.find((art) => art.id === id);
    setArticles((prev) => prev.filter((art) => art.id !== id));
    if (target) {
      setTopics((topicsPrev) =>
        topicsPrev.map((t) => {
          if (t.slug === target.topicSlug) {
            return { ...t, articleCount: Math.max(0, t.articleCount - 1) };
          }
          return t;
        })
      );
    }
  };

  const addComment = (newComment: Comment) => {
    setComments((prev) => [newComment, ...prev]);
  };

  const approveComment = (commentId: string) => {
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, isApproved: true } : c))
    );
  };

  const deleteComment = (commentId: string) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  };

  const addQuestion = (newQ: Question) => {
    setQuestions((prev) => [newQ, ...prev]);
  };

  return (
    <AppContext.Provider
      value={{
        currentRoute,
        navigateTo,
        articles,
        topics,
        questions,
        paths,
        resources,
        comments,
        isAdmin,
        loginAdmin,
        logoutAdmin,
        darkMode,
        setDarkMode,
        searchQuery,
        setSearchQuery,
        progress,
        toggleStepProgress,
        addArticle,
        updateArticle,
        deleteArticle,
        addComment,
        approveComment,
        deleteComment,
        addQuestion,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
