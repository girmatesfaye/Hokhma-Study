/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
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
import {
  INITIAL_ARTICLES,
  INITIAL_TOPICS,
  INITIAL_QUESTIONS,
  INITIAL_PATHS,
  INITIAL_RESOURCES,
  INITIAL_COMMENTS,
  AUTHOR_BIO,
  STATEMENT_OF_FAITH
} from '../data';

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
  reactions: Record<string, Record<string, number>>;
  authorProfile: AuthorProfile;
  statementOfFaith: FaithStatement[];
  isAdmin: boolean;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  refetchData: () => Promise<void>;
  loginAdmin: (token: string) => void;
  logoutAdmin: () => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  progress: Record<string, string[]>;
  toggleStepProgress: (pathSlug: string, articleSlug: string) => void;
  addArticle: (article: Article) => void;
  updateArticle: (article: Article) => void;
  deleteArticle: (id: string) => void;
  addTopic: (topic: Topic) => void;
  updateTopic: (topic: Topic) => void;
  deleteTopic: (slug: string) => void;
  addPath: (path: LearningPath) => void;
  updatePath: (path: LearningPath) => void;
  deletePath: (slug: string) => void;
  addResource: (resource: Resource) => void;
  updateResource: (resource: Resource) => void;
  deleteResource: (id: string) => void;
  updateAuthorProfile: (profile: AuthorProfile) => void;
  updateStatementOfFaith: (statements: FaithStatement[]) => void;
  addComment: (comment: Comment) => void;
  approveComment: (id: string) => void;
  deleteComment: (id: string) => void;
  addQuestion: (q: Question) => void;
  addContactMessage: (message: ContactMessage) => void;
  addQuestionSubmission: (submission: QuestionSubmission) => void;
  updateSubmissionStatus: (id: string, status: 'pending' | 'reviewed') => void;
  deleteContactMessage: (id: string) => void;
  toggleReaction: (articleSlug: string, reaction: string, delta: number) => void;
  incrementArticleView: (articleId: string) => void;
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

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Helper to read initial stored value from localStorage with fallback
  const getStoredValue = <T,>(key: string, defaultValue: T): T => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) return JSON.parse(stored);
      const legacyKey = key.replace('hokhma_', 'apologia_');
      const legacyStored = localStorage.getItem(legacyKey);
      return legacyStored ? JSON.parse(legacyStored) : defaultValue;
    } catch {
      return defaultValue;
    }
  };

  // Helper to persist state to localStorage
  const setStoredValue = <T,>(key: string, value: T) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Failed to write to localStorage:', e);
    }
  };

  // Core application states
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(() => parseHash(window.location.hash));
  const [articles, setArticles] = useState<Article[]>(() => getStoredValue('hokhma_articles', INITIAL_ARTICLES));
  const [topics, setTopics] = useState<Topic[]>(() => getStoredValue('hokhma_topics', INITIAL_TOPICS));
  const [questions, setQuestions] = useState<Question[]>(() => getStoredValue('hokhma_questions', INITIAL_QUESTIONS));
  const [paths, setPaths] = useState<LearningPath[]>(() => {
    const storedPaths = getStoredValue('hokhma_paths', INITIAL_PATHS);
    const jesusPath = INITIAL_PATHS.find((path) => path.slug === 'jesus-as');
    return jesusPath && !storedPaths.some((path) => path.slug === jesusPath.slug) ? [...storedPaths, jesusPath] : storedPaths;
  });
  const [resources, setResources] = useState<Resource[]>(() => getStoredValue('hokhma_resources', INITIAL_RESOURCES));
  const [comments, setComments] = useState<Comment[]>(() => getStoredValue('hokhma_comments', INITIAL_COMMENTS));
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>(() => getStoredValue('hokhma_contact_messages', []));
  const [questionSubmissions, setQuestionSubmissions] = useState<QuestionSubmission[]>(() => getStoredValue('hokhma_question_submissions', []));
  const [reactions, setReactions] = useState<Record<string, Record<string, number>>>(() => getStoredValue('hokhma_reactions', {}));
  const [authorProfile, setAuthorProfile] = useState<AuthorProfile>(() => getStoredValue('hokhma_author_profile', AUTHOR_BIO));
  const [statementOfFaith, setStatementOfFaith] = useState<FaithStatement[]>(() => getStoredValue('hokhma_statement_of_faith', STATEMENT_OF_FAITH));
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('hokhma_token'));
  const [isAdmin, setIsAdmin] = useState<boolean>(() => Boolean(localStorage.getItem('hokhma_token')));
  const [darkMode, setDarkMode] = useState<boolean>(() => getStoredValue('hokhma_dark_mode', false));
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [progress, setProgress] = useState<Record<string, string[]>>(() => getStoredValue('hokhma_progress', {}));
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Synchronize browser hash navigation
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentRoute(parseHash(window.location.hash));
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Update hash location on route change
  const navigateTo = (routeString: string) => {
    window.location.hash = routeString;
  };

  // Toggle CSS dark theme class on document element
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    setStoredValue('hokhma_dark_mode', darkMode);
  }, [darkMode]);

  // Persist local preferences and cache
  useEffect(() => { setStoredValue('hokhma_articles', articles); }, [articles]);
  useEffect(() => { setStoredValue('hokhma_topics', topics); }, [topics]);
  useEffect(() => { setStoredValue('hokhma_questions', questions); }, [questions]);
  useEffect(() => { setStoredValue('hokhma_paths', paths); }, [paths]);
  useEffect(() => { setStoredValue('hokhma_resources', resources); }, [resources]);
  useEffect(() => { setStoredValue('hokhma_comments', comments); }, [comments]);
  useEffect(() => { setStoredValue('hokhma_contact_messages', contactMessages); }, [contactMessages]);
  useEffect(() => { setStoredValue('hokhma_question_submissions', questionSubmissions); }, [questionSubmissions]);
  useEffect(() => { setStoredValue('hokhma_reactions', reactions); }, [reactions]);
  useEffect(() => { setStoredValue('hokhma_author_profile', authorProfile); }, [authorProfile]);
  useEffect(() => { setStoredValue('hokhma_statement_of_faith', statementOfFaith); }, [statementOfFaith]);
  useEffect(() => { setStoredValue('hokhma_is_admin', isAdmin); }, [isAdmin]);
  useEffect(() => { setStoredValue('hokhma_progress', progress); }, [progress]);

  // Fetch all initial data from backend REST API with fallback to local state
  const refetchData = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const [
        fetchedArticles,
        fetchedTopics,
        fetchedQuestions,
        fetchedPaths,
        fetchedResources,
        fetchedSettings
      ] = await Promise.all([
        articlesService.getArticles({ all: isAdmin }).catch(() => null),
        topicsService.getTopics().catch(() => null),
        questionsService.getQuestions().catch(() => null),
        pathsService.getPaths().catch(() => null),
        resourcesService.getResources().catch(() => null),
        settingsService.getPublicSettings().catch(() => null)
      ]);

      if (fetchedArticles && fetchedArticles.length > 0) setArticles(fetchedArticles);
      if (fetchedTopics && fetchedTopics.length > 0) setTopics(fetchedTopics);
      if (fetchedQuestions && fetchedQuestions.length > 0) setQuestions(fetchedQuestions);
      if (fetchedPaths && fetchedPaths.length > 0) setPaths(fetchedPaths);
      if (fetchedResources && fetchedResources.length > 0) setResources(fetchedResources);
      if (fetchedSettings) {
        if (fetchedSettings.profile) setAuthorProfile(fetchedSettings.profile);
        if (fetchedSettings.faithStatements && fetchedSettings.faithStatements.length > 0) {
          setStatementOfFaith(fetchedSettings.faithStatements);
        }
      }

      // If authenticated as admin, fetch administrative queues
      if (isAdmin && token) {
        const [fetchedComments, fetchedMessages, fetchedSubmissions] = await Promise.all([
          commentsService.getAllComments().catch(() => null),
          contactService.getAllContactMessages().catch(() => null),
          submissionsService.getAllSubmissions().catch(() => null)
        ]);
        if (fetchedComments) setComments(fetchedComments);
        if (fetchedMessages) setContactMessages(fetchedMessages);
        if (fetchedSubmissions) setQuestionSubmissions(fetchedSubmissions);
      }
    } catch (err) {
      console.warn('[AppContext] API fetch failure, using local state:', (err as Error).message);
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial mount data load
  useEffect(() => {
    refetchData();
  }, [isAdmin, token]);

  // Authenticate admin and store token
  const loginAdmin = (newToken: string) => {
    localStorage.setItem('hokhma_token', newToken);
    localStorage.setItem('hokhma_is_admin', 'true');
    setToken(newToken);
    setIsAdmin(true);
  };

  // Sign out admin and clear credentials
  const logoutAdmin = () => {
    localStorage.removeItem('hokhma_token');
    localStorage.removeItem('hokhma_is_admin');
    setToken(null);
    setIsAdmin(false);
  };

  // Toggle learning path step completion progress
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

  // Add new article with optimistic update and API synchronization
  const addArticle = async (newArt: Article) => {
    setArticles((prev) => [newArt, ...prev]);
    setTopics((topicsPrev) =>
      topicsPrev.map((t) => {
        if (t.slug === newArt.topicSlug) {
          return { ...t, articleCount: t.articleCount + 1 };
        }
        return t;
      })
    );
    try {
      const created = await articlesService.createArticle(newArt);
      setArticles((prev) => prev.map((a) => (a.slug === newArt.slug ? created : a)));
    } catch (err) {
      console.error('[API Error] addArticle failed:', err);
    }
  };

  // Update article with optimistic update and API synchronization
  const updateArticle = async (updatedArt: Article) => {
    const oldArt = articles.find((a) => a.id === updatedArt.id);
    setArticles((prev) => prev.map((art) => (art.id === updatedArt.id ? updatedArt : art)));

    setPaths((prev) => prev.map((path) => {
      const withoutArticle = path.articleSlugs.filter((slug) => slug !== oldArt?.slug && slug !== updatedArt.slug);
      const isTargetPath = updatedArt.partInPath?.pathSlug === path.slug;
      const articleSlugs = isTargetPath
        ? [...withoutArticle.slice(0, Math.max(0, updatedArt.partInPath!.position - 1)), updatedArt.slug, ...withoutArticle.slice(Math.max(0, updatedArt.partInPath!.position - 1))]
        : withoutArticle;
      return { ...path, articleSlugs, articleCount: articleSlugs.length };
    }));
    
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

    try {
      await articlesService.updateArticle(updatedArt.id, updatedArt);
    } catch (err) {
      console.error('[API Error] updateArticle failed:', err);
    }
  };

  // Delete article with optimistic update and API synchronization
  const deleteArticle = async (id: string) => {
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
    try {
      await articlesService.deleteArticle(id);
    } catch (err) {
      console.error('[API Error] deleteArticle failed:', err);
    }
  };

  // Add topic with optimistic update and API synchronization
  const addTopic = async (newTopic: Topic) => {
    setTopics((prev) => [newTopic, ...prev]);
    try {
      await topicsService.createTopic(newTopic);
    } catch (err) {
      console.error('[API Error] addTopic failed:', err);
    }
  };

  // Update topic with optimistic update and API synchronization
  const updateTopic = async (updatedTopic: Topic) => {
    setTopics((prev) => prev.map((topic) => (topic.slug === updatedTopic.slug ? updatedTopic : topic)));
    try {
      await topicsService.updateTopic(updatedTopic.slug, updatedTopic);
    } catch (err) {
      console.error('[API Error] updateTopic failed:', err);
    }
  };

  // Delete topic with optimistic update and API synchronization
  const deleteTopic = async (slug: string) => {
    setTopics((prev) => prev.filter((topic) => topic.slug !== slug));
    try {
      await topicsService.deleteTopic(slug);
    } catch (err) {
      console.error('[API Error] deleteTopic failed:', err);
    }
  };

  // Add learning path with optimistic update and API synchronization
  const addPath = async (newPath: LearningPath) => {
    setPaths((prev) => [newPath, ...prev]);
    setArticles((prev) => prev.map((article) => {
      const position = newPath.articleSlugs.indexOf(article.slug);
      return position === -1
        ? article
        : { ...article, partInPath: { pathSlug: newPath.slug, position: position + 1 } };
    }));
    try {
      await pathsService.createPath(newPath);
    } catch (err) {
      console.error('[API Error] addPath failed:', err);
    }
  };

  // Update learning path with optimistic update and API synchronization
  const updatePath = async (updatedPath: LearningPath) => {
    setPaths((prev) => prev.map((path) => (path.slug === updatedPath.slug ? updatedPath : path)));
    setArticles((prev) => prev.map((article) => {
      const position = updatedPath.articleSlugs.indexOf(article.slug);
      if (position !== -1) {
        return { ...article, partInPath: { pathSlug: updatedPath.slug, position: position + 1 } };
      }
      if (article.partInPath?.pathSlug === updatedPath.slug) {
        const { partInPath: _partInPath, ...articleWithoutPath } = article;
        return articleWithoutPath;
      }
      return article;
    }));
    try {
      await pathsService.updatePath(updatedPath.slug, updatedPath);
    } catch (err) {
      console.error('[API Error] updatePath failed:', err);
    }
  };

  // Delete learning path with optimistic update and API synchronization
  const deletePath = async (slug: string) => {
    setPaths((prev) => prev.filter((path) => path.slug !== slug));
    try {
      await pathsService.deletePath(slug);
    } catch (err) {
      console.error('[API Error] deletePath failed:', err);
    }
  };

  // Add reference resource with optimistic update and API synchronization
  const addResource = async (newResource: Resource) => {
    setResources((prev) => [newResource, ...prev]);
    try {
      await resourcesService.createResource(newResource);
    } catch (err) {
      console.error('[API Error] addResource failed:', err);
    }
  };

  // Update reference resource with optimistic update and API synchronization
  const updateResource = async (updatedResource: Resource) => {
    setResources((prev) => prev.map((resource) => (resource.id === updatedResource.id ? updatedResource : resource)));
    try {
      await resourcesService.updateResource(updatedResource.id, updatedResource);
    } catch (err) {
      console.error('[API Error] updateResource failed:', err);
    }
  };

  // Delete reference resource with optimistic update and API synchronization
  const deleteResource = async (id: string) => {
    setResources((prev) => prev.filter((resource) => resource.id !== id));
    try {
      await resourcesService.deleteResource(id);
    } catch (err) {
      console.error('[API Error] deleteResource failed:', err);
    }
  };

  // Update author profile with optimistic update and API synchronization
  const updateAuthorProfile = async (profile: AuthorProfile) => {
    setAuthorProfile(profile);
    try {
      await settingsService.updateAuthorProfile(profile);
    } catch (err) {
      console.error('[API Error] updateAuthorProfile failed:', err);
    }
  };

  // Update statement of faith with optimistic update and API synchronization
  const updateStatementOfFaith = async (statements: FaithStatement[]) => {
    setStatementOfFaith(statements);
    try {
      await settingsService.updateFaithStatements(statements);
    } catch (err) {
      console.error('[API Error] updateStatementOfFaith failed:', err);
    }
  };

  // Submit reader comment with optimistic update and API synchronization
  const addComment = async (newComment: Comment) => {
    setComments((prev) => [newComment, ...prev]);
    try {
      await commentsService.submitComment(newComment);
    } catch (err) {
      console.error('[API Error] addComment failed:', err);
    }
  };

  // Approve comment with optimistic update and API synchronization
  const approveComment = async (commentId: string) => {
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, isApproved: true } : c))
    );
    try {
      await commentsService.approveComment(commentId);
    } catch (err) {
      console.error('[API Error] approveComment failed:', err);
    }
  };

  // Delete comment with optimistic update and API synchronization
  const deleteComment = async (commentId: string) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    try {
      await commentsService.deleteComment(commentId);
    } catch (err) {
      console.error('[API Error] deleteComment failed:', err);
    }
  };

  // Add theological question with optimistic update and API synchronization
  const addQuestion = async (newQ: Question) => {
    setQuestions((prev) => [newQ, ...prev]);
    try {
      await questionsService.createQuestion(newQ);
    } catch (err) {
      console.error('[API Error] addQuestion failed:', err);
    }
  };

  // Submit reader contact inquiry with optimistic update and API synchronization
  const addContactMessage = async (message: ContactMessage) => {
    setContactMessages((prev) => [message, ...prev]);
    try {
      await contactService.submitContactMessage(message);
    } catch (err) {
      console.error('[API Error] addContactMessage failed:', err);
    }
  };

  // Submit reader question or objection with optimistic update and API synchronization
  const addQuestionSubmission = async (submission: QuestionSubmission) => {
    setQuestionSubmissions((prev) => [submission, ...prev]);
    try {
      await submissionsService.submitQuestion(submission);
    } catch (err) {
      console.error('[API Error] addQuestionSubmission failed:', err);
    }
  };

  // Update submission review status with optimistic update and API synchronization
  const updateSubmissionStatus = async (id: string, status: 'pending' | 'reviewed') => {
    setQuestionSubmissions((prev) =>
      prev.map((sub) => (sub.id === id ? { ...sub, status } : sub))
    );
    try {
      await submissionsService.updateSubmissionStatus(id, status);
    } catch (err) {
      console.error('[API Error] updateSubmissionStatus failed:', err);
    }
  };

  // Delete contact inquiry with optimistic update and API synchronization
  const deleteContactMessage = async (id: string) => {
    setContactMessages((prev) => prev.filter((msg) => msg.id !== id));
    try {
      await contactService.deleteContactMessage(id);
    } catch (err) {
      console.error('[API Error] deleteContactMessage failed:', err);
    }
  };

  // Toggle reader reaction with optimistic local update and background API synchronization
  const toggleReaction = async (articleSlug: string, reaction: string, delta: number) => {
    setReactions((prev) => {
      const articleReactions: Record<string, number> = {
        helpful: 0,
        insightful: 0,
        rigorous: 0,
        ...(prev[articleSlug] || {})
      };
      articleReactions[reaction] = Math.max(0, (articleReactions[reaction] || 0) + delta);
      return { ...prev, [articleSlug]: articleReactions };
    });

    try {
      await articlesService.toggleArticleReaction(
        articleSlug,
        reaction as 'helpful' | 'insightful' | 'rigorous',
        delta === -1 ? -1 : 1
      );
    } catch (err) {
      console.error('[API Error] toggleReaction failed:', err);
    }
  };

  // Increment article view count locally
  const incrementArticleView = (articleId: string) => {
    setArticles((prev) => prev.map((article) => (
      article.id === articleId ? { ...article, views: (article.views || 0) + 1 } : article
    )));
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
        contactMessages,
        questionSubmissions,
        reactions,
        authorProfile,
        statementOfFaith,
        isAdmin,
        token,
        isLoading,
        error,
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
        addContactMessage,
        addQuestionSubmission,
        updateSubmissionStatus,
        deleteContactMessage,
        toggleReaction,
        incrementArticleView,
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
