/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useApp } from '../context/AppContext';
import { ArrowLeft, ChevronRight, Clock, Award, BookOpen } from 'lucide-react';

export default function PathsIndex() {
  const { paths, navigateTo } = useApp();

  return (
    <div id="paths-index-page" className="animate-fade-in max-w-[1140px] mx-auto px-4 md:px-6 py-12 space-y-12">
      
      {/* Page Hero */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <span className="text-xs uppercase tracking-widest text-gold font-bold">Guided Journeys</span>
        <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-nearblack dark:text-white">
          Learn step by step
        </h1>
        <p className="text-sm md:text-base text-mediumgrey dark:text-gray-300 leading-relaxed font-serif italic">
          Curated reading sequences mapping theological foundations, cosmic creation harmonies, and rational defenses into beautiful linear pathways.
        </p>
        <div className="w-16 h-1 bg-gold mx-auto rounded-full" />
      </div>

      {/* Grid of Paths (2-col desktop specified) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
        {paths.map((path) => (
          <div
            key={path.slug}
            id={`path-card-${path.slug}`}
            className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-lg p-6 md:p-8 flex flex-col justify-between gap-6 hover:shadow transition-shadow"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/30 text-gold text-[10px] uppercase font-bold tracking-wider border border-gold/25">
                  Path difficulty: {path.difficultyRange}
                </span>
                
                <div className="flex items-center gap-1 text-[11px] text-lightgrey">
                  <Clock size={11} />
                  <span>{path.totalReadingTime}m total</span>
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="font-serif text-xl font-bold text-nearblack dark:text-white">
                  {path.title}
                </h2>
                <p className="text-xs md:text-sm text-mediumgrey dark:text-gray-300 leading-relaxed min-h-[44px]">
                  {path.description}
                </p>
              </div>

              {/* Goal statement summary block */}
              <div className="bg-offwhite dark:bg-slate-950/40 p-4 border-l border-gold rounded-r text-xs leading-relaxed">
                <p className="font-bold text-navy dark:text-gold uppercase tracking-wider text-[10px] mb-1 font-sans">
                  Goal / Learning Outcome
                </p>
                <p className="text-nearblack/90 dark:text-gray-300 font-serif italic text-[13px]">
                  {path.goal}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
              <span className="text-xs text-mediumgrey flex items-center gap-1">
                <BookOpen size={12} className="text-gold" />
                <span>{path.articleCount} sequential readings</span>
              </span>
              
              <button
                onClick={() => navigateTo(`/paths/${path.slug}`)}
                className="px-4 py-2 bg-navy text-white dark:bg-gold dark:text-slate-950 hover:bg-navy/90 text-xs font-bold uppercase tracking-wider rounded inline-flex items-center gap-1 group"
              >
                <span>Start this path</span>
                <ChevronRight size={13} className="group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
