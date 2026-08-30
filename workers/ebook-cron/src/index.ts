import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { CURRICULUM, getTopicById } from './curriculum';
import { buildOutlinePrompt, buildChapterContentPrompt, buildChapterContinuationPrompt, buildChapterSummaryPrompt, buildBookMetaPrompt } from './prompts';
import { generateJSON, generateWithContinuation, GeminiError, GeminiSafetyBlockError } from './gemini';
import { searchStockImage, buildImageQuery } from './images';
import type { Env, GenLang, OutlineChapter, ChapterSummary } from './types';

const LANGS: GenLang[] = ['en', 'te'];

// Same policy as the Next.js tick route (app/api/generate/tick/route.ts) — kept in
// sync deliberately since both can advance the same job.
const MAX_RETRIES = 3;

/**
 * Supabase client errors are plain objects ({message, details, hint, code}), not
 * instances of Error — so a bare `err instanceof Error ? err.message : 'Unknown
 * error'` silently swallows the actual reason (missing table, bad key, RLS, etc.)
 * and reports nothing useful. This pulls a real message out of anything thrown.
 */
function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (err && typeof err === 'object' && 'message' in err) return String((err as { message: unknown }).message);
  if (typeof err === 'string') return err;
  try {
    return JSON.stringify(err);
  } catch {
    return 'Unknown error';
  }
}

