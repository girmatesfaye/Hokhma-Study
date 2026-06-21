/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Search, Menu, X, Sun, Moon, ShieldAlert, BadgeInfo } from 'lucide-react';

export default function Navbar() {
  const { currentRoute, navigateTo, darkMode, setDarkMode, isAdmin } = useApp();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [localSearchVal, setLocalSearchVal] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close drawer on route change
  useEffect(() => {
    setIsDrawerOpen(false);
    setShowSearchInput(false);
  }, [currentRoute]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localSearchVal.trim()) {
      navigateTo(`/search?q=${encodeURIComponent(localSearchVal.trim())}`);
      setShowSearchInput(false);
      setLocalSearchVal('');
    }
  };

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
    { label: 'Topics', hash: '/topics', page: 'topics' },
    { label: 'Questions', hash: '/questions', page: 'questions' },
    { label: 'Paths', hash: '/paths', page: 'paths' },
    { label: 'Resources', hash: '/resources', page: 'resources' },
    { label: 'About', hash: '/about', page: 'about' },
  ];

  const handleNewsletterClick = () => {
    const footerInput = document.getElementById('newsletter-email-footer');
    if (footerInput) {
      footerInput.scrollIntoView({ behavior: 'smooth' });
      footerInput.focus();
    } else {
      navigateTo('/about'); // fallback
    }
  };

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
            className="flex items-center gap-2 text-navy dark:text-white transition-opacity hover:opacity-90"
          >
            <span className="font-serif text-2xl font-bold tracking-tight">Hokhma Study</span>
            <span className="h-4 w-px bg-gold/50" />
            <span className="font-sans text-[11px] tracking-widest text-gold font-semibold hidden sm:inline-block">
              Apologetics
            </span>
          </a>

          {/* DESKTOP NAV LINKS */}
          <nav id="desktop-nav-menu" className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
               <a
                key={link.label}
                 id={`nav-link-${link.page}`}
                 href={`#${link.hash}`}
                className={`text-[13px] font-medium tracking-wide transition-colors duration-200 capitalize ${
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
          <div className="flex items-center gap-3.5">
            {/* SEARCH EXPANDABLE */}
            {showSearchInput ? (
              <form onSubmit={handleSearchSubmit} className="relative flex items-center animate-fade-in">
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={localSearchVal}
                  onChange={(e) => setLocalSearchVal(e.target.value)}
                  className="w-48 bg-white dark:bg-slate-800 text-sm py-1.5 pl-3 pr-8 rounded-[4px] border border-black/10 dark:border-white/10 focus:outline-none focus:border-gold text-nearblack dark:text-white"
                  autoFocus
                />
                <button type="submit" className="absolute right-2 px-1 text-nearblack/60 dark:text-white/60 hover:text-gold">
                  <Search size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => setShowSearchInput(false)}
                  className="ml-1 text-nearblack/40 dark:text-white/40 hover:text-red-500 rounded-full"
                >
                  <X size={15} />
                </button>
              </form>
            ) : (
              <button
                id="search-btn-trigger"
                onClick={() => setShowSearchInput(true)}
                className="p-2 text-nearblack/80 dark:text-white/80 hover:text-gold dark:hover:text-gold transition-colors"
                title="Search Articles"
              >
                <Search size={19} />
              </button>
            )}

            {/* DARK MODE TOGGLE */}
            <button
              id="theme-toggle-btn"
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 text-nearblack/80 dark:text-white/80 hover:text-gold dark:hover:text-gold transition-colors"
              title={darkMode ? 'Light Theme' : 'Dark Theme'}
            >
              {darkMode ? <Sun size={19} /> : <Moon size={19} />}
            </button>

            {/* ADMIN ICON (if logged in) */}
            {isAdmin && (
              <a
                id="header-admin-indicator"
                href="#/admin"
                className="flex items-center gap-1.5 px-2 py-1 rounded-[4px] bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200/50 dark:border-red-900/40 text-xs font-semibold"
                title="Admin Dashboard (Active Session)"
              >
                <ShieldAlert size={14} />
                <span className="hidden sm:inline">Admin</span>
              </a>
            )}

            {/* NEWSLETTER CTA BUTTON */}
            <button
              id="newsletter-header-cta"
              onClick={handleNewsletterClick}
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-[13px] font-semibold tracking-wider bg-navy text-white hover:bg-navy/90 dark:bg-gold dark:text-slate-950 dark:hover:bg-gold/90 rounded-[4px] transition-colors"
            >
              Subscribe
            </button>

            {/* MOBILE DRAWER TOGGLE */}
            <button
              id="mobile-drawer-btn"
              onClick={() => setIsDrawerOpen(true)}
              className="md:hidden p-2 text-nearblack/85 dark:text-white/85 hover:text-gold dark:hover:text-gold transition-colors"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE FULL-SCREEN DRAWER */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-[100] bg-white dark:bg-dark-bg flex flex-col p-6 animate-fade-in overflow-hidden">
          <div className="flex items-center justify-between col-span-2">
            <span className="font-serif text-2xl font-bold tracking-tight text-navy dark:text-white flex items-center gap-1">Hokhma Study</span>
            <div className="flex items-center gap-3">
              {/* Mobile theme switch button */}
              <button
                id="theme-toggle-btn-mobile"
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 text-nearblack/80 dark:text-white/80 hover:text-gold dark:hover:text-gold transition-colors"
                title={darkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              >
                {darkMode ? <Sun size={22} className="text-gold" /> : <Moon size={22} />}
              </button>
              <button
                id="close-drawer-btn"
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 text-nearblack/80 dark:text-white/80 hover:text-gold transition-colors"
              >
                <X size={26} />
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center items-center gap-8 py-10">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={`#${link.hash}`}
                onClick={() => setIsDrawerOpen(false)}
                className={`text-2xl font-serif tracking-wide transition-colors duration-200 ${
                  isActive(link.page)
                    ? 'text-gold font-bold scale-105'
                    : 'text-nearblack/80 dark:text-gray-200 hover:text-gold'
                }`}
              >
                {link.label}
              </a>
            ))}
            
            {isAdmin && (
              <a
                href="#/admin"
                onClick={() => setIsDrawerOpen(false)}
                className="flex items-center gap-1.5 px-4 py-2 rounded bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 text-sm font-semibold mt-4"
              >
                <ShieldAlert size={16} />
                Author Panel
              </a>
            )}
          </div>

          <div className="border-t border-black/5 dark:border-white/5 pt-6 flex flex-col gap-4 text-center items-center">
            <button
              onClick={() => {
                setIsDrawerOpen(false);
                handleNewsletterClick();
              }}
              className="w-full py-3 text-center text-sm font-bold tracking-wider bg-navy text-white dark:bg-gold dark:text-slate-950 rounded-md shadow-sm"
            >
              Get Article Updates
            </button>
            <p className="text-xs text-mediumgrey dark:text-gray-400 font-sans">
              Hokhma Study Apologetics · Pure academic defense.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
