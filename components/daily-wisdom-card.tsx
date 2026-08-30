'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { dailyContent } from '@/lib/data/daily';
import { getEbookBySlug } from '@/lib/data/ebooks';
import { Sprout, Lightbulb, UtensilsCrossed, BookOpen, Quote, Sun } from 'lucide-react';

export function DailyWisdomCard() {
  const { lang, t, isTelugu } = useLanguage();
  const recommendedEbook = getEbookBySlug(dailyContent.recommendedEbookSlug);

  const cards = [
    {
      icon: Sprout,
      label: t('daily.herb'),
      title: dailyContent.herb.name[lang],
      text: dailyContent.herb.text[lang],
      color: 'text-accent bg-accent/10',
    },
    {
      icon: Lightbulb,
      label: t('daily.fact'),
      title: undefined,
      text: dailyContent.fact[lang],
      color: 'text-gold bg-gold/10',
    },
    {
      icon: UtensilsCrossed,
      label: t('daily.food'),
      title: undefined,
      text: dailyContent.food[lang],
      color: 'text-terracotta bg-terracotta/10',
    },
    {
      icon: BookOpen,
      label: t('daily.concept'),
      title: dailyContent.concept.sanskrit,
      text: dailyContent.concept.meaning[lang],
      color: 'text-primary bg-primary/10',
    },
    {
      icon: Sun,
      label: t('daily.seasonal'),
      title: undefined,
      text: dailyContent.seasonal[lang],
      color: 'text-leaf bg-leaf/10',
    },
    {
      icon: Quote,
      label: t('daily.quote'),
      title: undefined,
      text: dailyContent.quote[lang],
      color: 'text-sage bg-sage/10',
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center mb-6">
        <h2 className={cn('text-2xl sm:text-3xl font-bold tracking-tight', isTelugu && 'font-telugu')}>
          {t('section.daily')}
        </h2>
        <p className={cn('mt-1 text-sm text-muted-foreground', isTelugu && 'font-telugu')}>
          {t('daily.title')}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="rounded-xl border border-border/60 bg-card p-5 shadow-soft transition-shadow hover:shadow-card animate-fade-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className={cn('flex h-8 w-8 items-center justify-center rounded-lg', card.color)}>
                  <Icon className="h-4 w-4" />
                </span>
                <span className={cn('text-xs font-semibold uppercase tracking-wider text-muted-foreground', isTelugu && 'font-telugu')}>
                  {card.label}
                </span>
              </div>
              {card.title && (
                <h3 className={cn('text-base font-bold mb-1', isTelugu && lang === 'te' && 'font-telugu')}>
                  {card.title}
                </h3>
              )}
              <p className={cn('text-sm text-foreground/80 leading-relaxed', isTelugu && lang === 'te' && 'font-telugu')}>
                {card.text}
              </p>
            </div>
          );
        })}
      </div>

      {recommendedEbook && (
        <div className="mt-6 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5 p-5 flex items-center justify-between gap-4">
          <div>
            <p className={cn('text-xs font-semibold uppercase tracking-wider text-primary mb-1', isTelugu && 'font-telugu')}>
              {t('daily.recommended')}
            </p>
            <h3 className={cn('text-base font-bold', isTelugu && lang === 'te' && 'font-telugu')}>
              {recommendedEbook.title[lang] || recommendedEbook.title.en}
            </h3>
          </div>
          <Link
            href={`/ebooks/${recommendedEbook.slug}`}
            className="shrink-0 rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-soft hover:shadow-card transition-shadow"
          >
            {t('card.startReading')}
          </Link>
        </div>
      )}
    </section>
  );
}
