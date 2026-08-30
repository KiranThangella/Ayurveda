import { NextRequest, NextResponse } from 'next/server';
import { generateJSON, generateWithContinuation, GeminiError, GeminiSafetyBlockError } from '@/lib/ai/gemini';
import { buildOutlinePrompt, buildChapterContentPrompt, buildChapterContinuationPrompt, buildChapterSummaryPrompt, buildBookMetaPrompt, type OutlineChapter, type ChapterSummary } from '@/lib/ai/prompts';
import { CURRICULUM, getTopicById } from '@/lib/data/curriculum';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { searchStockImage, buildImageQuery } from '@/lib/images/pexels';
import type { GenLang } from '@/lib/ebook-generator';

export const maxDuration = 90; // one tick does at most one chapter's worth of work

/**
 * Supabase client errors are plain objects ({message, details, hint, code}), not
 * instances of Error — a bare `err instanceof Error ? err.message : 'Unknown
 * error'` silently swallows the actual reason. Pulls a real message out of
 * anything thrown, matching workers/ebook-cron/src/index.ts.
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

const LANGS: GenLang[] = ['en', 'te'];

// Transient failures (network hiccup, Gemini 5xx, rate limit) get retried on the
// current step this many times before the job is given up on. A safety-filter
// block (GeminiSafetyBlockError) is NOT a transient failure — it's marked failed
// on the first occurrence, since retrying the identical prompt only wastes quota
// hitting the same filter again.
const MAX_RETRIES = 3;

/**
 * TICK LOGIC — automated daily generation has moved to the standalone Cloudflare
 * Worker at workers/ebook-cron/ (native Cron Trigger, CPU-time billing means the
 * long Gemini wait doesn't fight a function timeout the way it would on most
 * request/response hosts). This route still exists for manual/on-demand ticks
 * from local dev or debugging — call it directly if you want to advance a job
 * by one step without waiting for the cron.
 *
 * 1. If there's an active job (status outline_pending/chapters_pending/meta_pending) → advance it by one step.
 * 2. If there's no active job → pick the next uncovered (topic, language) pair from the
 *    curriculum and start a new job.
 */
