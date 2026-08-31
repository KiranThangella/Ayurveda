// NOTE: This mirrors workers/ebook-cron/src/providers.ts (same provider list,
// order, and fallback logic). If you add/reorder a provider, update BOTH files.
//
/**
 * Multi-provider text generation with automatic fallback.
 *
 * Providers are tried IN ORDER (see PROVIDER_ORDER below); a provider is only
 * attempted if its API key env var is actually set. If one is down, rate
 * limited, has retired its model, or rejects the content, the next configured
 * provider is tried automatically — a full outage of one vendor no longer
 * fails book generation outright.
 *
 * Gemini's free tier caps at a small number of requests PER KEY PER DAY, so
 * GEMINI_API_KEY_2 and GEMINI_API_KEY_3 (optional, same GEMINI_MODEL) act as
 * extra quota — 3 free keys ≈ 3x the daily Gemini budget before falling
 * through to a different vendor entirely.
 *
 * Gemini has its own request/response shape. Groq, DeepSeek, OpenAI, and
 * NVIDIA NIM are all OpenAI-compatible (same /v1/chat/completions shape) —
 * one shared caller handles all of them, just with a different base
 * URL/key/model per provider.
 *
 * To add another OpenAI-compatible provider later ("etc etc"): add one entry
 * to PROVIDER_ORDER below. No other code needs to change.
 */

export class AIProviderError extends Error {
  public statusCode?: number;
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'AIProviderError';
    this.statusCode = status;
  }
}

/**
 * Thrown when a provider refused to generate for content reasons (safety
 * filter, recitation block, blocked prompt) rather than an infra failure.
 * Since different providers run different filters, this does NOT stop the
 * fallback chain — the next provider still gets a try. It's only surfaced to
 * the caller if every configured provider rejects the same content, which is
 * a real signal worth a human look rather than another automatic retry.
 */
export class AIProviderSafetyBlockError extends AIProviderError {
  constructor(public provider: string, public reason: string) {
    super(`${provider} blocked this content (reason: ${reason}).`);
    this.name = 'AIProviderSafetyBlockError';
  }
}

export interface GenResult {
  text: string;
  truncated: boolean;
  provider: string;
}

interface CallOpts {
  temperature?: number;
  maxOutputTokens?: number;
  json: boolean;
}

type ProviderCaller = (apiKey: string, model: string, prompt: string, opts: CallOpts) => Promise<{ text: string; truncated: boolean }>;

interface ProviderDef {
  name: string;
  apiKeyEnv: string;
  modelEnv: string;
  defaultModel: string;
  call: ProviderCaller;
  /** Some free/on-demand tiers cap total tokens (prompt + completion) PER MINUTE,
   *  not just per day — Groq's free org tier is 8000 TPM, for example. Requesting
   *  a large maxOutputTokens on a long prompt can blow that limit on the very
   *  first call. This caps what we ask for on that provider specifically,
   *  regardless of what the caller requested. */
  maxOutputTokensCap?: number;
}

function isValidJSON(text: string): boolean {
  if (!text || typeof text !== 'string') return false;
  const cleaned = text.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
  try {
    JSON.parse(cleaned);
    return true;
  } catch {}
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start !== -1 && end > start) {
    try {
      JSON.parse(cleaned.slice(start, end + 1));
      return true;
    } catch {}
  }
  const startArr = cleaned.indexOf('[');
  const endArr = cleaned.lastIndexOf(']');
  if (startArr !== -1 && endArr > startArr) {
    try {
      JSON.parse(cleaned.slice(startArr, endArr + 1));
      return true;
    } catch {}
  }
  return false;
}

