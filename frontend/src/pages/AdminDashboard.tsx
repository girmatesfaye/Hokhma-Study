/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { AUTHOR_BIO, STATEMENT_OF_FAITH } from '../data';
import DifficultyBadge from '../components/DifficultyBadge';
import { Article, Question, Comment, Difficulty, LearningPath, Resource, Topic } from '../types';
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
  BookOpen,
  Route,
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
    resources,
    approveComment,
    deleteComment,
    deleteArticle,
    addArticle,
    addQuestion,
    addTopic,
    updateTopic,
    deleteTopic,
    addPath,
    updatePath,
    deletePath,
    addResource,
    updateResource,
    deleteResource,
    logoutAdmin,
    navigateTo,
    isAdmin
  } = useApp();

  const { language, getTranslatedText } = useLanguage();
  const [activeTab, setActiveTab] = useState<
    | 'dashboard'
    | 'articles'
    | 'topics'
    | 'paths'
    | 'resources'
    | 'questions'
    | 'comments'
    | 'profile'
    | 'faith'
    | 'navigation'
    | 'subscribers'
    | 'inquiries'
    | 'submissions'
    | 'settings'
  >('dashboard');

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
  const [contentModal, setContentModal] = useState<'topic' | 'path' | 'resource' | null>(null);
  const [editingContentId, setEditingContentId] = useState<string | null>(null);
  const [detailContent, setDetailContent] = useState<{ type: 'topic' | 'path' | 'resource'; id: string } | null>(null);
  const [topicForm, setTopicForm] = useState({ name: '', description: '', icon: 'Compass' });
  const [pathForm, setPathForm] = useState({ title: '', description: '', goal: '', articleSlugs: '' });
  const [resourceForm, setResourceForm] = useState({ title: '', category: 'Books' as Resource['category'], author: '', description: '', link: '' });

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
            className="px-6 py-2 bg-gold text-slate-950 text-xs font-bold tracking-wider rounded cursor-pointer font-sans"
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

  const closeContentModal = () => {
    setContentModal(null);
    setEditingContentId(null);
    setTopicForm({ name: '', description: '', icon: 'Compass' });
    setPathForm({ title: '', description: '', goal: '', articleSlugs: '' });
    setResourceForm({ title: '', category: 'Books', author: '', description: '', link: '' });
  };

  const handleContentCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    if (contentModal === 'topic' && topicForm.name.trim()) {
      const currentTopic = editingContentId ? topics.find((topic) => topic.slug === editingContentId) : undefined;
      const topic: Topic = {
        slug: currentTopic?.slug || slugify(topicForm.name),
        name: topicForm.name.trim(),
        description: topicForm.description.trim(),
        articleCount: currentTopic?.articleCount || 0,
        icon: topicForm.icon.trim() || 'Compass',
      };
      if (editingContentId) updateTopic(topic);
      else addTopic(topic);
    }

    if (contentModal === 'path' && pathForm.title.trim()) {
      const articleSlugs = pathForm.articleSlugs.split(',').map((slug) => slug.trim()).filter(Boolean);
      const totalReadingTime = articleSlugs.reduce((total, slug) => total + (articles.find((article) => article.slug === slug)?.readingTime || 0), 0);
      const currentPath = editingContentId ? paths.find((path) => path.slug === editingContentId) : undefined;
      const newPath: LearningPath = {
        slug: currentPath?.slug || slugify(pathForm.title),
        title: pathForm.title.trim(),
        description: pathForm.description.trim(),
        goal: pathForm.goal.trim(),
        articleCount: articleSlugs.length,
        difficultyRange: 'Beginner to Deep Dive',
        totalReadingTime,
        articleSlugs,
      };
      if (editingContentId) updatePath(newPath);
      else addPath(newPath);
    }

    if (contentModal === 'resource' && resourceForm.title.trim() && resourceForm.link.trim()) {
      const resource: Resource = {
        id: editingContentId || `resource-${Date.now()}`,
        category: resourceForm.category,
        title: resourceForm.title.trim(),
        author: resourceForm.author.trim(),
        description: resourceForm.description.trim(),
        link: resourceForm.link.trim(),
      };
      if (editingContentId) updateResource(resource);
      else addResource(resource);
    }

    closeContentModal();
  };

  const openTopicEditor = (topic: Topic) => {
    setEditingContentId(topic.slug);
    setTopicForm({ name: topic.name, description: topic.description, icon: topic.icon });
    setContentModal('topic');
  };

  const openPathEditor = (path: LearningPath) => {
    setEditingContentId(path.slug);
    setPathForm({ title: path.title, description: path.description, goal: path.goal, articleSlugs: path.articleSlugs.join(', ') });
    setContentModal('path');
  };

  const openResourceEditor = (resource: Resource) => {
    setEditingContentId(resource.id);
    setResourceForm({ title: resource.title, category: resource.category, author: resource.author, description: resource.description, link: resource.link });
    setContentModal('resource');
  };

  const closeContentDetail = () => setDetailContent(null);

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

        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold font-sans">
              {getTranslatedText('Private Author Workroom', 'የግል የጸሐፊ የሥራ ክፍል')}
            </p>
            <h1 className="mt-1 font-serif text-3xl font-bold tracking-tight text-nearblack dark:text-white text-balance">
              {getTranslatedText('Content Command Center', 'የይዘት መቆጣጠሪያ ማዕከል')}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-mediumgrey dark:text-gray-400">
              {getTranslatedText(
                'Shape the articles, questions, and public study library that readers discover through Hokhma Study.',
                'አንባቢዎች በሆክማ ጥናት የሚያገኙትን ጽሑፎች፣ ጥያቄዎችና የጥናት ቤተ-መጻሕፍት ያዘጋጁ።'
              )}
            </p>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
            {getTranslatedText('Workspace Ready', 'የሥራ ቦታው ዝግጁ ነው')}
          </span>
        </div>
        
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
              className="text-xs font-semibold text-mediumgrey hover:text-navy dark:hover:text-white transition-colors tracking-wider block cursor-pointer font-sans"
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
          <aside className="lg:col-span-3 space-y-4 font-sans lg:sticky lg:top-24 lg:self-start">
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

              {[
                { id: 'topics' as const, icon: Compass, label: 'Topics', count: topics.length },
                { id: 'paths' as const, icon: Route, label: 'Learning Paths', count: paths.length },
                { id: 'resources' as const, icon: BookOpen, label: 'Resources', count: resources.length },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full text-left py-2.5 px-3.5 rounded-lg text-xs font-bold tracking-wider transition-all flex items-center gap-2.5 cursor-pointer ${
                      activeTab === item.id
                        ? 'bg-navy text-white dark:bg-gold dark:text-slate-950'
                        : 'text-mediumgrey hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon size={15} aria-hidden="true" />
                    <span>{getTranslatedText(item.label, item.label)} ({item.count})</span>
                  </button>
                );
              })}

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

              {[
                { id: 'profile' as const, icon: Users, label: 'Author Profile' },
                { id: 'faith' as const, icon: Shield, label: 'Statement Of Faith' },
                { id: 'navigation' as const, icon: Globe, label: 'Navigation Content' },
                { id: 'subscribers' as const, icon: Users, label: 'Newsletter Subscribers' },
                { id: 'inquiries' as const, icon: MessageSquare, label: 'Contact Messages' },
                { id: 'submissions' as const, icon: HelpCircle, label: 'Question Submissions' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full text-left py-2.5 px-3.5 rounded-lg text-xs font-bold tracking-wider transition-all flex items-center gap-2.5 cursor-pointer ${
                      activeTab === item.id
                        ? 'bg-navy text-white dark:bg-gold dark:text-slate-950'
                        : 'text-mediumgrey hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon size={15} aria-hidden="true" />
                    <span>{getTranslatedText(item.label, item.label)}</span>
                  </button>
                );
              })}

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
                    <span className="text-[10px] font-bold text-mediumgrey block tracking-wider">{getTranslatedText('Total Articles', 'ጠቅላላ ጽሑፎች')}</span>
                    <strong className="text-2xl font-serif text-nearblack dark:text-white block">{metricTotalArticles}</strong>
                  </div>

                  {/* Card 2: Total views */}
                  <div className="bg-white dark:bg-slate-900 p-5 rounded-lg border border-black/5 shadow-sm text-center space-y-1">
                    <TrendingUp className="text-gold h-5 w-5 mx-auto" />
                    <span className="text-[10px] font-bold text-mediumgrey block tracking-wider">{getTranslatedText('Monthly Reads', 'የወር ንባቦች')}</span>
                    <strong className="text-2xl font-serif text-nearblack dark:text-white block">{metricTotalViews}</strong>
                  </div>

                  {/* Card 3: Pending comments */}
                  <div className="bg-white dark:bg-slate-900 p-5 rounded-lg border border-black/5 shadow-sm text-center space-y-1">
                    <MessageSquare className="text-gold h-5 w-5 mx-auto" />
                    <span className="text-[10px] font-bold text-mediumgrey block tracking-wider">{getTranslatedText('Pending Comments', 'ያልጸደቁ')}</span>
                    <strong className="text-2xl font-serif text-nearblack dark:text-white block">{metricPendingComments}</strong>
                  </div>

                  {/* Card 4: Newsletter Subscribers */}
                  <div className="bg-white dark:bg-slate-900 p-5 rounded-lg border border-black/5 shadow-sm text-center space-y-1">
                    <Users className="text-gold h-5 w-5 mx-auto" />
                    <span className="text-[10px] font-bold text-mediumgrey block tracking-wider">{getTranslatedText('Newsletter Subs', 'የፈጣን ወሬ')}</span>
                    <strong className="text-2xl font-serif text-nearblack dark:text-white block">{metricNewsletterTotal}</strong>
                  </div>
                </div>

                <section className="space-y-4" aria-labelledby="content-inventory-heading">
                  <div className="flex flex-col gap-1 border-b border-black/5 pb-3 dark:border-white/5">
                    <h2 id="content-inventory-heading" className="font-serif text-lg font-bold text-nearblack dark:text-white">
                      {getTranslatedText('Public Content Inventory', 'የህዝብ ይዘት ማውጫ')}
                    </h2>
                    <p className="text-xs leading-relaxed text-mediumgrey dark:text-gray-400">
                      {getTranslatedText(
                        'Keep the public learning library in view while you work on manuscripts and moderation.',
                        'በጽሑፎችና በአስተያየቶች ላይ ሲሰሩ የህዝብ የጥናት ቤተ-መጻሕፍትን በእይታ ያቆዩ።'
                      )}
                    </p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-xl border border-black/5 bg-white p-5 shadow-sm dark:border-white/5 dark:bg-slate-900">
                      <Compass className="h-5 w-5 text-gold" aria-hidden="true" />
                      <p className="mt-4 text-[10px] font-bold uppercase tracking-wider text-mediumgrey dark:text-gray-400">
                        {getTranslatedText('Topics', 'ርዕሶች')}
                      </p>
                      <p className="mt-1 font-serif text-3xl font-bold text-nearblack dark:text-white">{topics.length}</p>
                      <button
                        onClick={() => navigateTo('/topics')}
                        className="mt-4 text-xs font-bold text-gold underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
                      >
                        {getTranslatedText('View Public Topics', 'የህዝብ ርዕሶችን ይመልከቱ')}
                      </button>
                    </div>
                    <div className="rounded-xl border border-black/5 bg-white p-5 shadow-sm dark:border-white/5 dark:bg-slate-900">
                      <Route className="h-5 w-5 text-gold" aria-hidden="true" />
                      <p className="mt-4 text-[10px] font-bold uppercase tracking-wider text-mediumgrey dark:text-gray-400">
                        {getTranslatedText('Learning Paths', 'የጥናት መንገዶች')}
                      </p>
                      <p className="mt-1 font-serif text-3xl font-bold text-nearblack dark:text-white">{paths.length}</p>
                      <button
                        onClick={() => navigateTo('/paths')}
                        className="mt-4 text-xs font-bold text-gold underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
                      >
                        {getTranslatedText('View Public Paths', 'የህዝብ መንገዶችን ይመልከቱ')}
                      </button>
                    </div>
                    <div className="rounded-xl border border-black/5 bg-white p-5 shadow-sm dark:border-white/5 dark:bg-slate-900">
                      <BookOpen className="h-5 w-5 text-gold" aria-hidden="true" />
                      <p className="mt-4 text-[10px] font-bold uppercase tracking-wider text-mediumgrey dark:text-gray-400">
                        {getTranslatedText('Resources', 'ግብዓቶች')}
                      </p>
                      <p className="mt-1 font-serif text-3xl font-bold text-nearblack dark:text-white">{resources.length}</p>
                      <button
                        onClick={() => navigateTo('/resources')}
                        className="mt-4 text-xs font-bold text-gold underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
                      >
                        {getTranslatedText('View Public Resources', 'የህዝብ ግብዓቶችን ይመልከቱ')}
                      </button>
                    </div>
                  </div>
                </section>

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
                                <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 text-[10px] font-bold tracking-wider">
                                  {getTranslatedText('Published', 'የታተመ')}
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-755 dark:bg-slate-800 dark:text-slate-400 text-[10px] font-bold tracking-wider">
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
                              <span className="px-1 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-200 text-[9px] font-bold">{getTranslatedText('Approved', 'የጸደቀ')}</span>
                            ) : (
                              <span className="px-1 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-200 text-[9px] font-bold">{getTranslatedText('Pending Moderation', 'በግምገማ ላይ')}</span>
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

            {(activeTab === 'topics' || activeTab === 'paths' || activeTab === 'resources') && (
              <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-xl p-6 shadow-sm space-y-5 animate-fade-in font-sans">
                <div className="flex flex-col gap-3 border-b border-black/5 pb-3 dark:border-white/5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <h2 className="font-serif text-base font-bold text-nearblack dark:text-white">
                      {activeTab === 'topics' && getTranslatedText('Topics Library', 'የርዕሶች ቤተ-መጻሕፍት')}
                      {activeTab === 'paths' && getTranslatedText('Learning Path Library', 'የጥናት መንገዶች ቤተ-መጻሕፍት')}
                      {activeTab === 'resources' && getTranslatedText('Recommended Resources', 'የሚመከሩ ግብዓቶች')}
                    </h2>
                    <p className="text-xs leading-relaxed text-mediumgrey dark:text-gray-400">
                    {getTranslatedText(
                      'These records are currently loaded from the local content catalog. Backend editing controls will persist changes for all readers.',
                      'እነዚህ መዝገቦች አሁን ከአካባቢያዊ የይዘት ማውጫ ይጫናሉ። የኋላ ክፍል ማስተካከያ ቁጥጥሮች ለሁሉም አንባቢዎች ለውጦችን ያስቀምጣሉ።'
                    )}
                    </p>
                  </div>
                  <button
                    onClick={() => setContentModal(activeTab === 'topics' ? 'topic' : activeTab === 'paths' ? 'path' : 'resource')}
                    className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded bg-navy px-3 py-2 text-[11px] font-bold tracking-wider text-white hover:bg-navy/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 dark:bg-gold dark:text-slate-950"
                  >
                    <Plus size={13} aria-hidden="true" />
                    {getTranslatedText('Add New', 'አዲስ ጨምር')}
                  </button>
                </div>
                {detailContent && (
                  <div className="rounded-xl border border-gold/30 bg-gold/5 p-5 dark:bg-gold/10">
                    <div className="flex items-start justify-between gap-4 border-b border-gold/20 pb-4">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gold">{getTranslatedText('Content Detail', 'የይዘት ዝርዝር')}</p>
                        <h3 className="mt-1 font-serif text-xl font-bold text-nearblack dark:text-white">
                          {detailContent.type === 'topic' && topics.find((topic) => topic.slug === detailContent.id)?.name}
                          {detailContent.type === 'path' && paths.find((path) => path.slug === detailContent.id)?.title}
                          {detailContent.type === 'resource' && resources.find((resource) => resource.id === detailContent.id)?.title}
                        </h3>
                      </div>
                      <button onClick={closeContentDetail} className="rounded border border-black/10 px-3 py-1.5 text-xs font-bold text-mediumgrey hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 dark:border-white/10 dark:hover:bg-slate-800">{getTranslatedText('Back To List', 'ወደ ዝርዝሩ ተመለስ')}</button>
                    </div>

                    {detailContent.type === 'topic' && (() => {
                      const topic = topics.find((item) => item.slug === detailContent.id);
                      const topicArticles = articles.filter((article) => article.topicSlug === detailContent.id);
                      if (!topic) return null;
                      return (
                        <div className="mt-4 space-y-4">
                          <p className="text-sm leading-relaxed text-mediumgrey dark:text-gray-300">{getTranslatedText(topic.description, topic.descriptionAm)}</p>
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-nearblack dark:text-white">{getTranslatedText('Articles In This Topic', 'በዚህ ርዕስ ውስጥ ያሉ ጽሑፎች')} ({topicArticles.length})</h4>
                            <div className="mt-3 space-y-2">
                              {topicArticles.length > 0 ? topicArticles.map((article) => (
                                <div key={article.id} className="flex items-center justify-between gap-3 rounded-lg border border-black/5 bg-white p-3 dark:border-white/5 dark:bg-slate-900">
                                  <div className="min-w-0"><p className="truncate text-sm font-semibold text-nearblack dark:text-white">{getTranslatedText(article.title, article.titleAm)}</p><p className="mt-1 text-[11px] text-mediumgrey dark:text-gray-400">{article.isPublished ? getTranslatedText('Published', 'የታተመ') : getTranslatedText('Draft', 'ረቂቅ')} · {article.readingTime} min</p></div>
                                  <button onClick={() => navigateTo(`/admin/articles/${article.id}/edit`)} className="shrink-0 text-xs font-bold text-gold hover:underline">{getTranslatedText('Edit Article', 'ጽሑፉን ያስተካክሉ')}</button>
                                </div>
                              )) : <p className="rounded-lg border border-dashed border-black/10 p-4 text-xs text-mediumgrey dark:border-white/10">{getTranslatedText('No articles are assigned to this topic yet.', 'እስካሁን ምንም ጽሑፍ ከዚህ ርዕስ ጋር አልተመደበም።')}</p>}
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {detailContent.type === 'path' && (() => {
                      const path = paths.find((item) => item.slug === detailContent.id);
                      if (!path) return null;
                      const pathArticles = path.articleSlugs.map((slug) => articles.find((article) => article.slug === slug)).filter(Boolean) as Article[];
                      return (
                        <div className="mt-4 space-y-4">
                          <p className="text-sm leading-relaxed text-mediumgrey dark:text-gray-300">{getTranslatedText(path.description, path.descriptionAm)}</p>
                          <div className="rounded-lg border border-black/5 bg-white p-4 dark:border-white/5 dark:bg-slate-900"><p className="text-[10px] font-bold uppercase tracking-wider text-gold">{getTranslatedText('Learning Goal', 'የጥናት ግብ')}</p><p className="mt-2 text-sm leading-relaxed text-mediumgrey dark:text-gray-300">{getTranslatedText(path.goal, path.goalAm)}</p></div>
                          <div><h4 className="text-xs font-bold uppercase tracking-wider text-nearblack dark:text-white">{getTranslatedText('Articles In This Path', 'በዚህ መንገድ ውስጥ ያሉ ጽሑፎች')} ({pathArticles.length})</h4><div className="mt-3 space-y-2">{pathArticles.map((article, index) => <div key={article.id} className="flex items-center justify-between gap-3 rounded-lg border border-black/5 bg-white p-3 dark:border-white/5 dark:bg-slate-900"><div className="flex min-w-0 items-center gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold/10 text-xs font-bold text-gold">{index + 1}</span><p className="truncate text-sm font-semibold text-nearblack dark:text-white">{getTranslatedText(article.title, article.titleAm)}</p></div><button onClick={() => navigateTo(`/admin/articles/${article.id}/edit`)} className="shrink-0 text-xs font-bold text-gold hover:underline">{getTranslatedText('Edit Article', 'ጽሑፉን ያስተካክሉ')}</button></div>)}</div></div>
                        </div>
                      );
                    })()}

                    {detailContent.type === 'resource' && (() => {
                      const resource = resources.find((item) => item.id === detailContent.id);
                      if (!resource) return null;
                      return <div className="mt-4 space-y-4"><p className="text-sm leading-relaxed text-mediumgrey dark:text-gray-300">{getTranslatedText(resource.description, resource.descriptionAm)}</p><p className="text-xs text-mediumgrey dark:text-gray-400">{getTranslatedText('Author', 'ደራሲ')}: <strong className="text-nearblack dark:text-white">{getTranslatedText(resource.author, resource.authorAm)}</strong></p><a href={resource.link} target="_blank" rel="noreferrer" className="inline-flex text-xs font-bold text-gold underline-offset-4 hover:underline">{getTranslatedText('Open External Resource', 'ውጫዊ ግብዓቱን ይክፈቱ')} ↗</a></div>;
                    })()}
                  </div>
                )}

                {!detailContent && <div className="space-y-3">
                  {activeTab === 'topics' && topics.map((topic) => (
                    <div key={topic.slug} className="flex flex-col gap-2 rounded-lg border border-black/5 p-4 dark:border-white/5 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="font-serif font-bold text-nearblack dark:text-white">{getTranslatedText(topic.name, topic.nameAm)}</h3>
                        <p className="mt-1 text-xs text-mediumgrey dark:text-gray-400">{topic.articleCount} {getTranslatedText('articles', 'ጽሑፎች')}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button onClick={() => setDetailContent({ type: 'topic', id: topic.slug })} className="w-fit text-xs font-bold text-gold underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60">{getTranslatedText('View Details', 'ዝርዝሩን ይመልከቱ')}</button>
                        <button onClick={() => openTopicEditor(topic)} className="w-fit text-xs font-bold text-gold underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60">{getTranslatedText('Edit Topic', 'ርዕሱን ያስተካክሉ')}</button>
                        <button onClick={() => { if (confirm(`Delete topic "${topic.name}"?`)) deleteTopic(topic.slug); }} className="text-xs font-bold text-rose-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/60">{getTranslatedText('Delete', 'ሰርዝ')}</button>
                      </div>
                    </div>
                  ))}
                  {activeTab === 'paths' && paths.map((path) => (
                    <div key={path.slug} className="flex flex-col gap-2 rounded-lg border border-black/5 p-4 dark:border-white/5 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="font-serif font-bold text-nearblack dark:text-white">{getTranslatedText(path.title, path.titleAm)}</h3>
                        <p className="mt-1 text-xs text-mediumgrey dark:text-gray-400">{path.articleCount} {getTranslatedText('steps', 'ደረጃዎች')} · {path.totalReadingTime} {getTranslatedText('minutes', 'ደቂቃዎች')}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button onClick={() => setDetailContent({ type: 'path', id: path.slug })} className="w-fit text-xs font-bold text-gold underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60">{getTranslatedText('View Details', 'ዝርዝሩን ይመልከቱ')}</button>
                        <button onClick={() => openPathEditor(path)} className="w-fit text-xs font-bold text-gold underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60">{getTranslatedText('Edit Path', 'መንገዱን ያስተካክሉ')}</button>
                        <button onClick={() => { if (confirm(`Delete learning path "${path.title}"?`)) deletePath(path.slug); }} className="text-xs font-bold text-rose-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/60">{getTranslatedText('Delete', 'ሰርዝ')}</button>
                      </div>
                    </div>
                  ))}
                  {activeTab === 'resources' && resources.map((resource) => (
                    <div key={resource.id} className="flex flex-col gap-2 rounded-lg border border-black/5 p-4 dark:border-white/5 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="font-serif font-bold text-nearblack dark:text-white">{getTranslatedText(resource.title, resource.titleAm)}</h3>
                        <p className="mt-1 text-xs text-mediumgrey dark:text-gray-400">{resource.category} · {getTranslatedText(resource.author, resource.authorAm)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button onClick={() => setDetailContent({ type: 'resource', id: resource.id })} className="w-fit text-xs font-bold text-gold underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60">{getTranslatedText('View Details', 'ዝርዝሩን ይመልከቱ')}</button>
                        <button onClick={() => openResourceEditor(resource)} className="w-fit text-xs font-bold text-gold underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60">{getTranslatedText('Edit Resource', 'ግብዓቱን ያስተካክሉ')}</button>
                        <button onClick={() => { if (confirm(`Delete resource "${resource.title}"?`)) deleteResource(resource.id); }} className="text-xs font-bold text-rose-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/60">{getTranslatedText('Delete', 'ሰርዝ')}</button>
                      </div>
                    </div>
                  ))}
                </div>}
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-xl p-6 shadow-sm space-y-5 animate-fade-in font-sans">
                <div className="border-b border-black/5 pb-3 dark:border-white/5">
                  <h2 className="font-serif text-base font-bold text-nearblack dark:text-white">{getTranslatedText('Author Profile', 'የጸሐፊ መገለጫ')}</h2>
                  <p className="mt-1 text-xs text-mediumgrey dark:text-gray-400">{getTranslatedText('This profile powers the public About page and footer.', 'ይህ መገለጫ የህዝብ ስለ ገጽንና ግርጌን ያስኬዳል።')}</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    ['Name', AUTHOR_BIO.name],
                    ['Role', AUTHOR_BIO.role],
                    ['Email', AUTHOR_BIO.email],
                    ['Tagline', AUTHOR_BIO.tagline],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-lg border border-black/5 p-4 dark:border-white/5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-mediumgrey dark:text-gray-400">{label}</p>
                      <p className="mt-2 text-sm font-semibold text-nearblack dark:text-white break-words">{value}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-lg border border-dashed border-gold/50 bg-gold/5 p-4 text-xs leading-relaxed text-mediumgrey dark:text-gray-300">{getTranslatedText('Editing is visible here, but persistence is still local until the backend content settings are connected.', 'ማስተካከያ እዚህ ይታያል፤ የኋላ ክፍል የይዘት ቅንብሮች እስኪገናኙ ድረስ ግን ማስቀመጥ አካባቢያዊ ነው።')}</div>
              </div>
            )}

            {activeTab === 'faith' && (
              <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-xl p-6 shadow-sm space-y-5 animate-fade-in font-sans">
                <div className="border-b border-black/5 pb-3 dark:border-white/5">
                  <h2 className="font-serif text-base font-bold text-nearblack dark:text-white">{getTranslatedText('Statement Of Faith', 'የእምነት መግለጫ')}</h2>
                  <p className="mt-1 text-xs text-mediumgrey dark:text-gray-400">{getTranslatedText('Review the doctrines currently displayed in the public footer and About page.', 'በህዝብ ግርጌና ስለ ገጽ ላይ የሚታዩትን እምነቶች ይመልከቱ።')}</p>
                </div>
                <div className="space-y-3">
                  {STATEMENT_OF_FAITH.map((item) => (
                    <div key={item.doctrine} className="rounded-lg border border-black/5 p-4 dark:border-white/5">
                      <h3 className="font-serif font-bold text-nearblack dark:text-white">{item.doctrine}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-mediumgrey dark:text-gray-300">{item.belief}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'navigation' && (
              <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-xl p-6 shadow-sm space-y-5 animate-fade-in font-sans">
                <div className="border-b border-black/5 pb-3 dark:border-white/5">
                  <h2 className="font-serif text-base font-bold text-nearblack dark:text-white">{getTranslatedText('Navigation Content', 'የአሰሳ ይዘት')}</h2>
                  <p className="mt-1 text-xs text-mediumgrey dark:text-gray-400">{getTranslatedText('Public navigation currently uses these routes and labels.', 'የህዝብ አሰሳ አሁን እነዚህን መንገዶችና ስያሜዎች ይጠቀማል።')}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    ['Home', '/'], ['Topics', '/topics'], ['Questions', '/questions'], ['Learning Paths', '/paths'], ['Resources', '/resources'], ['About', '/about'],
                  ].map(([label, route]) => (
                    <div key={route} className="flex items-center justify-between rounded-lg border border-black/5 p-4 dark:border-white/5">
                      <span className="text-sm font-semibold text-nearblack dark:text-white">{label}</span>
                      <span className="font-mono text-xs text-mediumgrey dark:text-gray-400">{route}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(activeTab === 'subscribers' || activeTab === 'inquiries' || activeTab === 'submissions') && (
              <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-xl p-6 shadow-sm space-y-5 animate-fade-in font-sans">
                <div className="border-b border-black/5 pb-3 dark:border-white/5">
                  <h2 className="font-serif text-base font-bold text-nearblack dark:text-white">
                    {activeTab === 'subscribers' && getTranslatedText('Newsletter Subscribers', 'የጋዜጣ ተመዝጋቢዎች')}
                    {activeTab === 'inquiries' && getTranslatedText('Contact Messages', 'የግንኙነት መልዕክቶች')}
                    {activeTab === 'submissions' && getTranslatedText('Public Question Submissions', 'የህዝብ ጥያቄ ማስገቢያዎች')}
                  </h2>
                  <p className="mt-1 text-xs text-mediumgrey dark:text-gray-400">{getTranslatedText('This queue is ready for backend records, moderation, and export controls.', 'ይህ ወረፋ ለኋላ ክፍል መዝገቦች፣ ለግምገማና ለማውጫ ቁጥጥሮች ዝግጁ ነው።')}</p>
                </div>
                <div className="rounded-xl border border-dashed border-black/10 bg-slate-50 p-8 text-center dark:border-white/10 dark:bg-slate-950/40">
                  <MessageSquare className="mx-auto h-8 w-8 text-gold" aria-hidden="true" />
                  <h3 className="mt-3 font-serif font-bold text-nearblack dark:text-white">{getTranslatedText('No Backend Records Yet', 'እስካሁን የኋላ ክፍል መዝገብ የለም')}</h3>
                  <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-mediumgrey dark:text-gray-400">{getTranslatedText('The public form currently shows a confirmation locally. Connect the backend queue to receive, review, and manage real submissions here.', 'የህዝብ ቅጹ አሁን በአካባቢው ማረጋገጫ ብቻ ያሳያል። እውነተኛ ማስገቢያዎችን ለመቀበልና ለመቆጣጠር የኋላ ክፍል ወረፋውን ያገናኙ።')}</p>
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

      {contentModal && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-fade-in"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeContentModal();
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') closeContentModal();
          }}
          role="presentation"
        >
          <div
            className="max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto overscroll-contain rounded-xl border border-black/10 bg-white text-nearblack shadow-2xl dark:border-white/10 dark:bg-slate-900 dark:text-white"
            role="dialog"
            aria-modal="true"
            aria-labelledby="content-modal-title"
            tabIndex={-1}
          >
            <div className="flex items-center justify-between border-b border-black/5 p-5 dark:border-white/5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gold">{getTranslatedText(editingContentId ? 'Update Public Content' : 'Create Public Content', editingContentId ? 'የህዝብ ይዘት ያዘምኑ' : 'የህዝብ ይዘት ይፍጠሩ')}</p>
                <h2 id="content-modal-title" className="mt-1 font-serif text-lg font-bold">
                  {contentModal === 'topic' && getTranslatedText(editingContentId ? 'Update Topic' : 'Add Topic', editingContentId ? 'ርዕስ ያዘምኑ' : 'ርዕስ ይጨምሩ')}
                  {contentModal === 'path' && getTranslatedText(editingContentId ? 'Update Learning Path' : 'Add Learning Path', editingContentId ? 'የጥናት መንገድ ያዘምኑ' : 'የጥናት መንገድ ይጨምሩ')}
                  {contentModal === 'resource' && getTranslatedText(editingContentId ? 'Update Resource' : 'Add Resource', editingContentId ? 'ግብዓት ያዘምኑ' : 'ግብዓት ይጨምሩ')}
                </h2>
              </div>
              <button onClick={closeContentModal} aria-label="Close dialog" className="rounded-full p-1.5 text-mediumgrey hover:bg-black/5 hover:text-nearblack focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 dark:hover:bg-white/5 dark:hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleContentCreate} className="space-y-4 p-5 text-xs">
              {contentModal === 'topic' && (
                <>
                  <label className="block space-y-1.5"><span className="font-bold text-mediumgrey">{getTranslatedText('Topic Name', 'የርዕስ ስም')}</span><input required value={topicForm.name} onChange={(e) => setTopicForm({ ...topicForm, name: e.target.value })} placeholder="E.g., Biblical Archaeology…" className="w-full rounded border border-black/10 px-3 py-2 dark:border-white/10" /></label>
                  <label className="block space-y-1.5"><span className="font-bold text-mediumgrey">{getTranslatedText('Description', 'መግለጫ')}</span><textarea required value={topicForm.description} onChange={(e) => setTopicForm({ ...topicForm, description: e.target.value })} rows={3} placeholder="Describe what readers will study…" className="w-full rounded border border-black/10 px-3 py-2 dark:border-white/10" /></label>
                  <label className="block space-y-1.5"><span className="font-bold text-mediumgrey">{getTranslatedText('Lucide Icon Name', 'የአይኮን ስም')}</span><input value={topicForm.icon} onChange={(e) => setTopicForm({ ...topicForm, icon: e.target.value })} placeholder="Compass" className="w-full rounded border border-black/10 px-3 py-2 dark:border-white/10" /></label>
                </>
              )}

              {contentModal === 'path' && (
                <>
                  <label className="block space-y-1.5"><span className="font-bold text-mediumgrey">{getTranslatedText('Path Title', 'የመንገድ ርዕስ')}</span><input required value={pathForm.title} onChange={(e) => setPathForm({ ...pathForm, title: e.target.value })} placeholder="E.g., Foundations Of Faith…" className="w-full rounded border border-black/10 px-3 py-2 dark:border-white/10" /></label>
                  <label className="block space-y-1.5"><span className="font-bold text-mediumgrey">{getTranslatedText('Description', 'መግለጫ')}</span><textarea required value={pathForm.description} onChange={(e) => setPathForm({ ...pathForm, description: e.target.value })} rows={2} placeholder="Describe the learning journey…" className="w-full rounded border border-black/10 px-3 py-2 dark:border-white/10" /></label>
                  <label className="block space-y-1.5"><span className="font-bold text-mediumgrey">{getTranslatedText('Learning Goal', 'የጥናት ግብ')}</span><textarea required value={pathForm.goal} onChange={(e) => setPathForm({ ...pathForm, goal: e.target.value })} rows={2} placeholder="What will readers understand by the end?…" className="w-full rounded border border-black/10 px-3 py-2 dark:border-white/10" /></label>
                  <label className="block space-y-1.5"><span className="font-bold text-mediumgrey">{getTranslatedText('Article Slugs, Comma Separated', 'የጽሑፍ ስሞች በኮማ የተለዩ')}</span><input value={pathForm.articleSlugs} onChange={(e) => setPathForm({ ...pathForm, articleSlugs: e.target.value })} placeholder="cosmological-fine-tuning, the-moral-argument…" className="w-full rounded border border-black/10 px-3 py-2 dark:border-white/10" /></label>
                </>
              )}

              {contentModal === 'resource' && (
                <>
                  <label className="block space-y-1.5"><span className="font-bold text-mediumgrey">{getTranslatedText('Resource Title', 'የግብዓት ርዕስ')}</span><input required value={resourceForm.title} onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })} placeholder="E.g., The Reason For God…" className="w-full rounded border border-black/10 px-3 py-2 dark:border-white/10" /></label>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label className="block space-y-1.5"><span className="font-bold text-mediumgrey">{getTranslatedText('Category', 'ምድብ')}</span><select value={resourceForm.category} onChange={(e) => setResourceForm({ ...resourceForm, category: e.target.value as Resource['category'] })} className="w-full rounded border border-black/10 px-3 py-2 dark:border-white/10"><option>Books</option><option>Websites</option><option>Podcasts</option><option>Videos</option></select></label>
                    <label className="block space-y-1.5"><span className="font-bold text-mediumgrey">{getTranslatedText('Author', 'ደራሲ')}</span><input required value={resourceForm.author} onChange={(e) => setResourceForm({ ...resourceForm, author: e.target.value })} placeholder="Author or organization…" className="w-full rounded border border-black/10 px-3 py-2 dark:border-white/10" /></label>
                  </div>
                  <label className="block space-y-1.5"><span className="font-bold text-mediumgrey">{getTranslatedText('Description', 'መግለጫ')}</span><textarea required value={resourceForm.description} onChange={(e) => setResourceForm({ ...resourceForm, description: e.target.value })} rows={3} placeholder="Explain why readers should explore it…" className="w-full rounded border border-black/10 px-3 py-2 dark:border-white/10" /></label>
                  <label className="block space-y-1.5"><span className="font-bold text-mediumgrey">URL</span><input required type="url" value={resourceForm.link} onChange={(e) => setResourceForm({ ...resourceForm, link: e.target.value })} placeholder="https://example.org…" className="w-full rounded border border-black/10 px-3 py-2 dark:border-white/10" /></label>
                </>
              )}

              <div className="flex justify-end gap-3 border-t border-black/5 pt-4 dark:border-white/5">
                <button type="button" onClick={closeContentModal} className="rounded border border-black/10 px-4 py-2 font-bold dark:border-white/10">{getTranslatedText('Cancel', 'ይቅር')}</button>
                <button type="submit" className="rounded bg-navy px-4 py-2 font-bold text-white dark:bg-gold dark:text-slate-950">{getTranslatedText(editingContentId ? 'Save Updates' : 'Create Content', editingContentId ? 'ማሻሻያዎችን አስቀምጥ' : 'ይዘት ይፍጠሩ')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

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
