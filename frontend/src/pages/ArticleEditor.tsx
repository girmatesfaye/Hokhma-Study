/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Article, ContentSection, Difficulty, Footnote } from '../types';
import {
  ArrowLeft,
  Save,
  Trash2,
  Plus,
  BookMarked,
  Quote,
  Eye,
  Settings,
  X,
  Image,
  Tag,
  Globe,
  FileText,
  Search,
  MoveUp,
  MoveDown,
  Sparkles,
  Clock,
  Calendar,
  ChevronUp,
  ChevronDown,
  Sliders,
  AlignLeft,
  Heading2,
  List,
  Upload,
  Loader2
} from 'lucide-react';
import * as articlesService from '../services/articles';
import { cn } from '../lib/cn';
import { Badge, Button, Panel, Switch } from '../components/admin/ui';
import { uploadCoverImage } from '../services/upload';

export default function ArticleEditor() {
  const { currentRoute, articles, topics, paths, addArticle, updateArticle, navigateTo, isAdmin } = useApp();

  const articleId = currentRoute.id || '';
  const isNew = articleId === 'new';

  const initialArticle = !isNew
    ? articles.find((a) => a.id === articleId || a.slug === articleId)
    : null;

  // States
  const [editedArticle, setEditedArticle] = useState<Article | null>(() => {
    if (isNew) {
      return {
        id: '',
        slug: `draft-${Date.now()}`,
        title: 'Untitled Article Draft',
        titleAm: 'ርዕስ አልባ ረቂቅ ጽሑፍ',
        topicSlug: topics[0]?.slug || 'philosophy',
        difficulty: 'beginner',
        readingTime: 5,
        publishDate: new Date().toISOString().split('T')[0],
        excerpt: 'Preliminary summary of what this research paper addresses.',
        excerptAm: 'ይህ አዲሱ የምርምር ጽሑፍ የሚመልሰውን ጉዳይ የሚገልጽ የመግቢያ ማጠቃለያ ነው።',
        content: [
          { type: 'paragraph', text: 'Begin writing your long-form publication arguments here...', textAm: 'እዚህ ጋር ረዥም ጽሑፍዎን መጻፍ መጀመር ይችላሉ...' }
        ],
        footnotes: [],
        tags: ['draft'],
        featured: false,
        isPublished: false,
        commentsAllowed: true,
        views: 0
      };
    }
    return initialArticle ? JSON.parse(JSON.stringify(initialArticle)) : null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(!isNew && !initialArticle);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [newTagInput, setNewTagInput] = useState('');
  const [autosaveStatus, setAutosaveStatus] = useState('No Unsaved Changes');
  const [newFootnoteText, setNewFootnoteText] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [previewLang, setPreviewLang] = useState<'en' | 'am'>('en');
  const [activeTab, setActiveTab] = useState<'en' | 'am' | 'footnotes' | 'seo'>('en');
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Browsers show their own confirmation when the tab is closed while edits are unsaved
  useEffect(() => {
    if (autosaveStatus !== 'Unsaved Changes') return;
    const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warnBeforeLeaving);
    return () => window.removeEventListener('beforeunload', warnBeforeLeaving);
  }, [autosaveStatus]);

  // Synchronize or fetch article data
  useEffect(() => {
    if (isNew) {
      if (!editedArticle) {
        setEditedArticle({
          id: '',
          slug: `draft-${Date.now()}`,
          title: 'Untitled Article Draft',
          titleAm: 'ርዕስ አልባ ረቂቅ ጽሑፍ',
          topicSlug: topics[0]?.slug || 'philosophy',
          difficulty: 'beginner',
          readingTime: 5,
          publishDate: new Date().toISOString().split('T')[0],
          excerpt: 'Preliminary summary of what this research paper addresses.',
          excerptAm: 'ይህ አዲሱ የምርምር ጽሑፍ የሚመልሰውን ጉዳይ የሚገልጽ የመግቢያ ማጠቃለያ ነው።',
          content: [
            { type: 'paragraph', text: 'Begin writing your long-form publication arguments here...', textAm: 'እዚህ ጋር ረዥም ጽሑፍዎን መጻፍ መጀመር ይችላሉ...' }
          ],
          footnotes: [],
          tags: ['draft'],
          featured: false,
          isPublished: false,
          commentsAllowed: true,
          views: 0
        });
      }
      setIsLoading(false);
      return;
    }

    if (initialArticle) {
      setEditedArticle(JSON.parse(JSON.stringify(initialArticle)));
      setIsLoading(false);
      return;
    }

    if (!articleId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    articlesService
      .getArticleBySlug(articleId)
      .then((fetched) => {
        if (fetched) {
          setEditedArticle(JSON.parse(JSON.stringify(fetched)));
        }
      })
      .catch(() => {
        articlesService
          .getArticles({ all: true })
          .then((all) => {
            const found = all.find(
              (a) => a.id === articleId || a.slug === articleId
            );
            if (found) {
              setEditedArticle(JSON.parse(JSON.stringify(found)));
            }
          })
          .catch((err) => console.error('[ArticleEditor] Failed to fetch article:', err));
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [articleId, initialArticle, isNew]);

  // Handle file selection and upload cover image to server
  const handleCoverImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size must be smaller than 5 MB.');
      return;
    }

    setIsUploadingCover(true);
    setUploadError(null);
    try {
      const result = await uploadCoverImage(file);
      updateField('coverImage', result.url);
      setAutosaveStatus('Unsaved Changes');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to upload cover image. Please try again.';
      setUploadError(msg);
    } finally {
      setIsUploadingCover(false);
      if (e.target) e.target.value = '';
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-slate-50 p-6 dark:bg-dark-bg">
        <Panel className="max-w-md space-y-4 p-8 text-center">
          <h1 className="font-serif text-2xl font-semibold text-nearblack dark:text-white">Sign In Required</h1>
          <p className="text-sm text-mediumgrey dark:text-gray-400">Only the site author can write or edit articles.</p>
          <Button variant="primary" onClick={() => navigateTo('/admin/login')}>Go To Sign In</Button>
        </Panel>
      </div>
    );
  }

  // Structural skeleton that mirrors the header, tabs and editor body while the article loads
  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1480px] space-y-5 px-3 py-6 md:px-6" aria-busy="true" aria-label="Loading Article">
        <div className="h-16 rounded-lg bg-slate-200 dark:bg-white/10" />
        <div className="grid gap-5 lg:grid-cols-12">
          <div className="h-96 rounded-xl bg-slate-200 dark:bg-white/10 lg:col-span-8" />
          <div className="h-96 rounded-xl bg-slate-200 dark:bg-white/10 lg:col-span-4" />
        </div>
      </div>
    );
  }

  if (!editedArticle) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-slate-50 p-6 dark:bg-dark-bg">
        <Panel className="max-w-md space-y-4 p-8 text-center">
          <h1 className="font-serif text-2xl font-semibold text-nearblack dark:text-white">Article Not Found</h1>
          <p className="text-sm text-mediumgrey dark:text-gray-400">This article may have been deleted. Go back to the workroom to pick another.</p>
          <Button variant="primary" onClick={() => navigateTo('/admin')}>Back To Workroom</Button>
        </Panel>
      </div>
    );
  }

  // Once an article has been published its URL is fixed, so paths, questions and shared links keep working
  const isSlugLocked = Boolean(editedArticle.id) && Boolean(articles.find((a) => a.id === editedArticle.id)?.isPublished);

  // Update a single core field of Article
  const updateField = (field: keyof Article, value: any) => {
    setEditedArticle((prev) => {
      if (!prev) return null;
      const next = { ...prev, [field]: value };
      if (field === 'title') {
        // Follow the title only while the SEO title is still the auto-generated one, so custom SEO titles survive
        if (!prev.seoTitle || prev.seoTitle === `${prev.title} | Hokhma Study`) {
          next.seoTitle = `${value} | Hokhma Study`;
        }
        // A title with no Latin letters would give an empty slug, so keep the existing slug in that case
        const generatedSlug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        if (!isSlugLocked && generatedSlug) next.slug = generatedSlug;
      }
      return next;
    });
    setAutosaveStatus('Unsaved Changes');
  };

  // Content block manipulation
  const handleAddContentBlock = (type: ContentSection['type'], level?: 2 | 3) => {
    if (!editedArticle) return;
    const newBlock: ContentSection = {
      type,
      text: type === 'scripture' ? 'Enter scripture quote here...' : 'Enter new block paragraph...',
      textAm: type === 'scripture' ? 'የጥቅስ ቃል እዚህ ይጻፉ...' : 'አዲስ አንቀጽ እዚህ ይጻፉ...',
      level,
      items: type === 'list' ? ['Enter list item...'] : undefined,
      itemsAm: type === 'list' ? ['የዝርዝር ነጥብ እዚህ ይጻፉ...'] : undefined,
      reference: type === 'scripture' ? 'Book 0:0' : undefined,
      referenceAm: type === 'scripture' ? 'መጽሐፍ 0:0' : undefined
    };
    updateField('content', [...editedArticle.content, newBlock]);
    setAutosaveStatus('Unsaved Changes');
  };

  const updateBlock = (idx: number, updates: Partial<ContentSection>) => {
    if (!editedArticle) return;
    const updatedContent = editedArticle.content.map((sec, i) =>
      i === idx ? { ...sec, ...updates } : sec
    );
    updateField('content', updatedContent);
  };

  const handleDeleteContentBlock = (idx: number) => {
    if (!editedArticle) return;
    updateField('content', editedArticle.content.filter((_, i) => i !== idx));
    setAutosaveStatus('Unsaved Changes');
  };

  const handleMoveBlock = (idx: number, direction: 'up' | 'down') => {
    if (!editedArticle) return;
    const nextContent = [...editedArticle.content];
    if (direction === 'up' && idx > 0) {
      const temp = nextContent[idx];
      nextContent[idx] = nextContent[idx - 1];
      nextContent[idx - 1] = temp;
    } else if (direction === 'down' && idx < nextContent.length - 1) {
      const temp = nextContent[idx];
      nextContent[idx] = nextContent[idx + 1];
      nextContent[idx + 1] = temp;
    }
    updateField('content', nextContent);
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTagInput.trim() && editedArticle) {
      const cleanTag = newTagInput.trim().toLowerCase();
      if (!editedArticle.tags.includes(cleanTag)) {
        updateField('tags', [...editedArticle.tags, cleanTag]);
        setNewTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagIdx: number) => {
    if (!editedArticle) return;
    updateField('tags', editedArticle.tags.filter((_, i) => i !== tagIdx));
  };

  const handleAddFootnote = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFootnoteText.trim() && editedArticle) {
      const newFn: Footnote = {
        id: editedArticle.footnotes.length + 1,
        text: newFootnoteText.trim()
      };
      updateField('footnotes', [...editedArticle.footnotes, newFn]);
      setNewFootnoteText('');
      setAutosaveStatus('Unsaved Changes');
    }
  };

  const handleRemoveFootnote = (fnId: number) => {
    if (!editedArticle) return;
    const filteredFn = editedArticle.footnotes
      .filter((fn) => fn.id !== fnId)
      .map((fn, idx) => ({ ...fn, id: idx + 1 }));
    updateField('footnotes', filteredFn);
  };

  const handleSaveRevisions = async () => {
    if (!editedArticle) return;
    setIsSaving(true);
    setAutosaveStatus('Saving…');
    try {
      if (isNew || !editedArticle.id) {
        await addArticle(editedArticle);
        setAutosaveStatus('Article Created');
      } else {
        await updateArticle(editedArticle);
        setAutosaveStatus('Changes Saved');
      }
      setTimeout(() => {
        navigateTo('/admin');
      }, 700);
    } catch (err: any) {
      console.error('[ArticleEditor] Failed to save revisions:', err);
      const msg = err?.response?.data?.message || 'The article could not be saved. Check the highlighted fields and try again.';
      setAutosaveStatus(`Error: ${msg}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div id="article-editor-page" className="min-h-dvh bg-slate-50 px-3 py-4 font-sans dark:bg-dark-bg md:px-6 md:py-6">
      <div className="mx-auto max-w-[1480px] space-y-5">
        
        {/* Sticky header: back, title and status on the left; preview and save on the right */}
        <div className="sticky top-0 z-40 -mx-3 flex flex-col gap-3 border-b border-slate-200 bg-white px-3 py-3 dark:border-white/10 dark:bg-dark-card md:-mx-6 md:flex-row md:items-center md:justify-between md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Button variant="ghost" aria-label="Back To Workroom" onClick={() => navigateTo('/admin')}>
              <ArrowLeft className="size-4" aria-hidden="true" />
            </Button>
            <div className="min-w-0">
              <h1 className="truncate font-serif text-xl font-semibold text-nearblack dark:text-white">
                {editedArticle.title || 'Untitled Article'}
              </h1>
              <p className="mt-0.5 flex items-center gap-2 text-sm">
                <Badge tone={editedArticle.isPublished ? 'success' : 'neutral'}>{editedArticle.isPublished ? 'Published' : 'Draft'}</Badge>
                <span
                  role="status"
                  className={autosaveStatus.startsWith('Error') ? 'text-rose-700 dark:text-rose-300' : autosaveStatus === 'Unsaved Changes' ? 'text-amber-700 dark:text-gold' : 'text-mediumgrey dark:text-gray-400'}
                >
                  {autosaveStatus}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button onClick={() => setPreviewMode(!previewMode)}>
              <Eye className="size-4" aria-hidden="true" />
              {previewMode ? 'Back To Editing' : 'Reader Preview'}
            </Button>
            <Button id="save-revisions-btn" variant="primary" disabled={isSaving} onClick={handleSaveRevisions}>
              {isSaving ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Save className="size-4" aria-hidden="true" />}
              {isNew || !editedArticle.id ? 'Create Article' : 'Save Changes'}
            </Button>
          </div>
        </div>

        {previewMode ? (
          /* PREMIUM PREVIEW MANUSCRIPT INTERFACE */
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-xl p-6 md:p-12 max-w-3xl mx-auto space-y-8 shadow-md">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/5 pb-4">
              <span className="text-sm font-semibold text-gold tabular-nums">Reader Preview</span>
              <div className="flex rounded-lg bg-slate-50 dark:bg-slate-950 p-1 border dark:border-white/15">
                <button
                  onClick={() => setPreviewLang('en')}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${previewLang === 'en' ? 'bg-white dark:bg-slate-850 text-gold shadow-sm' : 'text-slate-500'}`}
                >
                  English View
                </button>
                <button
                  onClick={() => setPreviewLang('am')}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${previewLang === 'am' ? 'bg-white dark:bg-slate-850 text-gold shadow-sm' : 'text-slate-500'}`}
                >
                  አማርኛ እይታ
                </button>
              </div>
            </div>

            <div className="text-center space-y-3">
              <h1 className="font-serif text-3xl font-bold leading-tight text-slate-900 dark:text-white">
                {previewLang === 'en' ? editedArticle.title : (editedArticle.titleAm || editedArticle.title)}
              </h1>
              <p className="text-sm text-slate-500 dark:text-gray-500 tabular-nums">
                {editedArticle.publishDate} · {editedArticle.views} Reads · {editedArticle.readingTime} Min Read
              </p>
            </div>

            {editedArticle.coverImage && (
              <div className="aspect-[21/9] rounded-md overflow-hidden border border-slate-100 dark:border-white/10 shadow-sm">
                <img src={editedArticle.coverImage} alt="Cover" className="w-full h-full object-cover" />
              </div>
            )}

            <p className="text-sm font-semibold italic text-slate-600 dark:text-gray-300 leading-relaxed border-l-4 border-gold/40 pl-4 py-1">
              {previewLang === 'en' ? editedArticle.excerpt : (editedArticle.excerptAm || editedArticle.excerpt)}
            </p>

            <div className="text-sm md:text-base leading-relaxed text-slate-700 dark:text-gray-300 space-y-6 font-serif">
              {editedArticle.content.map((sec, i) => {
                const text = previewLang === 'en' ? sec.text : (sec.textAm || sec.text);
                if (sec.type === 'header') {
                  return (
                    <h2 key={i} className="font-serif font-bold text-xl pt-4 text-slate-900 dark:text-white">
                      {text}
                    </h2>
                  );
                }
                if (sec.type === 'scripture') {
                  const ref = previewLang === 'en' ? sec.reference : (sec.referenceAm || sec.reference);
                  return (
                    <div key={i} className="pl-5 border-l-3 border-gold my-6 text-sm bg-slate-50/50 dark:bg-white/[0.02] p-4 rounded-r-xl italic leading-relaxed text-slate-800 dark:text-gray-200">
                      “{text}”
                      {ref && <div className="text-right text-gold font-sans text-sm font-semibold mt-2">— {ref}</div>}
                    </div>
                  );
                }
                return <p key={i} className="text-justify">{text}</p>;
              })}
            </div>

            {editedArticle.footnotes.length > 0 && (
              <div className="pt-8 border-t border-slate-100 dark:border-white/5 space-y-2">
                <h4 className="font-serif text-sm font-bold text-slate-500">Bibliography Footnotes</h4>
                <div className="space-y-1">
                  {editedArticle.footnotes.map((fn) => (
                    <p key={fn.id} className="text-xs text-slate-500 dark:text-gray-500 font-serif leading-relaxed">
                      <span className="tabular-nums text-gold font-bold mr-1.5">[{fn.id}]</span>
                      {fn.text}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* REDESIGNED TWO-COLUMN WORKSPACE */
          <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-12 lg:gap-7">
            
            {/* LEFT COMPILER PANEL (8 Columns) */}
            <main className="lg:col-span-8 space-y-6">
              
              {/* Content tabs: the two languages, citations and search settings */}
              <div role="tablist" aria-label="Article Sections" className="flex gap-1 overflow-x-auto rounded-lg border border-slate-200 bg-white p-1 dark:border-white/10 dark:bg-dark-card">
                {([
                  { id: 'en', icon: FileText, label: 'English Content' },
                  { id: 'am', icon: Globe, label: 'አማርኛ ይዘት' },
                  { id: 'footnotes', icon: BookMarked, label: 'Citations' },
                  { id: 'seo', icon: Search, label: 'SEO Metadata' },
                ] as const).map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={activeTab === tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        'flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-md px-4 py-2 text-sm font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold',
                        activeTab === tab.id
                          ? 'bg-navy text-white dark:bg-gold dark:text-slate-950'
                          : 'text-mediumgrey hover:text-nearblack dark:text-gray-400 dark:hover:text-white'
                      )}
                    >
                      <Icon className="size-4" aria-hidden="true" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* CORE EDITOR WRAPPERS */}
              <div className="space-y-6 rounded-xl border border-black/5 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-dark-card md:p-7">
                
                {activeTab === 'en' && (
                  <div className="space-y-6">
                    {/* English Title */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-semibold text-slate-500 font-sans">Manuscript Title (English)</label>
                        <span className="text-xs tabular-nums text-slate-500">{(editedArticle.title || '').length} characters</span>
                      </div>
                      <input
                        type="text"
                        placeholder="Enter manuscript title (e.g., The Historical Credibility)..."
                        value={editedArticle.title}
                        onChange={(e) => updateField('title', e.target.value)}
                        className="w-full text-xl font-serif font-bold text-slate-900 dark:text-white bg-transparent border-b border-slate-150 focus:border-gold focus:outline-none pb-2 transition-colors placeholder:text-slate-300 dark:placeholder:text-slate-700"
                      />
                    </div>

                    {/* English Excerpt */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-semibold text-slate-500 font-sans">Summary Abstract (English Excerpt)</label>
                        <span className="text-xs tabular-nums text-slate-500">{(editedArticle.excerpt || '').length} characters</span>
                      </div>
                      <textarea
                        rows={2}
                        value={editedArticle.excerpt}
                        onChange={(e) => updateField('excerpt', e.target.value)}
                        className="w-full px-4 py-3 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-white/5 rounded-md focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/20 font-serif leading-relaxed text-slate-800 dark:text-gray-300 transition-all placeholder:text-slate-500"
                        placeholder="Write a concise abstract summarizing the core defense arguments or answers in this paper..."
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'am' && (
                  <div className="space-y-6">
                    {/* Amharic Title */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-semibold text-amber-600 dark:text-gold font-sans">የዕጅ ጽሑፍ አርዕስት (Amharic Title)</label>
                        <button 
                          onClick={() => updateField('titleAm', editedArticle.title)}
                          className="text-xs font-sans font-bold text-gold hover:underline cursor-pointer"
                        >
                          Copy English Title
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder="የጽሑፉን አርዕስት እዚህ ያስገቡ..."
                        value={editedArticle.titleAm || ''}
                        onChange={(e) => updateField('titleAm', e.target.value)}
                        className="w-full text-xl font-serif font-bold text-slate-900 dark:text-white bg-transparent border-b border-slate-150 focus:border-gold focus:outline-none pb-2 transition-colors placeholder:text-slate-300 dark:placeholder:text-slate-700"
                      />
                    </div>

                    {/* Amharic Excerpt */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-semibold text-amber-600 dark:text-gold font-sans">አጭር ማጠቃለያ (Amharic Excerpt)</label>
                        <button 
                          onClick={() => updateField('excerptAm', editedArticle.excerpt)}
                          className="text-xs font-sans font-bold text-gold hover:underline cursor-pointer"
                        >
                          Copy English Abstract
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        value={editedArticle.excerptAm || ''}
                        onChange={(e) => updateField('excerptAm', e.target.value)}
                        className="w-full px-4 py-3 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-white/5 rounded-md focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/20 font-serif leading-relaxed text-slate-800 dark:text-gray-300 transition-all placeholder:text-slate-500"
                        placeholder="ለጽሑፉ አጭርና ግልጽ ማጠቃለያ መግለጫ እዚህ ይጻፉ..."
                      />
                    </div>
                  </div>
                )}

                {/* WYSIWYG CONTENT BLOCKS LIST (For 'en' and 'am' tabs) */}
                {(activeTab === 'en' || activeTab === 'am') && (
                  <div className="space-y-5 border-t border-slate-100 dark:border-white/5 pt-6">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-500 font-sans">Manuscript Content Blocks</span>
                      <span className="text-xs tabular-nums text-slate-500">{editedArticle.content.length} Blocks Total</span>
                    </div>

                    {/* STICKY-LIKE FLOATING WYSIWYG BAR */}
                    <div className="flex flex-wrap items-center gap-1.5 rounded-md border border-black/5 bg-slate-50 p-2 dark:border-white/5 dark:bg-slate-950">
                      <span className="text-sm font-semibold text-slate-500 px-2 font-sans">Insert Block:</span>
                      <div className="h-4 w-px bg-slate-200 dark:bg-white/10" />
                      
                      <button
                        type="button"
                        onClick={() => handleAddContentBlock('paragraph')}
                        className="btn-press py-1.5 px-3 text-sm bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-850 text-slate-700 dark:text-gray-200 border border-slate-200 dark:border-white/5 hover:border-gold/30 rounded-lg inline-flex items-center gap-1.5 font-semibold transition-all cursor-pointer shadow-sm"
                        title="Add normal paragraph block"
                      >
                        <AlignLeft size={11} className="text-slate-500" />
                        <span>Paragraph</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAddContentBlock('header', 2)}
                        className="btn-press py-1.5 px-3 text-sm bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-850 text-slate-700 dark:text-gray-200 border border-slate-200 dark:border-white/5 hover:border-gold/30 rounded-lg inline-flex items-center gap-1.5 font-semibold transition-all cursor-pointer shadow-sm"
                        title="Add heading section block"
                      >
                        <Heading2 size={11} className="text-blue-500" />
                        <span>Section Heading</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAddContentBlock('scripture')}
                        className="btn-press py-1.5 px-3 text-sm bg-amber-500/5 hover:bg-amber-500/10 dark:bg-amber-500/10 dark:hover:bg-amber-500/15 text-amber-600 dark:text-gold border border-amber-500/20 rounded-lg inline-flex items-center gap-1.5 font-semibold transition-all cursor-pointer shadow-sm"
                        title="Insert Scripture Quote block with citation"
                      >
                        <Quote size={11} className="text-gold" />
                        <span>Scripture Block</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAddContentBlock('list')}
                        className="btn-press py-1.5 px-3 text-sm bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-850 text-slate-700 dark:text-gray-200 border border-slate-200 dark:border-white/5 hover:border-gold/30 rounded-lg inline-flex items-center gap-1.5 font-semibold transition-all cursor-pointer shadow-sm"
                        title="Add a list block"
                      >
                        <List size={11} className="text-emerald-500" />
                        <span>List</span>
                      </button>
                    </div>

                    {/* CONTENT BLOCKS RENDERER */}
                    <div className="space-y-4 max-h-[580px] overflow-y-auto pr-1">
                      {editedArticle.content.map((sec, idx) => {
                        const isScripture = sec.type === 'scripture';
                        const isHeader = sec.type === 'header';
                        const isList = sec.type === 'list';
                        
                        return (
                          <div
                            key={idx}
                            className={`relative space-y-3 rounded-md border p-4 shadow-sm transition-all group ${
                              isScripture
                                ? 'bg-amber-50/10 dark:bg-[#1A1813] border-gold/25'
                                : isHeader
                                ? 'bg-slate-50/30 dark:bg-slate-900/40 border-slate-150 dark:border-white/10 font-bold'
                                : 'bg-white dark:bg-slate-900 border-slate-150 dark:border-white/5'
                            }`}
                          >
                            {/* Block Header with metadata & handles */}
                            <div className="flex justify-between items-center text-xs font-sans text-slate-500 border-b border-slate-100 dark:border-white/5 pb-2">
                              <div className="flex items-center gap-1.5">
                                <span className="tabular-nums text-slate-300">#{idx + 1}</span>
                                <span className={`font-semibold text-sm ${isScripture ? 'text-gold' : isHeader ? 'text-blue-500' : 'text-slate-500'}`}>
                                  {isScripture ? 'Scripture Quote' : isHeader ? 'Section Header' : isList ? 'List Block' : 'Paragraph Block'}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleMoveBlock(idx, 'up')}
                                  className="btn-press p-1 hover:bg-slate-100 dark:hover:bg-white/5 rounded text-slate-500 hover:text-gold transition-colors cursor-pointer"
                                  title="Move Up"
                                >
                                  <MoveUp size={11} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMoveBlock(idx, 'down')}
                                  className="btn-press p-1 hover:bg-slate-100 dark:hover:bg-white/5 rounded text-slate-500 hover:text-gold transition-colors cursor-pointer"
                                  title="Move Down"
                                >
                                  <MoveDown size={11} />
                                </button>
                                <span className="h-3.5 w-px bg-slate-200 dark:bg-white/10 mx-1" />
                                <button
                                  type="button"
                                  onClick={() => handleDeleteContentBlock(idx)}
                                  className="btn-press py-0.5 px-2 text-rose-500 hover:bg-rose-500/10 rounded font-sans font-semibold text-sm transition-all cursor-pointer"
                                  title="Delete Block"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>

                            {isHeader && (
                              <div className="flex items-center gap-2 text-sm">
                                <label htmlFor={`heading-level-${idx}`} className="font-semibold text-slate-500">Heading Level</label>
                                <select
                                  id={`heading-level-${idx}`}
                                  value={sec.level || 2}
                                  onChange={(e) => updateBlock(idx, { level: parseInt(e.target.value) as 2 | 3 })}
                                  className="px-2 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-white/10 rounded-lg text-slate-800 dark:text-white"
                                >
                                  <option value={2}>Section Heading</option>
                                  <option value={3}>Subheading</option>
                                </select>
                              </div>
                            )}

                            {/* Block Language-Specific Input */}
                            <div className="space-y-2">
                              {activeTab === 'en' ? (
                                <div className="space-y-1">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-semibold text-slate-500 font-sans">English Paragraph Text</span>
                                    {isScripture && (
                                      <span className="text-xs text-slate-300 tabular-nums">Quotes map reference automatically</span>
                                    )}
                                  </div>
                                  <textarea
                                    rows={isHeader ? 1 : 3}
                                    value={sec.text}
                                    onChange={(e) => updateBlock(idx, { text: e.target.value })}
                                    className={`w-full bg-slate-50/50 dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none border border-slate-150 dark:border-white/5 rounded-lg focus:border-gold/50 focus:ring-1 focus:ring-gold/20 text-slate-800 dark:text-gray-200 font-serif leading-relaxed`}
                                  />
                                </div>
                              ) : (
                                <div className="space-y-1">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-semibold text-amber-600 dark:text-gold font-sans">የአማርኛ ይዘት (Amharic Translation)</span>
                                    <button 
                                      type="button"
                                      onClick={() => updateBlock(idx, { textAm: sec.text })}
                                      className="text-xs font-sans text-gold hover:underline"
                                    >
                                      Copy English Text
                                    </button>
                                  </div>
                                  <textarea
                                    rows={isHeader ? 1 : 3}
                                    value={sec.textAm || ''}
                                    onChange={(e) => updateBlock(idx, { textAm: e.target.value })}
                                    className={`w-full bg-slate-50/50 dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none border border-gold/15 hover:border-gold/25 dark:border-white/5 rounded-lg focus:border-gold/50 focus:ring-1 focus:ring-gold/20 text-slate-800 dark:text-gray-200 font-serif leading-relaxed`}
                                    placeholder="አማርኛ ትርጉም እዚህ ይጻፉ..."
                                  />
                                </div>
                              )}
                            </div>

                            {/* Additional parameters for Scripture Citation */}
                            {isScripture && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-white/5">
                                {activeTab === 'en' ? (
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-slate-500 font-sans whitespace-nowrap">Scripture Reference:</span>
                                    <input
                                      type="text"
                                      value={sec.reference || ''}
                                      onChange={(e) => updateBlock(idx, { reference: e.target.value })}
                                      placeholder="E.g., Genesis 1:1"
                                      className="px-2.5 py-1 w-full text-sm bg-slate-50 dark:bg-slate-950 text-gold border border-slate-200 dark:border-white/10 rounded-lg focus:border-gold focus:outline-none font-bold font-sans"
                                    />
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-amber-600 dark:text-gold font-sans whitespace-nowrap">የጥቅስ ማውጫ:</span>
                                    <input
                                      type="text"
                                      value={sec.referenceAm || ''}
                                      onChange={(e) => updateBlock(idx, { referenceAm: e.target.value })}
                                      placeholder="ለምሳሌ፥ ዘፍጥረት 1:1"
                                      className="px-2.5 py-1 w-full text-sm bg-slate-50 dark:bg-slate-950 text-gold border border-gold/15 dark:border-white/10 rounded-lg focus:border-gold focus:outline-none font-bold font-sans"
                                    />
                                  </div>
                                )}
                              </div>
                            )}

                            {isList && (
                              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/5">
                                <label className="text-sm font-semibold text-slate-500 font-sans">{activeTab === 'en' ? 'List Items' : 'የዝርዝር ነጥቦች'}</label>
                                {(activeTab === 'en' ? (sec.items || []) : (sec.itemsAm || [])).map((item, itemIdx) => (
                                  <div key={itemIdx} className="flex gap-2">
                                    <input
                                      type="text"
                                      value={item}
                                      onChange={(e) => {
                                        const key = activeTab === 'en' ? 'items' : 'itemsAm';
                                        const items = [...(activeTab === 'en' ? (sec.items || []) : (sec.itemsAm || []))];
                                        items[itemIdx] = e.target.value;
                                        updateBlock(idx, { [key]: items });
                                      }}
                                      className="flex-1 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-white/5 rounded-lg text-slate-800 dark:text-gray-200 focus:outline-none focus:border-gold"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const key = activeTab === 'en' ? 'items' : 'itemsAm';
                                        const items = (activeTab === 'en' ? (sec.items || []) : (sec.itemsAm || [])).filter((_, i) => i !== itemIdx);
                                        updateBlock(idx, { [key]: items });
                                      }}
                                      className="px-2 text-rose-500 hover:bg-rose-500/10 rounded-lg"
                                      title="Remove list item"
                                    >
                                      <X size={13} />
                                    </button>
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const key = activeTab === 'en' ? 'items' : 'itemsAm';
                                    const items = [...(activeTab === 'en' ? (sec.items || []) : (sec.itemsAm || [])), ''];
                                    updateBlock(idx, { [key]: items });
                                  }}
                                  className="text-xs font-bold text-gold hover:underline"
                                >
                                  Add List Item
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* TAB: FOOTNOTES BIBLIOGRAPHY */}
                {activeTab === 'footnotes' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white">Manuscript Bibliography Citations</h3>
                      <p className="text-sm text-slate-500">Map precise citations as clickable superscript annotations throughout the manuscript paper flow.</p>
                    </div>

                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                      {editedArticle.footnotes.length === 0 ? (
                        <div className="p-8 border border-dashed border-slate-200 dark:border-white/5 rounded-md text-center text-sm text-slate-500">
                          No footnotes mapped to this paper. Add one below to structure an academic defense.
                        </div>
                      ) : (
                        editedArticle.footnotes.map((fn) => (
                          <div key={fn.id} className="p-3 border border-slate-100 dark:border-white/5 rounded-md bg-slate-50/50 dark:bg-white/[0.01] text-sm flex justify-between items-center gap-4">
                            <span className="text-gold font-bold tabular-nums px-2 bg-slate-100 dark:bg-slate-800 rounded py-0.5">[{fn.id}]</span>
                            <span className="flex-1 font-serif text-slate-700 dark:text-gray-300 line-clamp-2 leading-relaxed">{fn.text}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveFootnote(fn.id)}
                              className="text-rose-500 hover:text-rose-700 p-1 hover:bg-rose-500/10 rounded transition-all cursor-pointer"
                              title="Delete citation"
                            >
                              ✕
                            </button>
                          </div>
                        ))
                      )}
                    </div>

                    <form onSubmit={handleAddFootnote} className="space-y-2 border-t border-slate-150 dark:border-white/5 pt-4">
                      <label className="text-sm font-semibold text-slate-500 font-sans">Add Citation Entry</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          required
                          placeholder="E.g., Lewis, C.S., 'Mere Christianity', Macmillan Pub, 1943, p. 54..."
                          value={newFootnoteText}
                          onChange={(e) => setNewFootnoteText(e.target.value)}
                          className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-white/10 rounded-md focus:border-gold focus:outline-none bg-slate-50 dark:bg-slate-950 text-sm font-serif text-slate-900 dark:text-white"
                        />
                        <button
                          type="submit"
                          className="btn-press px-5 py-2.5 bg-navy text-white dark:bg-gold dark:text-slate-950 font-sans text-sm font-bold rounded-md hover:bg-opacity-90 whitespace-nowrap cursor-pointer shadow-sm transition-colors"
                        >
                          Add Citation
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* TAB: SEO METADATA METERS */}
                {activeTab === 'seo' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white">Search Engine Optimization</h3>
                      <p className="text-sm text-slate-500">Optimize search metadata headers to index this defensive paper efficiently on Google and Bing.</p>
                    </div>

                    <div className="space-y-4">
                      {/* Meta Title */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-500 font-semibold">Meta Title Header</span>
                          <span className={`font-mono font-bold ${((editedArticle.seoTitle || '').length > 60 || (editedArticle.seoTitle || '').length === 0) ? 'text-rose-500' : 'text-emerald-500'}`}>
                            {(editedArticle.seoTitle || '').length}/60 characters
                          </span>
                        </div>
                        <input
                          type="text"
                          value={editedArticle.seoTitle || ''}
                          onChange={(e) => updateField('seoTitle', e.target.value)}
                          className="w-full px-4 py-2.5 text-sm rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-white/10 text-slate-800 dark:text-gray-200 focus:outline-none focus:border-gold"
                          placeholder="E.g., The Credibility of the New Testament | Hokhma Study"
                        />
                      </div>

                      {/* Meta Description */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-500 font-semibold">Meta Description Abstract</span>
                          <span className={`font-mono font-bold ${((editedArticle.seoDescription || '').length > 160 || (editedArticle.seoDescription || '').length === 0) ? 'text-rose-500' : 'text-emerald-500'}`}>
                            {(editedArticle.seoDescription || '').length}/160 characters
                          </span>
                        </div>
                        <textarea
                          rows={3}
                          value={editedArticle.seoDescription || ''}
                          onChange={(e) => updateField('seoDescription', e.target.value)}
                          className="w-full px-4 py-2.5 text-sm rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-white/10 text-slate-800 dark:text-gray-200 focus:outline-none focus:border-gold leading-relaxed font-sans"
                          placeholder="Provide a high-quality summary explaining what the visitor will read. Safe length is under 160 characters..."
                        />
                      </div>

                      {/* slug / permalink */}
                      <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-white/5">
                        <label className="text-sm font-semibold text-slate-500 block font-sans">URL Slug / Permalink Identifier</label>
                        <div className="flex items-center gap-1 text-sm text-slate-500 bg-slate-50 dark:bg-slate-950 px-3 py-2 rounded-md border border-slate-150 dark:border-white/10">
                          <span className="font-mono text-xs">/articles/</span>
                          <input
                            type="text"
                            value={editedArticle.slug}
                            disabled={isSlugLocked}
                            onChange={(e) => updateField('slug', e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}
                            className="bg-transparent border-none text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-none flex-1 p-0 disabled:opacity-60"
                          />
                        </div>
                        {isSlugLocked && (
                          <p className="text-xs text-slate-500">Locked Because This Article Is Published. Changing It Would Break Existing Links.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </main>

            {/* RIGHT SIDEBAR CONTROLLER PANEL (4 Columns) */}
            <aside className="space-y-5 lg:col-span-4 lg:sticky lg:top-24 lg:self-start">
              
              {/* PUBLISHING PARAMETERS CARD */}
              <div className="space-y-4 rounded-xl border border-black/5 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-dark-card">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-3">
                  <Sliders size={14} className="text-gold" />
                  <h3 className="font-serif text-sm font-bold text-slate-900 dark:text-white">Publishing</h3>
                </div>

                <Switch
                  label="Published"
                  description={editedArticle.isPublished ? 'Visible to every reader.' : 'Private until you turn this on.'}
                  checked={editedArticle.isPublished}
                  onChange={(value) => updateField('isPublished', value)}
                />
                <Switch
                  label="Feature On Home Page"
                  description="Show this article first on the home page."
                  checked={editedArticle.featured}
                  onChange={(value) => updateField('featured', value)}
                />
                <Switch
                  label="Allow Comments"
                  description="Readers can comment; you approve each one."
                  checked={editedArticle.commentsAllowed}
                  onChange={(value) => updateField('commentsAllowed', value)}
                />

                {/* Article Language index mapping */}
                <div className="flex flex-col gap-1 pt-3 border-t border-slate-100 dark:border-white/5 text-sm">
                  <span className="font-bold text-slate-800 dark:text-gray-200">Article Language</span>
                  <select
                    value={editedArticle.lang || 'en'}
                    onChange={(e) => updateField('lang', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-white/10 rounded-md font-semibold text-slate-800 dark:text-white focus:outline-none"
                  >
                    <option value="en">English Content Only</option>
                    <option value="am">Amharic Content Only</option>
                    <option value="bilingual">Bilingual (English + Amharic)</option>
                  </select>
                </div>
              </div>

              {/* TAXONOMY & DIFFICULTY DEPTH */}
              <div className="space-y-4 rounded-xl border border-black/5 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-dark-card">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-3">
                  <BookMarked size={14} className="text-gold" />
                  <h3 className="font-serif text-sm font-bold text-slate-900 dark:text-white">Classification</h3>
                </div>

                {/* Category Selection */}
                <div className="space-y-1 text-sm">
                  <label className="font-bold text-slate-800 dark:text-gray-200 block">Topic</label>
                  <select
                    value={editedArticle.topicSlug}
                    onChange={(e) => updateField('topicSlug', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-white/10 rounded-md text-sm font-semibold text-slate-800 dark:text-white"
                  >
                    {topics.map((t) => (
                      <option key={t.slug} value={t.slug}>{t.name}</option>
                    ))}
                  </select>
                </div>

                {/* Difficulty Depth segment control */}
                <div className="space-y-1.5 text-sm pt-1">
                  <label className="font-bold text-slate-800 dark:text-gray-200 block">Difficulty</label>
                  <div className="grid grid-cols-3 gap-1 rounded-md bg-slate-50 dark:bg-slate-950 p-1 border border-slate-150 dark:border-white/5">
                    {(['beginner', 'intermediate', 'deep-dive'] as Difficulty[]).map((diff) => (
                      <button
                        key={diff}
                        type="button"
                        onClick={() => updateField('difficulty', diff)}
                        className={`btn-press py-1.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                          editedArticle.difficulty === diff
                            ? 'bg-navy text-white dark:bg-gold dark:text-slate-950 font-bold shadow-sm'
                            : 'text-slate-500 hover:text-slate-950 dark:text-gray-400 dark:hover:text-white'
                        }`}
                      >
                        {diff === 'deep-dive' ? 'Deep Dive' : diff === 'intermediate' ? 'Intermediate' : 'Beginner'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reading Time Slider/Input */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-white/5 text-sm">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-800 dark:text-gray-200 flex items-center gap-1">
                      <Clock size={11} className="text-gold" />
                      <span>Reading Time</span>
                    </label>
                    <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5 rounded-md border border-slate-150 dark:border-white/10">
                      <input
                        type="number"
                        min={1}
                        max={120}
                        value={editedArticle.readingTime}
                        onChange={(e) => updateField('readingTime', parseInt(e.target.value) || 5)}
                        className="bg-transparent border-none text-sm font-bold text-slate-800 dark:text-white w-full focus:outline-none p-0 text-center"
                      />
                      <span className="text-xs text-slate-500">min</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-800 dark:text-gray-200 flex items-center gap-1">
                      <Calendar size={11} className="text-gold" />
                      <span>Publish Date</span>
                    </label>
                    <input
                      type="date"
                      value={editedArticle.publishDate}
                      onChange={(e) => updateField('publishDate', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 px-2 py-1 text-sm font-bold text-slate-800 dark:text-white border border-slate-150 dark:border-white/10 rounded-md focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Cover image container */}
              <div className="space-y-4 rounded-xl border border-black/5 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-dark-card">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-3">
                  <Image size={14} className="text-gold" />
                  <h3 className="font-serif text-sm font-bold text-slate-900 dark:text-white">Cover Graphic</h3>
                </div>

                {editedArticle.coverImage && (
                  <div className="aspect-[16/10] rounded-md overflow-hidden border border-slate-100 dark:border-white/10 shadow-sm relative group bg-slate-950">
                    <img src={editedArticle.coverImage} alt="Cover Preview" className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500 opacity-90" />
                    <button 
                      type="button"
                      onClick={() => updateField('coverImage', '')}
                      className="absolute top-2 right-2 p-1 bg-slate-950/80 hover:bg-slate-950 text-white rounded-full text-sm transition-colors"
                      title="Clear image"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
                
                {uploadError && (
                  <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                    {uploadError}
                  </div>
                )}

                {/* File upload input */}
                <div className="space-y-2">
                  <label className="font-bold text-slate-800 dark:text-gray-200 block text-sm">Upload Cover Image</label>
                  <label className={`flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-md cursor-pointer transition-colors ${
                    isUploadingCover
                      ? 'border-gold/50 bg-gold/5'
                      : 'border-slate-200 dark:border-white/10 hover:border-gold/60 bg-slate-50 dark:bg-slate-950/50'
                  }`}>
                    {isUploadingCover ? (
                      <div className="flex items-center gap-2 text-gold text-sm">
                        <Loader2 size={16} className="animate-spin" />
                        <span>Uploading Image...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1.5 text-center">
                        <Upload size={18} className="text-gold" />
                        <span className="text-sm font-semibold text-slate-700 dark:text-gray-200">Choose Image File</span>
                        <span className="text-xs text-gray-400">PNG, JPG, WEBP, or GIF up to 5 MB</span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isUploadingCover}
                      onChange={handleCoverImageFileChange}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="space-y-1 text-sm pt-1">
                  <label className="font-bold text-slate-800 dark:text-gray-200 block">Or Enter Direct Image URL</label>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    value={editedArticle.coverImage || ''}
                    onChange={(e) => updateField('coverImage', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-white/10 rounded-md focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              {/* Path membership is defined by a path's steps, so the editor only reports it */}
              <div className="space-y-3 rounded-xl border border-black/5 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-dark-card">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-3">
                  <Sparkles size={14} className="text-gold" />
                  <h3 className="font-serif text-sm font-bold text-slate-900 dark:text-white">Learning Path</h3>
                </div>
                {(() => {
                  const savedArticle = articles.find((a) => a.id === editedArticle.id);
                  const path = paths.find((p) => p.slug === savedArticle?.partInPath?.pathSlug);
                  return (
                    <p className="text-sm leading-relaxed text-slate-500 dark:text-gray-400">
                      {path && savedArticle?.partInPath
                        ? `Appears In "${path.title}" As Step ${savedArticle.partInPath.position}. `
                        : 'This Article Is Not Part Of A Learning Path. '}
                      Add Or Reorder It From Learning Paths In The Dashboard.
                    </p>
                  );
                })()}
              </div>

              {/* KEYWORD TAG CHIPS */}
              <div className="space-y-4 rounded-xl border border-black/5 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-dark-card">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-3">
                  <Tag size={14} className="text-gold" />
                  <h3 className="font-serif text-sm font-bold text-slate-900 dark:text-white">Manuscript Tags</h3>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {editedArticle.tags.length === 0 ? (
                    <span className="text-xs text-slate-500">No tag keywords linked to this paper.</span>
                  ) : (
                    editedArticle.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-150 dark:border-white/5 text-xs text-slate-800 dark:text-slate-200 whitespace-nowrap"
                      >
                        <span>#{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(i)}
                          className="text-rose-500 font-bold hover:text-rose-700 text-xs ml-0.5"
                        >
                          ×
                        </button>
                      </span>
                    ))
                  )}
                </div>

                <form onSubmit={handleAddTag} className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="Enter tag label..."
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    className="flex-1 px-3 py-1.5 border border-slate-200 dark:border-white/10 text-sm bg-slate-50 dark:bg-slate-950 rounded-md text-slate-800 dark:text-white focus:outline-none focus:border-gold"
                  />
                  <button
                    type="submit"
                    className="btn-press px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-gray-300 text-sm font-bold rounded-md transition-colors cursor-pointer"
                  >
                    Add
                  </button>
                </form>
              </div>

            </aside>

          </div>
        )}

      </div>
    </div>
  );
}
