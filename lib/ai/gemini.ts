/**
 * Server-only AI generation client. Never import this from a 'use client' file.
 *
 * Despite the filename (kept for import-path stability across the app), this
 * now tries multiple providers with automatic fallback — see lib/ai/providers.ts
 * for the actual provider list, ordering, and how to add another one. Gemini
 * stays the primary/first-tried provider; everything else only fires if Gemini
 * fails or its key isn't set.
 */
import { callWithFallback, AIProviderError, AIProviderSafetyBlockError } from './providers';

// Re-exported under their original names so no existing `instanceof GeminiError`
// check anywhere in the app needs to change — these ARE the same classes.
export const GeminiError = AIProviderError;
export const GeminiSafetyBlockError = AIProviderSafetyBlockError;
export type GeminiError = AIProviderError;
export type GeminiSafetyBlockError = AIProviderSafetyBlockError;

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calls the AI provider chain and expects a JSON object back.
 * Only use this for SHORT responses (outline, meta, summaries) where hitting
 * the token limit is exceptional, not expected — a truncated response means a
 * cut-off JSON string, which cannot be reliably repaired. Truncation on one
 * provider is treated as that provider failing and moves to the next one
 * automatically (see providers.ts); this only throws if every provider fails.
 * For long-form content that may legitimately need more than one call's worth
 * of tokens (chapter prose), use generateWithContinuation() instead.
 */
export async function generateJSON<T>(prompt: string, opts?: { temperature?: number; maxOutputTokens?: number }): Promise<T> {
  const { text } = await callWithFallback((key) => process.env[key], prompt, { ...opts, json: true });
  return parseJSONLoose<T>(text);
}

/**
 * Calls the AI provider chain for plain-text (non-JSON) output and reports
 * whether the response was cut off at the token limit. Long-form callers
 * (chapter prose) use `truncated` to decide whether to loop with
 * generateWithContinuation().
 */
export async function generateText(prompt: string, opts?: { temperature?: number; maxOutputTokens?: number }): Promise<{ text: string; truncated: boolean }> {
  return callWithFallback((key) => process.env[key], prompt, { ...opts, json: false });
}

/**
 * Generates long-form text that may exceed a single call's token budget, by
 * resuming with a small continuation prompt when the model gets cut off
 * mid-way. Capped at `maxContinuations` extra calls so a genuinely stuck
 * generation fails loudly instead of looping/costing forever.
 *
 * `buildContinuationPrompt(soFar)` should ask the model to continue writing
 * from the tail of `soFar`, in the same voice, without repeating itself.
 *
 * `opts.onProgress(soFar)`, if given, is awaited after EVERY pass (including
 * the first) — callers use this to checkpoint to the database, so a crash or
 * timeout mid-way loses at most one pass's worth of work, not the whole thing.
 * `opts.resumeFrom`, if given, skips the fresh-start call entirely and treats
 * the supplied text as if it were itself a truncated first pass — for picking
 * a checkpointed draft back up instead of starting over.
 */
export async function generateWithContinuation(
  firstPrompt: string,
  buildContinuationPrompt: (soFar: string) => string,
  opts?: { temperature?: number; maxOutputTokens?: number; maxContinuations?: number; delayMs?: number; resumeFrom?: string; onProgress?: (soFar: string) => Promise<void> },
): Promise<string> {
  const maxContinuations = opts?.maxContinuations ?? 2;
  const delayMs = opts?.delayMs ?? 2000;

  let combined: string;
  let truncated: boolean;

  if (opts?.resumeFrom) {
    combined = opts.resumeFrom;
    truncated = true; // treat the checkpoint as "cut off here" so the loop below resumes it
  } else {
    const first = await generateText(firstPrompt, opts);
    combined = first.text;
    truncated = first.truncated;
    if (opts?.onProgress) await opts.onProgress(combined);
  }

  let attempt = 0;
  while (truncated && attempt < maxContinuations) {
    attempt++;
    await sleep(delayMs);
    const cont = await generateText(buildContinuationPrompt(combined), opts);
    combined = combined.trimEnd() + '\n\n' + cont.text.trimStart();
    truncated = cont.truncated;
    if (opts?.onProgress) await opts.onProgress(combined);
  }

  if (truncated) {
    throw new AIProviderError(`Still truncated after ${maxContinuations} continuation pass(es) — this needs a human look rather than another automatic retry.`);
  }

  return combined.trim();
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
