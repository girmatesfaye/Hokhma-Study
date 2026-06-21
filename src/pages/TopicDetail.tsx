/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { useApp } from '../context/AppContext';
import DifficultyBadge from '../components/DifficultyBadge';
import { Difficulty } from '../types';
import { ArrowLeft, BookOpen, Clock, ChevronRight, Hash } from 'lucide-react';

export default function TopicDetail() {
  const { currentRoute, topics, articles, navigateTo } = useApp();
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | 'all'>('all');

  const topicSlug = currentRoute.slug || '';
  const topic = topics.find((t) => t.slug === topicSlug);

  if (!topic) {
    return (
      <div className="max-w-[1140px] mx-auto px-4 py-20 text-center animate-fade-in">
        <h2 className="font-serif text-2xl font-bold">Topic Not Found</h2>
        <p className="text-mediumgrey text-sm mt-2">The topic you are looking for does not exist in our writing database.</p>
        <button onClick={() => navigateTo('/topics')} className="mt-6 px-4 py-2 bg-navy text-white text-xs font-bold uppercase tracking-wider rounded">
          Return to Topics
        </button>
      </div>
    );
  }

  // Get articles belonging to this topic and ensure they are published
  const topicArticles = articles.filter(
    (a) => a.topicSlug === topic.slug && a.isPublished
  );

  // Filter based on selected difficulty
  const filteredArticles = topicArticles.filter((art) => {
    if (difficultyFilter === 'all') return true;
    return art.difficulty === difficultyFilter;
  });

  // Calculate all distinct tags for this topic
  const tagSet = new Set<string>();
  topicArticles.forEach((art) => art.tags.forEach((t) => tagSet.add(t)));
  const tagCloud = Array.from(tagSet);

  // Get related topics (other topics)
  const relatedTopics = topics.filter((t) => t.slug !== topic.slug);

  const filters: { label: string; value: Difficulty | 'all' }[] = [
    { label: 'All Articles', value: 'all' },
    { label: 'Beginner', value: 'beginner' },
    { label: 'Intermediate', value: 'intermediate' },
    { label: 'Deep Dive', value: 'deep-dive' },
  ];

  return (
    <div id="topic-detail-page" className="animate-fade-in max-w-[1140px] mx-auto px-4 md:px-6 py-10 space-y-10">
      
      {/* Back button */}
      <button
        onClick={() => navigateTo('/topics')}
        className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-mediumgrey hover:text-navy dark:hover:text-white transition-colors"
      >
        <ArrowLeft size={14} /> Back to all topics
      </button>

      {/* Page Header */}
      <div className="border-b border-black/5 dark:border-white/5 pb-8 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-widest text-gold font-bold">Category Archive</span>
          <span className="text-xs bg-navy/5 dark:bg-white/5 text-navy dark:text-gray-300 px-3 py-1 rounded font-semibold">
            {topicArticles.length} {topicArticles.length === 1 ? 'Article' : 'Articles'}
          </span>
        </div>
        
        <h1 className="font-serif text-3xl md:text-4xl font-extrabold text-nearblack dark:text-white">
          {topic.name}
        </h1>
        <p className="text-sm md:text-base text-mediumgrey dark:text-gray-300 leading-relaxed font-serif italic max-w-3xl">
          {topic.description}
        </p>
      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Main Area (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Difficulty Filter Bar */}
          <div className="flex flex-wrap items-center gap-2 border-b border-black/5 dark:border-white/5 pb-4">
            <span className="text-xs font-semibold text-mediumgrey dark:text-gray-400 font-sans mr-2">Filter difficulty:</span>
            {filters.map((fil) => (
              <button
                key={fil.value}
                onClick={() => setDifficultyFilter(fil.value)}
                className={`px-3 py-1.5 text-xs font-bold rounded uppercase tracking-wider transition-all duration-200 ${
                  difficultyFilter === fil.value
                    ? 'bg-navy text-white dark:bg-gold dark:text-slate-950 shadow-sm'
                    : 'bg-black/4 dark:bg-white/5 hover:bg-black/7 dark:hover:bg-white/10 text-nearblack dark:text-gray-200'
                }`}
              >
                {fil.label}
              </button>
            ))}
          </div>

          {/* Article List Grid (2-col desktop, 1-col mobile as specified) */}
          {filteredArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredArticles.map((art) => (
                <div
                  key={art.id}
                  onClick={() => navigateTo(`/articles/${art.slug}`)}
                  className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 hover:border-black/15 dark:hover:border-white/15 h-full rounded-lg p-5 flex flex-col justify-between group cursor-pointer shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <DifficultyBadge difficulty={art.difficulty} />
                      <span className="text-[11px] text-lightgrey flex items-center gap-1">
                        <Clock size={11} /> {art.readingTime}m read
                      </span>
                    </div>

                    <h3 className="font-serif text-lg font-bold text-nearblack dark:text-white leading-snug group-hover:text-gold transition-colors">
                      {art.title}
                    </h3>
                    
                    <p className="text-xs text-mediumgrey dark:text-gray-350 line-clamp-3 leading-relaxed">
                      {art.excerpt}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-black/5 dark:border-white/5 flex flex-col gap-3">
                    {/* Tags pill chips */}
                    <div className="flex flex-wrap gap-1.5">
                      {art.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] bg-offwhite dark:bg-slate-800 text-mediumgrey dark:text-gray-300 px-2 py-0.5 rounded border border-black/5 dark:border-white/5"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex justify-between items-center text-[11px] font-sans pt-1">
                      <span className="text-lightgrey">Published {art.publishDate}</span>
                      <span className="font-bold uppercase tracking-wider text-navy dark:text-gold group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                        Read <ChevronRight size={11} />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center rounded-lg border border-dashed border-black/10 dark:border-white/5 bg-white dark:bg-slate-900 flex flex-col items-center justify-center gap-2">
              <BookOpen size={32} className="text-gold" />
              <p className="text-base font-serif font-bold text-nearblack dark:text-white">No articles match your selection</p>
              <p className="text-xs text-mediumgrey max-w-xs leading-relaxed">Try adjusting your filters or browsing other topics in Dr. Sterling's archive.</p>
            </div>
          )}

        </div>

        {/* Sidebar (4 cols - Desktop only, screen hidden on mobile as specified) */}
        <aside className="hidden lg:col-span-4 lg:block space-y-8">
          
          {/* Related topics */}
          <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-lg p-6 space-y-4 shadow-sm">
            <h4 className="font-serif text-md font-bold text-nearblack dark:text-white uppercase tracking-wider text-[12px] border-b border-black/5 dark:border-white/5 pb-2">
              Related Fields
            </h4>
            <div className="space-y-3">
              {relatedTopics.map((rel) => (
                <div
                  key={rel.slug}
                  onClick={() => navigateTo(`/topics/${rel.slug}`)}
                  className="flex justify-between items-center text-sm p-1 cursor-pointer group hover:text-gold transition-colors"
                >
                  <span className="text-nearblack/85 dark:text-gray-300 font-medium group-hover:text-gold">
                    {rel.name}
                  </span>
                  <span className="text-xs bg-black/5 dark:bg-white/5 hover:bg-gold/20 px-2.5 py-0.5 rounded text-mediumgrey">
                    {rel.articleCount}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Tag cloud */}
          {tagCloud.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-lg p-6 space-y-4 shadow-sm">
              <h4 className="font-serif text-md font-bold text-nearblack dark:text-white uppercase tracking-wider text-[12px] border-b border-black/5 dark:border-white/5 pb-2">
                Topic Tags
              </h4>
              <div className="flex flex-wrap gap-2">
                {tagCloud.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => navigateTo(`/tags/${tag}`)}
                    className="inline-flex items-center gap-0.5 text-xs bg-offwhite hover:bg-gold/10 dark:bg-slate-800 dark:hover:bg-slate-700 text-mediumgrey dark:text-gray-200 px-3 py-1 rounded border border-black/5 dark:border-white/5 group transition-colors"
                  >
                    <Hash size={10} className="text-gold" />
                    <span>{tag}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

        </aside>

      </div>

    </div>
  );
}
