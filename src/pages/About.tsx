/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { STATEMENT_OF_FAITH, AUTHOR_BIO } from '../data';
import DifficultyBadge from '../components/DifficultyBadge';
import { Mail, ChevronDown, ChevronUp, ArrowRight, ShieldCheck, Globe, Heart } from 'lucide-react';

export default function About() {
  const { articles, navigateTo } = useApp();
  const { language, getTranslatedText } = useLanguage();
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

  // Localized Bio Elements Map
  const localizedBio = {
    name: getTranslatedText(AUTHOR_BIO.name, 'ቄስ ዶ/ር ቶማስ ጄ. ስተርሊንግ'),
    role: getTranslatedText(AUTHOR_BIO.role, 'ክርስቲያን አፖሎጂስት እና የታሪክ ምሁር'),
    bio: getTranslatedText(
      AUTHOR_BIO.bio,
      'ቄስ ዶ/ር ቶማስ ስተርሊንግ የስነ-መለኮት ምሁር፣ ቀድሞ የጥንታዊ ፍልስፍና መምህር፣ እና ላለፉት ሁለት አስርት ዓመታት ስለ አዲስ ኪዳን ታሪካዊ ዳራ፣ ስለ ጽንፈ ዓለም አመጣጥ እንዲሁም ስለ እግዚአብሔር መኖር ሲያስተምሩ የቆዩ መጋቢ ናቸው። በHokhma Study በኩል ጥልቅ ምርምር የተደረገባቸውና ምክንያታዊ የሆኑ የስነ-መለኮት ምላሾችን ያዘጋጃሉ።'
    )
  };

  // Localized Faith Elements Map
  const getLocalizedFaithItem = (id: number, type: 'doctrine' | 'belief', defaultValue: string) => {
    if (language === 'am') {
      if (id === 0) {
        return type === 'doctrine' ? 'ስላሴ (አምላክነት)' : 'በአንድ ዘላለማዊ አምላክ እናምናለን፤ እርሱም በሦስት አካላት ይኖራል፡- እግዚአብሔር አብ፣ እግዚአብሔር ወልድ (ኢየሱስ ክርስቶስ) እና እግዚአብሔር መንፈስ ቅዱስ። እያንዳንዱ አካል ሙሉ በሙሉ አምላክ ነው፣ በአንድነት የሚኖር፣ የሚተካከል እና በግርማው፣ በፍቅሩ፣ በጥበቡና በሉዓላዊ ኃይሉ ወሰን የሌለው ነው።';
      }
      if (id === 1) {
        return type === 'doctrine' ? 'ቅዱሳት መጻሕፍት' : 'መጽሐፍ ቅዱስ (ብሉይና አዲስ ኪዳን) በመለኮታዊ መሪነት የተጻፈ፣ ባለሥልጣን እና የታመነ የእግዚአብሔር ቃል እንደሆነ እናምናለን። ለስነ-መለኮታዊ እውነት፣ ለስነ-ምግባር ትምህርት እና ለታሪካዊ ጥበብ የመጨረሻው መልህቃችን ሲሆን የሰውን ልጅ ወደ ማዳኑ መንገድ ይመራል።';
      }
      if (id === 2) {
        return type === 'doctrine' ? 'ፍጥረት እና የሰው ልጅ' : 'እግዚአብሔር ጽንፈ ዓለምን በታላቅ ሥርዓትና በጥበብ እንደፈጠረ እናምናለን። የሰው ልጅ በእግዚአብሔር አምሳል የተፈጠረ ነው፣ እውነተኛ የስነ-ምግባር ምርጫ ያለው፣ ትልቅ የፈጠራ ዋጋ ያለውና የዘላለም ዓላማ ያለው ቢሆንም በአሁኑ ጊዜ በኃጢአት ምክንያት ከቅዱሱ አምላክ የተለየ ነው።';
      }
      if (id === 3) {
        return type === 'doctrine' ? 'ቤዛነት እና ጸጋ' : 'ቤዛነት ያለ ምንም ቅድመ ሁኔታ የሚገኝ የጸጋ ስጦታ እንደሆነ እናምናለን። ኢየሱስ ክርስቶስ ፍጹም አምላክና ፍጹም ሰው ሆኖ፣ ያለ ኃጢአት ኖረ፣ መለኮታዊ ፍትህን ለማርካት በሮማውያን ሥር ተሰቀለ፣ እናም በአካል ከሙታን ተነሳ፣ በእርሱ ላይ ብቻ እምነት ለሚያደርጉ ሁሉ መንፈሳዊ ጽድቅን ከፈተ።';
      }
    }
    return defaultValue;
  };

  return (
    <div id="about-page" className="animate-fade-in max-w-[1145px] mx-auto px-4 md:px-6 py-12 space-y-16">
      
      {/* 1. Header Profile Box */}
      <section className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-2xl p-8 md:p-12 shadow-sm flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
        {/* Author photo (circle, 120px specified) */}
        <div className="w-[120px] h-[120px] rounded-full overflow-hidden shrink-0 border-2 border-gold/30 shadow">
          <img
            src={AUTHOR_BIO.avatar}
            alt={localizedBio.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="space-y-4 flex-1">
          <div className="space-y-1">
            <span className="text-xs tracking-widest text-gold font-bold">{getTranslatedText('Author Bio & Curator', 'ስለ ጸሐፊው እና አዘጋጁ')}</span>
            <h1 className="font-serif text-2xl md:text-3.5xl font-extrabold text-nearblack dark:text-white">
              {localizedBio.name}
            </h1>
            <p className="text-xs tracking-wider font-semibold text-navy dark:text-gold font-sans">
              {localizedBio.role}
            </p>
          </div>

          <p className="text-sm md:text-base text-mediumgrey dark:text-gray-300 leading-relaxed font-serif italic max-w-3xl">
            "{localizedBio.bio}"
          </p>

          <div className="pt-2 flex flex-wrap justify-center md:justify-start gap-4">
            <button
              onClick={handleOpenContact}
              className="px-4 py-2 border border-black/10 dark:border-white/10 hover:bg-black/5 rounded text-xs font-bold tracking-wider text-nearblack dark:text-white flex items-center gap-1.5 cursor-pointer font-sans"
            >
              <Mail size={13} className="text-gold" />
              <span>{getTranslatedText('Contact Dr. Thomas', 'ዶ/ር ስተርሊንግን ያግኙ')}</span>
            </button>
            <a
              href={`mailto:${AUTHOR_BIO.email}`}
              className="px-4 py-2 bg-navy text-white hover:bg-navy/90 text-xs font-bold tracking-wider rounded flex items-center gap-1.5 font-sans"
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
            <span className="text-xs tracking-widest text-gold font-bold">{getTranslatedText('Scope & Foundations', 'ምንነት እና መሠረት')}</span>
            <h2 className="font-serif text-2xl font-bold text-nearblack dark:text-white">
              {getTranslatedText('What This Platform Represents', 'ይህ ድረ-ገጽ ምንን ይወክላል?')}
            </h2>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 border border-black/5 rounded-lg space-y-4 shadow-sm text-sm leading-relaxed text-mediumgrey dark:text-gray-300">
            <p className="font-serif italic text-nearblack dark:text-white font-semibold">
              "{getTranslatedText('Hokhma Study was born out of a realization that modern intellectual seekers reject lazy answers to complex historical and astrophysical objections.', 'Hokhma Study የተመሠረተው የዘመናችን ምሁራንና ለውስብስብ የታሪክ ድንጋጌዎችና ለሳይንስ ጥያቄዎች የሚሰጡ ቀላል የማይረቡ ምላሾችን እንደማይቀበሉ በመረዳት ነው።')}"
            </p>
            <p className="font-sans text-[13.5px]">
              {getTranslatedText(
                'This site is designed for thinkers, skeptics, seekers, and student believers searching for a coherent, academically grounded defense of classical theism and the historical resurrection. No shallow slogans or emotional manipulation. We walk through academic manuscripts, physical equations, and logical syllogisms.',
                'ይህ ድረ-ገጽ የተዘጋጀው ለሚያስቡ፣ ጥርጣሬ ላላቸው፣ ለጠያቂዎች እና ስለ አምላክ መኖርና ስለ ክርስቶስ ትንሳኤ በምሁራዊ መንገድ የተደገፈ ማብራሪያ ለሚፈልጉ ተማሪዎች ነው። እዚህ ጋር ስሜታዊ ቅስቀሳዎች ሳይሆኑ የታሪክ መዛግብት፣ የሳይንስ ውሳኔዎችና አመክንዮዎች በዝርዝር ይተነተናሉ።'
              )}
            </p>
          </div>
        </div>

        {/* Who it is for */}
        <div className="space-y-6">
          <div className="space-y-2">
            <span className="text-xs tracking-widest text-gold font-bold font-sans">{getTranslatedText('Our Mission', 'ተልእኳችን')}</span>
            <h2 className="font-serif text-2xl font-bold text-nearblack dark:text-white">
              {getTranslatedText('Who We Aim To Serve', 'ዋናው ዓላማችን ማንን ማገልገል ነው?')}
            </h2>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 border border-black/5 rounded-lg space-y-4 shadow-sm text-xs leading-relaxed text-mediumgrey dark:text-gray-300">
            <div className="flex gap-3 items-start text-xs font-sans">
              <span className="p-1.5 rounded-full bg-amber-50 dark:bg-amber-950/20 text-gold font-bold">1</span>
              <div>
                <h4 className="font-semibold text-nearblack dark:text-white mb-0.5">{getTranslatedText('The Intellectual Doubter', 'ምክንያታዊ ጠያቂዎችን')}</h4>
                <p className="text-[12px]">{getTranslatedText('Who senses the heavy gravity of the problem of suffering or the Big Bang and needs a structured, logically robust response that doesn’t demand checking their brain at the door.', 'የስነ-መለኮት ተግዳሮቶችን ጥልቀት የተገነዘቡና አእምሮን ላለመጫን ምክንያታዊ የሆኑ ከባድ ጥያቄዎች ምላሾችን የሚሹ።')}</p>
              </div>
            </div>
            
            <div className="flex gap-3 items-start text-xs font-sans border-t border-black/5 pt-4">
              <span className="p-1.5 rounded-full bg-amber-50 dark:bg-amber-950/20 text-gold font-bold">2</span>
              <div>
                <h4 className="font-semibold text-nearblack dark:text-white mb-0.5">{getTranslatedText('The Developing Apologist', 'አፖሎጂስቶችንና አስተማሪዎችን')}</h4>
                <p className="text-[12px]">{getTranslatedText('Students, educators, and pastors searching for structured, linear lecture notes, minimal facts breakdowns, and primary academic references to defend theology.', 'ስነ-መለኮታዊ እውነትን ለመከላከል ስርዓት ያላትን ዝርዝር ማብራሪያዎችንና የታሪክ ማስረጃዎችን የሚፈልጉ Pastors፣ አስተማሪዎችና ተማሪዎች።')}</p>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* 3. Statement of Faith */}
      <section className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
        <div className="text-center space-y-2 max-w-lg mx-auto mb-4">
          <span className="text-xs tracking-widest text-gold font-bold">{getTranslatedText('Orthodox Credo', 'እምነታችን')}</span>
          <h2 className="font-serif text-2xl font-bold text-nearblack dark:text-white">
            {getTranslatedText('Statement of Faith (Doctrines)', 'የእምነት መግለጫ (ቀኖናዎች)')}
          </h2>
          <p className="text-xs text-mediumgrey">
            {getTranslatedText('Click any section below to view our subscription to classical theological parameters.', 'የእምነት መግለጫ አቋሞቻችንን በዝርዝር ለመመልከት ከታች ካሉት ክፍሎች በአንዱ ላይ ጠቅ ያድርጉ።')}
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
                  className="w-full flex justify-between items-center text-left py-1 text-sm font-bold tracking-wider text-nearblack dark:text-white hover:text-gold transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-gold" />
                    <span>{getLocalizedFaithItem(id, 'doctrine', item.doctrine)}</span>
                  </span>
                  {isOpen ? <ChevronUp size={16} className="text-gold" /> : <ChevronDown size={16} className="text-gold" />}
                </button>

                {isOpen && (
                  <p className="mt-3.5 pl-6 text-xs md:text-sm text-mediumgrey dark:text-gray-300 leading-relaxed font-sans max-w-4xl border-l border-gold/30 animate-fade-in text-[13px] md:text-[14px]">
                    {getLocalizedFaithItem(id, 'belief', item.belief)}
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
            {getTranslatedText('Recent Writings By Dr. Sterling', 'በዶ/ር ስተርሊንግ በቅርቡ የተጻፉ ጽሑፎች')}
          </h3>
          <span className="text-xs font-bold text-gold tracking-wider">{getTranslatedText('Archives', 'ማህደር')}</span>
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
                  {getTranslatedText(art.title, art.titleAm)}
                </h4>
                
                <p className="text-xs text-mediumgrey line-clamp-2 leading-relaxed">
                  {getTranslatedText(art.excerpt, art.excerptAm)}
                </p>
              </div>

              <span className="text-[10px] text-lightgrey tracking-wider font-semibold group-hover:text-gold flex items-center gap-0.5 pt-4 border-t border-black/5 mt-4 font-sans">
                {getTranslatedText('Read Paper', 'ጽሑፉን ያንብቡ')} <ArrowRight size={10} />
              </span>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