async function callGemini(apiKey: string, model: string, prompt: string, opts: CallOpts) {
  // Standard and current Gemini models to try in sequence.
  const modelsToTry = [
    model,
    'gemini-2.5-flash',
    'gemini-3.7-flash',
    'gemini-3.1-flash-lite',
    'gemini-flash-latest',
    'gemini-2.5-pro',
    'gemini-3.1-pro-preview',
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
  ].filter((m, i, a) => Boolean(m) && a.indexOf(m) === i);

  let lastError: Error | null = null;
  const attemptsLog: string[] = [];

  for (const candidateModel of modelsToTry) {
    const cleanModel = candidateModel.replace(/^models\//, '');
    const versions = ['v1beta', 'v1'];
    
    for (const apiVersion of versions) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/${apiVersion}/models/${cleanModel}:generateContent`;
        
        let body: Record<string, unknown> = {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: opts.temperature ?? 0.7,
            maxOutputTokens: opts.maxOutputTokens ?? 8192,
            ...(opts.json ? { responseMimeType: 'application/json' } : {}),
          },
        };

        let res = await fetch(`${endpoint}?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        // If 400 Bad Request with responseMimeType: application/json, fallback to plain text instruction
        if (!res.ok && res.status === 400 && opts.json) {
          body = {
            contents: [{ parts: [{ text: `Respond strictly with valid JSON format.\n\n${prompt}` }] }],
            generationConfig: {
              temperature: opts.temperature ?? 0.7,
              maxOutputTokens: opts.maxOutputTokens ?? 8192,
            },
          };
          res = await fetch(`${endpoint}?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });
        }

        if (!res.ok) {
          const errText = await res.text().catch(() => '');
          attemptsLog.push(`${cleanModel}(${apiVersion}): HTTP ${res.status}`);
          lastError = new AIProviderError(`gemini ${cleanModel} (${apiVersion}) returned ${res.status}: ${errText.slice(0, 120)}`, res.status);
          continue;
        }

        const data = await res.json();
        const promptBlockReason: string | undefined = data?.promptFeedback?.blockReason;
        if (promptBlockReason) throw new AIProviderSafetyBlockError('gemini', promptBlockReason);

        const candidate = data?.candidates?.[0];
        const finishReason: string | undefined = candidate?.finishReason;
        const text: string | undefined = candidate?.content?.parts?.[0]?.text;

        if (finishReason && finishReason !== 'STOP' && finishReason !== 'MAX_TOKENS') {
          throw new AIProviderSafetyBlockError('gemini', finishReason);
        }
        if (!text) throw new AIProviderSafetyBlockError('gemini', finishReason || 'empty response, no reason given');

        return { text, truncated: finishReason === 'MAX_TOKENS' };
      } catch (err) {
        if (err instanceof AIProviderSafetyBlockError) throw err;
        lastError = err instanceof Error ? err : new Error(String(err));
      }
    }
  }

  throw lastError || new AIProviderError(`All gemini candidate models failed (${attemptsLog.join(', ')})`);
}

const PROVIDER_FALLBACK_MODELS: Record<string, string[]> = {
  groq: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'llama-3.1-70b-versatile', 'mixtral-8x7b-32768', 'gemma2-9b-it'],
  nvidia: ['meta/llama-3.1-70b-instruct', 'meta/llama-3.1-8b-instruct', 'mistralai/mixtral-8x7b-instruct-v0.1', 'nvidia/nemotron-4-340b-instruct'],
  deepseek: ['deepseek-chat', 'deepseek-reasoner'],
  openai: ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo'],
};

/** Shared caller for any OpenAI-compatible /v1/chat/completions endpoint (Groq, OpenAI, NVIDIA NIM, and any future addition). */
function makeOpenAICompatibleCaller(providerName: string, baseUrl: string): ProviderCaller {
  return async (apiKey: string, model: string, prompt: string, opts: CallOpts) => {
    const fallbackList = PROVIDER_FALLBACK_MODELS[providerName] || [];
    const modelsToTry = [model, ...fallbackList].filter((m, i, a) => Boolean(m) && a.indexOf(m) === i);

    let lastError: Error | null = null;
    const attemptsLog: string[] = [];

    for (const candidateModel of modelsToTry) {
      const messages: Array<{ role: string; content: string }> = [];
      if (opts.json) {
        messages.push({
          role: 'system',
          content: 'You are an expert Ayurvedic assistant. You MUST respond with ONLY a valid, parseable JSON object matching the requested schema. No markdown formatting, no explanations outside JSON.',
        });
      }
      messages.push({ role: 'user', content: prompt });

      const body: Record<string, unknown> = {
        model: candidateModel,
        messages,
        temperature: opts.temperature ?? 0.7,
        max_tokens: opts.maxOutputTokens ?? 8192,
      };
      if (opts.json) body.response_format = { type: 'json_object' };

      try {
        let res = await fetch(`${baseUrl}/chat/completions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify(body),
        });

        // Some models or providers fail on json_object response_format (400)
        if (!res.ok && res.status === 400 && opts.json) {
          delete body.response_format;
          res = await fetch(`${baseUrl}/chat/completions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
            body: JSON.stringify(body),
          });
        }

        if (!res.ok) {
          const errText = await res.text().catch(() => '');
          attemptsLog.push(`${candidateModel}: HTTP ${res.status}`);
          // 404 (model not found), 410 (Gone / EOL), 400 (unsupported model) -> try next fallback model
          if (res.status === 404 || res.status === 410 || res.status === 400 || res.status === 429 || res.status === 503) {
            lastError = new AIProviderError(`${providerName} model ${candidateModel} error (${res.status}): ${errText.slice(0, 150)}`, res.status);
            continue;
          }
          throw new AIProviderError(`${providerName} API error (${res.status}): ${errText}`, res.status);
        }

        const data = await res.json();
        const choice = data?.choices?.[0];
        const finishReason: string | undefined = choice?.finish_reason;
        const text: string | undefined = choice?.message?.content;

        if (finishReason === 'content_filter') throw new AIProviderSafetyBlockError(providerName, finishReason);
        if (!text) throw new AIProviderSafetyBlockError(providerName, finishReason || 'empty response, no reason given');

        return { text, truncated: finishReason === 'length' };
      } catch (err) {
        if (err instanceof AIProviderSafetyBlockError) throw err;
        if (err instanceof AIProviderError && err.statusCode && ![404, 410, 400, 429, 503].includes(err.statusCode)) {
          throw err;
        }
        lastError = err instanceof Error ? err : new Error(String(err));
      }
    }

    throw lastError || new AIProviderError(`${providerName} all models failed (${attemptsLog.join(', ')})`);
  };
}

/** Ollama running on localhost (or any reachable host) — no API key needed at
 *  all, exposes an OpenAI-compatible /v1/chat/completions endpoint since
 *  Ollama 0.x. Only useful when THIS CODE runs somewhere that can reach that
 *  host: your own machine during `npm run dev`, not the deployed Vercel
 *  functions (they run on Vercel's servers, which can't see your localhost).
 *  Set OLLAMA_BASE_URL to activate — leave it unset in production and this is
 *  skipped entirely, same as any other unconfigured provider. */
function makeOllamaCaller(): ProviderCaller {
  return async (baseUrl: string, model: string, prompt: string, opts: CallOpts) => {
    const body: Record<string, unknown> = {
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: opts.temperature ?? 0.7,
      stream: false,
    };
    if (opts.json) body.format = 'json';

    const res = await fetch(`${baseUrl.replace(/\/$/, '')}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new AIProviderError(`ollama error (${res.status}): ${errText || 'is Ollama running? (ollama serve)'}`, res.status);
    }

    const data = await res.json();
    const text: string | undefined = data?.message?.content;
    if (!text) throw new AIProviderSafetyBlockError('ollama', 'empty response, no reason given');
    // Ollama doesn't report truncation the way hosted APIs do — treat as complete.
    return { text, truncated: false };
  };
}

/**
 * Cloudflare Workers AI via its REST API (not a binding — that only exists
 * inside an actual Worker, see workers/ebook-cron for that version). This is
 * the way to reach the SAME free models from Vercel: needs a Cloudflare
 * account ID and an API token with "Workers AI" read access (dash.cloudflare.com
 * → My Profile → API Tokens), not a Worker deployment. Free tier: 10,000
 * "neurons"/day, no card required.
 */
function makeCloudflareWorkersAICaller(): ProviderCaller {
  return async (apiKey: string, model: string, prompt: string, opts: CallOpts) => {
    const accountId = process.env.CF_ACCOUNT_ID;
    if (!accountId) throw new AIProviderError('CF_ACCOUNT_ID is not set (required alongside CF_API_TOKEN for Cloudflare Workers AI).');

    const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        max_tokens: opts.maxOutputTokens ?? 4096,
        temperature: opts.temperature ?? 0.7,
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new AIProviderError(`cloudflare-workers-ai error (${res.status}): ${errText}`, res.status);
    }

    const data = await res.json();
    const text: string | undefined = data?.result?.response;
    if (!data?.success || !text) throw new AIProviderSafetyBlockError('cloudflare-workers-ai', JSON.stringify(data?.errors) || 'empty response');
    return { text, truncated: false };
  };
}

export interface ProviderHealthMetric {
  name: string;
  group: 'gemini' | 'groq' | 'nvidia' | 'deepseek' | 'openai' | 'cloudflare' | 'ollama' | 'other';
  apiKeyEnv: string;
  isConfigured: boolean;
  maskedKey: string;
  model: string;
  totalCalls: number;
  successCount: number;
  failureCount: number;
  successRate: number; // 0 to 100
  avgLatencyMs: number;
  lastLatencyMs: number | null;
  lastStatus: 'healthy' | 'error' | 'untested' | 'unconfigured';
  lastError: string | null;
  lastTestedAt: string | null;
  testedModel?: string;
}

// In-memory runtime health stats tracker
const runtimeStats: Record<
  string,
  {
    totalCalls: number;
    successCount: number;
    failureCount: number;
    totalLatencyMs: number;
    lastLatencyMs: number | null;
    lastStatus: 'healthy' | 'error' | 'untested';
    lastError: string | null;
    lastTestedAt: string | null;
    testedModel?: string;
  }
> = {};

function maskKey(key?: string): string {
  if (!key) return '(not set)';
  if (key.length <= 8) return '****';
  return `${key.slice(0, 6)}...${key.slice(-4)}`;
}

function getProviderGroup(name: string): ProviderHealthMetric['group'] {
  if (name.startsWith('gemini') || name.startsWith('google')) return 'gemini';
  if (name === 'groq') return 'groq';
  if (name === 'nvidia') return 'nvidia';
  if (name === 'deepseek') return 'deepseek';
  if (name === 'openai') return 'openai';
  if (name.includes('cloudflare')) return 'cloudflare';
  if (name === 'ollama') return 'ollama';
  return 'other';
}

function recordStat(name: string, success: boolean, latencyMs: number, errorMsg: string | null, testedModel?: string) {
  if (!runtimeStats[name]) {
    runtimeStats[name] = {
      totalCalls: 0,
      successCount: 0,
      failureCount: 0,
      totalLatencyMs: 0,
      lastLatencyMs: null,
      lastStatus: 'untested',
      lastError: null,
      lastTestedAt: null,
    };
  }
  const s = runtimeStats[name];
  s.totalCalls += 1;
  s.lastTestedAt = new Date().toISOString();
  s.lastLatencyMs = latencyMs;
  s.totalLatencyMs += latencyMs;
  if (testedModel) s.testedModel = testedModel;

  if (success) {
    s.successCount += 1;
    s.lastStatus = 'healthy';
    s.lastError = null;
  } else {
    s.failureCount += 1;
    s.lastStatus = 'error';
    s.lastError = errorMsg;
  }
}

/**
 * Fallback order. A provider is skipped (not just failed) if its API key env
 * var isn't set — so this works with just GEMINI_API_KEY configured (today's
 * setup) and gets more resilient as more keys are added, no code change needed.
 */
export const PROVIDER_ORDER: ProviderDef[] = [
  { name: 'gemini', apiKeyEnv: 'GEMINI_API_KEY', modelEnv: 'GEMINI_MODEL', defaultModel: 'gemini-2.5-flash', call: callGemini },
  { name: 'gemini-2', apiKeyEnv: 'GEMINI_API_KEY_2', modelEnv: 'GEMINI_MODEL', defaultModel: 'gemini-2.5-flash', call: callGemini },
  { name: 'gemini-3', apiKeyEnv: 'GEMINI_API_KEY_3', modelEnv: 'GEMINI_MODEL', defaultModel: 'gemini-2.5-flash', call: callGemini },
  { name: 'gemini-4', apiKeyEnv: 'GEMINI_API_KEY_4', modelEnv: 'GEMINI_MODEL', defaultModel: 'gemini-2.5-flash', call: callGemini },
  { name: 'gemini-5', apiKeyEnv: 'GEMINI_API_KEY_5', modelEnv: 'GEMINI_MODEL', defaultModel: 'gemini-2.5-flash', call: callGemini },
  { name: 'gemini-6', apiKeyEnv: 'GEMINI_API_KEY_6', modelEnv: 'GEMINI_MODEL', defaultModel: 'gemini-2.5-flash', call: callGemini },
  { name: 'google-ai', apiKeyEnv: 'GOOGLE_API_KEY', modelEnv: 'GEMINI_MODEL', defaultModel: 'gemini-2.5-flash', call: callGemini },
  { name: 'google-genai', apiKeyEnv: 'GOOGLE_GENAI_API_KEY', modelEnv: 'GEMINI_MODEL', defaultModel: 'gemini-2.5-flash', call: callGemini },
  { name: 'groq', apiKeyEnv: 'GROQ_API_KEY', modelEnv: 'GROQ_MODEL', defaultModel: 'llama-3.3-70b-versatile', call: makeOpenAICompatibleCaller('groq', 'https://api.groq.com/openai/v1'), maxOutputTokensCap: 8000 },
  { name: 'cloudflare-workers-ai', apiKeyEnv: 'CF_API_TOKEN', modelEnv: 'CF_WORKERS_AI_MODEL', defaultModel: '@cf/meta/llama-3.1-8b-instruct', call: makeCloudflareWorkersAICaller() },
  { name: 'deepseek', apiKeyEnv: 'DEEPSEEK_API_KEY', modelEnv: 'DEEPSEEK_MODEL', defaultModel: 'deepseek-chat', call: makeOpenAICompatibleCaller('deepseek', 'https://api.deepseek.com/v1') },
  { name: 'openai', apiKeyEnv: 'OPENAI_API_KEY', modelEnv: 'OPENAI_MODEL', defaultModel: 'gpt-4o-mini', call: makeOpenAICompatibleCaller('openai', 'https://api.openai.com/v1') },
  { name: 'nvidia', apiKeyEnv: 'NVIDIA_API_KEY', modelEnv: 'NVIDIA_MODEL', defaultModel: 'meta/llama-3.1-70b-instruct', call: makeOpenAICompatibleCaller('nvidia', 'https://integrate.api.nvidia.com/v1') },
  { name: 'ollama', apiKeyEnv: 'OLLAMA_BASE_URL', modelEnv: 'OLLAMA_MODEL', defaultModel: 'llama3.1', call: makeOllamaCaller() },
];

export function getProvidersHealthSummary(getEnv: (key: string) => string | undefined): ProviderHealthMetric[] {
  return PROVIDER_ORDER.map((p) => {
    const rawKey = getEnv(p.apiKeyEnv);
    const isConfigured = Boolean(rawKey && rawKey.trim().length > 0);
    const model = getEnv(p.modelEnv) || p.defaultModel;
    const stat = runtimeStats[p.name] || {
      totalCalls: 0,
      successCount: 0,
      failureCount: 0,
      totalLatencyMs: 0,
      lastLatencyMs: null,
      lastStatus: 'untested',
      lastError: null,
      lastTestedAt: null,
    };

    const avgLatencyMs = stat.totalCalls > 0 ? Math.round(stat.totalLatencyMs / stat.totalCalls) : 0;
    const successRate = stat.totalCalls > 0 ? Math.round((stat.successCount / stat.totalCalls) * 100) : 0;

    return {
      name: p.name,
      group: getProviderGroup(p.name),
      apiKeyEnv: p.apiKeyEnv,
      isConfigured,
      maskedKey: maskKey(rawKey),
      model,
      totalCalls: stat.totalCalls,
      successCount: stat.successCount,
      failureCount: stat.failureCount,
      successRate,
      avgLatencyMs,
      lastLatencyMs: stat.lastLatencyMs,
      lastStatus: !isConfigured ? 'unconfigured' : stat.lastStatus,
      lastError: stat.lastError,
      lastTestedAt: stat.lastTestedAt,
      testedModel: stat.testedModel,
    };
  });
}

/**
 * Diagnostic test for a single provider or all providers.
 */
export async function testProviderHealth(
  providerName: string,
  getEnv: (key: string) => string | undefined,
  testPrompt = 'Respond with JSON: {"status": "ok", "provider": "test"}'
): Promise<{ success: boolean; latencyMs: number; response?: string; error?: string; provider: string }> {
  const provider = PROVIDER_ORDER.find((p) => p.name === providerName);
  if (!provider) {
    return { success: false, latencyMs: 0, error: `Unknown provider: ${providerName}`, provider: providerName };
  }

  const apiKey = getEnv(provider.apiKeyEnv);
  if (!apiKey) {
    return {
      success: false,
      latencyMs: 0,
      error: `API key ${provider.apiKeyEnv} is not set in environment`,
      provider: providerName,
    };
  }

  const model = getEnv(provider.modelEnv) || provider.defaultModel;
  const start = Date.now();

  try {
    const res = await provider.call(apiKey, model, testPrompt, {
      json: true,
      maxOutputTokens: 256,
      temperature: 0.2,
    });
    const latencyMs = Date.now() - start;
    recordStat(provider.name, true, latencyMs, null, model);
    return { success: true, latencyMs, response: res.text.slice(0, 150), provider: provider.name };
  } catch (err) {
    const latencyMs = Date.now() - start;
    const errorMsg = err instanceof Error ? err.message : String(err);
    recordStat(provider.name, false, latencyMs, errorMsg, model);
    return { success: false, latencyMs, error: errorMsg, provider: provider.name };
  }
}

function configuredProviders(getEnv: (key: string) => string | undefined) {
  return PROVIDER_ORDER
    .map((p) => ({ ...p, apiKey: getEnv(p.apiKeyEnv), model: getEnv(p.modelEnv) || p.defaultModel }))
    .filter((p): p is typeof p & { apiKey: string } => !!p.apiKey);
}

/**
 * Tries each configured provider in order and returns the first success.
 * For json:true calls, a truncated response first gets ONE retry on the same
 * provider with a doubled token budget (capped at 32768) — outline/meta JSON
 * can legitimately need more room than the 8192 default, especially in Telugu
 * where the same content takes more tokens than in English. Only if it's
 * *still* truncated after that retry is the provider treated as failed and the
 * chain moves to the next one. For json:false calls, truncation is returned
 * normally — the caller (generateWithContinuation) handles it.
 */
export async function callWithFallback(getEnv: (key: string) => string | undefined, prompt: string, opts: CallOpts): Promise<GenResult> {
  const providers = configuredProviders(getEnv);
  if (!providers.length) {
    throw new AIProviderError('No AI provider API key is configured (checked GEMINI_API_KEY[_2/_3], GROQ_API_KEY, DEEPSEEK_API_KEY, OPENAI_API_KEY, NVIDIA_API_KEY). Set at least one.');
  }

  const failures: string[] = [];
  for (const provider of providers) {
    const callStart = Date.now();
    try {
      const callOpts: CallOpts = provider.maxOutputTokensCap
        ? { ...opts, maxOutputTokens: Math.min(opts.maxOutputTokens ?? 8192, provider.maxOutputTokensCap) }
        : opts;
      let result = await provider.call(provider.apiKey, provider.model, prompt, callOpts);
      
      if (opts.json) {
        if (isValidJSON(result.text)) {
          recordStat(provider.name, true, Date.now() - callStart, null, provider.model);
          return { ...result, truncated: false, provider: provider.name };
        }
        if (result.truncated) {
          const biggerBudget = Math.min((callOpts.maxOutputTokens ?? 8192) * 2, provider.maxOutputTokensCap ?? 32768);
          result = await provider.call(provider.apiKey, provider.model, prompt, { ...callOpts, maxOutputTokens: biggerBudget });
          if (isValidJSON(result.text)) {
            recordStat(provider.name, true, Date.now() - callStart, null, provider.model);
            return { ...result, truncated: false, provider: provider.name };
          }
          const errReason = `${provider.name}: truncated at the token limit before valid JSON completed (retried with a larger budget, still invalid JSON)`;
          recordStat(provider.name, false, Date.now() - callStart, errReason, provider.model);
          failures.push(errReason);
          continue;
        }
      }

      recordStat(provider.name, true, Date.now() - callStart, null, provider.model);
      return { ...result, provider: provider.name };
    } catch (err) {
      const errReason = `${err instanceof Error ? err.message : String(err)}`;
      recordStat(provider.name, false, Date.now() - callStart, errReason, provider.model);
      failures.push(`${provider.name}: ${errReason}`);
    }
  }

  throw new AIProviderError(`All configured AI providers failed:\n${failures.map((f) => `- ${f}`).join('\n')}`);
}