export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret');
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  try {
    // Find an active (unfinished) job
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
      if (!next) {
        return NextResponse.json({ message: 'All 80 topic×language combinations are already generated. Nothing to do.' });
      }
      job = await createJob(supabase, next.topicId, next.lang);
      return NextResponse.json({ step: 'job_created', job });
    }

    if (job.status === 'outline_pending') {
      return await runStep(supabase, job, 'outline_generated', () => advanceOutline(supabase, job));
    }

    if (job.status === 'chapters_pending') {
      return await runStep(supabase, job, 'chapter_generated', () => advanceChapter(supabase, job));
    }

    if (job.status === 'meta_pending') {
      return await runStep(supabase, job, 'book_completed', () => advanceMeta(supabase, job));
    }

    return NextResponse.json({ message: 'No actionable job state.' });
  } catch (err) {
    // Errors reaching here are from job lookup/creation, not from a step advance
    // (those are caught inside runStep, which always updates the job row itself).
    const message = err instanceof GeminiError ? err.message : errorMessage(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * Runs one job-advancing step and guarantees the job row reflects the outcome —
 * this is what was missing before: a thrown error used to just produce a 500
 * response while the job stayed at the same *_pending status forever, so every
 * subsequent tick retried the exact same (permanently-blocked) step indefinitely.
 */
async function runStep(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  job: any,
  stepName: string,
  step: () => Promise<any>,
) {
  try {
    const result = await step();
    return NextResponse.json({ step: stepName, job: result });
  } catch (err) {
    const message = errorMessage(err);

    if (err instanceof GeminiSafetyBlockError) {
      // Permanent — the same prompt will be blocked again. Fail immediately,
      // don't burn retries on it, and don't leave anything in a stuck pending state.
      await markJobFailed(supabase, job, message);
      return NextResponse.json({ step: 'job_failed', reason: 'safety_block', error: message }, { status: 200 });
    }

    const nextRetryCount = (job.retry_count || 0) + 1;
    if (nextRetryCount > MAX_RETRIES) {
      await markJobFailed(supabase, job, `Gave up after ${MAX_RETRIES} retries. Last error: ${message}`);
      return NextResponse.json({ step: 'job_failed', reason: 'max_retries', error: message }, { status: 200 });
    }

    // Transient — leave status as-is so the next tick retries the same step, but
    // record the attempt so it can't retry forever.
    await supabase
      .from('generation_jobs')
      .update({ retry_count: nextRetryCount, error_message: message, updated_at: new Date().toISOString() })
      .eq('id', job.id);
    return NextResponse.json({ step: 'retry_scheduled', attempt: nextRetryCount, of: MAX_RETRIES, error: message }, { status: 200 });
  }
}

async function markJobFailed(supabase: ReturnType<typeof getSupabaseAdmin>, job: any, errorMessage: string) {
  await supabase
    .from('generation_jobs')
    .update({ status: 'failed', error_message: errorMessage, updated_at: new Date().toISOString() })
    .eq('id', job.id);
  // Also flip the ebook row so it doesn't sit stuck at 'outline'/'generating' forever
  // and so pickNextTopicLang() will offer this (topic, language) up again later.
  if (job.ebook_id) {
    await supabase
      .from('ebooks')
      .update({ generation_status: 'failed', updated_at: new Date().toISOString() })
      .eq('id', job.ebook_id);
  }
}

async function pickNextTopicLang(supabase: ReturnType<typeof getSupabaseAdmin>) {
  // 'pending_review' counts as "already generated" too — otherwise the cron would
  // keep re-generating a book that's just sitting in the review queue.
  const { data: existing } = await supabase.from('ebooks').select('topic_id, language').in('generation_status', ['complete', 'pending_review']);
  const done = new Set((existing || []).map((e: any) => `${e.topic_id}::${e.language}`));

  const { data: jobsInProgress } = await supabase.from('generation_jobs').select('topic_id, language').neq('status', 'complete').neq('status', 'failed');
  (jobsInProgress || []).forEach((j: any) => done.add(`${j.topic_id}::${j.language}`));

  for (const topic of CURRICULUM) {
    for (const lang of LANGS) {
      if (!done.has(`${topic.id}::${lang}`)) {
        return { topicId: topic.id, lang };
      }
    }
  }
  return null;
}

async function createJob(supabase: ReturnType<typeof getSupabaseAdmin>, topicId: string, lang: GenLang) {
  const topic = getTopicById(topicId)!;

  const { data: ebook, error: ebookErr } = await supabase
    .from('ebooks')
    .insert({
      slug: `${topicId}-${lang}-${Date.now()}`,
      topic_id: topicId,
      language: lang,
      title: topic.titleEn, // placeholder until meta step overwrites it
      generation_status: 'outline',
      is_free: true,
    })
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

async function advanceOutline(supabase: ReturnType<typeof getSupabaseAdmin>, job: any) {
  const topic = getTopicById(job.topic_id)!;
  const prompt = buildOutlinePrompt(topic, job.language as GenLang);
  const result = await generateJSON<{ chapters: OutlineChapter[] }>(prompt, { temperature: 0.5, maxOutputTokens: 12000 });

  const { data: updated, error } = await supabase
    .from('generation_jobs')
    .update({ outline: result.chapters, status: 'chapters_pending', chapters_done: 0, updated_at: new Date().toISOString() })
    .eq('id', job.id)
    .select()
    .single();
  if (error) throw error;

  await supabase.from('ebooks').update({ chapter_count: result.chapters.length, generation_status: 'generating' }).eq('id', job.ebook_id);
  return updated;
}

async function advanceChapter(supabase: ReturnType<typeof getSupabaseAdmin>, job: any) {
  const topic = getTopicById(job.topic_id)!;
  const outline: OutlineChapter[] = job.outline;
  const nextIdx = job.chapters_done;
  const chapterPlan = outline[nextIdx];

  const { data: priorRows } = await supabase
    .from('ebook_chapters')
    .select('chapter_number, title, summary')
    .eq('ebook_id', job.ebook_id)
    .order('chapter_number', { ascending: true });
  const priorChapters: ChapterSummary[] = (priorRows || []).map((r: any) => ({ chapterNumber: r.chapter_number, title: r.title, summary: r.summary }));

  const lang = job.language as GenLang;

  // If the previous attempt at THIS chapter was interrupted mid-way (crash,
  // timeout, redeploy), resume from the checkpointed draft instead of
  // regenerating from scratch and burning tokens on content we already have.
  const resumeFrom: string | undefined = job.chapter_draft_content ?? undefined;

  // Content is generated as plain text via generateWithContinuation: if a chapter
  // needs more than one call's worth of tokens to cover everything in real depth,
  // it resumes automatically (up to 2 extra passes, ~2s apart) instead of getting
  // silently truncated and failing to parse. onProgress checkpoints after every
  // pass, so an interruption here loses at most one pass, not the whole chapter.
  const content = await generateWithContinuation(
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

  // Summary is generated separately, from the real finished content — not
  // predicted mid-write — and is short enough that truncation here would be
  // exceptional rather than expected.
  const { summary } = await generateJSON<{ summary: string }>(
    buildChapterSummaryPrompt(chapterPlan, content, lang),
    { temperature: 0.5, maxOutputTokens: 1500 },
  );

  // The chapter title is already fixed by the outline step — nothing to regenerate.
  const title = chapterPlan.title;

  // Attach a free relevant stock image to this chapter — best-effort, never blocks generation
  let imageUrl: string | null = null;
  let imageCredit: string | null = null;
  try {
    const query = buildImageQuery(topic.titleEn, title);
    const image = await searchStockImage(query);
    if (image) {
      imageUrl = image.url;
      imageCredit = `Photo by ${image.photographer} on Pexels`;
    }
  } catch {
    // image is a nice-to-have, not a generation blocker
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

  // Chapter is now durably committed to ebook_chapters — clear the draft
  // checkpoint so the next chapter starts clean instead of "resuming" this one.
  await supabase.from('generation_jobs').update({ chapter_draft_content: null }).eq('id', job.id);

  const chaptersDone = nextIdx + 1;
  const nextStatus = chaptersDone >= outline.length ? 'meta_pending' : 'chapters_pending';

  const { data: updated, error } = await supabase
    .from('generation_jobs')
    .update({ chapters_done: chaptersDone, status: nextStatus, updated_at: new Date().toISOString() })
    .eq('id', job.id)
    .select()
    .single();
  if (error) throw error;

  return updated;
}

async function advanceMeta(supabase: ReturnType<typeof getSupabaseAdmin>, job: any) {
  const topic = getTopicById(job.topic_id)!;

  const { data: chapterRows } = await supabase
    .from('ebook_chapters')
    .select('chapter_number, title, summary, word_count')
    .eq('ebook_id', job.ebook_id)
    .order('chapter_number', { ascending: true });

  const summaries: ChapterSummary[] = (chapterRows || []).map((r: any) => ({ chapterNumber: r.chapter_number, title: r.title, summary: r.summary }));
  const totalWords = (chapterRows || []).reduce((sum: number, r: any) => sum + (r.word_count || 0), 0);

  const prompt = buildBookMetaPrompt(topic, summaries, job.language as GenLang);
  const meta = await generateJSON<{ title: string; subtitle: string; description: string }>(prompt, { temperature: 0.6 });

  let coverUrl: string | null = null;
  try {
    const cover = await searchStockImage(buildImageQuery(topic.titleEn));
    coverUrl = cover?.url || null;
  } catch {
    // cover image best-effort
  }

  // Pregnancy / children / mental-health / advanced-Panchakarma topics are held for
  // human sign-off instead of auto-publishing. 'pending_review' is excluded from the
  // public RLS read policy (see supabase-schema.sql), so it's invisible to readers
  // until someone approves it from the admin panel — AI output on these topics goes
  // straight to publish otherwise, which isn't acceptable for health-adjacent content.
  const finalStatus = topic.requiresReview ? 'pending_review' : 'complete';

  await supabase
    .from('ebooks')
    .update({
      title: meta.title,
      subtitle: meta.subtitle,
      description: meta.description,
      total_words: totalWords,
      cover_query: buildImageQuery(topic.titleEn),
      cover_url: coverUrl,
      generation_status: finalStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', job.ebook_id);

  const { data: updatedJob, error } = await supabase
    .from('generation_jobs')
    .update({ status: 'complete', updated_at: new Date().toISOString() })
    .eq('id', job.id)
    .select()
    .single();
  if (error) throw error;

  return updatedJob;
}
