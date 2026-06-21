/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import { useApp } from '../context/AppContext';
import DifficultyBadge from '../components/DifficultyBadge';
import { ArrowLeft, Clock, ChevronRight, Hash, BookOpen } from 'lucide-react';

export default function TagDetail() {
  const { currentRoute, articles, topics, navigateTo } = useApp();

  const tag = currentRoute.slug || '';

  // Get articles having this tag
  const taggedArticles = articles.filter(
    (a) => a.tags.includes(tag.toLowerCase()) && a.isPublished
  );

  // Take the first article's topic to construct breadcrumbs if available
  const sampleArticle = taggedArticles[0];
  const topic = sampleArticle ? topics.find((t) => t.slug === sampleArticle.topicSlug) : null;

  return (
    <div id="tag-detail-page" className="animate-fade-in max-w-[1140px] mx-auto px-4 md:px-6 py-12 space-y-10">
      
      {/* Dynamic Breadcrumbs */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-mediumgrey font-medium">
        <button onClick={() => navigateTo('/topics')} className="hover:text-gold uppercase tracking-wider">
          Topics
        </button>
        <ChevronRight size={12} className="text-lightgrey" />
        {topic && (
          <>
            <button onClick={() => navigateTo(`/topics/${topic.slug}`)} className="hover:text-gold tracking-wider">
              {topic.name}
            </button>
            <ChevronRight size={12} className="text-lightgrey" />
          </>
        )}
        <span className="text-gold font-bold tracking-wider">Tag: #{tag}</span>
      </div>

      {/* Tag Page Header */}
      <div className="border-b border-black/5 dark:border-white/5 pb-8 flex flex-col sm:flex-row justify-between sm:items-baseline gap-4">
        <div className="space-y-2">
          <span className="text-xs tracking-widest text-gold font-bold">Tag Archive</span>
          <h1 className="font-serif text-3xl md:text-4xl font-extrabold text-nearblack dark:text-white flex items-center gap-1">
            <Hash className="text-gold" size={26} />
            <span>{tag}</span>
          </h1>
        </div>
        <span className="text-xs bg-navy/5 dark:bg-white/5 text-navy dark:text-gray-300 px-3 py-1 rounded font-semibold whitespace-nowrap">
          {taggedArticles.length} {taggedArticles.length === 1 ? 'Article' : 'Articles'}
        </span>
      </div>

      {/* Articles Grid (mapped same as Topics list layout) */}
      {taggedArticles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {taggedArticles.map((art) => {
            const artTopic = topics.find((t) => t.slug === art.topicSlug);
            return (
              <div
                key={art.id}
                onClick={() => navigateTo(`/articles/${art.slug}`)}
                className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 hover:border-black/15 dark:hover:border-white/15 h-full rounded-lg p-5 flex flex-col justify-between group cursor-pointer shadow-sm hover:shadow transition-all duration-300"
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold tracking-wider text-gold">
                      {artTopic ? artTopic.name : art.topicSlug}
                    </span>
                    <DifficultyBadge difficulty={art.difficulty} />
                  </div>

                  <h3 className="font-serif text-base font-bold text-nearblack dark:text-white leading-snug group-hover:text-gold transition-colors line-clamp-2">
                    {art.title}
                  </h3>
                  
                  <p className="text-xs text-mediumgrey dark:text-gray-350 line-clamp-3 leading-relaxed">
                    {art.excerpt}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-black/5 dark:border-white/5 flex justify-between items-center text-[10px] text-lightgrey">
                  <span>{art.readingTime}m read</span>
                  <span className="font-bold tracking-wider text-navy dark:text-gold group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                    Read <ChevronRight size={11} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-lg border border-dashed border-black/10 dark:border-white/5 bg-white dark:bg-slate-900 flex flex-col items-center justify-center gap-2">
          <BookOpen size={32} className="text-gold" />
          <p className="text-base font-serif font-bold text-nearblack dark:text-white">No papers found with tag #{tag}</p>
          <p className="text-xs text-mediumgrey max-w-xs leading-relaxed">It seems no published works are tagged with this keyword anymore.</p>
          <button onClick={() => navigateTo('/')} className="mt-4 px-4 py-2 bg-navy text-white text-xs font-bold tracking-wider rounded">
            Back to Home
          </button>
        </div>
      )}

    </div>
  );
}
