/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, Eye, EyeOff, Check, Heart, ShieldAlert } from 'lucide-react';

export default function AdminLogin() {
  const { loginAdmin, navigateTo, isAdmin } = useApp();
  
  const [email, setEmail] = useState('girmaglory@gmail.com'); // Autofilled with metadata email to build comfort!
  const [password, setPassword] = useState('sterling-theology');
  const [showPass, setShowPass] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);

  // If already logged in, redirect straight to dashboard
  if (isAdmin) {
    setTimeout(() => navigateTo('/admin'), 100);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && password.trim()) {
      setSuccess(true);
      setTimeout(() => {
        loginAdmin();
        navigateTo('/admin');
      }, 1000);
    } else {
      setErrorMsg('Invalid authorship credentials. Please review entries.');
    }
  };

  return (
    <div className="absolute inset-0 bg-[#0F1117] flex justify-center items-center z-50 p-4">
      {/* Background visual graphics */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 rounded-full border border-white" />
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 rounded-full border border-white" />
      </div>

      <div className="bg-[#1A1D24] border border-white/5 rounded-2xl max-w-md w-full p-8 space-y-7 shadow-2xl relative z-10">
        
        {/* Top Wordmark */}
        <div className="text-center space-y-2">
          <a href="#/" className="font-serif text-3xl font-bold text-white tracking-tight inline-flex items-center gap-1">
            Hokhma Study<span className="text-gold">.</span>
          </a>
          <p className="text-xs text-gold tracking-widest font-bold">
            Author Workroom Access
          </p>
          <div className="w-10 h-0.5 bg-gold mx-auto rounded" />
        </div>

        {success ? (
          <div className="p-6 text-center space-y-4 animate-fade-in">
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
              <Check size={24} className="stroke-[3]" />
            </div>
            <div className="space-y-1 text-center">
              <h4 className="font-serif text-lg font-bold text-white">Authorship Certified</h4>
              <p className="text-xs text-gray-400">Opening your writing workspace...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            
            <div className="bg-red-950/20 border border-red-900/40 rounded p-4 flex gap-3 text-red-400 text-xs">
              <Lock size={16} className="shrink-0 text-gold my-auto" />
              <div className="space-y-0.5 leading-relaxed">
                <p className="font-bold tracking-wider text-[10px] text-gold">Security Notice</p>
                <p className="font-serif text-gray-300">This gateway is configured for the single author <strong>Thomas Sterling</strong>. Registration is disabled.</p>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-900/20 border border-red-500/30 text-rose-400 text-xs rounded">
                {errorMsg}
              </div>
            )}

            <div className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-[11px] tracking-wider font-semibold text-gray-400 mb-1.5 font-sans">
                  Account Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/10 rounded focus:outline-none focus:border-gold text-sm text-white font-sans"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-[11px] tracking-wider font-semibold text-gray-400 mb-1.5 font-sans">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 pr-10 bg-slate-900 border border-white/10 rounded focus:outline-none focus:border-gold text-sm text-white font-sans"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-white"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gold text-slate-950 hover:bg-gold/90 transition-all font-bold tracking-wider text-xs rounded shadow mt-2 cursor-pointer"
            >
              Sign in to Workroom
            </button>
            
            <div className="text-center">
              <a
                href="#/"
                className="text-[11px] text-gray-400 hover:text-white transition-colors underline decoration-dotted offset-2 block"
              >
                ← Return to Public Website
              </a>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
