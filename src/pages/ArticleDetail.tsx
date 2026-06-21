/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import DifficultyBadge from '../components/DifficultyBadge';
import ScriptureBlock from '../components/ScriptureBlock';
import { Comment } from '../types';
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Calendar,
  Share2,
  Copy,
  Printer,
  ChevronRight,
  Smile,
  ThumbsUp,
  Award,
  BookMarked,
  BadgeCheck,
  Send,
  MessageSquare,
  Check,
  Volume2,
  Square
} from 'lucide-react';

export default function ArticleDetail() {
  const {
    currentRoute,
    articles,
    topics,
    paths,
    comments,
    addComment,
    progress,
    toggleStepProgress,
    navigateTo
  } = useApp();
  const { language, t, getTranslatedText } = useLanguage();

  const slug = currentRoute.slug || '';
  const article = articles.find((a) => a.slug === slug);

  // States
  const [copiedLink, setCopiedLink] = useState(false);
  const [reactions, setReactions] = useState<Record<string, number>>({
    helpful: 24,
    insightful: 15,
    rigorous: 18
  });
  const [userReaction, setUserReaction] = useState<string | null>(null);

  // Comment Form State
  const [commentForm, setCommentForm] = useState({ name: '', text: '' });
  const [commentPendingMsg, setCommentPendingMsg] = useState(false);

  // Bookmark / Save state
  const [isBookmarked, setIsBookmarked] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('hokhmastudy_user_bookmarks') || localStorage.getItem('apologia_user_bookmarks');
      const list = saved ? JSON.parse(saved) : [];
      return list.includes(slug);
    } catch {
      return false;
    }
  });

  // Audio / listen mode speech state
  const [isPlayingSpeech, setIsPlayingSpeech] = useState(false);

  // Active heading tracking for Table of Contents
  const [activeHeadingId, setActiveHeadingId] = useState<string>('');

  // Handle article missing
  if (!article) {
    return (
      <div className="max-w-[1140px] mx-auto px-4 py-20 text-center animate-fade-in">
        <h2 className="font-serif text-2xl font-bold">{language === 'en' ? 'Article Not Found' : 'ጥናታዊ ጽሑፉ አልተገኘም'}</h2>
        <p className="text-mediumgrey text-sm mt-2">
          {language === 'en'
            ? 'The apologetic paper you requested is unavailable or has been archived.'
            : 'የጠየቁት የክርስትና መከላከያ ጽሑፍ የለም ወይም ከማህደር ወጥቷል።'}
        </p>
        <button onClick={() => navigateTo('/')} className="mt-6 px-4 py-2 bg-navy text-white hover:opacity-90 text-xs font-bold tracking-wider rounded cursor-pointer">
          {language === 'en' ? 'Return to Home Page' : 'ወደ መነሻ ገጽ ተመለስ'}
        </button>
      </div>
    );
  }

  // Topic details
  const topic = topics.find((t) => t.slug === article.topicSlug);

  // Filter approved comments for this article + plus any new one the user submitted locally in this session
  const articleComments = comments.filter(
    (c) => c.articleSlug === article.slug && (c.isApproved || c.authorName === 'You')
  );

  // Auto-generate headings for Table of Contents
  const headings = article.content
    .filter((sec) => sec.type === 'header')
    .map((sec) => {
      const headingText = getTranslatedText(sec.text, sec.textAm);
      return {
        text: headingText,
        id: headingText.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        level: sec.level || 2
      };
    });

  // Reaction Click
  const handleReactionClick = (type: string) => {
    if (userReaction === type) {
      // Toggle off
      setReactions((prev) => ({ ...prev, [type]: prev[type] - 1 }));
      setUserReaction(null);
    } else {
      // Change or add
      setReactions((prev) => {
        const next = { ...prev };
        if (userReaction) {
          next[userReaction] = next[userReaction] - 1;
        }
        next[type] = next[type] + 1;
        return next;
      });
      setUserReaction(type);
    }
  };

  // Copy Link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2550);
  };

  // Toggle local Bookmark
  const handleToggleBookmark = () => {
    try {
      const saved = localStorage.getItem('hokhmastudy_user_bookmarks') || localStorage.getItem('apologia_user_bookmarks');
      let list = saved ? JSON.parse(saved) : [];
      if (list.includes(slug)) {
        list = list.filter((s: string) => s !== slug);
        setIsBookmarked(false);
      } else {
        list.push(slug);
        setIsBookmarked(true);
      }
      localStorage.setItem('hokhmastudy_user_bookmarks', JSON.stringify(list));
    } catch (e) {
      console.error('Failed to update bookmarks:', e);
    }
  };

  // Simulated PDF download (opening print utility is standard and robust)
  const handlePrint = () => {
    window.print();
  };

  // Text-To-Speech (TTS) Listening speech Synthesis
  const handleToggleSpeech = () => {
    if (isPlayingSpeech) {
      window.speechSynthesis.cancel();
      setIsPlayingSpeech(false);
    } else {
      if (!article) return;
      // Gather text from article title, description, and blocks
      const listText: string[] = [];
      listText.push(article.title);
      listText.push(article.excerpt);
      article.content.forEach((sec) => {
        if (sec.text) listText.push(sec.text);
      });
      const fullSpeechText = listText.join(". ");

      const utterance = new SpeechSynthesisUtterance(fullSpeechText);
      
      utterance.onend = () => {
        setIsPlayingSpeech(false);
      };
      utterance.onerror = () => {
        setIsPlayingSpeech(false);
      };

      // Cancel anything reading currently, then speak new
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
      setIsPlayingSpeech(true);
    }
  };

  // Make sure to stop speech if navigating away
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // Post Comment Handler
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentForm.name.trim() && commentForm.text.trim()) {
      const newC: Comment = {
        id: `c-user-${Date.now()}`,
        articleSlug: article.slug,
        authorName: commentForm.name.trim(),
        text: commentForm.text.trim(),
        timestamp: new Date().toISOString(),
        isApproved: false // Starts pending moderation
      };
      
      addComment(newC);
      setCommentPendingMsg(true);
      setCommentForm({ name: '', text: '' });
      
      setTimeout(() => {
        setCommentPendingMsg(false);
      }, 5000);
    }
  };

  // Scroll to footnotes helper
  const scrollToFootnotes = () => {
    const fnSection = document.getElementById('article-footnotes-area');
    if (fnSection) {
      fnSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Scroll and highlight TOC headings
  const handleHeadingClick = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveHeadingId(id);
    }
  };

  // Learning path mapping
  let pathCardElement = null;
  let nextArticleBanner = null;

  if (article.partInPath) {
    const pSlug = article.partInPath.pathSlug;
    const currentPath = paths.find((p) => p.slug === pSlug);
    
    if (currentPath) {
      const currentPosIdx = article.partInPath.position - 1; // 0-indexed pos
      const isDone = (progress[pSlug] || []).includes(article.slug);
      
      const nextSlug = currentPath.articleSlugs[currentPosIdx + 1];
      const nextArticle = nextSlug ? articles.find((a) => a.slug === nextSlug) : null;

      pathCardElement = (
        <div className="bg-amber-50/50 dark:bg-slate-900 border border-gold/30 rounded-lg p-5 space-y-4 shadow-sm text-xs">
          <div className="flex gap-2 items-center">
            <BookMarked size={16} className="text-gold" />
            <h4 className="font-serif text-[12px] font-bold text-navy dark:text-gold tracking-wider">
              {language === 'en' ? 'Part of learning path' : 'የጥናት መንገድ አካል'}
            </h4>
          </div>

          <div className="space-y-1">
            <p className="font-serif font-semibold text-nearblack dark:text-white leading-snug">
              {getTranslatedText(currentPath.title, currentPath.titleAm)}
            </p>
            <p className="text-[10px] text-mediumgrey tracking-wide">
              {language === 'en' ? 'Step' : 'ደረጃ'} {article.partInPath.position} {language === 'en' ? 'of' : 'ከ'} {currentPath.articleCount}
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => toggleStepProgress(pSlug, article.slug)}
              className={`w-full py-1.5 rounded text-[11px] font-bold tracking-wider border transition-all flex items-center justify-center gap-1 cursor-pointer ${
                isDone
                  ? 'bg-gold border-gold text-slate-950'
                  : 'bg-white hover:bg-slate-50 border-black/10 dark:bg-slate-800 text-nearblack dark:text-white'
              }`}
            >
              <BadgeCheck size={13} />
              <span>{isDone ? (language === 'en' ? 'Marked Completed' : 'ተጠናቋል') : (language === 'en' ? 'Mark as Completed' : 'እንደተጠናቀቀ ምልክት አድርግ')}</span>
            </button>

            {nextArticle && (
              <button
                onClick={() => navigateTo(`/articles/${nextArticle.slug}`)}
                className="w-full py-1.5 bg-navy text-white hover:opacity-90 rounded text-[11px] font-bold tracking-wider flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>{language === 'en' ? 'Read next step' : 'ቀጣዩን ደረጃ አንብብ'}</span>
                <ChevronRight size={12} />
              </button>
            )}
          </div>
        </div>
      );

      nextArticleBanner = nextArticle ? (
        <div
          onClick={() => navigateTo(`/articles/${nextArticle.slug}`)}
          className="bg-navy text-white p-6 rounded-lg border border-white/5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 cursor-pointer hover:bg-navy/95 transition-colors shadow"
        >
          <div className="space-y-1 bg-white/5 sm:bg-transparent p-4 sm:p-0 rounded">
            <span className="text-gold font-bold tracking-wider text-[10px] block font-sans">
              {language === 'en' ? 'Up Next on' : 'ቀጣይ በ'}: "{getTranslatedText(currentPath.title, currentPath.titleAm)}"
            </span>
            <h4 className="font-serif text-lg font-bold">
              {getTranslatedText(nextArticle.title, nextArticle.titleAm)}
            </h4>
          </div>
          <button className="px-4 py-2 bg-gold text-slate-950 font-bold tracking-wider text-xs rounded shadow flex items-center gap-1 group shrink-0">
            <span>{language === 'en' ? 'Continue path' : 'ጥናቱን ቀጥል'}</span>
            <ChevronRight size={14} className="group-hover:translate-x-0.5" />
          </button>
        </div>
      ) : (
        <div className="bg-emerald-950/40 text-emerald-400 p-6 rounded-lg text-center border border-emerald-800/40 text-sm flex flex-col items-center gap-2">
          <BadgeCheck size={28} className="text-gold" />
          <h4 className="font-serif font-bold text-white">Congratulations! Path Complete</h4>
          <p className="text-xs max-w-sm text-gray-300">You have completed all sequential steps of the <strong>{currentPath.title}</strong> curriculum sequence.</p>
        </div>
      );
    }
  }

  // Related articles (matching same topic or random)
  const relatedArticles = articles
    .filter((a) => a.topicSlug === article.topicSlug && a.id !== article.id && a.isPublished)
    .slice(0, 3);

  return (
    <article id="article-page" className="animate-fade-in py-10">
      <div className="max-w-[1140px] mx-auto px-4 md:px-6">
        
        {/* Breadcrumb & Navigation Header */}
        <div className="flex flex-col gap-4 mb-10 pb-6 border-b border-black/5 dark:border-white/5">
          <button
            onClick={() => {
              if (topic) {
                navigateTo(`/topics/${topic.slug}`);
              } else {
                navigateTo('/topics');
              }
            }}
            className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-mediumgrey hover:text-navy dark:hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} /> {language === 'en' ? `Back to ${topic ? getTranslatedText(topic.name, topic.nameAm) : 'topics'}` : `ወደ ${topic ? getTranslatedText(topic.name, topic.nameAm) : 'አርእስቶች'} ተመለስ`}
          </button>

          {/* Core Info Row */}
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2.5 items-center text-xs text-mediumgrey">
              {topic && (
                <button
                  onClick={() => navigateTo(`/topics/${topic.slug}`)}
                  className="font-bold tracking-wider text-gold hover:underline cursor-pointer font-sans"
                >
                  {getTranslatedText(topic.name, topic.nameAm)}
                </button>
              )}
              <span className="w-1.5 h-1.5 rounded-full bg-lightgrey/50" />
              <DifficultyBadge difficulty={article.difficulty} />
              <span className="w-1.5 h-1.5 rounded-full bg-lightgrey/50" />
              <span className="text-xs text-lightgrey dark:text-gray-400 flex items-center gap-1 font-sans">
                <Clock size={12} /> {article.readingTime} {t('common.minuteRead')}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-lightgrey/50" />
              <span className="text-xs text-lightgrey dark:text-gray-400 flex items-center gap-1 font-sans">
                <Calendar size={12} /> {article.publishDate}
              </span>
            </div>

            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight text-nearblack dark:text-white max-w-4xl">
              {getTranslatedText(article.title, article.titleAm)}
            </h1>
          </div>
        </div>

        {/* Cover Image (full-width) specified max 480px tall */}
        {article.coverImage && (
          <div className="w-full max-h-[440px] rounded-xl overflow-hidden mb-12 border border-black/5 shadow-inner">
            <img
              src={article.coverImage}
              alt={getTranslatedText(article.title, article.titleAm)}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover max-h-[440px]"
            />
          </div>
        )}

        {/* TWO-COLUMN LAYOUT DESKTOP: body (720px max) + sticky sidebar (240px) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Main Article Body (8 cols, max-w-3xl) */}
          <div className="lg:col-span-8 max-w-[720px] space-y-8">
            
            {/* MOBILE ONLY COLLAPSIBLE TABLE OF CONTENTS */}
            {headings.length > 0 && (
              <div className="lg:hidden bg-slate-50 dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-lg p-5">
                <details className="group">
                  <summary className="font-serif font-bold text-sm text-nearblack dark:text-white cursor-pointer select-none list-none flex justify-between items-center whitespace-nowrap">
                    <span>{language === 'en' ? 'Table of Contents' : 'የይዘት ማውጫ'}</span>
                    <ChevronRight size={16} className="group-open:rotate-90 transition-transform text-gold" />
                  </summary>
                  <ul className="mt-3.5 space-y-2.5 text-xs pl-2.5 border-l border-gold/30">
                    {headings.map((h) => (
                      <li
                        key={h.id}
                        onClick={() => handleHeadingClick(h.id)}
                        className="cursor-pointer text-nearblack/80 hover:text-gold dark:text-gray-300"
                        style={{ paddingLeft: h.level === 3 ? '12px' : '0px' }}
                      >
                        {h.text}
                      </li>
                    ))}
                  </ul>
                </details>
              </div>
            )}

            {/* Render article contents paragraph, header, scripture blocks */}
            <div className="font-sans text-[17px] md:text-[18px] leading-[1.8] text-nearblack/90 dark:text-gray-200 font-normal space-y-6">
              {article.content.map((sec, idx) => {
                const secText = getTranslatedText(sec.text, sec.textAm);
                const headingId = secText.toLowerCase().replace(/[^a-z0-9]+/g, '-');

                if (sec.type === 'header') {
                  if (sec.level === 3) {
                    return (
                      <h3
                        key={idx}
                        id={headingId}
                        className="font-serif text-lg font-bold text-nearblack dark:text-white pt-6"
                      >
                        {secText}
                      </h3>
                    );
                  }
                  return (
                    <h2
                      key={idx}
                      id={headingId}
                      className="font-serif text-xl md:text-2xl font-bold text-nearblack dark:text-white border-b border-black/5 dark:border-white/5 pb-2 pt-6"
                    >
                      {secText}
                    </h2>
                  );
                }

                if (sec.type === 'scripture' && sec.reference) {
                  return (
                    <ScriptureBlock
                      key={idx}
                      text={secText}
                      reference={getTranslatedText(sec.reference, sec.referenceAm)}
                    />
                  );
                }

                if (sec.type === 'list') {
                  const listItems = language === 'am' ? (sec.itemsAm || sec.items || []) : (sec.items || sec.itemsAm || []);
                  return (
                    <ul key={idx} className="list-disc pl-6 space-y-2 text-sm leading-relaxed font-sans">
                      {listItems.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  );
                }

                // Render paragraphs. Swap footnote superscript inline markers dynamically if needed
                let paragraphElement = secText;
                const footnoteRegex = /\[(\d+)\]/g;
                const matches = [...paragraphElement.matchAll(footnoteRegex)];
                
                if (matches.length > 0) {
                  let lastIndex = 0;
                  const chunks: React.ReactNode[] = [];
                  matches.forEach((match, matchIdx) => {
                    const matchedText = match[0];
                    const num = parseInt(match[1]);
                    const offset = match.index || 0;
                    
                    // Add text before match
                    chunks.push(paragraphElement.substring(lastIndex, offset));
                    
                    // Add styled superscript footnote marker button
                    chunks.push(
                      <sup
                        key={matchIdx}
                        onClick={scrollToFootnotes}
                        className="text-gold font-bold hover:underline cursor-pointer px-0.5"
                        title="Click to view footnote citation"
                      >
                        {num}
                      </sup>
                    );
                    
                    lastIndex = offset + matchedText.length;
                  });
                  chunks.push(paragraphElement.substring(lastIndex));
                  return (
                    <p key={idx} className="leading-relaxed font-serif text-nearblack/90 dark:text-gray-200">
                      {chunks}
                    </p>
                  );
                }

                return (
                  <p key={idx} className="leading-relaxed font-serif text-nearblack/90 dark:text-gray-200">
                    {secText}
                  </p>
                );
              })}
            </div>

            {/* 7b. Footnotes Section */}
            {article.footnotes.length > 0 && (
              <div id="article-footnotes-area" className="border-t border-black/10 dark:border-white/10 pt-8 mt-12 space-y-3">
                <h4 className="font-serif text-[12px] tracking-wider font-bold text-nearblack dark:text-white">
                  {t('article.footnote')}
                </h4>
                <ol className="list-decimal pl-5 space-y-2 text-xs md:text-sm text-mediumgrey dark:text-gray-400 font-sans leading-relaxed">
                  {article.footnotes.map((fn) => (
                    <li key={fn.id} id={`fn-${fn.id}`} className="hover:text-gold transition-colors">
                      {getTranslatedText(fn.text, fn.textAm)}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Reactions Block row */}
            <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-lg p-5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs mt-10 shadow-sm leading-relaxed">
              <span className="font-serif font-semibold text-nearblack dark:text-white">Did this article support your research or address your doubts?</span>
              <div className="flex gap-2.5">
                <button
                  onClick={() => handleReactionClick('helpful')}
                  className={`px-3 py-1.5 rounded-full border transition-all flex items-center gap-1.5 cursor-pointer font-semibold ${
                    userReaction === 'helpful'
                      ? 'bg-gold/15 border-gold text-gold scale-105'
                      : 'bg-transparent border-black/5 dark:border-white/10 text-mediumgrey dark:text-gray-300 hover:border-gold/30'
                  }`}
                >
                  <ThumbsUp size={13} />
                  <span>Helpful ({reactions.helpful})</span>
                </button>
                <button
                  onClick={() => handleReactionClick('insightful')}
                  className={`px-3 py-1.5 rounded-full border transition-all flex items-center gap-1.5 cursor-pointer font-semibold ${
                    userReaction === 'insightful'
                      ? 'bg-gold/15 border-gold text-gold scale-105'
                      : 'bg-transparent border-black/5 dark:border-white/10 text-mediumgrey dark:text-gray-300 hover:border-gold/30'
                  }`}
                >
                  <Smile size={13} />
                  <span>Insightful ({reactions.insightful})</span>
                </button>
                <button
                  onClick={() => handleReactionClick('rigorous')}
                  className={`px-3 py-1.5 rounded-full border transition-all flex items-center gap-1.5 cursor-pointer font-semibold ${
                    userReaction === 'rigorous'
                      ? 'bg-gold/15 border-gold text-gold scale-105'
                      : 'bg-transparent border-black/5 dark:border-white/10 text-mediumgrey dark:text-gray-300 hover:border-gold/30'
                  }`}
                >
                  <Award size={13} />
                  <span>Rigorous ({reactions.rigorous})</span>
                </button>
              </div>
            </div>

            {/* Next in Path Banner if applicable */}
            {nextArticleBanner && <div className="mt-8">{nextArticleBanner}</div>}

            {/* Related Articles Row */}
            {relatedArticles.length > 0 && (
              <div className="pt-10 space-y-5">
                <h3 className="font-serif text-lg font-bold text-nearblack dark:text-white border-b border-black/5 pb-2">
                  Related Readings
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  {relatedArticles.map((rel) => (
                    <div
                      key={rel.id}
                      onClick={() => navigateTo(`/articles/${rel.slug}`)}
                      className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 hover:border-black/15 dark:hover:border-gold/30 p-4 rounded-lg flex flex-col justify-between cursor-pointer group shadow-sm hover:shadow transition-all duration-300"
                    >
                      <div className="space-y-2">
                        <DifficultyBadge difficulty={rel.difficulty} className="scale-90 origin-left" />
                        <h4 className="font-serif text-sm font-bold text-nearblack dark:text-white group-hover:text-gold transition-colors leading-snug line-clamp-2">
                          {rel.title}
                        </h4>
                      </div>
                      <span className="text-[10px] text-lightgrey tracking-wider font-semibold group-hover:text-gold flex items-center gap-0.5 pt-3">
                        Read <ChevronRight size={10} />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 7c. Threaded Comments Section */}
            <div className="pt-12 border-t border-black/10 dark:border-white/10 space-y-8">
              <div className="flex items-center gap-2">
                <MessageSquare className="text-gold" />
                <h3 className="font-serif text-xl font-bold text-nearblack dark:text-white">
                  Join the Discussion ({articleComments.length} comments)
                </h3>
              </div>

              {/* Comments form */}
              {article.commentsAllowed ? (
                <form onSubmit={handleCommentSubmit} className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-lg p-5 space-y-4 shadow-sm">
                  <span className="text-xs font-semibold text-mediumgrey dark:text-gray-400 block border-b border-black/5 pb-1">
                    Have an intellectual reflection? Write a moderated comment below.
                  </span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-4">
                      <label className="text-[10px] font-bold text-mediumgrey mb-1 block">Your Name</label>
                      <input
                        type="text"
                        required
                        placeholder="E.g., Dr. Sterling"
                        value={commentForm.name}
                        onChange={(e) => setCommentForm({ ...commentForm, name: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-offwhite dark:bg-slate-950 border border-black/10 dark:border-white/10 rounded focus:outline-none focus:border-gold text-nearblack dark:text-white"
                      />
                    </div>
                    <div className="sm:col-span-8">
                      <label className="text-[10px] font-bold text-mediumgrey mb-1 block">Comment reflection</label>
                      <input
                        type="text"
                        required
                        placeholder="Write a coherent, respectful reflection on the arguments..."
                        value={commentForm.text}
                        onChange={(e) => setCommentForm({ ...commentForm, text: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-offwhite dark:bg-slate-950 border border-black/10 dark:border-white/10 rounded focus:outline-none focus:border-gold text-nearblack dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-lightgrey">Comments are strictly moderated for logical validity and academic decorum.</span>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-navy text-white dark:bg-gold dark:text-slate-950 hover:bg-navy/90 text-xs font-bold tracking-wider rounded inline-flex items-center gap-1.5"
                    >
                      <Send size={11} />
                      <span>Post Reflection</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-4 rounded-lg bg-black/5 text-center text-xs text-mediumgrey">
                  Discussion comments for this specialized paper are not accepted.
                </div>
              )}

              {/* Comment success pending moderation notification */}
              {commentPendingMsg && (
                <div className="p-4 bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 rounded-md text-xs flex items-center gap-2 animate-fade-in text-center justify-center">
                  <span className="p-1 rounded bg-emerald-900/40"><Check size={12} /></span>
                  <span>Reflection Received. It is pending moderation reviews and will appear once approved.</span>
                </div>
              )}

              {/* Threaded list */}
              <div className="space-y-4">
                {articleComments.map((com) => (
                  <div
                    key={com.id}
                    className="p-5 border border-black/5 dark:border-white/5 rounded-lg bg-white dark:bg-slate-900/50 space-y-2.5 leading-relaxed text-xs shadow-sm"
                  >
                    <div className="flex justify-between items-center border-b border-black/5 pb-1">
                      <div className="flex gap-2 items-center">
                        <strong className="text-nearblack dark:text-white text-[13px]">{com.authorName}</strong>
                        {com.authorName === 'You' && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-200 text-[9px] font-bold">
                            PENDING APPROVAL
                          </span>
                        )}
                      </div>
                      <span className="text-lightgrey font-sans text-[11px]">
                        {new Date(com.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-mediumgrey dark:text-gray-200 italic font-serif text-[13.5px]">
                      "{com.text}"
                    </p>
                  </div>
                ))}
                
                {articleComments.length === 0 && (
                  <div className="text-center p-6 text-xs text-lightgrey">
                    No approved reflections on this article yet. Be the first to initiate!
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* STICKY SIDEBAR (Desk: 4 cols, 240px approximate as specified) */}
          <aside className="lg:col-span-4 space-y-6">
            
            {/* 1. TEXT TABLE OF CONTENTS DESKTOP */}
            {headings.length > 0 && (
              <div className="hidden lg:block bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-lg p-5 space-y-3 shadow-sm sticky top-24">
                <h4 className="font-serif text-[12px] tracking-wider font-bold text-nearblack dark:text-white border-b border-black/5 pb-2">
                  Table of Contents
                </h4>
                <ul className="space-y-2.5 text-xs text-mediumgrey pr-2 max-h-[220px] overflow-y-auto">
                  {headings.map((h, idx) => (
                    <li
                      key={h.id}
                      onClick={() => handleHeadingClick(h.id)}
                      className={`cursor-pointer transition-colors hover:text-gold flex gap-1 ${
                        activeHeadingId === h.id
                          ? 'text-gold font-semibold underline decoration-solid offset-2'
                          : ''
                      }`}
                      style={{ paddingLeft: h.level === 3 ? '12px' : '0px' }}
                    >
                      <span className="text-gold font-semibold font-mono">{idx + 1}.</span>
                      <span className="truncate">{h.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Part of Path helper */}
            {pathCardElement}

            {/* Share and Print Panel */}
            <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-lg p-5 space-y-4 shadow-sm text-xs">
              <h4 className="font-serif text-[11px] tracking-wider font-bold text-nearblack dark:text-white border-b border-black/5 pb-2">
                Actions & Distribution
              </h4>
              
              <div className="space-y-2.5">
                {/* Audio Listening Mode */}
                <button
                  onClick={handleToggleSpeech}
                  className={`w-full py-2 font-semibold rounded flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                    isPlayingSpeech 
                      ? 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/40 animate-pulse' 
                      : 'bg-[#F9F8F6] dark:bg-slate-800 hover:bg-gold/15 dark:hover:bg-gold/15 text-nearblack dark:text-white border-black/5 dark:border-white/5'
                  }`}
                >
                  {isPlayingSpeech ? <Square size={13} className="text-red-500" /> : <Volume2 size={13} className="text-gold" />}
                  <span>{isPlayingSpeech ? 'Stop Listening' : 'Listen to Paper'}</span>
                </button>

                {/* bookmark save button */}
                <button
                  onClick={handleToggleBookmark}
                  className={`w-full py-2 font-semibold rounded flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                    isBookmarked 
                      ? 'bg-amber-50 dark:bg-amber-950/20 text-gold border-gold/40' 
                      : 'bg-offwhite dark:bg-slate-800 hover:bg-gold/15 text-nearblack dark:text-white border-black/5 dark:border-white/5'
                  }`}
                >
                  <BookMarked size={13} className={isBookmarked ? "text-amber-500" : "text-gold"} />
                  <span>{isBookmarked ? 'Bookmarked / Saved' : 'Bookmark Paper'}</span>
                </button>

                {/* Print button mapped as PDF simulation */}
                <button
                  onClick={handlePrint}
                  className="w-full py-2 bg-offwhite dark:bg-slate-800 hover:bg-gold/10 text-nearblack dark:text-white font-semibold rounded flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-black/5"
                >
                  <Printer size={13} className="text-gold" />
                  <span>Download / Print Paper</span>
                </button>

                {/* Copy Link */}
                <button
                  onClick={handleCopyLink}
                  className="w-full py-2 bg-offwhite dark:bg-slate-800 hover:bg-gold/10 text-nearblack dark:text-white font-semibold rounded flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-black/5"
                >
                  <Copy size={13} className="text-gold" />
                  <span>{copiedLink ? 'Link Copied!' : 'Copy Paper Link'}</span>
                </button>
              </div>

              {/* Dedicated social icons */}
              <div className="pt-2 flex justify-center gap-4 text-mediumgrey">
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(article.title)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-gold p-1"
                  title="Share on Twitter/X"
                >
                  <Share2 size={15} />
                </a>
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(article.title + ' ' + window.location.href)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-gold p-1"
                  title="Share on WhatsApp"
                >
                  <MessageSquare size={15} />
                </a>
              </div>
            </div>

            {/* TAGS PILLS */}
            {article.tags.length > 0 && (
              <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-lg p-5 space-y-3 shadow-sm text-xs">
                <h4 className="font-serif text-[11px] tracking-wider font-bold text-nearblack dark:text-white border-b border-black/5 pb-2">
                  Paper Subject Tags
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {article.tags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => navigateTo(`/tags/${tag}`)}
                      className="text-[10px] bg-offwhite dark:bg-slate-800 text-mediumgrey dark:text-gray-300 px-2.5 py-1 rounded border border-black/5 hover:border-gold/30"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

          </aside>

        </div>

      </div>
    </article>
  );
}
