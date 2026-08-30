import { NextRequest, NextResponse } from 'next/server';
import { generateJSON, GeminiError } from '@/lib/ai/gemini';
import { buildOutlinePrompt, type OutlineChapter } from '@/lib/ai/prompts';
import { getTopicById } from '@/lib/data/curriculum';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { assertAdmin } from '@/lib/auth-server';
import type { GenLang } from '@/lib/ebook-generator';

export const maxDuration = 60;

/**
 * Admin wizard equivalent of tick's createJob+advanceOutline, but for an
 * explicitly-picked topic (the automated tick/Worker pipeline auto-picks the
 * next uncovered curriculum topic; here the admin picked one from the UI).
 *
 * Everything from here on is persisted to the SAME tables the Cloudflare
 * Worker uses (ebooks, ebook_chapters, generation_jobs) — so closing the tab,
 * refreshing, or the admin coming back tomorrow all resume from whatever was
 * last saved, instead of losing in-progress work that only lived in React
 * state. This is the fix for: generating a chapter in the wizard did not used
 * to save it anywhere until the final "Finalize" click.
 */
export async function POST(req: NextRequest) {
  try {
    await assertAdmin(req);
  } catch (res) {
    if (res instanceof Response) return res;
    throw res;
  }

  try {
    const { topicId, lang }: { topicId: string; lang: GenLang } = await req.json();
    const topic = getTopicById(topicId);
    if (!topic) return NextResponse.json({ error: `Unknown topicId: ${topicId}` }, { status: 404 });

    const supabase = getSupabaseAdmin();

    // Resume: an active (not complete/failed) job already exists for this exact
    // (topic, language) pair — same uniqueness rule the automated pipeline relies
    // on (idx_jobs_topic_lang_active), so the wizard and the cron never fight
    // over the same book.
    const { data: existingJob } = await supabase
      .from('generation_jobs')
      .select('*')
      .eq('topic_id', topicId)
      .eq('language', lang)
      .not('status', 'in', '(complete,failed)')
      .maybeSingle();

    let job = existingJob;

    if (!job) {
      const { data: ebook, error: ebookErr } = await supabase
        .from('ebooks')
        .insert({
          slug: `${topicId}-${lang}-${Date.now()}`,
          topic_id: topicId,
          language: lang,
          title: topic.titleEn,
          generation_status: 'outline',
          is_free: true,
        })
        .select()
        .single();
      if (ebookErr) throw ebookErr;

      const { data: newJob, error: jobErr } = await supabase
        .from('generation_jobs')
        .insert({ topic_id: topicId, language: lang, ebook_id: ebook.id, status: 'outline_pending', chapters_done: 0 })
        .select()
        .single();
      if (jobErr) throw jobErr;
      job = newJob;
    }

    // Outline not generated yet (brand new job, or a previous attempt crashed
    // before it saved) — generate it now, once.
    if (!job.outline) {
      const prompt = buildOutlinePrompt(topic, lang);
      const result = await generateJSON<{ chapters: OutlineChapter[] }>(prompt, { temperature: 0.5, maxOutputTokens: 12000 });

      const { data: updatedJob, error } = await supabase
        .from('generation_jobs')
        .update({ outline: result.chapters, status: 'chapters_pending', updated_at: new Date().toISOString() })
        .eq('id', job.id)
        .select()
        .single();
      if (error) throw error;
      job = updatedJob;

      await supabase.from('ebooks').update({ chapter_count: result.chapters.length, generation_status: 'generating' }).eq('id', job.ebook_id);
    }

    const { data: chapterRows } = await supabase
      .from('ebook_chapters')
      .select('chapter_number, title, content, summary, word_count')
      .eq('ebook_id', job.ebook_id)
      .order('chapter_number', { ascending: true });

    return NextResponse.json({
      jobId: job.id,
      ebookId: job.ebook_id,
      outline: job.outline,
      chaptersDone: job.chapters_done,
      chapters: chapterRows || [],
      draftInProgress: !!job.chapter_draft_content,
    });
  } catch (err) {
    if (err instanceof GeminiError) return NextResponse.json({ error: err.message }, { status: err.status || 500 });
    const message = err && typeof err === 'object' && 'message' in err ? String((err as { message: unknown }).message) : 'Unexpected server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
