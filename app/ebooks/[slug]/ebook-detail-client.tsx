'use client';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { getEbookBySlug, ebooks } from '@/lib/data/ebooks';
import { categories } from '@/lib/data/categories';
import { Disclaimer } from '@/components/disclaimer';
import { ShareButtons } from '@/components/share-buttons';
import { EbookCard } from '@/components/ebook-card';
import { ArrowLeft, Clock, Star, BookOpen, CheckCircle, FileText, BookMarked } from 'lucide-react';

export default function EbookDetailClient({ slug }: { slug: string }) {
  const { t, lang, isTelugu } = useLanguage();
  const ebook = getEbookBySlug(slug);

  if (!ebook) return notFound();

  const category = categories.find((c) => c.slug === ebook.category);
  const title = ebook.title[lang] || ebook.title.en;
  const subtitle = ebook.subtitle[lang] || ebook.subtitle.en;
  const description = ebook.description[lang] || ebook.description.en;
  const related = ebooks.filter((e) => e.slug !== ebook.slug && e.category === ebook.category).slice(0, 4);

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-primary/8 via-accent/4 to-gold/8 border-b border-border/40">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
          <Link
            href="/ebooks"
            className={cn('inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6', isTelugu && 'font-telugu')}
          >
            <ArrowLeft className="h-4 w-4" />
            {t('nav.ebooks')}
          </Link>

          <div className="grid sm:grid-cols-[200px_1fr] gap-8 items-start">
            {/* Cover */}
            <div className="relative aspect-[3/4] rounded-xl border border-border/60 bg-gradient-to-br from-primary/10 via-accent/5 to-gold/10 shadow-card overflow-hidden">
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                <BookOpen className="h-10 w-10 text-primary/40 mb-3" />
                <h2 className={cn('text-sm font-bold leading-snug text-foreground/80', isTelugu && lang === 'te' && 'font-telugu')}>
                  {title}
                </h2>
              </div>
              <div className="absolute top-2 left-2">
                {ebook.isFree ? (
                  <span className="rounded-full bg-accent/90 px-2 py-0.5 text-[10px] font-bold text-accent-foreground">{t('card.free')}</span>
                ) : (
                  <span className="rounded-full bg-gold/90 px-2 py-0.5 text-[10px] font-bold text-gold-foreground">{t('card.premium')}</span>
                )}
              </div>
            </div>

            {/* Info */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                {category && (
                  <Link
                    href={`/explore/${category.slug}`}
                    className={cn('rounded-md bg-muted/60 px-2 py-0.5 text-xs font-medium text-muted-foreground hover:text-foreground', isTelugu && 'font-telugu')}
                  >
                    {category.name[lang]}
                  </Link>
                )}
                <span className="text-xs text-muted-foreground">{ebook.language === 'te' ? 'తెలుగు' : 'English'}</span>
              </div>

              <h1 className={cn('text-2xl sm:text-3xl font-bold tracking-tight font-display', isTelugu && lang === 'te' && 'font-telugu')}>
                {title}
              </h1>
              <p className={cn('mt-1 text-sm text-muted-foreground', isTelugu && lang === 'te' && 'font-telugu')}>
                {subtitle}
              </p>

              {/* Meta */}
              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {ebook.readingTime} {t('card.readTime')}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                  {ebook.rating} ({ebook.reviewCount})
                </span>
                <span className="flex items-center gap-1">
                  <BookMarked className="h-3.5 w-3.5" />
                  {ebook.chapters.length} {t('ebook.chapters')}
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5" />
                  {ebook.author[lang] || ebook.author.en}
                </span>
              </div>

              <p className={cn('mt-4 text-sm text-foreground/80 leading-relaxed', isTelugu && lang === 'te' && 'font-telugu')}>
                {description}
              </p>

              {/* CTA */}
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={`/ebooks/${ebook.slug}/read`}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-card transition-all hover:shadow-glow hover:scale-[1.02]"
                >
                  <BookOpen className="h-4 w-4" />
                  <span className={isTelugu ? 'font-telugu' : ''}>{t('card.startReading')}</span>
                </Link>
                {!ebook.isFree && (
                  <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground shadow-soft transition-all hover:shadow-card">
                    <span className={isTelugu ? 'font-telugu' : ''}>
                      {lang === 'te' ? `₹${ebook.price} కొనుగోలు` : `Buy for ₹${ebook.price}`}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Table of contents */}
        <section>
          <h2 className={cn('text-xl font-bold mb-4', isTelugu && 'font-telugu')}>{t('ebook.contents')}</h2>
          <div className="space-y-2">
            {ebook.chapters.map((ch, i) => (
              <Link
                key={ch.id}
                href={`/ebooks/${ebook.slug}/read?ch=${i}`}
                className="flex items-center gap-3 rounded-lg border border-border/50 bg-card p-3 transition-colors hover:border-primary/30 hover:bg-muted/30"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary shrink-0">
                  {i + 1}
                </span>
                <span className={cn('text-sm font-medium text-foreground', isTelugu && lang === 'te' && 'font-telugu')}>
                  {ch.title[lang] || ch.title.en}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* What you'll learn */}
        <section className="rounded-xl border border-border/60 bg-card p-6">
          <h2 className={cn('text-lg font-bold mb-4', isTelugu && 'font-telugu')}>
            {lang === 'te' ? 'మీరు నేర్చుకునేది' : "What You'll Learn"}
          </h2>
          <ul className="space-y-2">
            {(lang === 'te' ? [
              'ఆయుర్వేద మూల సూత్రాలు',
              'దైనందిన ఆచారాలు',
              'వ్యక్తిగత ఆరోగ్య సూచనలు',
              'సురక్షిత జ్ఞానం',
            ] : [
              'Core Ayurvedic principles',
              'Practical daily routines',
              'Personalized wellness guidance',
              'Safety notes and references',
            ]).map((item, i) => (
              <li key={i} className={cn('flex items-center gap-2 text-sm text-foreground/80', isTelugu && lang === 'te' && 'font-telugu')}>
                <CheckCircle className="h-4 w-4 text-accent shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Share */}
        <div className="pt-4 border-t border-border/40">
          <ShareButtons title={title} text={description} />
        </div>

        <Disclaimer variant="full" />
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <h2 className={cn('text-xl font-bold mb-4', isTelugu && 'font-telugu')}>
            {lang === 'te' ? 'సంబంధిత పుస్తకాలు' : 'Related Ebooks'}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {related.map((eb) => (
              <EbookCard key={eb.slug} ebook={eb} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
