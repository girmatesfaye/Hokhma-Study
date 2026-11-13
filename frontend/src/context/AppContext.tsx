/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  Article,
  Topic,
  Question,
  LearningPath,
  Resource,
  Comment,
  AppRoute,
  AuthorProfile,
  FaithStatement,
  ContactMessage,
  QuestionSubmission
} from '../types';

// Import frontend API services
import * as articlesService from '../services/articles';
import * as topicsService from '../services/topics';
import * as questionsService from '../services/questions';
import * as pathsService from '../services/paths';
import * as resourcesService from '../services/resources';
import * as commentsService from '../services/comments';
import * as contactService from '../services/contact';
import * as submissionsService from '../services/submissions';
import * as settingsService from '../services/settings';

interface AppContextType {
  currentRoute: AppRoute;
  navigateTo: (route: string) => void;
  articles: Article[];
  topics: Topic[];
  questions: Question[];
  paths: LearningPath[];
  resources: Resource[];
  comments: Comment[];
  contactMessages: ContactMessage[];
  questionSubmissions: QuestionSubmission[];
  authorProfile: AuthorProfile;
  statementOfFaith: FaithStatement[];
  isAdmin: boolean;
  token: string | null;
  isLoading: boolean;
  hasLoaded: boolean;
  error: string | null;
  clearError: () => void;
  refetchData: () => Promise<void>;
  loginAdmin: (token: string) => void;
  logoutAdmin: () => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  progress: Record<string, string[]>;
  toggleStepProgress: (pathSlug: string, articleSlug: string) => void;
  addArticle: (article: Article) => Promise<Article>;
  updateArticle: (article: Article) => Promise<Article>;
  deleteArticle: (id: string) => Promise<void>;
  addTopic: (topic: Topic) => Promise<boolean>;
  updateTopic: (topic: Topic) => Promise<boolean>;
  deleteTopic: (slug: string) => Promise<void>;
  addPath: (path: LearningPath) => Promise<boolean>;
  updatePath: (path: LearningPath) => Promise<boolean>;
  deletePath: (slug: string) => Promise<void>;
  addResource: (resource: Resource) => Promise<boolean>;
  updateResource: (resource: Resource) => Promise<boolean>;
  deleteResource: (id: string) => Promise<void>;
  updateAuthorProfile: (profile: AuthorProfile) => Promise<boolean>;
  updateStatementOfFaith: (statements: FaithStatement[]) => Promise<boolean>;
  addComment: (comment: { articleSlug: string; authorName: string; text: string }) => Promise<void>;
  approveComment: (id: string) => Promise<void>;
  deleteComment: (id: string) => Promise<void>;
  addQuestion: (q: Question) => Promise<boolean>;
  updateQuestion: (q: Question) => Promise<boolean>;
  deleteQuestion: (id: string) => Promise<void>;
  addContactMessage: (message: { name: string; email: string; subject: string; message: string }) => Promise<void>;
  addQuestionSubmission: (text: string) => Promise<void>;
  updateSubmissionStatus: (id: string, status: 'pending' | 'reviewed') => Promise<void>;
  deleteContactMessage: (id: string) => Promise<void>;
  deleteQuestionSubmission: (id: string) => Promise<void>;
  toggleReaction: (articleSlug: string, reaction: string, delta: number) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Parse browser hash to current application route
export function parseHash(hash: string): AppRoute {
  if (!hash || hash === '#' || hash === '#/') {
    return { page: 'home' };
  }
  const cleanHash = hash.replace(/^#/, '');
  
  // Handle search query route
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

// Empty placeholders shown until the server responds; real content always comes from the API.
const EMPTY_PROFILE: AuthorProfile = { name: '', role: '', avatar: '', bio: '', email: '', tagline: '', mission: '' };

// Extract a readable message from an axios or generic error.
const getErrorMessage = (err: unknown): string => {
  if (axios.isAxiosError(err)) return err.response?.data?.message || err.message;
  return err instanceof Error ? err.message : 'Something went wrong. Please try again.';
};

// Derive each article's learning-path position from the paths, so path membership has a single source of truth.
const withPathMembership = (articles: Article[], paths: LearningPath[]): Article[] =>
  articles.map((article) => {
    const path = paths.find((p) => p.articleSlugs.includes(article.slug));
    const { partInPath: _stale, ...rest } = article;
    return path
      ? { ...rest, partInPath: { pathSlug: path.slug, position: path.articleSlugs.indexOf(article.slug) + 1 } }
      : rest;
  });

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Only device-level preferences live in localStorage; all content comes from the server.
  const readStored = <T,>(key: string, fallback: T): T => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : fallback;
    } catch {
      return fallback;
    }
  };

