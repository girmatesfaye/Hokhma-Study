/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { Search, Menu, X, Sun, Moon, ShieldAlert, BadgeInfo, Globe, Compass, BookOpen, HelpCircle } from 'lucide-react';

export default function Navbar() {
  const { currentRoute, navigateTo, darkMode, setDarkMode, isAdmin, articles, topics, questions } = useApp();
  const { language, setLanguage, t } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [localSearchVal, setLocalSearchVal] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Listen for Cmd+K or Ctrl+K to open search overlay
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close drawer/search on route change
  useEffect(() => {
    setIsDrawerOpen(false);
    setIsSearchOpen(false);
  }, [currentRoute]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localSearchVal.trim()) {
      navigateTo(`/search?q=${encodeURIComponent(localSearchVal.trim())}`);
      setIsSearchOpen(false);
    }
  };

  // Filter for live search overlay results
  const filteredArticles = localSearchVal.trim()
    ? articles.filter(
        (art) =>
          art &&
          art.isPublished &&
          ((art.title && art.title.toLowerCase().includes(localSearchVal.toLowerCase())) ||
            (art.titleAm && art.titleAm.toLowerCase().includes(localSearchVal.toLowerCase())) ||
            (art.excerpt && art.excerpt.toLowerCase().includes(localSearchVal.toLowerCase())) ||
            (art.excerptAm && art.excerptAm.toLowerCase().includes(localSearchVal.toLowerCase())) ||
            (Array.isArray(art.tags) && art.tags.some((t) => t && t.toLowerCase().includes(localSearchVal.toLowerCase()))))
      )
    : [];

  const filteredQuestions = localSearchVal.trim()
    ? questions.filter(
        (q) =>
          q &&
          ((q.text && q.text.toLowerCase().includes(localSearchVal.toLowerCase())) ||
            (q.textAm && q.textAm.toLowerCase().includes(localSearchVal.toLowerCase())))
      )
    : [];

  const filteredTopics = localSearchVal.trim()
    ? topics.filter(
        (t) =>
          t &&
          ((t.name && t.name.toLowerCase().includes(localSearchVal.toLowerCase())) ||
            (t.nameAm && t.nameAm.toLowerCase().includes(localSearchVal.toLowerCase())))
      )
    : [];

  const isActive = (pageName: string) => {
    const current = currentRoute.page;
    if (pageName === 'home' && current === 'home') return true;
    if (pageName === 'topics' && (current === 'topics' || current === 'topic-detail')) return true;
    if (pageName === 'questions' && current === 'questions') return true;
    if (pageName === 'paths' && (current === 'paths' || current === 'path-detail')) return true;
    if (pageName === 'about' && current === 'about') return true;
    if (pageName === 'resources' && current === 'resources') return true;
    return false;
  };

  const navLinks = [
    { label: t('nav.topics'), hash: '/topics', page: 'topics' },
    { label: t('nav.questions'), hash: '/questions', page: 'questions' },
    { label: t('nav.paths'), hash: '/paths', page: 'paths' },
    { label: t('nav.resources'), hash: '/resources', page: 'resources' },
    { label: t('nav.about'), hash: '/about', page: 'about' },
  ];

  return (
    <>
      <header
        id="main-nav-bar"
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-white/90 dark:bg-dark-card/90 backdrop-blur-sm shadow-sm border-b border-black/10 dark:border-white/10 py-3'
            : 'bg-offwhite/85 dark:bg-dark-bg/85 backdrop-blur-sm border-b border-black/5 dark:border-white/5 py-4'
        }`}
      >
        <div className="max-w-[1140px] mx-auto px-4 md:px-6 flex items-center justify-between">
          
          {/* LOGO */}
          <a
            id="nav-logo"
            href="#/"
            className="flex items-center gap-2 text-navy dark:text-white transition-opacity hover:opacity-90 animate-fade-in"
          >
            <img
              src="/assets/logo.jpg"
              alt="Hokhma Study logo"
              className="h-10 w-10 rounded-full object-cover"
            />
            <span className="font-serif text-xl font-bold tracking-tight">{t('brand.name')}</span>
            <span className="h-4 w-px bg-gold/50" />
            <span className="font-sans text-[11px] tracking-widest text-gold font-semibold hidden sm:inline-block">
              {language === 'en' ? 'Apologetics' : 'መከላከያ'}
            </span>
          </a>

          {/* DESKTOP NAV LINKS */}
          <nav id="desktop-nav-menu" className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
               <a
                key={link.label}
                 id={`nav-link-${link.page}`}
                 href={`#${link.hash}`}
                className={`text-[13px] font-medium tracking-wide transition-colors duration-200 ${
                  isActive(link.page)
                    ? 'text-navy dark:text-gold border-b-2 border-navy dark:border-gold pb-1 font-semibold'
                     : 'text-mediumgrey dark:text-gray-300 hover:text-navy dark:hover:text-gold'
                 }`}
               >
                 {link.label}
               </a>
            ))}
          </nav>

          {/* ACTION BUTTONS */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* SEARCH OVERLAY TRIGGER */}
            <button
              id="search-btn-trigger"
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-nearblack/80 dark:text-white/80 hover:text-gold dark:hover:text-gold transition-colors flex items-center gap-1 cursor-pointer"
              title="Search Articles (Ctrl+K)"
            >
              <Search size={18} />
            </button>

            {/* SLEEK COMPACT LANGUAGE SWITCHER */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'am' : 'en')}
              className="flex items-center justify-center h-8 px-2.5 text-[11px] font-bold tracking-wider rounded-full border border-black/10 dark:border-white/15 text-nearblack dark:text-white hover:text-gold dark:hover:text-gold hover:border-gold/30 dark:hover:border-gold/30 transition-all bg-black/[0.03] dark:bg-white/[0.04] cursor-pointer font-sans"
              title={language === 'en' ? 'Switch to Amharic / አማርኛ' : 'Switch to English / እንግሊዝኛ'}
            >
              <Globe size={11} className="text-gold mr-1" />
              <span>{language === 'en' ? 'AM' : 'EN'}</span>
            </button>

            {/* DARK MODE TOGGLE */}
            <button
              id="theme-toggle-btn"
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 text-nearblack/80 dark:text-white/80 hover:text-gold dark:hover:text-gold transition-colors cursor-pointer"
              title={darkMode ? 'Light Theme' : 'Dark Theme'}
            >
              {darkMode ? <Sun size={18} className="text-gold" /> : <Moon size={18} />}
            </button>

            {/* MOBILE DRAWER TOGGLE */}
            <button
              id="mobile-drawer-btn"
              onClick={() => setIsDrawerOpen(true)}
              className="lg:hidden p-2 text-nearblack/85 dark:text-white/85 hover:text-gold dark:hover:text-gold transition-colors cursor-pointer"
            >
              <Menu size={21} />
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE FULL-SCREEN DRAWER */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-[100] bg-white dark:bg-dark-bg flex flex-col p-6 animate-fade-in overflow-y-auto">
          <div className="flex items-center justify-between col-span-2">
            <span className="font-serif text-xl font-bold tracking-tight text-navy dark:text-white flex items-center gap-2">
              <img
                src="/assets/logo.jpg"
                alt="Hokhma Study logo"
                className="h-9 w-9 rounded-full object-cover"
              />
              {t('brand.name')}
            </span>
            <div className="flex items-center gap-2">
              {/* Mobile language switch button */}
              <button
                onClick={() => setLanguage(language === 'en' ? 'am' : 'en')}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold border border-black/10 dark:border-white/10 rounded-full bg-slate-100 dark:bg-slate-800 text-nearblack dark:text-white cursor-pointer"
              >
                <Globe size={11} className="text-gold" />
                <span>{language === 'en' ? 'AM' : 'EN'}</span>
              </button>

              {/* Mobile theme switch button */}
              <button
                id="theme-toggle-btn-mobile"
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 text-nearblack/80 dark:text-white/80 hover:text-gold dark:hover:text-gold transition-colors cursor-pointer"
                title={darkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              >
                {darkMode ? <Sun size={20} className="text-gold" /> : <Moon size={20} />}
              </button>
              <button
                id="close-drawer-btn"
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 text-nearblack/80 dark:text-white/80 hover:text-gold transition-colors cursor-pointer"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-start items-center gap-7 py-12">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={`#${link.hash}`}
                onClick={() => setIsDrawerOpen(false)}
                className={`text-xl font-serif tracking-wide transition-colors duration-200 ${
                  isActive(link.page)
                    ? 'text-gold font-bold scale-105'
                    : 'text-nearblack/80 dark:text-gray-200 hover:text-gold'
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="border-t border-black/5 dark:border-white/5 pt-6 flex flex-col gap-4 text-center items-center">
            <p className="text-xs text-mediumgrey dark:text-gray-400 font-sans">
              {t('brand.name')} {language === 'en' ? 'Apologetics · Pure academic defense.' : 'የክርስትና መከላከያ · አካዳሚያዊ ጥናት።'}
            </p>
          </div>
        </div>
      )}

      {/* GORGEOUS MODAL SEARCH OVERLAY */}
      {isSearchOpen && (
        <div 
          className="fixed inset-0 z-[120] bg-slate-950/80 backdrop-blur-md flex items-start justify-center p-4 md:p-10 animate-fade-in"
          onClick={() => setIsSearchOpen(false)}
        >
          <div 
            className="bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden mt-10 md:mt-16 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header / Input Area */}
            <div className="p-4 md:p-6 border-b border-black/5 dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/40">
              <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 border border-black/5 dark:border-white/5 rounded-full px-4.5 py-2.5 focus-within:ring-2 focus-within:ring-gold/40 focus-within:border-gold transition-all duration-200">
                <Search className="text-gold h-5 w-5 shrink-0" />
                <input
                  type="text"
                  value={localSearchVal}
                  onChange={(e) => setLocalSearchVal(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearchSubmit(e);
                    } else if (e.key === 'Escape') {
                      setIsSearchOpen(false);
                    }
                  }}
                  placeholder={t('nav.search') || "Search papers, objections, topics..."}
                  className="w-full bg-transparent !border-none !ring-0 !outline-none text-sm md:text-base text-nearblack dark:text-white placeholder-mediumgrey/60 font-sans p-0! h-auto! min-w-0"
                  autoFocus
                />
                {localSearchVal.trim() !== '' && (
                  <button 
                    onClick={() => setLocalSearchVal('')}
                    className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-mediumgrey hover:text-nearblack dark:hover:text-white transition-colors cursor-pointer shrink-0"
                    title="Clear text"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Results Area */}
            <div className="max-h-[60vh] overflow-y-auto p-4 md:p-6 space-y-6">
              {localSearchVal.trim() === '' ? (
                /* Recent / Suggested searches */
                <div className="space-y-4">
                  <div>
                    <h4 className="text-[10px] uppercase tracking-wider font-bold text-mediumgrey/80 dark:text-gray-400 mb-2 font-sans">
                      Suggested Apologetics Topics
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {topics.map((t) => (
                        <button
                          key={t.slug}
                          onClick={() => {
                            navigateTo(`/topics/${t.slug}`);
                            setIsSearchOpen(false);
                          }}
                          className="px-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 hover:bg-gold/10 hover:text-gold rounded-full text-nearblack dark:text-gray-200 transition-colors cursor-pointer font-sans"
                        >
                          {language === 'en' ? t.name : t.nameAm}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[10px] uppercase tracking-wider font-bold text-mediumgrey/80 dark:text-gray-400 mb-2 font-sans">
                      Common Objections
                    </h4>
                    <div className="space-y-2">
                      {questions.slice(0, 3).map((q) => (
                        <button
                          key={q.id}
                          onClick={() => {
                            navigateTo(`/articles/${q.articleSlug}`);
                            setIsSearchOpen(false);
                          }}
                          className="w-full text-left p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-xs text-nearblack dark:text-gray-300 flex items-center gap-2 transition-colors border border-transparent hover:border-black/5 dark:hover:border-white/5 cursor-pointer font-sans"
                        >
                          <HelpCircle size={13} className="text-gold shrink-0" />
                          <span className="truncate">{q.text}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Dynamic filtered results */
                <div className="space-y-4">
                  {/* Category: Papers / Articles */}
                  {filteredArticles.length > 0 && (
                    <div>
                      <h4 className="text-[10px] uppercase tracking-wider font-bold text-mediumgrey/80 dark:text-gray-400 mb-2 font-sans flex justify-between items-center">
                        <span>Papers & Articles</span>
                        <span className="font-mono text-[9px] bg-gold/10 text-gold dark:bg-gold/15 dark:text-gold border border-gold/10 dark:border-gold/20 px-2 py-0.5 rounded-full">{filteredArticles.length}</span>
                      </h4>
                      <div className="space-y-1.5">
                        {filteredArticles.slice(0, 4).map((art) => (
                          <button
                            key={art.id}
                            onClick={() => {
                              navigateTo(`/articles/${art.slug}`);
                              setIsSearchOpen(false);
                            }}
                            className="w-full text-left p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-nearblack dark:text-gray-200 transition-colors border border-transparent hover:border-black/5 dark:hover:border-white/5 flex flex-col gap-0.5 cursor-pointer font-sans"
                          >
                            <span className="font-serif text-sm font-semibold text-navy dark:text-gold">{language === 'en' ? art.title : art.titleAm}</span>
                            <span className="text-[11px] text-mediumgrey line-clamp-1">{language === 'en' ? art.excerpt : art.excerptAm}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Category: Objections */}
                  {filteredQuestions.length > 0 && (
                    <div>
                      <h4 className="text-[10px] uppercase tracking-wider font-bold text-mediumgrey/80 dark:text-gray-400 mb-2 font-sans flex justify-between items-center">
                        <span>Skeptical Objections</span>
                        <span className="font-mono text-[9px] bg-gold/10 text-gold dark:bg-gold/15 dark:text-gold border border-gold/10 dark:border-gold/20 px-2 py-0.5 rounded-full">{filteredQuestions.length}</span>
                      </h4>
                      <div className="space-y-1.5">
                        {filteredQuestions.slice(0, 3).map((q) => (
                          <button
                            key={q.id}
                            onClick={() => {
                              navigateTo(`/articles/${q.articleSlug}`);
                              setIsSearchOpen(false);
                            }}
                            className="w-full text-left p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-nearblack dark:text-gray-200 transition-colors border border-transparent hover:border-black/5 dark:hover:border-white/5 flex items-center gap-2.5 cursor-pointer font-sans"
                          >
                            <HelpCircle size={14} className="text-gold shrink-0" />
                            <span className="text-xs font-medium">{q.text}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Category: Topics */}
                  {filteredTopics.length > 0 && (
                    <div>
                      <h4 className="text-[10px] uppercase tracking-wider font-bold text-mediumgrey/80 dark:text-gray-400 mb-2 font-sans flex justify-between items-center">
                        <span>Topics</span>
                        <span className="font-mono text-[9px] bg-gold/10 text-gold dark:bg-gold/15 dark:text-gold border border-gold/10 dark:border-gold/20 px-2 py-0.5 rounded-full">{filteredTopics.length}</span>
                      </h4>
                      <div className="space-y-1.5">
                        {filteredTopics.slice(0, 3).map((t) => (
                          <button
                            key={t.slug}
                            onClick={() => {
                              navigateTo(`/topics/${t.slug}`);
                              setIsSearchOpen(false);
                            }}
                            className="w-full text-left p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-nearblack dark:text-gray-200 transition-colors border border-transparent hover:border-black/5 dark:hover:border-white/5 flex items-center gap-2.5 cursor-pointer font-sans"
                          >
                            <Compass size={14} className="text-gold shrink-0" />
                            <span className="text-xs font-medium">{language === 'en' ? t.name : t.nameAm}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {filteredArticles.length === 0 && filteredQuestions.length === 0 && filteredTopics.length === 0 && (
                    <div className="text-center py-8 text-mediumgrey font-sans">
                      No results found for "<strong>{localSearchVal}</strong>". Press Enter to search on the main results page.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer containing quick helper */}
            <div className="p-3 bg-slate-50 dark:bg-slate-950/40 border-t border-black/5 dark:border-white/5 text-[10px] text-mediumgrey flex justify-between items-center font-mono">
              <span>Press <kbd className="bg-white dark:bg-slate-800 px-1 border border-black/10 dark:border-white/10 rounded">Enter</kbd> to view full library search results</span>
              <span>ESC to close</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
