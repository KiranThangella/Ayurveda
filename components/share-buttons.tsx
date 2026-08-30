'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { Share2, MessageCircle, Facebook, Twitter, Copy, Check } from 'lucide-react';

interface ShareButtonsProps {
  title: string;
  text?: string;
  url?: string;
  className?: string;
}

export function ShareButtons({ title, text, url, className }: ShareButtonsProps) {
  const { t, isTelugu } = useLanguage();
  const [copied, setCopied] = useState(false);
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const shareText = text || title;

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(`${shareText}\n\n${shareUrl}`);
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  const handleFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&t=${encodeURIComponent(title)}`, '_blank');
  };

  const handleX = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className={cn('flex items-center gap-2 flex-wrap', className)}>
      <span className={cn('text-xs font-medium text-muted-foreground flex items-center gap-1', isTelugu && 'font-telugu')}>
        <Share2 className="h-3.5 w-3.5" />
        {t('share.title')}
      </span>
      <button
        onClick={handleWhatsApp}
        className="flex items-center gap-1.5 rounded-md bg-green-600/90 px-2.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-green-600"
        aria-label={t('share.whatsapp')}
      >
        <MessageCircle className="h-3.5 w-3.5" />
        <span className={isTelugu ? 'font-telugu' : ''}>{t('share.whatsapp')}</span>
      </button>
      <button
        onClick={handleFacebook}
        className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600/90 text-white transition-colors hover:bg-blue-600"
        aria-label={t('share.facebook')}
      >
        <Facebook className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={handleX}
        className="flex h-8 w-8 items-center justify-center rounded-md bg-foreground/90 text-background transition-colors hover:bg-foreground"
        aria-label={t('share.x')}
      >
        <Twitter className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={handleCopy}
        className="flex items-center gap-1.5 rounded-md border border-border/60 px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/60"
        aria-label={t('share.copy')}
      >
        {copied ? <Check className="h-3.5 w-3.5 text-accent" /> : <Copy className="h-3.5 w-3.5" />}
        <span className={isTelugu ? 'font-telugu' : ''}>{copied ? t('share.copied') : t('share.copy')}</span>
      </button>
    </div>
  );
}