  const [currentRoute, setCurrentRoute] = useState<AppRoute>(() => parseHash(window.location.hash));
  const [rawArticles, setRawArticles] = useState<Article[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [questionSubmissions, setQuestionSubmissions] = useState<QuestionSubmission[]>([]);
  const [authorProfile, setAuthorProfile] = useState<AuthorProfile>(EMPTY_PROFILE);
  const [statementOfFaith, setStatementOfFaith] = useState<FaithStatement[]>([]);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('hokhma_token'));
  const [darkMode, setDarkMode] = useState<boolean>(() => readStored('hokhma_dark_mode', false));
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [progress, setProgress] = useState<Record<string, string[]>>(() => readStored('hokhma_progress', {}));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasLoaded, setHasLoaded] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // The token is the only auth state; being an admin simply means holding one.
  const isAdmin = Boolean(token);
  const articles = useMemo(() => withPathMembership(rawArticles, paths), [rawArticles, paths]);

  // Synchronize browser hash navigation
  useEffect(() => {
    const handleHashChange = () => setCurrentRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (routeString: string) => {
    window.location.hash = routeString;
  };

  // Apply and persist the dark theme preference
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('hokhma_dark_mode', JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('hokhma_progress', JSON.stringify(progress));
  }, [progress]);

  const clearError = () => setError(null);

  // Runs a server mutation, surfaces failures in the global error banner, and optionally rethrows to the caller.
  const mutate = async <T,>(action: () => Promise<T>, rethrow = false): Promise<T> => {
    setError(null);
    try {
      return await action();
    } catch (err) {
      setError(getErrorMessage(err));
      if (rethrow) throw err;
      return undefined as T;
    }
  };

  // Load all public content, plus the admin queues when signed in
  const refetchData = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const [fetchedArticles, fetchedTopics, fetchedQuestions, fetchedPaths, fetchedResources, fetchedSettings] =
        await Promise.all([
          articlesService.getArticles({ all: isAdmin }),
          topicsService.getTopics(),
          questionsService.getQuestions(),
          pathsService.getPaths(),
          resourcesService.getResources(),
          settingsService.getPublicSettings()
        ]);

      setRawArticles(fetchedArticles);
      setTopics(fetchedTopics);
      setQuestions(fetchedQuestions);
      setPaths(fetchedPaths);
      setResources(fetchedResources);
      setAuthorProfile(fetchedSettings.profile);
      setStatementOfFaith(fetchedSettings.faithStatements);
      setHasLoaded(true);

      if (isAdmin) {
        const [fetchedComments, fetchedMessages, fetchedSubmissions] = await Promise.all([
          commentsService.getAllComments(),
          contactService.getAllContactMessages(),
          submissionsService.getAllSubmissions()
        ]);
        setComments(fetchedComments);
        setContactMessages(fetchedMessages);
        setQuestionSubmissions(fetchedSubmissions);
      } else {
        setComments([]);
        setContactMessages([]);
        setQuestionSubmissions([]);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Reload whenever the signed-in state changes
  useEffect(() => {
    refetchData();
  }, [token]);

  const loginAdmin = (newToken: string) => {
    localStorage.setItem('hokhma_token', newToken);
    setToken(newToken);
  };

  const logoutAdmin = () => {
    localStorage.removeItem('hokhma_token');
    setToken(null);
  };

  // The API layer announces rejected tokens so expired sessions sign out cleanly
  useEffect(() => {
    window.addEventListener('hokhma:unauthorized', logoutAdmin);
    return () => window.removeEventListener('hokhma:unauthorized', logoutAdmin);
  }, []);

  // Toggle learning path step completion progress (stored on this device only)
  const toggleStepProgress = (pathSlug: string, articleSlug: string) => {
    setProgress((prev) => {
      const current = prev[pathSlug] || [];
      const next = current.includes(articleSlug) ? current.filter((s) => s !== articleSlug) : [...current, articleSlug];
      return { ...prev, [pathSlug]: next };
    });
  };

  // Topic counts are derived on the server, so reload them after anything that changes them
  const refreshTopics = async () => {
    setTopics(await topicsService.getTopics());
  };

  const addArticle = (newArt: Article): Promise<Article> =>
    mutate(async () => {
      const { id: _id, partInPath: _partInPath, ...payload } = newArt;
      const created = await articlesService.createArticle(payload);
      setRawArticles((prev) => [created, ...prev]);
      await refreshTopics();
      return created;
    }, true);

  const updateArticle = (updatedArt: Article): Promise<Article> =>
    mutate(async () => {
      const { id, partInPath: _partInPath, ...payload } = updatedArt;
      const saved = await articlesService.updateArticle(id, payload);
      setRawArticles((prev) => prev.map((a) => (a.id === id ? saved : a)));
      await refreshTopics();
      return saved;
    }, true);

  const deleteArticle = (id: string) =>
    mutate(async () => {
      await articlesService.deleteArticle(id);
      setRawArticles((prev) => prev.filter((a) => a.id !== id));
      // The server removes the article from any path steps, so reload paths and topic counts
      setPaths(await pathsService.getPaths());
      await refreshTopics();
    });

  const addTopic = async (newTopic: Topic): Promise<boolean> =>
    (await mutate(async () => {
      await topicsService.createTopic(newTopic);
      await refreshTopics();
      return true;
    })) === true;

  const updateTopic = async (updatedTopic: Topic): Promise<boolean> =>
    (await mutate(async () => {
      await topicsService.updateTopic(updatedTopic.slug, updatedTopic);
      await refreshTopics();
      return true;
    })) === true;

  const deleteTopic = (slug: string) =>
    mutate(async () => {
      await topicsService.deleteTopic(slug);
      setTopics((prev) => prev.filter((t) => t.slug !== slug));
    });

  const addPath = async (newPath: LearningPath): Promise<boolean> =>
    (await mutate(async () => {
      const created = await pathsService.createPath(newPath);
      setPaths((prev) => [created, ...prev]);
      return true;
    })) === true;

  const updatePath = async (updatedPath: LearningPath): Promise<boolean> =>
    (await mutate(async () => {
      const saved = await pathsService.updatePath(updatedPath.slug, updatedPath);
      setPaths((prev) => prev.map((p) => (p.slug === saved.slug ? saved : p)));
      return true;
    })) === true;

  const deletePath = (slug: string) =>
    mutate(async () => {
      await pathsService.deletePath(slug);
      setPaths((prev) => prev.filter((p) => p.slug !== slug));
    });

  const addResource = async (newResource: Resource): Promise<boolean> =>
    (await mutate(async () => {
      const { id: _id, ...payload } = newResource;
      const created = await resourcesService.createResource(payload);
      setResources((prev) => [created, ...prev]);
      return true;
    })) === true;

  const updateResource = async (updatedResource: Resource): Promise<boolean> =>
    (await mutate(async () => {
      const saved = await resourcesService.updateResource(updatedResource.id, updatedResource);
      setResources((prev) => prev.map((r) => (r.id === saved.id ? saved : r)));
      return true;
    })) === true;

  const deleteResource = (id: string) =>
    mutate(async () => {
      await resourcesService.deleteResource(id);
      setResources((prev) => prev.filter((r) => r.id !== id));
    });

  const updateAuthorProfile = async (profile: AuthorProfile): Promise<boolean> =>
    (await mutate(async () => {
      const { profile: saved } = await settingsService.updateAuthorProfile(profile);
      setAuthorProfile(saved);
      return true;
    })) === true;

  const updateStatementOfFaith = async (statements: FaithStatement[]): Promise<boolean> =>
    (await mutate(async () => {
      const { faithStatements } = await settingsService.updateFaithStatements(statements);
      setStatementOfFaith(faithStatements);
      return true;
    })) === true;

  // Public submissions rethrow so forms only show success after the server accepts them
  const addComment = (newComment: { articleSlug: string; authorName: string; text: string }) =>
    mutate(async () => {
      await commentsService.submitComment(newComment);
    }, true);

  const approveComment = (commentId: string) =>
    mutate(async () => {
      const { comment } = await commentsService.approveComment(commentId);
      setComments((prev) => prev.map((c) => (c.id === commentId ? comment : c)));
    });

  const deleteComment = (commentId: string) =>
    mutate(async () => {
      await commentsService.deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    });

  const addQuestion = async (newQ: Question): Promise<boolean> =>
    (await mutate(async () => {
      const { id: _id, ...payload } = newQ;
      const created = await questionsService.createQuestion(payload);
      setQuestions((prev) => [created, ...prev]);
      return true;
    })) === true;

  const updateQuestion = async (updatedQ: Question): Promise<boolean> =>
    (await mutate(async () => {
      const saved = await questionsService.updateQuestion(updatedQ.id, updatedQ);
      setQuestions((prev) => prev.map((q) => (q.id === saved.id ? saved : q)));
      return true;
    })) === true;

  const deleteQuestion = (id: string) =>
    mutate(async () => {
      await questionsService.deleteQuestion(id);
      setQuestions((prev) => prev.filter((q) => q.id !== id));
    });

  const addContactMessage = (message: { name: string; email: string; subject: string; message: string }) =>
    mutate(async () => {
      await contactService.submitContactMessage(message);
    }, true);

  const addQuestionSubmission = (text: string) =>
    mutate(async () => {
      await submissionsService.submitQuestion({ text });
    }, true);

  const updateSubmissionStatus = (id: string, status: 'pending' | 'reviewed') =>
    mutate(async () => {
      const { submission } = await submissionsService.updateSubmissionStatus(id, status);
      setQuestionSubmissions((prev) => prev.map((s) => (s.id === id ? submission : s)));
    });

  const deleteQuestionSubmission = (id: string) =>
    mutate(async () => {
      await submissionsService.deleteSubmission(id);
      setQuestionSubmissions((prev) => prev.filter((s) => s.id !== id));
    });

  const deleteContactMessage = (id: string) =>
    mutate(async () => {
      await contactService.deleteContactMessage(id);
      setContactMessages((prev) => prev.filter((m) => m.id !== id));
    });

  // Send the reaction to the server and keep the article's stored counts in sync with its response
  const toggleReaction = (articleSlug: string, reaction: string, delta: number) =>
    mutate(async () => {
      const { reactions } = await articlesService.toggleArticleReaction(
        articleSlug,
        reaction as 'helpful' | 'insightful' | 'rigorous',
        delta === -1 ? -1 : 1
      );
      setRawArticles((prev) =>
        prev.map((a) => (a.slug === articleSlug ? { ...a, reactions: reactions as Article['reactions'] } : a))
      );
    });

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
        contactMessages,
        questionSubmissions,
        authorProfile,
        statementOfFaith,
        isAdmin,
        token,
        isLoading,
        hasLoaded,
        error,
        clearError,
        refetchData,
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
        addTopic,
        updateTopic,
        deleteTopic,
        addPath,
        updatePath,
        deletePath,
        addResource,
        updateResource,
        deleteResource,
        updateAuthorProfile,
        updateStatementOfFaith,
        addComment,
        approveComment,
        deleteComment,
        addQuestion,
        updateQuestion,
        deleteQuestion,
        addContactMessage,
        addQuestionSubmission,
        updateSubmissionStatus,
        deleteContactMessage,
        deleteQuestionSubmission,
        toggleReaction
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// Hook to access application context
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
