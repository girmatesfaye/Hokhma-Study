import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
// Import lucide icons for navigation, mobile drawer and search loading
import { 
  Search, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  ShieldAlert, 
  BadgeInfo, 
  Globe, 
  Compass, 
  BookOpen, 
  HelpCircle, 
  Loader2,
  Route,
  ChevronRight
} from 'lucide-react';
// Import live search API service and return types
import { searchAll, SearchResults as ApiSearchResults } from '../services/search';

export default function Navbar() {
  const { currentRoute, navigateTo, darkMode, setDarkMode, isAdmin, articles, topics, questions } = useApp();
  const { language, setLanguage, t } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [localSearchVal, setLocalSearchVal] = useState('');
  // State for live backend search API response
  const [liveResults, setLiveResults] = useState<ApiSearchResults | null>(null);
  // State tracking ongoing debounce network request
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent background scrolling when mobile drawer or search overlay is open
  useEffect(() => {
    if (isDrawerOpen || isSearchOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen, isSearchOpen]);

  // Listen for Cmd+K or Ctrl+K to open search overlay, and Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      } else if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsDrawerOpen(false);
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

  // Debounce live backend search queries by 300ms
  useEffect(() => {
    const trimmed = localSearchVal.trim();
    if (!trimmed) {
      setLiveResults(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const debounceTimer = setTimeout(async () => {
      try {
        const results = await searchAll(trimmed);
        setLiveResults(results);
      } catch (err) {
        console.warn('Backend search fallback to client index:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [localSearchVal]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localSearchVal.trim()) {
      navigateTo(`/search?q=${encodeURIComponent(localSearchVal.trim())}`);
      setIsSearchOpen(false);
    }
  };

  // Instant local fallback for articles matching the active query
  const fallbackArticles = localSearchVal.trim()
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

  // Instant local fallback for questions matching the active query
  const fallbackQuestions = localSearchVal.trim()
    ? questions.filter(
        (q) =>
          q &&
          ((q.text && q.text.toLowerCase().includes(localSearchVal.toLowerCase())) ||
            (q.textAm && q.textAm.toLowerCase().includes(localSearchVal.toLowerCase())))
      )
    : [];

  // Instant local fallback for topics matching the active query
  const fallbackTopics = localSearchVal.trim()
    ? topics.filter(
        (t) =>
          t &&
          ((t.name && t.name.toLowerCase().includes(localSearchVal.toLowerCase())) ||
            (t.nameAm && t.nameAm.toLowerCase().includes(localSearchVal.toLowerCase())))
      )
    : [];

  // Use live API results when available or instant local fallback
  const displayedArticles = liveResults ? liveResults.articles : fallbackArticles;
  // Use live API question results when available or instant local fallback
  const displayedQuestions = liveResults ? liveResults.questions : fallbackQuestions;
  // Use live API topic results when available or instant local fallback
  const displayedTopics = liveResults ? liveResults.topics : fallbackTopics;

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
    { label: t('nav.topics'), hash: '/topics', page: 'topics', icon: <Compass size={19} /> },
    { label: t('nav.questions'), hash: '/questions', page: 'questions', icon: <HelpCircle size={19} /> },
    { label: t('nav.paths'), hash: '/paths', page: 'paths', icon: <Route size={19} /> },
    { label: t('nav.resources'), hash: '/resources', page: 'resources', icon: <BookOpen size={19} /> },
    { label: t('nav.about'), hash: '/about', page: 'about', icon: <BadgeInfo size={19} /> },
  ];

  return (
    <>
      <header
        id="main-nav-bar"
        className={`sticky top-0 z-50 w-full transition-[background-color,border-color,padding,box-shadow] duration-200 ease-out ${
          isScrolled
            ? 'bg-white/95 dark:bg-dark-card/95 backdrop-blur-md shadow-xs border-b border-black/10 dark:border-white/10 py-2.5 sm:py-3'
            : 'bg-offwhite/90 dark:bg-dark-bg/90 backdrop-blur-md border-b border-black/5 dark:border-white/5 py-3 sm:py-4'
        }`}
      >
        <div className="max-w-[1140px] mx-auto px-4 md:px-6 flex items-center justify-between">
          
          {/* LOGO */}
          <a
            id="nav-logo"
            href="#/"
            className="flex items-center gap-2 text-navy dark:text-white transition-opacity hover:opacity-90 touch-manipulation"
          >
            <img
              src="/assets/logo.jpg"
              alt="Hokhma Study logo"
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-full object-cover shadow-xs"
            />
            <span className="font-serif text-lg sm:text-xl font-bold tracking-tight">{t('brand.name')}</span>
            <span className="h-4 w-px bg-gold/50 hidden xs:inline-block" />
            <span className="font-sans text-[11px] tracking-wide text-gold font-semibold hidden sm:inline-block">
              {language === 'en' ? 'Apologetics' : 'መከላከያ'}
            </span>
          </a>

          {/* DESKTOP NAV LINKS - Stable indicator without height/width layout jumps */}
          <nav id="desktop-nav-menu" className="hidden lg:flex items-center gap-7 xl:gap-8">
            {navLinks.map((link) => {
              const active = isActive(link.page);
              return (
                <a
                  key={link.label}
                  id={`nav-link-${link.page}`}
                  href={`#${link.hash}`}
                  className={`relative text-[13px] font-medium tracking-wide py-1.5 transition-colors duration-150 ${
                    active
                      ? 'text-navy dark:text-gold font-semibold'
                      : 'text-mediumgrey dark:text-gray-300 hover:text-navy dark:hover:text-gold'
                  }`}
                >
                  <span>{link.label}</span>
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-navy dark:bg-gold rounded-full" />
                  )}
                </a>
              );
            })}
          </nav>

          {/* ACTION BUTTONS */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 md:gap-3">
            {/* SEARCH OVERLAY TRIGGER */}
            <button
              id="search-btn-trigger"
              onClick={() => setIsSearchOpen(true)}
              className="p-2 sm:p-2 text-nearblack/80 dark:text-white/80 hover:text-gold dark:hover:text-gold transition-colors flex items-center gap-1 cursor-pointer btn-press min-h-[40px] min-w-[40px] justify-center rounded-lg"
              title="Search Articles (Ctrl+K)"
              aria-label="Open Search (Ctrl+K)"
            >
              <Search size={19} />
            </button>

            {/* SLEEK COMPACT LANGUAGE SWITCHER */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'am' : 'en')}
              className="flex items-center justify-center h-8 px-2.5 text-[11px] font-bold tracking-wider rounded-full border border-black/10 dark:border-white/15 text-nearblack dark:text-white hover:text-gold dark:hover:text-gold hover:border-gold/30 dark:hover:border-gold/30 transition-colors bg-black/[0.03] dark:bg-white/[0.04] cursor-pointer font-sans btn-press touch-manipulation min-w-[44px]"
              title={language === 'en' ? 'Switch to Amharic / አማርኛ' : 'Switch to English / እንግሊዝኛ'}
              aria-label={language === 'en' ? 'Switch to Amharic' : 'Switch to English'}
            >
              <Globe size={11} className="text-gold mr-1" />
              <span>{language === 'en' ? 'AM' : 'EN'}</span>
            </button>

            {/* DARK MODE TOGGLE */}
            <button
              id="theme-toggle-btn"
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 text-nearblack/80 dark:text-white/80 hover:text-gold dark:hover:text-gold transition-colors cursor-pointer btn-press min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg"
              title={darkMode ? 'Light Theme' : 'Dark Theme'}
              aria-label={darkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            >
              {darkMode ? <Sun size={19} className="text-gold" /> : <Moon size={19} />}
            </button>

            {/* MOBILE DRAWER TOGGLE */}
            <button
              id="mobile-drawer-btn"
              onClick={() => setIsDrawerOpen(true)}
              aria-label="Open Navigation Menu"
              className="lg:hidden p-2 text-nearblack/85 dark:text-white/85 hover:text-gold dark:hover:text-gold transition-colors cursor-pointer btn-press min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE SHEET / DRAWER (Emil Kowalski Drawer Recipe + Safe Area Insets) */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          {/* Backdrop with quick fade */}
          <div
            className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs transition-opacity duration-200 animate-fade-in"
            onClick={() => setIsDrawerOpen(false)}
            aria-hidden="true"
          />
          
          {/* Drawer panel with cubic-bezier(0.32, 0.72, 0, 1) and dvh mobile height */}
          <div 
            role="dialog"
            aria-modal="true"
            aria-label="Navigation Menu"
            className="relative z-10 w-full max-w-[320px] sm:max-w-sm h-dvh max-h-dvh bg-white dark:bg-dark-bg flex flex-col animate-drawer-in overflow-hidden shadow-2xl border-l border-black/10 dark:border-white/10"
          >
            {/* Drawer Header with Logo & Quick Controls */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-black/5 dark:border-white/5 pt-[max(1rem,env(safe-area-inset-top))]">
              <a
                href="#/"
                onClick={() => setIsDrawerOpen(false)}
                className="flex items-center gap-2.5 text-navy dark:text-white btn-press"
              >
                <img
                  src="/assets/logo.jpg"
                  alt="Hokhma Study logo"
                  className="h-9 w-9 rounded-full object-cover shadow-xs"
                />
                <div className="flex flex-col">
                  <span className="font-serif text-lg font-bold tracking-tight leading-tight">{t('brand.name')}</span>
                  <span className="font-sans text-[10px] tracking-wider text-gold font-semibold">
                    {language === 'en' ? 'Apologetics' : 'መከላከያ'}
                  </span>
                </div>
              </a>

              <div className="flex items-center gap-1">
                {/* Mobile theme switch button */}
                <button
                  id="theme-toggle-btn-mobile"
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2 rounded-lg text-nearblack/80 dark:text-white/80 hover:text-gold hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer btn-press min-h-[40px] min-w-[40px] flex items-center justify-center"
                  title={darkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
                  aria-label="Toggle theme"
                >
                  {darkMode ? <Sun size={18} className="text-gold" /> : <Moon size={18} />}
                </button>

                {/* Close drawer button */}
                <button
                  id="close-drawer-btn"
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 rounded-lg text-nearblack/80 dark:text-white/80 hover:text-gold hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer btn-press min-h-[40px] min-w-[40px] flex items-center justify-center"
                  aria-label="Close Navigation Menu"
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            {/* Quick In-Drawer Search Bar */}
            <div className="p-3.5 border-b border-black/5 dark:border-white/5 bg-slate-50/60 dark:bg-slate-900/40">
              <button
                onClick={() => {
                  setIsDrawerOpen(false);
                  setIsSearchOpen(true);
                }}
                className="btn-press w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-slate-900 text-xs text-mediumgrey dark:text-gray-300 hover:border-gold/50 shadow-xs text-left cursor-pointer"
              >
                <span className="flex items-center gap-2.5">
                  <Search size={16} className="text-gold" />
                  <span className="font-sans">{t('nav.search') || (language === 'en' ? 'Search papers, topics...' : 'ጽሑፎችንና አርዕስቶችን ፈልግ...')}</span>
                </span>
                <span className="text-[10px] font-mono bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded text-lightgrey">⌘K</span>
              </button>
            </div>

            {/* Navigation Rows (Full touch target min-h-[48px], icon + title + chevron) */}
            <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-1.5 no-scrollbar">
              {navLinks.map((link) => {
                const active = isActive(link.page);
                return (
                  <a
                    key={link.label}
                    href={`#${link.hash}`}
                    onClick={() => setIsDrawerOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-3 rounded-xl transition-colors duration-150 min-h-[48px] touch-manipulation active:bg-gold/20 ${
                      active
                        ? 'bg-gold/15 dark:bg-gold/20 text-nearblack dark:text-white font-bold border border-gold/30 shadow-xs'
                        : 'text-mediumgrey dark:text-gray-200 hover:bg-black/4 dark:hover:bg-white/5 active:bg-black/8 hover:text-nearblack dark:hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className={active ? 'text-gold' : 'text-mediumgrey/70 dark:text-gray-400'}>
                        {link.icon}
                      </span>
                      <span className="text-base font-serif font-medium">{link.label}</span>
                    </span>
                    <ChevronRight size={16} className={active ? 'text-gold' : 'text-lightgrey/40'} />
                  </a>
                );
              })}

              {isAdmin && (
                <a
                  href="#/admin"
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex items-center justify-between px-3.5 py-3 rounded-xl text-gold bg-gold/10 border border-gold/25 mt-3 min-h-[48px] touch-manipulation active:bg-gold/20"
                >
                  <span className="flex items-center gap-3">
                    <ShieldAlert size={19} className="text-gold" />
                    <span className="text-base font-serif font-bold">Admin Workroom</span>
                  </span>
                  <ChevronRight size={16} className="text-gold" />
                </a>
              )}
            </div>

            {/* Mobile Drawer Bottom Information */}
            <div className="border-t border-black/5 dark:border-white/5 p-4 bg-slate-50/50 dark:bg-slate-900/30 pb-[max(1.2rem,env(safe-area-inset-bottom))] flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-lightgrey dark:text-gray-400 font-sans">{language === 'en' ? 'Language:' : 'ቋንቋ፦'}</span>
                <button
                  onClick={() => setLanguage(language === 'en' ? 'am' : 'en')}
                  className="btn-press inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white dark:bg-slate-800 border border-black/10 dark:border-white/10 text-nearblack dark:text-white hover:text-gold cursor-pointer"
                >
                  <Globe size={12} className="text-gold" />
                  <span>{language === 'en' ? 'English (Switch to አማርኛ)' : 'አማርኛ (Switch to EN)'}</span>
                </button>
              </div>
              <p className="text-[11px] text-mediumgrey dark:text-gray-400 font-serif text-center pt-1 leading-relaxed">
                {language === 'en' ? 'Apologetics · Academic defense of faith.' : 'የክርስትና መከላከያ · አካዳሚያዊ ጥናት።'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL SEARCH OVERLAY (Emil Kowalski Modal Recipe: scale 0.96 + opacity 0 -> 1) */}
      {isSearchOpen && (
        <div 
          className="fixed inset-0 z-[120] bg-slate-950/75 backdrop-blur-xs flex items-start justify-center p-3 sm:p-6 md:p-10 animate-fade-in"
          onClick={() => setIsSearchOpen(false)}
        >
          <div 
            className="bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden mt-6 sm:mt-12 md:mt-16 animate-scale-in max-h-[88dvh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header / Input Area */}
            <div className="p-3.5 sm:p-5 border-b border-black/5 dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/40">
              <div className="flex items-center gap-2.5 sm:gap-3 bg-slate-100 dark:bg-slate-800 border border-black/5 dark:border-white/5 rounded-full px-3.5 sm:px-4.5 py-2 sm:py-2.5 focus-within:ring-2 focus-within:ring-gold/40 focus-within:border-gold transition-all duration-200">
                {/* Search icon or live search spinning loader */}
                {isSearching ? (
                  <Loader2 className="animate-spin text-gold h-5 w-5 shrink-0" />
                ) : (
                  <Search className="text-gold h-5 w-5 shrink-0" />
                )}
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
                  placeholder={t('nav.search') || (language === 'en' ? "Search Papers, Objections, Topics..." : "ጽሑፎችንና ጥያቄዎችን ፈልግ...")}
                  className="w-full bg-transparent !border-none !ring-0 !outline-none text-base sm:text-sm md:text-base text-nearblack dark:text-white placeholder-mediumgrey/60 font-sans p-0! h-auto! min-w-0"
                  autoFocus
                />
                {localSearchVal.trim() !== '' && (
                  <button 
                    onClick={() => {
                      setLocalSearchVal('');
                      setLiveResults(null);
                    }}
                    className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-mediumgrey hover:text-nearblack dark:hover:text-white transition-colors cursor-pointer shrink-0"
                    title="Clear text"
                  >
                    <X size={15} />
                  </button>
                )}
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="sm:hidden p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-mediumgrey hover:text-nearblack dark:hover:text-white transition-colors cursor-pointer shrink-0 ml-1"
                  aria-label="Close search"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Results Area */}
            <div className="max-h-[60vh] overflow-y-auto p-4 md:p-6 space-y-6">
              {localSearchVal.trim() === '' ? (
                /* Recent / Suggested searches */
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-semibold tracking-wide text-mediumgrey/80 dark:text-gray-400 mb-2 font-sans">
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
                    <h4 className="text-xs font-semibold tracking-wide text-mediumgrey/80 dark:text-gray-400 mb-2 font-sans">
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
                /* Dynamic live and filtered results */
                <div className="space-y-4">
                  {/* Category: Papers / Articles */}
                  {displayedArticles.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold tracking-wide text-mediumgrey/80 dark:text-gray-400 mb-2 font-sans flex justify-between items-center">
                        <span>Papers & Articles</span>
                        <span className="font-mono text-[9px] bg-gold/10 text-gold dark:bg-gold/15 dark:text-gold border border-gold/10 dark:border-gold/20 px-2 py-0.5 rounded-full">{displayedArticles.length}</span>
                      </h4>
                      <div className="space-y-1.5">
                        {displayedArticles.slice(0, 4).map((art) => (
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
                  {displayedQuestions.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold tracking-wide text-mediumgrey/80 dark:text-gray-400 mb-2 font-sans flex justify-between items-center">
                        <span>Skeptical Objections</span>
                        <span className="font-mono text-[9px] bg-gold/10 text-gold dark:bg-gold/15 dark:text-gold border border-gold/10 dark:border-gold/20 px-2 py-0.5 rounded-full">{displayedQuestions.length}</span>
                      </h4>
                      <div className="space-y-1.5">
                        {displayedQuestions.slice(0, 3).map((q) => (
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
                  {displayedTopics.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold tracking-wide text-mediumgrey/80 dark:text-gray-400 mb-2 font-sans flex justify-between items-center">
                        <span>Topics</span>
                        <span className="font-mono text-[9px] bg-gold/10 text-gold dark:bg-gold/15 dark:text-gold border border-gold/10 dark:border-gold/20 px-2 py-0.5 rounded-full">{displayedTopics.length}</span>
                      </h4>
                      <div className="space-y-1.5">
                        {displayedTopics.slice(0, 3).map((t) => (
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

                  {displayedArticles.length === 0 && displayedQuestions.length === 0 && displayedTopics.length === 0 && (
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
              <span>Esc to Close</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
