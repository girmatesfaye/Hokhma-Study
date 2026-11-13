/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import {
  BookOpen,
  Compass,
  FileText,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Route,
  Shield,
  TrendingUp,
  Users
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { cn } from '../lib/cn';
import AdminStatistics from '../components/admin/AdminStatistics';
import OverviewPanel from '../components/admin/OverviewPanel';
import ArticlesPanel from '../components/admin/ArticlesPanel';
import LibraryPanel from '../components/admin/LibraryPanel';
import QuestionsPanel, { QuestionDialog, QuestionDialogRequest } from '../components/admin/QuestionsPanel';
import { CommentsPanel, CommentFilter, ContactPanel, ReaderQuestionsPanel } from '../components/admin/InboxPanels';
import AboutPanel from '../components/admin/AboutPanel';
import { AdminTab } from '../components/admin/adminTabs';
import { Button, Panel } from '../components/admin/ui';

// Admin shell: grouped navigation on the left, the selected screen on the right.
export default function AdminDashboard() {
  const { articles, topics, paths, resources, questions, comments, contactMessages, questionSubmissions, logoutAdmin, navigateTo, isAdmin } = useApp();
  const { getTranslatedText: t } = useLanguage();

  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [commentFilter, setCommentFilter] = useState<CommentFilter>('all');
  // The dialog is remounted with a new key on every open so its form always starts from the request
  const [questionRequest, setQuestionRequest] = useState<QuestionDialogRequest | null>(null);
  const [questionDialogKey, setQuestionDialogKey] = useState(0);

  const openQuestionDialog = (request: QuestionDialogRequest) => {
    setQuestionDialogKey((key) => key + 1);
    setQuestionRequest(request);
  };

  // Jumping from the overview to Comments should land on the pending ones
  const navigate = (tab: AdminTab) => {
    if (tab === 'comments') setCommentFilter('pending');
    setActiveTab(tab);
  };

  if (!isAdmin) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-slate-50 p-6 dark:bg-dark-bg">
        <Panel className="max-w-md space-y-4 p-8 text-center">
          <Shield className="mx-auto size-10 text-gold" aria-hidden="true" />
          <h1 className="font-serif text-2xl font-semibold text-nearblack dark:text-white">{t('Sign In Required', 'መግባት ያስፈልጋል')}</h1>
          <p className="text-sm text-mediumgrey dark:text-gray-400">{t('Only the site author can open the workroom.', 'የሥራ ክፍሉን መክፈት የሚችለው የጣቢያው ደራሲ ብቻ ነው።')}</p>
          <Button variant="primary" onClick={() => navigateTo('/admin/login')}>{t('Go To Sign In', 'ወደ መግቢያ ሂድ')}</Button>
        </Panel>
      </div>
    );
  }

  const pendingComments = comments.filter((c) => !c.isApproved).length;
  const pendingQuestions = questionSubmissions.filter((s) => s.status === 'pending').length;

  // Sidebar structure: each screen belongs to one of four groups; alert counts highlight waiting work
  const navGroups: {
    label: string;
    items: { id: AdminTab; icon: typeof FileText; label: string; count?: number; alert?: boolean }[];
  }[] = [
    {
      label: t('Overview', 'አጠቃላይ እይታ'),
      items: [
        { id: 'dashboard', icon: LayoutDashboard, label: t('Dashboard', 'የማስተዳደሪያ ገጽ') },
        { id: 'statistics', icon: TrendingUp, label: t('Statistics', 'ስታቲስቲክስ') },
      ],
    },
    {
      label: t('Content', 'ይዘት'),
      items: [
        { id: 'articles', icon: FileText, label: t('Articles', 'ጽሑፎች'), count: articles.length },
        { id: 'topics', icon: Compass, label: t('Topics', 'ርዕሶች'), count: topics.length },
        { id: 'paths', icon: Route, label: t('Learning Paths', 'የጥናት መንገዶች'), count: paths.length },
        { id: 'resources', icon: BookOpen, label: t('Resources', 'ግብዓቶች'), count: resources.length },
        { id: 'questions', icon: HelpCircle, label: t('Questions', 'ጥያቄዎች'), count: questions.length },
      ],
    },
    {
      label: t('Inbox', 'የገቢ መልዕክት'),
      items: [
        { id: 'comments', icon: MessageSquare, label: t('Comments', 'አስተያየቶች'), count: pendingComments, alert: true },
        { id: 'inquiries', icon: MessageSquare, label: t('Contact Messages', 'የግንኙነት መልዕክቶች'), count: contactMessages.length },
        { id: 'submissions', icon: HelpCircle, label: t('Reader Questions', 'የአንባቢ ጥያቄዎች'), count: pendingQuestions, alert: true },
      ],
    },
    {
      label: t('Site', 'ድረ-ገጽ'),
      items: [{ id: 'about', icon: Users, label: t('About Page', 'ስለ እኛ ገጽ') }],
    },
  ];

  return (
    <div className="min-h-dvh bg-slate-50 py-8 dark:bg-dark-bg">
      <div className="mx-auto max-w-[1140px] space-y-6 px-4 md:px-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-serif text-3xl font-semibold text-nearblack dark:text-white">{t('Author Workroom', 'የጸሐፊ የሥራ ክፍል')}</h1>
          <div className="flex items-center gap-2">
            <Button onClick={() => navigateTo('/')}>{t('View Public Site', 'ይፋዊውን ድረ-ገጽ ይመልከቱ')}</Button>
            <Button
              id="admin-logout-btn"
              onClick={() => {
                logoutAdmin();
                navigateTo('/');
              }}
            >
              <LogOut className="size-4" aria-hidden="true" />
              {t('Sign Out', 'ውጣ')}
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Small screens get one select instead of a tall stacked menu */}
          <div className="lg:hidden">
            <label className="block space-y-1.5">
              <span className="text-sm font-semibold text-nearblack dark:text-gray-200">{t('Section', 'ክፍል')}</span>
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value as AdminTab)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 dark:border-white/15 dark:bg-dark-input"
              >
                {navGroups.map((group) => (
                  <optgroup key={group.label} label={group.label}>
                    {group.items.map((item) => (
                      <option key={item.id} value={item.id}>{item.label}{item.count !== undefined ? ` (${item.count})` : ''}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </label>
          </div>

          <aside className="hidden lg:col-span-3 lg:block">
            <nav aria-label={t('Workroom Sections', 'የሥራ ክፍል ክፍሎች')} className="sticky top-6 space-y-5">
              {navGroups.map((group) => (
                <div key={group.label} className="space-y-1">
                  <p className="px-3 pb-1 text-sm font-semibold text-mediumgrey dark:text-gray-400">{group.label}</p>
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    const needsAction = Boolean(item.alert) && (item.count || 0) > 0;
                    return (
                      <button
                        key={item.id}
                        onClick={() => navigate(item.id)}
                        aria-current={isActive ? 'page' : undefined}
                        className={cn(
                          'flex w-full cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold',
                          isActive
                            ? 'bg-navy text-white dark:bg-gold dark:text-slate-950'
                            : 'text-nearblack hover:bg-slate-200/70 dark:text-gray-200 dark:hover:bg-white/5'
                        )}
                      >
                        <Icon className="size-4 shrink-0" aria-hidden="true" />
                        <span className="flex-1 truncate">{item.label}</span>
                        {item.count !== undefined && (!item.alert || needsAction) && (
                          <span
                            className={cn(
                              'rounded-md px-1.5 text-xs font-semibold tabular-nums',
                              needsAction && !isActive ? 'bg-gold text-slate-950' : 'opacity-70'
                            )}
                          >
                            {item.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </nav>
          </aside>

          <main className="min-w-0 lg:col-span-9">
            {activeTab === 'dashboard' && <OverviewPanel onNavigate={navigate} />}
            {activeTab === 'statistics' && <AdminStatistics />}
            {activeTab === 'articles' && <ArticlesPanel />}
            {(activeTab === 'topics' || activeTab === 'paths' || activeTab === 'resources') && <LibraryPanel key={activeTab} kind={activeTab} />}
            {activeTab === 'questions' && <QuestionsPanel onOpenDialog={openQuestionDialog} />}
            {activeTab === 'comments' && <CommentsPanel filter={commentFilter} onFilterChange={setCommentFilter} />}
            {activeTab === 'inquiries' && <ContactPanel />}
            {activeTab === 'submissions' && <ReaderQuestionsPanel onAnswer={(submission) => openQuestionDialog({ submission })} />}
            {activeTab === 'about' && <AboutPanel />}
          </main>
        </div>
      </div>

      {questionRequest && <QuestionDialog key={questionDialogKey} request={questionRequest} onClose={() => setQuestionRequest(null)} />}
    </div>
  );
}
