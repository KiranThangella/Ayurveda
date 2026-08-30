'use client';

import { useLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { AlertCircle, Info, ShieldAlert } from 'lucide-react';

interface DisclaimerProps {
  variant?: 'short' | 'full' | 'warning';
  className?: string;
}

export function Disclaimer({ variant = 'short', className }: DisclaimerProps) {
  const { t, isTelugu } = useLanguage();
  const text = variant === 'full' ? t('disclaimer.full') : variant === 'warning' ? t('disclaimer.warning') : t('disclaimer.short');
  const Icon = variant === 'warning' ? ShieldAlert : variant === 'full' ? Info : AlertCircle;

  return (
    <div
      className={cn(
        'flex gap-3 rounded-lg border p-3 text-xs',
        variant === 'warning'
          ? 'border-destructive/30 bg-destructive/5 text-foreground/80'
          : 'border-border/60 bg-muted/40 text-muted-foreground',
        className
      )}
    >
      <Icon className={cn('h-4 w-4 shrink-0 mt-0.5', variant === 'warning' ? 'text-destructive' : 'text-muted-foreground')} />
      <p className={cn('leading-relaxed', isTelugu && 'font-telugu')}>{text}</p>
    </div>
  );
}
