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

function MainAppRouter() {
  const { currentRoute } = useApp();

  // Scroll to top on route change to prevent showing a blank/white section when transitioning from tall pages
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentRoute]);

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
      <main id="distraction-free-viewport" className="min-h-screen bg-slate-50 dark:bg-slate-950 text-nearblack dark:text-white relative">
        {pageComponent}
      </main>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-offwhite dark:bg-dark-bg text-navy dark:text-gray-100 transition-colors duration-200">
      
      {/* Global Sticky Header */}
      <Navbar />

      {/* Main Viewport Grid Wrapper */}
      <main className="flex-grow pt-16">
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
      </LanguageProvider>
    </AppProvider>
  );
}
