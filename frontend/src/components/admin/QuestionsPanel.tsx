import React, { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { Question } from '../../types';
import DifficultyBadge from '../DifficultyBadge';
import { AdminDialog, Button, ConfirmDialog, EmptyState, Field, FormError, inputClass, Panel, PanelHeader, RecordList } from './ui';

// What the question dialog was opened for: a blank form, an existing question, or a reader's submission.
export type QuestionDialogRequest = {
  question?: Question;
  submission?: { id: string; text: string };
};

// Form for adding or editing a question; mount it with a fresh `key` each time so it starts from the request.
export function QuestionDialog({
  request,
  onClose
}: {
  request: QuestionDialogRequest;
  onClose: () => void;
}) {
  const { articles, topics, questions, addQuestion, updateQuestion, updateSubmissionStatus } = useApp();
  const { getTranslatedText: t } = useLanguage();
  const editing = request.question;

  const [form, setForm] = useState({
    text: editing?.text || request.submission?.text || '',
    textAm: editing?.textAm || '',
    topicSlug: editing?.topicSlug || topics[0]?.slug || '',
    difficulty: (editing?.difficulty || 'beginner') as Question['difficulty'],
    tags: editing?.tags.join(', ') || '',
    articleSlug: editing?.articleSlug || '',
  });

  // Saving also marks the reader submission reviewed when the question answers one
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const article = articles.find((a) => a.slug === form.articleSlug);
    if (!form.text.trim() || !article) return;

    const existing = editing ? questions.find((q) => q.id === editing.id) : undefined;
    const question: Question = {
      ...existing,
      id: existing?.id || '',
      text: form.text.trim(),
      textAm: form.textAm.trim() || undefined,
      topicSlug: form.topicSlug,
      difficulty: form.difficulty,
      tags: form.tags.split(',').map((tag) => tag.trim().toLowerCase()).filter(Boolean),
      articleSlug: article.slug,
      articleTitle: article.title,
      articleTitleAm: article.titleAm,
      addedDate: existing?.addedDate || new Date().toISOString().split('T')[0],
    };

    const saved = existing ? await updateQuestion(question) : await addQuestion(question);
    if (!saved) return;
    if (request.submission) await updateSubmissionStatus(request.submission.id, 'reviewed');
    onClose();
  };

  return (
    <AdminDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={editing ? t('Edit Question', 'ጥያቄ አስተካክል') : t('Add Question', 'ጥያቄ ጨምር')}
      description={t('Link a question to the article that answers it so readers find the answer quickly.', 'አንባቢዎች መልሱን በፍጥነት እንዲያገኙ ጥያቄውን መልሱን ከሚሰጥ ጽሑፍ ጋር ያያይዙ።')}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label={t('Question', 'ጥያቄ')}><input required className={inputClass} value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} placeholder="Does science disprove creation?" /></Field>
        <Field label={t('Question (Amharic)', 'ጥያቄ (አማርኛ)')}><input className={inputClass} value={form.textAm} onChange={(e) => setForm({ ...form, textAm: e.target.value })} /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t('Topic', 'ርዕስ')}>
            <select className={inputClass} value={form.topicSlug} onChange={(e) => setForm({ ...form, topicSlug: e.target.value })}>
              {topics.map((topic) => <option key={topic.slug} value={topic.slug}>{t(topic.name, topic.nameAm)}</option>)}
            </select>
          </Field>
          <Field label={t('Difficulty', 'የጥልቀት ደረጃ')}>
            <select className={inputClass} value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value as Question['difficulty'] })}>
              <option value="beginner">{t('Beginner', 'ጀማሪ')}</option>
              <option value="intermediate">{t('Intermediate', 'መካከለኛ')}</option>
              <option value="deep-dive">{t('Deep Dive', 'ጥልቅ ጥናት')}</option>
            </select>
          </Field>
        </div>
        <Field label={t('Answering Article', 'የሚመልሰው ጽሑፍ')}>
          <select required className={inputClass} value={form.articleSlug} onChange={(e) => setForm({ ...form, articleSlug: e.target.value })}>
            <option value="">{t('Choose An Article', 'ጽሑፍ ይምረጡ')}</option>
            {articles.map((a) => <option key={a.slug} value={a.slug}>{t(a.title, a.titleAm)}</option>)}
          </select>
        </Field>
        <Field label={t('Tags', 'መለዮዎች')} hint={t('Separate tags with commas.', 'መለዮዎችን በኮማ ይለዩ።')}><input className={inputClass} value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="suffering, theodicy" /></Field>
        <FormError />
        <div className="flex justify-end gap-2 border-t border-slate-200 pt-4 dark:border-white/10">
          <Button onClick={onClose}>{t('Cancel', 'ይቅር')}</Button>
          <Button type="submit" variant="primary">{t('Save Question', 'ጥያቄውን አስቀምጥ')}</Button>
        </div>
      </form>
    </AdminDialog>
  );
}

// Questions mapped to their answering article, with add, edit and delete.
export default function QuestionsPanel({ onOpenDialog }: { onOpenDialog: (request: QuestionDialogRequest) => void }) {
  const { questions, deleteQuestion } = useApp();
  const { getTranslatedText: t } = useLanguage();

  const addButton = (
    <Button variant="primary" onClick={() => onOpenDialog({})}>
      <Plus className="size-4" aria-hidden="true" />
      {t('Add Question', 'ጥያቄ ጨምር')}
    </Button>
  );

  return (
    <Panel>
      <PanelHeader
        title={t('Questions', 'ጥያቄዎች')}
        description={t('Each question points readers to the article that answers it.', 'እያንዳንዱ ጥያቄ አንባቢዎችን መልሱን ወደሚሰጥ ጽሑፍ ይመራል።')}
        action={addButton}
      />
      {questions.length === 0 ? (
        <EmptyState message={t('No questions yet. Add one, or answer a reader question from the inbox.', 'እስካሁን ጥያቄ የለም። አንድ ይጨምሩ ወይም ከገቢ መልዕክት የአንባቢ ጥያቄን ይመልሱ።')} action={addButton} />
      ) : (
        <RecordList>
          {questions.map((q) => (
            <li key={q.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 space-y-1.5">
                <p className="font-serif text-lg font-semibold text-nearblack dark:text-white">{t(q.text, q.textAm)}</p>
                <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-mediumgrey dark:text-gray-400">
                  <DifficultyBadge difficulty={q.difficulty} />
                  <span>{t('Answered by', 'የሚመልሰው')} {t(q.articleTitle, q.articleTitleAm)}</span>
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button size="sm" onClick={() => onOpenDialog({ question: q })}>
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
                  title={t('Delete This Question?', 'ይህ ጥያቄ ይሰረዝ?')}
                  description={t('It disappears from the public Questions page and from search. This cannot be undone.', 'ከይፋዊው የጥያቄዎች ገጽና ከፍለጋ ይጠፋል። ይህ መመለስ አይቻልም።')}
                  confirmLabel={t('Delete Question', 'ጥያቄውን ሰርዝ')}
                  cancelLabel={t('Cancel', 'ይቅር')}
                  onConfirm={() => deleteQuestion(q.id)}
                />
              </div>
            </li>
          ))}
        </RecordList>
      )}
    </Panel>
  );
}
