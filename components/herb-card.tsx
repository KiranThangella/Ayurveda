'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { Herb } from '@/lib/types';
import { getHerbImageUrl } from '@/lib/data/herbs';
import { Sparkles } from 'lucide-react';

interface HerbCardProps {
  herb: Herb;
  className?: string;
}

export function HerbCard({ herb, className }: HerbCardProps) {
  const { lang, isTelugu } = useLanguage();
  const name = lang === 'te' ? herb.teluguName : herb.commonName;
  const intro = herb.introduction[lang] || herb.introduction.en;
  const imageUrl = getHerbImageUrl(herb);

  return (
    <Link
      href={`/herbs/${herb.slug}`}
      className={cn(
        'group flex flex-col rounded-2xl border border-border/70 bg-card overflow-hidden shadow-sm transition-all duration-300 hover:shadow-xl hover:border-primary/40 hover:-translate-y-1',
        className
      )}
    >
      {/* Visual Header */}
      <div className="relative aspect-[16/11] w-full bg-muted overflow-hidden">
        <img
          src={imageUrl}
          alt={herb.commonName || herb.teluguName}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
        {/* Soft vignette & gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          <span className="rounded-full bg-black/55 backdrop-blur-md px-2.5 py-1 text-[11px] font-semibold text-emerald-300 border border-white/10 shadow-sm flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            {herb.sanskritName || 'Ayurvedic Herb'}
          </span>
          <span className="rounded-full bg-emerald-700/80 backdrop-blur-md px-2 py-0.5 text-[10px] font-medium text-emerald-50 uppercase tracking-wider">
            {herb.category}
          </span>
        </div>

        {/* Bottom Image Overlay Text */}
        <div className="absolute bottom-2.5 left-3 right-3 text-white pointer-events-none">
          <p className={cn('text-lg font-bold leading-tight drop-shadow-md text-white group-hover:text-emerald-200 transition-colors', isTelugu && 'font-telugu')}>
            {herb.teluguName}
          </p>
          <p className="text-xs font-medium text-white/90 drop-shadow-sm flex items-center justify-between">
            <span>{herb.englishName || herb.commonName}</span>
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-3.5 sm:p-4 justify-between bg-card">
        <div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-serif italic mb-1.5 flex items-center gap-1">
            <span>{herb.botanicalName}</span>
          </p>
          <p className={cn('text-xs text-muted-foreground line-clamp-2 leading-relaxed', isTelugu && lang === 'te' && 'font-telugu')}>
            {intro}
          </p>
        </div>

        <div className="mt-3 pt-2.5 border-t border-border/40 flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {herb.regionalNames?.slice(0, 2).map((rn) => (
              <span key={rn.language} className="rounded-md bg-muted/80 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                {rn.language}: {rn.name}
              </span>
            ))}
          </div>
          <span className="text-xs font-semibold text-primary group-hover:translate-x-0.5 transition-transform">
            {lang === 'te' ? 'వివరాలు →' : 'Explore →'}
          </span>
        </div>
      </div>
    </Link>
  );
}

