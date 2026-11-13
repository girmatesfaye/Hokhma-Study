import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { Badge, Button, ConfirmDialog, EmptyState, Panel, PanelHeader, RecordList, Segmented } from './ui';

// Every article with a Published / Draft filter, plus edit and delete.
type ArticleFilter = 'all' | 'published' | 'draft';

export default function ArticlesPanel() {
  const { articles, topics, deleteArticle, navigateTo } = useApp();
  const { getTranslatedText: t } = useLanguage();
  const [filter, setFilter] = useState<ArticleFilter>('all');

  const visible = articles.filter((a) => filter === 'all' || (filter === 'published' ? a.isPublished : !a.isPublished));
  const newArticle = (
    <Button variant="primary" onClick={() => navigateTo('/admin/articles/new/edit')}>
      <Plus className="size-4" aria-hidden="true" />
      {t('Write New Article', 'አዲስ ጽሑፍ ጻፍ')}
    </Button>
  );

  return (
    <Panel>
      <PanelHeader
        title={t('Articles', 'ጽሑፎች')}
        description={t('Drafts stay private until you publish them.', 'ረቂቆች እስካላተሟቸው ድረስ የግል ሆነው ይቆያሉ።')}
        action={newArticle}
      />
      <div className="border-b border-slate-200 px-5 py-3 dark:border-white/10">
        <Segmented<ArticleFilter>
          label={t('Filter Articles', 'ጽሑፎችን አጣራ')}
          value={filter}
          onChange={setFilter}
          options={[
            { id: 'all', label: `${t('All', 'ሁሉም')} (${articles.length})` },
            { id: 'published', label: t('Published', 'የታተሙ') },
            { id: 'draft', label: t('Drafts', 'ረቂቆች') },
          ]}
        />
      </div>

      {visible.length === 0 ? (
        <EmptyState
          message={articles.length === 0 ? t('No articles yet. Write the first one.', 'እስካሁን ጽሑፍ የለም። የመጀመሪያውን ይጻፉ።') : t('No articles match this filter.', 'ከዚህ ማጣሪያ ጋር የሚዛመድ ጽሑፍ የለም።')}
          action={articles.length === 0 ? newArticle : undefined}
        />
      ) : (
        <RecordList>
          {visible.map((art) => {
            const topic = topics.find((x) => x.slug === art.topicSlug);
            return (
              <li key={art.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="font-serif text-lg font-semibold text-nearblack dark:text-white">{t(art.title, art.titleAm)}</p>
                  <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-mediumgrey dark:text-gray-400">
                    <Badge tone={art.isPublished ? 'success' : 'neutral'}>{art.isPublished ? t('Published', 'የታተመ') : t('Draft', 'ረቂቅ')}</Badge>
                    <span>{topic ? t(topic.name, topic.nameAm) : art.topicSlug}</span>
                    <span className="tabular-nums">{art.publishDate}</span>
                    <span className="tabular-nums">{(art.views || 0).toLocaleString()} {t('Reads', 'ንባቦች')}</span>
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button size="sm" onClick={() => navigateTo(`/admin/articles/${art.id}/edit`)}>
                    <Pencil className="size-3.5" aria-hidden="true" />
                    {t('Edit', 'አድስ')}
                  </Button>
                  <ConfirmDialog
                    trigger={
                      <Button size="sm" variant="danger">
                        <Trash2 className="size-3.5" aria-hidden="true" />
                        {t('Delete', 'ሰርዝ')}
                      </Button>
                    }
                    title={t('Delete This Article?', 'ይህ ጽሑፍ ይሰረዝ?')}
                    description={`"${t(art.title, art.titleAm)}" ${t('will be removed permanently, including its place in any learning path. This cannot be undone.', 'ከማንኛውም የጥናት መንገድ ውስጥ ካለው ቦታው ጋር ለዘለዓለም ይወገዳል። ይህ መመለስ አይቻልም።')}`}
                    confirmLabel={t('Delete Article', 'ጽሑፉን ሰርዝ')}
                    cancelLabel={t('Cancel', 'ይቅር')}
                    onConfirm={() => deleteArticle(art.id)}
                  />
                </div>
              </li>
            );
          })}
        </RecordList>
      )}
    </Panel>
  );
}
