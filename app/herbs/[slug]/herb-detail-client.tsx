'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { getHerbBySlug, herbs as staticHerbs, getHerbImageUrl } from '@/lib/data/herbs';
import { fetchGeneratedHerbBySlug, fetchGeneratedHerbs } from '@/lib/data/herbs-remote';
import type { Herb } from '@/lib/types';
import { Disclaimer } from '@/components/disclaimer';
import { ShareButtons } from '@/components/share-buttons';
import { HerbCard } from '@/components/herb-card';
import {
  ArrowLeft,
  Sprout,
  FlaskConical,
  BookOpen,
  Leaf,
  AlertTriangle,
  Info,
  Loader2,
  Sparkles,
  ShieldCheck,
  Globe2,
  Calendar,
  Layers,
} from 'lucide-react';

export default function HerbDetailClient({ slug }: { slug: string }) {
  const { t, lang, isTelugu } = useLanguage();
  const staticHerb = getHerbBySlug(slug);
  const [remoteHerb, setRemoteHerb] = useState<Herb | null>(null);
  const [relatedGenerated, setRelatedGenerated] = useState<Herb[]>([]);
  const [checkedRemote, setCheckedRemote] = useState(false);

  useEffect(() => {
    fetchGeneratedHerbs().then(setRelatedGenerated);
    if (!staticHerb) {
      fetchGeneratedHerbBySlug(slug).then((h) => {
        setRemoteHerb(h);
        setCheckedRemote(true);
      });
    } else {
      setCheckedRemote(true);
    }
  }, [slug, staticHerb]);

  const herb = staticHerb || remoteHerb;

  if (!herb) {
    if (!checkedRemote) {
      return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{lang === 'te' ? 'మూలిక వివరాలు లోడ్ అవుతున్నాయి...' : 'Loading herb details...'}</p>
        </div>
      );
    }
    return notFound();
  }

  const allHerbs = [...staticHerbs, ...relatedGenerated.filter((g) => !staticHerbs.some((s) => s.slug === g.slug))];
  const relatedHerbs = allHerbs.filter((h) => h.slug !== herb.slug).slice(0, 4);
  const heroImage = getHerbImageUrl(herb);

  return (
    <div className="animate-fade-in pb-16">
      {/* Immersive Full-Width Hero Banner with Large Background Image */}
      <div className="relative w-full overflow-hidden bg-muted/40 min-h-[380px] sm:min-h-[460px] md:min-h-[520px] flex flex-col justify-between">
        {/* Full Screen / Large Background Herb Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt={herb.commonName || herb.teluguName}
            className="h-full w-full object-cover object-center scale-105 transition-transform duration-1000"
          />
          {/* Multi-layered cinematic gradient for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 sm:via-black/60 to-black/60" />
          <div className="absolute inset-0 bg-emerald-950/20 mix-blend-multiply pointer-events-none" />
        </div>

        {/* Top Floating Navigation */}
        <div className="relative z-10 mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 pt-6 flex items-center justify-between">
          <Link
            href="/herbs"
            className={cn(
              'inline-flex items-center gap-2 rounded-full bg-background/80 hover:bg-background dark:bg-black/60 dark:hover:bg-black/80 backdrop-blur-md border border-border/40 px-4 py-2 text-sm font-medium text-foreground shadow-md transition-all hover:scale-105',
              isTelugu && 'font-telugu'
            )}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{t('nav.herbs')}</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-700/90 backdrop-blur-md px-3.5 py-1 text-xs font-semibold text-white shadow-sm border border-emerald-500/30 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
              {herb.sanskritName || 'Ayurveda'}
            </span>
            <span className="rounded-full bg-black/50 backdrop-blur-md px-3 py-1 text-xs font-medium text-emerald-200 border border-white/10 uppercase tracking-wider hidden sm:inline-block">
              {herb.category}
            </span>
          </div>
        </div>

        {/* Hero Bottom Information */}
        <div className="relative z-10 mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 pb-8 pt-16">
          <div className="space-y-3">
            {/* Telugu & Common Headings */}
            <div>
              <h1 className={cn('text-3xl sm:text-5xl md:text-6xl font-extrabold text-foreground sm:text-white drop-shadow-md tracking-tight', isTelugu && 'font-telugu')}>
                {herb.teluguName}
              </h1>
              <p className="mt-1 text-xl sm:text-2xl font-semibold text-foreground/90 sm:text-white/95 drop-shadow-sm flex items-center gap-2">
                <span>{herb.englishName || herb.commonName}</span>
                {herb.sanskritName && (
                  <span className="text-sm font-normal text-muted-foreground sm:text-emerald-300/90 font-serif">
                    ({herb.sanskritName})
                  </span>
                )}
              </p>
            </div>

            {/* Botanical Latin Name */}
            <p className="text-sm sm:text-base italic text-emerald-700 dark:text-emerald-400 sm:text-emerald-300 font-serif flex items-center gap-2">
              <Leaf className="h-4 w-4" />
              <span>{herb.botanicalName}</span>
            </p>

            {/* Glassmorphic 4-Column Metadata Card */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 rounded-2xl bg-card/90 sm:bg-black/45 backdrop-blur-md border border-border/60 sm:border-white/20 p-3.5 sm:p-4 shadow-xl">
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground sm:text-white/70">{t('herbs.teluguName')}</dt>
                <dd className={cn('mt-0.5 text-sm sm:text-base font-semibold text-foreground sm:text-white font-telugu')}>{herb.teluguName}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground sm:text-white/70">{t('herbs.commonName')}</dt>
                <dd className="mt-0.5 text-sm sm:text-base font-semibold text-foreground sm:text-white truncate">{herb.commonName}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground sm:text-white/70">{t('herbs.sanskritName')}</dt>
                <dd className="mt-0.5 text-sm sm:text-base font-semibold text-emerald-600 dark:text-emerald-400 sm:text-emerald-300 truncate">{herb.sanskritName}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground sm:text-white/70">{t('herbs.botanicalName')}</dt>
                <dd className="mt-0.5 text-xs sm:text-sm font-serif italic text-foreground sm:text-white/90 truncate">{herb.botanicalName}</dd>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Regional Names Pills */}
        {herb.regionalNames && herb.regionalNames.length > 0 && (
          <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
              <Globe2 className="h-3.5 w-3.5 text-primary" />
              {lang === 'te' ? 'ప్రాంతీయ పేర్లు' : 'Regional Names across India'}
            </h3>
            <div className="flex flex-wrap gap-2">
              {herb.regionalNames.map((rn) => (
                <span key={rn.language} className="rounded-lg bg-muted/80 border border-border/40 px-3 py-1 text-xs">
                  <span className="text-muted-foreground font-medium">{rn.language}: </span>
                  <span className="font-semibold text-foreground">{rn.name}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Introduction Section */}
        <section className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm">
          <p className={cn('text-base sm:text-lg leading-relaxed text-foreground/95', isTelugu && lang === 'te' && 'font-telugu')}>
            {herb.introduction[lang] || herb.introduction.en}
          </p>
        </section>

        {/* Traditional Ayurveda Perspective Card */}
        <section className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 via-card to-emerald-500/10 p-6 sm:p-7 shadow-sm">
          <h2 className={cn('flex items-center gap-2.5 text-xl font-bold text-foreground mb-3', isTelugu && 'font-telugu')}>
            <div className="h-8 w-8 rounded-xl bg-emerald-600/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <BookOpen className="h-5 w-5" />
            </div>
            <span>{lang === 'te' ? 'ఆయుర్వేద సంప్రదాయ వర్ణన' : 'Traditional Ayurveda Perspective'}</span>
          </h2>
          <p className={cn('text-sm sm:text-base leading-relaxed text-foreground/85', isTelugu && lang === 'te' && 'font-telugu')}>
            {herb.traditionalDescription[lang] || herb.traditionalDescription.en}
          </p>
        </section>

        {/* 2-Column Grid: Traditional Uses & Common Preparations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Traditional Uses */}
          <section className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h2 className={cn('flex items-center gap-2.5 text-lg font-bold text-foreground mb-4', isTelugu && 'font-telugu')}>
                <div className="h-8 w-8 rounded-xl bg-primary/15 flex items-center justify-center text-primary">
                  <Sprout className="h-5 w-5" />
                </div>
                <span>{t('herbs.traditionalUses')}</span>
              </h2>
              <ul className="space-y-3">
                {herb.traditionalUses?.map((item: any, idx: number) => (
                  <li key={idx} className={cn('flex gap-3 text-sm text-foreground/85 leading-relaxed', isTelugu && lang === 'te' && 'font-telugu')}>
                    <span className="h-5 w-5 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      ✓
                    </span>
                    <span>{item[lang] || item.en}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Common Preparations */}
          <section className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h2 className={cn('flex items-center gap-2.5 text-lg font-bold text-foreground mb-4', isTelugu && 'font-telugu')}>
                <div className="h-8 w-8 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <FlaskConical className="h-5 w-5" />
                </div>
                <span>{t('herbs.preparations')}</span>
              </h2>
              <ul className="space-y-3">
                {herb.commonPreparations?.map((item: any, idx: number) => (
                  <li key={idx} className={cn('flex gap-3 text-sm text-foreground/85 leading-relaxed', isTelugu && lang === 'te' && 'font-telugu')}>
                    <span className="h-5 w-5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      •
                    </span>
                    <span>{item[lang] || item.en}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>

        {/* 2-Column Grid: Food Uses & Cultural History */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Food Uses */}
          {herb.foodUses && (
            <section className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm">
              <h2 className={cn('flex items-center gap-2.5 text-lg font-bold text-foreground mb-3', isTelugu && 'font-telugu')}>
                <div className="h-8 w-8 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Leaf className="h-5 w-5" />
                </div>
                <span>{t('herbs.foodUses')}</span>
              </h2>
              <p className={cn('text-sm leading-relaxed text-foreground/85', isTelugu && lang === 'te' && 'font-telugu')}>
                {herb.foodUses[lang] || herb.foodUses.en}
              </p>
            </section>
          )}

          {/* Cultural History */}
          {herb.culturalHistory && (
            <section className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm">
              <h2 className={cn('flex items-center gap-2.5 text-lg font-bold text-foreground mb-3', isTelugu && 'font-telugu')}>
                <div className="h-8 w-8 rounded-xl bg-indigo-500/15 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Calendar className="h-5 w-5" />
                </div>
                <span>{t('herbs.culturalHistory')}</span>
              </h2>
              <p className={cn('text-sm leading-relaxed text-foreground/85', isTelugu && lang === 'te' && 'font-telugu')}>
                {herb.culturalHistory[lang] || herb.culturalHistory.en}
              </p>
            </section>
          )}
        </div>

        {/* Growing & Storage Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {herb.growingInfo && (
            <section className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm">
              <h2 className={cn('flex items-center gap-2.5 text-lg font-bold text-foreground mb-3', isTelugu && 'font-telugu')}>
                <div className="h-8 w-8 rounded-xl bg-green-500/15 flex items-center justify-center text-green-600 dark:text-green-400">
                  <Sprout className="h-5 w-5" />
                </div>
                <span>{t('herbs.growingInfo')}</span>
              </h2>
              <p className={cn('text-sm leading-relaxed text-foreground/85', isTelugu && lang === 'te' && 'font-telugu')}>
                {herb.growingInfo[lang] || herb.growingInfo.en}
              </p>
            </section>
          )}

          {herb.storageInfo && (
            <section className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm">
              <h2 className={cn('flex items-center gap-2.5 text-lg font-bold text-foreground mb-3', isTelugu && 'font-telugu')}>
                <div className="h-8 w-8 rounded-xl bg-blue-500/15 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Info className="h-5 w-5" />
                </div>
                <span>{t('herbs.storageInfo')}</span>
              </h2>
              <p className={cn('text-sm leading-relaxed text-foreground/85', isTelugu && lang === 'te' && 'font-telugu')}>
                {herb.storageInfo[lang] || herb.storageInfo.en}
              </p>
            </section>
          )}
        </div>

        {/* Safety & Precaution Guidelines */}
        <section className="rounded-2xl border border-amber-500/30 bg-amber-500/5 dark:bg-amber-950/20 p-6 sm:p-7 shadow-sm">
          <h2 className={cn('flex items-center gap-2.5 text-lg font-bold text-amber-700 dark:text-amber-400 mb-3', isTelugu && 'font-telugu')}>
            <AlertTriangle className="h-5 w-5" />
            <span>{t('herbs.safetyInfo')}</span>
          </h2>
          <p className={cn('text-sm leading-relaxed text-foreground/85 mb-4', isTelugu && lang === 'te' && 'font-telugu')}>
            {herb.safetyInfo[lang] || herb.safetyInfo.en}
          </p>

          {herb.interactions && (
            <div className="rounded-xl bg-background/80 border border-amber-500/20 p-4 mb-4">
              <p className={cn('text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1', isTelugu && 'font-telugu')}>
                <ShieldCheck className="h-3.5 w-3.5" />
                {lang === 'te' ? 'ఔషధ పరస్పర చర్యల హెచ్చరిక' : 'Medication Interaction Warning'}
              </p>
              <p className={cn('text-xs sm:text-sm text-foreground/80 leading-relaxed', isTelugu && lang === 'te' && 'font-telugu')}>
                {herb.interactions[lang] || herb.interactions.en}
              </p>
            </div>
          )}

          {herb.whenToConsult && (
            <div className="rounded-xl bg-background/80 border border-border/60 p-4">
              <p className={cn('text-xs font-bold text-foreground uppercase tracking-wider mb-1', isTelugu && 'font-telugu')}>
                {lang === 'te' ? 'వైద్య నిపుణులను ఎప్పుడు సంప్రదించాలి' : 'When to Consult a Healthcare Professional'}
              </p>
              <p className={cn('text-xs sm:text-sm text-muted-foreground leading-relaxed', isTelugu && lang === 'te' && 'font-telugu')}>
                {herb.whenToConsult[lang] || herb.whenToConsult.en}
              </p>
            </div>
          )}
        </section>

        {/* Classical References */}
        {herb.references && herb.references.length > 0 && (
          <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
            <h2 className={cn('text-base font-bold text-foreground mb-3 flex items-center gap-2', isTelugu && 'font-telugu')}>
              <Layers className="h-4 w-4 text-primary" />
              <span>{t('herbs.references')}</span>
            </h2>
            <ul className="space-y-2">
              {herb.references.map((ref, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full bg-primary/10 text-primary font-semibold text-[10px] flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <span>{ref}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Share Section */}
        <div className="pt-2">
          <ShareButtons
            title={lang === 'te' ? `${herb.teluguName} — ${t('brand.name')}` : `${herb.commonName} — ${t('brand.name')}`}
            text={herb.introduction[lang] || herb.introduction.en}
          />
        </div>

        {/* Standard Medical Disclaimer */}
        <Disclaimer variant="full" />

        {/* Related Herbs Section */}
        {relatedHerbs.length > 0 && (
          <section className="pt-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className={cn('text-xl font-bold text-foreground', isTelugu && 'font-telugu')}>
                {lang === 'te' ? 'సంబంధిత ఆయుర్వేద మూలికలు' : 'Related Ayurvedic Herbs'}
              </h2>
              <Link href="/herbs" className="text-xs font-semibold text-primary hover:underline">
                {lang === 'te' ? 'అన్నీ చూడండి →' : 'View All →'}
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedHerbs.map((h) => (
                <HerbCard key={h.slug} herb={h} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

