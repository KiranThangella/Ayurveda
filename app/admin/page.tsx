'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/lib/auth-context';
import { getSupabaseClient } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { ebooks } from '@/lib/data/ebooks';
import { herbs } from '@/lib/data/herbs';
import { categories } from '@/lib/data/categories';
import { Disclaimer } from '@/components/disclaimer';
import {
  Users, BookOpen, Sprout, FolderTree, Sparkles, IndianRupee,
  TrendingUp, Search, AlertTriangle, BarChart3, Eye, Clock,
  LayoutDashboard, FileText, Plus, Check, ArrowRight, ArrowLeft,
  RefreshCw, Loader2, Leaf, Mountain, Image as ImageIcon,
  BookText, FileText as FileTextIcon, Download, X, ShieldCheck,
} from 'lucide-react';
import { PRICES, type GenLang } from '@/lib/ebook-generator';
import { CURRICULUM, SERIES, TOTAL_CURRICULUM_STATS, type CurriculumTopic } from '@/lib/data/curriculum';
import { HERB_QUEUE } from '@/lib/data/herb-queue';
import { fetchGeneratedHerbs } from '@/lib/data/herbs-remote';
import type { ChapterSummary, OutlineChapter } from '@/lib/ai/prompts';

interface AiGeneratedChapter {
  chapterNumber: number;
  title: string;
  content: string;
  summary: string;
  wordCount: number;
}

/* Topics now come from the full Ayurveda curriculum (lib/data/curriculum.ts) instead of
   a flat hardcoded list — see the AI Ebook Generator plan discussed with Romio. Every
   topic there carries a `mustCover` list so the outline API can guarantee nothing is
   skipped, and chapter count is curriculum-recommended (not an arbitrary short/medium/long). */



/* ── Nature images ── */
const HERO_IMG = 'https://images.pexels.com/photos/12421351/pexels-photo-12421351.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';
const FOREST_IMG = 'https://images.pexels.com/photos/38499277/pexels-photo-38499277.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';
const LEAVES_IMG = 'https://images.pexels.com/photos/4407161/pexels-photo-4407161.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';
const MOUNTAIN_IMG = 'https://images.pexels.com/photos/10615057/pexels-photo-10615057.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';
const TEA_IMG = 'https://images.pexels.com/photos/11669960/pexels-photo-11669960.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';
const RAIN_LEAVES_IMG = 'https://images.pexels.com/photos/16831414/pexels-photo-16831414.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

/**
 * Supabase JWTs expire (~1hr) and a background browser tab left open for a
 * while can end up holding a stale one in React state — that's what produces
 * an "Unauthorized" error on an action that worked minutes ago. Rather than
 * trusting whatever access_token was captured at the last render, this always
 * asks the Supabase client for the current session right before a request —
 * supabase-js auto-refreshes a token that's near/past expiry, so this reliably
 * returns a valid one (or undefined if truly logged out) without the person
 * having to manually sign out and back in.
 */
async function getFreshAccessToken(): Promise<string | undefined> {
  const { data } = await getSupabaseClient().auth.getSession();
  return data.session?.access_token;
}

type AdminTab = 'overview' | 'generate' | 'ebooks' | 'safety';

