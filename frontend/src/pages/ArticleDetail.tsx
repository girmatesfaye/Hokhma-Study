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
import { getArticleComments } from '../services/articles';
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
  Check
} from 'lucide-react';
import logoImg from '../../assets/logo.jpg';
import logoWatermarkImg from '../../assets/logo-watermark.png';

export default function ArticleDetail() {
  const {
    currentRoute,
    articles,
    topics,
    paths,
    addComment,
    toggleReaction,
    progress,
    toggleStepProgress,
    navigateTo
  } = useApp();
  const { language, t, getTranslatedText } = useLanguage();

  const slug = currentRoute.slug || '';
  const article = articles.find((a) => a.slug === slug);

  // States
  const [copiedLink, setCopiedLink] = useState(false);
  // Reaction counts come from the server; local state only reflects the reader's own clicks instantly
  const [reactions, setReactions] = useState<Record<string, number>>(() => ({
    helpful: article?.reactions?.helpful || 0,
    insightful: article?.reactions?.insightful || 0,
    rigorous: article?.reactions?.rigorous || 0
  }));
  const [userReaction, setUserReaction] = useState<string | null>(null);

  // Approved comments are public data, so they are fetched per article rather than kept in global state
  const [articleComments, setArticleComments] = useState<Comment[]>([]);
  useEffect(() => {
    if (!slug) return;
    getArticleComments(slug).then(setArticleComments).catch(() => setArticleComments([]));
  }, [slug]);

  // Comment Form State
  const [commentForm, setCommentForm] = useState({ name: '', text: '' });
  const [commentPendingMsg, setCommentPendingMsg] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  // Active heading tracking for Table of Contents
  const [activeHeadingId, setActiveHeadingId] = useState<string>('');

  // Print & Watermark Date/Time Tracker
  const formatCurrentDateTime = () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString(language === 'am' ? 'am-ET' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const timeStr = now.toLocaleTimeString(language === 'am' ? 'am-ET' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    return `${dateStr} • ${timeStr}`;
  };

  const [printTimestamp, setPrintTimestamp] = useState<string>(formatCurrentDateTime);
  const [isPreparingPrint, setIsPreparingPrint] = useState(false);

  // Sync print timestamp whenever print is invoked (via button or Ctrl+P)
  useEffect(() => {
    const onBeforePrint = () => {
      setPrintTimestamp(formatCurrentDateTime());
    };
    window.addEventListener('beforeprint', onBeforePrint);
    return () => window.removeEventListener('beforeprint', onBeforePrint);
  }, [language]);


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
      toggleReaction(slug, type, -1);
      setUserReaction(null);
    } else {
      // Switching reactions must also release the previous one on the server
      if (userReaction) toggleReaction(slug, userReaction, -1);
      // Change or add
      setReactions((prev) => {
        const next = { ...prev };
        if (userReaction) {
          next[userReaction] = next[userReaction] - 1;
        }
        next[type] = next[type] + 1;
        return next;
      });
      toggleReaction(slug, type, 1);
      setUserReaction(type);
    }
  };

  // Copy Link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2550);
  };

  // Simulated PDF download & print paper utility with timestamp and watermark
  const handlePrint = () => {
    const currentStamp = formatCurrentDateTime();
    setPrintTimestamp(currentStamp);
    setIsPreparingPrint(true);

    const originalTitle = document.title;
    const articleTitle = article ? getTranslatedText(article.title, article.titleAm) : 'Article';
    document.title = `Hokhma Study - ${articleTitle}`;

    setTimeout(() => {
      window.print();
      setIsPreparingPrint(false);
      setTimeout(() => {
        document.title = originalTitle;
      }, 1000);
    }, 150);
  };

  // Post Comment Handler
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (commentForm.name.trim() && commentForm.text.trim()) {
      setCommentError(null);
      try {
        // The server stamps id, timestamp and isApproved=false; the pending notice only shows once it accepts the comment
        await addComment({
          articleSlug: article.slug,
          authorName: commentForm.name.trim(),
          text: commentForm.text.trim()
        });
        setCommentPendingMsg(true);
        setCommentForm({ name: '', text: '' });
        setTimeout(() => setCommentPendingMsg(false), 5000);
      } catch {
        setCommentError('Your comment could not be submitted. Please try again.');
      }
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
      ) : null;
    }
  }

  // Related articles (matching same topic or random)
  const relatedArticles = articles
    .filter((a) => a.topicSlug === article.topicSlug && a.id !== article.id && a.isPublished)
    .slice(0, 3);

  return (
    <article id="article-page" className="animate-fade-in py-10 print:py-0 print:m-0">
      {/* PRINT WATERMARK: Logo Image from Asset Folder in Paper Body Background */}
      <div className="paper-print-watermark hidden print:flex pointer-events-none select-none" aria-hidden="true">
        <img
          src={logoWatermarkImg || '/assets/logo-watermark.png'}
          alt="Hokhma Study Watermark"
          className="paper-print-watermark-img"
        />
      </div>

      <div className="max-w-[1140px] mx-auto px-4 md:px-6 print:max-w-none print:px-0 print:mx-0">
        
        {/* PRINT HEADER: Website Name, Logo & Timestamp */}
        <div className="paper-print-header hidden print:block border-b-2 border-gold/50 pb-6 mb-8">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img
                src={logoImg || '/assets/logo.jpg'}
                alt="Hokhma Study Logo"
                className="w-16 h-16 rounded-full object-cover border-2 border-gold shadow-sm"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-serif text-2xl font-bold tracking-tight text-navy">
                    {t('brand.name')}
                  </h2>
                  <span className="text-gold font-bold text-sm">✦</span>
                  <span className="text-xs font-sans font-semibold tracking-wider text-gold uppercase">
                    {language === 'en' ? 'Theological Research Paper' : 'ሥነ-መለኮታዊ ጥናታዊ ጽሑፍ'}
                  </span>
                </div>
                <p className="font-sans text-xs text-mediumgrey tracking-wide mt-0.5">
                  {language === 'en'
                    ? 'Christian Apologetics & Intellectual Rigor • Curated Ministry Corpus'
                    : 'የክርስትና እምነት መከላከያ እና የአእምሮ ጥልቀት'}
                </p>
              </div>
            </div>
            <div className="text-right text-[11px] font-sans text-mediumgrey space-y-1">
              <div className="font-bold text-nearblack text-xs">
                <span className="inline-block w-2 h-2 rounded-full bg-gold mr-1.5 align-middle"></span>
                {language === 'en' ? 'Downloaded / Printed' : 'የወረደበት / የታተመበት'}:
              </div>
              <div className="font-mono text-[11px] text-nearblack font-bold bg-slate-50 px-2 py-0.5 rounded border border-black/10">
                {printTimestamp}
              </div>
              <div className="text-[10px] text-lightgrey font-sans">
                {window.location.host || 'hokhmastudy.com'}
              </div>
            </div>
          </div>

          {/* Paper Metadata Strip */}
          <div className="mt-4 pt-3 border-t border-black/10 flex flex-wrap justify-between items-center text-[11px] font-sans text-mediumgrey">
            <div className="flex flex-wrap items-center gap-3">
              {topic && (
                <span>
                  <strong className="text-nearblack">{language === 'en' ? 'Topic' : 'ምድብ'}:</strong>{' '}
                  {getTranslatedText(topic.name, topic.nameAm)}
                </span>
              )}
              <span className="text-lightgrey">•</span>
              <span>
                <strong className="text-nearblack">{language === 'en' ? 'Published' : 'የታተመበት'}:</strong>{' '}
                {article.publishDate}
              </span>
              <span className="text-lightgrey">•</span>
              <span>
                <strong className="text-nearblack">{language === 'en' ? 'Estimated Reading' : 'የንባብ ጊዜ'}:</strong>{' '}
                {article.readingTime} {t('common.minuteRead')}
              </span>
              <span className="text-lightgrey">•</span>
              <span>
                <strong className="text-nearblack">{language === 'en' ? 'Difficulty' : 'ደረጃ'}:</strong>{' '}
                {article.difficulty.charAt(0).toUpperCase() + article.difficulty.slice(1)}
              </span>
            </div>
            <div className="text-[10px] text-lightgrey italic font-mono truncate max-w-sm">
              {window.location.href}
            </div>
          </div>
        </div>

        {/* Breadcrumb & Navigation Header */}
        <div className="mx-auto mb-10 flex max-w-[720px] flex-col gap-4 border-b border-black/5 pb-6 dark:border-white/5 print:mb-4 print:max-w-full print:border-none print:pb-0">
          <button
            onClick={() => {
              if (topic) {
                navigateTo(`/topics/${topic.slug}`);
              } else {
                navigateTo('/topics');
              }
            }}
            className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-mediumgrey hover:text-navy dark:hover:text-white transition-colors cursor-pointer no-print"
          >
            <ArrowLeft size={14} /> {language === 'en' ? `Back to ${topic ? getTranslatedText(topic.name, topic.nameAm) : 'topics'}` : `ወደ ${topic ? getTranslatedText(topic.name, topic.nameAm) : 'አርእስቶች'} ተመለስ`}
          </button>

          {/* Core Info Row */}
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2.5 items-center text-xs text-mediumgrey no-print">
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

            <h1 className="font-serif text-3xl md:text-4xl font-extrabold leading-tight text-nearblack dark:text-white print:text-3xl print:mb-3">
              {getTranslatedText(article.title, article.titleAm)}
            </h1>

            {/* One slim toolbar replaces the old sidebar cards: print, copy link, share */}
            <div className="no-print flex flex-wrap items-center gap-2 pt-1 font-sans">
              <button
                onClick={handlePrint}
                disabled={isPreparingPrint}
                title={language === 'en' ? 'Printed copies include the Hokhma Study watermark, website name and timestamp' : 'የታተሙ ቅጂዎች የሆክማ ጥናት ምልክት፣ የድረ-ገጹን ስም እና የጊዜ ማህተም ይይዛሉ'}
                className="btn-press inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-black/10 px-3 py-1.5 text-sm font-semibold text-nearblack transition-colors hover:border-gold/50 hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold disabled:opacity-50 dark:border-white/15 dark:text-gray-100"
              >
                <Printer size={15} aria-hidden="true" />
                {isPreparingPrint ? (language === 'en' ? 'Preparing…' : 'በማዘጋጀት ላይ…') : (language === 'en' ? 'Print Or Save As PDF' : 'ያትሙ ወይም PDF ያስቀምጡ')}
              </button>
              <button
                onClick={handleCopyLink}
                className="btn-press inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-black/10 px-3 py-1.5 text-sm font-semibold text-nearblack transition-colors hover:border-gold/50 hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold dark:border-white/15 dark:text-gray-100"
              >
                <Copy size={15} aria-hidden="true" />
                {copiedLink ? (language === 'en' ? 'Link Copied' : 'ተቀድቷል') : (language === 'en' ? 'Copy Link' : 'አገናኙን ቅዳ')}
              </button>
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(article.title + ' ' + window.location.href)}`}
                target="_blank"
                rel="noreferrer"
                aria-label={language === 'en' ? 'Share On WhatsApp' : 'በዋትስአፕ አጋራ'}
                className="inline-flex size-9 items-center justify-center rounded-md border border-black/10 text-mediumgrey transition-colors hover:border-gold/50 hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold dark:border-white/15 dark:text-gray-300"
              >
                <MessageSquare size={15} aria-hidden="true" />
              </a>
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(article.title)}`}
                target="_blank"
                rel="noreferrer"
                aria-label={language === 'en' ? 'Share On X' : 'በX አጋራ'}
                className="inline-flex size-9 items-center justify-center rounded-md border border-black/10 text-mediumgrey transition-colors hover:border-gold/50 hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold dark:border-white/15 dark:text-gray-300"
              >
                <Share2 size={15} aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>

        {/* Cover Image (full-width) specified max 480px tall */}
        {article.coverImage && (
          <div className="w-full max-h-[440px] print:max-h-[240px] rounded-xl overflow-hidden mb-12 print:mb-6 border border-black/5 shadow-inner print:shadow-none">
            <img
              src={article.coverImage}
              alt={getTranslatedText(article.title, article.titleAm)}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover max-h-[440px] print:max-h-[240px]"
            />
          </div>
        )}

        {/* Single reading column: the text gets the whole page */}
        <div className="print:block print:w-full">

          <div className="mx-auto max-w-[720px] space-y-8 paper-print-content print:w-full print:max-w-full">
            
            {/* Contents list: collapsed by default and only shown when there are enough headings to navigate */}
            {headings.length >= 3 && (
              <details className="no-print group rounded-lg border border-black/10 px-4 py-3 dark:border-white/10">
                <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-nearblack focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold dark:text-white">
                  <span>{language === 'en' ? `Contents (${headings.length})` : `የይዘት ማውጫ (${headings.length})`}</span>
                  <ChevronRight size={16} aria-hidden="true" className="text-gold group-open:rotate-90" />
                </summary>
                <ol className="mt-3 space-y-2 border-l border-gold/40 pl-4 text-sm">
                  {headings.map((h) => (
                    <li key={h.id} style={{ marginLeft: h.level === 3 ? '12px' : '0px' }}>
                      <button
                        onClick={() => handleHeadingClick(h.id)}
                        className={`cursor-pointer text-left hover:text-gold ${activeHeadingId === h.id ? 'font-semibold text-gold' : 'text-mediumgrey dark:text-gray-300'}`}
                      >
                        {h.text}
                      </button>
                    </li>
                  ))}
                </ol>
              </details>
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

            {/* PRINT-ONLY SCHOLARLY FOOTER */}
            <div className="paper-print-footer hidden print:block mt-12 pt-5 border-t-2 border-gold/40 text-[10.5px] font-sans text-mediumgrey">
              <div className="flex justify-between items-center pb-2">
                <div className="font-serif text-sm font-bold text-navy">
                  {t('brand.name')} <span className="text-gold font-sans text-xs font-normal">| {t('brand.tagline')}</span>
                </div>
                <div className="font-mono text-[10px] text-nearblack font-semibold">
                  {printTimestamp}
                </div>
              </div>
              <div className="flex flex-wrap justify-between items-center text-[9.5px] text-lightgrey border-t border-black/5 pt-2">
                <span>
                  {language === 'en'
                    ? 'Official theological paper repository. Printed for personal study and ministry research.'
                    : 'ይህ ጥናታዊ ጽሑፍ ለግል እና ለአካዳሚክ ምርምር የታተመ ነው።'}
                </span>
                <span className="font-mono">
                  {window.location.href}
                </span>
              </div>
            </div>

            {/* Subject tags sit quietly after the text instead of taking sidebar space */}
            {article.tags.length > 0 && (
              <div className="no-print flex flex-wrap gap-2 font-sans">
                {article.tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => navigateTo(`/tags/${tag}`)}
                    className="cursor-pointer rounded-md border border-black/10 px-2.5 py-1 text-sm text-mediumgrey transition-colors hover:border-gold/50 hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold dark:border-white/15 dark:text-gray-300"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}

            {/* Reactions Block row */}
            <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs mt-8 sm:mt-10 shadow-xs leading-relaxed no-print">
              <span className="font-serif font-semibold text-nearblack dark:text-white text-center md:text-left text-sm text-balance">Did this article support your research or address your doubts?</span>
              <div className="flex flex-wrap justify-center gap-2 w-full md:w-auto">
                <button
                  onClick={() => handleReactionClick('helpful')}
                  className={`min-h-[40px] px-3.5 py-1.5 rounded-full border transition-colors duration-150 flex items-center gap-1.5 cursor-pointer font-semibold touch-manipulation active:opacity-90 ${
                    userReaction === 'helpful'
                      ? 'bg-gold/15 border-gold text-gold font-bold shadow-xs'
                      : 'bg-transparent border-black/10 dark:border-white/10 text-mediumgrey dark:text-gray-300 hover:border-gold/30'
                  }`}
                >
                  <ThumbsUp size={14} />
                  <span>Helpful ({reactions.helpful})</span>
                </button>
                <button
                  onClick={() => handleReactionClick('insightful')}
                  className={`min-h-[40px] px-3.5 py-1.5 rounded-full border transition-colors duration-150 flex items-center gap-1.5 cursor-pointer font-semibold touch-manipulation active:opacity-90 ${
                    userReaction === 'insightful'
                      ? 'bg-gold/15 border-gold text-gold font-bold shadow-xs'
                      : 'bg-transparent border-black/10 dark:border-white/10 text-mediumgrey dark:text-gray-300 hover:border-gold/30'
                  }`}
                >
                  <Smile size={14} />
                  <span>Insightful ({reactions.insightful})</span>
                </button>
                <button
                  onClick={() => handleReactionClick('rigorous')}
                  className={`min-h-[40px] px-3.5 py-1.5 rounded-full border transition-colors duration-150 flex items-center gap-1.5 cursor-pointer font-semibold touch-manipulation active:opacity-90 ${
                    userReaction === 'rigorous'
                      ? 'bg-gold/15 border-gold text-gold font-bold shadow-xs'
                      : 'bg-transparent border-black/10 dark:border-white/10 text-mediumgrey dark:text-gray-300 hover:border-gold/30'
                  }`}
                >
                  <Award size={14} />
                  <span>Rigorous ({reactions.rigorous})</span>
                </button>
              </div>
            </div>

            {/* Next in Path Banner if applicable */}
            {nextArticleBanner && <div className="mt-8 no-print">{nextArticleBanner}</div>}

            {/* Related Articles Row */}
            {relatedArticles.length > 0 && (
              <div className="pt-10 space-y-5 no-print">
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
            <div className="pt-12 border-t border-black/10 dark:border-white/10 space-y-8 no-print">
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

              {commentError && (
                <div role="alert" className="p-4 bg-rose-950/40 border border-rose-800/40 text-rose-300 rounded-md text-xs text-center">
                  {commentError}
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

        </div>

      </div>
    </article>
  );
}
