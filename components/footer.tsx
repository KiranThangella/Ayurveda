'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { Leaf, Mail } from 'lucide-react';

export function Footer() {
  const { t, isTelugu } = useLanguage();

  const sections = [
    {
      title: t('nav.explore'),
      links: [
        { href: '/explore', label: t('section.explore') },
        { href: '/herbs', label: t('nav.herbs') },
        { href: '/ebooks', label: t('nav.ebooks') },
        { href: '/dosha', label: t('nav.dosha') },
      ],
    },
    {
      title: t('nav.daily'),
      links: [
        { href: '/daily', label: t('daily.title') },
        { href: '/search', label: t('nav.search') },
        { href: '/library', label: t('nav.library') },
      ],
    },
    {
      title: t('nav.login'),
      links: [
        { href: '/login', label: t('auth.login') },
        { href: '/signup', label: t('auth.signup') },
        { href: '/admin', label: t('nav.admin') },
      ],
    },
  ];

  return (
    <footer className="border-t border-border/60 bg-muted/30 mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Leaf className="h-4 w-4" />
              </div>
              <span className={cn('text-sm font-bold', isTelugu && 'font-telugu')}>
                {t('brand.name')}
              </span>
            </Link>
            <p className={cn('text-xs text-muted-foreground leading-relaxed', isTelugu && 'font-telugu')}>
              {t('disclaimer.short')}
            </p>
          </div>

          {/* Link sections */}
          {sections.map((section) => (
            <div key={section.title}>
              <h3 className={cn('text-xs font-semibold uppercase tracking-wider text-foreground mb-3', isTelugu && 'font-telugu')}>
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={cn(
                        'text-xs text-muted-foreground hover:text-foreground transition-colors',
                        isTelugu && 'font-telugu'
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className={cn('text-xs text-muted-foreground', isTelugu && 'font-telugu')}>
            © {new Date().getFullYear()} {t('brand.name')}. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Mail className="h-3.5 w-3.5" />
            <span>hello@evergreenayurveda.com</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
