import { Check, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { Badge, Button, ConfirmDialog, EmptyState, Panel, PanelHeader, RecordList, Segmented, buttonClass } from './ui';

export type CommentFilter = 'all' | 'pending';

// Reader comments with an All / Pending filter; approving publishes the comment under its article.
export function CommentsPanel({ filter, onFilterChange }: { filter: CommentFilter; onFilterChange: (filter: CommentFilter) => void }) {
  const { comments, articles, approveComment, deleteComment } = useApp();
  const { getTranslatedText: t } = useLanguage();
  const visible = comments.filter((c) => filter === 'all' || !c.isApproved);

  return (
    <Panel>
      <PanelHeader
        title={t('Comments', 'አስተያየቶች')}
        description={t('Comments stay hidden from readers until you approve them.', 'አስተያየቶች እስካላጸደቋቸው ድረስ ከአንባቢዎች ተደብቀው ይቆያሉ።')}
      />
      <div className="border-b border-slate-200 px-5 py-3 dark:border-white/10">
        <Segmented<CommentFilter>
          label={t('Filter Comments', 'አስተያየቶችን አጣራ')}
          value={filter}
          onChange={onFilterChange}
          options={[
            { id: 'all', label: `${t('All', 'ሁሉም')} (${comments.length})` },
            { id: 'pending', label: `${t('Pending', 'በመጠባበቅ ላይ')} (${comments.filter((c) => !c.isApproved).length})` },
          ]}
        />
      </div>
      {visible.length === 0 ? (
        <EmptyState message={filter === 'pending' ? t('No comments are waiting for review.', 'ግምገማ የሚጠብቅ አስተያየት የለም።') : t('No comments yet.', 'እስካሁን አስተያየት የለም።')} />
      ) : (
        <RecordList>
          {visible.map((com) => {
            const article = articles.find((a) => a.slug === com.articleSlug);
            return (
              <li key={com.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-1.5">
                  <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-nearblack dark:text-white">
                    {com.authorName}
                    <Badge tone={com.isApproved ? 'success' : 'warning'}>{com.isApproved ? t('Approved', 'የጸደቀ') : t('Pending', 'በመጠባበቅ ላይ')}</Badge>
                  </p>
                  <p className="font-serif text-base text-nearblack dark:text-gray-200">{com.text}</p>
                  <p className="text-sm text-mediumgrey dark:text-gray-400">{t('On', 'በ')} {article ? t(article.title, article.titleAm) : com.articleSlug}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  {!com.isApproved && (
                    <Button size="sm" onClick={() => approveComment(com.id)}>
                      <Check className="size-3.5" aria-hidden="true" />
                      {t('Approve', 'አጽድቅ')}
                    </Button>
                  )}
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
      )}
    </Panel>
  );
}

// Messages sent through the public contact form, with a mail reply link.
export function ContactPanel() {
  const { contactMessages, deleteContactMessage } = useApp();
  const { getTranslatedText: t } = useLanguage();

  return (
    <Panel>
      <PanelHeader
        title={t('Contact Messages', 'የግንኙነት መልዕክቶች')}
        description={t('Messages sent through the public contact form appear here.', 'በይፋዊው የመገናኛ ቅጽ የተላኩ መልዕክቶች እዚህ ይታያሉ።')}
      />
      {contactMessages.length === 0 ? (
        <EmptyState message={t('No messages yet. When a reader writes to you, it shows up here.', 'እስካሁን መልዕክት የለም። አንባቢ ሲጽፍልዎ እዚህ ይታያል።')} />
      ) : (
        <RecordList>
          {contactMessages.map((message) => (
            <li key={message.id} className="space-y-3 px-5 py-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-serif text-lg font-semibold text-nearblack dark:text-white">{message.subject}</p>
                  <p className="text-sm text-mediumgrey dark:text-gray-400">{message.name} · {message.email}</p>
                </div>
                <time className="text-sm tabular-nums text-mediumgrey dark:text-gray-400">{new Date(message.submittedAt).toLocaleString()}</time>
              </div>
              <p className="max-w-prose whitespace-pre-line text-base text-nearblack dark:text-gray-200">{message.message}</p>
              <div className="flex gap-2">
                <a href={`mailto:${message.email}?subject=${encodeURIComponent('Re: ' + message.subject)}`} className={buttonClass('secondary', 'sm')}>
                  {t('Reply By Email', 'በኢሜይል ምላሽ ስጥ')}
                </a>
                <ConfirmDialog
                  trigger={
                    <Button size="sm" variant="danger">
                      <Trash2 className="size-3.5" aria-hidden="true" />
                      {t('Delete', 'ሰርዝ')}
                    </Button>
                  }
                  title={t('Delete This Message?', 'ይህ መልዕክት ይሰረዝ?')}
                  description={t('The message is removed permanently. Reply first if you still need to.', 'መልዕክቱ ለዘለዓለም ይወገዳል። ገና መመለስ ካለብዎት አስቀድመው ይመልሱ።')}
                  confirmLabel={t('Delete Message', 'መልዕክቱን ሰርዝ')}
                  cancelLabel={t('Cancel', 'ይቅር')}
                  onConfirm={() => deleteContactMessage(message.id)}
                />
              </div>
            </li>
          ))}
        </RecordList>
      )}
    </Panel>
  );
}

// Questions readers submitted; "Answer This" opens the question form prefilled and marks it reviewed on save.
export function ReaderQuestionsPanel({ onAnswer }: { onAnswer: (submission: { id: string; text: string }) => void }) {
  const { questionSubmissions, updateSubmissionStatus, deleteQuestionSubmission } = useApp();
  const { getTranslatedText: t } = useLanguage();

  return (
    <Panel>
      <PanelHeader
        title={t('Reader Questions', 'የአንባቢ ጥያቄዎች')}
        description={t('Questions readers submitted from the Questions page.', 'አንባቢዎች ከጥያቄዎች ገጽ ያስገቡዋቸው ጥያቄዎች።')}
      />
      {questionSubmissions.length === 0 ? (
        <EmptyState message={t('No reader questions yet. They appear here when someone submits one.', 'እስካሁን የአንባቢ ጥያቄ የለም። አንድ ሰው ሲያስገባ እዚህ ይታያል።')} />
      ) : (
        <RecordList>
          {questionSubmissions.map((submission) => (
            <li key={submission.id} className="space-y-3 px-5 py-4">
              <div className="flex items-center justify-between gap-3">
                <Badge tone={submission.status === 'pending' ? 'warning' : 'success'}>
                  {submission.status === 'pending' ? t('Pending', 'በመጠባበቅ ላይ') : t('Reviewed', 'የተገመገመ')}
                </Badge>
                <time className="text-sm tabular-nums text-mediumgrey dark:text-gray-400">{new Date(submission.submittedAt).toLocaleString()}</time>
              </div>
              <p className="max-w-prose font-serif text-lg text-nearblack dark:text-white">{submission.text}</p>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="primary" onClick={() => onAnswer({ id: submission.id, text: submission.text })}>
                  {t('Answer This', 'ይህን መልስ')}
                </Button>
                <Button size="sm" onClick={() => updateSubmissionStatus(submission.id, submission.status === 'pending' ? 'reviewed' : 'pending')}>
                  {submission.status === 'pending' ? t('Mark Reviewed', 'እንደተገመገመ ምልክት አድርግ') : t('Mark Pending', 'እንደ በመጠባበቅ ምልክት አድርግ')}
                </Button>
                <ConfirmDialog
                  trigger={
                    <Button size="sm" variant="danger">
                      <Trash2 className="size-3.5" aria-hidden="true" />
                      {t('Delete', 'ሰርዝ')}
                    </Button>
                  }
                  title={t('Delete This Reader Question?', 'ይህ የአንባቢ ጥያቄ ይሰረዝ?')}
                  description={t('The question is removed permanently and cannot be restored.', 'ጥያቄው ለዘለዓለም ይወገዳል፤ መመለስ አይቻልም።')}
                  confirmLabel={t('Delete Question', 'ጥያቄውን ሰርዝ')}
                  cancelLabel={t('Cancel', 'ይቅር')}
                  onConfirm={() => deleteQuestionSubmission(submission.id)}
                />
              </div>
            </li>
          ))}
        </RecordList>
      )}
    </Panel>
  );
}
