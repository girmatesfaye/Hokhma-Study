/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'am';

export interface TranslationDictionary {
  [key: string]: {
    en: string;
    am: string;
  };
}

export const uiTranslations: TranslationDictionary = {
  // Navigation & Brand
  'brand.name': { en: 'Hokhma Study', am: 'ሆክማ ጥናት' },
  'brand.tagline': { en: 'Apologetics Ministry & Author Workroom', am: 'የክርስትና መከላከያ አገልግሎት እና የጸሐፊ የሥራ ክፍል' },
  'nav.home': { en: 'Home', am: 'መነሻ' },
  'nav.topics': { en: 'Topics', am: 'ምድቦች' },
  'nav.paths': { en: 'Study Paths', am: 'የጥናት መንገዶች' },
  'nav.resources': { en: 'Recommended Resources', am: 'የጥናት ግብዓቶች' },
  'nav.questions': { en: 'Objections & Questions', am: 'ተቃውሞዎች እና ጥያቄዎች' },
  'nav.about': { en: 'About Dr. Sterling', am: 'ስለ ዶክተር ስተርሊንግ' },
  'nav.admin': { en: 'Author Workroom', am: 'የጸሐፊ የሥራ ክፍል' },
  'nav.publicHub': { en: 'Public Hub', am: 'ህዝባዊ ገጽ' },
  'nav.search': { en: 'Search Papers...', am: 'ጽሑፎችን ፈልግ...' },
  'nav.searchResults': { en: 'Search Results', am: 'የፍለጋ ውጤቶች' },

  // Home Page
  'home.heroTitle': { en: 'Intellectual Rigor Married to Christian Faith', am: 'አእምሯዊ ጥልቀት ከክርስቲያናዊ እምነት ጋር' },
  'home.heroSub': { en: 'A curated corpus addressing modern skepticism, historical verification, and philosophical defense of the historic Christian faith.', am: 'ዘመናዊ ጥርጣሬዎችን፣ ታሪካዊ ማስረጃዎችን እና የታሪክ ክርስቲያናዊ እምነት ፍልስፍናዊ መከላከያዎችን የሚያቀርብ ልዩ ስብስብ።' },
  'home.exploreTopics': { en: 'Explore Topics', am: 'ምድቦችን ያስሱ' },
  'home.viewPaths': { en: 'View Learning Paths', am: 'የጥናት መንገዶችን እይ' },
  'home.recentPapers': { en: 'Recent Research Papers', am: 'የቅርብ ጊዜ የምርምር ጽሑፎች' },
  'home.featured': { en: 'Featured Thesis', am: 'ተለይቶ የቀረበ ጥናት' },
  'home.noArticles': { en: 'No papers found matching your selection.', am: 'ከተመረጠው ምርጫ ጋር የሚዛመድ ጽሑፍ አልተገኘም።' },
  'home.searchPlaceholder': { en: 'Enter question, objection or tag...', am: 'ጥያቄ፣ ተቃውሞ ወይም ታግ ያስገቡ...' },

  // Admin Dashboard
  'admin.profileAuth': { en: 'Authenticate Profile', am: 'ማንነት አረጋግጥ' },
  'admin.dashboard': { en: 'Dashboard', am: 'ዳሽቦርድ' },
  'admin.articles': { en: 'Articles', am: 'ጽሑፎች' },
  'admin.questions': { en: 'Questions', am: 'ጥያቄዎች' },
  'admin.comments': { en: 'Comments', am: 'አስተያየቶች' },
  'admin.settings': { en: 'Settings', am: 'ቅንብሮች' },
  'admin.totalArticles': { en: 'Total Articles', am: 'አጠቃላይ ጽሑፎች' },
  'admin.monthlyReads': { en: 'Monthly Reads', am: 'የወር ንባቦች' },
  'admin.pendingComments': { en: 'Pending Comments', am: 'የሚጠበቁ አስተያየቶች' },
  'admin.newsletterSubs': { en: 'Newsletter Subs', am: 'የጋዜጣ ተመዝጋቢዎች' },
  'admin.quickActions': { en: 'Quick Workspace Actions', am: 'ፈጣን የሥራ ቦታ እርምጃዎች' },
  'admin.writeArticle': { en: 'Write new article', am: 'አዲስ ጽሑፍ ጻፍ' },
  'admin.mapQuestion': { en: 'Map a question', am: 'ጥያቄን አያይዝ' },
  'admin.recentArticles': { en: 'Recent articles', am: 'የቅርብ ጊዜ ጽሑፎች' },
  'admin.fullArchive': { en: 'Full Article Archive', am: 'ሙሉ የጽሑፍ ማህደር' },
  'admin.create': { en: 'Create New', am: 'አዲስ ፍጠር' },
  'admin.mappedObjections': { en: 'Community Mapped objections', am: 'በማህበረሰቡ የተያያዙ ጥያቄዎች' },
  'admin.moderationRoom': { en: 'Community Discussion Moderation Room', am: 'የማህበረሰብ ውይይት መቆጣጠሪያ ክፍል' },
  'admin.settingsTitle': { en: 'Authorshop Workroom Settings', am: 'የሥራ ክፍል ቅንብሮች' },
  'admin.diagnosticTools': { en: 'Diagnostic Database Tools', am: 'የምርምር ዳታቤዝ መሣሪያዎች' },
  'admin.resetDefault': { en: 'Diagnostics: Reset Database Defaults', am: 'ምርመራዎች፡ ዳታቤዝን ወደ መጀመሪያው መልስ' },
  'admin.securityNotice': { en: 'Security Notice', am: 'የደህንነት ማስታወቂያ' },
  'admin.accountEmail': { en: 'Account Email', am: 'የመለያ ኢሜይል' },
  'admin.password': { en: 'Password', am: 'የይለፍ ቃል' },
  'admin.signIn': { en: 'Sign in to Workroom', am: 'ወደ ሥራ ክፍል ግባ' },
  'admin.singleAuthorConstraint': { en: 'Single-Author Constraints', am: 'የአንድ ጸሐፊ ገደቦች' },
  'admin.singleAuthorExplanation': { en: 'Hokhma Study relies on local caching data persistence to simulate dynamic publishes. Modifying metadata or editing article paragraphs stores revisions securely inside your browser’s persistent state.', am: 'የሆክማ ጥናት ተለዋዋጭ ህትመቶችን ለማስመሰል በአሳሽዎ ውስጥ ያለን መረጃ ይጠቀማል። መረጃዎችን ማሻሻል ወይም የጽሑፍ አንቀጾችን ማረም በአሳሽዎ ውስጥ ባለው የደህንነት ማከማቻ ውስጥ በጥንቃቄ ይቀመጣል።' },

  // Common UI Button & Labels
  'common.read': { en: 'Read', am: 'አንብብ' },
  'common.explore': { en: 'Explore', am: 'ዝርዝር እይ' },
  'common.back': { en: 'Back', am: 'ተመለስ' },
  'common.cancel': { en: 'Cancel', am: 'ሰርዝ' },
  'common.save': { en: 'Save', am: 'አስቀምጥ' },
  'common.submit': { en: 'Submit', am: 'ላክ' },
  'common.edit': { en: 'Edit', am: 'አሻሽል' },
  'common.delete': { en: 'Delete', am: 'ሰርዝ' },
  'common.approved': { en: 'Approved', am: 'የጸደቀ' },
  'common.pending': { en: 'Pending Moderation', am: 'በቁጥጥሪያ ላይ ያለ' },
  'common.searchInquiries': { en: 'Inquiry Details', am: 'የጥያቄው ዝርዝር ሁኔታ' },
  'common.send': { en: 'Send Message', am: 'መልዕክት ላክ' },
  'common.all': { en: 'All Articles', am: 'ሁሉም ጽሑፎች' },
  'common.difficulty': { en: 'Difficulty', am: 'የጥልቀት ደረጃ' },
  'common.beginner': { en: 'Beginner', am: 'ጀማሪ' },
  'common.intermediate': { en: 'Intermediate', am: 'መካከለኛ' },
  'common.deepDive': { en: 'Deep Dive', am: 'ጥልቅ ጥናት' },
  'common.minuteRead': { en: 'm read', am: 'ደቂቃ ንባብ' },
  'common.published': { en: 'Published', am: 'የታተመ' },
  'common.draft': { en: 'Draft', am: 'ረቂቅ' },

  // Footer & Contact
  'footer.objectionInquiry': { en: 'Submit doubt or objection', am: 'ጥርጣሬ ወይም ተቃውሞ ይላኩ' },
  'footer.objectionInquiryDesc': { en: 'Have an intellectual objection or a personal inquiry about faith? Send a message directly inputting below. Honest inquiries are highly valued.', am: 'ስለ እምነት ጥሁፋዊ ተቃውሞ ወይም የግል ጥያቄ አለዎት? መልእክትዎን በቀጥታ ከታች ባለው ቅጽ ይላኩ። ቅን ጥያቄዎች በጣም በከፍተኛ ደረጃ ይከበራሉ።' },
  'footer.yourName': { en: 'Your Name', am: 'የእርስዎ ስም' },
  'footer.emailAddress': { en: 'Email Address', am: 'የኢሜይል አድራሻ' },
  'footer.subjectConcern': { en: 'Subject / Concern', am: 'ርዕስ / ጉዳይ' },
  'footer.details': { en: 'Inquiry Details', am: 'የጥያቄው ዝርዝር' },
  'footer.newsletter': { en: 'Keep Guarded', am: 'መረጃ ያግኙ' },
  'footer.newsletterPlaceholder': { en: 'Email address...', am: 'የኢሜይል አድራሻ...' },
  'footer.newsletterButton': { en: 'Subscribe to Letters', am: 'ይመዝገቡ' },
  'footer.copyright': { en: 'All rights reserved.', am: 'መብቱ በህግ የተጠበቀ ነው።' },

  // Article detail
  'article.discussion': { en: 'Community Discussion', am: 'የማህበረሰብ ውይይት' },
  'article.postComment': { en: 'Join discussion showing your name below. Friendly disagreement is welcome.', am: 'ከታች ስምዎን በማስገባት ውይይቱን ይቀላቀሉ። ጨዋነት የተሞላበት ልዩነት ይበረታታል።' },
  'article.commentsSection': { en: 'Comments', am: 'አስተያየቶች' },
  'article.noComments': { en: 'There are no comments here yet. Be the first to reflect.', am: 'እስካሁን ምንም አስተያየት አልተጻፈም። የመጀመሪያው አስተያየት ሰጭ ይሁኑ።' },
  'article.bibleVerses': { en: 'Bible References', am: 'የመጽሐፍ ቅዱስ ጥቅሶች' },
  'article.footnote': { en: 'Academic Footnotes', am: 'አካዳሚክ ማጣቀሻዎች' },

  // Topics Index
  'topics.title': { en: 'Explore by topic', am: 'በምድብ ያስሱ' },
  'topics.subtitle': { en: 'Select an arena of theology or historical assessment to inspect the full body of defense literature.', am: 'ሙሉ የአሳማኝ ስነ-መለኮት ጽሑፎችን ለመመርመር የስነ-መለኮት ወይም የታሪክ ምድብ ይምረጡ።' },
  'topics.intellectualArenas': { en: 'Intellectual Arenas', am: 'አዕምሯዊ ዘርፎች' },

  // Learning Paths Index
  'paths.title': { en: 'Curated Study path', am: 'የጥናት መንገዶች' },
  'paths.subtitle': { en: 'Struggle with persistent doubts? Explore step-by-step curriculum pathways designed to construct structural defenses of faith from scratch.', am: 'የጥርጣሬ ፈተናዎችን እየታገሉ ነው? በእምነት ላይ ጠንካራ መከላከያ ለመገንባት እንዲረዱ ሆነው የተዘጋጁ የደረጃ በደረጃ የትምህርት መንገዶችን ያስሱ።' },
  'paths.startCurriculum': { en: 'Start Curriculum Pathway', am: 'ጥናቱን ይጀምሩ' },
  'paths.completed': { en: 'Completed', am: 'ተጠናቋል' },
  'paths.markAsRead': { en: 'Mark Completed', am: 'እንደተጠናቀቀ ምልክት አድርግ' },
  'paths.step': { en: 'Step', am: 'ደረጃ' },

  // Resources Page
  'resources.recommendedStudy': { en: 'Recommended Study', am: 'የሚመከሩ ጥናቶች' },
  'resources.externalSubtitle': { en: 'Highly respected treatises, digital indexes and external apologetics libraries chosen for secondary reading.', am: 'ለተጨማሪ ንባብ የተመረጡ በጣም የተከበሩ ጥናታዊ ጽሑፎች፣ ዲጂታል ማውጫዎች እና የክርስትና መከላከያ ቤተ-መጻሕፍት።' },
  'resources.visitLink': { en: 'Visit Resource External Link', am: 'ውጫዊውን ሊንክ ይጎብኙ' },

  // Questions / Skepticism Index
  'questions.objectionTitle': { en: 'Objections Repository', am: 'የተቃውሞዎች ማከማቻ' },
  'questions.subtitle': { en: 'Common skepticism, standard queries, and intellectual hurdles indexed with direct mapping to their detailed defenses.', am: 'የተለመዱ ጥርጣሬዎች፣ መደበኛ ጥያቄዎች እና አዕምሯዊ እንቅፋቶች ከዝርዝር መከላከያዎቻቸው ጋር በቀጥታ ተያይዘው የቀረቡበት።' },
  'questions.popularHurdles': { en: 'Popular Hurdles & Doubts', am: 'ታዋቂ ወቀሳዎች እና ጥርጣሬዎች' },
  'questions.answeredIn': { en: 'Answered in paper', am: 'በዚህ ጽሑፍ ውስጥ ተመልሷል' },
  'questions.filterTags': { en: 'Popular Tag Filters', am: 'ታዋቂ ታግ ማጣሪያዎች' },
  'questions.allDifficulty': { en: 'All Difficulties', am: 'ሁሉም ደረጃዎች' },
  'questions.allTopics': { en: 'All Topics', am: 'ሁሉም ምድቦች' },
  'questions.recentlyAdded': { en: 'Recently Added Objections', am: 'በቅርብ የተጨመሩ ተቃውሞዎች' },
  'questions.searchLabel': { en: 'Search Objections Answered...', am: 'ከተመለሱት ተቃውሞዎች ፈልግ...' },
};

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, overrides?: Record<Language, string>) => string;
  getTranslatedText: (enText: string | undefined, amText: string | undefined) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('hokhma_language');
      return (saved === 'am' || saved === 'en') ? saved : 'en';
    } catch {
      return 'en';
    }
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('hokhma_language', lang);
    } catch (e) {
      console.error('Failed to persist language setting', e);
    }
  };

  const t = (key: string, overrides?: Record<Language, string>): string => {
    if (overrides && overrides[language]) {
      return overrides[language];
    }
    const translation = uiTranslations[key];
    if (!translation) {
      return key;
    }
    return translation[language] || translation.en;
  };

  const getTranslatedText = (enText: string | undefined, amText: string | undefined): string => {
    if (language === 'am') {
      return amText || enText || '';
    }
    return enText || amText || '';
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, getTranslatedText }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
