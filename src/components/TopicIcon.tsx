/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as LucideIcons from 'lucide-react';

interface TopicIconProps {
  name: string;
  size?: number;
  className?: string;
}

export default function TopicIcon({ name, size = 20, className = '' }: TopicIconProps) {
  // Fallbacks if icon name is missing or mismatched
  const IconComponent = (LucideIcons as any)[name] || LucideIcons.BookOpen;
  return <IconComponent size={size} className={className} />;
}
