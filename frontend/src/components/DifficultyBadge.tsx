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
      styles = 'bg-black text-white dark:bg-white/10 dark:text-white dark:border dark:border-white/20';
      label = 'Beginner';
      break;
    case 'intermediate':
      styles = 'bg-gold text-white dark:bg-gold/20 dark:text-gold dark:border dark:border-gold/30';
      label = 'Intermediate';
      break;
    case 'deep-dive':
      styles = 'bg-gold text-black dark:bg-gold/20 dark:text-gold dark:border dark:border-gold/30';
      label = 'Deep Dive';
      break;
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold tracking-wide rounded-[4px] ${styles} ${className}`}>
      {label}
    </span>
  );
}
