'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { Herb } from '@/lib/types';
import { Sprout } from 'lucide-react';

interface HerbCardProps {
  herb: Herb;
  className?: string;
}

export function HerbCard({ herb, className }: HerbCardProps) {
  const { lang, isTelugu } = useLanguage();
  const name = lang === 'te' ? herb.teluguName : herb.commonName;
  const intro = herb.introduction[lang] || herb.introduction.en;

  return (
    <Link
      href={`/herbs/${herb.slug}`}
      className={cn(
        'group flex flex-col rounded-xl border border-border/60 bg-card overflow-hidden shadow-soft transition-all duration-300 hover:shadow-card hover:border-border hover:-translate-y-0.5',
        className
      )}
    >
      {/* Visual */}
      <div className="relative aspect-[4/3] bg-gradient-to-br from-accent/15 via-leaf/8 to-primary/10 overflow-hidden">
        {herb.imageUrl ? (
          <img
            src={herb.imageUrl}
            alt={herb.commonName}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Sprout className="h-12 w-12 text-accent/40 transition-transform group-hover:scale-110" />
          </div>
        )}
        <div className="absolute bottom-2 left-2">
          <span className="rounded-full bg-background/80 backdrop-blur-sm px-2 py-0.5 text-[10px] font-medium text-foreground/70">
            {herb.sanskritName}
          </span>
        </div>
        {herb.imageUrl && herb.imagePhotographer && (
          <span className="absolute bottom-2 right-2 rounded-full bg-background/70 backdrop-blur-sm px-1.5 py-0.5 text-[8px] text-foreground/60">
            {herb.imagePhotographer} / Pexels
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-3">
        <div className="flex items-baseline gap-2">
          <h3 className={cn('text-sm font-bold text-foreground group-hover:text-primary transition-colors', isTelugu && lang === 'te' && 'font-telugu')}>
            {name}
          </h3>
        </div>
        <p className="mt-0.5 text-[10px] text-muted-foreground italic">{herb.botanicalName}</p>
        <p className={cn('mt-1.5 text-xs text-muted-foreground line-clamp-2 flex-1', isTelugu && lang === 'te' && 'font-telugu')}>
          {intro}
        </p>
        <div className="mt-2 flex flex-wrap gap-1">
          {herb.regionalNames.slice(0, 2).map((rn) => (
            <span key={rn.language} className="rounded bg-muted/60 px-1.5 py-0.5 text-[9px] text-muted-foreground">
              {rn.name}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
