/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { Resource } from '../types';
import { Book, Globe, Headphones, Video, ExternalLink, HelpCircle, ArrowRight } from 'lucide-react';

export default function Resources() {
  const { resources } = useApp();
  const { language, getTranslatedText } = useLanguage();
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');

  const categories = ['all', 'Books', 'Websites', 'Podcasts', 'Videos'];

  const filteredResources = resources.filter((res) => {
    if (activeCategoryFilter === 'all') return true;
    return res.category === activeCategoryFilter;
  });

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Books':
        return <Book size={18} className="text-gold" />;
      case 'Websites':
        return <Globe size={18} className="text-gold" />;
      case 'Podcasts':
        return <Headphones size={18} className="text-gold" />;
      case 'Videos':
        return <Video size={18} className="text-gold" />;
      default:
        return <HelpCircle size={18} className="text-gold" />;
    }
  };

  const getCategoryLabel = (cat: string) => {
    if (cat === 'all') return getTranslatedText('All Resources', 'ሁሉም ግብዓቶች');
    if (cat === 'Books') return getTranslatedText('Books', 'መጻሕፍት');
    if (cat === 'Websites') return getTranslatedText('Websites', 'ድረ-ገጾች');
    if (cat === 'Podcasts') return getTranslatedText('Podcasts', 'ፖድካስቶች');
    if (cat === 'Videos') return getTranslatedText('Videos', 'ቪዲዮዎች');
    return cat;
  };

  return (
    <div id="resources-page" className="animate-fade-in max-w-[1140px] mx-auto px-4 md:px-6 py-6 sm:py-12 space-y-8 sm:space-y-10">
      
      {/* Page Hero */}
      <div className="text-center max-w-2xl mx-auto space-y-3 sm:space-y-4">
        <span className="text-xs tracking-widest text-gold font-bold">{getTranslatedText('Recommended Study', 'የሚመከር ጥናት')}</span>
        <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-nearblack dark:text-white text-balance">
          {getTranslatedText('Curated External Resources', 'የተመረጡ የውጭ መጽሐፍትና ግብዓቶች')}
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-mediumgrey dark:text-gray-300 leading-relaxed font-serif italic text-pretty">
          {getTranslatedText(
            'A hand-picked bibliography of advanced books, robust debate hubs, charitable dialogue podcasts, and high-quality animated vector videos.',
            'ለተሻለ እውቀት የሚረዱ የተመረጡ መጻሕፍት፣ ጠቃሚ የውይይት መድረኮች፣ ታማኝ የክርስቲያን ፖድካስቶች እና ጥራት ያላቸው የአኒሜሽን ቪዲዮዎች ዝርዝር።'
          )}
        </p>
        <div className="w-16 h-1 bg-gold mx-auto rounded-full" />
      </div>

      {/* Category Selection Filter Pills - touch swipeable on mobile */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 justify-start sm:justify-center border-b border-black/5 dark:border-white/5 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategoryFilter(cat)}
            className={`px-3.5 sm:px-4 py-2 min-h-[40px] shrink-0 text-xs font-bold rounded-full tracking-wider transition-colors duration-150 cursor-pointer btn-press touch-manipulation ${
              activeCategoryFilter === cat
                ? 'bg-navy text-white dark:bg-gold dark:text-slate-950 shadow-xs'
                : 'bg-white hover:bg-black/5 dark:bg-slate-900 dark:hover:bg-slate-800 text-nearblack dark:text-gray-200 border border-black/5 dark:border-white/10'
            }`}
          >
            {getCategoryLabel(cat)}
          </button>
        ))}
      </div>

      {/* Display Grid of Resources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pt-2 animate-fade-in">
        {filteredResources.map((res) => (
          <div
            key={res.id}
            className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-xl p-4 sm:p-6 flex flex-col justify-between gap-4 sm:gap-5 shadow-xs hover:border-gold/40 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99] transition-[border-color,box-shadow,transform] duration-200 ease-out group"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-offwhite dark:bg-slate-950/45 p-2 rounded-lg border border-black/5 dark:border-white/5">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(res.category)}
                  <span className="text-[10px] tracking-wider font-semibold text-mediumgrey dark:text-gray-400 font-sans">
                    {getCategoryLabel(res.category)}
                  </span>
                </div>
                <span className="text-[11px] font-sans text-lightgrey">{getTranslatedText('Recommended', 'የታመነ ምርጫ')}</span>
              </div>

              <div className="space-y-1 pt-1">
                <h3 className="font-serif text-base sm:text-lg font-bold text-nearblack dark:text-white group-hover:text-gold transition-colors duration-150 leading-snug">
                  {getTranslatedText(res.title, res.titleAm)}
                </h3>
                <p className="text-xs font-semibold text-gold font-sans tracking-wide">
                  {getTranslatedText('By', 'በ')}: {getTranslatedText(res.author, res.authorAm)}
                </p>
              </div>

              <p className="text-xs sm:text-sm text-mediumgrey dark:text-gray-300 leading-relaxed font-serif">
                {getTranslatedText(res.description, res.descriptionAm)}
              </p>
            </div>

            <div className="pt-3 border-t border-black/5 dark:border-white/5 flex justify-end">
              <a
                href={res.link}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[40px] px-2 py-1 text-xs tracking-wider font-bold text-navy dark:text-gold flex items-center gap-1.5 group-hover:translate-x-1 transition-transform duration-150 ease-out cursor-pointer font-sans touch-manipulation"
              >
                <span>{getTranslatedText('Visit Resource External Link', 'ወደ ምንጩ ድረ-ገጽ ይሂዱ')}</span>
                <ExternalLink size={13} className="text-gold" />
              </a>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