export default {
  // Native Cloudflare Cron Trigger — fires every 20 minutes per wrangler.toml [triggers].
  // No GitHub Actions, no external scheduler needed.
  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    // runTick() itself never throws for a step-advance failure anymore (it always
    // writes the outcome to the job row first — see runStep below). This catch is
    // only a backstop for failures before a job is even loaded (e.g. Supabase
    // unreachable), so they at least get logged instead of vanishing as a silently
    // dropped promise rejection.
    ctx.waitUntil(runTick(env).catch((err) => console.error('scheduled tick failed:', errorMessage(err))));
  },

  // Optional: lets you trigger a tick manually via HTTP for testing, without waiting
  // for the next 20-minute cron. Protected by a shared secret header. CORS is
  // enabled so the admin dashboard (a different origin, on Vercel) can call this
  // directly from the browser — calling it through a Vercel API route instead
  // would tie up that serverless function for the whole 15-40s wait, which is
  // exactly the kind of call that times out on Vercel's Hobby plan. A direct
  // browser → Worker call has no such limit.
  async fetch(req: Request, env: Env): Promise<Response> {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-trigger-secret',
    };

    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }
    if (req.method !== 'POST') {
      return new Response('POST only. Send x-trigger-secret header to run a manual tick.', { status: 405, headers: corsHeaders });
    }
    const secret = req.headers.get('x-trigger-secret');
    if (!env.MANUAL_TRIGGER_SECRET || secret !== env.MANUAL_TRIGGER_SECRET) {
      return new Response(JSON.stringify({ error: 'Unauthorized — wrong or missing trigger secret.' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    try {
      const result = await runTick(env);
      return new Response(JSON.stringify(result), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    } catch (err) {
      const message = errorMessage(err);
      return new Response(JSON.stringify({ error: message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
  },
};

async function runTick(env: Env) {
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

  const { data: activeJobs, error: jobErr } = await supabase
    .from('generation_jobs')
    .select('*')
    .in('status', ['outline_pending', 'chapters_pending', 'meta_pending'])
    .order('created_at', { ascending: true })
    .limit(1);
  if (jobErr) throw jobErr;

  let job = activeJobs?.[0];

  if (!job) {
    const next = await pickNextTopicLang(supabase);
    if (!next) return { message: 'All 80 topic×language combinations are already generated. Nothing to do.' };
    job = await createJob(supabase, next.topicId, next.lang);
    return { step: 'job_created', jobId: job.id, topic: next.topicId, lang: next.lang };
  }

  if (job.status === 'outline_pending') {
    return runStep(supabase, job, () => advanceOutline(env, supabase, job), 'outline_generated');
  }
  if (job.status === 'chapters_pending') {
    return runStep(supabase, job, () => advanceChapter(env, supabase, job), 'chapter_generated');
  }
  if (job.status === 'meta_pending') {
    return runStep(supabase, job, () => advanceMeta(env, supabase, job), 'book_completed');
  }

  return { message: 'No actionable job state.' };
}

/**
 * Runs one job-advancing step and guarantees the job row reflects the outcome.
 * Previously a thrown error here propagated straight out of runTick(), and since
 * scheduled() didn't catch it either, the failure was silently dropped — the job
 * stayed at the same *_pending status and the next cron tick (20 min later) just
 * retried the identical step again. For a Gemini-safety-filter block that meant
 * an infinite retry loop that never surfaced anywhere.
 */
async function runStep(supabase: SupabaseClient, job: any, step: () => Promise<any>, stepName: string) {
  try {
    const result = await step();
    return { step: stepName, jobId: job.id, ...result };
  } catch (err) {
    const message = errorMessage(err);

    if (err instanceof GeminiSafetyBlockError) {
      // Permanent — retrying the identical prompt hits the same filter again.
      await markJobFailed(supabase, job, message);
      return { step: 'job_failed', reason: 'safety_block', jobId: job.id, error: message };
    }

    const nextRetryCount = (job.retry_count || 0) + 1;
    if (nextRetryCount > MAX_RETRIES) {
      await markJobFailed(supabase, job, `Gave up after ${MAX_RETRIES} retries. Last error: ${message}`);
      return { step: 'job_failed', reason: 'max_retries', jobId: job.id, error: message };
    }

    await supabase
      .from('generation_jobs')
      .update({ retry_count: nextRetryCount, error_message: message, updated_at: new Date().toISOString() })
      .eq('id', job.id);
    return { step: 'retry_scheduled', jobId: job.id, attempt: nextRetryCount, of: MAX_RETRIES, error: message };
  }
}

async function markJobFailed(supabase: SupabaseClient, job: any, errorMessage: string) {
  await supabase
    .from('generation_jobs')
    .update({ status: 'failed', error_message: errorMessage, updated_at: new Date().toISOString() })
    .eq('id', job.id);
  if (job.ebook_id) {
    await supabase
      .from('ebooks')
      .update({ generation_status: 'failed', updated_at: new Date().toISOString() })
      .eq('id', job.ebook_id);
  }
}

async function pickNextTopicLang(supabase: SupabaseClient) {
  // 'pending_review' counts as "already generated" too, so the cron doesn't
  // regenerate a book that's just waiting in the review queue.
  const { data: existing } = await supabase.from('ebooks').select('topic_id, language').in('generation_status', ['complete', 'pending_review']);
  const done = new Set((existing || []).map((e: any) => `${e.topic_id}::${e.language}`));

  const { data: jobsInProgress } = await supabase.from('generation_jobs').select('topic_id, language').neq('status', 'complete').neq('status', 'failed');
  (jobsInProgress || []).forEach((j: any) => done.add(`${j.topic_id}::${j.language}`));

  for (const topic of CURRICULUM) {
    for (const lang of LANGS) {
      if (!done.has(`${topic.id}::${lang}`)) return { topicId: topic.id, lang };
    }
  }
  return null;
}

async function createJob(supabase: SupabaseClient, topicId: string, lang: GenLang) {
  const topic = getTopicById(topicId)!;

  const { data: ebook, error: ebookErr } = await supabase
    .from('ebooks')
    .insert({ slug: `${topicId}-${lang}-${Date.now()}`, topic_id: topicId, language: lang, title: topic.titleEn, generation_status: 'outline', is_free: true })
    .select()
    .single();
  if (ebookErr) throw ebookErr;

  const { data: job, error: jobErr } = await supabase
    .from('generation_jobs')
    .insert({ topic_id: topicId, language: lang, ebook_id: ebook.id, status: 'outline_pending', chapters_done: 0 })
    .select()
    .single();
  if (jobErr) throw jobErr;

  return job;
}

async function advanceOutline(env: Env, supabase: SupabaseClient, job: any) {
  const topic = getTopicById(job.topic_id)!;
  const prompt = buildOutlinePrompt(topic, job.language as GenLang);
  const { data: result, provider } = await generateJSON<{ chapters: OutlineChapter[] }>(env, prompt, { temperature: 0.5, maxOutputTokens: 12000 });

  await supabase.from('generation_jobs').update({ outline: result.chapters, status: 'chapters_pending', chapters_done: 0, updated_at: new Date().toISOString() }).eq('id', job.id);
  await supabase.from('ebooks').update({ chapter_count: result.chapters.length, generation_status: 'generating' }).eq('id', job.ebook_id);
  return { provider };
}

async function advanceChapter(env: Env, supabase: SupabaseClient, job: any) {
  const topic = getTopicById(job.topic_id)!;
  const outline: OutlineChapter[] = job.outline;
  const nextIdx = job.chapters_done;
  const chapterPlan = outline[nextIdx];

  const { data: priorRows } = await supabase.from('ebook_chapters').select('chapter_number, title, summary').eq('ebook_id', job.ebook_id).order('chapter_number', { ascending: true });
  const priorChapters: ChapterSummary[] = (priorRows || []).map((r: any) => ({ chapterNumber: r.chapter_number, title: r.title, summary: r.summary }));

  const lang = job.language as GenLang;

  // If the previous attempt at THIS chapter was interrupted mid-way, resume
  // from the checkpointed draft instead of regenerating from scratch.
  const resumeFrom: string | undefined = job.chapter_draft_content ?? undefined;

  // Content is generated as plain text via generateWithContinuation: if a chapter
  // needs more than one call's worth of tokens to cover everything in real depth,
  // it resumes automatically (up to 2 extra passes, ~2s apart) instead of getting
  // silently truncated and failing to parse. onProgress checkpoints after every
  // pass, so an interruption here loses at most one pass, not the whole chapter.
  const { content, provider: chapterProvider } = await generateWithContinuation(
    env,
    buildChapterContentPrompt(topic, chapterPlan, priorChapters, lang, outline.length),
    (soFar) => buildChapterContinuationPrompt(chapterPlan, soFar, lang),
    {
      temperature: 0.75,
      maxOutputTokens: 8192,
      resumeFrom,
      onProgress: async (soFar) => {
        await supabase.from('generation_jobs').update({ chapter_draft_content: soFar }).eq('id', job.id);
      },
    },
  );
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

  // Summary is generated separately, from the real finished content.
  const { data: summaryData } = await generateJSON<{ summary: string }>(
    env,
    buildChapterSummaryPrompt(chapterPlan, content, lang),
    { temperature: 0.5, maxOutputTokens: 1500 },
  );
  const summary = summaryData.summary;

  // The chapter title is already fixed by the outline step — nothing to regenerate.
  const title = chapterPlan.title;

  let imageUrl: string | null = null;
  let imageCredit: string | null = null;
  try {
    const image = await searchStockImage(env, buildImageQuery(topic.titleEn, title));
    if (image) {
      imageUrl = image.url;
      imageCredit = `Photo by ${image.photographer} on Pexels`;
    }
  } catch {
    // image is best-effort, never blocks chapter generation
  }

  await supabase.from('ebook_chapters').insert({
    ebook_id: job.ebook_id,
    chapter_number: chapterPlan.chapterNumber,
    title,
    content,
    summary,
    covers_points: chapterPlan.coversPoints,
    word_count: wordCount,
    image_url: imageUrl,
    image_credit: imageCredit,
  });

  // Chapter is now durably committed — clear the draft checkpoint so the next
  // chapter starts clean instead of "resuming" this one.
  await supabase.from('generation_jobs').update({ chapter_draft_content: null }).eq('id', job.id);

  const chaptersDone = nextIdx + 1;
  const nextStatus = chaptersDone >= outline.length ? 'meta_pending' : 'chapters_pending';
  await supabase.from('generation_jobs').update({ chapters_done: chaptersDone, status: nextStatus, updated_at: new Date().toISOString() }).eq('id', job.id);

  return { chapterNumber: chapterPlan.chapterNumber, provider: chapterProvider };
}

async function advanceMeta(env: Env, supabase: SupabaseClient, job: any) {
  const topic = getTopicById(job.topic_id)!;

  const { data: chapterRows } = await supabase.from('ebook_chapters').select('chapter_number, title, summary, word_count').eq('ebook_id', job.ebook_id).order('chapter_number', { ascending: true });
  const summaries: ChapterSummary[] = (chapterRows || []).map((r: any) => ({ chapterNumber: r.chapter_number, title: r.title, summary: r.summary }));
  const totalWords = (chapterRows || []).reduce((sum: number, r: any) => sum + (r.word_count || 0), 0);

  const prompt = buildBookMetaPrompt(topic, summaries, job.language as GenLang);
  const { data: meta, provider } = await generateJSON<{ title: string; subtitle: string; description: string }>(env, prompt, { temperature: 0.6 });

  let coverUrl: string | null = null;
  try {
    const cover = await searchStockImage(env, buildImageQuery(topic.titleEn));
    coverUrl = cover?.url || null;
  } catch {
    // cover image best-effort
  }

  // Sensitive topics (pregnancy/children/mental-health/advanced Panchakarma) go to
  // 'pending_review' instead of 'complete' — RLS excludes that status from public
  // reads, so it stays invisible until a human approves it in the admin panel.
  const finalStatus = topic.requiresReview ? 'pending_review' : 'complete';

  await supabase.from('ebooks').update({
    title: meta.title,
    subtitle: meta.subtitle,
    description: meta.description,
    total_words: totalWords,
    cover_query: buildImageQuery(topic.titleEn),
    cover_url: coverUrl,
    generation_status: finalStatus,
    updated_at: new Date().toISOString(),
  }).eq('id', job.ebook_id);

  await supabase.from('generation_jobs').update({ status: 'complete', updated_at: new Date().toISOString() }).eq('id', job.id);
  return { provider };
}
