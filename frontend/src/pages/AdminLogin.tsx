/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import authService from '../services/auth';
import { Button, Field, inputClass, Panel } from '../components/admin/ui';

// Author sign-in: one form on a plain page that follows the site's light or dark theme.
export default function AdminLogin() {
  const { loginAdmin, navigateTo, isAdmin } = useApp();
  const { getTranslatedText: t } = useLanguage();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Someone who is already signed in goes straight to the workroom
  useEffect(() => {
    if (isAdmin) navigateTo('/admin');
  }, [isAdmin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password) {
      setErrorMsg(t('Enter both your email address and your password.', 'የኢሜይል አድራሻዎን እና የይለፍ ቃልዎን ያስገቡ።'));
      return;
    }

    try {
      setIsLoading(true);
      const data = await authService.login(email.trim(), password);
      loginAdmin(data.token);
      navigateTo('/admin');
    } catch (err: any) {
      setErrorMsg(
        err?.response?.data?.message ||
          t('The server could not be reached. Check your connection and try again.', 'አገልጋዩን ማግኘት አልተቻለም። ግንኙነትዎን ያረጋግጡና እንደገና ይሞክሩ።')
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-slate-50 p-4 dark:bg-dark-bg">
      <Panel className="w-full max-w-sm p-8">
        <a href="#/" className="font-serif text-2xl font-semibold text-nearblack dark:text-white">
          Hokhma Study
        </a>
        <h1 className="mt-6 font-serif text-3xl font-semibold text-nearblack dark:text-white">{t('Sign In', 'ግባ')}</h1>
        <p className="mt-1 text-sm text-mediumgrey dark:text-gray-400">
          {t('This area is for the site author. There is no public registration.', 'ይህ ቦታ ለጣቢያው ደራሲ ብቻ ነው። ይፋዊ ምዝገባ የለም።')}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Field label={t('Email', 'ኢሜይል')}>
            <input
              type="email"
              required
              autoComplete="username"
              autoFocus
              value={email}
              disabled={isLoading}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label={t('Password', 'የይለፍ ቃል')}>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                disabled={isLoading}
                onChange={(e) => setPassword(e.target.value)}
                className={`${inputClass} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? t('Hide Password', 'የይለፍ ቃል ደብቅ') : t('Show Password', 'የይለፍ ቃል አሳይ')}
                className="absolute inset-y-0 right-0 flex w-10 cursor-pointer items-center justify-center text-mediumgrey hover:text-nearblack focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold dark:hover:text-white"
              >
                {showPassword ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
              </button>
            </div>
          </Field>

          {errorMsg && (
            <p role="alert" className="rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200">
              {errorMsg}
            </p>
          )}

          <Button type="submit" variant="primary" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                {t('Signing In', 'በመግባት ላይ')}
              </>
            ) : (
              t('Sign In', 'ግባ')
            )}
          </Button>
        </form>

        <a href="#/" className="mt-6 block text-center text-sm text-mediumgrey underline underline-offset-4 hover:text-nearblack dark:text-gray-400 dark:hover:text-white">
          {t('Back To The Public Site', 'ወደ ይፋዊው ድረ-ገጽ ተመለስ')}
        </a>
      </Panel>
    </div>
  );
}
