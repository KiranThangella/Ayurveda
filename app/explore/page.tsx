'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { categories } from '@/lib/data/categories';
import { ebooks, getEbooksByCategory } from '@/lib/data/ebooks';
import { herbs } from '@/lib/data/herbs';
import { EbookCard } from '@/components/ebook-card';
import { Disclaimer } from '@/components/disclaimer';
import * as Icons from 'lucide-react';

export default function ExplorePage() {
  const { t, lang, isTelugu } = useLanguage();

  return (
    <div className="animate-fade-in mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 text-center">
        <h1 className={cn('text-3xl sm:text-4xl font-bold tracking-tight font-display', isTelugu && 'font-telugu')}>
          {t('section.explore')}
        </h1>
        <p className={cn('mt-2 text-muted-foreground', isTelugu && 'font-telugu')}>
          {t('section.explore.sub')}
        </p>
      </div>

      {/* All categories grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {categories.map((cat, i) => {
          const Icon = (Icons as any)[cat.icon] || Icons.Circle;
          const catEbooks = getEbooksByCategory(cat.slug);
          const catHerbs = herbs.filter((h) => h.category === cat.slug);
          const count = catEbooks.length + catHerbs.length;

          return (
            <Link
              key={cat.slug}
              href={`/explore/${cat.slug}`}
              className="group flex items-start gap-4 rounded-xl border border-border/60 bg-card p-5 shadow-soft transition-all hover:shadow-card hover:border-primary/30 hover:-translate-y-0.5 animate-fade-up"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground shrink-0">
                <Icon className="h-6 w-6" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h2 className={cn('text-base font-bold', isTelugu && 'font-telugu')}>{cat.name[lang]}</h2>
                  {count > 0 && (
                    <span className="text-xs text-muted-foreground bg-muted/60 rounded-full px-2 py-0.5 shrink-0">
                      {count}
                    </span>
                  )}
                </div>
                <p className={cn('mt-1 text-sm text-muted-foreground line-clamp-2', isTelugu && 'font-telugu')}>
                  {cat.description[lang]}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      <Disclaimer variant="short" className="mt-8" />
    </div>
  );
}
