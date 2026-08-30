'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { Home, Compass, Search, Library, User } from 'lucide-react';

export function BottomNav() {
  const { t, isTelugu } = useLanguage();
  const pathname = usePathname();

  const items = [
    { href: '/', icon: Home, label: t('nav.home') },
    { href: '/explore', icon: Compass, label: t('nav.explore') },
    { href: '/search', icon: Search, label: t('nav.search') },
    { href: '/library', icon: Library, label: t('nav.library') },
    { href: '/login', icon: User, label: t('nav.profile') },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-t border-border/60">
      <div className="flex items-center justify-around h-16 px-2">
        {items.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon className={cn('h-5 w-5', isActive && 'scale-110')} />
              <span className={cn('text-[10px] font-medium', isTelugu && 'font-telugu')}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
