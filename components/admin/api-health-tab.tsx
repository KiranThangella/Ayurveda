'use client';

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import {
  Activity, CheckCircle2, XCircle, AlertTriangle, RefreshCw,
  Zap, Server, Cpu, Clock, Terminal, ChevronDown, ChevronUp,
  Play, ExternalLink, ShieldCheck, HelpCircle, Check, Copy
} from 'lucide-react';
import type { ProviderHealthMetric } from '@/lib/ai/providers';

interface HealthApiResponse {
  success: boolean;
  providers: ProviderHealthMetric[];
  testResults?: Array<{ success: boolean; latencyMs: number; error?: string; response?: string; provider: string }>;
  summaryCounts?: {
    total: number;
    configured: number;
    healthy: number;
    error: number;
    untested: number;
  };
  error?: string;
  timestamp?: string;
}

export function ApiHealthTab({
  lang,
  isTelugu,
  t,
}: {
  lang: 'en' | 'te';
  isTelugu: boolean;
  t: (k: string) => string;
}) {
  const [providers, setProviders] = useState<ProviderHealthMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingAll, setTestingAll] = useState(false);
  const [testingSingle, setTestingSingle] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [expandedProvider, setExpandedProvider] = useState<string | null>(null);
  const [testPrompt, setTestPrompt] = useState('Respond with JSON: {"status": "healthy", "service": "ayurveda-ai"}');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fetchHealth = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/admin/health');
      const data: HealthApiResponse = await res.json();
      if (data.success && data.providers) {
        setProviders(data.providers);
        setLastUpdated(new Date().toLocaleTimeString());
      } else {
        setErrorMsg(data.error || 'Failed to fetch AI provider status');
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  const handleTestAll = async () => {
    setTestingAll(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/admin/health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test-all', testPrompt }),
      });
      const data: HealthApiResponse = await res.json();
      if (data.providers) {
        setProviders(data.providers);
        setLastUpdated(new Date().toLocaleTimeString());
      }
      if (!data.success && data.error) {
        setErrorMsg(data.error);
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setTestingAll(false);
    }
  };

  const handleTestSingle = async (providerName: string) => {
    setTestingSingle(providerName);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/admin/health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test-one', providerName, testPrompt }),
      });
      const data: HealthApiResponse = await res.json();
      if (data.providers) {
        setProviders(data.providers);
        setLastUpdated(new Date().toLocaleTimeString());
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setTestingSingle(null);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const configuredProviders = providers.filter((p) => p.isConfigured);
  const healthyCount = configuredProviders.filter((p) => p.lastStatus === 'healthy').length;
  const errorCount = configuredProviders.filter((p) => p.lastStatus === 'error').length;
  const avgLatency =
    configuredProviders.length > 0
      ? Math.round(
          configuredProviders
            .filter((p) => (p.lastLatencyMs || p.avgLatencyMs) > 0)
            .reduce((acc, p) => acc + (p.lastLatencyMs || p.avgLatencyMs), 0) /
            (configuredProviders.filter((p) => (p.lastLatencyMs || p.avgLatencyMs) > 0).length || 1)
        )
      : 0;

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header & Quick stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-card border border-border/60 rounded-2xl p-6 shadow-soft">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Activity className="h-5 w-5" />
            </span>
            <h2 className={cn('text-xl font-bold text-foreground font-display', isTelugu && 'font-telugu')}>
              {lang === 'te' ? 'AI ప్రొవైడర్ హెల్త్ & లేటెన్సీ డాష్‌బోర్డ్' : 'AI Provider Health & Diagnostics'}
            </h2>
          </div>
          <p className={cn('text-xs sm:text-sm text-muted-foreground', isTelugu && 'font-telugu')}>
            {lang === 'te'
              ? 'Gemini, Groq, NVIDIA, OpenAI వంటి ప్రొవైడర్ల లైవ్ కనెక్టివిటీ, లేటెన్సీ, మరియు ఫాల్‌బ్యాక్ స్థితిని ఇక్కడ డీబగ్ చేయవచ్చు.'
              : 'Monitor real-time connectivity, latency, success rates, and multi-key fallback status across all AI providers.'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          <button
            onClick={fetchHealth}
            disabled={loading || testingAll}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium hover:bg-muted transition-colors disabled:opacity-50"
            title="Refresh current metrics"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
            {lang === 'te' ? 'రిఫ్రెష్' : 'Refresh'}
          </button>
          <button
            onClick={handleTestAll}
            disabled={loading || testingAll || configuredProviders.length === 0}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-soft hover:bg-primary/90 transition-all disabled:opacity-50"
          >
            {testingAll ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                {lang === 'te' ? 'పరీక్షిస్తోంది...' : 'Testing All...'}
              </>
            ) : (
              <>
                <Zap className="h-3.5 w-3.5 fill-current" />
                {lang === 'te' ? 'అన్ని ప్రొవైడర్లను పరీక్షించండి' : 'Run Live Diagnostic Probe'}
              </>
            )}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-xs sm:text-sm text-destructive flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">{lang === 'te' ? 'డయాగ్నస్టిక్ ఎర్రర్' : 'Diagnostic Error'}</p>
            <p className="mt-1 font-mono text-xs break-all">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Metrics Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border/60 bg-card p-4 shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground font-medium">
              {lang === 'te' ? 'కాన్ఫిగర్ చేసినవి' : 'Configured Providers'}
            </span>
            <Server className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold font-mono">
            {configuredProviders.length} <span className="text-xs font-normal text-muted-foreground">/ {providers.length}</span>
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            {configuredProviders.length === 0
              ? (lang === 'te' ? 'కీలు లేవు' : 'No API keys configured')
              : (lang === 'te' ? 'యాక్టివ్ ఫాల్‌బ్యాక్ చెయిన్' : 'Active fallback chain ready')}
          </p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card p-4 shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground font-medium">
              {lang === 'te' ? 'హెల్తీ ప్రొవైడర్లు' : 'Healthy Status'}
            </span>
            <CheckCircle2 className="h-4 w-4 text-emerald" />
          </div>
          <p className="text-2xl font-bold font-mono text-emerald">
            {healthyCount}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            {healthyCount > 0
              ? (lang === 'te' ? 'స్పందిస్తున్న సర్వీసులు' : 'Responding to requests')
              : (lang === 'te' ? 'ఇంకా పరీక్షించలేదు' : 'Run probe to verify')}
          </p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card p-4 shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground font-medium">
              {lang === 'te' ? 'లోపాలు / ఫెయిల్యూర్స్' : 'Failed / Errored'}
            </span>
            <XCircle className={cn('h-4 w-4', errorCount > 0 ? 'text-destructive' : 'text-muted-foreground')} />
          </div>
          <p className={cn('text-2xl font-bold font-mono', errorCount > 0 ? 'text-destructive' : 'text-muted-foreground')}>
            {errorCount}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            {errorCount > 0
              ? (lang === 'te' ? 'పరిశీలన అవసరం' : 'Requires attention below')
              : (lang === 'te' ? 'ఏ లోపాలు లేవు' : 'Zero active errors')}
          </p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card p-4 shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground font-medium">
              {lang === 'te' ? 'సగటు లేటెన్సీ' : 'Avg Latency'}
            </span>
            <Clock className="h-4 w-4 text-accent" />
          </div>
          <p className="text-2xl font-bold font-mono">
            {avgLatency > 0 ? `${avgLatency} ms` : '—'}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            {lastUpdated ? `${lang === 'te' ? 'చివరి సమయం:' : 'Updated:'} ${lastUpdated}` : 'Not tested yet'}
          </p>
        </div>
      </div>

      {/* Main Providers List */}
      <div className="rounded-2xl border border-border/60 bg-card shadow-soft overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-border/60 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className={cn('text-base font-semibold text-foreground', isTelugu && 'font-telugu')}>
              {lang === 'te' ? 'ప్రొవైడర్ల ప్రాధాన్యతా క్రమం (Fallback Order)' : 'AI Providers & Failover Chain'}
            </h3>
            <p className={cn('text-xs text-muted-foreground mt-0.5', isTelugu && 'font-telugu')}>
              {lang === 'te'
                ? 'పై నుండి కిందికి వరుసగా ప్రయత్నించబడుతుంది. ఒకటి విఫలమైతే తర్వాతి ప్రొవైడర్‌కు ఆటోమేటిక్‌గా స్విచ్ అవుతుంది.'
                : 'Executed sequentially in priority order. If one fails, quota exhausts, or returns 404/410, it cascades to the next.'}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald" /> Healthy
            <span className="inline-block h-2 w-2 rounded-full bg-destructive ml-2" /> Error
            <span className="inline-block h-2 w-2 rounded-full bg-muted-foreground/40 ml-2" /> Unset
          </div>
        </div>

        <div className="divide-y divide-border/60">
          {providers.map((p, idx) => {
            const isExpanded = expandedProvider === p.name;
            const isTestingThis = testingSingle === p.name || testingAll;
            const hasError = p.lastStatus === 'error';
            const isHealthy = p.lastStatus === 'healthy';
            const latency = p.lastLatencyMs ?? p.avgLatencyMs;

            return (
              <div key={p.name} className={cn('p-4 sm:p-5 transition-colors', isExpanded && 'bg-muted/10')}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left: Name, Group badge, env & model */}
                  <div className="flex items-start gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-mono font-bold text-muted-foreground mt-0.5">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm sm:text-base text-foreground font-mono capitalize">
                          {p.name}
                        </span>
                        
                        {/* Group badge */}
                        <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                          {p.group.toUpperCase()}
                        </span>

                        {/* Status badge */}
                        {!p.isConfigured ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                            {lang === 'te' ? 'కీ కాన్ఫిగర్ చేయలేదు' : 'Not Configured'}
                          </span>
                        ) : isTestingThis ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary animate-pulse">
                            <RefreshCw className="h-3 w-3 animate-spin" />
                            {lang === 'te' ? 'పరీక్షిస్తోంది...' : 'Testing...'}
                          </span>
                        ) : isHealthy ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald/15 px-2.5 py-0.5 text-[11px] font-semibold text-emerald">
                            <CheckCircle2 className="h-3 w-3" />
                            {lang === 'te' ? 'హెల్తీ' : 'Healthy'}
                          </span>
                        ) : hasError ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-destructive/15 px-2.5 py-0.5 text-[11px] font-semibold text-destructive">
                            <XCircle className="h-3 w-3" />
                            {lang === 'te' ? 'ఎర్రర్' : 'Error'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2.5 py-0.5 text-[11px] font-medium text-accent">
                            {lang === 'te' ? 'సిద్ధంగా ఉంది' : 'Ready (Untested)'}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1.5 flex-wrap">
                        <div className="flex items-center gap-1 font-mono">
                          <Terminal className="h-3 w-3" />
                          <span>{p.apiKeyEnv}</span>
                          <span className="text-muted-foreground/60">({p.maskedKey})</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Cpu className="h-3 w-3" />
                          <span className="font-mono text-foreground/80">{p.model}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Latency, Success Rate, Actions */}
                  <div className="flex items-center gap-3 self-end sm:self-center">
                    {p.isConfigured && (
                      <div className="text-right hidden sm:block">
                        <div className="flex items-center justify-end gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          <span
                            className={cn(
                              'text-xs font-mono font-semibold',
                              latency > 0 && latency < 800
                                ? 'text-emerald'
                                : latency >= 800 && latency < 2000
                                ? 'text-accent'
                                : latency >= 2000
                                ? 'text-gold'
                                : 'text-muted-foreground'
                            )}
                          >
                            {latency > 0 ? `${latency} ms` : '—'}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {p.totalCalls > 0 ? `${p.successRate}% success (${p.successCount}/${p.totalCalls})` : '0 calls'}
                        </p>
                      </div>
                    )}

                    <button
                      onClick={() => handleTestSingle(p.name)}
                      disabled={!p.isConfigured || isTestingThis}
                      className={cn(
                        'inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors',
                        p.isConfigured
                          ? 'border-border hover:bg-muted text-foreground'
                          : 'border-border/40 text-muted-foreground/40 cursor-not-allowed'
                      )}
                      title={p.isConfigured ? 'Run quick health test on this provider' : 'Set API key in Settings first'}
                    >
                      {testingSingle === p.name ? (
                        <RefreshCw className="h-3 w-3 animate-spin" />
                      ) : (
                        <Play className="h-3 w-3 fill-current" />
                      )}
                      {lang === 'te' ? 'టెస్ట్' : 'Test'}
                    </button>

                    <button
                      onClick={() => setExpandedProvider(isExpanded ? null : p.name)}
                      className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      title="View details / debug log"
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Debug Panel */}
                {isExpanded && (
                  <div className="mt-4 rounded-xl bg-muted/40 border border-border/60 p-4 text-xs space-y-3 animate-fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <span className="text-muted-foreground block mb-0.5">Environment Variable:</span>
                        <div className="flex items-center gap-1 font-mono font-medium">
                          <span>{p.apiKeyEnv}</span>
                          <button
                            onClick={() => copyToClipboard(p.apiKeyEnv, `env-${p.name}`)}
                            className="p-1 text-muted-foreground hover:text-foreground"
                            title="Copy variable name"
                          >
                            {copiedKey === `env-${p.name}` ? <Check className="h-3 w-3 text-emerald" /> : <Copy className="h-3 w-3" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground block mb-0.5">Default Model / Configured Model:</span>
                        <span className="font-mono font-medium text-foreground">{p.model}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block mb-0.5">Last Probe Timestamp:</span>
                        <span className="text-foreground">{p.lastTestedAt ? new Date(p.lastTestedAt).toLocaleString() : 'Never'}</span>
                      </div>
                    </div>

                    {hasError && p.lastError && (
                      <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-destructive">
                        <p className="font-semibold flex items-center gap-1.5 mb-1">
                          <XCircle className="h-4 w-4 shrink-0" />
                          {lang === 'te' ? 'తాజా లోపం (Failure Log):' : 'Latest Failure Log / Reason:'}
                        </p>
                        <p className="font-mono text-xs whitespace-pre-wrap break-all">{p.lastError}</p>
                      </div>
                    )}

                    {!p.isConfigured && (
                      <div className="rounded-lg bg-card border border-border/80 p-3 text-muted-foreground">
                        <p className="font-semibold text-foreground flex items-center gap-1.5 mb-1">
                          <HelpCircle className="h-4 w-4 text-accent" />
                          {lang === 'te' ? 'ఈ ప్రొవైడర్‌ను ఎలా ప్రారంభించాలి?' : 'How to configure this provider?'}
                        </p>
                        <p>
                          {lang === 'te'
                            ? `Settings ⚙️ (Environment Variables) లో '${p.apiKeyEnv}' వేరియబుల్‌గా మీ API Key ని జోడించండి.`
                            : `Add '${p.apiKeyEnv}' in the Settings ⚙️ menu (Environment Variables & Secrets) to enable automatic failover to this provider.`}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Troubleshooting & Guide Section */}
      <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <h3 className={cn('text-base font-bold text-foreground', isTelugu && 'font-telugu')}>
            {lang === 'te' ? 'AI ప్రొవైడర్ల డీబగ్గింగ్ & గైడ్' : 'AI Failover Troubleshooting & Best Practices'}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm">
          <div className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-2">
            <h4 className="font-semibold text-foreground flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-primary" />
              Gemini Quota (429) Fix
            </h4>
            <p className="text-muted-foreground text-xs leading-relaxed">
              {lang === 'te'
                ? 'ఉచిత కోటా ముగిస్తే, అదనంగా `GEMINI_API_KEY_2`, `GEMINI_API_KEY_3` సెట్ చేయండి. యాప్ ఆటోమేటిక్‌గా తదుపరి కీకి మారిపోతుంది.'
                : 'Free tier keys have daily quotas. Set GEMINI_API_KEY_2 and GEMINI_API_KEY_3 to multiply your daily capacity before failing over.'}
            </p>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary font-medium hover:underline pt-1"
            >
              Get Gemini Keys <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <div className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-2">
            <h4 className="font-semibold text-foreground flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald" />
              Groq Llama 3.3 Integration
            </h4>
            <p className="text-muted-foreground text-xs leading-relaxed">
              {lang === 'te'
                ? 'గ్రోక్ చాలా వేగంగా స్పందిస్తుంది. `GROQ_API_KEY` జోడించి మోడల్‌ను `llama-3.3-70b-versatile` గా ఉపయోగించవచ్చు.'
                : 'Groq delivers ultra-low latency inference. Use llama-3.3-70b-versatile with valid JSON mode for speedy outline generation.'}
            </p>
            <a
              href="https://console.groq.com/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary font-medium hover:underline pt-1"
            >
              Groq Console <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <div className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-2">
            <h4 className="font-semibold text-foreground flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-accent" />
              NVIDIA NIM & DeepSeek
            </h4>
            <p className="text-muted-foreground text-xs leading-relaxed">
              {lang === 'te'
                ? 'NVIDIA మోడల్ రిటైర్ అయినప్పుడు ఆటోమేటిక్‌గా `meta/llama-3.3-70b-instruct` లేదా `deepseek-chat` కు స్విచ్ అవుతుంది.'
                : 'When models reach end-of-life (410), the engine safely cascades to active DeepSeek (deepseek-chat) and OpenAI endpoints.'}
            </p>
            <a
              href="https://build.nvidia.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary font-medium hover:underline pt-1"
            >
              NVIDIA Build <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
