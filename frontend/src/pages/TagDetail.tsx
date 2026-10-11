/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import DifficultyBadge from '../components/DifficultyBadge';
import { ArrowLeft, Clock, ChevronRight, Hash, BookOpen } from 'lucide-react';

export default function TagDetail() {
  const { currentRoute, articles, topics, navigateTo } = useApp();
  const { language, getTranslatedText } = useLanguage();

  const tag = currentRoute.slug || '';

  // Get articles having this tag
  const taggedArticles = articles.filter(
    (a) => a.tags.includes(tag.toLowerCase()) && a.isPublished
  );

  // Take the first article's topic to construct breadcrumbs if available
  const sampleArticle = taggedArticles[0];
  const topic = sampleArticle ? topics.find((t) => t.slug === sampleArticle.topicSlug) : null;

  return (
    <div id="tag-detail-page" className="animate-fade-in max-w-[1140px] mx-auto px-4 md:px-6 py-6 sm:py-12 space-y-6 sm:space-y-10">
      
      {/* Dynamic Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs text-mediumgrey font-medium font-sans">
        <button onClick={() => navigateTo('/topics')} className="hover:text-gold cursor-pointer btn-press touch-manipulation">
          {getTranslatedText('Topics', 'አርዕስቶች')}
        </button>
        <ChevronRight size={12} className="text-lightgrey shrink-0" />
        {topic && (
          <>
            <button onClick={() => navigateTo(`/topics/${topic.slug}`)} className="hover:text-gold cursor-pointer btn-press touch-manipulation">
              {getTranslatedText(topic.name, topic.nameAm)}
            </button>
            <ChevronRight size={12} className="text-lightgrey shrink-0" />
          </>
        )}
        <span className="text-gold font-bold">{getTranslatedText('Tag:', 'መለያ፦')} #{tag}</span>
      </nav>

      {/* Tag Page Header */}
      <div className="border-b border-black/5 dark:border-white/5 pb-6 sm:pb-8 flex flex-col sm:flex-row justify-between sm:items-baseline gap-3 sm:gap-4">
        <div className="space-y-1.5 sm:space-y-2">
          <span className="text-xs tracking-wider text-gold font-bold">{getTranslatedText('Tag Archive', 'የመለያ ማህደር')}</span>
          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-extrabold text-nearblack dark:text-white flex items-center gap-1.5 text-balance">
            <Hash className="text-gold shrink-0" size={24} />
            <span>{tag}</span>
          </h1>
        </div>
        <span className="text-xs bg-navy/5 dark:bg-white/5 text-navy dark:text-gray-300 px-3 py-1 rounded-full font-semibold whitespace-nowrap font-sans w-fit">
          {taggedArticles.length} {getTranslatedText(taggedArticles.length === 1 ? 'Article' : 'Articles', 'ጽሑፎች')}
        </span>
      </div>

      {/* Articles Grid */}
      {taggedArticles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 pt-1 sm:pt-2">
          {taggedArticles.map((art) => {
            const artTopic = topics.find((t) => t.slug === art.topicSlug);
            return (
              <div
                key={art.id}
                onClick={() => navigateTo(`/articles/${art.slug}`)}
                className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 hover:border-gold/40 dark:hover:border-gold/40 h-full rounded-xl p-4 sm:p-5 flex flex-col justify-between group cursor-pointer shadow-xs hover:shadow-md hover:-translate-y-1 active:scale-[0.99] transition-[border-color,box-shadow,transform] duration-200 ease-out touch-manipulation"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between font-sans">
                    <span className="text-[11px] font-semibold text-gold truncate max-w-[180px]">
                      {artTopic ? getTranslatedText(artTopic.name, artTopic.nameAm) : art.topicSlug}
                    </span>
                    <DifficultyBadge difficulty={art.difficulty} />
                  </div>

                  <h3 className="font-serif text-base sm:text-lg font-bold text-nearblack dark:text-white leading-snug group-hover:text-gold transition-colors duration-150 line-clamp-2 text-balance">
                    {getTranslatedText(art.title, art.titleAm)}
                  </h3>
                  
                  <p className="text-xs sm:text-sm text-mediumgrey dark:text-gray-350 line-clamp-3 leading-relaxed text-pretty">
                    {getTranslatedText(art.excerpt, art.excerptAm)}
                  </p>
                </div>

                <div className="pt-3.5 mt-3.5 border-t border-black/5 dark:border-white/5 flex justify-between items-center text-xs text-lightgrey font-sans">
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {art.readingTime}{getTranslatedText('m read', ' ደቂቃ ንባብ')}
                  </span>
                  <span className="font-semibold text-navy dark:text-gold group-hover:translate-x-1 transition-transform duration-150 ease-out flex items-center gap-0.5">
                    {getTranslatedText('Read', 'ያንብቡ')} <ChevronRight size={13} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-lg border border-dashed border-black/10 dark:border-white/5 bg-white dark:bg-slate-900 flex flex-col items-center justify-center gap-2">
          <BookOpen size={32} className="text-gold" />
          <p className="text-base font-serif font-bold text-nearblack dark:text-white">{getTranslatedText(`No papers found with tag #${tag}`, `ከመለያ #${tag} ጋር የሚዛመዱ ጽሑፎች አልተገኙም`)}</p>
          <p className="text-xs text-mediumgrey max-w-xs leading-relaxed">{getTranslatedText('It seems no published works are tagged with this keyword anymore.', 'ይህን መለያ የያዙ የታተሙ ጽሑፎች የሉም።')}</p>
          <button onClick={() => navigateTo('/')} className="mt-4 px-4 py-2 bg-navy text-white text-xs font-bold tracking-wider rounded-lg cursor-pointer btn-press transition-[opacity,transform] duration-150">
            {getTranslatedText('Back To Home', 'ወደ መነሻ ገጽ ይመለሱ')}
          </button>
        </div>
      )}

    </div>
  );
}
