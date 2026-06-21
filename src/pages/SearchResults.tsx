/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import DifficultyBadge from '../components/DifficultyBadge';
import { Difficulty } from '../types';
import { Search, ChevronRight, HelpCircle, BookOpen, Clock } from 'lucide-react';

export default function SearchResults() {
  const { currentRoute, articles, topics, questions, navigateTo } = useApp();

  const queryFromUrl = currentRoute.slug || '';
  const [localQuery, setLocalQuery] = useState(queryFromUrl);
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | 'all'>('all');

  // Synchronize with Hash query on URL change
  useEffect(() => {
    setLocalQuery(currentRoute.slug || '');
  }, [currentRoute]);

  const handleLocalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localQuery.trim()) {
      navigateTo(`/search?q=${encodeURIComponent(localQuery.trim())}`);
    }
  };

  // Perform filtering across isPublished articles
  const searchResults = articles.filter((art) => {
    if (!art.isPublished) return false;

    // Filter by query
    const matchesQuery =
      art.title.toLowerCase().includes(localQuery.toLowerCase()) ||
      art.excerpt.toLowerCase().includes(localQuery.toLowerCase()) ||
      art.tags.some((t) => t.toLowerCase().includes(localQuery.toLowerCase())) ||
      art.content.some((sec) => sec.text.toLowerCase().includes(localQuery.toLowerCase()));

    // Filter by difficulty
    const matchesDifficulty = difficultyFilter === 'all' || art.difficulty === difficultyFilter;

    return matchesQuery && matchesDifficulty;
  });

  const difficulties: { label: string; value: Difficulty | 'all' }[] = [
    { label: 'All depths', value: 'all' },
    { label: 'Beginner', value: 'beginner' },
    { label: 'Intermediate', value: 'intermediate' },
    { label: 'Deep Dive', value: 'deep-dive' },
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
            <mark key={i} className="bg-yellow-100 text-nearblack px-1.5 rounded font-semibold dark:bg-yellow-905 dark:text-nearblack font-serif">
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
    <div id="search-results-page" className="animate-fade-in max-w-[1140px] mx-auto px-4 md:px-6 py-10 space-y-10">
      
      {/* 1. Large search bar top */}
      <form onSubmit={handleLocalSubmit} className="max-w-2xl mx-auto relative space-y-3">
        <label className="text-[11px] uppercase tracking-wider font-bold text-mediumgrey block text-center font-sans">
          Rev. Dr. Thomas J. Sterling Library Search
        </label>
        <div className="relative">
          <input
            type="text"
            required
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            placeholder="Type search words to scan articles..."
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10 rounded-lg text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold text-nearblack dark:text-white font-sans"
          />
          <Search className="absolute left-4 top-3.5 text-mediumgrey h-5 w-5" />
          <button
            type="submit"
            className="absolute right-3 top-2 px-3 py-1.5 bg-navy text-white text-xs font-bold uppercase tracking-wider rounded"
          >
            Search
          </button>
        </div>
        
        {localQuery && (
          <p className="text-center text-xs text-mediumgrey font-mono">
            Returned <strong className="text-nearblack dark:text-white">{searchResults.length}</strong> findings for "<strong>{localQuery}</strong>"
          </p>
        )}
      </form>

      {/* 2. Difficulty filters */}
      <div className="flex flex-wrap items-center justify-center gap-2 border-b border-black/5 dark:border-white/5 pb-4">
        {difficulties.map((diff) => (
          <button
            key={diff.value}
            onClick={() => setDifficultyFilter(diff.value)}
            className={`px-3 py-1 text-xs rounded-full uppercase tracking-wider transition-all duration-200 ${
              difficultyFilter === diff.value
                ? 'bg-navy text-white dark:bg-gold dark:text-slate-950 font-bold'
                : 'bg-black/4 dark:bg-white/5 text-nearblack dark:text-gray-300 hover:bg-black/7 hover:bg-white/10'
            }`}
          >
            {diff.label}
          </button>
        ))}
      </div>

      {/* 3. Article list display */}
      {searchResults.length > 0 ? (
        <div className="space-y-6 max-w-3xl mx-auto">
          {searchResults.map((art) => {
            const topic = topics.find((t) => t.slug === art.topicSlug);
            return (
              <div
                key={art.id}
                onClick={() => navigateTo(`/articles/${art.slug}`)}
                className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 hover:border-black/15 dark:hover:border-gold/30 p-6 rounded-lg flex flex-col justify-between gap-4 cursor-pointer group shadow-sm hover:shadow transition-all duration-350 animate-fade-in"
              >
                <div className="space-y-2.5">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-mediumgrey">
                    <span className="uppercase font-bold tracking-wider text-gold">
                      {topic ? topic.name : art.topicSlug}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-lightgrey/50" />
                    <DifficultyBadge difficulty={art.difficulty} />
                    <span className="w-1.5 h-1.5 rounded-full bg-lightgrey/50" />
                    <span className="flex items-center gap-0.5">
                      <Clock size={11} /> {art.readingTime}m read
                    </span>
                  </div>

                  <h3 className="font-serif text-lg md:text-xl font-bold text-nearblack dark:text-white leading-tight group-hover:text-gold transition-colors">
                    {highlightKeyword(art.title, localQuery)}
                  </h3>

                  <p className="text-xs md:text-sm text-mediumgrey dark:text-gray-300 leading-relaxed font-serif">
                    {highlightKeyword(art.excerpt, localQuery)}
                  </p>
                </div>

                <div className="pt-3 border-t border-black/5 flex justify-between items-center text-[11px] text-lightgrey">
                  <span>Published {art.publishDate}</span>
                  <span className="font-bold uppercase tracking-wider text-navy dark:text-gold group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                    Read paper <ChevronRight size={11} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 p-8 md:p-12 text-center rounded-lg space-y-6">
          <div className="space-y-2">
            <HelpCircle size={40} className="text-gold mx-auto" />
            <h2 className="font-serif text-xl font-bold text-nearblack dark:text-white">
              No direct library findings
            </h2>
            <p className="text-xs md:text-sm text-mediumgrey max-w-md mx-auto leading-relaxed">
              We couldn’t find any matching research documents for "<strong>{localQuery || 'your entry'}</strong>". Consider browsing our index of common doubts below:
            </p>
          </div>

          <div className="border-t border-black/5 pt-6 text-left space-y-3.5">
            <h4 className="font-serif text-[12px] uppercase tracking-wider font-bold text-nearblack dark:text-white block">
              Suggested Objections List
            </h4>
            <div className="divide-y divide-black/5">
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
