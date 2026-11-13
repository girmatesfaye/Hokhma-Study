import { Check, Pencil, Plus, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { AdminTab } from './adminTabs';
import { Badge, Button, ConfirmDialog, EmptyState, Panel, PanelHeader, RecordList } from './ui';

// Landing screen: what needs action first, then the latest articles and the totals.
export default function OverviewPanel({ onNavigate }: { onNavigate: (tab: AdminTab) => void }) {
  const { articles, topics, comments, questionSubmissions, approveComment, deleteComment, navigateTo } = useApp();
  const { getTranslatedText: t } = useLanguage();

  const pendingComments = comments.filter((c) => !c.isApproved);
  const waitingQuestions = questionSubmissions.filter((s) => s.status === 'pending');
  const drafts = articles.filter((a) => !a.isPublished);
  const published = articles.length - drafts.length;
  const totalReads = articles.reduce((sum, a) => sum + (a.views || 0), 0);
  const nothingWaiting = pendingComments.length + waitingQuestions.length + drafts.length === 0;

  const attention = [
    { count: pendingComments.length, label: t('Comments Waiting For Review', 'ግምገማ የሚጠብቁ አስተያየቶች'), action: t('Review Comments', 'አስተያየቶችን ገምግም'), tab: 'comments' as const },
    { count: waitingQuestions.length, label: t('Reader Questions Without An Answer', 'መልስ ያላገኙ የአንባቢ ጥያቄዎች'), action: t('Answer Questions', 'ጥያቄዎችን መልስ'), tab: 'submissions' as const },
    { count: drafts.length, label: t('Drafts Not Yet Published', 'ገና ያልታተሙ ረቂቆች'), action: t('Open Drafts', 'ረቂቆችን ክፈት'), tab: 'articles' as const },
  ].filter((item) => item.count > 0);

  return (
    <div className="space-y-6">
      <Panel>
        <PanelHeader
          title={t('Needs Attention', 'ትኩረት የሚሹ')}
          description={nothingWaiting ? t('Nothing is waiting for you right now.', 'አሁን የሚጠብቅዎት ምንም ነገር የለም።') : t('Start here. These are the items readers are waiting on.', 'ከዚህ ይጀምሩ። አንባቢዎች የሚጠብቋቸው ነገሮች እነዚህ ናቸው።')}
        />
        {nothingWaiting ? (
          <EmptyState
            message={t('Your inbox is clear and every article is published. A good moment to write something new.', 'የገቢ መልዕክትዎ ባዶ ነው፤ ሁሉም ጽሑፎች ታትመዋል። አዲስ ለመጻፍ ጥሩ ጊዜ ነው።')}
            action={
              <Button variant="primary" onClick={() => navigateTo('/admin/articles/new/edit')}>
                <Plus className="size-4" aria-hidden="true" />
                {t('Write New Article', 'አዲስ ጽሑፍ ጻፍ')}
              </Button>
            }
          />
        ) : (
          <RecordList>
            {attention.map((item) => (
              <li key={item.tab} className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="flex min-w-0 items-baseline gap-3">
                  <span className="font-serif text-2xl font-semibold tabular-nums text-nearblack dark:text-white">{item.count}</span>
                  <span className="truncate text-sm text-mediumgrey dark:text-gray-300">{item.label}</span>
                </div>
                <Button size="sm" onClick={() => onNavigate(item.tab)}>
                  {item.action}
                </Button>
              </li>
            ))}
          </RecordList>
        )}

        {pendingComments.length > 0 && (
          <div className="border-t border-slate-200 dark:border-white/10">
            <h3 className="px-5 pt-4 text-sm font-semibold text-nearblack dark:text-white">{t('Latest Pending Comments', 'የቅርብ ጊዜ ያልጸደቁ አስተያየቶች')}</h3>
            <RecordList>
              {pendingComments.slice(0, 3).map((com) => {
                const article = articles.find((a) => a.slug === com.articleSlug);
                return (
                  <li key={com.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 space-y-1">
                      <p className="text-sm font-semibold text-nearblack dark:text-white">
                        {com.authorName}
                        <span className="ml-2 font-normal text-mediumgrey dark:text-gray-400">
                          {t('on', 'በ')} {article ? t(article.title, article.titleAm) : com.articleSlug}
                        </span>
                      </p>
                      <p className="line-clamp-2 font-serif text-base text-mediumgrey dark:text-gray-300">{com.text}</p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Button size="sm" onClick={() => approveComment(com.id)}>
                        <Check className="size-3.5" aria-hidden="true" />
                        {t('Approve', 'አጽድቅ')}
                      </Button>
                      <ConfirmDialog
                        trigger={
                          <Button size="sm" variant="danger">
                            <Trash2 className="size-3.5" aria-hidden="true" />
                            {t('Delete', 'ሰርዝ')}
                          </Button>
                        }
                        title={t('Delete This Comment?', 'ይህ አስተያየት ይሰረዝ?')}
                        description={t('The comment is removed permanently and cannot be restored.', 'አስተያየቱ ለዘለዓለም ይወገዳል፤ መመለስ አይቻልም።')}
                        confirmLabel={t('Delete Comment', 'አስተያየቱን ሰርዝ')}
                        cancelLabel={t('Cancel', 'ይቅር')}
                        onConfirm={() => deleteComment(com.id)}
                      />
                    </div>
                  </li>
                );
              })}
            </RecordList>
          </div>
        )}
      </Panel>

      <Panel>
        <PanelHeader
          title={t('Recent Articles', 'የቅርብ ጊዜ ጽሑፎች')}
          action={
            <Button variant="primary" onClick={() => navigateTo('/admin/articles/new/edit')}>
              <Plus className="size-4" aria-hidden="true" />
              {t('Write New Article', 'አዲስ ጽሑፍ ጻፍ')}
            </Button>
          }
        />
        {articles.length === 0 ? (
          <EmptyState message={t('No articles yet. Your first one will appear here.', 'እስካሁን ጽሑፍ የለም። የመጀመሪያው እዚህ ይታያል።')} />
        ) : (
          <RecordList>
            {articles.slice(0, 5).map((art) => {
              const topic = topics.find((x) => x.slug === art.topicSlug);
              return (
                <li key={art.id} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div className="min-w-0">
                    <p className="truncate font-serif text-lg font-semibold text-nearblack dark:text-white">{t(art.title, art.titleAm)}</p>
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-mediumgrey dark:text-gray-400">
                      <Badge tone={art.isPublished ? 'success' : 'neutral'}>{art.isPublished ? t('Published', 'የታተመ') : t('Draft', 'ረቂቅ')}</Badge>
                      <span>{topic ? t(topic.name, topic.nameAm) : art.topicSlug}</span>
                      <span className="tabular-nums">{art.publishDate}</span>
                    </p>
                  </div>
                  <Button size="sm" onClick={() => navigateTo(`/admin/articles/${art.id}/edit`)}>
                    <Pencil className="size-3.5" aria-hidden="true" />
                    {t('Edit', 'አድስ')}
                  </Button>
                </li>
              );
            })}
          </RecordList>
        )}
        {articles.length > 5 && (
          <div className="border-t border-slate-200 px-5 py-3 dark:border-white/10">
            <Button variant="ghost" size="sm" onClick={() => onNavigate('articles')}>
              {t('See All Articles', 'ሁሉንም ጽሑፎች ይመልከቱ')}
            </Button>
          </div>
        )}
      </Panel>

      <Panel>
        <dl className="grid grid-cols-2 divide-slate-200 dark:divide-white/10 sm:grid-cols-4 sm:divide-x">
          {[
            { label: t('Published Articles', 'የታተሙ ጽሑፎች'), value: published },
            { label: t('Drafts', 'ረቂቆች'), value: drafts.length },
            { label: t('Total Reads', 'ጠቅላላ ንባቦች'), value: totalReads },
            { label: t('Topics', 'ርዕሶች'), value: topics.length },
          ].map((item) => (
            <div key={item.label} className="px-5 py-4">
              <dt className="text-sm text-mediumgrey dark:text-gray-400">{item.label}</dt>
              <dd className="mt-1 font-serif text-2xl font-semibold tabular-nums text-nearblack dark:text-white">{item.value.toLocaleString()}</dd>
            </div>
          ))}
        </dl>
        <p className="border-t border-slate-200 px-5 py-3 text-sm text-mediumgrey dark:border-white/10 dark:text-gray-400">
          {t('Total reads count every visit since the article was published. For trends over time, open', 'ጠቅላላ ንባቦች ጽሑፉ ከታተመ ጀምሮ ያሉ ጉብኝቶችን ሁሉ ይቆጥራሉ። በጊዜ ሂደት ለመመልከት ይክፈቱ')}{' '}
          <button onClick={() => onNavigate('statistics')} className="cursor-pointer font-semibold text-navy underline underline-offset-4 hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold dark:text-gold">
            {t('Statistics', 'ስታቲስቲክስ')}
          </button>
          .
        </p>
      </Panel>
    </div>
  );
}
