/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import DifficultyBadge from '../components/DifficultyBadge';
import { Article, Question, Comment } from '../types';
import {
  Shield,
  LogOut,
  LayoutDashboard,
  FileText,
  HelpCircle,
  TrendingUp,
  MessageSquare,
  Users,
  PlusCircle,
  Eye,
  Trash2,
  Check,
  Edit,
  Globe,
  Plus,
  Compass,
  Settings,
  X,
  RefreshCw,
  MapPin,
  ListCollapse
} from 'lucide-react';

export default function AdminDashboard() {
  const {
    articles,
    questions,
    comments,
    topics,
    paths,
    approveComment,
    deleteComment,
    deleteArticle,
    addArticle,
    addQuestion,
    logoutAdmin,
    navigateTo,
    isAdmin
  } = useApp();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'articles' | 'questions' | 'comments' | 'settings'>('dashboard');

  // Modal map question state
  const [showMapQuestionModal, setShowMapQuestionModal] = useState(false);
  const [newQuestionForm, setNewQuestionForm] = useState({
    text: '',
    topicSlug: 'philosophy',
    difficulty: 'beginner' as const,
    tags: '',
    articleSlug: ''
  });
  const [mapSuccess, setMapSuccess] = useState(false);

  // If unauthorized, redirect to login
  if (!isAdmin) {
    return (
      <div className="absolute inset-0 bg-[#0F1117] flex justify-center items-center z-50 p-6 text-center animate-fade-in text-white leading-relaxed">
        <div className="max-w-md bg-[#1A1D24] border border-white/5 rounded-2xl p-8 space-y-6">
          <Shield className="text-gold h-12 w-12 mx-auto" />
          <h2 className="font-serif text-xl font-bold">Authorship Security Required</h2>
          <p className="text-xs text-gray-400">Reviewing permission guidelines... Secure entry is mandated for Dr. Sterling's private workroom.</p>
          <button
            onClick={() => navigateTo('/admin/login')}
            className="px-6 py-2 bg-gold text-slate-950 text-xs font-bold tracking-wider rounded"
          >
            Authenticate Profile
          </button>
        </div>
      </div>
    );
  }

  // Handle write new article
  const handleWriteNewArticle = () => {
    // Generate a new skeleton article
    const newId = `art-user-${Date.now()}`;
    const newArt: Article = {
      id: newId,
      slug: `blank-article-draft-${Date.now()}`,
      title: 'Untilted Article Draft',
      topicSlug: 'philosophy',
      difficulty: 'beginner',
      readingTime: 5,
      publishDate: new Date().toISOString().split('T')[0],
      excerpt: 'This is a preliminary excerpt representing what this new research paper answers.',
      content: [
        { type: 'paragraph', text: 'Begin writing your long-form publication arguments here...' }
      ],
      footnotes: [],
      tags: ['draft'],
      featured: false,
      isPublished: false,
      commentsAllowed: true,
      views: 0
    };
    
    addArticle(newArt);
    navigateTo(`/admin/articles/${newId}/edit`);
  };

  // Handle map question form submission
  const handleMapQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mappingArticle = articles.find((a) => a.slug === newQuestionForm.articleSlug) || articles[0];
    
    if (newQuestionForm.text && newQuestionForm.articleSlug) {
      const newQ: Question = {
        id: `q-user-${Date.now()}`,
        text: newQuestionForm.text.trim(),
        topicSlug: newQuestionForm.topicSlug,
        difficulty: newQuestionForm.difficulty,
        tags: newQuestionForm.tags.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean),
        articleSlug: newQuestionForm.articleSlug,
        articleTitle: mappingArticle.title,
        commonScore: 70, // fresh community questions score
        addedDate: new Date().toISOString().split('T')[0]
      };
      
      addQuestion(newQ);
      setMapSuccess(true);
      setTimeout(() => {
        setMapSuccess(false);
        setShowMapQuestionModal(false);
        setNewQuestionForm({
          text: '',
          topicSlug: 'philosophy',
          difficulty: 'beginner',
          tags: '',
          articleSlug: ''
        });
      }, 1500);
    }
  };

  // Reset database helper (clears custom edit localStorage to defaults)
  const handleResetDatabase = () => {
    if (confirm('Are you entirely sure you want to revert all custom article edits and comments back to default? This resets the database.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  // Metrics (STATS ROW - 4 cards specified)
  const metricTotalArticles = articles.length;
  const metricTotalViews = articles.reduce((sum, a) => sum + (a.views || 0), 0);
  const metricPendingComments = comments.filter((c) => !c.isApproved).length;
  const metricNewsletterTotal = 432; // simulated subscribers count

  // Unapproved comments list (3-5 recent specified)
  const pendingCommentsList = comments.filter((c) => !c.isApproved).slice(0, 5);

  return (
    <div id="admin-dashboard-page" className="animate-fade-in bg-slate-50 dark:bg-slate-950/20 min-h-screen py-10">
      <div className="max-w-[1140px] mx-auto px-4 md:px-6 space-y-8">
        
        {/* TOP BAR: Logo + Admin Label + Logout link */}
        <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-xl p-5 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-3">
            <span className="font-serif text-2xl font-bold tracking-tight text-navy dark:text-white flex items-center gap-1">
              Hokhma Study
              <span className="h-4 w-px bg-gold/50 my-auto block" />
              <span className="font-sans text-xs tracking-widest text-gold font-bold">
                Workroom Tab
              </span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigateTo('/')}
              className="text-xs font-semibold text-mediumgrey hover:text-navy dark:hover:text-white transition-colors tracking-wider block"
            >
              Public Hub
            </button>
            <button
              id="admin-logout-btn"
              onClick={() => {
                logoutAdmin();
                navigateTo('/');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-semibold"
              title="Logout session"
            >
              <LogOut size={13} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* CONTROLLER ROW: Layout (Sidebar menu + Main screen metrics) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT SIDEBAR NAVIGATION: Dashboard · Articles · Questions · Paths · Comments · Settings */}
          <aside className="lg:col-span-3 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-xl p-4 shadow-sm space-y-1">
              {/* Dashboard */}
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full text-left py-2.5 px-3.5 rounded-lg text-xs font-bold tracking-wider transition-all flex items-center gap-2.5 cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-navy text-white dark:bg-gold dark:text-slate-950'
                    : 'text-mediumgrey hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <LayoutDashboard size={15} />
                <span>Dashboard Home</span>
              </button>
              
              {/* Articles */}
              <button
                onClick={() => setActiveTab('articles')}
                className={`w-full text-left py-2.5 px-3.5 rounded-lg text-xs font-bold tracking-wider transition-all flex items-center gap-2.5 cursor-pointer ${
                  activeTab === 'articles'
                    ? 'bg-navy text-white dark:bg-gold dark:text-slate-950'
                    : 'text-mediumgrey hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <FileText size={15} />
                <span>My Articles ({articles.length})</span>
              </button>

              {/* Questions */}
              <button
                onClick={() => setActiveTab('questions')}
                className={`w-full text-left py-2.5 px-3.5 rounded-lg text-xs font-bold tracking-wider transition-all flex items-center gap-2.5 cursor-pointer ${
                  activeTab === 'questions'
                    ? 'bg-navy text-white dark:bg-gold dark:text-slate-950'
                    : 'text-mediumgrey hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <HelpCircle size={15} />
                <span>Questions Mapped ({questions.length})</span>
              </button>

              {/* Comments */}
              <button
                onClick={() => setActiveTab('comments')}
                className={`w-full text-left py-2.5 px-3.5 rounded-lg text-xs font-bold tracking-wider transition-all flex items-center gap-2.5 cursor-pointer ${
                  activeTab === 'comments'
                    ? 'bg-navy text-white dark:bg-gold dark:text-slate-950'
                    : 'text-mediumgrey hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <MessageSquare size={15} />
                <span>Pending Comments ({comments.filter((c) => !c.isApproved).length})</span>
              </button>

              {/* Settings */}
              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full text-left py-2.5 px-3.5 rounded-lg text-xs font-bold tracking-wider transition-all flex items-center gap-2.5 cursor-pointer ${
                  activeTab === 'settings'
                    ? 'bg-navy text-white dark:bg-gold dark:text-slate-950'
                    : 'text-mediumgrey hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Settings size={15} />
                <span>System Settings</span>
              </button>
            </div>
            
            {/* Quick stats mini card */}
            <div className="bg-slate-900 border border-white/5 rounded-xl p-5 text-xs text-slate-300 space-y-2">
              <p className="font-serif font-semibold text-white">System Environment</p>
              <div className="space-y-1 font-mono text-[10px]">
                <p>Status: Secure Online</p>
                <p>Curator: Thomas Sterling</p>
                <p>Time (UTC): {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </aside>

          {/* MAIN AREA */}
          <main className="lg:col-span-9 space-y-8">
            
            {activeTab === 'dashboard' && (
              <div className="space-y-8 animate-fade-in">
                
                {/* STATS ROW: 4 metric cards specified */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Card 1: Total articles */}
                  <div className="bg-white dark:bg-slate-900 p-5 rounded-lg border border-black/5 shadow-sm text-center space-y-1">
                    <FileText className="text-gold h-5 w-5 mx-auto" />
                    <span className="text-[10px] font-bold text-mediumgrey block font-sans">Total Articles</span>
                    <strong className="text-2xl font-serif text-nearblack dark:text-white block">{metricTotalArticles}</strong>
                  </div>

                  {/* Card 2: Total views */}
                  <div className="bg-white dark:bg-slate-900 p-5 rounded-lg border border-black/5 shadow-sm text-center space-y-1">
                    <TrendingUp className="text-gold h-5 w-5 mx-auto" />
                    <span className="text-[10px] font-bold text-mediumgrey block font-sans">Monthly Reads</span>
                    <strong className="text-2xl font-serif text-nearblack dark:text-white block">{metricTotalViews}</strong>
                  </div>

                  {/* Card 3: Pending comments */}
                  <div className="bg-white dark:bg-slate-900 p-5 rounded-lg border border-black/5 shadow-sm text-center space-y-1">
                    <MessageSquare className="text-gold h-5 w-5 mx-auto" />
                    <span className="text-[10px] font-bold text-mediumgrey block font-sans">Pending Comments</span>
                    <strong className="text-2xl font-serif text-nearblack dark:text-white block">{metricPendingComments}</strong>
                  </div>

                  {/* Card 4: Newsletter Subscribers */}
                  <div className="bg-white dark:bg-slate-900 p-5 rounded-lg border border-black/5 shadow-sm text-center space-y-1">
                    <Users className="text-gold h-5 w-5 mx-auto" />
                    <span className="text-[10px] font-bold text-mediumgrey block font-sans">Newsletter Subs</span>
                    <strong className="text-2xl font-serif text-nearblack dark:text-white block">{metricNewsletterTotal}</strong>
                  </div>
                </div>

                {/* QUICK ACTIONS ROW */}
                <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-xl p-6 shadow-sm space-y-4">
                  <h3 className="font-serif text-sm font-bold text-nearblack dark:text-white tracking-wider border-b border-black/5 pb-2">
                    Quick Workspace Actions
                  </h3>
                  <div className="flex flex-wrap gap-4">
                    <button
                      id="write-new-article-btn"
                      onClick={handleWriteNewArticle}
                      className="px-4 py-2 bg-navy text-white hover:bg-navy/90 text-xs font-bold tracking-wider rounded inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <PlusCircle size={14} />
                      <span>Write new article</span>
                    </button>
                    <button
                      id="map-new-question-btn"
                      onClick={() => setShowMapQuestionModal(true)}
                      className="px-4 py-2 bg-amber-50 dark:bg-slate-800 text-gold border border-gold hover:bg-gold/10 text-xs font-bold tracking-wider rounded inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <HelpCircle size={14} />
                      <span>Map a question</span>
                    </button>
                  </div>
                </div>

                {/* RECENT ARTICLES TABLE (Draft/Published, Edit Link) */}
                <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-xl p-6 shadow-sm space-y-4 overflow-hidden">
                  <div className="flex justify-between items-baseline border-b border-black/5 pb-2">
                    <h3 className="font-serif text-sm font-bold text-nearblack dark:text-white tracking-wider">
                      Recent articles
                    </h3>
                    <button onClick={() => setActiveTab('articles')} className="text-xs text-gold hover:underline">
                      See all articles →
                    </button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-mediumgrey">
                      <thead>
                        <tr className="border-b border-black/5 p-2 bg-slate-50 dark:bg-slate-950 font-sans font-bold tracking-wider">
                          <th className="py-2.5 px-3">Title</th>
                          <th className="py-2.5 px-3">State</th>
                          <th className="py-2.5 px-3">Topic</th>
                          <th className="py-2.5 px-3">Published Date</th>
                          <th className="py-2.5 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5">
                        {articles.slice(0, 4).map((art) => (
                          <tr key={art.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 font-sans">
                            <td className="py-3 px-3 font-medium text-nearblack dark:text-white max-w-xs truncate">
                              {art.title}
                            </td>
                            <td className="py-3 px-3">
                              {art.isPublished ? (
                                <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 text-[10px] font-bold tracking-wider">
                                  Published
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-755 dark:bg-slate-800 dark:text-slate-400 text-[10px] font-bold tracking-wider">
                                  Draft
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-3">
                              {topics.find((t) => t.slug === art.topicSlug)?.name || art.topicSlug}
                            </td>
                            <td className="py-3 px-3">{art.publishDate}</td>
                            <td className="py-3 px-3 text-right">
                              <button
                                onClick={() => navigateTo(`/admin/articles/${art.id}/edit`)}
                                className="px-2.5 py-1 text-[11px] font-bold tracking-wide border border-black/10 dark:border-white/10 text-nearblack dark:text-white hover:text-gold rounded flex items-center gap-1 ml-auto"
                              >
                                <Edit size={11} />
                                <span>Edit</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* PENDING COMMENTS moderation section */}
                <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-xl p-6 shadow-sm space-y-4">
                  <h3 className="font-serif text-sm font-bold text-nearblack dark:text-white tracking-wider border-b border-black/5 pb-2">
                    Pending Comments Queue
                  </h3>
                  
                  <div className="space-y-4">
                    {pendingCommentsList.map((com) => {
                      const originArt = articles.find((a) => a.slug === com.articleSlug);
                      return (
                        <div
                          key={com.id}
                          className="p-4 border border-black/5 dark:border-white/5 rounded bg-slate-50/40 dark:bg-slate-950/20 space-y-2 text-xs flex justify-between items-start gap-4"
                        >
                          <div className="space-y-1 leading-relaxed flex-1">
                            <div className="flex gap-2 items-center">
                              <strong className="text-nearblack dark:text-white text-[13px]">{com.authorName}</strong>
                              <span className="text-[10px] text-lightgrey">Commented on: <strong className="text-mediumgrey dark:text-gray-300 font-medium">{originArt ? originArt.title : com.articleSlug}</strong></span>
                            </div>
                            <p className="font-serif italic text-mediumgrey dark:text-gray-300">
                              "{com.text}"
                            </p>
                          </div>

                          <div className="flex gap-1.5 shrink-0 my-auto">
                            <button
                              onClick={() => approveComment(com.id)}
                              className="p-1 px-2 text-xs rounded bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 hover:bg-emerald-100 flex items-center gap-0.5"
                              title="Approve Comment inline"
                            >
                              <Check size={12} />
                              <span className="hidden sm:inline">Approve</span>
                            </button>
                            <button
                              onClick={() => deleteComment(com.id)}
                              className="p-1 px-2 text-xs rounded bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-450 hover:bg-rose-100 flex items-center gap-0.5"
                              title="Delete Comment"
                            >
                              <Trash2 size={12} />
                              <span className="hidden sm:inline">Delete</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {pendingCommentsList.length === 0 && (
                      <div className="p-4 text-center text-xs text-lightgrey leading-relaxed">
                        Excellent decorum. No comments are pending moderation review right now.
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* Tab: Articles Full Catalog List */}
            {activeTab === 'articles' && (
              <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-xl p-6 shadow-sm space-y-4 animate-fade-in">
                <div className="flex justify-between items-baseline border-b border-black/5 pb-2">
                  <h2 className="font-serif text-base font-bold text-nearblack dark:text-white tracking-wider">
                    Full Article Archive
                  </h2>
                  <button
                    onClick={handleWriteNewArticle}
                    className="px-3 py-1.5 bg-navy text-white text-[11px] font-bold tracking-wider rounded inline-flex items-center gap-1"
                  >
                    <Plus size={11} />
                    <span>Create New</span>
                  </button>
                </div>

                <div className="divide-y divide-black/5">
                  {articles.map((art) => (
                    <div key={art.id} className="py-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-xs font-sans">
                      <div className="space-y-1 text-xs">
                        <h4 className="font-serif font-extrabold text-sm text-nearblack dark:text-white leading-snug">
                          {art.title}
                        </h4>
                        <div className="flex gap-2.5 text-[11px] text-lightgrey">
                          <span>{art.publishDate}</span>
                          <span>·</span>
                          <span>Topic: {topics.find((t) => t.slug === art.topicSlug)?.name || art.topicSlug}</span>
                          <span>·</span>
                          <span>{art.isPublished ? 'Published' : 'Draft'}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 sm:ml-auto">
                        <button
                          onClick={() => navigateTo(`/admin/articles/${art.id}/edit`)}
                          className="px-2.5 py-1.5 text-[11px] font-bold border border-black/10 dark:border-white/10 hover:text-gold text-nearblack dark:text-white rounded inline-flex items-center gap-1 tracking-wide"
                        >
                          <Edit size={11} />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete "${art.title}"?`)) {
                              deleteArticle(art.id);
                            }
                          }}
                          className="px-2.5 py-1.5 text-[11px] font-bold border border-rose-200 hover:bg-rose-50 text-rose-600 rounded inline-flex items-center gap-1 tracking-wide"
                          title="Delete article"
                        >
                          <Trash2 size={11} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Questions and objections tab */}
            {activeTab === 'questions' && (
              <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-xl p-6 shadow-sm space-y-4 animate-fade-in font-sans">
                <div className="flex justify-between items-baseline border-b border-black/5 pb-2">
                  <h2 className="font-serif text-base font-bold text-nearblack dark:text-white tracking-wider">
                    Community Mapped objections
                  </h2>
                  <button
                    onClick={() => setShowMapQuestionModal(true)}
                    className="px-3 py-1.5 bg-navy text-white text-[11px] font-bold tracking-wider rounded inline-flex items-center gap-1"
                  >
                    <Plus size={11} />
                    <span>Map Objection</span>
                  </button>
                </div>

                <div className="divide-y divide-black/5">
                  {questions.map((q) => (
                    <div key={q.id} className="py-4 flex justify-between items-start gap-4 text-xs">
                      <div className="space-y-1.5">
                        <p className="font-bold text-nearblack dark:text-white">{q.text}</p>
                        <div className="flex flex-wrap gap-2 text-[10px] text-lightgrey leading-none">
                          <DifficultyBadge difficulty={q.difficulty} className="scale-90 origin-left" />
                          <span>·</span>
                          <span>Target: <strong className="text-mediumgrey">{q.articleTitle}</strong></span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Comments full catalog moderation */}
            {activeTab === 'comments' && (
              <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-xl p-6 shadow-sm space-y-4 animate-fade-in font-sans">
                <h2 className="font-serif text-base font-bold text-nearblack dark:text-white tracking-wider border-b border-black/5 pb-2">
                  Community Discussion Moderation Room
                </h2>

                <div className="divide-y divide-black/5">
                  {comments.map((com) => {
                    const art = articles.find((a) => a.slug === com.articleSlug);
                    return (
                      <div key={com.id} className="py-4 flex justify-between items-start gap-4 text-xs">
                        <div className="space-y-1.5 flex-1 leading-relaxed">
                          <div className="flex items-center gap-2">
                            <strong className="text-[13px]">{com.authorName}</strong>
                            {com.isApproved ? (
                              <span className="px-1 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-200 text-[9px] font-bold">Approved</span>
                            ) : (
                              <span className="px-1 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-200 text-[9px] font-bold">Pending Moderation</span>
                            )}
                          </div>
                          <p className="font-serif text-nearblack dark:text-gray-300 italic">"{com.text}"</p>
                          <p className="text-[10px] text-lightgrey">For Paper: {art ? art.title : com.articleSlug}</p>
                        </div>
                        
                        <div className="flex gap-1">
                          {!com.isApproved && (
                            <button
                              onClick={() => approveComment(com.id)}
                              className="px-2 py-1 text-[10px] font-bold tracking-wider bg-emerald-50 text-emerald-700 rounded border border-emerald-100"
                            >
                              Approve
                            </button>
                          )}
                          <button
                            onClick={() => deleteComment(com.id)}
                            className="px-2 py-1 text-[10px] font-bold tracking-wider bg-rose-50 text-rose-600 rounded border border-rose-100"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab: System settings */}
            {activeTab === 'settings' && (
              <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-xl p-6 shadow-sm space-y-6 animate-fade-in font-sans text-xs">
                <div className="border-b border-black/5 pb-2.5">
                  <h2 className="font-serif text-base font-bold text-nearblack dark:text-white tracking-wider">
                    Authorshop Workroom Settings
                  </h2>
                  <p className="text-xs text-mediumgrey">Systems and developer diagnostics settings controls.</p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-amber-50/50 dark:bg-slate-950/20 border-l-4 border-gold rounded-r leading-relaxed">
                    <h4 className="font-bold text-navy dark:text-gold tracking-wider text-[11px] mb-1">Single-Author Constraints</h4>
                    <p className="text-mediumgrey dark:text-gray-300">Hokhma Study relies on local caching data persistence to simulate dynamic publishes. Modifying metadata or editing article paragraphs stores revisions securely inside your browser's persistent state.</p>
                  </div>

                  <div className="space-y-1 pt-2">
                    <span className="text-xs font-bold tracking-wider font-semibold text-mediumgrey block font-sans">
                      Diagnostic Database Tools
                    </span>
                    <button
                      onClick={handleResetDatabase}
                      className="px-4 py-2 border border-rose-200 hover:bg-rose-50 text-rose-600 hover:text-rose-700 font-bold tracking-wider text-[10px] rounded inline-flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw size={13} />
                      <span>Diagnostics: Reset Database Defaults</span>
                    </button>
                    <p className="text-[10px] text-lightgrey">Resets papers, topics, questions and comments back to pristine startup configuration.</p>
                  </div>
                </div>
              </div>
            )}

          </main>

        </div>

      </div>

      {/* MODAL: MAP OBJECTION / QUESTION OVERLAY */}
      {showMapQuestionModal && (
        <div className="fixed inset-0 z-[110] bg-slate-950/80 backdrop-blur-sm flex justify-center items-center p-4 animate-fade-in text-nearblack">
          <div className="bg-white dark:bg-slate-900 rounded-lg max-w-lg w-full shadow-2xl border border-black/10 dark:border-white/10 overflow-hidden text-xs">
            <div className="p-5 border-b border-black/5 flex justify-between items-center whitespace-nowrap bg-white dark:bg-slate-900 text-nearblack dark:text-white">
              <div className="flex items-center gap-2">
                <HelpCircle className="text-gold h-5 w-5" />
                <h3 className="font-serif text-md font-bold">Map Community Objection directly to research</h3>
              </div>
              <button
                onClick={() => setShowMapQuestionModal(false)}
                className="p-1.5 rounded-full hover:bg-black/5 text-nearblack/60 dark:text-white/60"
              >
                <X size={20} />
              </button>
            </div>

            {mapSuccess ? (
              <div className="p-8 text-center space-y-4">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                  <Check size={24} />
                </div>
                <h4 className="font-serif font-bold text-nearblack dark:text-white">Objection Mapped Successfully!</h4>
                <p className="text-xs text-mediumgrey">The objection is now synchronized inside the search and Index filters.</p>
              </div>
            ) : (
              <form onSubmit={handleMapQuestionSubmit} className="p-6 space-y-4 text-nearblack dark:text-gray-200">
                <p className="text-xs text-mediumgrey leading-relaxed">
                  Map a commonly asked question or skepticism directly to an article, ensuring readers discover the response instantly.
                </p>
                <div>
                  <label className="block text-[10px] font-bold text-mediumgrey mb-1">Objection Question Text</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g., Does science disprove general creation?"
                    value={newQuestionForm.text}
                    onChange={(e) => setNewQuestionForm({ ...newQuestionForm, text: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-offwhite dark:bg-slate-950 border border-black/10 rounded focus:outline-none focus:border-gold text-nearblack dark:text-white font-sans"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-mediumgrey mb-1">Core Topic Area</label>
                    <select
                      value={newQuestionForm.topicSlug}
                      onChange={(e) => setNewQuestionForm({ ...newQuestionForm, topicSlug: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-offwhite dark:bg-slate-950 border border-black/10 rounded focus:outline-none text-nearblack dark:text-white"
                    >
                      {topics.map((t) => (
                        <option key={t.slug} value={t.slug}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-mediumgrey mb-1">Difficulty Depth</label>
                    <select
                      value={newQuestionForm.difficulty}
                      onChange={(e) => setNewQuestionForm({ ...newQuestionForm, difficulty: e.target.value as any })}
                      className="w-full px-3 py-2 text-xs bg-offwhite dark:bg-slate-950 border border-black/10 rounded focus:outline-none text-nearblack dark:text-white"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="deep-dive">Deep Dive</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-mediumgrey mb-1">Select Answer Paper</label>
                  <select
                    value={newQuestionForm.articleSlug}
                    onChange={(e) => setNewQuestionForm({ ...newQuestionForm, articleSlug: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-offwhite dark:bg-slate-950 border border-black/10 rounded focus:outline-none text-nearblack dark:text-white"
                    required
                  >
                    <option value="">-- Choose target article --</option>
                    {articles.map((art) => (
                      <option key={art.slug} value={art.slug}>{art.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-mediumgrey mb-1">Tags (Comma separated)</label>
                  <input
                    type="text"
                    placeholder="E.g. pain, theodicy, evil"
                    value={newQuestionForm.tags}
                    onChange={(e) => setNewQuestionForm({ ...newQuestionForm, tags: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-offwhite dark:bg-slate-950 border border-black/10 rounded focus:outline-none text-nearblack dark:text-white"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowMapQuestionModal(false)}
                    className="px-4 py-2 border border-black/10 text-nearblack dark:text-white text-xs font-bold tracking-wider rounded transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-navy text-white dark:bg-gold dark:text-slate-950 text-xs font-bold tracking-wider rounded transition-colors flex items-center gap-1"
                  >
                    <Check size={12} />
                    <span>Map Objection</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
