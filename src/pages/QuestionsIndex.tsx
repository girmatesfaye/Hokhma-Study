/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import DifficultyBadge from '../components/DifficultyBadge';
import TopicIcon from '../components/TopicIcon';
import { Question, Difficulty } from '../types';
import { Search, ChevronRight, HelpCircle, CornerDownRight, ArrowUpRight, Plus, Send, Check } from 'lucide-react';

type SortOption = 'common' | 'az' | 'recent';

export default function QuestionsIndex() {
  const { questions, topics, navigateTo } = useApp();
  
  // States
  const [searchVal, setSearchVal] = useState('');
  const [selectedTopicSlug, setSelectedTopicSlug] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('common');
  
  // Submit new proposed question state
  const [customQuestionForm, setCustomQuestionForm] = useState('');
  const [showSubmitSuccess, setShowSubmitSuccess] = useState(false);

  // Filter & search questions
  const filteredQuestions = questions.filter((q) => {
    // Search
    const matchSearch =
      q.text.toLowerCase().includes(searchVal.toLowerCase()) ||
      q.articleTitle.toLowerCase().includes(searchVal.toLowerCase()) ||
      q.tags.some((t) => t.toLowerCase().includes(searchVal.toLowerCase()));

    // Topic
    const matchTopic = selectedTopicSlug === 'all' || q.topicSlug === selectedTopicSlug;

    // Difficulty
    const matchDiff = selectedDifficulty === 'all' || q.difficulty === selectedDifficulty;

    return matchSearch && matchTopic && matchDiff;
  });

  // Sort questions
  const sortedQuestions = [...filteredQuestions].sort((a, b) => {
    if (sortBy === 'common') {
      return b.commonScore - a.commonScore; // highest score first
    }
    if (sortBy === 'az') {
      return a.text.localeCompare(b.text);
    }
    if (sortBy === 'recent') {
      return new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime();
    }
    return 0;
  });

  // Group sorted questions by topic for the grouped layout
  const topicsToDisplay = topics.filter((t) => {
    if (selectedTopicSlug === 'all') return true;
    return t.slug === selectedTopicSlug;
  });

  const handleCustomQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customQuestionForm.trim()) {
      setShowSubmitSuccess(true);
      setTimeout(() => {
        setCustomQuestionForm('');
        setShowSubmitSuccess(false);
      }, 4000);
    }
  };

  return (
    <div id="questions-index-page" className="animate-fade-in max-w-[1140px] mx-auto px-4 md:px-6 py-10 space-y-12">
      
      {/* 1. HERO WITH SEARCH BAR */}
      <section className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-2xl p-8 md:p-12 text-center space-y-6 shadow-sm">
        <div className="max-w-xl mx-auto space-y-3">
          <span className="text-xs uppercase tracking-widest text-gold font-bold bg-gold/10 px-3 py-1.5 rounded-full inline-block">
            Objection Mapping Index
          </span>
          <h1 className="font-serif text-3xl md:text-4xl font-extrabold text-nearblack dark:text-white">
            What are you wondering about?
          </h1>
          <p className="text-xs md:text-sm text-mediumgrey dark:text-gray-300 font-serif leading-relaxed">
            We map universal intellectual concerns, doubts, and common cultural objections directly to Dr. Sterling’s comprehensive apologetic articles.
          </p>
        </div>

        {/* PROMINENT SEARCH INPUT */}
        <div className="max-w-2xl mx-auto relative">
          <input
            type="text"
            placeholder="Type your doubt or question (e.g., 'suffering', 'empty tomb')..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-offwhite dark:bg-slate-950 border border-black/10 dark:border-white/10 rounded-lg text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold text-nearblack dark:text-white"
          />
          <Search className="absolute left-4 top-3.5 text-mediumgrey h-5 w-5" />
          {searchVal && (
            <button
              onClick={() => setSearchVal('')}
              className="absolute right-4 top-3.5 text-xs text-mediumgrey hover:text-nearblack dark:hover:text-white uppercase font-bold"
            >
              Clear
            </button>
          )}
        </div>
      </section>

      {/* TWO PANEL CONTROLLERS BACKGROUND ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* LEFT PANEL SIDEBAR (180px approximate on desktop) */}
        <aside className="lg:col-span-3 space-y-6 lg:sticky lg:top-24 h-fit">
          
          {/* Topic Filters */}
          <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-lg p-5 space-y-3 shadow-sm">
            <h3 className="font-sans text-[11px] uppercase tracking-wider font-bold text-nearblack dark:text-white border-b border-black/5 pb-2">
              Filter by Field
            </h3>
            <div className="flex flex-col gap-1 text-xs">
              <button
                onClick={() => setSelectedTopicSlug('all')}
                className={`py-2 px-2.5 rounded text-left transition-colors font-medium flex items-center justify-between ${
                  selectedTopicSlug === 'all'
                    ? 'bg-navy text-white dark:bg-gold dark:text-slate-950 font-bold'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-nearblack/80 dark:text-gray-200'
                }`}
              >
                <span>All Topics</span>
                <span className="opacity-75">{questions.length}</span>
              </button>
              
              {topics.map((t) => {
                const count = questions.filter((q) => q.topicSlug === t.slug).length;
                return (
                  <button
                    key={t.slug}
                    onClick={() => setSelectedTopicSlug(t.slug)}
                    className={`py-2 px-2.5 rounded text-left transition-colors font-medium flex items-center justify-between ${
                      selectedTopicSlug === t.slug
                        ? 'bg-navy text-white dark:bg-gold dark:text-slate-950 font-bold'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-nearblack/80 dark:text-gray-200'
                    }`}
                  >
                    <span className="truncate pr-1">{t.name}</span>
                    <span className="opacity-75">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Difficulty Filter */}
          <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-lg p-5 space-y-3 shadow-sm">
            <h3 className="font-sans text-[11px] uppercase tracking-wider font-bold text-nearblack dark:text-white border-b border-black/5 pb-2">
              Depth Level
            </h3>
            <div className="flex flex-col gap-1 text-xs">
              <button
                onClick={() => setSelectedDifficulty('all')}
                className={`flex items-center gap-2 py-1.5 px-2 rounded hover:bg-slate-50 dark:hover:bg-slate-800 ${
                  selectedDifficulty === 'all' ? 'text-gold font-bold' : 'text-mediumgrey dark:text-gray-300'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <span>All Levels</span>
              </button>
              <button
                onClick={() => setSelectedDifficulty('beginner')}
                className={`flex items-center gap-2 py-1.5 px-2 rounded hover:bg-slate-50 dark:hover:bg-slate-800 ${
                  selectedDifficulty === 'beginner' ? 'text-teal-500 font-bold' : 'text-mediumgrey dark:text-gray-300'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-teal-505 bg-[#0F9E7B]" />
                <span>Beginner</span>
              </button>
              <button
                onClick={() => setSelectedDifficulty('intermediate')}
                className={`flex items-center gap-2 py-1.5 px-2 rounded hover:bg-slate-50 dark:hover:bg-slate-800 ${
                  selectedDifficulty === 'intermediate' ? 'text-amber-500 font-bold' : 'text-mediumgrey dark:text-gray-300'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-gold" />
                <span>Intermediate</span>
              </button>
              <button
                onClick={() => setSelectedDifficulty('deep-dive')}
                className={`flex items-center gap-2 py-1.5 px-2 rounded hover:bg-slate-50 dark:hover:bg-slate-800 ${
                  selectedDifficulty === 'deep-dive' ? 'text-indigo-500 font-bold' : 'text-mediumgrey dark:text-gray-300'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#534AB7]" />
                <span>Deep Dive</span>
              </button>
            </div>
          </div>

        </aside>

        {/* MAIN AREA OF QUESTIONS (9 cols) */}
        <main className="lg:col-span-9 space-y-8">
          
          {/* Toolbar with sort control and search info */}
          <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-lg p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-xs shadow-sm">
            <span className="text-mediumgrey dark:text-gray-400 font-medium">
              Showing <strong className="text-nearblack dark:text-white">{sortedQuestions.length}</strong> matched question{sortedQuestions.length === 1 ? '' : 's'}
            </span>
            
            {/* Sort options */}
            <div className="flex items-center gap-2">
              <span className="text-mediumgrey">Sort by:</span>
              <div className="inline-flex rounded-md border border-black/10 dark:border-white/10 overflow-hidden">
                <button
                  onClick={() => setSortBy('common')}
                  className={`px-2.5 py-1.5 font-bold uppercase tracking-wider text-[10px] ${
                    sortBy === 'common'
                      ? 'bg-navy text-white dark:bg-gold dark:text-slate-950'
                      : 'bg-offwhite hover:bg-black/5 text-nearblack dark:bg-slate-800 dark:text-gray-200'
                  }`}
                >
                  Most Common
                </button>
                <button
                  onClick={() => setSortBy('az')}
                  className={`px-2.5 py-1.5 font-bold uppercase tracking-wider text-[10px] ${
                    sortBy === 'az'
                      ? 'bg-navy text-white dark:bg-gold dark:text-slate-950'
                      : 'bg-offwhite hover:bg-black/5 text-nearblack dark:bg-slate-800 dark:text-gray-200'
                  }`}
                >
                  A–Z Index
                </button>
                <button
                  onClick={() => setSortBy('recent')}
                  className={`px-2.5 py-1.5 font-bold uppercase tracking-wider text-[10px] ${
                    sortBy === 'recent'
                      ? 'bg-navy text-white dark:bg-gold dark:text-slate-950'
                      : 'bg-offwhite hover:bg-black/5 text-nearblack dark:bg-slate-800 dark:text-gray-200'
                  }`}
                >
                  Recently Added
                </button>
              </div>
            </div>
          </div>

          {/* Grouped presentation */}
          {sortedQuestions.length > 0 ? (
            <div className="space-y-10 animate-fade-in">
              {topicsToDisplay.map((topic) => {
                // filter questions of this specific topic in our sorted list
                const topicQ = sortedQuestions.filter((q) => q.topicSlug === topic.slug);
                if (topicQ.length === 0) return null;

                return (
                  <div key={topic.slug} className="space-y-4">
                    {/* Header grouping */}
                    <div className="flex items-center gap-2 border-b border-black/5 dark:border-white/5 pb-2">
                      <div className="text-gold"><TopicIcon name={topic.icon} size={18} /></div>
                      <h2 className="font-serif text-lg font-bold text-nearblack dark:text-white uppercase tracking-wide">
                        {topic.name}
                      </h2>
                    </div>

                    {/* Question Rows */}
                    <div className="space-y-3">
                      {topicQ.map((q) => (
                        <div
                          key={q.id}
                          onClick={() => navigateTo(`/articles/${q.articleSlug}`)}
                          className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 hover:border-black/15 dark:hover:border-white/15 p-5 rounded-lg flex gap-4 justify-between transition-all duration-300 cursor-pointer group shadow-sm hover:shadow"
                        >
                          <div className="space-y-2 flex-1">
                            <h3 className="text-sm md:text-md font-bold text-nearblack dark:text-white group-hover:text-gold transition-colors leading-snug">
                              {q.text}
                            </h3>
                            
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs">
                              {/* Difficulty */}
                              <DifficultyBadge difficulty={q.difficulty} />
                              
                              <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-lightgrey/50" />
                              
                              {/* Target Link */}
                              <span className="text-lightgrey dark:text-gray-400 flex items-center gap-1">
                                <CornerDownRight size={12} className="text-gold" />
                                <span>Answer: <strong className="text-mediumgrey dark:text-gray-300 font-medium group-hover:underline">{q.articleTitle}</strong></span>
                              </span>
                            </div>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {q.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="text-[10px] bg-offwhite dark:bg-slate-800 text-mediumgrey dark:text-gray-300 px-2 py-0.5 rounded border border-black/5 dark:border-white/5"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-offwhite dark:bg-slate-800 text-lightgrey group-hover:text-gold shrink-0 my-auto transition-colors">
                            <ArrowUpRight size={16} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center rounded-lg border border-dashed border-black/10 dark:border-white/5 bg-white dark:bg-slate-900 flex flex-col items-center justify-center gap-2 leading-relaxed">
              <HelpCircle size={36} className="text-gold" />
              <p className="text-lg font-serif font-bold text-nearblack dark:text-white">Objection not mapped yet</p>
              <p className="text-xs text-mediumgrey max-w-sm mx-auto leading-relaxed">
                No articles matches '<strong>{searchVal}</strong>' in our current index. Rev. Dr. Sterling accepts custom submissions directly below.
              </p>
            </div>
          )}

          {/* SUBMIT A CUSTOM OBJECTION */}
          <div className="bg-[#FAF9F6] dark:bg-slate-900/40 p-6 rounded-lg border border-black/5 shadow-inner">
            <h3 className="font-serif text-lg font-bold text-nearblack dark:text-white mb-2">
              Have an intellectual objection not cataloged here?
            </h3>
            <p className="text-xs text-mediumgrey dark:text-gray-300 leading-relaxed mb-4">
              Rev. Dr. Sterling frequently maps new articles based on community submissions from seekers and scholars. Submit your hard question below to request a detailed analysis.
            </p>

            {showSubmitSuccess ? (
              <div className="p-4 bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 rounded text-xs flex items-center justify-center gap-2 animate-fade-in">
                <Check size={14} />
                <span>Question Submitted. Your query has been prioritized in Rev. Dr. Sterling's research queue.</span>
              </div>
            ) : (
              <form onSubmit={handleCustomQuestionSubmit} className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="Type your question or intellectual concern..."
                  value={customQuestionForm}
                  onChange={(e) => setCustomQuestionForm(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs bg-white dark:bg-slate-950 border border-black/10 dark:border-white/10 rounded focus:outline-none focus:border-gold text-nearblack dark:text-white"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-navy text-white dark:bg-gold dark:text-slate-950 text-xs font-bold uppercase tracking-wider rounded inline-flex items-center gap-1.5"
                >
                  <Send size={11} />
                  <span>Submit Question</span>
                </button>
              </form>
            )}
          </div>

        </main>

      </div>

    </div>
  );
}
