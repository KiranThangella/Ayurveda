'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { Ebook } from '@/lib/types';
import { Star, Clock } from 'lucide-react';
import { EbookCover } from '@/components/ebook-cover';

interface EbookCardProps {
  ebook: Ebook;
  className?: string;
}

export function EbookCard({ ebook, className }: EbookCardProps) {
  const { lang, t, isTelugu } = useLanguage();
  const title = ebook.title[lang] || ebook.title.en;
  const desc = ebook.description[lang] || ebook.description.en;
  const subtitle = ebook.subtitle?.[lang] || ebook.subtitle?.en;

  return (
    <Link
      href={`/ebooks/${ebook.slug}`}
      className={cn(
        'group flex flex-col rounded-xl border border-border/60 bg-card overflow-hidden shadow-soft transition-all duration-300 hover:shadow-card hover:border-border hover:-translate-y-0.5',
        className
      )}
    >
      {/* Cover */}
      <div className="relative overflow-hidden">
        <EbookCover
          title={title}
          subtitle={subtitle}
          topicId={ebook.category || ebook.slug}
          coverImage={ebook.coverImage}
          language={lang as 'en' | 'te'}
          aspectRatio="aspect-[3/4]"
        />

        {/* Price Badges */}
        <div className="absolute top-2 left-2 flex gap-1.5 z-20">
          {ebook.isFree ? (
            <span className="rounded-full bg-accent/90 px-2 py-0.5 text-[10px] font-bold text-accent-foreground shadow-sm">
              {t('card.free')}
            </span>
          ) : (
            <span className="rounded-full bg-amber-500/90 px-2 py-0.5 text-[10px] font-bold text-slate-950 shadow-sm">
              {t('card.premium')}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-3">
        <h3 className={cn(
          'text-sm font-bold leading-snug text-foreground line-clamp-2 group-hover:text-primary transition-colors',
          isTelugu && lang === 'te' && 'font-telugu'
        )}>
          {title}
        </h3>
        <p className={cn(
          'mt-1 text-xs text-muted-foreground line-clamp-2 flex-1',
          isTelugu && lang === 'te' && 'font-telugu'
        )}>
          {desc}
        </p>

        {/* Meta */}
        <div className="mt-3 flex items-center gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {ebook.readingTime} {t('card.readTime')}
          </span>
          <span className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-gold text-gold" />
            {ebook.rating}
          </span>
        </div>
      </div>
    </Link>
  );
}

interface EbookRowProps {
  title: string;
  subtitle?: string;
  ebooks: Ebook[];
  viewAllHref?: string;
  viewAllLabel?: string;
}

export function EbookRow({ title, subtitle, ebooks, viewAllHref, viewAllLabel, }: EbookRowProps) {
  const { t, isTelugu } = useLanguage();

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-end justify-between mb-5">
        <div>
          <h2 className={cn('text-xl sm:text-2xl font-bold tracking-tight', isTelugu && 'font-telugu')}>
            {title}
          </h2>
          {subtitle && (
            <p className={cn('mt-1 text-sm text-muted-foreground', isTelugu && 'font-telugu')}>
              {subtitle}
            </p>
          )}
        </div>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className={cn(
              'hidden sm:block text-sm font-medium text-primary hover:underline shrink-0',
              isTelugu && 'font-telugu'
            )}
          >
            {viewAllLabel || t('card.viewAll')}
          </Link>
        )}
      </div>
      <div className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2 -mx-4 px-4">
        {ebooks.map((ebook) => (
          <div key={ebook.slug} className="snap-start shrink-0 w-[200px] sm:w-[220px]">
            <EbookCard ebook={ebook} />
          </div>
        ))}
      </div>
    </section>
  );
}
