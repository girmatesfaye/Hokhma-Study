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
    <div id="resources-page" className="animate-fade-in max-w-[1140px] mx-auto px-4 md:px-6 py-12 space-y-10">
      
      {/* Page Hero */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <span className="text-xs uppercase tracking-widest text-gold font-bold">{getTranslatedText('Recommended Study', 'የሚመከር ጥናት')}</span>
        <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-nearblack dark:text-white">
          {getTranslatedText('Curated External Resources', 'የተመረጡ የውጭ መጽሐፍትና ግብዓቶች')}
        </h1>
        <p className="text-sm md:text-base text-mediumgrey dark:text-gray-300 leading-relaxed font-serif italic">
          {getTranslatedText(
            'A hand-picked bibliography of advanced books, robust debate hubs, charitable dialogue podcasts, and high-quality animated vector videos.',
            'ለተሻለ እውቀት የሚረዱ የተመረጡ መጻሕፍት፣ ጠቃሚ የውይይት መድረኮች፣ ታማኝ የክርስቲያን ፖድካስቶች እና ጥራት ያላቸው የአኒሜሽን ቪዲዮዎች ዝርዝር።'
          )}
        </p>
        <div className="w-16 h-1 bg-gold mx-auto rounded-full" />
      </div>

      {/* Category Selection Filter Pills */}
      <div className="flex flex-wrap justify-center gap-2.5 border-b border-black/5 pb-4">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategoryFilter(cat)}
            className={`px-4 py-2 text-xs font-bold rounded-full uppercase tracking-wider transition-all duration-200 cursor-pointer ${
              activeCategoryFilter === cat
                ? 'bg-navy text-white dark:bg-gold dark:text-slate-950 shadow-sm'
                : 'bg-white hover:bg-black/5 dark:bg-slate-900 dark:hover:bg-slate-800 text-nearblack dark:text-gray-200 border border-black/5'
            }`}
          >
            {getCategoryLabel(cat)}
          </button>
        ))}
      </div>

      {/* Display Grid of Resources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 animate-fade-in">
        {filteredResources.map((res) => (
          <div
            key={res.id}
            className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-lg p-6 flex flex-col justify-between gap-5 shadow-sm hover:border-gold/30 hover:shadow transition-all duration-250 group"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-offwhite dark:bg-slate-950/45 p-2 rounded border border-black/5">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(res.category)}
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-mediumgrey dark:text-gray-400 font-sans">
                    {getCategoryLabel(res.category)}
                  </span>
                </div>
                <span className="text-[11px] font-sans text-lightgrey">{getTranslatedText('Recommended', 'የታመነ ምርጫ')}</span>
              </div>

              <div className="space-y-1 pt-1">
                <h3 className="font-serif text-base font-bold text-nearblack dark:text-white group-hover:text-gold transition-colors leading-snug">
                  {getTranslatedText(res.title, res.titleAm)}
                </h3>
                <p className="text-xs uppercase font-semibold text-gold font-sans tracking-wide">
                  {getTranslatedText('By', 'በ')}: {getTranslatedText(res.author, res.authorAm)}
                </p>
              </div>

              <p className="text-xs md:text-sm text-mediumgrey dark:text-gray-300 leading-relaxed font-serif">
                {getTranslatedText(res.description, res.descriptionAm)}
              </p>
            </div>

            <div className="pt-3 border-t border-black/5 dark:border-white/5 flex justify-end">
              <a
                href={res.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs tracking-wider font-bold text-navy dark:text-gold flex items-center gap-1 group-hover:translate-x-1.5 transition-transform cursor-pointer font-sans"
              >
                <span>{getTranslatedText('Visit Resource External Link', 'ወደ ምንጩ ድረ-ገጽ ይሂዱ')}</span>
                <ExternalLink size={12} className="text-gold" />
              </a>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
