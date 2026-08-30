'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { ebooks } from '@/lib/data/ebooks';
import { EbookCard } from '@/components/ebook-card';
import { Disclaimer } from '@/components/disclaimer';
import { Bookmark, History, Heart, Sparkles, ShoppingBag, Download, Library as LibIcon } from 'lucide-react';

type Tab = 'bookmarks' | 'history' | 'favorites' | 'generated' | 'purchases' | 'downloads';

export default function LibraryPage() {
  const { t, lang, isTelugu } = useLanguage();
  const [tab, setTab] = useState<Tab>('bookmarks');
  const [progress, setProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const entries = Object.keys(localStorage).filter((k) => k.startsWith('progress-'));
    const p: Record<string, number> = {};
    entries.forEach((k) => {
      const slug = k.replace('progress-', '');
      try {
        const data = JSON.parse(localStorage.getItem(k) || '{}');
        p[slug] = data.chapterIdx || 0;
      } catch { /* ignore */ }
    });
    setProgress(p);
  }, []);

  const tabs: { id: Tab; label: string; icon: typeof Bookmark }[] = [
    { id: 'bookmarks', label: t('library.bookmarks'), icon: Bookmark },
    { id: 'history', label: t('library.history'), icon: History },
    { id: 'favorites', label: t('library.favorites'), icon: Heart },
    { id: 'generated', label: t('library.generated'), icon: Sparkles },
    { id: 'purchases', label: t('library.purchases'), icon: ShoppingBag },
    { id: 'downloads', label: t('library.downloads'), icon: Download },
  ];

  const historyEbooks = Object.keys(progress).map((slug) => ebooks.find((e) => e.slug === slug)).filter(Boolean);

  return (
    <div className="animate-fade-in mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <LibIcon className="h-6 w-6" />
        </span>
        <div>
          <h1 className={cn('text-2xl sm:text-3xl font-bold tracking-tight font-display', isTelugu && 'font-telugu')}>{t('library.title')}</h1>
          <p className={cn('text-sm text-muted-foreground', isTelugu && 'font-telugu')}>{t('brand.tagline')}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-6 pb-1">
        {tabs.map((tabItem) => {
          const Icon = tabItem.icon;
          return (
            <button
              key={tabItem.id}
              onClick={() => setTab(tabItem.id)}
              className={cn(
                'shrink-0 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                tab === tabItem.id ? 'bg-primary text-primary-foreground' : 'bg-muted/60 text-muted-foreground hover:bg-muted',
                isTelugu && 'font-telugu'
              )}
            >
              <Icon className="h-4 w-4" />
              {tabItem.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="rounded-2xl border border-border/60 bg-card p-6 sm:p-8 shadow-soft min-h-[300px]">
        {tab === 'history' && historyEbooks.length > 0 && (
          <div className="space-y-3">
            {historyEbooks.map((eb) => eb && (
              <Link
                key={eb.slug}
                href={`/ebooks/${eb.slug}/read`}
                className="flex items-center gap-4 rounded-lg border border-border/50 p-3 hover:border-primary/30 transition-colors"
              >
                <div className="flex h-16 w-12 shrink-0 items-center justify-center rounded bg-primary/10">
                  <span className="text-xs font-bold text-primary">{progress[eb.slug] + 1}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className={cn('text-sm font-medium truncate', isTelugu && lang === 'te' && 'font-telugu')}>{eb.title[lang] || eb.title.en}</p>
                  <p className={cn('text-xs text-muted-foreground truncate', isTelugu && 'font-telugu')}>{eb.subtitle[lang] || eb.subtitle.en}</p>
                  <div className="mt-1.5 h-1 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${((progress[eb.slug] + 1) / eb.chapters.length) * 100}%` }} />
                  </div>
                </div>
                <span className={cn('shrink-0 text-xs text-primary font-medium', isTelugu && 'font-telugu')}>{t('ebook.continue')}</span>
              </Link>
            ))}
          </div>
        )}

        {(tab === 'bookmarks' || tab === 'favorites' || tab === 'generated' || tab === 'purchases' || tab === 'downloads') && (
          <div className="text-center py-12">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted/40 mb-4">
              {(() => { const Icon = tabs.find((x) => x.id === tab)!.icon; return <Icon className="h-7 w-7 text-muted-foreground/40" />; })()}
            </div>
            <p className={cn('text-sm text-muted-foreground max-w-xs mx-auto', isTelugu && 'font-telugu')}>
              {t('library.empty')}
            </p>
            <Link
              href="/ebooks"
              className={cn('inline-flex items-center mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft', isTelugu && 'font-telugu')}
            >
              {t('cta.browseAll')}
            </Link>
          </div>
        )}

        {tab === 'history' && historyEbooks.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted/40 mb-4">
              <History className="h-7 w-7 text-muted-foreground/40" />
            </div>
            <p className={cn('text-sm text-muted-foreground max-w-xs mx-auto', isTelugu && 'font-telugu')}>
              {t('library.empty')}
            </p>
            <Link
              href="/ebooks"
              className={cn('inline-flex items-center mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft', isTelugu && 'font-telugu')}
            >
              {t('cta.browseAll')}
            </Link>
          </div>
        )}
      </div>

      <div className="mt-6">
        <Disclaimer variant="short" />
      </div>
    </div>
  );
}
