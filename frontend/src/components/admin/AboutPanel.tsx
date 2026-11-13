import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { AuthorProfile, FaithStatement } from '../../types';
import { Button, EmptyState, Field, FormError, inputClass, Panel, PanelHeader, RecordList } from './ui';

const PROFILE_FIELDS: { key: keyof AuthorProfile; label: string; labelAm: string; long?: boolean; type?: string }[] = [
  { key: 'name', label: 'Name', labelAm: 'ስም' },
  { key: 'role', label: 'Role', labelAm: 'ሚና' },
  { key: 'email', label: 'Email', labelAm: 'ኢሜይል', type: 'email' },
  { key: 'avatar', label: 'Photo URL', labelAm: 'የፎቶ አድራሻ' },
  { key: 'tagline', label: 'Tagline', labelAm: 'መሪ ቃል' },
  { key: 'bio', label: 'Biography', labelAm: 'የሕይወት ታሪክ', long: true },
  { key: 'mission', label: 'Mission', labelAm: 'ተልዕኮ', long: true },
];

// Author profile and statement of faith, the two things the public About page and footer show.
export default function AboutPanel() {
  const { authorProfile, statementOfFaith, updateAuthorProfile, updateStatementOfFaith } = useApp();
  const { getTranslatedText: t } = useLanguage();

  const [editingProfile, setEditingProfile] = useState(false);
  const [profileDraft, setProfileDraft] = useState<AuthorProfile>(authorProfile);
  const [editingFaith, setEditingFaith] = useState(false);
  const [faithDraft, setFaithDraft] = useState<FaithStatement[]>(statementOfFaith);

  // Edit mode stays open when the server rejects the save
  const saveProfile = async () => {
    if (await updateAuthorProfile(profileDraft)) setEditingProfile(false);
  };
  const saveFaith = async () => {
    if (await updateStatementOfFaith(faithDraft.filter((d) => d.doctrine.trim() && d.belief.trim()))) setEditingFaith(false);
  };
  const patchDoctrine = (index: number, patch: Partial<FaithStatement>) =>
    setFaithDraft((prev) => prev.map((d, i) => (i === index ? { ...d, ...patch } : d)));

  return (
    <div className="space-y-6">
      <Panel>
        <PanelHeader
          title={t('Author Profile', 'የጸሐፊ መገለጫ')}
          description={t('Shown on the public About page and in the footer.', 'በይፋዊው ስለ እኛ ገጽና በግርጌ ላይ ይታያል።')}
          action={!editingProfile && (
            <Button onClick={() => { setProfileDraft(authorProfile); setEditingProfile(true); }}>{t('Edit Profile', 'መገለጫውን አስተካክል')}</Button>
          )}
        />
        {editingProfile ? (
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            {PROFILE_FIELDS.map((f) => (
              <Field key={f.key} label={t(f.label, f.labelAm)} className={f.long ? 'sm:col-span-2' : undefined}>
                {f.long ? (
                  <textarea rows={3} className={inputClass} value={profileDraft[f.key]} onChange={(e) => setProfileDraft({ ...profileDraft, [f.key]: e.target.value })} />
                ) : (
                  <input type={f.type || 'text'} className={inputClass} value={profileDraft[f.key]} onChange={(e) => setProfileDraft({ ...profileDraft, [f.key]: e.target.value })} />
                )}
              </Field>
            ))}
            <div className="space-y-3 sm:col-span-2">
              <FormError />
              <div className="flex justify-end gap-2">
                <Button onClick={() => setEditingProfile(false)}>{t('Cancel', 'ይቅር')}</Button>
                <Button variant="primary" onClick={saveProfile}>{t('Save Profile', 'መገለጫውን አስቀምጥ')}</Button>
              </div>
            </div>
          </div>
        ) : (
          <dl className="grid gap-x-6 gap-y-4 p-5 sm:grid-cols-2">
            {PROFILE_FIELDS.map((f) => (
              <div key={f.key} className={f.long ? 'sm:col-span-2' : undefined}>
                <dt className="text-sm text-mediumgrey dark:text-gray-400">{t(f.label, f.labelAm)}</dt>
                <dd className="mt-0.5 break-words text-base text-nearblack dark:text-white">{authorProfile[f.key] || '—'}</dd>
              </div>
            ))}
          </dl>
        )}
      </Panel>

      <Panel>
        <PanelHeader
          title={t('Statement Of Faith', 'የእምነት መግለጫ')}
          description={t('Each doctrine appears in the footer and on the About page.', 'እያንዳንዱ እምነት በግርጌና በስለ እኛ ገጽ ላይ ይታያል።')}
          action={!editingFaith && (
            <Button onClick={() => { setFaithDraft(statementOfFaith); setEditingFaith(true); }}>{t('Edit Statement', 'መግለጫውን አስተካክል')}</Button>
          )}
        />
        {editingFaith ? (
          <div className="space-y-4 p-5">
            {faithDraft.map((item, index) => (
              <div key={index} className="space-y-3 rounded-lg border border-slate-200 p-4 dark:border-white/10">
                <Field label={t('Doctrine', 'እምነት')}><input className={inputClass} value={item.doctrine} onChange={(e) => patchDoctrine(index, { doctrine: e.target.value })} /></Field>
                <Field label={t('What We Believe', 'የምናምነው')}><textarea rows={3} className={inputClass} value={item.belief} onChange={(e) => patchDoctrine(index, { belief: e.target.value })} /></Field>
                <Button size="sm" variant="danger" onClick={() => setFaithDraft((prev) => prev.filter((_, i) => i !== index))}>{t('Remove Doctrine', 'እምነቱን አስወግድ')}</Button>
              </div>
            ))}
            <Button onClick={() => setFaithDraft((prev) => [...prev, { doctrine: '', belief: '' }])}>
              <Plus className="size-4" aria-hidden="true" />
              {t('Add Doctrine', 'እምነት ጨምር')}
            </Button>
            <FormError />
            <div className="flex justify-end gap-2 border-t border-slate-200 pt-4 dark:border-white/10">
              <Button onClick={() => setEditingFaith(false)}>{t('Cancel', 'ይቅር')}</Button>
              <Button variant="primary" onClick={saveFaith}>{t('Save Statement', 'መግለጫውን አስቀምጥ')}</Button>
            </div>
          </div>
        ) : statementOfFaith.length === 0 ? (
          <EmptyState
            message={t('No doctrines yet. Add the beliefs you want readers to see.', 'እስካሁን እምነት የለም። አንባቢዎች እንዲያዩ የሚፈልጉትን እምነት ይጨምሩ።')}
            action={<Button variant="primary" onClick={() => { setFaithDraft([{ doctrine: '', belief: '' }]); setEditingFaith(true); }}>{t('Add Doctrine', 'እምነት ጨምር')}</Button>}
          />
        ) : (
          <RecordList>
            {statementOfFaith.map((item) => (
              <li key={item.doctrine} className="px-5 py-4">
                <h3 className="font-serif text-lg font-semibold text-nearblack dark:text-white">{item.doctrine}</h3>
                <p className="mt-1 max-w-prose text-base text-mediumgrey dark:text-gray-300">{item.belief}</p>
              </li>
            ))}
          </RecordList>
        )}
      </Panel>
    </div>
  );
}
