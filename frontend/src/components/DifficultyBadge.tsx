/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Difficulty } from '../types';

interface DifficultyBadgeProps {
  difficulty: Difficulty;
  className?: string;
}

export default function DifficultyBadge({ difficulty, className = '' }: DifficultyBadgeProps) {
  let styles = '';
  let label = '';

  switch (difficulty) {
    case 'beginner':
      styles = 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800/80 dark:text-slate-200 dark:border-slate-700';
      label = 'Beginner';
      break;
    case 'intermediate':
      styles = 'bg-gold/15 text-gold border border-gold/35 dark:bg-gold/20 dark:text-gold dark:border-gold/40';
      label = 'Intermediate';
      break;
    case 'deep-dive':
      styles = 'bg-navy text-white dark:bg-gold dark:text-slate-950 border border-transparent shadow-xs';
      label = 'Deep Dive';
      break;
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold tracking-wide rounded-[4px] ${styles} ${className}`}>
      {label}
    </span>
  );
}
