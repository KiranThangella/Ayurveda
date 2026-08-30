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
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'AIProviderError';
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

async function callGemini(apiKey: string, model: string, prompt: string, opts: CallOpts) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: opts.temperature ?? 0.7,
      maxOutputTokens: opts.maxOutputTokens ?? 8192,
      ...(opts.json ? { responseMimeType: 'application/json' } : {}),
    },
  };

  const res = await fetch(`${endpoint}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new AIProviderError(`gemini API error (${res.status}): ${errText}`, res.status);
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
}

/** Shared caller for any OpenAI-compatible /v1/chat/completions endpoint (Groq, OpenAI, NVIDIA NIM, and any future addition). */
function makeOpenAICompatibleCaller(providerName: string, baseUrl: string): ProviderCaller {
  return async (apiKey: string, model: string, prompt: string, opts: CallOpts) => {
    const body: Record<string, unknown> = {
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: opts.temperature ?? 0.7,
      max_tokens: opts.maxOutputTokens ?? 8192,
    };
    if (opts.json) body.response_format = { type: 'json_object' };

    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new AIProviderError(`${providerName} API error (${res.status}): ${errText}`, res.status);
    }

    const data = await res.json();
    const choice = data?.choices?.[0];
    const finishReason: string | undefined = choice?.finish_reason;
    const text: string | undefined = choice?.message?.content;

    if (finishReason === 'content_filter') throw new AIProviderSafetyBlockError(providerName, finishReason);
    if (!text) throw new AIProviderSafetyBlockError(providerName, finishReason || 'empty response, no reason given');

    return { text, truncated: finishReason === 'length' };
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

/**
 * Fallback order. A provider is skipped (not just failed) if its API key env
 * var isn't set — so this works with just GEMINI_API_KEY configured (today's
 * setup) and gets more resilient as more keys are added, no code change needed.
 *
 * Model IDs below are current as of Aug 2026 — providers retire models on
 * their own schedules (this whole feature exists because gemini-2.0-flash got
 * retired), so treat these as "known-good today," not permanent. Override any
 * of them without a redeploy via the matching *_MODEL env var.
 */
const PROVIDER_ORDER: ProviderDef[] = [
  { name: 'gemini', apiKeyEnv: 'GEMINI_API_KEY', modelEnv: 'GEMINI_MODEL', defaultModel: 'gemini-3.6-flash', call: callGemini },
  { name: 'gemini-2', apiKeyEnv: 'GEMINI_API_KEY_2', modelEnv: 'GEMINI_MODEL', defaultModel: 'gemini-3.6-flash', call: callGemini },
  { name: 'gemini-3', apiKeyEnv: 'GEMINI_API_KEY_3', modelEnv: 'GEMINI_MODEL', defaultModel: 'gemini-3.6-flash', call: callGemini },
  { name: 'groq', apiKeyEnv: 'GROQ_API_KEY', modelEnv: 'GROQ_MODEL', defaultModel: 'openai/gpt-oss-120b', call: makeOpenAICompatibleCaller('groq', 'https://api.groq.com/openai/v1'), maxOutputTokensCap: 4000 },
  { name: 'cloudflare-workers-ai', apiKeyEnv: 'CF_API_TOKEN', modelEnv: 'CF_WORKERS_AI_MODEL', defaultModel: '@cf/meta/llama-3.1-8b-instruct', call: makeCloudflareWorkersAICaller() },
  { name: 'deepseek', apiKeyEnv: 'DEEPSEEK_API_KEY', modelEnv: 'DEEPSEEK_MODEL', defaultModel: 'deepseek-v4-flash', call: makeOpenAICompatibleCaller('deepseek', 'https://api.deepseek.com/v1') },
  { name: 'openai', apiKeyEnv: 'OPENAI_API_KEY', modelEnv: 'OPENAI_MODEL', defaultModel: 'gpt-5.6', call: makeOpenAICompatibleCaller('openai', 'https://api.openai.com/v1') },
  { name: 'nvidia', apiKeyEnv: 'NVIDIA_API_KEY', modelEnv: 'NVIDIA_MODEL', defaultModel: 'meta/llama-3.1-70b-instruct', call: makeOpenAICompatibleCaller('nvidia', 'https://integrate.api.nvidia.com/v1') },
  // Local-only — only fires if OLLAMA_BASE_URL is set, which should never be
  // true in production. Placed last: a locally-installed model exists purely
  // for offline/dev use, not as a preferred path over hosted providers.
  { name: 'ollama', apiKeyEnv: 'OLLAMA_BASE_URL', modelEnv: 'OLLAMA_MODEL', defaultModel: 'llama3.1', call: makeOllamaCaller() },
];

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
    try {
      const callOpts: CallOpts = provider.maxOutputTokensCap
        ? { ...opts, maxOutputTokens: Math.min(opts.maxOutputTokens ?? 8192, provider.maxOutputTokensCap) }
        : opts;
      let result = await provider.call(provider.apiKey, provider.model, prompt, callOpts);
      if (opts.json && result.truncated) {
        const biggerBudget = Math.min((callOpts.maxOutputTokens ?? 8192) * 2, provider.maxOutputTokensCap ?? 32768);
        result = await provider.call(provider.apiKey, provider.model, prompt, { ...callOpts, maxOutputTokens: biggerBudget });
      }
      if (opts.json && result.truncated) {
        failures.push(`${provider.name}: truncated at the token limit before valid JSON completed (retried with a larger budget, still truncated)`);
        continue;
      }
      return { ...result, provider: provider.name };
    } catch (err) {
      failures.push(`${provider.name}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  throw new AIProviderError(`All configured AI providers failed:\n${failures.map((f) => `- ${f}`).join('\n')}`);
}
