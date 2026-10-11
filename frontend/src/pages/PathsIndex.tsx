/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { ChevronRight, Clock, BookOpen, Layers3 } from 'lucide-react';

export default function PathsIndex() {
  const { paths, navigateTo } = useApp();
  const { language, getTranslatedText } = useLanguage();

  return (
    <div id="paths-index-page" className="animate-fade-in max-w-[1140px] mx-auto px-4 md:px-6 py-6 sm:py-12 space-y-8 sm:space-y-12">
      
      {/* Page Hero */}
      <div className="text-center max-w-2xl mx-auto space-y-3 sm:space-y-4">
        <span className="text-xs tracking-wider text-gold font-bold">{getTranslatedText('Guided Journeys', 'የተመሩ የጥናት ጉዞዎች')}</span>
        <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-nearblack dark:text-white text-balance">
          {getTranslatedText('Learn Step By Step', 'በደረጃ ይማሩ')}
        </h1>
        <p className="text-sm md:text-base text-mediumgrey dark:text-gray-300 leading-relaxed font-serif italic text-pretty">
          {getTranslatedText(
            'Curated reading sequences mapping theological foundations, cosmic creation harmonies, and rational defenses into beautiful linear pathways.',
            'ስነ-መለኮታዊ መሰረቶችን፣ የፍጥረት ስምምነትን እና ምክንያታዊ መከላከያዎችን ወደ ሚያማሩ ቅደም ተከተላዊ መንገዶች የሚመሩ የንባብ ጉዞዎች።'
          )}
        </p>
        <div className="w-16 h-1 bg-gold mx-auto rounded-full" />
      </div>

      {/* Grid of Paths (2-col desktop specified) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8 pt-2 sm:pt-6">
        {paths.map((path) => (
          <div
            key={path.slug}
            id={`path-card-${path.slug}`}
            className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 hover:border-gold/40 dark:hover:border-gold/40 rounded-xl p-4 sm:p-6 md:p-8 flex flex-col justify-between gap-5 sm:gap-6 shadow-xs hover:shadow-md hover:-translate-y-1 transition-[border-color,box-shadow,transform] duration-200 ease-out"
          >
            <div className="space-y-3.5 sm:space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/30 text-gold text-[10px] font-bold tracking-wider border border-gold/25">
                  {getTranslatedText('Path Difficulty:', 'የጉዞ ደረጃ፦')} {getTranslatedText(path.difficultyRange, path.difficultyRangeAm)}
                </span>
                
                <div className="flex items-center gap-1 text-xs text-lightgrey">
                  <Clock size={12} />
                  <span>{path.totalReadingTime}{getTranslatedText('m Total', ' ደቂቃ በአጠቃላይ')}</span>
                </div>
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <h2 className="font-serif text-lg sm:text-xl font-bold text-nearblack dark:text-white leading-snug">
                  {getTranslatedText(path.title, path.titleAm)}
                </h2>
                <p className="text-xs sm:text-sm text-mediumgrey dark:text-gray-300 leading-relaxed text-pretty">
                  {getTranslatedText(path.description, path.descriptionAm)}
                </p>
              </div>

              {/* Goal statement summary block */}
              <div className="bg-offwhite dark:bg-slate-950/40 p-3.5 sm:p-4 border-l-2 border-gold rounded-r text-xs leading-relaxed">
                <p className="font-bold text-navy dark:text-gold tracking-wider text-[10px] mb-1 font-sans">
                  {getTranslatedText('Goal / Learning Outcome', 'ግብ / የጥናቱ ውጤት')}
                </p>
                <p className="text-nearblack/90 dark:text-gray-300 font-serif italic text-xs sm:text-[13px]">
                  {getTranslatedText(path.goal, path.goalAm)}
                </p>
              </div>
            </div>

            <div className="pt-3.5 sm:pt-4 border-t border-black/5 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-xs text-mediumgrey">
                <span className="flex items-center gap-1">
                  <BookOpen size={13} className="text-gold" />
                  <span>{path.steps?.length || path.articleCount} {getTranslatedText('Guided Levels', 'የተመሩ ደረጃዎች')}</span>
                </span>
                <span className="text-gold flex items-center gap-1 font-mono text-[11px]">
                  <Layers3 size={13} /> {path.steps?.filter((step) => step.type === 'resource').length || 0}
                </span>
              </div>
              
              <button
                onClick={() => navigateTo(`/paths/${path.slug}`)}
                className="btn-press w-full sm:w-auto px-4 py-2.5 bg-navy text-white dark:bg-gold dark:text-slate-950 hover:bg-navy/90 text-xs font-bold rounded-xl inline-flex items-center justify-center gap-1 group cursor-pointer transition-[opacity,transform] duration-150 min-h-[40px] touch-manipulation"
              >
                <span>{getTranslatedText('Start This Path', 'ይህን ጉዞ ይጀምሩ')}</span>
                <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform duration-150 ease-out" />
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
