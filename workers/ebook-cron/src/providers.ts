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
   *  not just per day — Groq's free org tier is 8000 TPM, for example. This caps
   *  what we ask for on that provider specifically, regardless of what the
   *  caller requested. */
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

        // If 400 with json mime type, retry without responseMimeType
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

        // Some models fail on json_object response_format
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
          if (res.status === 404 || res.status === 410 || res.status === 400 || res.status === 429 || res.status === 503) {
            lastError = new AIProviderError(`${providerName} model ${candidateModel} error (${res.status}): ${errText.slice(0, 150)}`, res.status);
            continue;
          }
          throw new AIProviderError(`${providerName} API error (${res.status}): ${errText}`, res.status);
        }

        const data = await res.json<any>();
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
  { name: 'gemini', apiKeyEnv: 'GEMINI_API_KEY', modelEnv: 'GEMINI_MODEL', defaultModel: 'gemini-2.5-flash', call: callGemini },
  { name: 'gemini-2', apiKeyEnv: 'GEMINI_API_KEY_2', modelEnv: 'GEMINI_MODEL', defaultModel: 'gemini-2.5-flash', call: callGemini },
  { name: 'gemini-3', apiKeyEnv: 'GEMINI_API_KEY_3', modelEnv: 'GEMINI_MODEL', defaultModel: 'gemini-2.5-flash', call: callGemini },
  { name: 'gemini-4', apiKeyEnv: 'GEMINI_API_KEY_4', modelEnv: 'GEMINI_MODEL', defaultModel: 'gemini-2.5-flash', call: callGemini },
  { name: 'gemini-5', apiKeyEnv: 'GEMINI_API_KEY_5', modelEnv: 'GEMINI_MODEL', defaultModel: 'gemini-2.5-flash', call: callGemini },
  { name: 'gemini-6', apiKeyEnv: 'GEMINI_API_KEY_6', modelEnv: 'GEMINI_MODEL', defaultModel: 'gemini-2.5-flash', call: callGemini },
  { name: 'google-ai', apiKeyEnv: 'GOOGLE_API_KEY', modelEnv: 'GEMINI_MODEL', defaultModel: 'gemini-2.5-flash', call: callGemini },
  { name: 'google-genai', apiKeyEnv: 'GOOGLE_GENAI_API_KEY', modelEnv: 'GEMINI_MODEL', defaultModel: 'gemini-2.5-flash', call: callGemini },
  { name: 'groq', apiKeyEnv: 'GROQ_API_KEY', modelEnv: 'GROQ_MODEL', defaultModel: 'llama-3.3-70b-versatile', call: makeOpenAICompatibleCaller('groq', 'https://api.groq.com/openai/v1'), maxOutputTokensCap: 8000 },
  { name: 'deepseek', apiKeyEnv: 'DEEPSEEK_API_KEY', modelEnv: 'DEEPSEEK_MODEL', defaultModel: 'deepseek-chat', call: makeOpenAICompatibleCaller('deepseek', 'https://api.deepseek.com/v1') },
  { name: 'openai', apiKeyEnv: 'OPENAI_API_KEY', modelEnv: 'OPENAI_MODEL', defaultModel: 'gpt-4o-mini', call: makeOpenAICompatibleCaller('openai', 'https://api.openai.com/v1') },
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
      
      if (opts.json) {
        if (isValidJSON(result.text)) {
          return { ...result, truncated: false, provider: provider.name };
        }
        if (result.truncated) {
          const biggerBudget = Math.min((callOpts.maxOutputTokens ?? 8192) * 2, provider.maxOutputTokensCap ?? 32768);
          result = await provider.call(provider.apiKey, provider.model, prompt, { ...callOpts, maxOutputTokens: biggerBudget });
          if (isValidJSON(result.text)) {
            return { ...result, truncated: false, provider: provider.name };
          }
          failures.push(`${provider.name}: truncated at the token limit before valid JSON completed (retried with a larger budget, still invalid JSON)`);
          continue;
        }
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
