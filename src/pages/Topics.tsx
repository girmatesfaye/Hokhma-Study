/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import TopicIcon from '../components/TopicIcon';
import DifficultyBadge from '../components/DifficultyBadge';
import { Difficulty } from '../types';
import { Clock, ChevronRight, Search, BookOpen, Filter, ArrowRight, LayoutGrid } from 'lucide-react';

export default function Topics() {
  const { topics, articles, navigateTo } = useApp();
  const { getTranslatedText } = useLanguage();

  const [selectedTopicSlug, setSelectedTopicSlug] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'topics'>('grid');

  // Filter published articles according to selected topic, difficulty, and search query
  const publishedArticles = articles.filter((a) => a.isPublished);

  const filteredArticles = publishedArticles.filter((art) => {
    // Topic filter
    if (selectedTopicSlug !== 'all' && art.topicSlug !== selectedTopicSlug) {
      return false;
    }
    // Difficulty filter
    if (difficultyFilter !== 'all' && art.difficulty !== difficultyFilter) {
      return false;
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = art.title.toLowerCase().includes(q) || (art.titleAm && art.titleAm.toLowerCase().includes(q));
      const matchExcerpt = art.excerpt.toLowerCase().includes(q) || (art.excerptAm && art.excerptAm.toLowerCase().includes(q));
      const matchTags = art.tags.some((t) => t.toLowerCase().includes(q));
      return matchTitle || matchExcerpt || matchTags;
    }
    return true;
  });

  // Get active topic detail if selected
  const activeTopic = topics.find((t) => t.slug === selectedTopicSlug);

  const difficultyOptions: { label: string; value: Difficulty | 'all' }[] = [
    { label: getTranslatedText('All Levels', 'ሁሉም ደረጃዎች'), value: 'all' },
    { label: getTranslatedText('Beginner', 'ጀማሪ'), value: 'beginner' },
    { label: getTranslatedText('Intermediate', 'መካከለኛ'), value: 'intermediate' },
    { label: getTranslatedText('Deep Dive', 'ጥልቅ ጥናት'), value: 'deep-dive' },
  ];

  return (
    <div id="topics-page" className="animate-fade-in max-w-[1140px] mx-auto px-4 md:px-6 py-10 space-y-10">
      
      {/* Page Hero Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs tracking-widest text-gold font-bold font-sans">
          {getTranslatedText('Intellectual Archives', 'አእምሯዊ ማህደራት')}
        </span>
        <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-nearblack dark:text-white">
          {getTranslatedText('Articles By Topic', 'ጽሑፎች በየአርዕስቱ')}
        </h1>
        <p className="text-sm md:text-base text-mediumgrey dark:text-gray-300 leading-relaxed font-serif italic">
          {getTranslatedText(
            'Explore our complete collection of theological defenses, historical evidence, and philosophical research organized by topic.',
            'ስነ-መልኮታዊ፣ ታሪካዊ እና ፍልስፍናዊ ጽሑፎቻችንን በየአርዕስቱና ደረጃው ተደራጅተው ይመርምሩ።'
          )}
        </p>
        <div className="w-16 h-1 bg-gold mx-auto rounded-full mt-2" />
      </div>

      {/* TOPIC NAVIGATION TAB BAR (Sleek Horizontal Pill Bar) */}
      <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl border border-black/5 dark:border-white/10 shadow-sm space-y-3">
        
        <div className="flex items-center justify-between px-2 pt-1">
          <span className="text-[11px] font-bold text-mediumgrey dark:text-gray-400 font-sans tracking-wide">
            {getTranslatedText('Select Topic Arena:', 'ርዕሰ ጉዳይ ይምረጡ፦')}
          </span>
          <div className="flex items-center gap-1.5 text-xs text-lightgrey font-sans">
            <span className="font-semibold text-navy dark:text-gold font-mono">{filteredArticles.length}</span>
            <span>{getTranslatedText('Articles Found', 'ጽሑፎች ተገኝተዋል')}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {/* ALL ARTICLES TAB */}
          <button
            type="button"
            onClick={() => setSelectedTopicSlug('all')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              selectedTopicSlug === 'all'
                ? 'bg-navy text-white dark:bg-gold dark:text-slate-950 shadow-sm'
                : 'bg-offwhite dark:bg-slate-800 text-nearblack dark:text-gray-200 hover:bg-black/5 dark:hover:bg-slate-700'
            }`}
          >
            <LayoutGrid size={14} className={selectedTopicSlug === 'all' ? 'text-gold dark:text-slate-950' : 'text-slate-400'} />
            <span>{getTranslatedText('All Topics', 'ሁሉም አርዕስቶች')}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              selectedTopicSlug === 'all' ? 'bg-white/20 text-white dark:bg-slate-950/20 dark:text-slate-950' : 'bg-black/5 dark:bg-white/10 text-mediumgrey dark:text-gray-300'
            }`}>
              {publishedArticles.length}
            </span>
          </button>

          {/* DYNAMIC TOPIC TABS */}
          {topics.map((t) => {
            const count = publishedArticles.filter((a) => a.topicSlug === t.slug).length;
            const isSelected = selectedTopicSlug === t.slug;
            return (
              <button
                key={t.slug}
                type="button"
                onClick={() => setSelectedTopicSlug(t.slug)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                  isSelected
                    ? 'bg-navy text-white dark:bg-gold dark:text-slate-950 shadow-sm'
                    : 'bg-offwhite dark:bg-slate-800 text-nearblack dark:text-gray-200 hover:bg-black/5 dark:hover:bg-slate-700'
                }`}
              >
                <TopicIcon name={t.icon} size={14} />
                <span>{getTranslatedText(t.name, t.nameAm)}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  isSelected ? 'bg-white/20 text-white dark:bg-slate-950/20 dark:text-slate-950' : 'bg-black/5 dark:bg-white/10 text-mediumgrey dark:text-gray-300'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ACTIVE TOPIC HEADER BANNER (Shown when a specific topic is selected) */}
      {activeTopic && (
        <div className="bg-gradient-to-r from-navy/5 via-gold/5 to-transparent dark:from-slate-900 dark:via-slate-850 dark:to-slate-900 p-6 rounded-2xl border border-gold/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-gold/15 text-gold inline-flex">
                <TopicIcon name={activeTopic.icon} size={18} />
              </span>
              <h2 className="font-serif text-xl font-bold text-nearblack dark:text-white">
                {getTranslatedText(activeTopic.name, activeTopic.nameAm)}
              </h2>
            </div>
            <p className="text-xs md:text-sm text-mediumgrey dark:text-gray-300 font-serif italic leading-relaxed">
              {getTranslatedText(activeTopic.description, activeTopic.descriptionAm)}
            </p>
          </div>

          <button
            onClick={() => navigateTo(`/topics/${activeTopic.slug}`)}
            className="px-4 py-2 bg-navy text-white dark:bg-gold dark:text-slate-950 text-xs font-bold tracking-wider rounded-lg hover:bg-navy/90 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
          >
            <span>{getTranslatedText('Dedicated Topic View', 'ልዩ የአርዕስት ገጽ')}</span>
            <ChevronRight size={13} />
          </button>
        </div>
      )}

      {/* CONTROLS BAR: SEARCH & DIFFICULTY FILTERS */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-black/5 dark:border-white/5">
        
        {/* Quick Search Input */}
        <div className="relative w-full md:w-80">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-lightgrey" />
          <input
            type="text"
            placeholder={getTranslatedText('Search articles within topics...', 'ጽሑፎችን በአርዕስቱ ውስጥ ይፈልጉ...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-offwhite dark:bg-slate-950 border border-black/10 dark:border-white/10 rounded-lg focus:outline-none focus:border-gold text-nearblack dark:text-white transition-all font-sans"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-lightgrey hover:text-nearblack"
            >
              ✕
            </button>
          )}
        </div>

        {/* Difficulty Filter Selector */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto justify-start md:justify-end">
          <span className="text-xs font-semibold text-mediumgrey dark:text-gray-400 font-sans flex items-center gap-1 whitespace-nowrap">
            <Filter size={12} className="text-gold" />
            <span>{getTranslatedText('Level:', 'ደረጃ፦')}</span>
          </span>
          <div className="flex gap-1">
            {difficultyOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setDifficultyFilter(opt.value)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg tracking-wide transition-all cursor-pointer whitespace-nowrap ${
                  difficultyFilter === opt.value
                    ? 'bg-navy text-white dark:bg-gold dark:text-slate-950 shadow-sm'
                    : 'bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-nearblack dark:text-gray-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* ARTICLE GRID DISPLAY */}
      {filteredArticles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((art) => {
            const topic = topics.find((t) => t.slug === art.topicSlug);
            return (
              <div
                key={art.id}
                id={`article-card-${art.id}`}
                onClick={() => navigateTo(`/articles/${art.slug}`)}
                className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 hover:border-gold/40 dark:hover:border-gold/40 rounded-xl overflow-hidden flex flex-col justify-between group cursor-pointer shadow-sm hover:shadow-md transition-all duration-300"
              >
                {/* Article Cover Image Header */}
                {art.coverImage ? (
                  <div className="aspect-[16/9] w-full overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
                    <img
                      src={art.coverImage}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="px-2.5 py-1 rounded-md bg-navy/90 text-white backdrop-blur-md text-[10px] font-bold tracking-wide flex items-center gap-1 shadow-sm font-sans">
                        {topic && <TopicIcon name={topic.icon} size={11} className="text-gold" />}
                        <span>{topic ? getTranslatedText(topic.name, topic.nameAm) : art.topicSlug}</span>
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-gradient-to-r from-navy/10 to-gold/10 dark:from-slate-800 dark:to-slate-850 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gold font-sans uppercase tracking-wider flex items-center gap-1">
                      {topic && <TopicIcon name={topic.icon} size={12} />}
                      <span>{topic ? getTranslatedText(topic.name, topic.nameAm) : art.topicSlug}</span>
                    </span>
                    <DifficultyBadge difficulty={art.difficulty} />
                  </div>
                )}

                {/* Article Content Container */}
                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2.5">
                    
                    {/* Badges line if image exists */}
                    {art.coverImage && (
                      <div className="flex items-center justify-between pt-1">
                        <DifficultyBadge difficulty={art.difficulty} />
                        <span className="text-[11px] text-lightgrey flex items-center gap-1 font-mono">
                          <Clock size={11} /> {art.readingTime}{getTranslatedText('m read', ' ደቂቃ ንባብ')}
                        </span>
                      </div>
                    )}

                    <h3 className="font-serif text-lg font-bold text-nearblack dark:text-white leading-snug group-hover:text-gold transition-colors line-clamp-2">
                      {getTranslatedText(art.title, art.titleAm)}
                    </h3>

                    <p className="text-xs text-mediumgrey dark:text-gray-300 line-clamp-3 leading-relaxed font-serif">
                      {getTranslatedText(art.excerpt, art.excerptAm)}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-black/5 dark:border-white/5 space-y-3 font-sans mt-auto">
                    {/* Tags Pills */}
                    {art.tags && art.tags.length > 0 && (
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
                    )}

                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-lightgrey font-mono">{art.publishDate}</span>
                      <span className="font-bold tracking-wide text-navy dark:text-gold group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                        {getTranslatedText('Read Article', 'ጽሑፉን ያንብቡ')} <ChevronRight size={13} />
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl border border-dashed border-black/10 dark:border-white/10 bg-white dark:bg-slate-900 flex flex-col items-center justify-center gap-3">
          <BookOpen size={36} className="text-gold" />
          <p className="text-lg font-serif font-bold text-nearblack dark:text-white">
            {getTranslatedText('No articles match your selection', 'ከማጣሪያዎ ጋር የሚዛመድ ጽሑፍ አልተገኘም')}
          </p>
          <p className="text-xs text-mediumgrey max-w-sm leading-relaxed font-sans">
            {getTranslatedText(
              'Try clearing your search query or switching to another topic category from the top bar.',
              'የፍለጋ ቃሉን በመቀየር ወይም ከላይ ካለው የአርዕስት ዝርዝር ሌላ በመምረጥ ይሞክሩ።'
            )}
          </p>
          <button
            onClick={() => {
              setSelectedTopicSlug('all');
              setDifficultyFilter('all');
              setSearchQuery('');
            }}
            className="mt-2 px-4 py-2 bg-navy text-white text-xs font-bold rounded-lg hover:bg-navy/90 transition-colors cursor-pointer font-sans"
          >
            {getTranslatedText('Reset Filters', 'ማጣሪያዎችን አጽዳ')}
          </button>
        </div>
      )}

      {/* SECONDARY SECTION: TOPICS OVERVIEW CARDS */}
      <div className="pt-8 border-t border-black/5 dark:border-white/10 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-serif text-xl font-bold text-nearblack dark:text-white">
              {getTranslatedText('All Topic Arenas Overview', 'የሁሉም አርዕስቶች አጠቃላይ እይታ')}
            </h2>
            <p className="text-xs text-mediumgrey font-serif italic mt-0.5">
              {getTranslatedText('Select any arena to isolate its dedicated publications.', 'የተወሰኑ ጽሑፎችን ለመመልከት አርዕስቱን ይምረጡ።')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {topics.map((t) => {
            const count = publishedArticles.filter((a) => a.topicSlug === t.slug).length;
            const isSelected = selectedTopicSlug === t.slug;
            return (
              <div
                key={t.slug}
                onClick={() => {
                  setSelectedTopicSlug(t.slug);
                  window.scrollTo({ top: 300, behavior: 'smooth' });
                }}
                className={`p-5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-4 ${
                  isSelected
                    ? 'bg-navy/5 dark:bg-gold/10 border-gold shadow-sm'
                    : 'bg-white dark:bg-slate-900 border-black/5 dark:border-white/5 hover:border-gold/30'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="w-10 h-10 rounded-lg bg-offwhite dark:bg-slate-800 text-gold flex items-center justify-center">
                    <TopicIcon name={t.icon} size={20} />
                  </div>
                  <h3 className="font-serif text-base font-bold text-nearblack dark:text-white">
                    {getTranslatedText(t.name, t.nameAm)}
                  </h3>
                  <p className="text-xs text-mediumgrey dark:text-gray-300 line-clamp-2 leading-relaxed">
                    {getTranslatedText(t.description, t.descriptionAm)}
                  </p>
                </div>

                <div className="pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs font-sans">
                  <span className="font-semibold text-navy dark:text-gold">{count} {getTranslatedText('Articles', 'ጽሑፎች')}</span>
                  <span className="text-gold font-bold flex items-center gap-0.5">
                    {getTranslatedText('Select', 'ይምረጡ')} <ArrowRight size={12} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

