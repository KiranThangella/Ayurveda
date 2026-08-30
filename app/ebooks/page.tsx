'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { ebooks } from '@/lib/data/ebooks';
import { EbookCard } from '@/components/ebook-card';
import { categories } from '@/lib/data/categories';
import { Search, Filter } from 'lucide-react';

type FilterLang = 'all' | 'en' | 'te';

export default function EbooksPage() {
  const { t, lang, isTelugu } = useLanguage();
  const [query, setQuery] = useState('');
  const [filterLang, setFilterLang] = useState<FilterLang>('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPrice, setFilterPrice] = useState<'all' | 'free' | 'premium'>('all');

  const filtered = ebooks.filter((eb) => {
    if (query) {
      const q = query.toLowerCase();
      const titleMatch = (eb.title.en + eb.title.te).toLowerCase().includes(q) || eb.title.te.includes(query);
      if (!titleMatch) return false;
    }
    if (filterLang !== 'all' && eb.language !== filterLang) return false;
    if (filterCategory !== 'all' && eb.category !== filterCategory) return false;
    if (filterPrice === 'free' && !eb.isFree) return false;
    if (filterPrice === 'premium' && eb.isFree) return false;
    return true;
  });

  return (
    <div className="animate-fade-in mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 text-center">
        <h1 className={cn('text-3xl sm:text-4xl font-bold tracking-tight font-display', isTelugu && 'font-telugu')}>
          {t('nav.ebooks')}
        </h1>
        <p className={cn('mt-2 text-muted-foreground', isTelugu && 'font-telugu')}>
          {t('section.featured.sub')}
        </p>
      </div>

      {/* Search + Filters */}
      <div className="mb-8 space-y-4">
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('search.placeholder')}
            className={cn(
              'w-full rounded-lg border border-border bg-card py-2.5 pl-10 pr-4 text-sm shadow-soft outline-none transition-colors focus:border-primary',
              isTelugu && 'font-telugu'
            )}
          />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          {/* Language filter */}
          {[
            { val: 'all', label: lang === 'te' ? 'అన్ని' : 'All' },
            { val: 'en', label: 'English' },
            { val: 'te', label: 'తెలుగు' },
          ].map((opt) => (
            <button
              key={opt.val}
              onClick={() => setFilterLang(opt.val as FilterLang)}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                filterLang === opt.val
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted'
              )}
            >
              {opt.label}
            </button>
          ))}

          <span className="w-px h-5 bg-border mx-1" />

          {/* Price filter */}
          {[
            { val: 'all', label: lang === 'te' ? 'అన్ని' : 'All' },
            { val: 'free', label: t('card.free') },
            { val: 'premium', label: t('card.premium') },
          ].map((opt) => (
            <button
              key={opt.val}
              onClick={() => setFilterPrice(opt.val as any)}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                filterPrice === opt.val
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted',
                isTelugu && 'font-telugu'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          <button
            onClick={() => setFilterCategory('all')}
            className={cn(
              'rounded-full px-2.5 py-1 text-xs transition-colors',
              filterCategory === 'all' ? 'bg-accent text-accent-foreground' : 'bg-muted/40 text-muted-foreground hover:bg-muted'
            )}
          >
            {lang === 'te' ? 'అన్ని' : 'All'}
          </button>
          {categories.filter((c) => ebooks.some((e) => e.category === c.slug)).map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setFilterCategory(cat.slug)}
              className={cn(
                'rounded-full px-2.5 py-1 text-xs transition-colors',
                filterCategory === cat.slug ? 'bg-accent text-accent-foreground' : 'bg-muted/40 text-muted-foreground hover:bg-muted',
                isTelugu && 'font-telugu'
              )}
            >
              {cat.name[lang]}
            </button>
          ))}
        </div>
      </div>

      <p className={cn('text-sm text-muted-foreground mb-4', isTelugu && 'font-telugu')}>
        {filtered.length} {t('search.results')}
      </p>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((eb, i) => (
          <div key={eb.slug} className="animate-fade-up" style={{ animationDelay: `${i * 30}ms` }}>
            <EbookCard ebook={eb} />
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
