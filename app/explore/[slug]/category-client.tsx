'use client';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { categories } from '@/lib/data/categories';
import { getEbooksByCategory } from '@/lib/data/ebooks';
import { herbs } from '@/lib/data/herbs';
import { EbookCard } from '@/components/ebook-card';
import { HerbCard } from '@/components/herb-card';
import { ArrowLeft } from 'lucide-react';
import * as Icons from 'lucide-react';

export default function CategoryClient({ slug }: { slug: string }) {
  const { t, lang, isTelugu } = useLanguage();
  const category = categories.find((c) => c.slug === slug);

  if (!category) return notFound();

  const catEbooks = getEbooksByCategory(slug);
  const catHerbs = herbs.filter((h) => h.category === slug);
  const Icon = (Icons as any)[category.icon] || Icons.Circle;

  return (
    <div className="animate-fade-in mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/explore"
        className={cn('inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4', isTelugu && 'font-telugu')}
      >
        <ArrowLeft className="h-4 w-4" />
        {t('common.back')}
      </Link>

      <div className="flex items-center gap-4 mb-8">
        <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-7 w-7" />
        </span>
        <div>
          <h1 className={cn('text-2xl sm:text-3xl font-bold tracking-tight', isTelugu && 'font-telugu')}>
            {category.name[lang]}
          </h1>
          <p className={cn('mt-1 text-sm text-muted-foreground', isTelugu && 'font-telugu')}>
            {category.description[lang]}
          </p>
        </div>
      </div>

      {catEbooks.length > 0 && (
        <section className="mb-10">
          <h2 className={cn('text-xl font-bold mb-4', isTelugu && 'font-telugu')}>{t('nav.ebooks')}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {catEbooks.map((eb) => (
              <EbookCard key={eb.slug} ebook={eb} />
            ))}
          </div>
        </section>
      )}

      {catHerbs.length > 0 && (
        <section className="mb-10">
          <h2 className={cn('text-xl font-bold mb-4', isTelugu && 'font-telugu')}>{t('nav.herbs')}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {catHerbs.map((herb) => (
              <HerbCard key={herb.slug} herb={herb} />
            ))}
          </div>
        </section>
      )}

      {catEbooks.length === 0 && catHerbs.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <p className={isTelugu ? 'font-telugu' : ''}>{t('common.loading')}</p>
        </div>
      )}
    </div>
  );
}
