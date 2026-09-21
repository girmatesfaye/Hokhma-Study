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
      styles = 'bg-[#0F9E7B] text-white dark:bg-[#0F9E7B]/20 dark:text-[#2ecc71] dark:border dark:border-[#0F9E7B]/30';
      label = 'Beginner';
      break;
    case 'intermediate':
      styles = 'bg-gold text-white dark:bg-gold/20 dark:text-gold dark:border dark:border-gold/30';
      label = 'Intermediate';
      break;
    case 'deep-dive':
      styles = 'bg-[#534AB7] text-white dark:bg-[#534AB7]/20 dark:text-[#a29bfe] dark:border dark:border-[#534AB7]/30';
      label = 'Deep Dive';
      break;
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold tracking-wide rounded-[4px] ${styles} ${className}`}>
      {label}
    </span>
  );
}
