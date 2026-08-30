'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { herbs } from '@/lib/data/herbs';
import { ebooks } from '@/lib/data/ebooks';
import { categories } from '@/lib/data/categories';
import { Search as SearchIcon, TrendingUp, Clock, X } from 'lucide-react';

export default function SearchPage() {
  const { t, lang, isTelugu } = useLanguage();
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('search-history') : null;
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const popularSearches = lang === 'te'
    ? ['పసుపు', 'తులసి', 'దినచర్య', 'అశ్వగంధ', 'ఆయుర్వేదం']
    : ['turmeric', 'tulsi', 'dinacharya', 'ashwagandha', 'doshas'];

  const results = useMemo(() => {
    if (!query.trim()) return { herbs: [], ebooks: [], categories: [] };
    const q = query.toLowerCase();
    return {
      herbs: herbs.filter((h) =>
        h.commonName.toLowerCase().includes(q) ||
        h.teluguName.includes(query) ||
        h.sanskritName.toLowerCase().includes(q) ||
        h.botanicalName.toLowerCase().includes(q)
      ).slice(0, 6),
      ebooks: ebooks.filter((e) =>
        (e.title.en + e.title.te).toLowerCase().includes(q) ||
        e.title.te.includes(query) ||
        e.tags.some((tag) => tag.toLowerCase().includes(q))
      ).slice(0, 6),
      categories: categories.filter((c) =>
        (c.name.en + c.name.te).toLowerCase().includes(q) ||
        c.name.te.includes(query)
      ).slice(0, 4),
    };
  }, [query]);

  const saveSearch = (term: string) => {
    if (!term.trim()) return;
    const next = [term, ...history.filter((h) => h !== term)].slice(0, 5);
    setHistory(next);
    if (typeof window !== 'undefined') localStorage.setItem('search-history', JSON.stringify(next));
  };

  const clearHistory = () => {
    setHistory([]);
    if (typeof window !== 'undefined') localStorage.removeItem('search-history');
  };

  const totalResults = results.herbs.length + results.ebooks.length + results.categories.length;

  return (
    <div className="animate-fade-in mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 text-center">
        <h1 className={cn('text-2xl sm:text-3xl font-bold tracking-tight font-display', isTelugu && 'font-telugu')}>{t('search.title')}</h1>
        <p className={cn('mt-1 text-sm text-muted-foreground', isTelugu && 'font-telugu')}>{t('search.subtitle')}</p>
      </div>

      {/* Search input */}
      <div className="relative mb-6">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && saveSearch(query)}
          placeholder={t('search.placeholder')}
          autoFocus
          className={cn(
            'w-full rounded-xl border border-border bg-card py-3.5 pl-12 pr-10 text-base shadow-soft outline-none transition-colors focus:border-primary',
            isTelugu && 'font-telugu'
          )}
        />
        {query && (
          <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* No query: show popular + history */}
      {!query && (
        <div className="space-y-8">
          {history.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className={cn('flex items-center gap-2 text-sm font-semibold text-foreground', isTelugu && 'font-telugu')}>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  {t('search.history')}
                </h2>
                <button onClick={clearHistory} className={cn('text-xs text-muted-foreground hover:text-foreground', isTelugu && 'font-telugu')}>
                  {t('common.delete')}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {history.map((h, i) => (
                  <button
                    key={i}
                    onClick={() => setQuery(h)}
                    className={cn('rounded-full bg-muted/60 px-3 py-1.5 text-xs font-medium text-foreground/70 hover:bg-muted transition-colors', isTelugu && 'font-telugu')}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className={cn('flex items-center gap-2 text-sm font-semibold text-foreground mb-3', isTelugu && 'font-telugu')}>
              <TrendingUp className="h-4 w-4 text-primary" />
              {t('search.popular')}
            </h2>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((s) => (
                <button
                  key={s}
                  onClick={() => setQuery(s)}
                  className={cn('rounded-full bg-primary/8 border border-primary/20 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/12 transition-colors', isTelugu && 'font-telugu')}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {query && (
        <div className="space-y-6">
          <p className={cn('text-sm text-muted-foreground', isTelugu && 'font-telugu')}>
            {totalResults} {t('search.results')}
          </p>

          {totalResults === 0 && (
            <div className="text-center py-16">
              <SearchIcon className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className={cn('text-sm text-muted-foreground', isTelugu && 'font-telugu')}>{t('search.noResults')}</p>
            </div>
          )}

          {results.categories.length > 0 && (
            <div>
              <h3 className={cn('text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2', isTelugu && 'font-telugu')}>{t('section.explore')}</h3>
              <div className="flex flex-wrap gap-2">
                {results.categories.map((c) => (
                  <Link key={c.slug} href={`/explore/${c.slug}`} className={cn('rounded-lg border border-border/60 bg-card px-3 py-2 text-sm hover:border-primary/30', isTelugu && 'font-telugu')}>
                    {c.name[lang]}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {results.herbs.length > 0 && (
            <div>
              <h3 className={cn('text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2', isTelugu && 'font-telugu')}>{t('nav.herbs')}</h3>
              <div className="space-y-2">
                {results.herbs.map((h) => (
                  <Link
                    key={h.slug}
                    href={`/herbs/${h.slug}`}
                    className="flex items-center justify-between rounded-lg border border-border/60 bg-card p-3 hover:border-primary/30 transition-colors"
                  >
                    <div>
                      <p className={cn('text-sm font-medium', isTelugu && lang === 'te' && 'font-telugu')}>{lang === 'te' ? h.teluguName : h.commonName}</p>
                      <p className="text-xs text-muted-foreground italic">{h.botanicalName}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{h.sanskritName}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {results.ebooks.length > 0 && (
            <div>
              <h3 className={cn('text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2', isTelugu && 'font-telugu')}>{t('nav.ebooks')}</h3>
              <div className="space-y-2">
                {results.ebooks.map((e) => (
                  <Link
                    key={e.slug}
                    href={`/ebooks/${e.slug}`}
                    className="flex items-center justify-between rounded-lg border border-border/60 bg-card p-3 hover:border-primary/30 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className={cn('text-sm font-medium truncate', isTelugu && lang === 'te' && 'font-telugu')}>{e.title[lang] || e.title.en}</p>
                      <p className={cn('text-xs text-muted-foreground truncate', isTelugu && 'font-telugu')}>{e.subtitle[lang] || e.subtitle.en}</p>
                    </div>
                    <span className={cn('text-xs shrink-0 ml-2', e.isFree ? 'text-accent' : 'text-gold')}>
                      {e.isFree ? t('card.free') : t('card.premium')}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
