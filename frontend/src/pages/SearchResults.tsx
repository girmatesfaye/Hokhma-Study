/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
// Import UI badges and type definitions
import DifficultyBadge from '../components/DifficultyBadge';
import { Difficulty } from '../types';
// Import lucide icons for navigation and visual cues
import { Search, ChevronRight, HelpCircle, BookOpen, Clock, Compass, Loader2 } from 'lucide-react';
// Import backend search service API
import { searchAll, SearchResults as ApiSearchResults } from '../services/search';

export default function SearchResults() {
  const { currentRoute, articles, topics, questions, navigateTo } = useApp();
  const { language } = useLanguage();

  // Extract initial query from route slug
  const queryFromUrl = currentRoute.slug || '';
  const [localQuery, setLocalQuery] = useState(queryFromUrl);
  // Active difficulty filter state
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | 'all'>('all');
  // Active tab state for filtering result entities
  const [activeTab, setActiveTab] = useState<'all' | 'articles' | 'questions' | 'topics'>('all');
  // Loading indicator state during API query execution
  const [isLoading, setIsLoading] = useState(false);
  // Storage for backend API search response
  const [apiResults, setApiResults] = useState<ApiSearchResults | null>(null);

  // Fetch search results from backend API with fallback to local context
  const executeSearch = useCallback(async (q: string, difficulty: Difficulty | 'all') => {
    if (!q.trim()) {
      setApiResults(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const data = await searchAll(q.trim(), difficulty);
      setApiResults(data);
    } catch (err) {
      console.warn('Backend search failed, falling back to local dataset:', err);
      // Fallback search across local articles
      const qLower = q.toLowerCase();
      const matchedArticles = articles.filter((art) => {
        if (!art.isPublished) return false;
        const matchesDiff = difficulty === 'all' || art.difficulty === difficulty;
        const matchesText =
          art.title.toLowerCase().includes(qLower) ||
          (art.titleAm && art.titleAm.toLowerCase().includes(qLower)) ||
          art.excerpt.toLowerCase().includes(qLower) ||
          (art.excerptAm && art.excerptAm.toLowerCase().includes(qLower)) ||
          art.tags.some((t) => t.toLowerCase().includes(qLower));
        return matchesDiff && matchesText;
      });
      // Fallback search across local questions
      const matchedQuestions = questions.filter((item) => {
        const matchesDiff = difficulty === 'all' || item.difficulty === difficulty;
        const matchesText =
          item.text.toLowerCase().includes(qLower) ||
          (item.textAm && item.textAm.toLowerCase().includes(qLower)) ||
          item.tags.some((t) => t.toLowerCase().includes(qLower));
        return matchesDiff && matchesText;
      });
      // Fallback search across local topics
      const matchedTopics = topics.filter((t) =>
        t.name.toLowerCase().includes(qLower) ||
        (t.nameAm && t.nameAm.toLowerCase().includes(qLower)) ||
        t.description.toLowerCase().includes(qLower)
      );
      setApiResults({ articles: matchedArticles, questions: matchedQuestions, topics: matchedTopics });
    } finally {
      setIsLoading(false);
    }
  }, [articles, questions, topics]);

  // Synchronize search results when route query or difficulty changes
  useEffect(() => {
    const q = currentRoute.slug || '';
    setLocalQuery(q);
    executeSearch(q, difficultyFilter);
  }, [currentRoute.slug, difficultyFilter, executeSearch]);

  // Handle search form submission
  const handleLocalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localQuery.trim()) {
      navigateTo(`/search?q=${encodeURIComponent(localQuery.trim())}`);
    }
  };

  // Filtered articles list based on active difficulty
  const displayedArticles = (apiResults ? apiResults.articles : []).filter((art) =>
    difficultyFilter === 'all' || art.difficulty === difficultyFilter
  );

  // Filtered questions list based on active difficulty
  const displayedQuestions = (apiResults ? apiResults.questions : []).filter((q) =>
    difficultyFilter === 'all' || q.difficulty === difficultyFilter
  );

  // Filtered topics list
  const displayedTopics = apiResults ? apiResults.topics : [];

  // Total matched findings count across all categories
  const totalFindings = displayedArticles.length + displayedQuestions.length + displayedTopics.length;

  // Available difficulty levels with Title Case labels
  const difficulties: { label: string; value: Difficulty | 'all' }[] = [
    { label: 'All Depths', value: 'all' },
    { label: 'Beginner', value: 'beginner' },
    { label: 'Intermediate', value: 'intermediate' },
    { label: 'Deep Dive', value: 'deep-dive' },
  ];

  // Tab definitions with count badges
  const tabs: { id: 'all' | 'articles' | 'questions' | 'topics'; label: string; count: number }[] = [
    { id: 'all', label: 'All Results', count: totalFindings },
    { id: 'articles', label: 'Articles', count: displayedArticles.length },
    { id: 'questions', label: 'Questions', count: displayedQuestions.length },
    { id: 'topics', label: 'Topics', count: displayedTopics.length },
  ];

  // Utility to highlight keyword in a text block
  const highlightKeyword = (text: string, keyword: string) => {
    if (!keyword.trim()) return <span>{text}</span>;
    const regex = new RegExp(`(${keyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return (
      <span>
        {parts.map((part, i) =>
          regex.test(part) ? (
            <mark key={i} className="bg-gold/20 text-nearblack dark:text-gold px-1 rounded font-semibold font-serif">
              {part}
            </mark>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </span>
    );
  };

  return (
    <div id="search-results-page" className="animate-fade-in max-w-[1140px] mx-auto px-4 md:px-6 py-10 space-y-8">
      {/* Search Input Bar with Title Case typography */}
      <form onSubmit={handleLocalSubmit} className="max-w-2xl mx-auto relative space-y-3">
        <label className="text-xs font-semibold tracking-wide text-mediumgrey block text-center font-sans">
          Rev. Dr. Thomas J. Sterling Library Search
        </label>
        <div className="relative">
          <input
            type="text"
            required
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            placeholder="Search Papers, Objections, Topics..."
            className="w-full pl-12 pr-28 py-3 bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10 rounded-lg text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold text-nearblack dark:text-white font-sans"
          />
          <Search className="absolute left-4 top-3.5 text-mediumgrey h-5 w-5" />
          <button
            type="submit"
            disabled={isLoading}
            className="absolute right-2 top-2 px-4 py-1.5 bg-navy text-white text-xs font-semibold rounded hover:bg-navy/90 dark:bg-gold dark:text-slate-950 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            {isLoading && <Loader2 size={13} className="animate-spin" />}
            <span>Search</span>
          </button>
        </div>

        {localQuery && !isLoading && (
          <p className="text-center text-xs text-mediumgrey font-mono">
            Returned <strong className="text-nearblack dark:text-white">{totalFindings}</strong> findings for "<strong>{localQuery}</strong>"
          </p>
        )}
      </form>

      {/* Difficulty Filter Chips */}
      <div className="flex flex-wrap items-center justify-center gap-2 border-b border-black/5 dark:border-white/5 pb-4">
        {difficulties.map((diff) => (
          <button
            key={diff.value}
            onClick={() => setDifficultyFilter(diff.value)}
            className={`px-3 py-1 text-xs rounded-full tracking-wide transition-all duration-200 cursor-pointer ${
              difficultyFilter === diff.value
                ? 'bg-navy text-white dark:bg-gold dark:text-slate-950 font-bold shadow-xs'
                : 'bg-black/5 dark:bg-white/5 text-nearblack dark:text-gray-300 hover:bg-black/10 dark:hover:bg-white/10'
            }`}
          >
            {diff.label}
          </button>
        ))}
      </div>

      {/* Category Tabs */}
      {totalFindings > 0 && (
        <div className="flex items-center justify-center gap-2 border-b border-black/5 dark:border-white/5 pb-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 text-xs rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-slate-200 dark:bg-slate-800 text-nearblack dark:text-white font-bold'
                  : 'text-mediumgrey hover:text-nearblack dark:hover:text-white'
              }`}
            >
              <span>{tab.label}</span>
              <span className="font-mono text-[10px] px-1.5 py-0.2 bg-black/5 dark:bg-white/10 rounded-full">
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="max-w-3xl mx-auto space-y-4 animate-pulse">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 p-6 rounded-lg space-y-3">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
              <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
              <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded w-full" />
            </div>
          ))}
        </div>
      ) : totalFindings > 0 ? (
        /* Results Content Container */
        <div className="max-w-3xl mx-auto space-y-8">
          {/* 1. Articles Section */}
          {(activeTab === 'all' || activeTab === 'articles') && displayedArticles.length > 0 && (
            <div className="space-y-4">
              {activeTab === 'all' && (
                <h3 className="font-serif text-lg font-bold text-nearblack dark:text-white flex items-center gap-2">
                  <BookOpen size={18} className="text-gold" />
                  <span>Articles & Research Papers</span>
                  <span className="font-mono text-xs font-normal text-mediumgrey">({displayedArticles.length})</span>
                </h3>
              )}
              <div className="space-y-4">
                {displayedArticles.map((art) => {
                  const topic = topics.find((t) => t.slug === art.topicSlug);
                  return (
                    <div
                      key={art.id}
                      onClick={() => navigateTo(`/articles/${art.slug}`)}
                      className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 hover:border-black/15 dark:hover:border-gold/30 p-6 rounded-lg flex flex-col justify-between gap-4 cursor-pointer group shadow-sm hover:shadow transition-all duration-300"
                    >
                      <div className="space-y-2.5">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-mediumgrey">
                          <span className="font-semibold text-gold">
                            {topic ? topic.name : art.topicSlug}
                          </span>
                          <span className="w-1.5 h-1.5 rounded-full bg-lightgrey/50" />
                          <DifficultyBadge difficulty={art.difficulty} />
                          <span className="w-1.5 h-1.5 rounded-full bg-lightgrey/50" />
                          <span className="flex items-center gap-0.5">
                            <Clock size={11} /> {art.readingTime}m Read
                          </span>
                        </div>

                        <h3 className="font-serif text-lg md:text-xl font-bold text-nearblack dark:text-white leading-tight group-hover:text-gold transition-colors">
                          {highlightKeyword(language === 'en' ? art.title : (art.titleAm || art.title), localQuery)}
                        </h3>

                        <p className="text-xs md:text-sm text-mediumgrey dark:text-gray-300 leading-relaxed font-serif">
                          {highlightKeyword(language === 'en' ? art.excerpt : (art.excerptAm || art.excerpt), localQuery)}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-black/5 dark:border-white/5 flex justify-between items-center text-[11px] text-lightgrey">
                        <span>Published {art.publishDate}</span>
                        <span className="font-semibold text-navy dark:text-gold group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                          Read Paper <ChevronRight size={11} />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. Questions Section */}
          {(activeTab === 'all' || activeTab === 'questions') && displayedQuestions.length > 0 && (
            <div className="space-y-4">
              {activeTab === 'all' && (
                <h3 className="font-serif text-lg font-bold text-nearblack dark:text-white flex items-center gap-2">
                  <HelpCircle size={18} className="text-gold" />
                  <span>Theological Objections</span>
                  <span className="font-mono text-xs font-normal text-mediumgrey">({displayedQuestions.length})</span>
                </h3>
              )}
              <div className="space-y-3">
                {displayedQuestions.map((q) => (
                  <div
                    key={q.id}
                    onClick={() => navigateTo(`/articles/${q.articleSlug}`)}
                    className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 hover:border-black/15 dark:hover:border-gold/30 p-4 rounded-lg flex items-center justify-between gap-4 cursor-pointer group shadow-xs transition-all duration-300"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-[11px] text-mediumgrey">
                        <DifficultyBadge difficulty={q.difficulty} />
                        <span className="w-1 h-1 rounded-full bg-lightgrey/50" />
                        <span>Score {q.commonScore}%</span>
                      </div>
                      <p className="text-sm font-medium text-nearblack dark:text-gray-200 group-hover:text-gold transition-colors">
                        {highlightKeyword(language === 'en' ? q.text : (q.textAm || q.text), localQuery)}
                      </p>
                    </div>
                    <ChevronRight size={16} className="text-lightgrey group-hover:text-gold shrink-0 transition-transform group-hover:translate-x-0.5" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Topics Section */}
          {(activeTab === 'all' || activeTab === 'topics') && displayedTopics.length > 0 && (
            <div className="space-y-4">
              {activeTab === 'all' && (
                <h3 className="font-serif text-lg font-bold text-nearblack dark:text-white flex items-center gap-2">
                  <Compass size={18} className="text-gold" />
                  <span>Thematic Study Topics</span>
                  <span className="font-mono text-xs font-normal text-mediumgrey">({displayedTopics.length})</span>
                </h3>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayedTopics.map((top) => (
                  // Card rendering individual topic match keyed by unique slug
                  <div
                    key={top.slug}
                    onClick={() => navigateTo(`/topics/${top.slug}`)}
                    className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 hover:border-black/15 dark:hover:border-gold/30 p-4 rounded-lg cursor-pointer group shadow-xs transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      <h4 className="font-serif text-base font-bold text-nearblack dark:text-white group-hover:text-gold transition-colors">
                        {language === 'en' ? top.name : (top.nameAm || top.name)}
                      </h4>
                      <p className="text-xs text-mediumgrey line-clamp-2 mt-1">
                        {top.description}
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-black/5 dark:border-white/5 flex justify-between items-center text-[11px] text-gold font-semibold">
                      <span>Explore Topic</span>
                      <ChevronRight size={12} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 p-8 md:p-12 text-center rounded-lg space-y-6">
          <div className="space-y-2">
            <HelpCircle size={40} className="text-gold mx-auto" />
            <h2 className="font-serif text-xl font-bold text-nearblack dark:text-white">
              No Direct Library Findings
            </h2>
            <p className="text-xs md:text-sm text-mediumgrey max-w-md mx-auto leading-relaxed">
              We couldn’t find any matching research documents for "<strong>{localQuery || 'your entry'}</strong>". Consider browsing our index of common doubts below:
            </p>
          </div>

          <div className="border-t border-black/5 dark:border-white/5 pt-6 text-left space-y-3.5">
            <h4 className="font-serif text-xs font-semibold tracking-wide text-nearblack dark:text-white block">
              Suggested Objections List
            </h4>
            <div className="divide-y divide-black/5 dark:divide-white/5">
              {questions.slice(0, 3).map((q) => (
                <div
                  key={q.id}
                  onClick={() => navigateTo(`/articles/${q.articleSlug}`)}
                  className="py-3 cursor-pointer group flex justify-between items-center text-xs"
                >
                  <span className="font-medium text-nearblack dark:text-gray-200 group-hover:text-gold transition-colors block pr-4">
                    {q.text}
                  </span>
                  <ChevronRight size={14} className="text-lightgrey group-hover:text-gold transition-colors shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

