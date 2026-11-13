/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Public Pages
import Home from './pages/Home';
import Topics from './pages/Topics';
import TopicDetail from './pages/TopicDetail';
import QuestionsIndex from './pages/QuestionsIndex';
import PathsIndex from './pages/PathsIndex';
import PathDetail from './pages/PathDetail';
import ArticleDetail from './pages/ArticleDetail';
import TagDetail from './pages/TagDetail';
import About from './pages/About';
import Resources from './pages/Resources';
import SearchResults from './pages/SearchResults';

// Admin Pages
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ArticleEditor from './pages/ArticleEditor';
// Import anonymous analytics tracker hook
import { useAnalyticsTracker } from './hooks/useAnalyticsTracker';

// Shown while the first load runs, or with a retry button if the server cannot be reached.
function StartupScreen() {
  const { error, refetchData } = useApp();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center bg-offwhite dark:bg-dark-bg text-navy dark:text-gray-100">
      {error ? (
        <>
          <p role="alert" className="max-w-md text-sm">The Server Could Not Be Reached. {error}</p>
          <button
            onClick={refetchData}
            className="px-4 py-2 rounded-lg bg-gold text-white text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
          >
            Try Again
          </button>
        </>
      ) : (
        <p className="text-sm text-mediumgrey">Loading…</p>
      )}
    </div>
  );
}

// Dismissible banner so failed saves and submissions are never silent.
function ErrorBanner() {
  const { error, clearError } = useApp();
  if (!error) return null;
  return (
    <div role="alert" className="fixed bottom-4 left-1/2 -translate-x-1/2 z-60 flex max-w-[90vw] items-center gap-3 rounded-lg bg-rose-600 px-4 py-3 text-sm text-white shadow-lg">
      <span>{error}</span>
      <button onClick={clearError} className="font-semibold underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70">
        Dismiss
      </button>
    </div>
  );
}

function MainAppRouter() {
  const { currentRoute, hasLoaded } = useApp();
  // Activate anonymous route-change tracking across public pages
  useAnalyticsTracker();

  // Scroll to top on route change to prevent showing a blank/white section when transitioning from tall pages
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentRoute.page, currentRoute.slug, currentRoute.id]);

  if (!hasLoaded) {
    return <StartupScreen />;
  }

  // Determine current page component
  let pageComponent = <Home />;
  const page = currentRoute.page;

  if (page === 'home') {
    pageComponent = <Home />;
  } else if (page === 'topics') {
    pageComponent = <Topics />;
  } else if (page === 'topic-detail') {
    pageComponent = <TopicDetail />;
  } else if (page === 'questions') {
    pageComponent = <QuestionsIndex />;
  } else if (page === 'paths') {
    pageComponent = <PathsIndex />;
  } else if (page === 'path-detail') {
    pageComponent = <PathDetail />;
  } else if (page === 'article-detail') {
    pageComponent = <ArticleDetail />;
  } else if (page === 'tag-detail') {
    pageComponent = <TagDetail />;
  } else if (page === 'about') {
    pageComponent = <About />;
  } else if (page === 'resources') {
    pageComponent = <Resources />;
  } else if (page === 'search') {
    pageComponent = <SearchResults />;
  } else if (page === 'admin-login') {
    pageComponent = <AdminLogin />;
  } else if (page === 'admin-dashboard') {
    pageComponent = <AdminDashboard />;
  } else if (page === 'article-editor') {
    pageComponent = <ArticleEditor />;
  }

  // Determine if we should render public layout (with Global Sticky Navbar & Footer)
  // Admin Login and Editor should be full-viewport distraction-free native screens
  const isMinimalLayout =
    page === 'admin-login' || page === 'article-editor';

  if (isMinimalLayout) {
    return (
      <main key={currentRoute.path || currentRoute.page} id="distraction-free-viewport" className="min-h-screen bg-slate-50 dark:bg-slate-950 text-nearblack dark:text-white relative animate-fade-in">
        {pageComponent}
      </main>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-offwhite dark:bg-dark-bg text-navy dark:text-gray-100 transition-colors duration-200">
      
      {/* Global Sticky Header */}
      <Navbar />

      {/* Main Viewport Grid Wrapper */}
      <main key={currentRoute.path || currentRoute.page} className="flex-grow animate-fade-in">
        {pageComponent}
      </main>

      {/* Global Editorial Footer */}
      <Footer />

    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <LanguageProvider>
        <MainAppRouter />
        <ErrorBanner />
      </LanguageProvider>
    </AppProvider>
  );
}
