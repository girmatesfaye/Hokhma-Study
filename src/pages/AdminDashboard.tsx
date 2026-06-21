/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
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

  const { language, getTranslatedText } = useLanguage();
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
          <h2 className="font-serif text-xl font-bold">{getTranslatedText('Authorship Security Required', 'የደህንነት ማረጋገጫ ያስፈልጋል')}</h2>
          <p className="text-xs text-gray-400">
            {getTranslatedText(
              "Reviewing permission guidelines... Secure entry is mandated for Dr. Sterling's private workroom.",
              "የፈቃድ መመሪያዎችን በመመርመር ላይ... ወደ ዶ/ር ስተርሊንግ ስራ ክፍል ለመግባት ደህንነት ማረጋገጥ ግዴታ ነው።"
            )}
          </p>
          <button
            onClick={() => navigateTo('/admin/login')}
            className="px-6 py-2 bg-gold text-slate-950 text-xs font-bold tracking-wider rounded cursor-pointer font-sans uppercase"
          >
            {getTranslatedText('Authenticate Profile', 'ማንነትዎን ያረጋግጡ')}
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
      title: 'Untitled Article Draft',
      titleAm: 'ርዕስ አልባ ረቂቅ ጽሑፍ',
      topicSlug: 'philosophy',
      difficulty: 'beginner',
      readingTime: 5,
      publishDate: new Date().toISOString().split('T')[0],
      excerpt: 'This is a preliminary excerpt representing what this new research paper answers.',
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
    const confirmation = getTranslatedText(
      'Are you entirely sure you want to revert all custom article edits and comments back to default? This resets the database.',
      'ሁሉንም የተደረጉ የጽሑፍ ለውጦች እና አስተያየቶች ወደ መጀመሪያው ለመመለስ ሙሉ በሙሉ እርግጠኛ ነዎት?'
    );
    if (confirm(confirmation)) {
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
                {getTranslatedText('Workroom Tab', 'የሥራ መስክ')}
              </span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigateTo('/')}
              className="text-xs font-semibold text-mediumgrey hover:text-navy dark:hover:text-white transition-colors tracking-wider block cursor-pointer font-sans uppercase"
            >
              {getTranslatedText('Public Hub', 'ይፋዊ ድረ-ገጽ')}
            </button>
            <button
              id="admin-logout-btn"
              onClick={() => {
                logoutAdmin();
                navigateTo('/');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-semibold cursor-pointer font-sans"
              title="Logout session"
            >
              <LogOut size={13} />
              <span>{getTranslatedText('Sign Out', 'ውጣ')}</span>
            </button>
          </div>
        </div>

        {/* CONTROLLER ROW: Layout (Sidebar menu + Main screen metrics) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT SIDEBAR NAVIGATION: Dashboard · Articles · Questions · Paths · Comments · Settings */}
          <aside className="lg:col-span-3 space-y-4 font-sans">
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
                <span>{getTranslatedText('Dashboard Home', 'የማስተዳደሪያ ገጽ')}</span>
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
                <span>{getTranslatedText('My Articles', 'የእኔ ጽሑፎች')} ({articles.length})</span>
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
                <span>{getTranslatedText('Questions Mapped', 'የተያያዙ ጥያቄዎች')} ({questions.length})</span>
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
                <span>{getTranslatedText('Pending Comments', 'ያልጸደቁ አስተያየቶች')} ({comments.filter((c) => !c.isApproved).length})</span>
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
                <span>{getTranslatedText('System Settings', 'ሥርዓት ቅንብሮች')}</span>
              </button>
            </div>
            
            {/* Quick stats mini card */}
            <div className="bg-slate-900 border border-white/5 rounded-xl p-5 text-xs text-slate-300 space-y-2">
              <p className="font-serif font-semibold text-white">{getTranslatedText('System Environment', 'የስርዓት ሁኔታ')}</p>
              <div className="space-y-1 font-mono text-[10px]">
                <p>{getTranslatedText('Status: Secure Online', 'ሁኔታ፡ አስተማማኝ መስመር ላይ')}</p>
                <p>{getTranslatedText('Curator: Thomas Sterling', 'አዘጋጅ: ቶማስ ስተርሊንግ')}</p>
                <p>{getTranslatedText('Date:', 'ቀን፡')} {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </aside>

          {/* MAIN AREA */}
          <main className="lg:col-span-9 space-y-8">
            
            {activeTab === 'dashboard' && (
              <div className="space-y-8 animate-fade-in font-sans">
                
                {/* STATS ROW: 4 metric cards specified */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Card 1: Total articles */}
                  <div className="bg-white dark:bg-slate-900 p-5 rounded-lg border border-black/5 shadow-sm text-center space-y-1">
                    <FileText className="text-gold h-5 w-5 mx-auto" />
                    <span className="text-[10px] font-bold text-mediumgrey block uppercase tracking-wider">{getTranslatedText('Total Articles', 'ጠቅላላ ጽሑፎች')}</span>
                    <strong className="text-2xl font-serif text-nearblack dark:text-white block">{metricTotalArticles}</strong>
                  </div>

                  {/* Card 2: Total views */}
                  <div className="bg-white dark:bg-slate-900 p-5 rounded-lg border border-black/5 shadow-sm text-center space-y-1">
                    <TrendingUp className="text-gold h-5 w-5 mx-auto" />
                    <span className="text-[10px] font-bold text-mediumgrey block uppercase tracking-wider">{getTranslatedText('Monthly Reads', 'የወር ንባቦች')}</span>
                    <strong className="text-2xl font-serif text-nearblack dark:text-white block">{metricTotalViews}</strong>
                  </div>

                  {/* Card 3: Pending comments */}
                  <div className="bg-white dark:bg-slate-900 p-5 rounded-lg border border-black/5 shadow-sm text-center space-y-1">
                    <MessageSquare className="text-gold h-5 w-5 mx-auto" />
                    <span className="text-[10px] font-bold text-mediumgrey block uppercase tracking-wider">{getTranslatedText('Pending Comments', 'ያልጸደቁ')}</span>
                    <strong className="text-2xl font-serif text-nearblack dark:text-white block">{metricPendingComments}</strong>
                  </div>

                  {/* Card 4: Newsletter Subscribers */}
                  <div className="bg-white dark:bg-slate-900 p-5 rounded-lg border border-black/5 shadow-sm text-center space-y-1">
                    <Users className="text-gold h-5 w-5 mx-auto" />
                    <span className="text-[10px] font-bold text-mediumgrey block uppercase tracking-wider">{getTranslatedText('Newsletter Subs', 'የፈጣን ወሬ')}</span>
                    <strong className="text-2xl font-serif text-nearblack dark:text-white block">{metricNewsletterTotal}</strong>
                  </div>
                </div>

                {/* QUICK ACTIONS ROW */}
                <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-xl p-6 shadow-sm space-y-4">
                  <h3 className="font-serif text-sm font-bold text-nearblack dark:text-white tracking-wider border-b border-black/5 pb-2">
                    {getTranslatedText('Quick Workspace Actions', 'ፈጣን የሥራ ማዘዣዎች')}
                  </h3>
                  <div className="flex flex-wrap gap-4">
                    <button
                      id="write-new-article-btn"
                      onClick={handleWriteNewArticle}
                      className="px-4 py-2 bg-navy text-white hover:bg-navy/90 text-xs font-bold tracking-wider rounded inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <PlusCircle size={14} />
                      <span>{getTranslatedText('Write New Article', 'አዲስ ጽሑፍ ጻፍ')}</span>
                    </button>
                    <button
                      id="map-new-question-btn"
                      onClick={() => setShowMapQuestionModal(true)}
                      className="px-4 py-2 bg-amber-50 dark:bg-slate-800 text-gold border border-gold hover:bg-gold/10 text-xs font-bold tracking-wider rounded inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <HelpCircle size={14} />
                      <span>{getTranslatedText('Map A Question', 'አዲስ ጥያቄ አያይዝ')}</span>
                    </button>
                  </div>
                </div>

                {/* RECENT ARTICLES TABLE (Draft/Published, Edit Link) */}
                <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-xl p-6 shadow-sm space-y-4 overflow-hidden">
                  <div className="flex justify-between items-baseline border-b border-black/5 pb-2">
                    <h3 className="font-serif text-sm font-bold text-nearblack dark:text-white tracking-wider">
                      {getTranslatedText('Recent Articles', 'የቅርብ ጊዜ ጽሑፎች')}
                    </h3>
                    <button onClick={() => setActiveTab('articles')} className="text-xs text-gold hover:underline cursor-pointer">
                      {getTranslatedText('See All Articles →', 'ሁሉንም ጽሑፎች ይመልከቱ →')}
                    </button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-mediumgrey">
                      <thead>
                        <tr className="border-b border-black/5 p-2 bg-slate-50 dark:bg-slate-950 font-sans font-bold tracking-wider">
                          <th className="py-2.5 px-3">{getTranslatedText('Title', 'ርዕስ')}</th>
                          <th className="py-2.5 px-3">{getTranslatedText('State', 'ሁኔታ')}</th>
                          <th className="py-2.5 px-3">{getTranslatedText('Topic', 'ርዕሰ ጉዳይ')}</th>
                          <th className="py-2.5 px-3">{getTranslatedText('Published Date', 'የታተመበት ቀን')}</th>
                          <th className="py-2.5 px-3 text-right">{getTranslatedText('Action', 'ተግባር')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5">
                        {articles.slice(0, 4).map((art) => (
                          <tr key={art.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 font-sans">
                            <td className="py-3 px-3 font-medium text-nearblack dark:text-white max-w-xs truncate">
                              {getTranslatedText(art.title, art.titleAm)}
                            </td>
                            <td className="py-3 px-3">
                              {art.isPublished ? (
                                <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 text-[10px] font-bold tracking-wider uppercase">
                                  {getTranslatedText('Published', 'የታተመ')}
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-755 dark:bg-slate-800 dark:text-slate-400 text-[10px] font-bold tracking-wider uppercase">
                                  {getTranslatedText('Draft', 'ረቂቅ')}
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-3">
                              {topics.find((t) => t.slug === art.topicSlug)?.name 
                                ? getTranslatedText(topics.find((t) => t.slug === art.topicSlug)!.name, topics.find((t) => t.slug === art.topicSlug)!.nameAm)
                                : art.topicSlug}
                            </td>
                            <td className="py-3 px-3">{art.publishDate}</td>
                            <td className="py-3 px-3 text-right">
                              <button
                                onClick={() => navigateTo(`/admin/articles/${art.id}/edit`)}
                                className="px-2.5 py-1 text-[11px] font-bold tracking-wide border border-black/10 dark:border-white/10 text-nearblack dark:text-white hover:text-gold rounded flex items-center gap-1 ml-auto cursor-pointer"
                              >
                                <Edit size={11} />
                                <span>{getTranslatedText('Edit', 'አድስ')}</span>
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
                    {getTranslatedText('Pending Comments Queue', 'የአስተያየቶች መገምገሚያ ወረፋ')}
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
                              <span className="text-[10px] text-lightgrey">
                                {getTranslatedText('Commented on:', 'የተሰጠው በ፦')}{' '}
                                <strong className="text-mediumgrey dark:text-gray-300 font-medium">
                                  {originArt ? getTranslatedText(originArt.title, originArt.titleAm) : com.articleSlug}
                                </strong>
                              </span>
                            </div>
                            <p className="font-serif italic text-mediumgrey dark:text-gray-300">
                              "{com.text}"
                            </p>
                          </div>

                          <div className="flex gap-1.5 shrink-0 my-auto">
                            <button
                              onClick={() => approveComment(com.id)}
                              className="p-1 px-2 text-xs rounded bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 hover:bg-emerald-100 flex items-center gap-0.5 cursor-pointer"
                              title="Approve Comment inline"
                            >
                              <Check size={12} />
                              <span className="hidden sm:inline">{getTranslatedText('Approve', 'አጽድቅ')}</span>
                            </button>
                            <button
                              onClick={() => deleteComment(com.id)}
                              className="p-1 px-2 text-xs rounded bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-450 hover:bg-rose-100 flex items-center gap-0.5 cursor-pointer"
                              title="Delete Comment"
                            >
                              <Trash2 size={12} />
                              <span className="hidden sm:inline">{getTranslatedText('Delete', 'ሰርዝ')}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {pendingCommentsList.length === 0 && (
                      <div className="p-4 text-center text-xs text-lightgrey leading-relaxed">
                        {getTranslatedText('Excellent decorum. No comments are pending moderation review right now.', 'ፍጹም ዝምታ። በአሁኑ ጊዜ ምንም ያልጸደቁ አስተያየቶች የሉም።')}
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
                    {getTranslatedText('Full Article Archive', 'ሙሉ የጽሑፎች ማህደር')}
                  </h2>
                  <button
                    onClick={handleWriteNewArticle}
                    className="px-3 py-1.5 bg-navy text-white text-[11px] font-bold tracking-wider rounded inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={11} />
                    <span>{getTranslatedText('Create New', 'አዲስ ፍጠር')}</span>
                  </button>
                </div>

                <div className="divide-y divide-black/5">
                  {articles.map((art) => (
                    <div key={art.id} className="py-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-xs font-sans">
                      <div className="space-y-1 text-xs">
                        <h4 className="font-serif font-extrabold text-sm text-nearblack dark:text-white leading-snug">
                          {getTranslatedText(art.title, art.titleAm)}
                        </h4>
                        <div className="flex gap-2.5 text-[11px] text-lightgrey">
                          <span>{art.publishDate}</span>
                          <span>·</span>
                          <span>
                            {getTranslatedText('Topic', 'ርዕሰ ጉዳይ')}:{' '}
                            {topics.find((t) => t.slug === art.topicSlug)?.name
                              ? getTranslatedText(topics.find((t) => t.slug === art.topicSlug)!.name, topics.find((t) => t.slug === art.topicSlug)!.nameAm)
                              : art.topicSlug}
                          </span>
                          <span>·</span>
                          <span>{art.isPublished ? getTranslatedText('Published', 'የታተመ') : getTranslatedText('Draft', 'ረቂቅ')}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 sm:ml-auto">
                        <button
                          onClick={() => navigateTo(`/admin/articles/${art.id}/edit`)}
                          className="px-2.5 py-1.5 text-[11px] font-bold border border-black/10 dark:border-white/10 hover:text-gold text-nearblack dark:text-white rounded inline-flex items-center gap-1 tracking-wide cursor-pointer"
                        >
                          <Edit size={11} />
                          <span>{getTranslatedText('Edit', 'አድስ')}</span>
                        </button>
                        <button
                          onClick={() => {
                            const deleteConfirmText = getTranslatedText(
                              `Are you sure you want to delete "${art.title}"?`,
                              `"${getTranslatedText(art.title, art.titleAm)}" የሚለውን ጽሑፍ ለመሰረዝ እርግጠኛ ነዎት?`
                            );
                            if (confirm(deleteConfirmText)) {
                              deleteArticle(art.id);
                            }
                          }}
                          className="px-2.5 py-1.5 text-[11px] font-bold border border-rose-200 hover:bg-rose-50 text-rose-600 rounded inline-flex items-center gap-1 tracking-wide cursor-pointer"
                          title="Delete article"
                        >
                          <Trash2 size={11} />
                          <span>{getTranslatedText('Delete', 'ሰርዝ')}</span>
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
                    {getTranslatedText('Community Mapped Objections', 'የማህበረሰብ ጥያቄዎች ማውጫ')}
                  </h2>
                  <button
                    onClick={() => setShowMapQuestionModal(true)}
                    className="px-3 py-1.5 bg-navy text-white text-[11px] font-bold tracking-wider rounded inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={11} />
                    <span>{getTranslatedText('Map Objection', 'ጥያቄ አያይዝ')}</span>
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
                          <span>
                            {getTranslatedText('Target Paper:', 'መልስ ጽሑፍ፦')}{' '}
                            <strong className="text-mediumgrey">{q.articleTitle}</strong>
                          </span>
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
                  {getTranslatedText('Community Discussion Moderation Room', 'የአንባቢዎች አስተያየት ጠቅላላ ገምጋሚ ክፍል')}
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
                              <span className="px-1 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-200 text-[9px] font-bold uppercase">{getTranslatedText('Approved', 'የጸደቀ')}</span>
                            ) : (
                              <span className="px-1 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-200 text-[9px] font-bold uppercase">{getTranslatedText('Pending Moderation', 'በግምገማ ላይ')}</span>
                            )}
                          </div>
                          <p className="font-serif text-nearblack dark:text-gray-300 italic">"{com.text}"</p>
                          <p className="text-[10px] text-lightgrey">For Paper: {art ? getTranslatedText(art.title, art.titleAm) : com.articleSlug}</p>
                        </div>
                        
                        <div className="flex gap-1">
                          {!com.isApproved && (
                            <button
                              onClick={() => approveComment(com.id)}
                              className="px-2 py-1 text-[10px] font-bold tracking-wider bg-emerald-50 text-emerald-700 rounded border border-emerald-100 cursor-pointer"
                            >
                              {getTranslatedText('Approve', 'አጽድቅ')}
                            </button>
                          )}
                          <button
                            onClick={() => deleteComment(com.id)}
                            className="px-2 py-1 text-[10px] font-bold tracking-wider bg-rose-50 text-rose-600 rounded border border-rose-100 cursor-pointer"
                          >
                            {getTranslatedText('Delete', 'ሰርዝ')}
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
                    {getTranslatedText('Authorship Workroom Settings', 'የአዘጋጅ የሥራ ገበታ ቅንብሮች')}
                  </h2>
                  <p className="text-xs text-mediumgrey">{getTranslatedText('Systems and developer diagnostics settings controls.', 'ለሥርዓት ፍተሻና ለመረጃ ቁጥጥር የሚረዱ ቅንብሮች።')}</p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-amber-50/50 dark:bg-slate-950/20 border-l-4 border-gold rounded-r leading-relaxed">
                    <h4 className="font-bold text-navy dark:text-gold tracking-wider text-[11px] mb-1">{getTranslatedText('Single-Author Constraints', 'የአንድ አዘጋጅ ደንቦች')}</h4>
                    <p className="text-mediumgrey dark:text-gray-300">{getTranslatedText('Hokhma Study relies on local caching data persistence to simulate dynamic publishes. Modifying metadata or editing article paragraphs stores revisions securely inside your browser\'s persistent state.', 'Hokhma Study የተደረጉ የጽሑፍ ለውጦችን በየምድቡ ለማስቀመጥ የብራውዘርዎን የአካባቢ መሸጎጫ (local cache) ይጠቀማል።')}</p>
                  </div>

                  <div className="space-y-1 pt-2">
                    <span className="text-xs font-bold tracking-wider font-semibold text-mediumgrey block font-sans">
                      {getTranslatedText('Diagnostic Database Tools', 'የመረጃ መፍቻ መሳሪያዎች')}
                    </span>
                    <button
                      onClick={handleResetDatabase}
                      className="px-4 py-2 border border-rose-200 hover:bg-rose-50 text-rose-600 hover:text-rose-700 font-bold tracking-wider text-[10px] rounded inline-flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw size={13} />
                      <span>{getTranslatedText('Diagnostics: Reset Database Defaults', 'ውሂብ ወደ መጀመሪያው ሁኔታ መልስ')}</span>
                    </button>
                    <p className="text-[10px] text-lightgrey">{getTranslatedText('Resets papers, topics, questions and comments back to pristine startup configuration.', 'ጽሑፎችን፣ ርዕሶችን፣ ጥያቄዎችንና አስተያየቶችን ወደ መጀመሪያው ንጹሕ ሁኔታ ይመልሳል።')}</p>
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
                <h3 className="font-serif text-md font-bold">{getTranslatedText('Map Community Objection Directly To Research', 'ጥያቄውን ከምርምር ጽሑፎች ጋር ያያይዙ')}</h3>
              </div>
              <button
                onClick={() => setShowMapQuestionModal(false)}
                className="p-1.5 rounded-full hover:bg-black/5 text-nearblack/60 dark:text-white/60 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {mapSuccess ? (
              <div className="p-8 text-center space-y-4">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto whitespace-nowrap">
                  <Check size={24} />
                </div>
                <h4 className="font-serif font-bold text-nearblack dark:text-white">{getTranslatedText('Objection Mapped Successfully!', 'ማያያዣው በተሳካ ሁኔታ ተጠናቋል!')}</h4>
                <p className="text-xs text-mediumgrey">{getTranslatedText('The objection is now synchronized inside the search and Index filters.', 'ጥያቄው አሁን በፍለጋ ማውጫው ውስጥ ተካቷል።')}</p>
              </div>
            ) : (
              <form onSubmit={handleMapQuestionSubmit} className="p-6 space-y-4 text-nearblack dark:text-gray-200">
                <p className="text-xs text-mediumgrey leading-relaxed">
                  {getTranslatedText('Map a commonly asked question or skepticism directly to an article, ensuring readers discover the response instantly.', 'አንባቢዎች መልሱን ወዲያውኑ እንዲያገኙ በተደጋጋሚ የሚጠየቁ የስነ-መለኮት ጥያቄዎችን ከአንድ ጽሑፍ ጋር ያያይዙ።')}
                </p>
                <div>
                  <label className="block text-[10px] font-bold text-mediumgrey mb-1">{getTranslatedText('Objection Question Text', 'የጥያቄው ጽሕፈት')}</label>
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
                    <label className="block text-[10px] font-bold text-mediumgrey mb-1">{getTranslatedText('Core Topic Area', 'ዋናው ርዕሰ ጉዳይ')}</label>
                    <select
                      value={newQuestionForm.topicSlug}
                      onChange={(e) => setNewQuestionForm({ ...newQuestionForm, topicSlug: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-offwhite dark:bg-slate-950 border border-black/10 rounded focus:outline-none text-nearblack dark:text-white"
                    >
                      {topics.map((t) => (
                        <option key={t.slug} value={t.slug}>{getTranslatedText(t.name, t.nameAm)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-mediumgrey mb-1">{getTranslatedText('Difficulty Depth', 'የጥልቀት ደረጃ')}</label>
                    <select
                      value={newQuestionForm.difficulty}
                      onChange={(e) => setNewQuestionForm({ ...newQuestionForm, difficulty: e.target.value as any })}
                      className="w-full px-3 py-2 text-xs bg-offwhite dark:bg-slate-950 border border-black/10 rounded focus:outline-none text-nearblack dark:text-white"
                    >
                      <option value="beginner">{getTranslatedText('Beginner', 'ጀማሪ')}</option>
                      <option value="intermediate">{getTranslatedText('Intermediate', 'መካከለኛ')}</option>
                      <option value="deep-dive">{getTranslatedText('Deep Dive', 'ጥልቅ ጥናት')}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-mediumgrey mb-1">{getTranslatedText('Select Answer Paper', 'ይህንን ጥያቄ የሚመልሰው ጽሑፍ')}</label>
                  <select
                    value={newQuestionForm.articleSlug}
                    onChange={(e) => setNewQuestionForm({ ...newQuestionForm, articleSlug: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-offwhite dark:bg-slate-950 border border-black/10 rounded focus:outline-none text-nearblack dark:text-white font-sans"
                    required
                  >
                    <option value="">-- {getTranslatedText('Choose target article', 'መለስ ጽሑፉን ይምረጡ')} --</option>
                    {articles.map((art) => (
                      <option key={art.slug} value={art.slug}>{getTranslatedText(art.title, art.titleAm)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-mediumgrey mb-1">{getTranslatedText('Tags (Comma separated)', 'መለዮዎች (በኮማ የተለዩ)')}</label>
                  <input
                    type="text"
                    placeholder="E.g. pain, theodicy, evil"
                    value={newQuestionForm.tags}
                    onChange={(e) => setNewQuestionForm({ ...newQuestionForm, tags: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-offwhite dark:bg-slate-950 border border-black/10 rounded focus:outline-none text-nearblack dark:text-white font-sans"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3 font-sans">
                  <button
                    type="button"
                    onClick={() => setShowMapQuestionModal(false)}
                    className="px-4 py-2 border border-black/10 text-nearblack dark:text-white text-xs font-bold tracking-wider rounded transition-colors cursor-pointer"
                  >
                    {getTranslatedText('Cancel', 'ውድቅ አድርግ')}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-navy text-white dark:bg-gold dark:text-slate-950 text-xs font-bold tracking-wider rounded transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Check size={12} />
                    <span>{getTranslatedText('Map Objection', 'ማያያዣ ፈጽም')}</span>
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
