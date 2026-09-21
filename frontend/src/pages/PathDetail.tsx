/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import DifficultyBadge from '../components/DifficultyBadge';
import { ArrowLeft, Check, CheckSquare, Square, Clock, Play, BookOpen } from 'lucide-react';

export default function PathDetail() {
  const { currentRoute, paths, articles, progress, toggleStepProgress, navigateTo } = useApp();
  const { language, getTranslatedText } = useLanguage();

  const slug = currentRoute.slug || '';
  const path = paths.find((p) => p.slug === slug);

  if (!path) {
    return (
      <div className="max-w-[1140px] mx-auto px-4 py-20 text-center animate-fade-in">
        <h2 className="font-serif text-2xl font-bold">{getTranslatedText('Learning Path Not Found', 'የጥናት ጉዞ አልተገኘም')}</h2>
        <p className="text-mediumgrey text-sm mt-2">{getTranslatedText('The path you are looking for does not exist in our curriculum index.', 'የፈለጉት የጥናት ጉዞ በስርዓተ ትምህርታችን ማውጫ ውስጥ የለም።')}</p>
        <button onClick={() => navigateTo('/paths')} className="mt-6 px-4 py-2 bg-navy text-white text-xs font-bold tracking-wider rounded">
          {getTranslatedText('Return To Paths', 'ወደ ጥናት መንገዶች ይመለሱ')}
        </button>
      </div>
    );
  }

  // Map slugs to full Articles
  const pathArticles = path.articleSlugs
    .map((artSlug) => articles.find((art) => art.slug === artSlug))
    .filter((art): art is typeof articles[0] => !!art);

  const completedSlugs = progress[path.slug] || [];
  const percentCompleted = pathArticles.length
    ? Math.round((completedSlugs.length / pathArticles.length) * 100)
    : 0;

  const handleStartPath = () => {
    if (pathArticles.length > 0) {
      navigateTo(`/articles/${pathArticles[0].slug}`);
    }
  };

  return (
    <div id="path-detail-page" className="animate-fade-in max-w-[1140px] mx-auto px-4 md:px-6 py-10 space-y-10">
      
      {/* Back to Paths */}
      <button
        onClick={() => navigateTo('/paths')}
        className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-mediumgrey hover:text-navy dark:hover:text-white transition-colors cursor-pointer"
      >
        <ArrowLeft size={14} /> {getTranslatedText('Back To Paths', 'ወደ ጥናት መንገዶች ይመለሱ')}
      </button>

      {/* Path Hero */}
      <div className="bg-navy text-white rounded-2xl p-8 md:p-12 border border-white/5 relative overflow-hidden shadow-md">
        <div className="absolute top-0 right-0 h-48 w-48 bg-gold rounded-full opacity-5 blur-3xl" />
        <div className="space-y-4 max-w-3xl relative z-10">
          <div className="flex flex-wrap gap-2.5 items-center text-xs text-gold font-bold tracking-wider">
            <span>{getTranslatedText('Structured Curriculum', 'የተዋቀረ ስርዓተ ትምህርት')}</span>
            <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
            <span>{getTranslatedText(path.difficultyRange, path.difficultyRangeAm)}</span>
            <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
            <span className="text-white flex items-center gap-1">
              <Clock size={12} /> {path.totalReadingTime}{getTranslatedText('m total time', ' ደቂቃ በአጠቃላይ')}
            </span>
          </div>

          <h1 className="font-serif text-3xl md:text-4xl font-extrabold tracking-tight">
            {getTranslatedText(path.title, path.titleAm)}
          </h1>

          <p className="text-sm md:text-base text-gray-300 leading-relaxed font-serif italic">
            {getTranslatedText(path.description, path.descriptionAm)}
          </p>

          <div className="bg-white/5 p-4 rounded border border-white/10 text-xs">
            <span className="text-gold font-bold tracking-wider text-[10px] block mb-1">
              {getTranslatedText('Final Learning Milestone', 'የመጨረሻው የትምህርት አበይት ግብ')}
            </span>
            <p className="text-gray-200 leading-relaxed">{getTranslatedText(path.goal, path.goalAm)}</p>
          </div>
        </div>
      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Side: Timeline (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/5">
            <h2 className="font-serif text-xl font-bold text-nearblack dark:text-white">
              {getTranslatedText('Curriculum Sequence', 'የስርዓተ ትምህርት ቅደም ተከተል')}
            </h2>
            <span className="text-xs text-mediumgrey font-bold tracking-wider">
              {pathArticles.length} {getTranslatedText('Sequential Steps', 'ቅደም ተከተላዊ ደረጃዎች')}
            </span>
          </div>

          {/* Ordered Timeline */}
          <div className="relative pl-6 md:pl-8 space-y-8">
            
            {/* Vertical timeline connector lines */}
            <div className="absolute top-4 bottom-4 left-4 md:left-5 w-0.5 bg-black/10 dark:bg-white/10" />

            {pathArticles.map((art, idx) => {
              const stepNumber = idx + 1;
              const isCompleted = completedSlugs.includes(art.slug);

              return (
                <div
                  key={art.id}
                  className="relative group flex flex-col md:flex-row gap-4 justify-between items-start bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 hover:border-black/15 dark:hover:border-white/15 p-5 rounded-lg shadow-sm hover:shadow transition-all duration-300"
                >
                  
                  {/* Step bubble / point pin overlay */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleStepProgress(path.slug, art.slug);
                    }}
                    className={`absolute -left-[28px] md:-left-[35px] top-6 w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all border duration-200 cursor-pointer ${
                      isCompleted
                        ? 'bg-gold border-gold text-slate-950 scale-110 shadow-sm'
                        : 'bg-white dark:bg-slate-800 border-black/10 dark:border-gray-700 text-mediumgrey group-hover:border-gold/50'
                    }`}
                  >
                    {isCompleted ? <Check size={13} className="stroke-[3]" /> : stepNumber}
                  </div>

                  {/* Body click area goes to article detail */}
                  <div
                    className="flex-1 space-y-1.5 cursor-pointer"
                    onClick={() => navigateTo(`/articles/${art.slug}`)}
                  >
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <DifficultyBadge difficulty={art.difficulty} />
                      <span className="w-1.5 h-1.5 rounded-full bg-lightgrey/50" />
                      <span className="text-lightgrey flex items-center gap-0.5">
                        <Clock size={11} /> {art.readingTime}{getTranslatedText('m read', ' ደቂቃ ንባብ')}
                      </span>
                    </div>

                    <h3 className={`font-serif text-lg font-bold text-nearblack dark:text-white group-hover:text-gold transition-colors ${
                      isCompleted ? 'line-through text-mediumgrey dark:text-gray-450 opacity-75' : ''
                    }`}>
                      {getTranslatedText(art.title, art.titleAm)}
                    </h3>
                    
                    <p className="text-xs text-mediumgrey dark:text-gray-350 line-clamp-2 leading-relaxed">
                      {getTranslatedText(art.excerpt, art.excerptAm)}
                    </p>
                  </div>

                  {/* Complete Checkbox */}
                  <button
                    onClick={() => toggleStepProgress(path.slug, art.slug)}
                    className="md:border-l border-black/5 dark:border-white/5 md:pl-4 py-2 flex items-center gap-1.5 text-xs text-mediumgrey hover:text-gold transition-colors whitespace-nowrap cursor-pointer"
                  >
                    {isCompleted ? (
                      <CheckSquare size={16} className="text-gold" />
                    ) : (
                      <Square size={16} />
                    )}
                    <span className="hidden md:inline font-sans">{getTranslatedText('Done', 'ተከናውኗል')}</span>
                  </button>

                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Progress Sidebar (4 cols) */}
        <aside className="lg:col-span-4 space-y-6">
          
          {/* Progress Tracker Widget */}
          <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-lg p-6 space-y-5 shadow-sm sticky top-24">
            <h3 className="font-serif text-md font-bold text-nearblack dark:text-white tracking-wider text-[12px] border-b border-black/5 pb-2">
              {getTranslatedText('Your Course Progress', 'የትምህርት ሂደትዎ')}
            </h3>

            {/* Circular or Bar Progress Indicator */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-mediumgrey">{getTranslatedText('Percent Completed', 'የተጠናቀቀው መጠን')}</span>
                <span className="text-gold">{percentCompleted}%</span>
              </div>
              <div className="w-full h-2 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gold transition-all duration-500 ease-out"
                  style={{ width: `${percentCompleted}%` }}
                />
              </div>
              <p className="text-[11px] text-lightgrey text-center pt-1 leading-relaxed">
                {getTranslatedText('Checked off', 'እስካሁን የተጠናቀቁት፦')} <strong className="text-nearblack dark:text-white">{completedSlugs.length}</strong> {getTranslatedText('of', 'ከ')} <strong className="text-nearblack dark:text-white">{pathArticles.length}</strong> {getTranslatedText('modules.', 'አሃዶች።')}
              </p>
            </div>

            {/* Path checklist */}
            <div className="space-y-2.5 text-xs border-y border-black/5 dark:border-white/5 py-4 max-h-[220px] overflow-y-auto">
              {pathArticles.map((art, idx) => {
                const isDone = completedSlugs.includes(art.slug);
                return (
                  <div key={art.slug} className="flex gap-2 items-center text-[12px]">
                    <span
                      onClick={() => toggleStepProgress(path.slug, art.slug)}
                      className={`h-4 w-4 shrink-0 rounded flex items-center justify-center border cursor-pointer ${
                        isDone ? 'bg-gold border-gold text-slate-950' : 'bg-transparent border-black/20 dark:border-gray-700'
                      }`}
                    >
                      {isDone && <Check size={11} className="stroke-[3]" />}
                    </span>
                    <span
                      onClick={() => navigateTo(`/articles/${art.slug}`)}
                      className={`truncate flex-1 hover:text-gold cursor-pointer ${
                        isDone ? 'line-through text-lightgrey dark:text-gray-500' : 'text-nearblack dark:text-gray-300 font-medium'
                      }`}
                    >
                      {idx + 1}. {getTranslatedText(art.title, art.titleAm)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* CTA action */}
            <button
              onClick={handleStartPath}
              className="w-full py-2.5 bg-navy text-white dark:bg-gold dark:text-slate-950 font-bold tracking-wider text-xs rounded shadow hover:bg-navy/90 inline-flex items-center justify-center gap-2 group cursor-pointer"
            >
              <Play size={12} fill="currentColor" />
              <span>{getTranslatedText('Start Step 1', 'ደረጃ 1 ይጀምሩ')}</span>
            </button>
          </div>

        </aside>

      </div>

    </div>
  );
}
