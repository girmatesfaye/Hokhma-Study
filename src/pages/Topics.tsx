/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import TopicIcon from '../components/TopicIcon';
import { ArrowRight } from 'lucide-react';

export default function Topics() {
  const { topics, navigateTo } = useApp();
  const { language, getTranslatedText } = useLanguage();

  return (
    <div id="topics-page" className="animate-fade-in max-w-[1140px] mx-auto px-4 md:px-6 py-12 space-y-12">
      
      {/* Page Hero */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <span className="text-xs tracking-widest text-gold font-bold">{getTranslatedText('Intellectual Arenas', 'አእምሯዊ አውዶች')}</span>
        <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-nearblack dark:text-white">
          {getTranslatedText('Explore By Topic', 'በአርዕስት ይመርምሩ')}
        </h1>
        <p className="text-sm md:text-base text-mediumgrey dark:text-gray-300 leading-relaxed font-serif italic">
          {getTranslatedText(
            'Categorized directories grouping classical philosophy, historical documentation, cosmology objections, and pastoral deep dives into structured archives.',
            'ጥንታዊ ፍልስፍናን፣ ታሪካዊ ማስረጃዎችን፣ የጽንፈ ዓለም ጥያቄዎችን እና እረኛዊ ትንተናዎችን በስልት የሚመድብ ማህደር።'
          )}
        </p>
        <div className="w-16 h-1 bg-gold mx-auto rounded-full" />
      </div>

      {/* Grid of Topic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 pt-6">
        {topics.map((t) => (
          <div
            key={t.slug}
            id={`topic-card-${t.slug}`}
            onClick={() => navigateTo(`/topics/${t.slug}`)}
            className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 hover:border-gold/30 dark:hover:border-gold/30 hover:-translate-y-1.5 rounded-lg p-6 md:p-8 flex flex-col justify-between gap-6 cursor-pointer shadow-sm hover:shadow-md transition-all duration-300 group"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-offwhite dark:bg-slate-800 text-gold flex items-center justify-center">
                <TopicIcon name={t.icon} size={22} />
              </div>
              
              <div className="space-y-2">
                <h2 className="font-serif text-xl font-bold text-nearblack dark:text-white group-hover:text-gold transition-colors">
                  {getTranslatedText(t.name, t.nameAm)}
                </h2>
                <p className="text-xs md:text-sm text-mediumgrey dark:text-gray-300 leading-relaxed min-h-[44px]">
                  {getTranslatedText(t.description, t.descriptionAm)}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
              <span className="text-xs bg-navy/5 dark:bg-white/5 text-navy dark:text-gray-300 px-2.5 py-1 rounded font-semibold font-sans">
                {t.articleCount} {getTranslatedText(t.articleCount === 1 ? 'Article' : 'Articles', 'ጽሑፎች')}
              </span>
              <span className="text-xs tracking-wider font-bold text-navy dark:text-gold flex items-center gap-1 group-hover:translate-x-1.5 transition-transform font-sans">
                {getTranslatedText('Explore', 'ይመርምሩ')} <ArrowRight size={13} />
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
