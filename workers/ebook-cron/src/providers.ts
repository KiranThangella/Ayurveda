// NOTE: This mirrors project/lib/ai/providers.ts (same provider list, order,
// and fallback logic). If you add/reorder a provider, update BOTH files — see
// prompts.ts for why this is duplicated rather than imported across the '@/'
// alias boundary. One intentional difference: res.json() here uses the <any>
// type argument because @cloudflare/workers-types augments Response.json() to
// require one (the standard DOM lib version in the Next.js app doesn't accept
// one at all) — this is the same quirk documented in tsconfig.json's exclude.
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
 * Gemini has its own request/response shape. Groq, OpenAI, and NVIDIA NIM are
 * all OpenAI-compatible (same /v1/chat/completions shape) — one shared caller
 * handles all three, just with a different base URL/key/model per provider.
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
   *  not just per day — Groq's free org tier is 8000 TPM, for example. This caps
   *  what we ask for on that provider specifically, regardless of what the
   *  caller requested. */
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

  const data = await res.json<any>();
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

    const data = await res.json<any>();
    const choice = data?.choices?.[0];
    const finishReason: string | undefined = choice?.finish_reason;
    const text: string | undefined = choice?.message?.content;

    if (finishReason === 'content_filter') throw new AIProviderSafetyBlockError(providerName, finishReason);
    if (!text) throw new AIProviderSafetyBlockError(providerName, finishReason || 'empty response, no reason given');

    return { text, truncated: finishReason === 'length' };
  };
}

/** Ollama running locally — only reachable if this Worker itself is running
 *  locally too (`wrangler dev`), since a deployed Cloudflare Worker can't see
 *  your machine's localhost. Set OLLAMA_BASE_URL to activate; leave it unset
 *  in production secrets and this is skipped, same as any unconfigured
 *  provider. No API key needed. */
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
      throw new AIProviderError(`ollama error (${res.status}): ${errText || 'is Ollama running? (ollama serve)'}`);
    }

    const data: any = await res.json();
    const text: string | undefined = data?.message?.content;
    if (!text) throw new AIProviderSafetyBlockError('ollama', 'empty response, no reason given');
    return { text, truncated: false };
  };
}

/** Cloudflare Workers AI — free, native to this Worker (no API key at all, it's
 *  a binding), 10,000 "neurons"/day free with no signup beyond the Cloudflare
 *  account this Worker already runs on. Lower quality than Gemini/GPT for
 *  nuanced Ayurveda content and the response shape is different from the
 *  OpenAI-compatible providers above (no finish_reason to detect truncation),
 *  so it's kept as a distinct call path and only used if every paid-API-style
 *  provider above it has failed. */
async function callWorkersAI(binding: Ai, model: string, prompt: string, opts: CallOpts) {
  const result: any = await binding.run(model as any, {
    messages: [{ role: 'user', content: prompt }],
    max_tokens: opts.maxOutputTokens ?? 4096,
  });
  const text: string | undefined = result?.response;
  if (!text) throw new AIProviderSafetyBlockError('workers-ai', 'empty response, no reason given');
  // Workers AI doesn't report a finish_reason, so there's no reliable truncation
  // signal — treated as always-complete. The maxOutputTokens cap keeps requests
  // modest so this is rarely wrong in practice.
  return { text, truncated: false };
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
  { name: 'deepseek', apiKeyEnv: 'DEEPSEEK_API_KEY', modelEnv: 'DEEPSEEK_MODEL', defaultModel: 'deepseek-v4-flash', call: makeOpenAICompatibleCaller('deepseek', 'https://api.deepseek.com/v1') },
  { name: 'openai', apiKeyEnv: 'OPENAI_API_KEY', modelEnv: 'OPENAI_MODEL', defaultModel: 'gpt-5.6', call: makeOpenAICompatibleCaller('openai', 'https://api.openai.com/v1') },
  { name: 'nvidia', apiKeyEnv: 'NVIDIA_API_KEY', modelEnv: 'NVIDIA_MODEL', defaultModel: 'meta/llama-3.1-70b-instruct', call: makeOpenAICompatibleCaller('nvidia', 'https://integrate.api.nvidia.com/v1') },
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
 * provider with a doubled token budget (capped at 32768) before the provider
 * is treated as failed and the chain moves to the next one. For json:false
 * calls, truncation is returned normally — the caller handles it.
 *
 * `workersAiBinding` is separate from the string-API-key providers above (it's
 * a Worker binding, not a secret) — when present, it's tried LAST, after every
 * configured API-key provider has failed, since it's free but lower quality.
 */
export async function callWithFallback(
  getEnv: (key: string) => string | undefined,
  prompt: string,
  opts: CallOpts,
  workersAiBinding?: Ai,
): Promise<GenResult> {
  const providers = configuredProviders(getEnv);
  if (!providers.length && !workersAiBinding) {
    throw new AIProviderError('No AI provider API key is configured (checked GEMINI_API_KEY[_2/_3], GROQ_API_KEY, DEEPSEEK_API_KEY, OPENAI_API_KEY, NVIDIA_API_KEY) and no Workers AI binding was passed. Set at least one, or add the [ai] binding in wrangler.toml.');
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

  if (workersAiBinding) {
    try {
      const model = getEnv('WORKERS_AI_MODEL') || '@cf/meta/llama-3.1-8b-instruct';
      const result = await callWorkersAI(workersAiBinding, model, prompt, { ...opts, maxOutputTokens: Math.min(opts.maxOutputTokens ?? 4096, 4096) });
      return { ...result, provider: 'workers-ai' };
    } catch (err) {
      failures.push(`workers-ai: ${err instanceof Error ? err.message : String(err)}`);
    }
  } else {
    failures.push('workers-ai: not attempted — env.AI binding is undefined (check wrangler.toml has [ai] binding = "AI" and that Workers AI is enabled for this account, then redeploy)');
  }

  throw new AIProviderError(`All configured AI providers failed:\n${failures.map((f) => `- ${f}`).join('\n')}`);
}
