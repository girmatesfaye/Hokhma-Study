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
  Heading2
} from 'lucide-react';

export default function ArticleEditor() {
  const { currentRoute, articles, topics, paths, updateArticle, navigateTo, isAdmin } = useApp();

  const articleId = currentRoute.id || '';
  const initialArticle = articles.find((a) => a.id === articleId);

  // States
  const [editedArticle, setEditedArticle] = useState<Article | null>(null);
  const [newTagInput, setNewTagInput] = useState('');
  const [autosaveStatus, setAutosaveStatus] = useState('All changes saved locally');
  const [newFootnoteText, setNewFootnoteText] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [previewLang, setPreviewLang] = useState<'en' | 'am'>('en');
  const [activeTab, setActiveTab] = useState<'en' | 'am' | 'footnotes' | 'seo'>('en');

  // Synchronize initial article
  useEffect(() => {
    if (initialArticle) {
      setEditedArticle(JSON.parse(JSON.stringify(initialArticle)));
    }
  }, [initialArticle]);

  if (!isAdmin) {
    return (
      <div className="absolute inset-0 bg-slate-950 flex justify-center items-center z-50 p-6 text-center animate-fade-in text-white">
        <div className="max-w-md bg-slate-900 border border-white/10 rounded-2xl p-8 space-y-6 shadow-2xl">
          <Trash2 className="text-gold h-12 w-12 mx-auto" />
          <h2 className="font-serif text-xl font-bold">Workspace Blocked</h2>
          <p className="text-xs text-gray-400">Secure validation is required to access primary manuscript editors.</p>
          <button onClick={() => navigateTo('/admin/login')} className="px-6 py-2 bg-gold hover:bg-gold/90 text-slate-950 text-xs font-bold font-sans uppercase tracking-wider rounded transition-colors cursor-pointer">
            Authenticate Access
          </button>
        </div>
      </div>
    );
  }

  if (!editedArticle) {
    return (
      <div className="max-w-[1140px] mx-auto px-4 py-20 text-center animate-fade-in">
        <h2 className="font-serif text-2xl font-bold">Unmapped Article Entry</h2>
        <p className="text-mediumgrey text-xs mt-2">The article draft does not correspond to an existing record.</p>
        <button onClick={() => navigateTo('/admin')} className="mt-6 px-4 py-2 bg-navy text-white text-xs font-bold uppercase tracking-wider rounded cursor-pointer">
          Workroom Dashboard
        </button>
      </div>
    );
  }

  // Update a single core field of Article
  const updateField = (field: keyof Article, value: any) => {
    setEditedArticle((prev) => {
      if (!prev) return null;
      const next = { ...prev, [field]: value };
      if (field === 'title') {
        next.seoTitle = `${value} | Hokhma Study`;
        next.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }
      return next;
    });
    setAutosaveStatus('Draft modified...');
  };

  // Content block manipulation
  const handleAddContentBlock = (type: ContentSection['type'], level?: 2 | 3) => {
    if (!editedArticle) return;
    const newBlock: ContentSection = {
      type,
      text: type === 'scripture' ? 'Enter scripture quote here...' : 'Enter new block paragraph...',
      textAm: type === 'scripture' ? 'የጥቅስ ቃል እዚህ ይጻፉ...' : 'አዲስ አንቀጽ እዚህ ይጻፉ...',
      level,
      reference: type === 'scripture' ? 'Book 0:0' : undefined,
      referenceAm: type === 'scripture' ? 'መጽሐፍ 0:0' : undefined
    };
    updateField('content', [...editedArticle.content, newBlock]);
    setAutosaveStatus('Block added...');
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
    setAutosaveStatus('Block removed...');
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
      setAutosaveStatus('Citation added...');
    }
  };

  const handleRemoveFootnote = (fnId: number) => {
    if (!editedArticle) return;
    const filteredFn = editedArticle.footnotes
      .filter((fn) => fn.id !== fnId)
      .map((fn, idx) => ({ ...fn, id: idx + 1 }));
    updateField('footnotes', filteredFn);
  };

  const handleSaveRevisions = () => {
    if (editedArticle) {
      updateArticle(editedArticle);
      setAutosaveStatus('Revisions published!');
      setTimeout(() => {
        navigateTo('/admin');
      }, 800);
    }
  };

  return (
    <div id="article-editor-page" className="animate-fade-in bg-slate-50/50 dark:bg-slate-950/40 min-h-screen py-8 px-4 md:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* TOP ACTION HEADER */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigateTo('/admin')}
              className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white transition-all border border-slate-100 dark:border-white/5 cursor-pointer shadow-sm"
              title="Return to Workroom"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-sans text-xs font-bold tracking-widest text-gold">Manuscript Workspace</span>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider ${editedArticle.isPublished ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25' : 'bg-amber-500/10 text-amber-600 dark:text-gold border border-amber-500/25'}`}>
                  {editedArticle.isPublished ? 'Published' : 'Draft'}
                </span>
              </div>
              <h1 className="font-serif text-lg font-bold text-slate-900 dark:text-white mt-0.5 line-clamp-1">
                {editedArticle.title || 'Untitled Manuscript'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto self-stretch md:self-auto justify-end">
            <p className="hidden lg:flex items-center gap-1.5 text-xs text-slate-400 dark:text-gray-500 font-mono mr-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
              <span>{autosaveStatus}</span>
            </p>

            <button
              onClick={() => setPreviewMode(!previewMode)}
              className={`px-4 py-2 text-xs font-bold tracking-wider rounded-lg border flex items-center gap-2 transition-all cursor-pointer ${
                previewMode 
                  ? 'bg-slate-100 border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-white' 
                  : 'bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 border-slate-200 dark:border-white/10 text-slate-700 dark:text-gray-300'
              }`}
            >
              <Eye size={13} />
              <span>{previewMode ? 'Edit Mode' : 'Live Preview'}</span>
            </button>

            <button
              onClick={handleSaveRevisions}
              className="px-5 py-2 text-xs font-bold tracking-wider rounded-lg bg-navy hover:bg-navy/90 dark:bg-gold dark:text-slate-950 dark:hover:bg-gold/90 text-white flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
            >
              <Save size={13} />
              <span>Save Revisions</span>
            </button>
          </div>
        </div>

        {previewMode ? (
          /* PREMIUM PREVIEW MANUSCRIPT INTERFACE */
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-2xl p-6 md:p-12 max-w-3xl mx-auto space-y-8 shadow-md">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/5 pb-4">
              <span className="text-[10px] uppercase tracking-widest text-gold font-mono">Simulated Reader Context</span>
              <div className="flex rounded-lg bg-slate-50 dark:bg-slate-950 p-1 border dark:border-white/15">
                <button
                  onClick={() => setPreviewLang('en')}
                  className={`px-3 py-1 text-[10px] font-bold rounded-md transition-colors ${previewLang === 'en' ? 'bg-white dark:bg-slate-850 text-gold shadow-sm' : 'text-slate-400'}`}
                >
                  English View
                </button>
                <button
                  onClick={() => setPreviewLang('am')}
                  className={`px-3 py-1 text-[10px] font-bold rounded-md transition-colors ${previewLang === 'am' ? 'bg-white dark:bg-slate-850 text-gold shadow-sm' : 'text-slate-400'}`}
                >
                  አማርኛ እይታ
                </button>
              </div>
            </div>

            <div className="text-center space-y-3">
              <h1 className="font-serif text-3xl font-bold leading-tight text-slate-900 dark:text-white">
                {previewLang === 'en' ? editedArticle.title : (editedArticle.titleAm || editedArticle.title)}
              </h1>
              <p className="text-xs text-slate-400 dark:text-gray-500 font-mono">
                {editedArticle.publishDate} · Reads: {editedArticle.views} · Reads: {editedArticle.readingTime} min
              </p>
            </div>

            {editedArticle.coverImage && (
              <div className="aspect-[21/9] rounded-xl overflow-hidden border border-slate-100 dark:border-white/10 shadow-sm">
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
                    <h2 key={i} className="font-serif font-bold text-xl pt-4 text-slate-900 dark:text-white tracking-tight">
                      {text}
                    </h2>
                  );
                }
                if (sec.type === 'scripture') {
                  const ref = previewLang === 'en' ? sec.reference : (sec.referenceAm || sec.reference);
                  return (
                    <div key={i} className="pl-5 border-l-3 border-gold my-6 text-sm bg-slate-50/50 dark:bg-white/[0.02] p-4 rounded-r-xl italic leading-relaxed text-slate-800 dark:text-gray-200">
                      “{text}”
                      {ref && <div className="text-right text-gold font-sans text-[10px] font-bold uppercase tracking-wider mt-2">— {ref}</div>}
                    </div>
                  );
                }
                return <p key={i} className="text-justify">{text}</p>;
              })}
            </div>

            {editedArticle.footnotes.length > 0 && (
              <div className="pt-8 border-t border-slate-100 dark:border-white/5 space-y-2">
                <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-slate-500">Bibliography Footnotes</h4>
                <div className="space-y-1">
                  {editedArticle.footnotes.map((fn) => (
                    <p key={fn.id} className="text-[11px] text-slate-400 dark:text-gray-500 font-serif leading-relaxed">
                      <span className="font-mono text-gold font-bold mr-1.5">[{fn.id}]</span>
                      {fn.text}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* REDESIGNED TWO-COLUMN WORKSPACE */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT COMPILER PANEL (8 Columns) */}
            <main className="lg:col-span-8 space-y-6">
              
              {/* COMPACT CHOPPED TAB COMPONENT */}
              <div className="flex border-b border-slate-100 dark:border-white/10 overflow-x-auto bg-white dark:bg-slate-900 p-1.5 rounded-xl border shadow-sm gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('en')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'en' 
                      ? 'bg-slate-100 dark:bg-slate-850 text-slate-900 dark:text-white shadow-inner' 
                      : 'text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white'
                  }`}
                >
                  <FileText size={14} className={activeTab === 'en' ? 'text-gold' : ''} />
                  <span>English Content</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('am')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'am' 
                      ? 'bg-slate-100 dark:bg-slate-850 text-slate-900 dark:text-white shadow-inner' 
                      : 'text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white'
                  }`}
                >
                  <Globe size={14} className={activeTab === 'am' ? 'text-gold' : ''} />
                  <span>አማርኛ ይዘት (Amharic)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('footnotes')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'footnotes' 
                      ? 'bg-slate-100 dark:bg-slate-850 text-slate-900 dark:text-white shadow-inner' 
                      : 'text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white'
                  }`}
                >
                  <BookMarked size={14} className={activeTab === 'footnotes' ? 'text-gold' : ''} />
                  <span>Bibliography Citation</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('seo')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'seo' 
                      ? 'bg-slate-100 dark:bg-slate-850 text-slate-900 dark:text-white shadow-inner' 
                      : 'text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white'
                  }`}
                >
                  <Search size={14} className={activeTab === 'seo' ? 'text-gold' : ''} />
                  <span>SEO Metadata</span>
                </button>
              </div>

              {/* CORE EDITOR WRAPPERS */}
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-2xl p-6 shadow-sm space-y-6">
                
                {activeTab === 'en' && (
                  <div className="space-y-6 animate-fade-in">
                    {/* English Title */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-sans">Manuscript Title (English)</label>
                        <span className="text-[9px] font-mono text-slate-400">{(editedArticle.title || '').length} characters</span>
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
                        <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-sans">Summary Abstract (English Excerpt)</label>
                        <span className="text-[9px] font-mono text-slate-400">{(editedArticle.excerpt || '').length} characters</span>
                      </div>
                      <textarea
                        rows={2}
                        value={editedArticle.excerpt}
                        onChange={(e) => updateField('excerpt', e.target.value)}
                        className="w-full px-4 py-3 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-white/5 rounded-xl focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/20 font-serif leading-relaxed text-slate-800 dark:text-gray-300 transition-all placeholder:text-slate-400"
                        placeholder="Write a concise abstract summarizing the core defense arguments or answers in this paper..."
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'am' && (
                  <div className="space-y-6 animate-fade-in">
                    {/* Amharic Title */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] uppercase font-bold tracking-wider text-amber-600 dark:text-gold font-sans">የዕጅ ጽሑፍ አርዕስት (Amharic Title)</label>
                        <button 
                          onClick={() => updateField('titleAm', editedArticle.title)}
                          className="text-[9px] font-sans font-bold text-gold hover:underline cursor-pointer"
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
                        <label className="text-[10px] uppercase font-bold tracking-wider text-amber-600 dark:text-gold font-sans">አጭር ማጠቃለያ (Amharic Excerpt)</label>
                        <button 
                          onClick={() => updateField('excerptAm', editedArticle.excerpt)}
                          className="text-[9px] font-sans font-bold text-gold hover:underline cursor-pointer"
                        >
                          Copy English Abstract
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        value={editedArticle.excerptAm || ''}
                        onChange={(e) => updateField('excerptAm', e.target.value)}
                        className="w-full px-4 py-3 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-white/5 rounded-xl focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/20 font-serif leading-relaxed text-slate-800 dark:text-gray-300 transition-all placeholder:text-slate-400"
                        placeholder="ለጽሑፉ አጭርና ግልጽ ማጠቃለያ መግለጫ እዚህ ይጻፉ..."
                      />
                    </div>
                  </div>
                )}

                {/* WYSIWYG CONTENT BLOCKS LIST (For 'en' and 'am' tabs) */}
                {(activeTab === 'en' || activeTab === 'am') && (
                  <div className="space-y-5 border-t border-slate-100 dark:border-white/5 pt-6">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-sans">Manuscript Content Blocks</span>
                      <span className="text-[9px] font-mono text-slate-400">{editedArticle.content.length} Blocks Total</span>
                    </div>

                    {/* STICKY-LIKE FLOATING WYSIWYG BAR */}
                    <div className="flex flex-wrap items-center gap-1.5 bg-slate-50 dark:bg-slate-950 p-2 rounded-xl border border-slate-150 dark:border-white/5">
                      <span className="text-[9px] uppercase font-bold text-slate-400 px-2 font-sans">Insert Block:</span>
                      <div className="h-4 w-px bg-slate-200 dark:bg-white/10" />
                      
                      <button
                        type="button"
                        onClick={() => handleAddContentBlock('paragraph')}
                        className="py-1.5 px-3 text-[10px] uppercase bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-850 text-slate-700 dark:text-gray-200 border border-slate-200 dark:border-white/5 hover:border-gold/30 rounded-lg inline-flex items-center gap-1.5 font-bold transition-all cursor-pointer shadow-sm"
                        title="Add normal paragraph block"
                      >
                        <AlignLeft size={11} className="text-slate-400" />
                        <span>Paragraph</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAddContentBlock('header', 2)}
                        className="py-1.5 px-3 text-[10px] uppercase bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-850 text-slate-700 dark:text-gray-200 border border-slate-200 dark:border-white/5 hover:border-gold/30 rounded-lg inline-flex items-center gap-1.5 font-bold transition-all cursor-pointer shadow-sm"
                        title="Add heading section block"
                      >
                        <Heading2 size={11} className="text-blue-500" />
                        <span>Section Heading</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAddContentBlock('scripture')}
                        className="py-1.5 px-3 text-[10px] uppercase bg-amber-500/5 hover:bg-amber-500/10 dark:bg-amber-500/10 dark:hover:bg-amber-500/15 text-amber-600 dark:text-gold border border-amber-500/20 rounded-lg inline-flex items-center gap-1.5 font-bold transition-all cursor-pointer shadow-sm"
                        title="Insert Scripture Quote block with citation"
                      >
                        <Quote size={11} className="text-gold" />
                        <span>Scripture Block</span>
                      </button>
                    </div>

                    {/* CONTENT BLOCKS RENDERER */}
                    <div className="space-y-4 max-h-[580px] overflow-y-auto pr-1">
                      {editedArticle.content.map((sec, idx) => {
                        const isScripture = sec.type === 'scripture';
                        const isHeader = sec.type === 'header';
                        
                        return (
                          <div
                            key={idx}
                            className={`p-4 border rounded-xl relative space-y-3 group transition-all shadow-sm ${
                              isScripture
                                ? 'bg-amber-50/10 dark:bg-[#1A1813] border-gold/25'
                                : isHeader
                                ? 'bg-slate-50/30 dark:bg-slate-900/40 border-slate-150 dark:border-white/10 font-bold'
                                : 'bg-white dark:bg-slate-900 border-slate-150 dark:border-white/5'
                            }`}
                          >
                            {/* Block Header with metadata & handles */}
                            <div className="flex justify-between items-center text-[10px] font-sans text-slate-400 border-b border-slate-100 dark:border-white/5 pb-2">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-slate-300">#{idx + 1}</span>
                                <span className={`uppercase font-bold tracking-wider text-[9px] ${isScripture ? 'text-gold' : isHeader ? 'text-blue-500' : 'text-slate-400'}`}>
                                  {isScripture ? 'Scripture Quote' : isHeader ? 'Section Header' : 'Paragraph Block'}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleMoveBlock(idx, 'up')}
                                  className="p-1 hover:bg-slate-100 dark:hover:bg-white/5 rounded text-slate-400 hover:text-gold transition-colors cursor-pointer"
                                  title="Move Up"
                                >
                                  <MoveUp size={11} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMoveBlock(idx, 'down')}
                                  className="p-1 hover:bg-slate-100 dark:hover:bg-white/5 rounded text-slate-400 hover:text-gold transition-colors cursor-pointer"
                                  title="Move Down"
                                >
                                  <MoveDown size={11} />
                                </button>
                                <span className="h-3.5 w-px bg-slate-200 dark:bg-white/10 mx-1" />
                                <button
                                  type="button"
                                  onClick={() => handleDeleteContentBlock(idx)}
                                  className="py-0.5 px-2 text-rose-500 hover:bg-rose-500/10 rounded font-sans font-semibold text-[9px] uppercase tracking-wider transition-all cursor-pointer"
                                  title="Delete Block"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>

                            {/* Block Language-Specific Input */}
                            <div className="space-y-2">
                              {activeTab === 'en' ? (
                                <div className="space-y-1">
                                  <div className="flex justify-between items-center">
                                    <span className="text-[9px] uppercase font-bold text-slate-400 font-sans">English Paragraph Text</span>
                                    {isScripture && (
                                      <span className="text-[8px] text-slate-300 uppercase font-mono">Quotes map reference automatically</span>
                                    )}
                                  </div>
                                  <textarea
                                    rows={isHeader ? 1 : 3}
                                    value={sec.text}
                                    onChange={(e) => updateBlock(idx, { text: e.target.value })}
                                    className={`w-full bg-slate-50/50 dark:bg-slate-950 px-3 py-2 text-xs focus:outline-none border border-slate-150 dark:border-white/5 rounded-lg focus:border-gold/50 focus:ring-1 focus:ring-gold/20 text-slate-800 dark:text-gray-200 font-serif leading-relaxed`}
                                  />
                                </div>
                              ) : (
                                <div className="space-y-1">
                                  <div className="flex justify-between items-center">
                                    <span className="text-[9px] uppercase font-bold text-amber-600 dark:text-gold font-sans">የአማርኛ ይዘት (Amharic Translation)</span>
                                    <button 
                                      type="button"
                                      onClick={() => updateBlock(idx, { textAm: sec.text })}
                                      className="text-[8px] font-sans text-gold hover:underline"
                                    >
                                      Copy English Text
                                    </button>
                                  </div>
                                  <textarea
                                    rows={isHeader ? 1 : 3}
                                    value={sec.textAm || ''}
                                    onChange={(e) => updateBlock(idx, { textAm: e.target.value })}
                                    className={`w-full bg-slate-50/50 dark:bg-slate-950 px-3 py-2 text-xs focus:outline-none border border-gold/15 hover:border-gold/25 dark:border-white/5 rounded-lg focus:border-gold/50 focus:ring-1 focus:ring-gold/20 text-slate-800 dark:text-gray-200 font-serif leading-relaxed`}
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
                                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 font-sans whitespace-nowrap">Scripture Reference:</span>
                                    <input
                                      type="text"
                                      value={sec.reference || ''}
                                      onChange={(e) => updateBlock(idx, { reference: e.target.value })}
                                      placeholder="E.g., Genesis 1:1"
                                      className="px-2.5 py-1 w-full text-xs bg-slate-50 dark:bg-slate-950 text-gold border border-slate-200 dark:border-white/10 rounded-lg focus:border-gold focus:outline-none font-bold font-sans"
                                    />
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-bold uppercase tracking-wider text-amber-600 dark:text-gold font-sans whitespace-nowrap">የጥቅስ ማውጫ:</span>
                                    <input
                                      type="text"
                                      value={sec.referenceAm || ''}
                                      onChange={(e) => updateBlock(idx, { referenceAm: e.target.value })}
                                      placeholder="ለምሳሌ፥ ዘፍጥረት 1:1"
                                      className="px-2.5 py-1 w-full text-xs bg-slate-50 dark:bg-slate-950 text-gold border border-gold/15 dark:border-white/10 rounded-lg focus:border-gold focus:outline-none font-bold font-sans"
                                    />
                                  </div>
                                )}
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
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white">Manuscript Bibliography Citations</h3>
                      <p className="text-xs text-slate-400">Map precise citations as clickable superscript annotations throughout the manuscript paper flow.</p>
                    </div>

                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                      {editedArticle.footnotes.length === 0 ? (
                        <div className="p-8 border border-dashed border-slate-200 dark:border-white/5 rounded-xl text-center text-xs text-slate-400">
                          No footnotes mapped to this paper. Add one below to structure an academic defense.
                        </div>
                      ) : (
                        editedArticle.footnotes.map((fn) => (
                          <div key={fn.id} className="p-3 border border-slate-100 dark:border-white/5 rounded-xl bg-slate-50/50 dark:bg-white/[0.01] text-xs flex justify-between items-center gap-4">
                            <span className="text-gold font-bold font-mono px-2 bg-slate-100 dark:bg-slate-800 rounded py-0.5">[{fn.id}]</span>
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
                      <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-sans">Add Citation Entry</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          required
                          placeholder="E.g., Lewis, C.S., 'Mere Christianity', Macmillan Pub, 1943, p. 54..."
                          value={newFootnoteText}
                          onChange={(e) => setNewFootnoteText(e.target.value)}
                          className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-white/10 rounded-xl focus:border-gold focus:outline-none bg-slate-50 dark:bg-slate-950 text-xs font-serif text-slate-900 dark:text-white"
                        />
                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-navy text-white dark:bg-gold dark:text-slate-950 font-sans text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-opacity-90 whitespace-nowrap cursor-pointer shadow-sm"
                        >
                          Add Citation
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* TAB: SEO METADATA METERS */}
                {activeTab === 'seo' && (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white">Search Engine Optimization</h3>
                      <p className="text-xs text-slate-400">Optimize search metadata headers to index this defensive paper efficiently on Google and Bing.</p>
                    </div>

                    <div className="space-y-4">
                      {/* Meta Title */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-slate-400 uppercase font-bold">META TITLE HEADER</span>
                          <span className={`font-mono font-bold ${((editedArticle.seoTitle || '').length > 60 || (editedArticle.seoTitle || '').length === 0) ? 'text-rose-500' : 'text-emerald-500'}`}>
                            {(editedArticle.seoTitle || '').length}/60 characters
                          </span>
                        </div>
                        <input
                          type="text"
                          value={editedArticle.seoTitle || ''}
                          onChange={(e) => updateField('seoTitle', e.target.value)}
                          className="w-full px-4 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-white/10 text-slate-800 dark:text-gray-200 focus:outline-none focus:border-gold"
                          placeholder="E.g., The Credibility of the New Testament | Hokhma Study"
                        />
                      </div>

                      {/* Meta Description */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-slate-400 uppercase font-bold">META DESCRIPTION ABSTRACT</span>
                          <span className={`font-mono font-bold ${((editedArticle.seoDescription || '').length > 160 || (editedArticle.seoDescription || '').length === 0) ? 'text-rose-500' : 'text-emerald-500'}`}>
                            {(editedArticle.seoDescription || '').length}/160 characters
                          </span>
                        </div>
                        <textarea
                          rows={3}
                          value={editedArticle.seoDescription || ''}
                          onChange={(e) => updateField('seoDescription', e.target.value)}
                          className="w-full px-4 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-white/10 text-slate-800 dark:text-gray-200 focus:outline-none focus:border-gold leading-relaxed font-sans"
                          placeholder="Provide a high-quality summary explaining what the visitor will read. Safe length is under 160 characters..."
                        />
                      </div>

                      {/* slug / permalink */}
                      <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-white/5">
                        <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block font-sans">URL Slug / Permalink Identifier</label>
                        <div className="flex items-center gap-1 text-xs text-slate-400 bg-slate-50 dark:bg-slate-950 px-3 py-2 rounded-xl border border-slate-150 dark:border-white/10">
                          <span className="font-mono text-[10px]">/articles/</span>
                          <input
                            type="text"
                            value={editedArticle.slug}
                            onChange={(e) => updateField('slug', e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}
                            className="bg-transparent border-none text-slate-900 dark:text-white font-mono font-bold text-xs focus:outline-none flex-1 p-0"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </main>

            {/* RIGHT SIDEBAR CONTROLLER PANEL (4 Columns) */}
            <aside className="lg:col-span-4 space-y-6">
              
              {/* PUBLISHING PARAMETERS CARD */}
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-3">
                  <Sliders size={14} className="text-gold" />
                  <h3 className="font-serif text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Publish Parameters</h3>
                </div>

                {/* Published Toggle */}
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-gray-200 block">Publish Status</span>
                    <span className="text-[10px] text-slate-400">Toggle site visibility.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateField('isPublished', !editedArticle.isPublished)}
                    className={`px-3.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wide border transition-all cursor-pointer ${
                      editedArticle.isPublished
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                        : 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-950 dark:text-gray-400 dark:border-white/5'
                    }`}
                  >
                    {editedArticle.isPublished ? 'Published' : 'Draft'}
                  </button>
                </div>

                {/* Editor's Pick Toggle */}
                <div className="flex justify-between items-center text-xs pt-1.5">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-gray-200 block">Editor’s Pick</span>
                    <span className="text-[10px] text-slate-400">Promote to hero header slot.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateField('featured', !editedArticle.featured)}
                    className={`px-3.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wide border transition-all cursor-pointer ${
                      editedArticle.featured
                        ? 'bg-amber-500/10 text-amber-600 dark:text-gold border-amber-500/20'
                        : 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-950 dark:text-gray-400 dark:border-white/5'
                    }`}
                  >
                    {editedArticle.featured ? 'Featured' : 'Regular'}
                  </button>
                </div>

                {/* Allow Discussion Toggle */}
                <div className="flex justify-between items-center text-xs pt-1.5">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-gray-200 block">Allow Comments</span>
                    <span className="text-[10px] text-slate-400">Enable moderated reader dialog.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateField('commentsAllowed', !editedArticle.commentsAllowed)}
                    className={`px-3.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wide border transition-all cursor-pointer ${
                      editedArticle.commentsAllowed
                        ? 'bg-slate-900 text-white border-slate-950 dark:bg-gold dark:text-slate-950'
                        : 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'
                    }`}
                  >
                    {editedArticle.commentsAllowed ? 'Enabled' : 'Muted'}
                  </button>
                </div>

                {/* Article Language index mapping */}
                <div className="flex flex-col gap-1 pt-3 border-t border-slate-100 dark:border-white/5 text-xs">
                  <span className="font-bold text-slate-800 dark:text-gray-200">Index Language Mode</span>
                  <select
                    value={editedArticle.lang || 'en'}
                    onChange={(e) => updateField('lang', e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-white/10 rounded-xl font-semibold text-slate-800 dark:text-white focus:outline-none"
                  >
                    <option value="en">English Content Only</option>
                    <option value="am">Amharic Content Only</option>
                    <option value="bilingual">Bilingual (English + Amharic)</option>
                  </select>
                </div>
              </div>

              {/* TAXONOMY & DIFFICULTY DEPTH */}
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-3">
                  <BookMarked size={14} className="text-gold" />
                  <h3 className="font-serif text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Taxonomy Arena</h3>
                </div>

                {/* Category Selection */}
                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-800 dark:text-gray-200 block">Core Topic Area</label>
                  <select
                    value={editedArticle.topicSlug}
                    onChange={(e) => updateField('topicSlug', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-white/10 rounded-xl text-xs font-semibold text-slate-800 dark:text-white"
                  >
                    {topics.map((t) => (
                      <option key={t.slug} value={t.slug}>{t.name}</option>
                    ))}
                  </select>
                </div>

                {/* Difficulty Depth segment control */}
                <div className="space-y-1.5 text-xs pt-1">
                  <label className="font-bold text-slate-800 dark:text-gray-200 block">Difficulty Depth Level</label>
                  <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-50 dark:bg-slate-950 p-1 border border-slate-150 dark:border-white/5">
                    {(['beginner', 'intermediate', 'deep-dive'] as Difficulty[]).map((diff) => (
                      <button
                        key={diff}
                        type="button"
                        onClick={() => updateField('difficulty', diff)}
                        className={`py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all cursor-pointer ${
                          editedArticle.difficulty === diff
                            ? 'bg-navy text-white dark:bg-gold dark:text-slate-950 font-bold shadow-sm'
                            : 'text-slate-500 hover:text-slate-950 dark:text-gray-400 dark:hover:text-white'
                        }`}
                      >
                        {diff === 'deep-dive' ? 'Deep Dive' : diff}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reading Time Slider/Input */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-white/5 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-800 dark:text-gray-200 flex items-center gap-1">
                      <Clock size={11} className="text-gold" />
                      <span>Reading Time</span>
                    </label>
                    <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-150 dark:border-white/10">
                      <input
                        type="number"
                        min={1}
                        max={120}
                        value={editedArticle.readingTime}
                        onChange={(e) => updateField('readingTime', parseInt(e.target.value) || 5)}
                        className="bg-transparent border-none text-xs font-bold text-slate-800 dark:text-white w-full focus:outline-none p-0 text-center"
                      />
                      <span className="text-[10px] text-slate-400">min</span>
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
                      className="w-full bg-slate-50 dark:bg-slate-950 px-2 py-1 text-xs font-bold text-slate-800 dark:text-white border border-slate-150 dark:border-white/10 rounded-xl focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* COVER IMAGE FRAME CONTAINER */}
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-3">
                  <Image size={14} className="text-gold" />
                  <h3 className="font-serif text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Cover Graphic</h3>
                </div>

                {editedArticle.coverImage && (
                  <div className="aspect-[16/10] rounded-xl overflow-hidden border border-slate-100 dark:border-white/10 shadow-sm relative group bg-slate-950">
                    <img src={editedArticle.coverImage} alt="Cover Preview" className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500 opacity-90" />
                    <button 
                      type="button"
                      onClick={() => updateField('coverImage', '')}
                      className="absolute top-2 right-2 p-1 bg-slate-950/80 hover:bg-slate-950 text-white rounded-full text-xs transition-colors"
                      title="Clear image URL"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
                
                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-800 dark:text-gray-200 block">Cover Image URL</label>
                  <input
                    type="text"
                    placeholder="E.g., https://images.unsplash.com/photo-..."
                    value={editedArticle.coverImage || ''}
                    onChange={(e) => updateField('coverImage', e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-white/10 rounded-xl focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              {/* MAPPED LEARNING ROADMAPS */}
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-3">
                  <Sparkles size={14} className="text-gold" />
                  <h3 className="font-serif text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Roadmap Integration</h3>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-800 dark:text-gray-200 block">Target Path</label>
                    <select
                      value={editedArticle.partInPath?.pathSlug || ''}
                      onChange={(e) => {
                        const nextSlug = e.target.value;
                        if (nextSlug) {
                          updateField('partInPath', {
                            pathSlug: nextSlug,
                            position: editedArticle.partInPath?.position || 1
                          });
                        } else {
                          updateField('partInPath', undefined);
                        }
                      }}
                      className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-white/10 text-xs rounded-xl text-slate-800 dark:text-white focus:outline-none"
                    >
                      <option value="">-- Unmapped --</option>
                      {paths.map((p) => (
                        <option key={p.slug} value={p.slug}>{p.title}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-800 dark:text-gray-200 block font-sans">Index Position</label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={editedArticle.partInPath?.position || 1}
                      disabled={!editedArticle.partInPath}
                      onChange={(e) => {
                        if (editedArticle.partInPath) {
                          updateField('partInPath', {
                            ...editedArticle.partInPath,
                            position: parseInt(e.target.value) || 1
                          });
                        }
                      }}
                      className="w-full px-2.5 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-white/10 text-xs rounded-xl text-slate-800 dark:text-white disabled:opacity-50 text-center"
                    />
                  </div>
                </div>
              </div>

              {/* KEYWORD TAG CHIPS */}
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-3">
                  <Tag size={14} className="text-gold" />
                  <h3 className="font-serif text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Manuscript Tags</h3>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {editedArticle.tags.length === 0 ? (
                    <span className="text-[10px] text-slate-400">No tag keywords linked to this paper.</span>
                  ) : (
                    editedArticle.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-150 dark:border-white/5 text-[10px] text-slate-800 dark:text-slate-200 whitespace-nowrap"
                      >
                        <span>#{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(i)}
                          className="text-rose-500 font-bold hover:text-rose-700 text-[10px] ml-0.5"
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
                    className="flex-1 px-3 py-1.5 border border-slate-200 dark:border-white/10 text-xs bg-slate-50 dark:bg-slate-950 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:border-gold"
                  />
                  <button
                    type="submit"
                    className="px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-gray-300 text-[11px] font-bold rounded-xl uppercase transition-colors"
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
