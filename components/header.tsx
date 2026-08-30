'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';
import { Leaf, Menu, X, Search, Globe } from 'lucide-react';

export function Header() {
  const { t, lang, setLang, isTelugu } = useLanguage();
  const { user, isAdmin, signOut } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { href: '/explore', label: t('nav.explore') },
    { href: '/herbs', label: t('nav.herbs') },
    { href: '/ebooks', label: t('nav.ebooks') },
    { href: '/dosha', label: t('nav.dosha') },
    { href: '/daily', label: t('nav.daily') },
  ];

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-background/85 backdrop-blur-md border-b border-border/60 shadow-soft'
          : 'bg-transparent'
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-soft transition-transform group-hover:scale-105">
              <Leaf className="h-5 w-5" />
            </div>
            <div className="hidden sm:flex flex-col leading-none">
              <span className={cn('text-sm font-bold tracking-tight', isTelugu && 'font-telugu')}>
                {t('brand.name')}
              </span>
              <span className="text-[10px] text-muted-foreground">{t('brand.tagline')}</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/60',
                  isTelugu && 'font-telugu'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <Link
              href="/search"
              className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/60"
              aria-label={t('nav.search')}
            >
              <Search className="h-5 w-5" />
            </Link>

            {/* Language toggle */}
            <button
              onClick={() => setLang(isTelugu ? 'en' : 'te')}
              className="flex items-center gap-1.5 rounded-md border border-border/60 px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground hover:border-border"
              aria-label="Switch language"
            >
              <Globe className="h-3.5 w-3.5" />
              <span>{isTelugu ? 'EN' : 'TE'}</span>
            </button>

            {user ? (
              <div className="hidden md:flex items-center gap-2">
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="rounded-md border border-primary/40 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/10"
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={() => signOut().then(() => router.push('/'))}
                  className="rounded-md border border-border/60 px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted/60"
                >
                  {lang === 'te' ? 'లాగ్ అవుట్' : 'Sign out'}
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden md:block rounded-md border border-border/60 px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted/60"
              >
                {t('nav.login')}
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted/60"
              aria-label="Menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-border/60 bg-background/95 backdrop-blur-md animate-fade-in">
          <nav className="mx-auto max-w-7xl px-4 py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'rounded-md px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted/60',
                  isTelugu && 'font-telugu'
                )}
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-md border border-primary/40 px-3 py-2.5 text-sm font-semibold text-primary text-center mt-1"
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={() => { signOut(); setMobileOpen(false); router.push('/'); }}
                  className="rounded-md border border-border/60 px-3 py-2.5 text-sm font-semibold text-foreground text-center mt-1"
                >
                  {lang === 'te' ? 'లాగ్ అవుట్' : 'Sign out'}
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="rounded-md border border-border/60 px-3 py-2.5 text-sm font-semibold text-foreground text-center mt-1"
              >
                {t('nav.login')}
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
