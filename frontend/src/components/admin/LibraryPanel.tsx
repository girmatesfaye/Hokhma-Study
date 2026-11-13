import React, { useState } from 'react';
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { LearningPath, LearningPathStep, Resource, Topic } from '../../types';
import TopicIcon from '../TopicIcon';
import { AdminDialog, Button, ConfirmDialog, EmptyState, Field, FormError, inputClass, Panel, PanelHeader, RecordList } from './ui';

type LibraryKind = 'topics' | 'paths' | 'resources';

// Curated topic icons so a typo can never silently fall back to a default icon.
const TOPIC_ICONS = ['Compass', 'ShieldAlert', 'BookOpen', 'Atom', 'Scale', 'Landmark', 'Cross', 'Church', 'Heart', 'Users', 'ScrollText', 'Globe', 'Lightbulb', 'Flame', 'Brain', 'Star'];

const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const emptyTopic = { name: '', nameAm: '', description: '', descriptionAm: '', icon: 'Compass' };
const emptyPath = { title: '', titleAm: '', description: '', descriptionAm: '', goal: '', goalAm: '' };
const emptyResource = { title: '', titleAm: '', category: 'Books' as Resource['category'], author: '', authorAm: '', description: '', descriptionAm: '', link: '' };
const newStep = (level: number): LearningPathStep => ({ id: `step-${Date.now()}-${level}`, level, title: '', purpose: '', type: 'article' });

