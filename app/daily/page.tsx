'use client';

import { useLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { DailyWisdomCard } from '@/components/daily-wisdom-card';
import { Disclaimer } from '@/components/disclaimer';

export default function DailyPage() {
  const { t, isTelugu } = useLanguage();

  return (
    <div className="animate-fade-in">
      <div className="bg-hero-glow border-b border-border/40">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 text-center">
          <h1 className={cn('text-3xl sm:text-4xl font-bold tracking-tight font-display', isTelugu && 'font-telugu')}>
            {t('daily.title')}
          </h1>
          <p className={cn('mt-2 text-sm text-muted-foreground', isTelugu && 'font-telugu')}>
            {t('brand.tagline')}
          </p>
        </div>
      </div>

      <DailyWisdomCard />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-8">
        <Disclaimer variant="short" />
      </div>
    </div>
  );
}
