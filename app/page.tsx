'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { categories } from '@/lib/data/categories';
import { herbs } from '@/lib/data/herbs';
import { ebooks, getFeaturedEbooks, getTrendingEbooks, getNewEbooks, getTeluguEbooks, getEnglishEbooks } from '@/lib/data/ebooks';
import { EbookCard, EbookRow } from '@/components/ebook-card';
import { HerbCard } from '@/components/herb-card';
import { DailyWisdomCard } from '@/components/daily-wisdom-card';
import { Disclaimer } from '@/components/disclaimer';
import * as Icons from 'lucide-react';

export default function HomePage() {
  const { t, lang, isTelugu } = useLanguage();
  const featured = getFeaturedEbooks();
  const trending = getTrendingEbooks();
  const newEbooks = getNewEbooks();
  const teluguEbooks = getTeluguEbooks();
  const englishEbooks = getEnglishEbooks();
  const popularHerbs = herbs.slice(0, 6);

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-hero-glow border-b border-border/40">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/80" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: text */}
            <div className="text-center lg:text-left animate-fade-up">
              {/* Tagline */}
              <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 backdrop-blur-sm px-4 py-1.5 mb-6">
                <span className="flex h-2 w-2 rounded-full bg-accent animate-pulse" />
                <span className={cn('text-xs font-medium text-muted-foreground', isTelugu && 'font-telugu')}>
                  {t('brand.tagline')}
                </span>
              </div>

              <h1 className={cn(
                'text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-balance font-display',
                isTelugu && 'font-telugu'
              )}>
                {t('hero.title')}
              </h1>

              <p className={cn(
                'mt-5 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0 text-pretty',
                isTelugu && 'font-telugu'
              )}>
                {t('hero.subtitle')}
              </p>

              {/* CTAs */}
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link
                  href="/explore"
                  className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-card transition-all hover:shadow-glow hover:scale-[1.02]"
                >
                  <span className={isTelugu ? 'font-telugu' : ''}>{t('hero.cta.explore')}</span>
                </Link>
                <Link

                  href="/ebooks"
                  className="inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-semibold text-primary hover:underline"
                >
                  <span className={isTelugu ? 'font-telugu' : ''}>{t('hero.cta.ebooks')}</span>
                </Link>
              </div>
            </div>

            {/* Right: visual */}
            <div className="hidden lg:flex relative animate-scale-in" style={{ animationDelay: '200ms' }}>
              <div className="relative w-full aspect-square max-w-md mx-auto">
                {/* Decorative botanical arrangement */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-accent/15 via-gold/8 to-primary/10 blur-3xl" />

                {/* Center emblem */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <div className="w-64 h-64 rounded-full border-2 border-primary/15 flex items-center justify-center">
                      <div className="w-48 h-48 rounded-full border border-accent/20 flex items-center justify-center bg-card/40 backdrop-blur-sm shadow-glow">
                        <Icons.Leaf className="h-20 w-20 text-primary/60" strokeWidth={1.2} />
                      </div>
                    </div>

                    {/* Orbiting elements */}
                    {[
                      { icon: Icons.Sprout, angle: 0, color: 'text-accent' },
                      { icon: Icons.Sun, angle: 90, color: 'text-gold' },
                      { icon: Icons.Sparkles, angle: 180, color: 'text-terracotta' },
                      { icon: Icons.BookOpen, angle: 270, color: 'text-primary' },
                    ].map((item, i) => {
                      const Icon = item.icon;
                      const radius = 128;
                      const x = Math.cos((item.angle * Math.PI) / 180) * radius;
                      const y = Math.sin((item.angle * Math.PI) / 180) * radius;
                      return (
                        <div
                          key={i}
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                          style={{ transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))` }}
                        >
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-card shadow-card border border-border/40">
                            <Icon className={cn('h-5 w-5', item.color)} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Explore Ayurveda - Categories */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h2 className={cn('text-2xl sm:text-3xl font-bold tracking-tight', isTelugu && 'font-telugu')}>
            {t('section.explore')}
          </h2>
          <p className={cn('mt-1 text-sm text-muted-foreground', isTelugu && 'font-telugu')}>
            {t('section.explore.sub')}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {categories.slice(0, 12).map((cat, i) => {
            const Icon = (Icons as any)[cat.icon] || Icons.Circle;
            return (
              <Link
                key={cat.slug}
                href={`/explore/${cat.slug}`}
                className="group flex items-center gap-3 rounded-xl border border-border/60 bg-card p-4 shadow-soft transition-all hover:shadow-card hover:border-primary/30 hover:-translate-y-0.5 animate-fade-up"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground shrink-0">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <h3 className={cn('text-sm font-semibold truncate', isTelugu && 'font-telugu')}>
                    {cat.name[lang]}
                  </h3>
                  <p className={cn('text-xs text-muted-foreground truncate', isTelugu && 'font-telugu')}>
                    {cat.description[lang]}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-4 text-center">
          <Link
            href="/explore"
            className={cn('inline-flex items-center text-sm font-medium text-primary hover:underline', isTelugu && 'font-telugu')}
          >
            {t('common.viewAll')}
          </Link>
        </div>
      </section>

      {/* Featured Ebooks */}
      <EbookRow
        title={t('section.featured')}
        subtitle={t('section.featured.sub')}
        ebooks={featured}
        viewAllHref="/ebooks"
        viewAllLabel={t('card.viewAll')}
      />

      {/* Herbs of India */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-end justify-between mb-5">
          <div>
            <h2 className={cn('text-xl sm:text-2xl font-bold tracking-tight', isTelugu && 'font-telugu')}>
              {t('section.herbs')}
            </h2>
            <p className={cn('mt-1 text-sm text-muted-foreground', isTelugu && 'font-telugu')}>
              {t('section.herbs.sub')}
            </p>
          </div>
          <Link
            href="/herbs"
            className={cn('hidden sm:block text-sm font-medium text-primary hover:underline shrink-0', isTelugu && 'font-telugu')}
          >
            {t('cta.exploreHerbs')}
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {popularHerbs.map((herb, i) => (
            <div key={herb.slug} className="animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
              <HerbCard herb={herb} />
            </div>
          ))}
        </div>
      </section>

      {/* Trending */}
      <EbookRow
        title={t('section.trending')}
        ebooks={trending}
        viewAllHref="/ebooks"
        viewAllLabel={t('card.viewAll')}
      />

      {/* Learn in Telugu / English dual section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Telugu */}
          <Link
            href="/ebooks?lang=te"
            className="group relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/8 via-primary/4 to-accent/8 p-6 transition-all hover:shadow-card hover:-translate-y-0.5"
          >
            <div className="absolute top-4 right-4 font-telugu text-6xl font-bold text-primary/10 select-none">
              ఆ
            </div>
            <h3 className={cn('text-lg font-bold mb-1', isTelugu && 'font-telugu')}>{t('section.telugu')}</h3>
            <p className={cn('text-sm text-muted-foreground mb-4', isTelugu && 'font-telugu')}>{t('section.telugu.sub')}</p>
            <div className="flex gap-2 flex-wrap">
              {teluguEbooks.slice(0, 3).map((eb) => (
                <span key={eb.slug} className={cn('rounded-md bg-card/80 px-2 py-1 text-xs font-medium border border-border/40', isTelugu && 'font-telugu')}>
                  {eb.title.te}
                </span>
              ))}
            </div>
          </Link>

          {/* English */}
          <Link
            href="/ebooks?lang=en"
            className="group relative overflow-hidden rounded-2xl border border-accent/20 bg-gradient-to-br from-accent/8 via-accent/4 to-gold/8 p-6 transition-all hover:shadow-card hover:-translate-y-0.5"
          >
            <div className="absolute top-4 right-4 font-display text-6xl font-bold text-accent/10 select-none">
              A
            </div>
            <h3 className="text-lg font-bold mb-1">{t('section.english')}</h3>
            <p className="text-sm text-muted-foreground mb-4">{t('section.english.sub')}</p>
            <div className="flex gap-2 flex-wrap">
              {englishEbooks.slice(0, 3).map((eb) => (
                <span key={eb.slug} className="rounded-md bg-card/80 px-2 py-1 text-xs font-medium border border-border/40">
                  {eb.title.en}
                </span>
              ))}
            </div>
          </Link>
        </div>
      </section>

      {/* Daily Wisdom */}
      <DailyWisdomCard />

      {/* New Ebooks */}
      <EbookRow
        title={t('section.newEbooks')}
        ebooks={newEbooks.length > 0 ? newEbooks : ebooks.slice(0, 4)}
        viewAllHref="/ebooks"
        viewAllLabel={t('card.viewAll')}
      />

      {/* Why Learn Ayurveda */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h2 className={cn('text-2xl sm:text-3xl font-bold tracking-tight', isTelugu && 'font-telugu')}>
            {t('section.why')}
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Icons.BookOpen, title: lang === 'te' ? 'నిర్మాణాత్మక జ్ఞానం' : 'Structured Knowledge', desc: lang === 'te' ? 'వేలాది సంవత్సరాల ఆయుర్వేద జ్ఞానం వ్యవస్థీకృత రూపంలో' : 'Thousands of years of Ayurveda wisdom, organized and accessible.' },
            { icon: Icons.Languages, title: lang === 'te' ? 'తెలుగు మొదట' : 'Telugu-First', desc: lang === 'te' ? 'స్వచ్ఛమైన తెలుగులో ఆయుర్వేద జ్ఞానం' : 'A native Telugu experience with natural, culturally-rooted content.' },
            { icon: Icons.ShieldCheck, title: lang === 'te' ? 'భద్రతే మొదట' : 'Safety First', desc: lang === 'te' ? 'జాగ్రత్తగా రూపొందించిన విద్యా సమాచారం' : 'Responsible wellness education with clear safety notes and references.' },
            { icon: Icons.Sparkles, title: lang === 'te' ? 'AI సహాయం' : 'AI-Assisted', desc: lang === 'te' ? 'వ్యక్తిగతీకరించిన పుస్తక సృష్టి' : 'Create personalized Ayurveda ebooks tailored to your interests.' },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="rounded-xl border border-border/60 bg-card p-5 shadow-soft transition-shadow hover:shadow-card animate-fade-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent mb-3">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className={cn('text-sm font-bold mb-1', isTelugu && lang === 'te' && 'font-telugu')}>{item.title}</h3>
                <p className={cn('text-xs text-muted-foreground leading-relaxed', isTelugu && lang === 'te' && 'font-telugu')}>{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Start Your Journey CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-terracotta p-8 sm:p-12 text-center">
          <div className="absolute inset-0 bg-hero-glow opacity-30" />
          <div className="relative">
            <h2 className={cn('text-2xl sm:text-3xl font-bold text-primary-foreground mb-3', isTelugu && 'font-telugu')}>
              {t('section.start')}
            </h2>
            <p className={cn('text-sm text-primary-foreground/80 mb-6 max-w-md mx-auto', isTelugu && 'font-telugu')}>
              {t('hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-lg bg-primary-foreground px-6 py-3 text-sm font-semibold text-primary shadow-card transition-all hover:scale-[1.02]"
              >
                <span className={isTelugu ? 'font-telugu' : ''}>{t('cta.getStarted')}</span>
              </Link>
              <Link
                href="/ebooks"
                className="inline-flex items-center justify-center rounded-lg border border-primary-foreground/30 px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary-foreground/10"
              >
                <span className={isTelugu ? 'font-telugu' : ''}>{t('cta.browseAll')}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-8">
        <Disclaimer variant="full" />
      </section>
    </div>
  );
}