// One screen for topics, learning paths and resources: list, create/edit dialog, read-only detail, delete.
export default function LibraryPanel({ kind }: { kind: LibraryKind }) {
  const {
    articles, topics, paths, resources,
    addTopic, updateTopic, deleteTopic,
    addPath, updatePath, deletePath,
    addResource, updateResource, deleteResource,
    navigateTo
  } = useApp();
  const { getTranslatedText: t } = useLanguage();

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [topicForm, setTopicForm] = useState(emptyTopic);
  const [pathForm, setPathForm] = useState(emptyPath);
  const [steps, setSteps] = useState<LearningPathStep[]>([]);
  const [resourceForm, setResourceForm] = useState(emptyResource);

  const copy = {
    topics: { title: t('Topics', 'ርዕሶች'), singular: t('Topic', 'ርዕስ'), add: t('Add Topic', 'ርዕስ ጨምር'), empty: t('No topics yet. Topics group your articles for readers.', 'እስካሁን ርዕስ የለም። ርዕሶች ጽሑፎችዎን ለአንባቢዎች ይመድባሉ።') },
    paths: { title: t('Learning Paths', 'የጥናት መንገዶች'), singular: t('Learning Path', 'የጥናት መንገድ'), add: t('Add Learning Path', 'የጥናት መንገድ ጨምር'), empty: t('No learning paths yet. A path guides a reader through articles in order.', 'እስካሁን የጥናት መንገድ የለም። መንገድ አንባቢን በቅደም ተከተል በጽሑፎች ይመራል።') },
    resources: { title: t('Resources', 'ግብዓቶች'), singular: t('Resource', 'ግብዓት'), add: t('Add Resource', 'ግብዓት ጨምር'), empty: t('No resources yet. Recommend books, sites, podcasts and videos here.', 'እስካሁን ግብዓት የለም። መጻሕፍትን፣ ድረ-ገጾችን፣ ፖድካስቶችንና ቪዲዮዎችን እዚህ ይጠቁሙ።') },
  }[kind];

  const openCreate = () => {
    setEditingId(null);
    setTopicForm(emptyTopic);
    setPathForm(emptyPath);
    setSteps(kind === 'paths' ? [newStep(1)] : []);
    setResourceForm(emptyResource);
    setFormOpen(true);
  };

  const openTopicEditor = (topic: Topic) => {
    setEditingId(topic.slug);
    setTopicForm({ name: topic.name, nameAm: topic.nameAm || '', description: topic.description, descriptionAm: topic.descriptionAm || '', icon: topic.icon });
    setFormOpen(true);
  };

  const openPathEditor = (path: LearningPath) => {
    setEditingId(path.slug);
    setPathForm({ title: path.title, titleAm: path.titleAm || '', description: path.description, descriptionAm: path.descriptionAm || '', goal: path.goal, goalAm: path.goalAm || '' });
    // Older paths saved only an article list, so rebuild steps from it
    setSteps(path.steps?.length ? path.steps : path.articleSlugs.map((slug, index) => ({
      id: `${path.slug}-${index + 1}`,
      level: index + 1,
      title: articles.find((a) => a.slug === slug)?.title || `Step ${index + 1}`,
      purpose: 'Read this article before continuing to the next step.',
      type: 'article' as const,
      articleSlug: slug,
    })));
    setFormOpen(true);
  };

  const openResourceEditor = (resource: Resource) => {
    setEditingId(resource.id);
    setResourceForm({ title: resource.title, titleAm: resource.titleAm || '', category: resource.category, author: resource.author, authorAm: resource.authorAm || '', description: resource.description, descriptionAm: resource.descriptionAm || '', link: resource.link });
    setFormOpen(true);
  };

  // The dialog stays open if the server rejects the save, so nothing typed is lost
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    let saved = false;

    if (kind === 'topics' && topicForm.name.trim()) {
      const current = editingId ? topics.find((x) => x.slug === editingId) : undefined;
      const topic: Topic = {
        ...current,
        slug: current?.slug || slugify(topicForm.name) || `topic-${Date.now()}`,
        name: topicForm.name.trim(),
        nameAm: topicForm.nameAm.trim() || undefined,
        description: topicForm.description.trim(),
        descriptionAm: topicForm.descriptionAm.trim() || undefined,
        articleCount: current?.articleCount || 0,
        icon: topicForm.icon || 'Compass',
      };
      saved = editingId ? await updateTopic(topic) : await addTopic(topic);
    }

    if (kind === 'paths' && pathForm.title.trim()) {
      // Steps are the only path definition; the server derives levels, article list, count and reading time
      const guidedSteps = steps.filter((s) => s.title.trim() && s.purpose.trim()).map((s, index) => ({ ...s, level: index + 1 }));
      const current = editingId ? paths.find((x) => x.slug === editingId) : undefined;
      const path: LearningPath = {
        ...current,
        slug: current?.slug || slugify(pathForm.title) || `path-${Date.now()}`,
        title: pathForm.title.trim(),
        titleAm: pathForm.titleAm.trim() || undefined,
        description: pathForm.description.trim(),
        descriptionAm: pathForm.descriptionAm.trim() || undefined,
        goal: pathForm.goal.trim(),
        goalAm: pathForm.goalAm.trim() || undefined,
        articleCount: current?.articleCount || 0,
        difficultyRange: current?.difficultyRange || 'Beginner to Deep Dive',
        totalReadingTime: current?.totalReadingTime || 0,
        articleSlugs: current?.articleSlugs || [],
        steps: guidedSteps,
      };
      saved = editingId ? await updatePath(path) : await addPath(path);
    }

    if (kind === 'resources' && resourceForm.title.trim() && resourceForm.link.trim()) {
      const current = editingId ? resources.find((x) => x.id === editingId) : undefined;
      const resource: Resource = {
        ...current,
        id: editingId || '',
        category: resourceForm.category,
        title: resourceForm.title.trim(),
        titleAm: resourceForm.titleAm.trim() || undefined,
        author: resourceForm.author.trim(),
        authorAm: resourceForm.authorAm.trim() || undefined,
        description: resourceForm.description.trim(),
        descriptionAm: resourceForm.descriptionAm.trim() || undefined,
        link: resourceForm.link.trim(),
      };
      saved = editingId ? await updateResource(resource) : await addResource(resource);
    }

    if (saved) setFormOpen(false);
  };

  const patchStep = (id: string, patch: Partial<LearningPathStep>) =>
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const moveStep = (index: number, direction: -1 | 1) =>
    setSteps((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  // Rows for the active kind, normalised so one list renderer serves all three
  const rows = (kind === 'topics'
    ? topics.map((x) => ({ id: x.slug, title: t(x.name, x.nameAm), meta: `${x.articleCount} ${t('Articles', 'ጽሑፎች')}`, icon: x.icon, onEdit: () => openTopicEditor(x), onDelete: () => deleteTopic(x.slug) }))
    : kind === 'paths'
      ? paths.map((x) => ({ id: x.slug, title: t(x.title, x.titleAm), meta: `${x.steps?.length ?? x.articleCount} ${t('Steps', 'ደረጃዎች')} · ${x.totalReadingTime} ${t('Min', 'ደቂቃ')}`, icon: undefined, onEdit: () => openPathEditor(x), onDelete: () => deletePath(x.slug) }))
      : resources.map((x) => ({ id: x.id, title: t(x.title, x.titleAm), meta: `${x.category} · ${t(x.author, x.authorAm)}`, icon: undefined, onEdit: () => openResourceEditor(x), onDelete: () => deleteResource(x.id) })));

  const addButton = (
    <Button variant="primary" onClick={openCreate}>
      <Plus className="size-4" aria-hidden="true" />
      {copy.add}
    </Button>
  );

  const dialogTitle = `${editingId ? t('Edit', 'አስተካክል') : t('Add', 'ጨምር')} ${copy.singular}`;

  return (
    <>
      <Panel>
        <PanelHeader
          title={copy.title}
          description={t('Changes are saved to the server and appear on the public site right away.', 'ለውጦች በአገልጋዩ ላይ ይቀመጣሉ፤ በይፋዊው ድረ-ገጽ ላይም ወዲያውኑ ይታያሉ።')}
          action={addButton}
        />
        {rows.length === 0 ? (
          <EmptyState message={copy.empty} action={addButton} />
        ) : (
          <RecordList>
            {rows.map((row) => (
              <li key={row.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  {row.icon && <TopicIcon name={row.icon} size={20} className="shrink-0 text-gold" />}
                  <div className="min-w-0">
                    <p className="truncate font-serif text-lg font-semibold text-nearblack dark:text-white">{row.title}</p>
                    <p className="text-sm tabular-nums text-mediumgrey dark:text-gray-400">{row.meta}</p>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setDetailId(row.id)}>{t('View', 'ይመልከቱ')}</Button>
                  <Button size="sm" onClick={row.onEdit}>
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
                    title={`${t('Delete', 'ሰርዝ')} ${copy.singular}?`}
                    description={`"${row.title}" ${kind === 'topics' ? t('can only be deleted when no articles use it. This cannot be undone.', 'ጽሑፎች የማይጠቀሙበት ከሆነ ብቻ ይሰረዛል። ይህ መመለስ አይቻልም።') : t('will be removed permanently. This cannot be undone.', 'ለዘለዓለም ይወገዳል። ይህ መመለስ አይቻልም።')}`}
                    confirmLabel={t('Delete', 'ሰርዝ')}
                    cancelLabel={t('Cancel', 'ይቅር')}
                    onConfirm={row.onDelete}
                  />
                </div>
              </li>
            ))}
          </RecordList>
        )}
      </Panel>

      <AdminDialog open={formOpen} onOpenChange={setFormOpen} title={dialogTitle} wide={kind === 'paths'}>
        <form onSubmit={handleSave} className="space-y-4">
          {kind === 'topics' && (
            <>
              <Field label={t('Name', 'ስም')}><input required className={inputClass} value={topicForm.name} onChange={(e) => setTopicForm({ ...topicForm, name: e.target.value })} placeholder="Biblical Archaeology" /></Field>
              <Field label={t('Name (Amharic)', 'ስም (አማርኛ)')}><input className={inputClass} value={topicForm.nameAm} onChange={(e) => setTopicForm({ ...topicForm, nameAm: e.target.value })} /></Field>
              <Field label={t('Description', 'መግለጫ')} hint={t('One or two sentences readers see on the Topics page.', 'አንባቢዎች በርዕሶች ገጽ ላይ የሚያዩት አንድ ወይም ሁለት ዓረፍተ ነገር።')}><textarea required rows={3} className={inputClass} value={topicForm.description} onChange={(e) => setTopicForm({ ...topicForm, description: e.target.value })} /></Field>
              <Field label={t('Description (Amharic)', 'መግለጫ (አማርኛ)')}><textarea rows={3} className={inputClass} value={topicForm.descriptionAm} onChange={(e) => setTopicForm({ ...topicForm, descriptionAm: e.target.value })} /></Field>
              <Field label={t('Icon', 'አይኮን')}>
                <select className={inputClass} value={topicForm.icon} onChange={(e) => setTopicForm({ ...topicForm, icon: e.target.value })}>
                  {(TOPIC_ICONS.includes(topicForm.icon) ? TOPIC_ICONS : [topicForm.icon, ...TOPIC_ICONS]).map((icon) => <option key={icon} value={icon}>{icon}</option>)}
                </select>
              </Field>
            </>
          )}

          {kind === 'resources' && (
            <>
              <Field label={t('Title', 'ርዕስ')}><input required className={inputClass} value={resourceForm.title} onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })} placeholder="The Reason For God" /></Field>
              <Field label={t('Title (Amharic)', 'ርዕስ (አማርኛ)')}><input className={inputClass} value={resourceForm.titleAm} onChange={(e) => setResourceForm({ ...resourceForm, titleAm: e.target.value })} /></Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={t('Category', 'ምድብ')}>
                  <select className={inputClass} value={resourceForm.category} onChange={(e) => setResourceForm({ ...resourceForm, category: e.target.value as Resource['category'] })}>
                    <option>Books</option><option>Websites</option><option>Podcasts</option><option>Videos</option>
                  </select>
                </Field>
                <Field label={t('Author', 'ደራሲ')}><input required className={inputClass} value={resourceForm.author} onChange={(e) => setResourceForm({ ...resourceForm, author: e.target.value })} /></Field>
              </div>
              <Field label={t('Author (Amharic)', 'ደራሲ (አማርኛ)')}><input className={inputClass} value={resourceForm.authorAm} onChange={(e) => setResourceForm({ ...resourceForm, authorAm: e.target.value })} /></Field>
              <Field label={t('Description', 'መግለጫ')} hint={t('Why should a reader explore this?', 'አንባቢ ይህን ለምን ማየት አለበት?')}><textarea required rows={3} className={inputClass} value={resourceForm.description} onChange={(e) => setResourceForm({ ...resourceForm, description: e.target.value })} /></Field>
              <Field label={t('Description (Amharic)', 'መግለጫ (አማርኛ)')}><textarea rows={3} className={inputClass} value={resourceForm.descriptionAm} onChange={(e) => setResourceForm({ ...resourceForm, descriptionAm: e.target.value })} /></Field>
              <Field label="URL"><input required type="url" className={inputClass} value={resourceForm.link} onChange={(e) => setResourceForm({ ...resourceForm, link: e.target.value })} placeholder="https://example.org" /></Field>
            </>
          )}

          {kind === 'paths' && (
            <>
              <Field label={t('Title', 'ርዕስ')}><input required className={inputClass} value={pathForm.title} onChange={(e) => setPathForm({ ...pathForm, title: e.target.value })} placeholder="Foundations Of Faith" /></Field>
              <Field label={t('Title (Amharic)', 'ርዕስ (አማርኛ)')}><input className={inputClass} value={pathForm.titleAm} onChange={(e) => setPathForm({ ...pathForm, titleAm: e.target.value })} /></Field>
              <Field label={t('Who Is This For?', 'ይህ ጥናት ለማን ነው?')} hint={t('Who should start here, and what problem does the journey solve?', 'ማን ከዚህ መጀመር አለበት፣ ጉዞውስ ምን ችግር ይፈታል?')}><textarea required rows={2} className={inputClass} value={pathForm.description} onChange={(e) => setPathForm({ ...pathForm, description: e.target.value })} /></Field>
              <Field label={t('Who Is This For? (Amharic)', 'ይህ ጥናት ለማን ነው? (አማርኛ)')}><textarea rows={2} className={inputClass} value={pathForm.descriptionAm} onChange={(e) => setPathForm({ ...pathForm, descriptionAm: e.target.value })} /></Field>
              <Field label={t('Where Will They End?', 'በመጨረሻ ምን ይማራሉ?')} hint={t('What will a learner understand by the last step?', 'ተማሪው በመጨረሻው ደረጃ ምን ይረዳል?')}><textarea required rows={2} className={inputClass} value={pathForm.goal} onChange={(e) => setPathForm({ ...pathForm, goal: e.target.value })} /></Field>
              <Field label={t('Where Will They End? (Amharic)', 'በመጨረሻ ምን ይማራሉ? (አማርኛ)')}><textarea rows={2} className={inputClass} value={pathForm.goalAm} onChange={(e) => setPathForm({ ...pathForm, goalAm: e.target.value })} /></Field>

              <fieldset className="space-y-3 border-t border-slate-200 pt-4 dark:border-white/10">
                <legend className="font-serif text-lg font-semibold text-nearblack dark:text-white">{t('Steps', 'ደረጃዎች')}</legend>
                <p className="text-sm text-mediumgrey dark:text-gray-400">{t('The steps are the whole path, in reading order. Reorder them with the arrows.', 'ደረጃዎቹ ሙሉውን መንገድ በንባብ ቅደም ተከተል ይወክላሉ። በቀስቶቹ ያስተካክሏቸው።')}</p>
                <ol className="space-y-3">
                  {steps.map((step, index) => (
                    <li key={step.id} className="space-y-3 rounded-lg border border-slate-200 p-4 dark:border-white/10">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-nearblack dark:text-white">{t('Step', 'ደረጃ')} {index + 1}</span>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" aria-label={t('Move Step Up', 'ደረጃውን ወደ ላይ አንቀሳቅስ')} disabled={index === 0} onClick={() => moveStep(index, -1)}><ArrowUp className="size-4" aria-hidden="true" /></Button>
                          <Button size="sm" variant="ghost" aria-label={t('Move Step Down', 'ደረጃውን ወደ ታች አንቀሳቅስ')} disabled={index === steps.length - 1} onClick={() => moveStep(index, 1)}><ArrowDown className="size-4" aria-hidden="true" /></Button>
                          <Button size="sm" variant="danger" onClick={() => setSteps((prev) => prev.filter((s) => s.id !== step.id))}>{t('Remove', 'አስወግድ')}</Button>
                        </div>
                      </div>
                      <Field label={t('Step Title', 'የደረጃ ርዕስ')}><input required className={inputClass} value={step.title} onChange={(e) => patchStep(step.id, { title: e.target.value })} /></Field>
                      <Field label={t('What Will The Reader Gain?', 'አንባቢው ምን ያገኛል?')}><textarea required rows={2} className={inputClass} value={step.purpose} onChange={(e) => patchStep(step.id, { purpose: e.target.value })} /></Field>
                      <Field label={t('Step Type', 'የደረጃ ዓይነት')}>
                        <select className={inputClass} value={step.type} onChange={(e) => patchStep(step.id, { type: e.target.value as LearningPathStep['type'], articleSlug: undefined, resourceId: undefined, externalTitle: undefined, externalUrl: undefined })}>
                          <option value="article">{t('Read An Article', 'ጽሑፍ አንብብ')}</option>
                          <option value="resource">{t('Use A Recommended Resource', 'የሚመከር ግብዓት ተጠቀም')}</option>
                          <option value="milestone">{t('Reflect At A Milestone', 'በወሳኝ ደረጃ ላይ አሰላስል')}</option>
                        </select>
                      </Field>
                      {step.type === 'article' && (
                        <Field label={t('Article', 'ጽሑፍ')}>
                          <select required className={inputClass} value={step.articleSlug || ''} onChange={(e) => patchStep(step.id, { articleSlug: e.target.value })}>
                            <option value="">{t('Choose An Article', 'ጽሑፍ ይምረጡ')}</option>
                            {articles.map((a) => <option key={a.slug} value={a.slug}>{a.title}</option>)}
                          </select>
                        </Field>
                      )}
                      {step.type === 'resource' && (
                        <>
                          <Field label={t('Resource', 'ግብዓት')}>
                            <select className={inputClass} value={step.resourceId || ''} onChange={(e) => patchStep(step.id, { resourceId: e.target.value, externalTitle: undefined, externalUrl: undefined })}>
                              <option value="">{t('Use A New External Link', 'አዲስ ውጫዊ አገናኝ ተጠቀም')}</option>
                              {resources.map((r) => <option key={r.id} value={r.id}>{r.title}</option>)}
                            </select>
                          </Field>
                          {!step.resourceId && (
                            <div className="grid gap-4 sm:grid-cols-2">
                              <Field label={t('Link Title', 'የአገናኝ ርዕስ')}><input required className={inputClass} value={step.externalTitle || ''} onChange={(e) => patchStep(step.id, { externalTitle: e.target.value })} /></Field>
                              <Field label="URL"><input required type="url" className={inputClass} value={step.externalUrl || ''} onChange={(e) => patchStep(step.id, { externalUrl: e.target.value })} placeholder="https://example.org" /></Field>
                            </div>
                          )}
                        </>
                      )}
                    </li>
                  ))}
                </ol>
                <Button className="w-full" onClick={() => setSteps((prev) => [...prev, newStep(prev.length + 1)])}>
                  <Plus className="size-4" aria-hidden="true" />
                  {t('Add Next Step', 'ቀጣዩን ደረጃ ጨምር')}
                </Button>
              </fieldset>
            </>
          )}

          <FormError />
          <div className="flex justify-end gap-2 border-t border-slate-200 pt-4 dark:border-white/10">
            <Button onClick={() => setFormOpen(false)}>{t('Cancel', 'ይቅር')}</Button>
            <Button type="submit" variant="primary">{editingId ? t('Save Changes', 'ለውጦችን አስቀምጥ') : t('Create', 'ፍጠር')}</Button>
          </div>
        </form>
      </AdminDialog>

      {/* Read-only detail for the selected record */}
      <AdminDialog open={detailId !== null} onOpenChange={(open) => !open && setDetailId(null)} title={rows.find((r) => r.id === detailId)?.title || copy.singular} wide>
        {kind === 'topics' && (() => {
          const topic = topics.find((x) => x.slug === detailId);
          if (!topic) return null;
          const topicArticles = articles.filter((a) => a.topicSlug === topic.slug);
          return (
            <div className="space-y-4">
              <p className="text-base text-mediumgrey dark:text-gray-300">{t(topic.description, topic.descriptionAm)}</p>
              <h3 className="font-serif text-lg font-semibold text-nearblack dark:text-white">{t('Articles In This Topic', 'በዚህ ርዕስ ውስጥ ያሉ ጽሑፎች')} ({topicArticles.length})</h3>
              {topicArticles.length === 0 ? (
                <p className="text-sm text-mediumgrey dark:text-gray-400">{t('No articles use this topic yet.', 'እስካሁን ይህን ርዕስ የሚጠቀም ጽሑፍ የለም።')}</p>
              ) : (
                <RecordList>
                  {topicArticles.map((a) => (
                    <li key={a.id} className="flex items-center justify-between gap-3 py-3">
                      <span className="truncate text-sm text-nearblack dark:text-white">{t(a.title, a.titleAm)}</span>
                      <Button size="sm" onClick={() => navigateTo(`/admin/articles/${a.id}/edit`)}>{t('Edit Article', 'ጽሑፉን አስተካክል')}</Button>
                    </li>
                  ))}
                </RecordList>
              )}
            </div>
          );
        })()}
        {kind === 'paths' && (() => {
          const path = paths.find((x) => x.slug === detailId);
          if (!path) return null;
          return (
            <div className="space-y-4">
              <p className="text-base text-mediumgrey dark:text-gray-300">{t(path.description, path.descriptionAm)}</p>
              <p className="text-sm text-nearblack dark:text-gray-200"><span className="font-semibold">{t('Goal:', 'ግብ፦')}</span> {t(path.goal, path.goalAm)}</p>
              <h3 className="font-serif text-lg font-semibold text-nearblack dark:text-white">{t('Steps', 'ደረጃዎች')}</h3>
              <ol className="divide-y divide-slate-200 dark:divide-white/10">
                {(path.steps || []).map((step) => (
                  <li key={step.id} className="flex items-center justify-between gap-3 py-3">
                    <span className="min-w-0 truncate text-sm text-nearblack dark:text-white"><span className="mr-2 tabular-nums text-mediumgrey">{step.level}.</span>{t(step.title, step.titleAm)}</span>
                    {step.articleSlug && <Button size="sm" onClick={() => navigateTo(`/articles/${step.articleSlug}`)}>{t('Open Article', 'ጽሑፉን ክፈት')}</Button>}
                  </li>
                ))}
              </ol>
            </div>
          );
        })()}
        {kind === 'resources' && (() => {
          const resource = resources.find((x) => x.id === detailId);
          if (!resource) return null;
          return (
            <div className="space-y-4">
              <p className="text-base text-mediumgrey dark:text-gray-300">{t(resource.description, resource.descriptionAm)}</p>
              <p className="text-sm text-nearblack dark:text-gray-200"><span className="font-semibold">{t('Author:', 'ደራሲ፦')}</span> {t(resource.author, resource.authorAm)}</p>
              <a href={resource.link} target="_blank" rel="noreferrer" className="inline-flex text-sm font-semibold text-navy underline underline-offset-4 hover:text-gold dark:text-gold">{t('Open Resource', 'ግብዓቱን ክፈት')}</a>
            </div>
          );
        })()}
      </AdminDialog>
    </>
  );
}
