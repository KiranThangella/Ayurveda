'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';
import { Disclaimer } from '@/components/disclaimer';
import { Leaf, Mail, Lock, User, ArrowRight, Globe, Loader2 } from 'lucide-react';

export default function SignupPage() {
  const { t, lang, setLang, isTelugu } = useLanguage();
  const { signUpWithPassword, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [prefLang, setPrefLang] = useState<'en' | 'te'>('en');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleSignup = async () => {
    if (!email || !password) {
      setError(lang === 'te' ? 'ఇమెయిల్ మరియు పాస్‌వర్డ్ ఇవ్వండి' : 'Enter email and password');
      return;
    }
    if (password.length < 6) {
      setError(lang === 'te' ? 'పాస్‌వర్డ్ కనీసం 6 అక్షరాలు ఉండాలి' : 'Password must be at least 6 characters');
      return;
    }
    setSubmitting(true);
    setError(null);
    const { error: err } = await signUpWithPassword(email, password, name);
    setSubmitting(false);
    if (err) {
      setError(err);
      return;
    }
    // Supabase may require email confirmation before a session exists — either way,
    // tell the user to check their inbox, then send them to login.
    setDone(true);
  };

  const handleGoogle = async () => {
    setError(null);
    const { error: err } = await signInWithGoogle();
    if (err) setError(err);
  };

  return (
    <div className="animate-fade-in min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground mb-4">
            <Leaf className="h-6 w-6" />
          </div>
          <h1 className={cn('text-2xl font-bold tracking-tight font-display', isTelugu && 'font-telugu')}>{t('auth.signup')}</h1>
          <p className={cn('mt-1 text-sm text-muted-foreground', isTelugu && 'font-telugu')}>
            {t('brand.tagline')}
          </p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-6 sm:p-8 shadow-soft">
          {done ? (
            <div className="text-center py-4">
              <p className={cn('text-sm font-medium mb-2', isTelugu && 'font-telugu')}>
                {lang === 'te' ? 'ఖాతా సృష్టించబడింది!' : 'Account created!'}
              </p>
              <p className={cn('text-xs text-muted-foreground mb-4', isTelugu && 'font-telugu')}>
                {lang === 'te'
                  ? 'కన్ఫర్మేషన్ కోసం మీ ఇమెయిల్ చూడండి, తర్వాత లాగిన్ చేయండి.'
                  : 'Check your email to confirm your account, then log in.'}
              </p>
              <Link href="/login" className="text-primary text-sm font-medium hover:underline">
                {t('auth.login')}
              </Link>
            </div>
          ) : (
          <>
          {/* Google login */}
          <button
            onClick={handleGoogle}
            className={cn('w-full flex items-center justify-center gap-2 rounded-lg border border-border/60 py-2.5 text-sm font-medium hover:bg-muted/60 transition-colors mb-4', isTelugu && 'font-telugu')}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {t('auth.google')}
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border/60" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-card px-2 text-muted-foreground">or</span></div>
          </div>

          <div className="space-y-4">
            <div>
              <label className={cn('block text-xs font-medium text-muted-foreground mb-1.5', isTelugu && 'font-telugu')}>{t('auth.name')}</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary"
                  placeholder={lang === 'te' ? 'మీ పేరు' : 'Your name'}
                />
              </div>
            </div>
            <div>
              <label className={cn('block text-xs font-medium text-muted-foreground mb-1.5', isTelugu && 'font-telugu')}>{t('auth.email')}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary"
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <div>
              <label className={cn('block text-xs font-medium text-muted-foreground mb-1.5', isTelugu && 'font-telugu')}>{t('auth.password')}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <div>
              <label className={cn('block text-xs font-medium text-muted-foreground mb-1.5', isTelugu && 'font-telugu')}>{t('auth.languagePref')}</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setPrefLang('en')}
                  className={cn('rounded-lg border py-2.5 text-sm font-medium transition-all flex items-center justify-center gap-2', prefLang === 'en' ? 'border-primary bg-primary/10 text-primary' : 'border-border/60 text-muted-foreground')}
                >
                  <Globe className="h-3.5 w-3.5" />
                  English
                </button>
                <button
                  onClick={() => setPrefLang('te')}
                  className={cn('rounded-lg border py-2.5 text-sm font-medium transition-all flex items-center justify-center gap-2', prefLang === 'te' ? 'border-primary bg-primary/10 text-primary' : 'border-border/60 text-muted-foreground', 'font-telugu')}
                >
                  <Globe className="h-3.5 w-3.5" />
                  తెలుగు
                </button>
              </div>
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
            <button
              onClick={handleSignup}
              disabled={submitting}
              className={cn('w-full flex items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-soft hover:shadow-card transition-all disabled:opacity-60', isTelugu && 'font-telugu')}
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <>{t('auth.signupBtn')}<ArrowRight className="h-4 w-4" /></>}
            </button>
          </div>

          <p className={cn('mt-4 text-center text-xs text-muted-foreground', isTelugu && 'font-telugu')}>
            {t('auth.haveAccount')}{' '}
            <Link href="/login" className="text-primary font-medium hover:underline">
              {t('auth.login')}
            </Link>
          </p>
          </>
          )}
        </div>

        <div className="mt-6">
          <Disclaimer variant="short" />
        </div>
      </div>
    </div>
  );
}
