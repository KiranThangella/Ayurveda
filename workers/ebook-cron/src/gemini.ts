import type { Env } from './types';
import { callWithFallback, AIProviderError, AIProviderSafetyBlockError } from './providers';

// Re-exported under their original names so no existing `instanceof GeminiError`
// check anywhere in this Worker needs to change — these ARE the same classes.
export const GeminiError = AIProviderError;
export const GeminiSafetyBlockError = AIProviderSafetyBlockError;
export type GeminiError = AIProviderError;
export type GeminiSafetyBlockError = AIProviderSafetyBlockError;

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function envGetter(env: Env) {
  return (key: string) => (env as unknown as Record<string, string | undefined>)[key];
}

/**
 * Calls the AI provider chain (see ./providers.ts) and expects a JSON object
 * back. Only use this for SHORT responses (outline, meta, summaries) — a
 * truncated response here means unrepairable cut-off JSON, so it's treated as
 * that provider failing and the chain moves to the next one automatically.
 * For long-form content that may need more than one call's worth of tokens
 * (chapter prose), use generateWithContinuation() instead.
 */
export async function generateJSON<T>(env: Env, prompt: string, opts?: { temperature?: number; maxOutputTokens?: number }): Promise<{ data: T; provider: string }> {
  const { text, provider } = await callWithFallback(envGetter(env), prompt, { ...opts, json: true }, env.AI);
  return { data: parseJSONLoose<T>(text), provider };
}

/**
 * Calls the AI provider chain for plain-text output and reports whether the
 * response was cut off at the token limit.
 */
export async function generateText(env: Env, prompt: string, opts?: { temperature?: number; maxOutputTokens?: number }): Promise<{ text: string; truncated: boolean; provider: string }> {
  return callWithFallback(envGetter(env), prompt, { ...opts, json: false }, env.AI);
}

/**
 * Generates long-form text that may exceed a single call's token budget, by
 * resuming with a small continuation prompt when cut off mid-way. Capped at
 * `maxContinuations` extra calls so a stuck generation fails loudly instead of
 * looping/costing forever.
 *
 * `opts.onProgress(soFar)`, if given, is awaited after EVERY pass — callers
 * use this to checkpoint to the database, so a crash/eviction/timeout mid-way
 * loses at most one pass's worth of work. `opts.resumeFrom`, if given, skips
 * the fresh-start call and resumes a previously checkpointed draft.
 */
export async function generateWithContinuation(
  env: Env,
  firstPrompt: string,
  buildContinuationPrompt: (soFar: string) => string,
  opts?: { temperature?: number; maxOutputTokens?: number; maxContinuations?: number; delayMs?: number; resumeFrom?: string; onProgress?: (soFar: string) => Promise<void> },
): Promise<{ content: string; provider: string }> {
  const maxContinuations = opts?.maxContinuations ?? 2;
  const delayMs = opts?.delayMs ?? 2000;

  let combined: string;
  let truncated: boolean;
  let lastProvider = 'unknown';

  if (opts?.resumeFrom) {
    combined = opts.resumeFrom;
    truncated = true;
  } else {
    const first = await generateText(env, firstPrompt, opts);
    combined = first.text;
    truncated = first.truncated;
    lastProvider = first.provider;
    if (opts?.onProgress) await opts.onProgress(combined);
  }

  let attempt = 0;
  while (truncated && attempt < maxContinuations) {
    attempt++;
    await sleep(delayMs);
    const cont = await generateText(env, buildContinuationPrompt(combined), opts);
    combined = combined.trimEnd() + '\n\n' + cont.text.trimStart();
    truncated = cont.truncated;
    lastProvider = cont.provider;
    if (opts?.onProgress) await opts.onProgress(combined);
  }

  if (truncated) {
    throw new AIProviderError(`Still truncated after ${maxContinuations} continuation pass(es) — this needs a human look rather than another automatic retry.`);
  }

  return { content: combined.trim(), provider: lastProvider };
}

function parseJSONLoose<T>(text: string): T {
  const cleaned = text.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '');
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      return JSON.parse(cleaned.slice(start, end + 1)) as T;
    }
    throw new AIProviderError('Could not parse AI provider response as JSON.');
  }
}
