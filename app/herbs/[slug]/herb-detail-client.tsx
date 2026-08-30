'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { getHerbBySlug, herbs as staticHerbs } from '@/lib/data/herbs';
import { fetchGeneratedHerbBySlug, fetchGeneratedHerbs } from '@/lib/data/herbs-remote';
import type { Herb } from '@/lib/types';
import { Disclaimer } from '@/components/disclaimer';
import { ShareButtons } from '@/components/share-buttons';
import { HerbCard } from '@/components/herb-card';
import { ArrowLeft, Sprout, Beaker, FlaskConical, BookOpen, Leaf, AlertTriangle, Info, Loader2 } from 'lucide-react';

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
        <div className="min-h-[50vh] flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      );
    }
    return notFound();
  }

  const allHerbs = [...staticHerbs, ...relatedGenerated.filter((g) => !staticHerbs.some((s) => s.slug === g.slug))];
  const relatedHerbs = allHerbs.filter((h) => h.slug !== herb.slug).slice(0, 4);

  const sections = [
    { icon: Sprout, title: t('herbs.traditionalUses'), content: herb.traditionalUses, list: true },
    { icon: FlaskConical, title: t('herbs.preparations'), content: herb.commonPreparations, list: true },
    { icon: Leaf, title: t('herbs.foodUses'), content: herb.foodUses[lang] || herb.foodUses.en },
    { icon: BookOpen, title: t('herbs.culturalHistory'), content: herb.culturalHistory[lang] || herb.culturalHistory.en },
    { icon: Sprout, title: t('herbs.growingInfo'), content: herb.growingInfo[lang] || herb.growingInfo.en },
    { icon: Info, title: t('herbs.storageInfo'), content: herb.storageInfo[lang] || herb.storageInfo.en },
  ];

  return (
    <div className="animate-fade-in">
      {/* Hero header */}
      <div className="relative bg-gradient-to-br from-accent/8 via-leaf/5 to-primary/8 border-b border-border/40">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
          <Link
            href="/herbs"
            className={cn('inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6', isTelugu && 'font-telugu')}
          >
            <ArrowLeft className="h-4 w-4" />
            {t('nav.herbs')}
          </Link>

          <div className="flex items-start gap-6">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary overflow-hidden">
              {herb.imageUrl ? (
                <img src={herb.imageUrl} alt={herb.commonName} className="h-full w-full object-cover" />
              ) : (
                <Sprout className="h-10 w-10" />
              )}
            </div>
            <div className="min-w-0">
              <h1 className={cn('text-2xl sm:text-3xl font-bold tracking-tight', isTelugu && lang === 'te' && 'font-telugu')}>
                {lang === 'te' ? herb.teluguName : herb.commonName}
              </h1>
              <p className="mt-1 text-sm italic text-muted-foreground">{herb.botanicalName}</p>

              {/* Name grid */}
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: t('herbs.commonName'), value: herb.commonName },
                  { label: t('herbs.teluguName'), value: herb.teluguName },
                  { label: t('herbs.sanskritName'), value: herb.sanskritName },
                  { label: t('herbs.botanicalName'), value: herb.botanicalName },
                ].map((item) => (
                  <div key={item.label}>
                    <dt className={cn('text-[10px] font-semibold uppercase tracking-wider text-muted-foreground', isTelugu && 'font-telugu')}>{item.label}</dt>
                    <dd className={cn('text-sm font-medium text-foreground', isTelugu && lang === 'te' && 'font-telugu')}>{item.value}</dd>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Regional names */}
        {herb.regionalNames.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {herb.regionalNames.map((rn) => (
              <span key={rn.language} className="rounded-md bg-muted/60 px-3 py-1 text-xs">
                <span className="text-muted-foreground">{rn.language}: </span>
                <span className="font-medium text-foreground">{rn.name}</span>
              </span>
            ))}
          </div>
        )}

        {/* Introduction */}
        <section>
          <p className={cn('text-base leading-relaxed text-foreground/90', isTelugu && lang === 'te' && 'font-telugu')}>
            {herb.introduction[lang] || herb.introduction.en}
          </p>
        </section>

        {/* Traditional Ayurveda description */}
        <section className="rounded-xl border border-border/60 bg-card p-6 shadow-soft">
          <h2 className={cn('flex items-center gap-2 text-lg font-bold mb-3', isTelugu && 'font-telugu')}>
            <BookOpen className="h-5 w-5 text-primary" />
            {lang === 'te' ? 'ఆయుర్వేద సంప్రదాయ వర్ణన' : 'Traditional Ayurveda Perspective'}
          </h2>
          <p className={cn('text-sm leading-relaxed text-foreground/80', isTelugu && lang === 'te' && 'font-telugu')}>
            {herb.traditionalDescription[lang] || herb.traditionalDescription.en}
          </p>
        </section>

        {/* Content sections */}
        {sections.map((section, i) => {
          const Icon = section.icon;
          const content = section.content as any;
          return (
            <section key={i}>
              <h2 className={cn('flex items-center gap-2 text-lg font-bold mb-3', isTelugu && 'font-telugu')}>
                <Icon className="h-5 w-5 text-accent" />
                {section.title}
              </h2>
              {section.list && Array.isArray(content) ? (
                <ul className="space-y-2">
                  {content.map((item: any, idx: number) => (
                    <li key={idx} className={cn('flex gap-2 text-sm text-foreground/80 leading-relaxed', isTelugu && lang === 'te' && 'font-telugu')}>
                      <span className="text-accent mt-0.5 shrink-0">•</span>
                      <span>{item[lang] || item.en}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={cn('text-sm leading-relaxed text-foreground/80', isTelugu && lang === 'te' && 'font-telugu')}>
                  {content}
                </p>
              )}
            </section>
          );
        })}

        {/* Safety info */}
        <section className="rounded-xl border border-destructive/20 bg-destructive/5 p-6">
          <h2 className={cn('flex items-center gap-2 text-lg font-bold mb-3 text-destructive', isTelugu && 'font-telugu')}>
            <AlertTriangle className="h-5 w-5" />
            {t('herbs.safetyInfo')}
          </h2>
          <p className={cn('text-sm leading-relaxed text-foreground/80 mb-3', isTelugu && lang === 'te' && 'font-telugu')}>
            {herb.safetyInfo[lang] || herb.safetyInfo.en}
          </p>
          {herb.interactions && (
            <div className="mt-3 rounded-lg bg-destructive/10 p-3">
              <p className={cn('text-xs font-semibold text-destructive mb-1', isTelugu && 'font-telugu')}>
                {lang === 'te' ? 'పరస్పర చర్య హెచ్చరిక' : 'Interaction Warning'}
              </p>
              <p className={cn('text-xs text-foreground/70', isTelugu && lang === 'te' && 'font-telugu')}>
                {herb.interactions[lang] || herb.interactions.en}
              </p>
            </div>
          )}
          <div className="mt-3">
            <p className={cn('text-xs font-semibold text-foreground mb-1', isTelugu && 'font-telugu')}>
              {lang === 'te' ? 'వైద్య నిపుణులను సంప్రదించండి' : 'When to Consult a Healthcare Professional'}
            </p>
            <p className={cn('text-xs text-foreground/70', isTelugu && lang === 'te' && 'font-telugu')}>
              {herb.whenToConsult[lang] || herb.whenToConsult.en}
            </p>
          </div>
        </section>

        {/* References */}
        <section>
          <h2 className={cn('text-lg font-bold mb-3', isTelugu && 'font-telugu')}>{t('herbs.references')}</h2>
          <ul className="space-y-1.5">
            {herb.references.map((ref, i) => (
              <li key={i} className="text-xs text-muted-foreground flex gap-2">
                <span className="text-primary shrink-0">{i + 1}.</span>
                <span>{ref}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Share */}
        <div className="pt-4 border-t border-border/40">
          <ShareButtons
            title={lang === 'te' ? `${herb.teluguName} — ${t('brand.name')}` : `${herb.commonName} — ${t('brand.name')}`}
            text={herb.introduction[lang] || herb.introduction.en}
          />
        </div>

        <Disclaimer variant="full" />

        {/* Related herbs */}
        <section className="pt-8">
          <h2 className={cn('text-xl font-bold mb-4', isTelugu && 'font-telugu')}>
            {lang === 'te' ? 'సంబంధిత మూలికలు' : 'Related Herbs'}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {relatedHerbs.map((h) => (
              <HerbCard key={h.slug} herb={h} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
