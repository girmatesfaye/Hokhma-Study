/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Mail, Shield, Check, Send, X } from 'lucide-react';

export default function Footer() {
  const { isAdmin, authorProfile, statementOfFaith, addContactMessage } = useApp();
  
  // Contact Modal State
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [contactSuccess, setContactSuccess] = useState(false);

  // Statement of Faith State
  const [showFaithModal, setShowFaithModal] = useState(false);

  // Prevent background scroll and support Escape key when any modal is open
  useEffect(() => {
    const isAnyModalOpen = showContactModal || showFaithModal;
    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setShowContactModal(false);
          setShowFaithModal(false);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [showContactModal, showFaithModal]);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (contactForm.name && contactForm.email && contactForm.message) {
      addContactMessage({
        id: `contact-${Date.now()}`,
        ...contactForm,
        submittedAt: new Date().toISOString(),
      });
      setContactSuccess(true);
      setTimeout(() => {
        setContactSuccess(false);
        setShowContactModal(false);
        setContactForm({ name: '', email: '', subject: '', message: '' });
      }, 3000);
    }
  };

  return (
    <>
      <footer id="app-footer" className="bg-white dark:bg-dark-bg text-nearblack dark:text-gray-300 py-10 sm:py-12 mt-16 sm:mt-20 border-t border-black/5 dark:border-white/5 transition-colors duration-200">
        <div className="max-w-[1140px] mx-auto px-4 md:px-6 text-center space-y-6">
          
          {/* BRANDING */}
          <div className="flex flex-col items-center gap-2">
            <a href="#/" className="font-serif text-2xl font-bold text-navy dark:text-white tracking-tight">
              Hokhma Study<span className="text-gold">.</span>
            </a>
            <p className="text-xs text-mediumgrey dark:text-gray-400 font-sans">
              Apologetics with academic rigor. Curated by {authorProfile.name}.
            </p>
          </div>
          
          {/* COMPACT NAVIGATION INDEX - touch friendly */}
          <nav className="flex flex-wrap items-center justify-center gap-x-5 sm:gap-x-6 gap-y-2 text-xs font-sans text-mediumgrey dark:text-gray-400">
            <a href="#/topics" className="py-1 px-1 hover:text-gold dark:hover:text-gold transition-colors touch-manipulation">Browse Topics</a>
            <a href="#/questions" className="py-1 px-1 hover:text-gold dark:hover:text-gold transition-colors touch-manipulation">Objection Index</a>
            <a href="#/paths" className="py-1 px-1 hover:text-gold dark:hover:text-gold transition-colors touch-manipulation">Learning Paths</a>
            <a href="#/resources" className="py-1 px-1 hover:text-gold dark:hover:text-gold transition-colors touch-manipulation">Resources</a>
            <a href="#/about" className="py-1 px-1 hover:text-gold dark:hover:text-gold transition-colors touch-manipulation">About</a>
            <button
              id="statement-of-faith-link"
              onClick={() => setShowFaithModal(true)}
              className="py-1 px-1 hover:text-gold transition-colors flex items-center gap-1 cursor-pointer font-sans touch-manipulation"
            >
              <Shield size={12} className="text-gold" />
              Statement of Faith
            </button>
            <button
              id="contact-form-link"
              onClick={() => setShowContactModal(true)}
              className="py-1 px-1 hover:text-gold transition-colors flex items-center gap-1 cursor-pointer font-sans touch-manipulation"
            >
              <Mail size={12} className="text-gold" />
              Contact
            </button>
            {isAdmin ? (
              <a id="footer-admin-link" href="#/admin" className="py-1 px-1 hover:text-gold transition-colors font-semibold touch-manipulation">
                Author Workroom
              </a>
            ) : (
              <a id="footer-admin-login-link" href="#/admin/login" className="py-1 px-1 hover:text-gold transition-colors font-semibold touch-manipulation">
                Admin Login
              </a>
            )}
          </nav>

          {/* ATTRIBUTION */}
          <div className="pt-4 border-t border-black/5 dark:border-white/5 text-[11px] text-gray-400 dark:text-gray-500">
            <span>© {new Date().getFullYear()} Hokhma Study. Christian apologetics with academic rigor.</span>
          </div>
        </div>
      </footer>

      {/* MODAL: STATEMENT OF FAITH */}
      {showFaithModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Statement of Faith"
          className="fixed inset-0 z-[110] bg-slate-950/75 backdrop-blur-xs flex justify-center items-center p-3 sm:p-4 animate-fade-in"
          onClick={() => setShowFaithModal(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[88dvh] flex flex-col shadow-2xl border border-black/10 dark:border-white/10 animate-scale-in overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs p-4 sm:p-5 border-b border-black/5 dark:border-white/5 flex justify-between items-center z-10">
              <div className="flex items-center gap-2">
                <Shield className="text-gold h-5 w-5 shrink-0" />
                <h3 className="font-serif text-lg sm:text-xl font-bold text-nearblack dark:text-white text-balance">Hokhma Study Statement of Faith</h3>
              </div>
              <button
                onClick={() => setShowFaithModal(false)}
                aria-label="Close Statement of Faith"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-nearblack/60 dark:text-white/60 hover:text-red-500 btn-press cursor-pointer flex items-center justify-center shrink-0 touch-manipulation"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 sm:p-6 md:p-8 space-y-6 overflow-y-auto no-scrollbar">
              <p className="text-xs sm:text-sm leading-relaxed text-mediumgrey dark:text-gray-300">
                This statement outlines the core theological parameters guiding the apologetics writing on <span className="font-serif font-bold text-nearblack dark:text-white">Hokhma Study</span>. We subscribe to the ancient, orthodox creeds of the Christian church including the Apostles' and Nicene Creed.
              </p>
              
              <div className="space-y-4 sm:space-y-5">
                {statementOfFaith.map((item, id) => (
                   <div key={id} className="border-l-2 border-gold/40 pl-3.5 sm:pl-4 py-1">
                    <h4 className="font-serif text-sm font-bold text-navy dark:text-gold tracking-wider mb-1">
                      {item.doctrine}
                    </h4>
                    <p className="text-xs sm:text-sm text-nearblack/85 dark:text-gray-200 leading-relaxed font-sans">
                      {item.belief}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 sm:p-5 bg-offwhite/50 dark:bg-slate-950/40 border-t border-black/5 dark:border-white/5 flex justify-end">
              <button
                onClick={() => setShowFaithModal(false)}
                className="w-full sm:w-auto px-5 py-2.5 min-h-[44px] bg-navy text-white dark:bg-gold dark:text-slate-950 hover:bg-navy/90 text-xs font-bold tracking-wider rounded-xl transition-colors btn-press cursor-pointer touch-manipulation"
              >
                Understand & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CONTACT AUTHOR */}
      {showContactModal && (
        <div className="fixed inset-0 z-[110] bg-slate-950/75 backdrop-blur-xs flex justify-center items-center p-4 animate-fade-in" onClick={() => setShowContactModal(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-lg w-full shadow-2xl border border-black/10 dark:border-white/10 overflow-hidden animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-white dark:bg-slate-900">
              <div className="flex items-center gap-2">
                <Mail className="text-gold h-5 w-5" />
                <h3 className="font-serif text-lg font-bold text-nearblack dark:text-white">Contact Dr. Thomas Sterling</h3>
              </div>
              <button
                onClick={() => setShowContactModal(false)}
                className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-nearblack/60 dark:text-white/60 hover:text-red-500 btn-press cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {contactSuccess ? (
              <div className="p-8 text-center space-y-4">
                <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                  <Check size={24} />
                </div>
                <div>
                  <h4 className="font-serif text-lg font-semibold text-nearblack dark:text-white">Message Dispatched!</h4>
                  <p className="text-sm text-mediumgrey dark:text-gray-300 mt-1 max-w-sm mx-auto leading-relaxed">
                    Thank you. Your inquiry has been anchored securely. Dr. Sterling reads all sincere scholarly and existential messages, and will follow up with you.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="p-6 md:p-8 space-y-4">
                <p className="text-xs text-mediumgrey dark:text-gray-300 leading-relaxed mb-2">
                  Have an intellectual objection or a personal inquiry about faith? Send a message directly inputting below. Honest inquiries are highly valued.
                </p>
                <div>
                  <label className="block text-[11px] tracking-wider font-semibold text-mediumgrey dark:text-gray-450 mb-1 font-sans">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-offwhite dark:bg-slate-950 border border-black/10 dark:border-white/10 rounded focus:outline-none focus:border-gold text-nearblack dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] tracking-wider font-semibold text-mediumgrey dark:text-gray-450 mb-1 font-sans">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-offwhite dark:bg-slate-950 border border-black/10 dark:border-white/10 rounded focus:outline-none focus:border-gold text-nearblack dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] tracking-wider font-semibold text-mediumgrey dark:text-gray-450 mb-1 font-sans">
                    Subject / Concern
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="E.g., Query about empty tomb manuscripts"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-offwhite dark:bg-slate-950 border border-black/10 dark:border-white/10 rounded focus:outline-none focus:border-gold text-nearblack dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] tracking-wider font-semibold text-mediumgrey dark:text-gray-450 mb-1 font-sans">
                    Inquiry Details
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-offwhite dark:bg-slate-950 border border-black/10 dark:border-white/10 rounded focus:outline-none focus:border-gold text-nearblack dark:text-white"
                  />
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowContactModal(false)}
                    className="px-4 py-2 border border-black/10 dark:border-white/10 hover:bg-black/5 hover:bg-white/5 text-nearblack dark:text-white text-xs font-bold tracking-wider rounded transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-navy text-white dark:bg-gold dark:text-slate-950 hover:bg-navy/90 text-xs font-bold tracking-wider rounded transition-colors flex items-center gap-1.5"
                  >
                    <Send size={12} />
                    <span>Send Message</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
