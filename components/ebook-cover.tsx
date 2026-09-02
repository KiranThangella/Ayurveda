'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface EbookCoverProps {
  title: string;
  subtitle?: string;
  topicId?: string;
  coverImage?: string;
  language?: 'en' | 'te';
  aspectRatio?: string;
  showMotto?: boolean;
  className?: string;
}

export function EbookCover({
  title,
  subtitle,
  coverImage,
  aspectRatio = 'aspect-[3/4]',
  className,
}: EbookCoverProps) {
  const fallbackImage =
    'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80';

  return (
    <div className={cn('relative w-full bg-slate-900 overflow-hidden group', aspectRatio, className)}>
      <img
        src={coverImage || fallbackImage}
        alt={title}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-4 flex flex-col justify-end text-white">
        <h3 className="font-bold text-lg leading-tight drop-shadow">{title}</h3>
        {subtitle && <p className="text-xs text-slate-200 line-clamp-2 mt-1 drop-shadow-sm">{subtitle}</p>}
      </div>
    </div>
  );
}
