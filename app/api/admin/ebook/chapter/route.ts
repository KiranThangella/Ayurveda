import { NextRequest, NextResponse } from 'next/server';
import { generateJSON, generateText, GeminiError } from '@/lib/ai/gemini';
import { buildChapterContentPrompt, buildChapterContinuationPrompt, buildChapterSummaryPrompt, type OutlineChapter, type ChapterSummary } from '@/lib/ai/prompts';
import { getTopicById } from '@/lib/data/curriculum';
import { searchStockImage, buildImageQuery } from '@/lib/images/pexels';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { assertAdmin } from '@/lib/auth-server';
import type { GenLang } from '@/lib/ebook-generator';
import { cleanAndDeduplicateContent } from '@/lib/ai/text-cleaner';

export const maxDuration = 60;

/**
 * Does exactly ONE Gemini call per request (fresh pass, or one continuation off
 * a checkpointed draft) — same single-pass discipline as /api/generate/chapter,
 * kept separate here because this version also PERSISTS immediately: a
 * truncated pass checkpoints its partial text into generation_jobs.chapter_
 * draft_content; a finished chapter is upserted into ebook_chapters right away
 * (unique(ebook_id, chapter_number) means retrying never creates a duplicate
 * row — it just updates the same one). Nothing here waits for "Finalize" to
 * become durable.
 */
export async function POST(req: NextRequest) {
  try {
    await assertAdmin(req);
  } catch (res) {
    if (res instanceof Response) return res;
    throw res;
  }

  try {
    const { jobId }: { jobId: string } = await req.json();
    const supabase = getSupabaseAdmin();

    const { data: job, error: jobErr } = await supabase.from('generation_jobs').select('*').eq('id', jobId).single();
    if (jobErr || !job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

    const outline: OutlineChapter[] = job.outline || [];
    if (job.chapters_done >= outline.length) {
      return NextResponse.json({ kind: 'nothing_to_do' });
    }

    const topic = getTopicById(job.topic_id)!;
    const lang = job.language as GenLang;
    const chapterPlan = outline[job.chapters_done];

    const { data: priorRows } = await supabase
      .from('ebook_chapters')
      .select('chapter_number, title, summary')
      .eq('ebook_id', job.ebook_id)
      .order('chapter_number', { ascending: true });
    const priorChapters: ChapterSummary[] = (priorRows || []).map((r) => ({ chapterNumber: r.chapter_number, title: r.title, summary: r.summary }));

    const resumeFrom: string | undefined = job.chapter_draft_content ?? undefined;
    const { text, truncated } = resumeFrom
      ? await generateText(buildChapterContinuationPrompt(chapterPlan, resumeFrom, lang), { temperature: 0.75, maxOutputTokens: 8192 })
      : await generateText(buildChapterContentPrompt(topic, chapterPlan, priorChapters, lang, outline.length), { temperature: 0.75, maxOutputTokens: 8192 });

    const combined = resumeFrom ? resumeFrom.trimEnd() + '\n\n' + text.trimStart() : text;

    if (truncated) {
      await supabase.from('generation_jobs').update({ chapter_draft_content: combined, updated_at: new Date().toISOString() }).eq('id', jobId);
      return NextResponse.json({
        kind: 'partial',
        chapterNumber: chapterPlan.chapterNumber,
        title: chapterPlan.title,
        wordCountSoFar: combined.trim().split(/\s+/).filter(Boolean).length,
      });
    }

    const cleaned = cleanAndDeduplicateContent(combined);
    const content = cleaned.content;
    const wordCount = cleaned.wordCount;

    const { summary } = await generateJSON<{ summary: string }>(buildChapterSummaryPrompt(chapterPlan, content, lang), { temperature: 0.5, maxOutputTokens: 1500 });

    let imageUrl: string | null = null;
    let imageCredit: string | null = null;
    try {
      const image = await searchStockImage(buildImageQuery(topic.titleEn, chapterPlan.title));
      if (image) {
        imageUrl = image.url;
        imageCredit = `Photo by ${image.photographer} on Pexels`;
      }
    } catch {
      // best-effort only
    }

    // upsert, not insert — if this exact chapter was already saved by a prior
    // attempt (retry after a crash), this updates that row instead of erroring
    // on the unique(ebook_id, chapter_number) constraint or creating a duplicate.
    const { error: upsertErr } = await supabase
      .from('ebook_chapters')
      .upsert(
        {
          ebook_id: job.ebook_id,
          chapter_number: chapterPlan.chapterNumber,
          title: chapterPlan.title,
          content,
          summary,
          covers_points: chapterPlan.coversPoints,
          word_count: wordCount,
          image_url: imageUrl,
          image_credit: imageCredit,
        },
        { onConflict: 'ebook_id,chapter_number' },
      );
    if (upsertErr) throw upsertErr;

    const chaptersDone = job.chapters_done + 1;
    const nextStatus = chaptersDone >= outline.length ? 'meta_pending' : 'chapters_pending';

    await supabase
      .from('generation_jobs')
      .update({ chapters_done: chaptersDone, status: nextStatus, chapter_draft_content: null, updated_at: new Date().toISOString() })
      .eq('id', jobId);

    const { data: allRows } = await supabase.from('ebook_chapters').select('word_count').eq('ebook_id', job.ebook_id);
    const totalWords = (allRows || []).reduce((sum, r) => sum + (r.word_count || 0), 0);
    await supabase.from('ebooks').update({ chapter_count: chaptersDone, total_words: totalWords }).eq('id', job.ebook_id);

    return NextResponse.json({
      kind: 'done',
      chapterNumber: chapterPlan.chapterNumber,
      title: chapterPlan.title,
      content,
      summary,
      wordCount,
      allComplete: chaptersDone >= outline.length,
    });
  } catch (err) {
    if (err instanceof GeminiError) return NextResponse.json({ error: err.message }, { status: err.status || 500 });
    const message = err && typeof err === 'object' && 'message' in err ? String((err as { message: unknown }).message) : 'Unexpected server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