export default function AdminPage() {
  const { t, lang, isTelugu } = useLanguage();
  const { user, session, loading, isAdmin, signOut } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<AdminTab>('overview');

  useEffect(() => {
    if (!loading && (!user || isAdmin === false)) {
      router.replace('/login');
    }
  }, [loading, user, isAdmin, router]);

  // Gate everything below on a confirmed admin session — the real check happens
  // server-side (lib/auth-server.ts checks the token against ADMIN_EMAIL), this is
  // just so the dashboard doesn't flash for anyone who isn't the owner account.
  if (loading || !user || isAdmin !== true) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className={cn('text-sm text-muted-foreground', isTelugu && 'font-telugu')}>
          {lang === 'te' ? 'తనిఖీ చేస్తోంది...' : 'Checking access...'}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero banner with nature image */}
      <div className="relative h-48 sm:h-56 overflow-hidden">
        <img
          src={HERO_IMG}
          alt="Lush green forest"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/30 via-primary/40 to-background" />
        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <Leaf className="h-5 w-5 text-white" />
              <span className="text-xs font-semibold uppercase tracking-wider text-white/90">Admin</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <h1 className={cn('text-2xl sm:text-3xl font-bold tracking-tight text-white font-display', isTelugu && 'font-telugu')}>
                {t('admin.title')}
              </h1>
              <div className="flex items-center gap-3">
                <span className="text-xs text-white/80 hidden sm:inline">{user.email}</span>
                <button
                  onClick={() => signOut().then(() => router.replace('/login'))}
                  className="rounded-md border border-white/30 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/10 transition-colors"
                >
                  {lang === 'te' ? 'లాగ్ అవుట్' : 'Sign out'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="sticky top-16 z-30 bg-background/90 backdrop-blur-md border-b border-border/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            {([
              { id: 'overview' as const, label: t('admin.overview'), icon: LayoutDashboard },
              { id: 'generate' as const, label: lang === 'te' ? 'పుస్తక సృష్టి' : 'Generate Ebook', icon: Sparkles },
              { id: 'ebooks' as const, label: lang === 'te' ? 'పుస్తకాలు' : 'Ebooks', icon: BookOpen },
              { id: 'safety' as const, label: t('admin.safetyFlags'), icon: AlertTriangle },
            ]).map((tabItem) => {
              const Icon = tabItem.icon;
              return (
                <button
                  key={tabItem.id}
                  onClick={() => setTab(tabItem.id)}
                  className={cn(
                    'shrink-0 inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors',
                    tab === tabItem.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground',
                    isTelugu && 'font-telugu'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tabItem.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {tab === 'overview' && <OverviewTab lang={lang} isTelugu={isTelugu} t={t} />}
        {tab === 'generate' && <GenerateTab lang={lang} isTelugu={isTelugu} t={t} accessToken={session?.access_token} />}
        {tab === 'ebooks' && <EbooksTab lang={lang} isTelugu={isTelugu} t={t} />}
        {tab === 'safety' && <SafetyTab lang={lang} isTelugu={isTelugu} t={t} accessToken={session?.access_token} />}
      </div>
    </div>
  );
}

/* ───────────── Overview Tab ───────────── */

function OverviewTab({ lang, isTelugu, t }: { lang: 'en' | 'te'; isTelugu: boolean; t: (k: string) => string }) {
  const stats = [
    { label: t('admin.users'), value: '12,847', change: '+8.2%', icon: Users, color: 'text-primary bg-primary/10' },
    { label: t('admin.ebooks'), value: String(ebooks.length), change: '+3', icon: BookOpen, color: 'text-accent bg-accent/10' },
    { label: t('admin.categories'), value: String(categories.length), change: '0', icon: FolderTree, color: 'text-emerald bg-emerald/10' },
    { label: t('admin.aiGenerations'), value: '3,421', change: '+12.5%', icon: Sparkles, color: 'text-leaf bg-leaf/10' },
    { label: t('admin.revenue'), value: '₹2,84,500', change: '+15.3%', icon: IndianRupee, color: 'text-pine bg-pine/10' },
    { label: t('admin.safetyFlags'), value: '3', change: '-2', icon: AlertTriangle, color: 'text-destructive bg-destructive/10' },
  ];

  const popularEbooks = [...ebooks].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 5);
  const popularHerbs = herbs.slice(0, 5);
  const popularSearches = lang === 'te'
    ? ['పసుపు', 'తులసి', 'దినచర్య', 'అశ్వగంధ', 'ఆయుర్వేదం']
    : ['turmeric', 'tulsi', 'dinacharya', 'ashwagandha', 'doshas'];

  return (
    <div className="animate-fade-in space-y-6">
      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="rounded-xl border border-border/60 bg-card p-5 shadow-soft animate-fade-up"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={cn('flex h-10 w-10 items-center justify-center rounded-lg', stat.color)}>
                  <Icon className="h-5 w-5" />
                </span>
                <span className={cn('text-xs font-semibold', stat.change.startsWith('+') ? 'text-accent' : stat.change.startsWith('-') ? 'text-destructive' : 'text-muted-foreground')}>
                  {stat.change}
                </span>
              </div>
              <p className={cn('text-2xl font-bold', isTelugu && 'font-telugu')}>{stat.value}</p>
              <p className={cn('text-xs text-muted-foreground mt-0.5', isTelugu && 'font-telugu')}>{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Nature image banner */}
      <div className="relative rounded-2xl overflow-hidden h-40 sm:h-48">
        <img src={MOUNTAIN_IMG} alt="Misty green mountains" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/60 to-transparent" />
        <div className="relative h-full flex items-center px-6 sm:px-8">
          <div>
            <h2 className={cn('text-lg sm:text-xl font-bold text-white mb-1', isTelugu && 'font-telugu')}>
              {lang === 'te' ? 'ప్రకృతి నుండి ప్రేరణ' : 'Inspired by Nature'}
            </h2>
            <p className={cn('text-sm text-white/80 max-w-md', isTelugu && 'font-telugu')}>
              {lang === 'te' ? 'ఆయుర్వేద జ్ఞానం ప్రకృతి సంబంధాలతో లోతుగా ముడిపడి ఉంది' : 'Ayurvedic wisdom is deeply rooted in our connection with the natural world'}
            </p>
          </div>
        </div>
      </div>

      {/* Two-column: Popular Ebooks + Popular Searches */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border/60 bg-card p-5 shadow-soft">
          <h2 className={cn('flex items-center gap-2 text-sm font-bold mb-4', isTelugu && 'font-telugu')}>
            <TrendingUp className="h-4 w-4 text-primary" />
            {lang === 'te' ? 'ప్రాచుర్యం పుస్తకాలు' : 'Popular Ebooks'}
          </h2>
          <div className="space-y-2">
            {popularEbooks.map((eb, i) => (
              <div key={eb.slug} className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted/40 transition-colors">
                <span className="flex h-7 w-7 items-center justify-center rounded text-xs font-bold bg-primary/10 text-primary shrink-0">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className={cn('text-sm font-medium truncate', isTelugu && lang === 'te' && 'font-telugu')}>{eb.title[lang] || eb.title.en}</p>
                  <p className="text-xs text-muted-foreground">{eb.reviewCount} {lang === 'te' ? 'చదువులు' : 'reads'} • {eb.rating}★</p>
                </div>
                <span className={cn('text-xs shrink-0', eb.isFree ? 'text-accent' : 'text-gold')}>
                  {eb.isFree ? t('card.free') : `₹${eb.price}`}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-card p-5 shadow-soft">
          <h2 className={cn('flex items-center gap-2 text-sm font-bold mb-4', isTelugu && 'font-telugu')}>
            <Search className="h-4 w-4 text-primary" />
            {t('admin.popularSearches')}
          </h2>
          <div className="space-y-2">
            {popularSearches.map((s, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg p-2 hover:bg-muted/40 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded text-xs font-bold bg-accent/10 text-accent shrink-0">{i + 1}</span>
                  <span className={cn('text-sm font-medium', isTelugu && 'font-telugu')}>{s}</span>
                </div>
                <span className="text-xs text-muted-foreground">{[4823, 3641, 2987, 2156, 1893][i]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Herbs + Engagement */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border/60 bg-card p-5 shadow-soft">
          <h2 className={cn('flex items-center gap-2 text-sm font-bold mb-4', isTelugu && 'font-telugu')}>
            <Sprout className="h-4 w-4 text-accent" />
            {lang === 'te' ? 'ఎక్కువ చూసిన మూలికలు' : 'Most Viewed Herbs'}
          </h2>
          <div className="space-y-2">
            {popularHerbs.map((h, i) => (
              <div key={h.slug} className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted/40 transition-colors">
                <span className="flex h-7 w-7 items-center justify-center rounded text-xs font-bold bg-leaf/10 text-leaf shrink-0">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className={cn('text-sm font-medium', isTelugu && lang === 'te' && 'font-telugu')}>{lang === 'te' ? h.teluguName : h.commonName}</p>
                  <p className="text-xs text-muted-foreground italic">{h.sanskritName}</p>
                </div>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {[7821, 6543, 5210, 4387, 3956][i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-card p-5 shadow-soft">
          <h2 className={cn('flex items-center gap-2 text-sm font-bold mb-4', isTelugu && 'font-telugu')}>
            <BarChart3 className="h-4 w-4 text-emerald" />
            {t('admin.engagement')}
          </h2>
          <div className="space-y-3">
            {[
              { label: lang === 'te' ? 'పుస్తక ఓపెన్‌లు' : 'Ebook Opens', value: 24891, max: 30000, color: 'bg-primary' },
              { label: lang === 'te' ? 'పూర్తి చదువు' : 'Reading Completion', value: 18234, max: 30000, color: 'bg-accent' },
              { label: lang === 'te' ? 'AI ఉత్పత్తులు' : 'AI Generations', value: 3421, max: 5000, color: 'bg-emerald' },
              { label: lang === 'te' ? 'కొత్త సైన్‌అప్‌లు' : 'New Signups', value: 847, max: 1500, color: 'bg-leaf' },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className={cn('text-xs font-medium', isTelugu && 'font-telugu')}>{item.label}</span>
                  <span className="text-xs text-muted-foreground">{item.value.toLocaleString()}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className={cn('h-full transition-all', item.color)} style={{ width: `${(item.value / item.max) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────── Generate Tab ───────────── */

/**
 * Runs the same one-step-per-call pipeline as the Cloudflare cron Worker — because
 * this calls the Worker directly, not through a Vercel API route, there's no
 * function-timeout risk at all (Cloudflare's CPU-time billing doesn't count the
 * 15-40s spent waiting on Gemini). Each click of "Run one step" advances whichever
 * job is active by exactly one unit: start a new book, plan its outline, write the
 * next chapter, or finalize metadata. "Auto-run" clicks that same action on a timer
 * until a book completes (or an error needs a human look).
 *
 * The Worker URL and its manual-trigger secret are entered once and kept in this
 * browser's localStorage — never committed to the repo, never sent to Vercel.
 */
function AutomatedTickPanel({ lang, isTelugu }: { lang: 'en' | 'te'; isTelugu: boolean }) {
  const [workerUrl, setWorkerUrl] = useState('');
  const [triggerSecret, setTriggerSecret] = useState('');
  const [savedConfig, setSavedConfig] = useState(false);
  const [running, setRunning] = useState(false);
  const [autoRunning, setAutoRunning] = useState(false);
  const [log, setLog] = useState<{ time: string; text: string; isError: boolean }[]>([]);
  const autoRunRef = useRef(false);

  useEffect(() => {
    const storedUrl = localStorage.getItem('mindwriter_worker_url');
    const storedSecret = localStorage.getItem('mindwriter_worker_secret');
    if (storedUrl) setWorkerUrl(storedUrl);
    if (storedSecret) setTriggerSecret(storedSecret);
    if (storedUrl && storedSecret) setSavedConfig(true);
  }, []);

  const saveConfig = () => {
    if (!workerUrl || !triggerSecret) return;
    localStorage.setItem('mindwriter_worker_url', workerUrl.trim());
    localStorage.setItem('mindwriter_worker_secret', triggerSecret.trim());
    setSavedConfig(true);
  };

  const editConfig = () => setSavedConfig(false);

  const describeResult = (data: Record<string, unknown>): string => {
    if (data.error) return `❌ ${data.error}`;
    if (data.message) return String(data.message);
    if (data.step) {
      const stepLabels: Record<string, string> = {
        job_created: lang === 'te' ? 'కొత్త పుస్తకం మొదలైంది' : 'New book started',
        outline_generated: lang === 'te' ? 'ఔట్‌లైన్ తయారైంది' : 'Outline planned',
        chapter_generated: lang === 'te' ? 'ఒక చాప్టర్ రాయబడింది' : 'Chapter written',
        book_completed: lang === 'te' ? 'పుస్తకం పూర్తయింది! 🎉' : 'Book completed! 🎉',
        retry_scheduled: lang === 'te' ? 'లోపం, మళ్ళీ ప్రయత్నిస్తుంది...' : 'Error, will retry...',
        job_failed: lang === 'te' ? 'జాబ్ ఫెయిల్ అయ్యింది' : 'Job failed',
      };
      const label = stepLabels[data.step as string] || String(data.step);
      // Shows which AI provider actually served this step (gemini vs gemini-2 vs
      // groq vs deepseek etc.) — the fallback chain tries Gemini first every time
      // and only moves on when it fails, so this is how to see whether a
      // fallback key is actually being used or everything's still on Gemini.
      return data.provider ? `${label} (${data.provider})` : label;
    }
    return JSON.stringify(data);
  };

  const runOneTick = useCallback(async (): Promise<{ done: boolean; error: boolean }> => {
    if (!workerUrl || !triggerSecret) return { done: true, error: true };
    setRunning(true);
    try {
      const res = await fetch(workerUrl.trim(), {
        method: 'POST',
        headers: { 'x-trigger-secret': triggerSecret.trim() },
      });
      const text = await res.text();
      let data: Record<string, unknown>;
      try {
        data = JSON.parse(text);
      } catch {
        data = { error: `Worker returned a non-JSON response (status ${res.status}). Check the URL is correct and the Worker is deployed.` };
      }
      const isError = !res.ok || !!data.error;
      setLog((prev) => [{ time: new Date().toLocaleTimeString(), text: describeResult(data), isError }, ...prev].slice(0, 30));
      const finished = isError || data.step === 'book_completed' || !!data.message;
      return { done: finished, error: isError };
    } catch (err) {
      setLog((prev) => [{ time: new Date().toLocaleTimeString(), text: `❌ ${err instanceof Error ? err.message : 'Request failed — check the Worker URL and that CORS is enabled'}`, isError: true }, ...prev].slice(0, 30));
      return { done: true, error: true };
    } finally {
      setRunning(false);
    }
  }, [workerUrl, triggerSecret]);

  const startAutoRun = async () => {
    setAutoRunning(true);
    autoRunRef.current = true;
    while (autoRunRef.current) {
      const { done } = await runOneTick();
      if (done) break;
      await new Promise((r) => setTimeout(r, 2000));
    }
    autoRunRef.current = false;
    setAutoRunning(false);
  };

  const stopAutoRun = () => {
    autoRunRef.current = false;
    setAutoRunning(false);
  };

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 mb-6">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
        <div>
          <h3 className={cn('text-sm font-bold', isTelugu && 'font-telugu')}>
            {lang === 'te' ? 'Cloudflare Worker పైప్‌లైన్ (సిఫారసు చేయబడింది)' : 'Cloudflare Worker pipeline (recommended)'}
          </h3>
          <p className={cn('text-xs text-muted-foreground mt-0.5', isTelugu && 'font-telugu')}>
            {lang === 'te'
              ? 'ఇది నేరుగా మీ Cloudflare Worker ని కాల్ చేస్తుంది — Vercel timeout సమస్య ఇక్కడ రాదు. క్యూరీక్యులం నుండి తదుపరి టాపిక్ ఆటోమేటిక్ గా ఎంపిక అవుతుంది.'
              : "Calls your Cloudflare Worker directly from the browser — no Vercel timeout risk. Picks the next queued topic from the curriculum automatically."}
          </p>
        </div>
      </div>

      {!savedConfig ? (
        <div className="mt-3 space-y-2 max-w-md">
          <input
            type="text"
            value={workerUrl}
            onChange={(e) => setWorkerUrl(e.target.value)}
            placeholder="https://mindwriter-ebook-generator.<subdomain>.workers.dev"
            className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-xs"
          />
          <input
            type="password"
            value={triggerSecret}
            onChange={(e) => setTriggerSecret(e.target.value)}
            placeholder={lang === 'te' ? 'MANUAL_TRIGGER_SECRET' : 'MANUAL_TRIGGER_SECRET'}
            className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-xs"
          />
          <button
            onClick={saveConfig}
            disabled={!workerUrl || !triggerSecret}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-50"
          >
            {lang === 'te' ? 'సేవ్ చేయి (ఈ బ్రౌజర్ లో మాత్రమే)' : 'Save (this browser only)'}
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 flex-wrap">
            {!autoRunning ? (
              <>
                <button
                  onClick={() => runOneTick()}
                  disabled={running}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-primary/40 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/10 disabled:opacity-50 transition-colors"
                >
                  {running ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                  {lang === 'te' ? 'ఒక స్టెప్ రన్ చేయి' : 'Run one step'}
                </button>
                <button
                  onClick={startAutoRun}
                  disabled={running}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-50 transition-colors"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {lang === 'te' ? 'పూర్తి పుస్తకం ఆటో-రన్' : 'Auto-run full book'}
                </button>
              </>
            ) : (
              <button
                onClick={stopAutoRun}
                className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/50 px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors"
              >
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                {lang === 'te' ? 'ఆపు' : 'Stop auto-run'}
              </button>
            )}
            <button
              onClick={editConfig}
              className="text-[11px] text-muted-foreground hover:text-foreground underline"
            >
              {lang === 'te' ? 'Worker URL మార్చు' : 'Change Worker URL'}
            </button>
          </div>

          {log.length > 0 && (
            <div className="mt-3 max-h-56 overflow-y-auto rounded-lg bg-muted/40 p-3 space-y-1.5">
              {log.map((entry, i) => (
                <div key={i} className={cn('text-xs flex gap-2', entry.isError ? 'text-destructive' : 'text-foreground')}>
                  <span className="text-muted-foreground shrink-0">{entry.time}</span>
                  <span className="break-words">{entry.text}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function GenerateTab({ lang, isTelugu, t, accessToken }: { lang: 'en' | 'te'; isTelugu: boolean; t: (k: string) => string; accessToken?: string }) {
  const [step, setStep] = useState(0);
  const [genLang, setGenLang] = useState<'en' | 'te'>('en');
  const [topicId, setTopicId] = useState<string>(CURRICULUM[0].id);
  const [priceIdx, setPriceIdx] = useState(2);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [outline, setOutline] = useState<OutlineChapter[]>([]);
  const [chapters, setChapters] = useState<AiGeneratedChapter[]>([]);  const [activeChapter, setActiveChapter] = useState(0);
  const [generatingChapter, setGeneratingChapter] = useState(-1);
  // Partial chapter text kept between clicks when a chapter needs more than one
  // pass to finish (each click does exactly one Gemini call, so long chapters
  // need 2-3 "Continue" clicks instead of one long request) — keyed by outline
  // index, cleared once that chapter is done.
  const [chapterDrafts, setChapterDrafts] = useState<Record<number, { soFar: string; wordCountSoFar: number }>>({});
  const [genPhase, setGenPhase] = useState<'idle' | 'outline' | 'chapters' | 'meta' | 'done'>('idle');
  const [genError, setGenError] = useState<string | null>(null);
  const [bookMeta, setBookMeta] = useState<{ title: string; subtitle: string; description: string } | null>(null);

  // Every outline/chapter is saved to Supabase (ebooks/ebook_chapters/generation_jobs)
  // the instant it's generated — jobId/ebookId are what let a refreshed page, or a
  // closed-and-reopened tab, find that same in-progress book instead of starting
  // over. Persisted to localStorage (not just React state) so it survives a reload.
  const [jobId, setJobId] = useState<string | null>(null);
  const [ebookId, setEbookId] = useState<string | null>(null);
  const [resumePrompt, setResumePrompt] = useState<{ topicId: string; genLang: 'en' | 'te'; chaptersDone: number; totalChapters: number } | null>(null);

  const selectedTopic = CURRICULUM.find((t2) => t2.id === topicId) || CURRICULUM[0];

  const ACTIVE_JOB_KEY = 'mindwriter_admin_active_job';

  // On first mount, check for a saved in-progress job and offer to continue it
  // rather than silently either resuming or discarding it.
  useEffect(() => {
    (async () => {
      try {
        const raw = localStorage.getItem(ACTIVE_JOB_KEY);
        if (!raw) return;
        const saved = JSON.parse(raw) as { topicId: string; genLang: 'en' | 'te'; jobId: string; ebookId: string };
        const token = await getFreshAccessToken();
        if (!token) return;
        const res = await fetch('/api/admin/ebook/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ topicId: saved.topicId, lang: saved.genLang }),
        });
        const data = await res.json();
        if (data?.jobId === saved.jobId && data.outline && data.chaptersDone < data.outline.length) {
          setResumePrompt({ topicId: saved.topicId, genLang: saved.genLang, chaptersDone: data.chaptersDone, totalChapters: data.outline.length });
        } else {
          localStorage.removeItem(ACTIVE_JOB_KEY);
        }
      } catch {
        // ignore malformed localStorage content or a failed check — not worth surfacing
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  const resumeSavedJob = async () => {
    if (!resumePrompt) return;
    setTopicId(resumePrompt.topicId);
    setGenLang(resumePrompt.genLang);
    setStep(3);
    setResumePrompt(null);
    // The topicId/genLang change triggers the reset effect below, then this
    // loads the actual persisted state right after.
    await loadJobState(resumePrompt.topicId, resumePrompt.genLang);
  };

  const discardSavedJob = () => {
    localStorage.removeItem(ACTIVE_JOB_KEY);
    setResumePrompt(null);
  };

  const loadJobState = async (tId: string, gLang: 'en' | 'te') => {
    const token = await getFreshAccessToken();
    if (!token) return;
    const res = await fetch('/api/admin/ebook/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ topicId: tId, lang: gLang }),
    });
    const data = await res.json();
    if (!res.ok) {
      setGenError(data?.error || 'Failed to load generation state');
      return;
    }
    setJobId(data.jobId);
    setEbookId(data.ebookId);
    setOutline(data.outline || []);
    setChapters(
      (data.chapters || []).map((c: any) => ({
        chapterNumber: c.chapter_number,
        title: c.title,
        content: c.content,
        summary: c.summary,
        wordCount: c.word_count,
      })),
    );
    localStorage.setItem(ACTIVE_JOB_KEY, JSON.stringify({ topicId: tId, genLang: gLang, jobId: data.jobId, ebookId: data.ebookId }));
  };

  useEffect(() => {
    setOutline([]);
    setChapters([]);
    setChapterDrafts({});
    setBookMeta(null);
    setGenPhase('idle');
    setGenError(null);
    setGenerated(false);
    setJobId(null);
    setEbookId(null);
  }, [topicId, genLang]);

  const steps = [
    t('generate.step.language'), t('generate.step.topic'),
    lang === 'te' ? 'ధర' : 'Price', t('generate.step.generate'),
  ];
  const TOTAL_STEPS = 4;

  async function callApi<T>(url: string, body: unknown): Promise<T> {
    const token = await getFreshAccessToken();
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(body),
    });
    const raw = await res.text();
    let json: any;
    try {
      json = JSON.parse(raw);
    } catch {
      // The server returned something that isn't JSON at all — almost always a
      // platform-level error page (e.g. a serverless function timing out and
      // Vercel returning its own generic HTML/text error) rather than a route
      // response. Surface something actionable instead of a raw parse error.
      throw new Error(
        `Server didn't return a valid response (status ${res.status}). This usually means the request took too long and the hosting platform cut it off before the chapter finished — this is common on Vercel's free Hobby plan, which has a short function time limit. Try again, or see the admin chat for how to fix this permanently.`
      );
    }
    if (!res.ok) throw new Error(json?.error || `Request to ${url} failed`);
    return json as T;
  }

  // Three separate, manually-triggered steps — outline first, then the admin
  // picks which chapter to generate (and in what order, and can retry just one),
  // then finalize once every chapter is done. Each is its own request, so one
  // slow/failed chapter never takes the whole book down with it.

  const generateOutlineOnly = async () => {
    setGenerating(true);
    setGenError(null);
    setGenPhase('outline');
    try {
      await loadJobState(selectedTopic.id, genLang);
      setGenPhase('chapters');
    } catch (err) {
      setGenError(err instanceof Error ? err.message : 'Outline generation failed');
      setGenPhase('idle');
    } finally {
      setGenerating(false);
    }
  };

  const generateChapterAt = async (idx: number) => {
    const chapterPlan = outline[idx];
    if (!chapterPlan || !jobId) return;
    setGeneratingChapter(idx);
    setGenError(null);
    try {
      const result = await callApi<
        | { kind: 'done'; chapterNumber: number; title: string; content: string; summary: string; wordCount: number; allComplete: boolean }
        | { kind: 'partial'; chapterNumber: number; title: string; wordCountSoFar: number }
        | { kind: 'nothing_to_do' }
      >('/api/admin/ebook/chapter', { jobId });

      if (result.kind === 'nothing_to_do') return;

      if (result.kind === 'partial') {
        setChapterDrafts((prev) => ({ ...prev, [idx]: { soFar: '', wordCountSoFar: result.wordCountSoFar } }));
        return;
      }

      // result.kind === 'done'
      setChapterDrafts((prev) => {
        const { [idx]: _drop, ...rest } = prev;
        return rest;
      });
      setChapters((prev) => {
        const withoutThis = prev.filter((c) => c.chapterNumber !== result.chapterNumber);
        return [...withoutThis, result].sort((a, b) => a.chapterNumber - b.chapterNumber);
      });
    } catch (err) {
      setGenError(err instanceof Error ? err.message : 'Chapter generation failed');
    } finally {
      setGeneratingChapter(-1);
    }
  };

  const finishBook = async () => {
    if (!jobId) return;
    setGenerating(true);
    setGenError(null);
    setGenPhase('meta');
    try {
      const meta = await callApi<{ ebookId: string; title: string; status: string }>('/api/admin/ebook/finish', { jobId });
      setBookMeta({ title: meta.title, subtitle: '', description: '' });
      setGenPhase('done');
      setGenerated(true);
      localStorage.removeItem(ACTIVE_JOB_KEY);
    } catch (err) {
      setGenError(err instanceof Error ? err.message : 'Finalizing failed');
      setGenPhase('chapters');
    } finally {
      setGenerating(false);
    }
  };

  const regenerateChapter = async (idx: number) => {
    setGeneratingChapter(idx);
    setGenError(null);
    try {
      const chapterPlan = outline[idx];
      const priorChapters: ChapterSummary[] = chapters
        .filter((_, i) => i !== idx)
        .map((c) => ({ chapterNumber: c.chapterNumber, title: c.title, summary: c.summary }));

      // /api/generate/chapter does at most one Gemini call per request now (to stay
      // under Vercel's timeout), so a long chapter needs several requests — loop
      // here automatically rather than making the admin click a button per pass.
      let soFar: string | undefined;
      let final: AiGeneratedChapter | null = null;
      for (let attempt = 0; attempt < 5 && !final; attempt++) {
        const result = await callApi<
          | { done: true; chapterNumber: number; title: string; content: string; summary: string; wordCount: number }
          | { done: false; chapterNumber: number; title: string; soFar: string; wordCountSoFar: number }
        >('/api/generate/chapter', {
          topicId: selectedTopic.id,
          lang: genLang,
          chapterPlan,
          priorChapters,
          totalChapters: outline.length,
          resumeFrom: soFar,
        });
        if (result.done) {
          final = result;
        } else {
          soFar = result.soFar;
        }
      }
      if (!final) throw new Error('Chapter needed more than 5 passes to finish — this is unusual, try again.');
      setChapters((prev) => prev.map((c, i) => (i === idx ? final! : c)));
    } catch (err) {
      setGenError(err instanceof Error ? err.message : 'Regeneration failed');
    } finally {
      setGeneratingChapter(-1);
    }
  };

  const totalWords = chapters.reduce((sum, ch) => sum + ch.wordCount, 0);

  return (
    <div className="animate-fade-in">
      {resumePrompt && (
        <div className="mb-4 rounded-xl border border-primary/40 bg-primary/5 px-4 py-3 flex items-center justify-between flex-wrap gap-3">
          <p className={cn('text-sm font-medium', isTelugu && 'font-telugu')}>
            {lang === 'te'
              ? `మునుపటి పుస్తకం (${resumePrompt.chaptersDone}/${resumePrompt.totalChapters} చాప్టర్లు పూర్తయ్యాయి) — కొనసాగించాలా?`
              : `Previous book in progress (${resumePrompt.chaptersDone}/${resumePrompt.totalChapters} chapters done) — continue it?`}
          </p>
          <div className="flex gap-2 shrink-0">
            <button onClick={resumeSavedJob} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">
              {lang === 'te' ? 'కొనసాగించు' : 'Continue'}
            </button>
            <button onClick={discardSavedJob} className="rounded-lg border border-border/60 px-3 py-1.5 text-xs font-medium">
              {lang === 'te' ? 'వద్దు' : 'Discard'}
            </button>
          </div>
        </div>
      )}
      {/* Header with nature image */}
      <div className="relative rounded-2xl overflow-hidden h-32 mb-6">
        <img src={LEAVES_IMG} alt="Green botanical leaves" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/50 to-accent/30" />
        <div className="relative h-full flex items-center px-6">
          <div>
            <div className="inline-flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-white" />
              <span className="text-xs font-semibold text-white/90">AI Ebook Generator</span>
            </div>
            <h2 className={cn('text-xl font-bold text-white', isTelugu && 'font-telugu')}>
              {genLang === 'te' ? 'పుస్తకం సృష్టించండి' : 'Generate New Ebook'}
            </h2>
          </div>
        </div>
      </div>

      {!generated ? (
        <>
          <AutomatedTickPanel lang={lang} isTelugu={isTelugu} />

          {/* Progress steps */}
          <div className="flex items-center justify-between mb-6 overflow-x-auto scrollbar-hide">
            {steps.map((s, i) => (
              <div key={i} className="flex items-center shrink-0">
                <div className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors',
                  i < step ? 'bg-accent text-white' : i === step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                )}>
                  {i < step ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                {i < steps.length - 1 && <div className={cn('w-6 h-0.5 mx-1', i < step ? 'bg-accent' : 'bg-muted')} />}
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-border/60 bg-card p-6 sm:p-8 shadow-soft mb-4">
            {step === 0 && (
              <div className="animate-fade-in">
                <h3 className={cn('text-lg font-bold mb-4', isTelugu && 'font-telugu')}>{t('generate.step.language')}</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setGenLang('en')} className={cn('rounded-xl border p-5 text-center transition-all', genLang === 'en' ? 'border-primary bg-primary/10' : 'border-border/60 hover:border-primary/30')}>
                    <p className="text-lg font-bold">English</p>
                    <p className="text-xs text-muted-foreground mt-1">Global content</p>
                  </button>
                  <button onClick={() => setGenLang('te')} className={cn('rounded-xl border p-5 text-center transition-all', genLang === 'te' ? 'border-primary bg-primary/10' : 'border-border/60 hover:border-primary/30')}>
                    <p className="text-lg font-bold font-telugu">తెలుగు</p>
                    <p className="text-xs text-muted-foreground mt-1 font-telugu">స్వచ్ఛమైన తెలుగు</p>
                  </button>
                </div>
              </div>
            )}
            {step === 1 && (
              <div className="animate-fade-in">
                <h3 className={cn('text-lg font-bold mb-1', isTelugu && 'font-telugu')}>{t('generate.step.topic')}</h3>
                <p className={cn('text-xs text-muted-foreground mb-4', isTelugu && 'font-telugu')}>
                  {genLang === 'te'
                    ? `పూర్తి ఆయుర్వేద పాఠ్యాంశం — ${TOTAL_CURRICULUM_STATS.totalTopics} పుస్తకాలు, ${TOTAL_CURRICULUM_STATS.totalSeries} విభాగాలు`
                    : `Full Ayurveda curriculum — ${TOTAL_CURRICULUM_STATS.totalTopics} books across ${TOTAL_CURRICULUM_STATS.totalSeries} knowledge series`}
                </p>
                <div className="space-y-5 max-h-[420px] overflow-y-auto pr-1">
                  {SERIES.map((s) => (
                    <div key={s.id}>
                      <p className={cn('text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2', genLang === 'te' && 'font-telugu normal-case')}>
                        {s.order}. {genLang === 'te' ? s.nameTe : s.nameEn}
                      </p>
                      <div className="grid sm:grid-cols-2 gap-2">
                        {CURRICULUM.filter((c) => c.series === s.id).map((opt) => (
                          <button
                            key={opt.id}
                            onClick={() => setTopicId(opt.id)}
                            className={cn(
                              'rounded-lg border px-4 py-3 text-sm text-left transition-all',
                              topicId === opt.id ? 'border-primary bg-primary/10 text-primary' : 'border-border/60 hover:border-primary/30',
                              genLang === 'te' && 'font-telugu'
                            )}
                          >
                            <span className="block">{genLang === 'te' ? opt.titleTe : opt.titleEn}</span>
                            <span className="block text-[10px] text-muted-foreground mt-0.5 normal-case font-sans">
                              {opt.recommendedChapters} {t('ebook.chapters')} · {opt.mustCover.length} {genLang === 'te' ? 'కీలక అంశాలు' : 'key points'} · {opt.difficulty}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {step === 2 && (
              <div className="animate-fade-in">
                <h3 className={cn('text-lg font-bold mb-4', isTelugu && 'font-telugu')}>{lang === 'te' ? 'ధర ఎంచుకోండి' : 'Set Ebook Price'}</h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {PRICES.map((pr, i) => (
                    <button key={i} onClick={() => setPriceIdx(i)} className={cn('rounded-lg border px-3 py-4 text-center transition-all', priceIdx === i ? 'border-primary bg-primary/10 text-primary' : 'border-border/60 hover:border-primary/30', isTelugu && 'font-telugu')}>
                      <p className="text-lg font-bold">{pr.label.en}</p>
                      {pr.value === 0 && <p className="text-[10px] text-muted-foreground mt-0.5">{lang === 'te' ? 'అందరికీ' : 'For everyone'}</p>}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {step === 3 && (
              <div className="animate-fade-in text-center py-4">
                <h3 className={cn('text-lg font-bold mb-4', isTelugu && 'font-telugu')}>{t('generate.step.generate')}</h3>
                <div className="rounded-xl bg-muted/40 p-4 text-left space-y-2 mb-6">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">{t('generate.step.language')}</span><span className="font-medium">{genLang === 'te' ? 'తెలుగు' : 'English'}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">{t('generate.step.topic')}</span><span className={cn('font-medium max-w-[60%] text-right', genLang === 'te' && 'font-telugu')}>{genLang === 'te' ? selectedTopic.titleTe : selectedTopic.titleEn}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">{t('generate.step.length')}</span><span className="font-medium">{selectedTopic.recommendedChapters} {t('ebook.chapters')}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">{lang === 'te' ? 'ధర' : 'Price'}</span><span className={cn('font-medium', PRICES[priceIdx].value === 0 ? 'text-accent' : 'text-gold')}>{PRICES[priceIdx].label.en}</span></div>
                </div>
                {genError && (
                  <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-left text-xs text-destructive">
                    {genError}
                  </div>
                )}

                {/* Phase 1: no outline yet — one button to plan it */}
                {outline.length === 0 && (
                  <button
                    onClick={generateOutlineOnly}
                    disabled={generating}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-card transition-all hover:scale-[1.02] disabled:opacity-60"
                  >
                    {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    <span className={isTelugu ? 'font-telugu' : ''}>
                      {generating
                        ? (genLang === 'te' ? 'ఔట్‌లైన్ ప్లాన్ చేస్తోంది...' : 'Planning outline...')
                        : (genLang === 'te' ? 'ముందుగా ఔట్‌లైన్ సృష్టించండి' : 'Generate outline first')}
                    </span>
                  </button>
                )}

                {/* Phase 2: outline exists — one button per chapter, click any in any order */}
                {outline.length > 0 && (
                  <div className="text-left max-w-md mx-auto">
                    <div className={cn('mb-3 rounded-lg border border-amber-400/30 bg-amber-400/5 px-3 py-2 text-[11px] text-amber-700 dark:text-amber-400', isTelugu && 'font-telugu')}>
                      {lang === 'te'
                        ? '⚠️ ఈ బటన్లు నేరుగా Vercel మీదుగా వెళ్తాయి. పెద్ద చాప్టర్ ఒక్క క్లిక్ కి పూర్తి కాకపోతే, బటన్ "Continue" గా మారుతుంది — 2-3 సార్లు నొక్కితే ఆ చాప్టర్ పూర్తవుతుంది (ఇది normal, timeout కాదు). పూర్తిగా timeout-free గా కావాలంటే పైన ఉన్న "Cloudflare Worker pipeline" వాడండి.'
                        : '⚠️ These buttons run through Vercel directly. If a long chapter doesn\'t finish in one click, the button turns into "Continue" — click it 2-3 times to finish that chapter (this is expected, not a failure). For a fully timeout-free option, use the "Cloudflare Worker pipeline" panel above.'}
                    </div>
                    <p className={cn('text-xs font-semibold text-muted-foreground mb-3', isTelugu && 'font-telugu')}>
                      {genLang === 'te'
                        ? `ఔట్‌లైన్ సిద్ధమైంది — ప్రతి అధ్యాయం విడిగా సృష్టించండి (${chapters.length}/${outline.length} పూర్తయ్యింది)`
                        : `Outline ready — generate each chapter individually (${chapters.length}/${outline.length} done)`}
                    </p>
                    <div className="space-y-2 mb-5">
                      {outline.map((chapterPlan, i) => {
                        const done = chapters.find((c) => c.chapterNumber === chapterPlan.chapterNumber);
                        const isLoading = generatingChapter === i;
                        const draft = chapterDrafts[i];
                        return (
                          <div
                            key={chapterPlan.chapterNumber}
                            className={cn(
                              'flex items-center gap-3 rounded-lg px-3 py-2.5 border transition-all',
                              done ? 'border-accent/30 bg-accent/5' : draft ? 'border-amber-400/40 bg-amber-400/5' : 'border-border/40 bg-muted/20'
                            )}
                          >
                            <div className={cn(
                              'flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold shrink-0',
                              done ? 'bg-accent text-white' : draft ? 'bg-amber-400 text-white' : 'bg-muted text-muted-foreground'
                            )}>
                              {done ? <Check className="h-3 w-3" /> : chapterPlan.chapterNumber}
                            </div>
                            <span className={cn('text-xs font-medium truncate flex-1', isTelugu && genLang === 'te' && 'font-telugu')}>
                              {chapterPlan.title}
                              {draft && !done && (
                                <span className="block text-[10px] font-normal text-amber-600 dark:text-amber-400">
                                  {genLang === 'te'
                                    ? `పాక్షికంగా వ్రాయబడింది (${draft.wordCountSoFar.toLocaleString()} పదాలు) — "Continue" నొక్కండి`
                                    : `Partly written (${draft.wordCountSoFar.toLocaleString()} words) — click Continue`}
                                </span>
                              )}
                            </span>
                            {done && (
                              <span className="text-[10px] text-muted-foreground shrink-0">{done.wordCount.toLocaleString()} {lang === 'te' ? 'పదాలు' : 'words'}</span>
                            )}
                            <button
                              onClick={() => generateChapterAt(i)}
                              disabled={isLoading || generatingChapter !== -1}
                              className={cn(
                                'shrink-0 inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[11px] font-semibold transition-colors disabled:opacity-50',
                                done ? 'border border-border/60 hover:bg-muted/60' : draft ? 'bg-amber-500 text-white hover:opacity-90' : 'bg-primary text-primary-foreground hover:opacity-90'
                              )}
                            >
                              {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : done ? <RefreshCw className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
                              {isLoading
                                ? (genLang === 'te' ? 'సృష్టిస్తోంది' : 'Working')
                                : done
                                ? (genLang === 'te' ? 'మళ్ళీ' : 'Retry')
                                : draft
                                ? (genLang === 'te' ? 'కొనసాగించు' : 'Continue')
                                : (genLang === 'te' ? 'సృష్టించు' : 'Generate')}
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Phase 3: every chapter done — finalize */}
                    {chapters.length === outline.length && (
                      <div className="text-center">
                        <button
                          onClick={finishBook}
                          disabled={generating}
                          className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-card transition-all hover:scale-[1.02] disabled:opacity-60"
                        >
                          {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                          <span className={isTelugu ? 'font-telugu' : ''}>
                            {generating
                              ? (genLang === 'te' ? 'పూర్తి చేస్తోంది...' : 'Finalizing...')
                              : (genLang === 'te' ? 'పుస్తకాన్ని పూర్తి చేయండి' : 'Finalize book')}
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {!generating && step < 3 && (
            <div className="flex justify-between">
              <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className={cn('inline-flex items-center gap-1.5 rounded-lg border border-border/60 px-4 py-2 text-sm font-medium transition-colors', step === 0 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-muted/60', isTelugu && 'font-telugu')}>
                <ArrowLeft className="h-4 w-4" /> {t('generate.back')}
              </button>
              <button onClick={() => setStep(step + 1)} className={cn('inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft transition-all hover:shadow-card', isTelugu && 'font-telugu')}>
                {t('generate.next')} <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
          {step === 3 && !generating && (
            <button onClick={() => setStep(2)} className={cn('inline-flex items-center gap-1.5 rounded-lg border border-border/60 px-4 py-2 text-sm font-medium hover:bg-muted/60', isTelugu && 'font-telugu')}>
              <ArrowLeft className="h-4 w-4" /> {t('generate.back')}
            </button>
          )}
        </>
      ) : (
        <div className="animate-fade-in">
          {/* Book summary banner */}
          <div className="rounded-2xl border border-accent/20 bg-gradient-to-br from-accent/5 to-primary/5 p-5 mb-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Check className="h-4 w-4 text-accent shrink-0" />
                  <span className={cn('text-xs font-semibold text-accent', isTelugu && 'font-telugu')}>{genLang === 'te' ? 'పుస్తకం సిద్ధం!' : 'Book Complete!'}</span>
                </div>
                {bookMeta && (
                  <>
                    <h2 className={cn('text-xl font-bold mb-0.5', genLang === 'te' && 'font-telugu')}>{bookMeta.title}</h2>
                    <p className={cn('text-sm text-muted-foreground mb-2', genLang === 'te' && 'font-telugu')}>{bookMeta.subtitle}</p>
                    <div className="flex flex-wrap gap-3 mt-3">
                      <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                        <BookText className="h-3 w-3" /> {chapters.length} {t('ebook.chapters')}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-md bg-accent/10 px-2 py-1 text-xs font-medium text-accent">
                        <FileTextIcon className="h-3 w-3" /> {totalWords.toLocaleString()} {lang === 'te' ? 'పదాలు' : 'words'}
                      </span>
                      <span className={cn('inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium', PRICES[priceIdx].value === 0 ? 'bg-emerald/10 text-emerald' : 'bg-gold/10 text-gold')}>
                        <IndianRupee className="h-3 w-3" /> {PRICES[priceIdx].label.en}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Chapter sidebar + content */}
          <div className="grid lg:grid-cols-[240px_1fr] gap-4 mb-4">
            {/* Chapter list */}
            <div className="rounded-xl border border-border/60 bg-card p-3 shadow-soft lg:max-h-[600px] lg:overflow-y-auto">
              <h3 className={cn('text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-2', isTelugu && 'font-telugu')}>
                {t('ebook.contents')}
              </h3>
              <div className="space-y-1">
                {chapters.map((ch, i) => (
                  <button key={i} onClick={() => setActiveChapter(i)} className={cn(
                    'w-full text-left rounded-lg px-3 py-2.5 text-sm transition-colors',
                    activeChapter === i ? 'bg-primary text-primary-foreground' : 'hover:bg-muted/60 text-foreground',
                    genLang === 'te' && 'font-telugu'
                  )}>
                    <span className="text-xs font-bold opacity-60 mr-1.5">{i + 1}.</span>
                    <span className="text-xs">{ch.title.length > 32 ? ch.title.substring(0, 32) + '...' : ch.title}</span>
                    <span className={cn('block text-[10px] mt-0.5', activeChapter === i ? 'text-primary-foreground/60' : 'text-muted-foreground')}>{ch.wordCount.toLocaleString()} {lang === 'te' ? 'పదాలు' : 'words'}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Chapter content */}
            <div className="rounded-2xl border border-border/60 bg-card p-6 sm:p-8 shadow-soft">
              <div className="flex items-start justify-between gap-4 mb-4 pb-4 border-b border-border/40">
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-primary mb-1 block">{lang === 'te' ? `అధ్యాయం ${activeChapter + 1} / ${chapters.length}` : `Chapter ${activeChapter + 1} of ${chapters.length}`}</span>
                  <h3 className={cn('text-xl font-bold', genLang === 'te' && 'font-telugu')}>{chapters[activeChapter]?.title}</h3>
                </div>
                <button
                  onClick={() => regenerateChapter(activeChapter)}
                  disabled={generatingChapter === activeChapter}
                  className={cn('shrink-0 inline-flex items-center gap-1.5 rounded-md border border-border/60 px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted/60 transition-colors disabled:opacity-50', genLang === 'te' && 'font-telugu')}
                >
                  {generatingChapter === activeChapter ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                  {t('generate.regenerate')}
                </button>
              </div>
              <div className={cn('text-sm leading-[1.8] text-foreground/90 whitespace-pre-line max-h-[500px] overflow-y-auto pr-2', genLang === 'te' && 'font-telugu')}>
                {chapters[activeChapter]?.content}
              </div>
              {/* Chapter navigation */}
              <div className="flex justify-between mt-6 pt-4 border-t border-border/40">
                <button
                  onClick={() => setActiveChapter(Math.max(0, activeChapter - 1))}
                  disabled={activeChapter === 0}
                  className={cn('inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted/60', isTelugu && 'font-telugu')}
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> {t('ebook.prev')}
                </button>
                <span className="text-xs text-muted-foreground">{activeChapter + 1} / {chapters.length}</span>
                <button
                  onClick={() => setActiveChapter(Math.min(chapters.length - 1, activeChapter + 1))}
                  disabled={activeChapter === chapters.length - 1}
                  className={cn('inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted/60', isTelugu && 'font-telugu')}
                >
                  {t('ebook.next')} <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          <Disclaimer variant="full" />

          <div className="mt-6 flex flex-wrap gap-3">
            <button onClick={() => { setGenerated(false); setStep(0); setChapters([]); setBookMeta(null); }} className={cn('inline-flex items-center gap-2 rounded-lg border border-border/60 px-4 py-2.5 text-sm font-medium hover:bg-muted/60', isTelugu && 'font-telugu')}>
              <ArrowLeft className="h-4 w-4" /> {lang === 'te' ? 'కొత్త పుస్తకం' : 'New Ebook'}
            </button>
            <button className={cn('inline-flex items-center gap-2 rounded-lg border border-border/60 px-4 py-2.5 text-sm font-medium hover:bg-muted/60', isTelugu && 'font-telugu')}>
              <Download className="h-4 w-4" /> {lang === 'te' ? 'డౌన్‌లోడ్' : 'Download'}
            </button>
            <button className={cn('inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft hover:shadow-card', isTelugu && 'font-telugu')}>
              <BookOpen className="h-4 w-4" /> {lang === 'te' ? 'ప్రచురించు' : 'Publish'}
            </button>
          </div>
        </div>
      )}

      <div className="mt-10 pt-8 border-t border-border/40">
        <HerbsSection lang={lang} isTelugu={isTelugu} accessToken={accessToken} />
      </div>
    </div>
  );
}

/**
 * Generates one full herb encyclopedia entry (both languages, safety info, a free
 * Pexels photo) at a time, from the queue in lib/data/herb-queue.ts. Same one-item-
 * one-click pattern as the ebook chapter buttons above, and runs through the same
 * Vercel API route — herb entries are a single JSON call each (much smaller than a
 * book chapter), so they comfortably fit within the free-plan timeout.
 */
function HerbsSection({ lang, isTelugu, accessToken }: { lang: 'en' | 'te'; isTelugu: boolean; accessToken?: string }) {
  const [existingSlugs, setExistingSlugs] = useState<Set<string> | null>(null);
  const [generatingSlug, setGeneratingSlug] = useState<string | null>(null);
  const [doneSlugs, setDoneSlugs] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGeneratedHerbs().then((rows) => setExistingSlugs(new Set(rows.map((r) => r.slug))));
  }, []);

  const generateHerb = async (slug: string, commonName: string, sanskritName: string) => {
    const token = await getFreshAccessToken();
    if (!token) return;
    setGeneratingSlug(slug);
    setError(null);
    try {
      const res = await fetch('/api/generate/herb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ slug, commonName, sanskritName }),
      });
      const raw = await res.text();
      let data: any;
      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error(`Server error (status ${res.status}) — the request may have taken too long.`);
      }
      if (!res.ok) throw new Error(data?.error || 'Herb generation failed');
      setDoneSlugs((prev) => new Set(prev).add(slug));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Herb generation failed');
    } finally {
      setGeneratingSlug(null);
    }
  };

  const isDone = (slug: string) => doneSlugs.has(slug) || (existingSlugs?.has(slug) ?? false);

  return (
    <div>
      <h3 className={cn('text-sm font-bold mb-1', isTelugu && 'font-telugu')}>
        {lang === 'te' ? 'మూలికలు జనరేట్ చేయండి' : 'Generate Herbs'}
      </h3>
      <p className={cn('text-xs text-muted-foreground mb-4', isTelugu && 'font-telugu')}>
        {lang === 'te'
          ? 'ప్రతి మూలిక — ఇంగ్లీష్ + తెలుగు, భద్రతా సమాచారంతో సహా — ఒక్క క్లిక్ లో తయారవుతుంది, Pexels నుండి ఉచిత ఫోటోతో సహా.'
          : 'Each herb — English + Telugu, safety info included — is generated in one click, with a free photo from Pexels.'}
      </p>
      {error && (
        <div className="mb-3 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">{error}</div>
      )}
      {!accessToken ? (
        <p className="text-xs text-muted-foreground">{lang === 'te' ? 'లాగిన్ చెక్ అవుతోంది...' : 'Checking login...'}</p>
      ) : existingSlugs === null ? (
        <p className="text-xs text-muted-foreground">{lang === 'te' ? 'లోడ్ అవుతోంది...' : 'Loading...'}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-2xl">
          {HERB_QUEUE.map((h) => {
            const done = isDone(h.slug);
            const loading = generatingSlug === h.slug;
            return (
              <div key={h.slug} className={cn('flex items-center gap-2 rounded-lg border px-3 py-2', done ? 'border-accent/30 bg-accent/5' : 'border-border/40 bg-muted/20')}>
                <span className="text-xs font-medium truncate flex-1">{h.commonName}</span>
                <button
                  onClick={() => generateHerb(h.slug, h.commonName, h.sanskritName)}
                  disabled={loading || done || generatingSlug !== null}
                  className={cn(
                    'shrink-0 inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[11px] font-semibold transition-colors disabled:opacity-50',
                    done ? 'border border-border/60' : 'bg-primary text-primary-foreground hover:opacity-90'
                  )}
                >
                  {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : done ? <Check className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
                  {loading ? (lang === 'te' ? 'సృష్టిస్తోంది' : 'Working') : done ? (lang === 'te' ? 'పూర్తయింది' : 'Done') : (lang === 'te' ? 'సృష్టించు' : 'Generate')}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ───────────── Ebooks Tab ───────────── */

function EbooksTab({ lang, isTelugu, t }: { lang: 'en' | 'te'; isTelugu: boolean; t: (k: string) => string }) {
  const coverImages = [FOREST_IMG, TEA_IMG, RAIN_LEAVES_IMG, LEAVES_IMG, MOUNTAIN_IMG, FOREST_IMG, TEA_IMG, RAIN_LEAVES_IMG];
  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className={cn('text-lg font-bold', isTelugu && 'font-telugu')}>
          {lang === 'te' ? 'పుస్తకాల జాబితా' : 'Ebook Library'}
        </h2>
        <span className="text-xs text-muted-foreground">{ebooks.length} {lang === 'te' ? 'పుస్తకాలు' : 'ebooks'}</span>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ebooks.map((eb, i) => (
          <div key={eb.slug} className="rounded-xl border border-border/60 bg-card overflow-hidden shadow-soft hover:shadow-card transition-all group">
            <div className="relative h-32 overflow-hidden">
              <img src={coverImages[i % coverImages.length]} alt={eb.title.en} className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-2 left-3 right-3">
                <p className={cn('text-sm font-bold text-white truncate', isTelugu && lang === 'te' && 'font-telugu')}>{eb.title[lang] || eb.title.en}</p>
              </div>
              {eb.isFree && <span className="absolute top-2 right-2 rounded-full bg-accent/90 px-2 py-0.5 text-[10px] font-bold text-white">{t('card.free')}</span>}
              {!eb.isFree && <span className="absolute top-2 right-2 rounded-full bg-gold/90 px-2 py-0.5 text-[10px] font-bold text-white">₹{eb.price}</span>}
            </div>
            <div className="p-3">
              <p className="text-xs text-muted-foreground mb-2">{eb.chapters.length} {t('ebook.chapters')} • {eb.readingTime} min</p>
              <div className="flex items-center gap-2">
                <span className={cn('text-xs font-medium', eb.featured ? 'text-primary' : 'text-muted-foreground')}>{eb.rating}★</span>
                <span className="text-xs text-muted-foreground">({eb.reviewCount})</span>
                {eb.trending && <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">Trending</span>}
                {eb.newRelease && <span className="rounded bg-accent/10 px-1.5 py-0.5 text-[10px] font-medium text-accent">New</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────────── Safety Tab ───────────── */

interface PendingReviewEbook {
  id: string;
  slug: string;
  topic_id: string;
  language: string;
  title: string;
  subtitle: string | null;
  chapter_count: number;
  total_words: number;
  created_at: string;
  updated_at: string;
}

/**
 * Real pending-review queue — pregnancy/children/mental-health/advanced-Panchakarma
 * books land here (generation_status = 'pending_review') instead of auto-publishing,
 * per CurriculumTopic.requiresReview. This is the one thing that has to be true and
 * live, not mock data, since it's the actual safety gate for health-adjacent content.
 *
 * Gated by the real Supabase session (see lib/auth-server.ts) — only the account
 * whose email matches ADMIN_EMAIL can load or act on this queue. The access token
 * from the logged-in session is sent as a Bearer header automatically; there's no
 * secret to type in.
 */
function PendingReviewQueue({ lang, isTelugu, accessToken }: { lang: 'en' | 'te'; isTelugu: boolean; accessToken?: string }) {
  const [books, setBooks] = useState<PendingReviewEbook[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [actingOn, setActingOn] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchQueue = useCallback(async () => {
    const token = await getFreshAccessToken();
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/review', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load review queue');
      setBooks(data.pendingReview);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load review queue');
      setBooks(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  const decide = async (ebookId: string, action: 'approve' | 'reject') => {
    const token = await getFreshAccessToken();
    if (!token) return;
    setActingOn(ebookId);
    setError(null);
    try {
      const res = await fetch('/api/admin/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ebookId, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to record decision');
      setBooks((prev) => (prev ? prev.filter((b) => b.id !== ebookId) : prev));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to record decision');
    } finally {
      setActingOn(null);
    }
  };

  return (
    <div className="rounded-xl border border-border/60 bg-card p-5 shadow-soft mb-6">
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck className="h-5 w-5 text-primary" />
        <h3 className={cn('text-base font-semibold', isTelugu && 'font-telugu')}>
          {lang === 'te' ? 'మానవ సమీక్ష క్యూ (pending_review)' : 'Human Review Queue (pending_review)'}
        </h3>
      </div>
      <p className={cn('text-xs text-muted-foreground mb-4', isTelugu && 'font-telugu')}>
        {lang === 'te'
          ? 'గర్భం, పిల్లలు, మానసిక ఆరోగ్యం, అధునాతన పంచకర్మ అంశాలు — publish అవడానికి ముందు ఇక్కడ ఆమోదం అవసరం.'
          : 'Pregnancy, children, mental health, and advanced-Panchakarma topics land here instead of auto-publishing — approve or reject before they go live.'}
      </p>

      <div className="flex justify-end mb-4">
        <button
          onClick={fetchQueue}
          disabled={!accessToken || loading}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          {lang === 'te' ? 'రిఫ్రెష్' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {books !== null && books.length === 0 && !error && (
        <p className={cn('text-sm text-muted-foreground', isTelugu && 'font-telugu')}>
          {lang === 'te' ? 'సమీక్ష కోసం ఏమీ లేదు.' : 'Nothing waiting on review right now.'}
        </p>
      )}

      {books && books.length > 0 && (
        <div className="space-y-3">
          {books.map((book) => (
            <div key={book.id} className="rounded-lg border border-gold/20 bg-gold/5 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{book.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {book.topic_id} · {book.language.toUpperCase()} · {book.chapter_count} ch · {book.total_words} words
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => decide(book.id, 'approve')}
                    disabled={actingOn === book.id}
                    className="inline-flex items-center gap-1 rounded-lg bg-accent px-2.5 py-1.5 text-xs font-medium text-accent-foreground disabled:opacity-50"
                  >
                    {actingOn === book.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                    {lang === 'te' ? 'ఆమోదించు' : 'Approve'}
                  </button>
                  <button
                    onClick={() => decide(book.id, 'reject')}
                    disabled={actingOn === book.id}
                    className="inline-flex items-center gap-1 rounded-lg bg-destructive/15 px-2.5 py-1.5 text-xs font-medium text-destructive disabled:opacity-50"
                  >
                    <X className="h-3 w-3" />
                    {lang === 'te' ? 'తిరస్కరించు' : 'Reject'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SafetyTab({ lang, isTelugu, t, accessToken }: { lang: 'en' | 'te'; isTelugu: boolean; t: (k: string) => string; accessToken?: string }) {
  const flags = lang === 'te'
    ? [
        { item: 'అశ్వగంధ మోతాదు — సమీక్ష అవసరం', status: 'సమీక్షలో', severity: 'high' },
        { item: 'గర్భం — భద్రతా హెచ్చరిక', status: 'పరిష్కరించబడింది', severity: 'resolved' },
        { item: 'పసుపు + మందుల పరస్పర చర్య', status: 'సమీక్షలో', severity: 'medium' },
      ]
    : [
        { item: 'Ashwagandha dosage — needs review', status: 'In Review', severity: 'high' },
        { item: 'Pregnancy — safety warning', status: 'Resolved', severity: 'resolved' },
        { item: 'Turmeric + medication interaction', status: 'In Review', severity: 'medium' },
      ];

  return (
    <div className="animate-fade-in">
      <div className="relative rounded-2xl overflow-hidden h-32 mb-6">
        <img src={RAIN_LEAVES_IMG} alt="Fresh green leaves with raindrops" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-destructive/40 to-primary/30" />
        <div className="relative h-full flex items-center px-6">
          <div>
            <h2 className={cn('text-xl font-bold text-white mb-1', isTelugu && 'font-telugu')}>{t('admin.safetyFlags')}</h2>
            <p className={cn('text-sm text-white/80', isTelugu && 'font-telugu')}>
              {lang === 'te' ? 'భద్రతా సమీక్షలు మరియు హెచ్చరికలు' : 'Safety reviews and content warnings'}
            </p>
          </div>
        </div>
      </div>

      <PendingReviewQueue lang={lang} isTelugu={isTelugu} accessToken={accessToken} />

      <div className="rounded-xl border border-border/60 bg-card p-5 shadow-soft">
        <p className={cn('text-xs text-muted-foreground mb-3', isTelugu && 'font-telugu')}>
          {lang === 'te' ? 'దిగువన ఉదాహరణ డేటా (ఇంకా Supabase కి కనెక్ట్ కాలేదు):' : 'Example content flags below (not yet wired to Supabase):'}
        </p>
        <div className="space-y-3">
          {flags.map((flag, i) => (
            <div key={i} className={cn(
              'flex items-center justify-between rounded-lg p-3 border',
              flag.severity === 'high' ? 'border-destructive/20 bg-destructive/5' : flag.severity === 'resolved' ? 'border-accent/20 bg-accent/5' : 'border-gold/20 bg-gold/5'
            )}>
              <div className="flex items-center gap-3">
                <AlertTriangle className={cn('h-4 w-4', flag.severity === 'high' ? 'text-destructive' : flag.severity === 'resolved' ? 'text-accent' : 'text-gold')} />
                <span className={cn('text-sm', isTelugu && 'font-telugu')}>{flag.item}</span>
              </div>
              <span className={cn(
                'text-xs font-medium rounded-full px-3 py-1',
                flag.status.includes('Review') || flag.status.includes('సమీక్ష')
                  ? flag.severity === 'high' ? 'bg-destructive/15 text-destructive' : 'bg-gold/20 text-gold'
                  : 'bg-accent/20 text-accent',
                isTelugu && 'font-telugu'
              )}>
                {flag.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <Disclaimer variant="full" />
      </div>
    </div>
  );
}
