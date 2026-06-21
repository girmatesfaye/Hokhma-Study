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
  Bold,
  Italic,
  Underline,
  List,
  Quote,
  Link2,
  Bookmark,
  PlusCircle,
  Eye,
  Settings,
  X,
  Check,
  Image,
  Tag,
  AlertTriangle
} from 'lucide-react';

export default function ArticleEditor() {
  const { currentRoute, articles, topics, paths, updateArticle, navigateTo, isAdmin } = useApp();

  const articleId = currentRoute.id || '';
  const initialArticle = articles.find((a) => a.id === articleId);

  // States
  const [editedArticle, setEditedArticle] = useState<Article | null>(null);
  const [newTagInput, setNewTagInput] = useState('');
  const [autosaveStatus, setAutosaveStatus] = useState('Saved recently');
  const [newFootnoteText, setNewFootnoteText] = useState('');
  const [previewMode, setPreviewMode] = useState(false);

  // Synchronize initial article
  useEffect(() => {
    if (initialArticle) {
      // Deep copy to avoid mutating context directly before clicking "Save Revisions"
      setEditedArticle(JSON.parse(JSON.stringify(initialArticle)));
    }
  }, [initialArticle]);

  // If unauthorized, show security warning
  if (!isAdmin) {
    return (
      <div className="absolute inset-0 bg-[#0F1117] flex justify-center items-center z-50 p-6 text-center animate-fade-in text-white leading-relaxed">
        <div className="max-w-md bg-[#1A1D24] border border-white/5 rounded-2xl p-8 space-y-6">
          <Trash2 className="text-gold h-12 w-12 mx-auto" />
          <h2 className="font-serif text-xl font-bold font-serif">Workspace Blocked</h2>
          <p className="text-xs text-gray-400">Secure validation is required to access primary manuscript editors.</p>
          <button onClick={() => navigateTo('/admin/login')} className="px-6 py-2 bg-gold text-slate-950 text-xs font-bold font-sans uppercase tracking-wider rounded">
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
        <button onClick={() => navigateTo('/admin')} className="mt-6 px-4 py-2 bg-navy text-white text-xs font-bold uppercase tracking-wider rounded">
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
      
      // Auto-set SEO Title and Slug from Title if edited
      if (field === 'title') {
        next.seoTitle = `${value} | Hokhma Study`;
        next.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }
      return next;
    });
    setAutosaveStatus('Draft edited...');
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

  const handleEditBlockText = (idx: number, text: string) => {
    if (!editedArticle) return;
    const updatedContent = editedArticle.content.map((sec, i) =>
      i === idx ? { ...sec, text } : sec
    );
    updateField('content', updatedContent);
  };

  const handleEditBlockTextAm = (idx: number, textAm: string) => {
    if (!editedArticle) return;
    const updatedContent = editedArticle.content.map((sec, i) =>
      i === idx ? { ...sec, textAm } : sec
    );
    updateField('content', updatedContent);
  };

  const handleEditScriptureReference = (idx: number, reference: string) => {
    if (!editedArticle) return;
    const updatedContent = editedArticle.content.map((sec, i) =>
      i === idx ? { ...sec, reference } : sec
    );
    updateField('content', updatedContent);
  };

  const handleEditScriptureReferenceAm = (idx: number, referenceAm: string) => {
    if (!editedArticle) return;
    const updatedContent = editedArticle.content.map((sec, i) =>
      i === idx ? { ...sec, referenceAm } : sec
    );
    updateField('content', updatedContent);
  };

  const handleDeleteContentBlock = (idx: number) => {
    if (!editedArticle) return;
    const filteredContent = editedArticle.content.filter((_, i) => i !== idx);
    updateField('content', filteredContent);
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

  // Action: Add tag chip
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

  // Action: Remove tag chip
  const handleRemoveTag = (tagIdx: number) => {
    if (!editedArticle) return;
    const nextTags = editedArticle.tags.filter((_, i) => i !== tagIdx);
    updateField('tags', nextTags);
  };

  // Action: Add Footnote
  const handleAddFootnote = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFootnoteText.trim() && editedArticle) {
      const newFn: Footnote = {
        id: editedArticle.footnotes.length + 1,
        text: newFootnoteText.trim()
      };
      updateField('footnotes', [...editedArticle.footnotes, newFn]);
      setNewFootnoteText('');
      setAutosaveStatus('Footnote mapped...');
    }
  };

  // Action: Remove Footnote
  const handleRemoveFootnote = (fnId: number) => {
    if (!editedArticle) return;
    const filteredFn = editedArticle.footnotes
      .filter((fn) => fn.id !== fnId)
      // Re-map the footnote numbering indexes
      .map((fn, idx) => ({ ...fn, id: idx + 1 }));
    updateField('footnotes', filteredFn);
  };

  // Action: Compile/Save Revisions
  const handleSaveRevisions = () => {
    if (editedArticle) {
      updateArticle(editedArticle);
      setAutosaveStatus('Revisions saved!');
      setTimeout(() => {
        navigateTo('/admin');
      }, 1000);
    }
  };

  return (
    <div id="article-editor-page" className="animate-fade-in bg-slate-50 dark:bg-slate-950/20 shadow-inner min-h-screen py-6 font-sans">
      <div className="max-w-[1140px] mx-auto px-4 md:px-6 space-y-6">
        
        {/* TOP BAR: Back arrow · title · autosave status · Preview btn · Save btn */}
        <div className="bg-[#1A1D24] border border-white/5 rounded-xl p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-white shadow shadow-xl">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigateTo('/admin')}
              className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white"
              title="Return to Dashboard"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-sm font-bold uppercase tracking-wider text-gold">
                  Editing: {editedArticle.title}
                </h1>
                <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-gold text-[9px] font-bold font-sans">
                  {editedArticle.isPublished ? 'PUBLISHED' : 'DRAFT'}
                </span>
              </div>
              <p className="text-[10px] text-gray-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span>Autosave: {autosaveStatus}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Toggle Preview Button */}
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider rounded bg-slate-850 hover:bg-slate-800 text-gold hover:text-white border border-gold/20 flex items-center gap-1 cursor-pointer"
            >
              <Eye size={12} />
              <span>{previewMode ? 'Edit Mode' : 'Preview Paper'}</span>
            </button>

            {/* Commit Revisions Button */}
            <button
              onClick={handleSaveRevisions}
              className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded bg-gold hover:bg-gold/90 text-slate-950 flex items-center gap-1"
            >
              <Save size={12} />
              <span>Save Revisions</span>
            </button>
          </div>
        </div>

        {/* PREVIEW CONTAINER */}
        {previewMode ? (
          <div className="bg-white dark:bg-slate-900 border p-8 md:p-12 rounded-xl text-nearblack max-w-3xl mx-auto space-y-6 animate-fade-in text-xs font-serif shadow-xl">
            <div className="text-center font-sans space-y-1.5 border-b pb-4">
              <span className="text-[10px] uppercase tracking-widest text-gold font-bold">PREVIEWING COMPILATION</span>
              <h1 className="font-serif text-2xl font-bold text-nearblack dark:text-white">{editedArticle.title}</h1>
              <p className="text-[11px] text-mediumgrey">{editedArticle.publishDate} · Reads: {editedArticle.views}</p>
            </div>

            <p className="text-sm font-semibold italic text-mediumgrey leading-relaxed">
              Excerpt: {editedArticle.excerpt}
            </p>

            <div className="text-sm md:text-base leading-relaxed text-mediumgrey space-y-5">
              {editedArticle.content.map((sec, i) => {
                if (sec.type === 'header') {
                  return <h2 key={i} className="font-serif font-bold text-md pt-3 text-nearblack dark:text-white">{sec.text}</h2>;
                }
                if (sec.type === 'scripture') {
                  return (
                    <div key={i} className="pl-4 border-l-2 border-gold my-4 text-xs italic">
                      “{sec.text}”
                      <div className="text-right text-gold uppercase text-[9px] font-sans font-bold">— {sec.reference}</div>
                    </div>
                  );
                }
                return <p key={i}>{sec.text}</p>;
              })}
            </div>
            
            <div className="pt-4 border-t text-[11px] text-lightgrey">
              End of Draft Compilation.
            </div>
          </div>
        ) : (
          /* FULL-WIDTH TWO-COLUMN EDIT INTERFACE */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT COLUMN: Main Editor (70% approximate) */}
            <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-xl p-6 shadow-sm space-y-6">
              
              {/* Dual-Language Title Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-mediumgrey font-sans">Document Paper Title (English)</label>
                  <input
                    type="text"
                    placeholder="Enter article title (e.g., The Historical Resurrection)..."
                    value={editedArticle.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    className="w-full text-base font-serif font-bold text-nearblack dark:text-white bg-transparent border-b border-black/10 focus:outline-none focus:border-gold pb-2"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-amber-600 dark:text-gold font-sans">Document Paper Title (Amharic / አማርኛ)</label>
                  <input
                    type="text"
                    placeholder="የጽሑፉ አርዕስት እዚህ ያስገቡ..."
                    value={editedArticle.titleAm || ''}
                    onChange={(e) => updateField('titleAm', e.target.value)}
                    className="w-full text-base font-serif font-bold text-nearblack dark:text-white bg-transparent border-b border-gold/20 focus:outline-none focus:border-gold pb-2"
                  />
                </div>
              </div>

              {/* Dual-Language Excerpt Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-mediumgrey font-sans">One line summary (English Excerpt)</label>
                  <textarea
                    rows={2}
                    value={editedArticle.excerpt}
                    onChange={(e) => updateField('excerpt', e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-offwhite dark:bg-slate-950 border border-black/10 rounded focus:outline-none font-serif leading-relaxed text-nearblack"
                    placeholder="A one-sentence summary mapping the Core arguments answered by this paper..."
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-amber-600 dark:text-gold font-sans">One line summary (Amharic Excerpt / አማርኛ)</label>
                  <textarea
                    rows={2}
                    value={editedArticle.excerptAm || ''}
                    onChange={(e) => updateField('excerptAm', e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-offwhite dark:bg-slate-950 border border-gold/15 rounded focus:outline-none font-serif leading-relaxed text-nearblack"
                    placeholder="ለጽሑፉ አጭር ማጠቃለያ መግለጫ እዚህ ያስገቡ..."
                  />
                </div>
              </div>

              {/* WYSIWYG TOOLBAR SIMULATOR (Paragraph · H2 · Scripture block visual adds) */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-1 bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border border-black/5">
                  <span className="text-[10px] uppercase font-bold text-mediumgrey px-2 font-sans">WYSIWYG Blocks tool:</span>
                  <div className="h-4 w-px bg-black/10 mx-1" />
                  
                  {/* Append Paragraph Block */}
                  <button
                    onClick={() => handleAddContentBlock('paragraph')}
                    className="p-1 px-2 text-[10px] uppercase hover:bg-gold/10 hover:text-gold text-nearblack dark:text-white border border-black/5 hover:border-gold/30 rounded inline-flex items-center gap-1 font-semibold"
                    title="Add normal paragraph block"
                  >
                    <Plus size={10} />
                    <span>Paragraph</span>
                  </button>

                  {/* Append Header Block */}
                  <button
                    onClick={() => handleAddContentBlock('header', 2)}
                    className="p-1 px-2 text-[10px] uppercase hover:bg-gold/10 hover:text-gold text-nearblack dark:text-white border border-black/5 hover:border-gold/30 rounded inline-flex items-center gap-1 font-semibold"
                    title="Add H2 section Header"
                  >
                    <Plus size={10} />
                    <span>H2 Section</span>
                  </button>

                  {/* Append Scripture Block (accent color specified!) */}
                  <button
                    onClick={() => handleAddContentBlock('scripture')}
                    className="p-1 px-2 text-[10px] uppercase bg-amber-50 dark:bg-amber-950/40 text-gold hover:text-gold border border-gold/45 rounded inline-flex items-center gap-1 font-bold"
                    title="Insert Scripture Quote block with citation"
                  >
                    <Plus size={10} />
                    <span>Scripture Block</span>
                  </button>
                </div>

                {/* VISUAL BLOCK LIST BUILDER */}
                <div className="space-y-4 max-h-[480px] overflow-y-auto pr-2">
                  {editedArticle.content.map((sec, idx) => {
                    return (
                      <div
                        key={idx}
                        className={`p-3.5 border rounded-lg relative space-y-2 group transition-shadow ${
                          sec.type === 'scripture'
                            ? 'bg-[#FDFAF3] dark:bg-[#1C1A14] border-gold/40'
                            : sec.type === 'header'
                            ? 'bg-slate-50 dark:bg-slate-900 border-black/10'
                            : 'bg-white dark:bg-slate-900 border-black/5'
                        }`}
                      >
                        {/* Upper Block control bar */}
                        <div className="flex justify-between items-center text-[10px] font-sans text-mediumgrey border-b border-black/5 pb-1">
                          <span className="uppercase font-bold tracking-wider text-[9px] text-navy dark:text-gold">
                            Block {idx + 1}: {sec.type === 'scripture' ? 'Scripture Citation' : sec.type === 'header' ? 'Section Header' : 'Paragraph Body'}
                          </span>
                          
                          <div className="flex gap-1">
                            {/* Movement */}
                            <button
                              onClick={() => handleMoveBlock(idx, 'up')}
                              className="px-1 text-nearblack hover:text-gold"
                            >
                              ▲
                            </button>
                            <button
                              onClick={() => handleMoveBlock(idx, 'down')}
                              className="px-1 text-nearblack hover:text-gold"
                            >
                              ▼
                            </button>
                            <span className="h-3 w-px bg-black/10 mx-1" />
                            {/* Delete */}
                            <button
                              onClick={() => handleDeleteContentBlock(idx)}
                              className="text-red-500 hover:text-red-700"
                              title="Delete block"
                            >
                              ✕ Remove
                            </button>
                          </div>
                        </div>

                        {/* Text inputs based on type */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
                          <div className="space-y-1">
                            <span className="text-[9px] uppercase font-bold text-mediumgrey block font-sans">English text</span>
                            <textarea
                              rows={sec.type === 'paragraph' ? 3 : 1}
                              value={sec.text}
                              onChange={(e) => handleEditBlockText(idx, e.target.value)}
                              className="w-full bg-white dark:bg-slate-950 text-xs px-2.5 py-1.5 focus:outline-none border border-black/5 hover:border-gold/30 rounded focus:border-gold text-nearblack font-serif"
                            />
                          </div>
                          <div className="space-y-1">
                            <span className="text-[9px] uppercase font-bold text-amber-600 dark:text-gold block font-sans">Amharic / አማርኛ</span>
                            <textarea
                              rows={sec.type === 'paragraph' ? 3 : 1}
                              value={sec.textAm || ''}
                              onChange={(e) => handleEditBlockTextAm(idx, e.target.value)}
                              className="w-full bg-white dark:bg-slate-950 text-xs px-2.5 py-1.5 focus:outline-none border border-gold/15 hover:border-gold/35 rounded focus:border-gold text-nearblack font-serif"
                              placeholder="ትርጉም እዚህ ይጻፉ..."
                            />
                          </div>
                        </div>

                        {/* Citation for scripture */}
                        {sec.type === 'scripture' && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs pt-1 border-t border-black/5">
                            <div className="flex justify-end gap-2 items-center">
                              <span className="text-[9px] text-lightgrey">Reference (EN):</span>
                              <input
                                type="text"
                                required
                                value={sec.reference || ''}
                                onChange={(e) => handleEditScriptureReference(idx, e.target.value)}
                                placeholder="E.g., Romans 1:16"
                                className="px-2 py-0.5 w-full text-xs bg-white dark:bg-slate-950 text-gold border focus:border-gold rounded font-semibold font-sans"
                              />
                            </div>
                            <div className="flex justify-end gap-2 items-center">
                              <span className="text-[9px] text-lightgrey">Reference (AM):</span>
                              <input
                                type="text"
                                value={sec.referenceAm || ''}
                                onChange={(e) => handleEditScriptureReferenceAm(idx, e.target.value)}
                                placeholder="ለምሳሌ፥ ሮሜ 1:16"
                                className="px-2 py-0.5 w-full text-xs bg-white dark:bg-slate-950 text-gold border focus:border-gold rounded font-semibold font-sans"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* FOOTNOTES LIST BUILDER SECTION */}
              <div className="border-t border-black/10 pt-6 space-y-4">
                <h3 className="font-serif text-sm font-bold text-nearblack dark:text-white uppercase tracking-wider">
                  Academic Footnotes Bibliography
                </h3>
                
                <div className="space-y-2">
                  {editedArticle.footnotes.map((fn) => (
                    <div key={fn.id} className="p-2 border border-black/5 rounded bg-slate-50/40 text-xs flex justify-between items-center gap-4">
                      <span className="text-navy dark:text-gold font-bold font-mono px-1.5">[{fn.id}]</span>
                      <span className="flex-1 font-serif text-[12.5px] line-clamp-1">{fn.text}</span>
                      <button
                        onClick={() => handleRemoveFootnote(fn.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                {/* Form to append new footnote */}
                <form onSubmit={handleAddFootnote} className="flex gap-2 text-xs">
                  <input
                    type="text"
                    required
                    placeholder="Enter academic reference citation (e.g. Lewis, C.S., 'Mere Christianity', 1943)..."
                    value={newFootnoteText}
                    onChange={(e) => setNewFootnoteText(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded focus:outline-none focus:border-gold bg-offwhite text-nearblack font-serif"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-navy text-white text-xs font-bold uppercase tracking-wider rounded whitespace-nowrap cursor-pointer"
                  >
                    Add Citation
                  </button>
                </form>
              </div>

            </div>

            {/* RIGHT COLUMN: Settings Sidebar (30% approximate) */}
            <aside className="lg:col-span-4 bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-xl p-6 shadow-sm space-y-6">
              
              {/* 1. STATUS Toggles: Published / Featured / Comments allowed */}
              <div className="space-y-3.5 border-b border-black/5 pb-4">
                <h3 className="font-serif text-xs font-bold uppercase tracking-wider text-nearblack dark:text-white flex items-center gap-1">
                  <Settings size={13} className="text-gold" />
                  <span>Article Status Parameters</span>
                </h3>

                {/* Published */}
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold uppercase tracking-wider text-[11px] block">Publish directly</span>
                    <span className="text-lightgrey">Make paper visible to visitors of the site.</span>
                  </div>
                  <button
                    onClick={() => updateField('isPublished', !editedArticle.isPublished)}
                    className={`px-3 py-1 rounded text-[11px] font-bold uppercase tracking-wide border transition-all ${
                      editedArticle.isPublished
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : 'bg-slate-100 text-slate-655 border-slate-300'
                    }`}
                  >
                    {editedArticle.isPublished ? 'Yes' : 'Draft'}
                  </button>
                </div>

                {/* Featured */}
                <div className="flex justify-between items-center text-xs pt-1.5">
                  <div>
                    <span className="font-bold uppercase tracking-wider text-[11px] block">Editor’s Pick</span>
                    <span className="text-lightgrey">Promote as large card in main Hero section.</span>
                  </div>
                  <button
                    onClick={() => updateField('featured', !editedArticle.featured)}
                    className={`px-3 py-1 rounded text-[11px] font-bold uppercase tracking-wide border transition-all ${
                      editedArticle.featured
                        ? 'bg-gold/15 text-gold border-gold/45'
                        : 'bg-slate-100 text-slate-655 border-slate-300'
                    }`}
                  >
                    {editedArticle.featured ? 'Featured' : 'Regular'}
                  </button>
                </div>

                {/* Comments allowed */}
                <div className="flex justify-between items-center text-xs pt-1.5 pb-2">
                  <div>
                    <span className="font-bold uppercase tracking-wider text-[11px] block">Allow discussion</span>
                    <span className="text-lightgrey">Unlock threaded comment moderated forms.</span>
                  </div>
                  <button
                    onClick={() => updateField('commentsAllowed', !editedArticle.commentsAllowed)}
                    className={`px-3 py-1 rounded text-[11px] font-bold uppercase tracking-wide border transition-all ${
                      editedArticle.commentsAllowed
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-rose-50 text-rose-600 border-rose-200'
                    }`}
                  >
                    {editedArticle.commentsAllowed ? 'Active' : 'Muted'}
                  </button>
                </div>

                {/* Article UI Language switcher */}
                <div className="flex justify-between items-center text-xs pt-2.5 border-t border-black/5 dark:border-white/5">
                  <div>
                    <span className="font-bold uppercase tracking-wider text-[11px] block">Article Language</span>
                    <span className="text-lightgrey">Dictates indexing language: English, Amharic, or Bilingual.</span>
                  </div>
                  <select
                    value={editedArticle.lang || 'en'}
                    onChange={(e) => updateField('lang', e.target.value)}
                    className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-800 border rounded font-semibold focus:outline-none"
                  >
                    <option value="en">English (US)</option>
                    <option value="am">አማርኛ (AM)</option>
                    <option value="bilingual">Bilingual (EN + AM)</option>
                  </select>
                </div>
              </div>

              {/* 2. CATEGORY: Dropdown selection */}
              <div className="space-y-1.5 border-b border-black/5 pb-4 text-xs">
                <label className="font-bold uppercase tracking-wider text-[10px] block text-mediumgrey">
                  Core Topic Arena Selection
                </label>
                <select
                  value={editedArticle.topicSlug}
                  onChange={(e) => updateField('topicSlug', e.target.value)}
                  className="w-full px-3 py-2 bg-offwhite rounded border border-black/10 text-nearblack"
                >
                  {topics.map((t) => (
                    <option key={t.slug} value={t.slug}>{t.name}</option>
                  ))}
                </select>
              </div>

              {/* 3. DIFFICULTY: 3-button toggle group (Beginner / Intermediate / Deep dive) */}
              <div className="space-y-1.5 border-b border-black/5 pb-4 text-xs">
                <label className="font-bold uppercase tracking-wider text-[10px] block text-mediumgrey">
                  Difficulty Depth Level
                </label>
                <div className="grid grid-cols-3 gap-1 rounded bg-slate-50 dark:bg-slate-950 p-1 border border-black/5">
                  {(['beginner', 'intermediate', 'deep-dive'] as Difficulty[]).map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => updateField('difficulty', diff)}
                      className={`py-1 rounded text-[10px] font-bold uppercase tracking-wide transition-colors ${
                        editedArticle.difficulty === diff
                          ? 'bg-navy text-white dark:bg-gold dark:text-slate-950 font-bold'
                          : 'text-mediumgrey hover:text-nearblack'
                      }`}
                    >
                      {diff === 'deep-dive' ? 'Deep Dive' : diff}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. TAGS PILL CHIP INPUT */}
              <div className="space-y-3.5 border-b border-black/5 pb-4 text-xs">
                <div className="flex gap-1 items-center">
                  <Tag size={13} className="text-gold" />
                  <label className="font-bold uppercase tracking-wider text-[10px] block text-mediumgrey">
                    Paper Keywords & Tags
                  </label>
                </div>

                <div className="flex flex-wrap gap-1">
                  {editedArticle.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-offwhite dark:bg-slate-800 border text-[10px] text-nearblack whitespace-nowrap"
                    >
                      <span>#{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(i)}
                        className="text-red-500 font-bold hover:text-red-700 text-[10px]"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                <form onSubmit={handleAddTag} className="flex gap-1">
                  <input
                    type="text"
                    placeholder="Type keyword..."
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 border text-xs bg-offwhite dark:bg-slate-950 rounded text-nearblack"
                  />
                  <button
                    type="submit"
                    className="px-3 bg-navy text-white text-[11px] font-bold rounded uppercase"
                  >
                    Add
                  </button>
                </form>
              </div>

              {/* 5. COVER IMAGE PLACEHOLDER with simulated click select */}
              <div className="space-y-2 border-b border-black/5 pb-4 text-xs">
                <div className="flex gap-1 items-center">
                  <Image size={13} className="text-gold" />
                  <label className="font-bold uppercase tracking-wider text-[10px] block text-mediumgrey animate-pulse">
                    Cover Image URL mapping
                  </label>
                </div>

                {editedArticle.coverImage && (
                  <div className="h-28 rounded-md overflow-hidden border">
                    <img
                      src={editedArticle.coverImage}
                      alt="Cover"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <input
                  type="text"
                  placeholder="Paste Unsplash image URL..."
                  value={editedArticle.coverImage || ''}
                  onChange={(e) => updateField('coverImage', e.target.value)}
                  className="w-full px-2.5 py-2 border rounded bg-offwhite text-nearblack focus:outline-none"
                />
              </div>

              {/* 6. LEARNING PATH dropdown menu */}
              <div className="space-y-4 border-b border-black/5 pb-4 text-xs">
                <div className="flex gap-1 items-center">
                  <BookMarked size={13} className="text-gold" />
                  <label className="font-bold uppercase tracking-wider text-[10px] block text-mediumgrey">
                    Map to Learning Path
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-lightgrey block mb-1">Select Path</label>
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
                      className="w-full px-2 py-1.5 bg-offwhite border text-xs rounded text-nearblack"
                    >
                      <option value="">-- None --</option>
                      {paths.map((p) => (
                        <option key={p.slug} value={p.slug}>{p.title}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-lightgrey block mb-1 font-sans">Sequence Order</label>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={editedArticle.partInPath?.position || 1}
                      onChange={(e) => {
                        if (editedArticle.partInPath) {
                          updateField('partInPath', {
                            ...editedArticle.partInPath,
                            position: parseInt(e.target.value) || 1
                          });
                        }
                      }}
                      className="w-full px-2 py-1 bg-offwhite border text-xs rounded text-nearblack font-sans"
                    />
                  </div>
                </div>
              </div>

              {/* 7. SEO meta variables with char counts */}
              <div className="space-y-3.5 text-xs">
                <span className="font-bold uppercase tracking-wider text-[10px] block text-mediumgrey">
                  SEO Search Engine Metadata
                </span>

                <div>
                  <div className="flex justify-between items-center text-[10px] mb-1">
                    <span className="text-lightgrey uppercase font-bold text-[9px]">META TITLE</span>
                    <span className={`${(editedArticle.seoTitle || '').length > 60 ? 'text-red-500' : 'text-gold'} font-bold`}>
                      {(editedArticle.seoTitle || '').length}/60
                    </span>
                  </div>
                  <input
                    type="text"
                    value={editedArticle.seoTitle || ''}
                    onChange={(e) => updateField('seoTitle', e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded bg-offwhite border focus:outline-none"
                    placeholder="SEO title mapping..."
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center text-[10px] mb-1">
                    <span className="text-lightgrey uppercase font-bold text-[9px]">META DESCRIPTION</span>
                    <span className={`${(editedArticle.seoDescription || '').length > 160 ? 'text-red-500' : 'text-gold'} font-bold`}>
                      {(editedArticle.seoDescription || '').length}/160
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    value={editedArticle.seoDescription || ''}
                    onChange={(e) => updateField('seoDescription', e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded bg-offwhite border focus:outline-none leading-relaxed"
                    placeholder="SEO description paragraph..."
                  />
                </div>
              </div>

            </aside>

          </div>
        )}

      </div>
    </div>
  );
}
