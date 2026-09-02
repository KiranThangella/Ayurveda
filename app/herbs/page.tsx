'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { herbs as staticHerbs } from '@/lib/data/herbs';
import { fetchGeneratedHerbs } from '@/lib/data/herbs-remote';
import type { Herb } from '@/lib/types';
import { HerbCard } from '@/components/herb-card';
import { Search } from 'lucide-react';

export default function HerbsPage() {
  const { t, lang, isTelugu } = useLanguage();
  const [query, setQuery] = useState('');
  const [generatedHerbs, setGeneratedHerbs] = useState<Herb[]>([]);

  useEffect(() => {
    fetchGeneratedHerbs().then(setGeneratedHerbs);
  }, []);

  const herbs = [...staticHerbs, ...generatedHerbs.filter((g) => !staticHerbs.some((s) => s.slug === g.slug))];

  const filtered = herbs.filter((h) => {
    if (!query) return true;
    const q = query.toLowerCase();
    const common = (h.commonName || '').toLowerCase();
    const telugu = h.teluguName || '';
    const sanskrit = (h.sanskritName || '').toLowerCase();
    const botanical = (h.botanicalName || '').toLowerCase();
    const regional = (h.regionalNames || []).some((rn) => (rn?.name || '').toLowerCase().includes(q));
    return (
      common.includes(q) ||
      telugu.includes(query) ||
      sanskrit.includes(q) ||
      botanical.includes(q) ||
      regional
    );
  });

  return (
    <div className="animate-fade-in mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 text-center">
        <h1 className={cn('text-3xl sm:text-4xl font-bold tracking-tight font-display', isTelugu && 'font-telugu')}>
          {t('herbs.title')}
        </h1>
        <p className={cn('mt-2 text-muted-foreground', isTelugu && 'font-telugu')}>
          {t('herbs.subtitle')}
        </p>
      </div>

      {/* Search bar */}
      <div className="relative mb-8 max-w-2xl mx-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('herbs.search')}
          className={cn(
            'w-full rounded-lg border border-border bg-card py-2.5 pl-10 pr-4 text-sm shadow-soft outline-none transition-colors focus:border-primary',
            isTelugu && 'font-telugu'
          )}
        />
      </div>

      {/* Results */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((herb, i) => (
          <div key={herb.slug} className="animate-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
            <HerbCard herb={herb} />
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <p className={isTelugu ? 'font-telugu' : ''}>{t('search.noResults')}</p>
        </div>
      )}
    </div>
  );
}
