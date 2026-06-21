/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { STATEMENT_OF_FAITH, AUTHOR_BIO } from '../data';
import DifficultyBadge from '../components/DifficultyBadge';
import { Mail, ChevronDown, ChevronUp, ArrowRight, ShieldCheck, Globe, Heart } from 'lucide-react';

export default function About() {
  const { articles, navigateTo } = useApp();
  const [openAccordionIdx, setOpenAccordionIdx] = useState<number | null>(null);

  // Filter 3 recent published papers
  const recentArticles = articles.filter((a) => a.isPublished).slice(0, 3);

  const toggleAccordion = (idx: number) => {
    setOpenAccordionIdx(openAccordionIdx === idx ? null : idx);
  };

  const handleOpenContact = () => {
    const contactFooterBtn = document.getElementById('contact-form-link');
    if (contactFooterBtn) {
      contactFooterBtn.click();
    }
  };

  return (
    <div id="about-page" className="animate-fade-in max-w-[1145px] mx-auto px-4 md:px-6 py-12 space-y-16">
      
      {/* 1. Header Profile Box */}
      <section className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-2xl p-8 md:p-12 shadow-sm flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
        {/* Author photo (circle, 120px specified) */}
        <div className="w-[120px] h-[120px] rounded-full overflow-hidden shrink-0 border-2 border-gold/30 shadow">
          <img
            src={AUTHOR_BIO.avatar}
            alt={AUTHOR_BIO.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="space-y-4 flex-1">
          <div className="space-y-1">
            <span className="text-xs tracking-widest text-gold font-bold">Author Bio & Curator</span>
            <h1 className="font-serif text-2xl md:text-3.5xl font-extrabold text-nearblack dark:text-white">
              {AUTHOR_BIO.name}
            </h1>
            <p className="text-xs tracking-wider font-semibold text-navy dark:text-gold font-sans">
              {AUTHOR_BIO.role}
            </p>
          </div>

          <p className="text-sm md:text-base text-mediumgrey dark:text-gray-300 leading-relaxed font-serif italic max-w-3xl">
            "{AUTHOR_BIO.bio}"
          </p>

          <div className="pt-2 flex flex-wrap justify-center md:justify-start gap-4">
            <button
              onClick={handleOpenContact}
              className="px-4 py-2 border border-black/10 dark:border-white/10 hover:bg-black/5 rounded text-xs font-bold tracking-wider text-nearblack dark:text-white flex items-center gap-1.5 cursor-pointer"
            >
              <Mail size={13} className="text-gold" />
              <span>Contact Dr. Thomas</span>
            </button>
            <a
              href={`mailto:${AUTHOR_BIO.email}`}
              className="px-4 py-2 bg-navy text-white hover:bg-navy/90 text-xs font-bold tracking-wider rounded flex items-center gap-1.5"
            >
              <Mail size={13} />
              <span>{AUTHOR_BIO.email}</span>
            </a>
          </div>
        </div>
      </section>

      {/* 2. Mission Statement sections */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
        
        {/* What this site is & who it's for */}
        <div className="space-y-6">
          <div className="space-y-2">
            <span className="text-xs tracking-widest text-gold font-bold">Scope & Foundations</span>
            <h2 className="font-serif text-2xl font-bold text-nearblack dark:text-white">
              What this platform represents
            </h2>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 border border-black/5 rounded-lg space-y-4 shadow-sm text-sm leading-relaxed text-mediumgrey dark:text-gray-300">
            <p className="font-serif italic text-nearblack dark:text-white font-semibold">
              "Hokhma Study was born out of a realization that modern intellectual seekers reject lazy answers to complex historical and astrophysical objections."
            </p>
            <p className="font-sans text-[13.5px]">
              This site is designed for thinkers, skeptics, seekers, and student believers searching for a coherent, academically grounded defense of classical theism and the historical resurrection. No shallow slogans or emotional manipulation. We walk through academic manuscripts, physical equations, and logical syllogisms.
            </p>
          </div>
        </div>

        {/* Who it is for */}
        <div className="space-y-6">
          <div className="space-y-2">
            <span className="text-xs tracking-widest text-gold font-bold font-sans">Our Mission</span>
            <h2 className="font-serif text-2xl font-bold text-nearblack dark:text-white">
              Who we aim to serve
            </h2>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 border border-black/5 rounded-lg space-y-4 shadow-sm text-xs leading-relaxed text-mediumgrey dark:text-gray-300">
            <div className="flex gap-3 items-start text-xs font-sans">
              <span className="p-1.5 rounded-full bg-amber-50 dark:bg-amber-950/20 text-gold font-bold">1</span>
              <div>
                <h4 className="font-semibold text-nearblack dark:text-white mb-0.5">The Intellectual Doubter</h4>
                <p className="text-[12px]">Who senses the heavy gravity of the problem of suffering or the Big Bang and needs a structured, logically robust response that doesn’t demand checking their brain at the door.</p>
              </div>
            </div>
            
            <div className="flex gap-3 items-start text-xs font-sans">
              <span className="p-1.5 rounded-full bg-amber-50 dark:bg-amber-950/20 text-gold font-bold">2</span>
              <div>
                <h4 className="font-semibold text-nearblack dark:text-white mb-0.5">The Developing Apologist</h4>
                <p className="text-[12px]">Students, educators, and pastors searching for structured, linear lecture notes, minimal facts breakdowns, and primary academic references to defend theology.</p>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* 3. Statement of Faith (as visual accordion as specified) */}
      <section className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
        <div className="text-center space-y-2 max-w-lg mx-auto mb-4">
          <span className="text-xs tracking-widest text-gold font-bold">Orthodox Credo</span>
          <h2 className="font-serif text-2xl font-bold text-nearblack dark:text-white">
            Statement of Faith (Doctrines)
          </h2>
          <p className="text-xs text-mediumgrey">
            Click any section below to view our subscription to classical theological parameters.
          </p>
        </div>

        {/* Accordions */}
        <div className="divide-y divide-black/5 dark:divide-white/5 border-t border-b border-black/5 dark:border-white/5">
          {STATEMENT_OF_FAITH.map((item, id) => {
            const isOpen = openAccordionIdx === id;
            return (
              <div key={id} className="py-4 font-sans">
                <button
                  onClick={() => toggleAccordion(id)}
                  className="w-full flex justify-between items-center text-left py-1 text-sm font-bold tracking-wider text-nearblack dark:text-white hover:text-gold transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-gold" />
                    <span>{item.doctrine}</span>
                  </span>
                  {isOpen ? <ChevronUp size={16} className="text-gold" /> : <ChevronDown size={16} className="text-gold" />}
                </button>

                {isOpen && (
                  <p className="mt-3.5 pl-6 text-xs md:text-sm text-mediumgrey dark:text-gray-300 leading-relaxed font-sans max-w-4xl border-l border-gold/30 animate-fade-in">
                    {item.belief}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Recent papers compiled by authorship (3-card row as specified) */}
      <section className="space-y-6">
        <div className="flex justify-between items-baseline border-b border-black/5 pb-3">
          <h3 className="font-serif text-xl font-bold text-nearblack dark:text-white">
            Recent writings by Dr. Sterling
          </h3>
          <span className="text-xs font-bold text-gold tracking-wider">Archives</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {recentArticles.map((art) => (
            <div
              key={art.id}
              onClick={() => navigateTo(`/articles/${art.slug}`)}
              className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 hover:border-black/15 dark:hover:border-gold/30 p-5 rounded-lg flex flex-col justify-between group cursor-pointer shadow-sm hover:shadow transition-all duration-300"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px] text-lightgrey">
                  <span>{art.publishDate}</span>
                  <DifficultyBadge difficulty={art.difficulty} className="scale-90" />
                </div>
                
                <h4 className="font-serif text-sm font-extrabold text-nearblack dark:text-white group-hover:text-gold transition-colors leading-snug line-clamp-2">
                  {art.title}
                </h4>
                
                <p className="text-xs text-mediumgrey line-clamp-2 leading-relaxed">
                  {art.excerpt}
                </p>
              </div>

              <span className="text-[10px] text-lightgrey tracking-wider font-semibold group-hover:text-gold flex items-center gap-0.5 pt-4 border-t border-black/5 mt-4">
                Read Paper <ArrowRight size={10} />
              </span>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
