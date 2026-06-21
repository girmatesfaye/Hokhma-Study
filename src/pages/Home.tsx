/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import DifficultyBadge from '../components/DifficultyBadge';
import TopicIcon from '../components/TopicIcon';
import { ArrowRight, ChevronRight, BookOpen, Clock, HelpCircle, Mail, Check } from 'lucide-react';

export default function Home() {
  const { articles, topics, paths, questions, navigateTo } = useApp();
  const [emailValue, setEmailValue] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Filter published articles
  const publishedArticles = articles.filter(a => a.isPublished);

  // Large featured article (1st featured or first available)
  const featuredArticle = publishedArticles.find((a) => a.featured) || publishedArticles[0];
  // 2 smaller cards
  const smallerArticles = publishedArticles
    .filter((a) => a.id !== (featuredArticle?.id || ''))
    .slice(0, 2);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailValue.trim()) {
      setIsSubscribed(true);
      setTimeout(() => {
        setEmailValue('');
      }, 3000);
    }
  };

  return (
    <div id="home-page" className="animate-fade-in space-y-16">
      
      {/* 1. HERO SECTION */}
      <header id="hero-section" className="pt-16 pb-12 px-4 md:px-12 text-center max-w-[800px] mx-auto">
        <span className="text-xs tracking-widest text-gold font-bold bg-gold/5 dark:bg-gold/10 px-3 py-1.5 rounded-[4px] inline-block mb-4">
          Intellectual Credibility · Pastoral Aesthetics
        </span>
        <h1 className="text-3xl md:text-[42px] font-serif leading-tight font-bold text-navy dark:text-white mb-4">
          Honest answers to hard questions about faith.
        </h1>
        <p className="text-mediumgrey dark:text-gray-300 text-base md:text-[18px] leading-relaxed mb-8 max-w-2xl mx-auto font-serif italic">
          A scholarly laboratory of long-form analytical articles, historic manuscript evidence, and philosophical arguments defending classical Christianity.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={() => navigateTo('/questions')}
            className="px-8 py-3 bg-navy text-white dark:bg-gold dark:text-slate-950 font-semibold rounded-[4px] shadow-sm hover:opacity-90 active:scale-[0.98] transition-all text-sm tracking-wider cursor-pointer"
          >
            Browse questions
          </button>
          <button
            onClick={() => navigateTo('/paths/faith-and-reason')}
            className="px-8 py-3 border border-navy text-navy dark:border-white/40 dark:text-white hover:bg-navy/5 dark:hover:bg-white/5 font-semibold rounded-[4px] transition-all text-sm tracking-wider cursor-pointer"
          >
            Start here — I'm new
          </button>
        </div>
      </header>

      {/* 2. FEATURED ARTICLES */}
      <section id="featured-articles-section" className="max-w-[1140px] mx-auto px-4 md:px-6">
        <div className="flex justify-between items-baseline mb-8 border-b border-black/5 dark:border-white/5 pb-4">
          <h2 className="font-serif text-2xl font-bold tracking-tight text-nearblack dark:text-white">
            Editor’s picks
          </h2>
          <span className="text-xs tracking-widest text-gold font-bold">Featured writing</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Large featured card (full width left / 8 cols) */}
          {featuredArticle && (
            <div
              id="featured-large-card"
              onClick={() => navigateTo(`/articles/${featuredArticle.slug}`)}
              className="lg:col-span-8 bg-white dark:bg-dark-card border border-black/5 dark:border-white/5 hover:border-black/20 dark:hover:border-white/20 rounded-md overflow-hidden flex flex-col justify-between group cursor-pointer shadow-md hover:shadow-lg transition-all duration-300"
            >
              {featuredArticle.coverImage && (
                <div className="h-68 overflow-hidden relative border-b border-black/10 dark:border-white/10">
                  <img
                    src={featuredArticle.coverImage}
                    alt={featuredArticle.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="px-2.5 py-0.5 rounded-[4px] bg-[#534AB7] text-white text-[10px] font-bold tracking-wider">
                      Featured Piece
                    </span>
                  </div>
                </div>
              )}
              
              <div className="p-6 md:p-8 flex-1 flex flex-col justify-between gap-6">
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2 items-center text-xs text-mediumgrey dark:text-gray-400">
                    <span className="font-bold tracking-widest text-gold font-sans">
                      {topics.find((t) => t.slug === featuredArticle.topicSlug)?.name || featuredArticle.topicSlug}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-lightgrey/55" />
                    <DifficultyBadge difficulty={featuredArticle.difficulty} />
                    <span className="w-1 h-1 rounded-full bg-lightgrey/55" />
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {featuredArticle.readingTime} min read
                    </span>
                  </div>

                  <h3 className="font-serif text-2xl md:text-3xl font-bold leading-tight text-navy dark:text-white group-hover:text-gold transition-colors">
                    {featuredArticle.title}
                  </h3>
                  
                  <p className="text-sm md:text-base text-mediumgrey dark:text-gray-300 leading-relaxed font-serif">
                    {featuredArticle.excerpt}
                  </p>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-black/10 dark:border-white/10">
                  <span className="text-xs text-lightgrey dark:text-gray-400 font-sans">
                    Published {featuredArticle.publishDate}
                  </span>
                  <span className="text-xs tracking-wider font-bold text-navy dark:text-gold flex items-center gap-1 group-hover:translate-x-1.5 transition-transform">
                    Read Article <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 2 smaller cards right column (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {smallerArticles.map((art) => (
              <div
                key={art.id}
                onClick={() => navigateTo(`/articles/${art.slug}`)}
                className="bg-white dark:bg-dark-card border border-black/5 dark:border-white/5 hover:border-black/20 dark:hover:border-white/20 h-auto rounded-md p-6 flex flex-col justify-between group cursor-pointer shadow-md hover:shadow-lg transition-all duration-300"
              >
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-1.5 items-center text-[10px] text-mediumgrey">
                    <span className="font-bold tracking-widest text-gold font-sans">
                      {topics.find((t) => t.slug === art.topicSlug)?.name || art.topicSlug}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-lightgrey/50" />
                    <DifficultyBadge difficulty={art.difficulty} />
                  </div>

                  <h4 className="font-serif text-lg font-bold text-navy dark:text-white group-hover:text-gold transition-colors leading-snug">
                    {art.title}
                  </h4>
                  <p className="text-xs text-mediumgrey dark:text-gray-300 line-clamp-3 leading-relaxed font-serif italic">
                    {art.excerpt}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 mt-4 border-t border-black/10 dark:border-white/10">
                  <span className="text-[12px] text-[#A0A0A0]">
                    {art.readingTime}m read
                  </span>
                  <span className="text-[13px] font-bold tracking-wider text-navy dark:text-gold group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                    Read <ChevronRight size={12} />
                  </span>
                </div>
              </div>
            ))}
            
            {/* Fallback in case there aren't enough secondary articles */}
            {smallerArticles.length === 0 && (
              <div className="bg-white dark:bg-dark-card rounded-lg p-6 text-center border border-dashed border-black/10 dark:border-white/10 flex flex-col justify-center items-center gap-2 h-full shadow-md">
                <BookOpen size={24} className="text-gold" />
                <p className="text-xs text-mediumgrey">More scholarly insights will be posted here soon.</p>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* 3. BROWSE BY TOPIC */}
      <section id="browse-by-topic-section" className="max-w-[1140px] mx-auto px-4 md:px-6">
        <div className="text-center space-y-2 mb-12">
          <span className="text-xs tracking-widest text-gold font-bold">Intellectual Fields</span>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-navy dark:text-white">
            Explore by core category
          </h2>
          <div className="w-12 h-0.5 bg-gold mx-auto mt-2 rounded-full" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {topics.map((t) => (
            <div
              key={t.slug}
              id={`topic-tile-${t.slug}`}
              onClick={() => navigateTo(`/topics/${t.slug}`)}
              className="bg-white dark:bg-dark-card border border-black/5 dark:border-white/5 hover:border-navy dark:hover:border-gold rounded-md p-6 text-center flex flex-col items-center justify-between gap-4 cursor-pointer shadow-md hover:shadow-lg transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-dark-bg text-gold flex items-center justify-center border border-black/5 dark:border-white/5">
                <TopicIcon name={t.icon} size={20} />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-navy dark:text-white pb-0.5">
                  {t.name}
                </h3>
                <span className="text-[11px] tracking-widest text-lightgrey dark:text-gray-400 font-semibold block">
                  {t.articleCount} {t.articleCount === 1 ? 'article' : 'articles'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. LEARNING PATHS TEASER */}
      <section id="paths-teaser-section" className="bg-offwhite dark:bg-dark-bg/40 py-16 border-y border-black/10 dark:border-white/10">
        <div className="max-w-[1140px] mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-baseline mb-10 gap-4">
            <div>
              <span className="text-xs tracking-widest text-gold font-bold">Curated Progressions</span>
              <h2 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-navy dark:text-white mt-1">
                Not sure where to start?
              </h2>
            </div>
            <button
              onClick={() => navigateTo('/paths')}
              className="text-xs font-bold tracking-widest text-gold flex items-center gap-1 group whitespace-nowrap cursor-pointer"
            >
              See all learning paths <ArrowRight size={13} className="group-hover:translate-x-1" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {paths.map((path) => (
              <div
                key={path.slug}
                className="bg-white dark:bg-dark-card border border-black/5 dark:border-white/5 rounded-md p-6 flex flex-col justify-between gap-6 shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-[4px] bg-amber-50 dark:bg-amber-950/30 text-gold text-[10px] font-bold tracking-wider border border-gold/15">
                      {path.difficultyRange}
                    </span>
                    <span className="text-xs text-lightgrey font-sans font-medium tracking-wide">
                      {path.articleCount} articles · {path.totalReadingTime}m total
                    </span>
                  </div>
                  
                  <h3 className="font-serif text-xl font-bold text-navy dark:text-white">
                    {path.title}
                  </h3>
                  <p className="text-xs text-mediumgrey dark:text-gray-300 leading-relaxed font-serif italic">
                    {path.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-black/10 dark:border-white/10 flex justify-end">
                  <button
                    onClick={() => navigateTo(`/paths/${path.slug}`)}
                    className="px-4 py-2 text-xs font-bold tracking-wider text-white bg-navy dark:bg-gold dark:text-slate-950 rounded-[4px] flex items-center gap-1 group hover:opacity-90 duration-150 transition-opacity"
                  >
                    <span>Start this path</span>
                    <ChevronRight size={13} className="group-hover:translate-x-0.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. COMMON QUESTIONS TEASER */}
      <section id="questions-teaser-section" className="max-w-[1140px] mx-auto px-4 md:px-6">
        <div className="flex flex-col sm:flex-row justify-between items-baseline mb-8 gap-4 border-b border-black/10 dark:border-white/10 pb-4">
          <div>
            <span className="text-xs tracking-widest text-gold font-bold">Objection Index</span>
            <h2 className="font-serif text-2xl font-bold tracking-tight text-navy dark:text-white mt-1">
              What are people asking?
            </h2>
          </div>
          <button
            onClick={() => navigateTo('/questions')}
            className="text-xs font-bold tracking-widest text-gold flex items-center gap-1 group cursor-pointer"
          >
            See all questions <ArrowRight size={13} className="group-hover:translate-x-1" />
          </button>
        </div>

        <div className="divide-y divide-black/10 dark:divide-white/10">
          {questions.slice(0, 4).map((q) => (
            <div
              key={q.id}
              onClick={() => navigateTo(`/articles/${q.articleSlug}`)}
              className="py-4 flex gap-4 items-center justify-between group cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 px-3 rounded-[4px] transition-all duration-200"
            >
              <div className="max-w-3xl space-y-1.5 flex-1 pr-4">
                <p className="text-sm font-bold text-navy dark:text-white leading-snug group-hover:text-gold transition-colors font-serif">
                  {q.text}
                </p>
                <div className="flex flex-wrap gap-2 items-center text-xs text-mediumgrey">
                  <DifficultyBadge difficulty={q.difficulty} />
                  <span className="w-1 h-1 rounded-full bg-lightgrey/50" />
                  <span className="text-lightgrey flex items-center gap-1">
                    <BookOpen size={11} /> Answer: {q.articleTitle}
                  </span>
                </div>
              </div>
              <ChevronRight size={18} className="text-lightgrey group-hover:text-gold transition-colors shrink-0" />
            </div>
          ))}
        </div>
      </section>

      {/* 6. NEWSLETTER SIGNUP BAND */}
      <section id="newsletter-band" className="bg-navy text-white py-14 px-6 rounded-lg max-w-[1140px] mx-auto text-center space-y-6 shadow-md border border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-12 -translate-y-12" />
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-white rounded-full translate-x-16 translate-y-16" />
        </div>
        
        <div className="relative z-10 max-w-xl mx-auto space-y-4">
          <div className="inline-flex items-center justify-center p-2 rounded-full bg-white/5 mb-1 text-gold">
            <Mail size={22} />
          </div>
          <h2 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-white">
            Get analytical articles in your inbox.
          </h2>
          <p className="text-xs md:text-sm text-gray-300 leading-relaxed font-serif italic max-w-xl mx-auto">
            Never miss an historical manuscript overview, early creed teardown, or philosophical defense of classical belief. Direct from Rev. Dr. Sterling's writing desk.
          </p>

          {isSubscribed ? (
            <div className="p-3 bg-emerald-900/30 border border-emerald-500/30 text-emerald-400 rounded-[4px] text-xs flex items-center justify-center gap-2 max-w-sm mx-auto animate-fade-in">
              <Check size={14} />
              <span>Subscription authorized. Thank you for joining us.</span>
            </div>
          ) : (
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto pt-2">
              <input
                type="email"
                required
                placeholder="Enter your email address..."
                value={emailValue}
                onChange={(e) => setEmailValue(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-[#263223] border border-white/10 rounded-[4px] focus:outline-none focus:border-gold text-sm text-white"
              />
              <button
                type="submit"
                className="px-6 py-2.5 bg-gold text-slate-950 hover:bg-gold/90 transition-colors font-bold tracking-widest text-xs rounded-[4px] cursor-pointer"
              >
                Subscribe
              </button>
            </form>
          )}
          <p className="text-[10px] text-gray-400">
            No spam. Highly structured writing only. Bi-weekly cadence.
          </p>
        </div>
      </section>

    </div>
  );
}
