import { NextRequest, NextResponse } from 'next/server';
import { generateJSON, GeminiError } from '@/lib/ai/gemini';
import { buildBookMetaPrompt, type ChapterSummary } from '@/lib/ai/prompts';
import { getTopicById } from '@/lib/data/curriculum';
import { searchStockImage, buildImageQuery } from '@/lib/images/pexels';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { assertAdmin } from '@/lib/auth-server';
import type { GenLang } from '@/lib/ebook-generator';

export const maxDuration = 60;

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

    const topic = getTopicById(job.topic_id)!;
    const lang = job.language as GenLang;

    const { data: chapterRows } = await supabase
      .from('ebook_chapters')
      .select('chapter_number, title, summary, word_count')
      .eq('ebook_id', job.ebook_id)
      .order('chapter_number', { ascending: true });

    const summaries: ChapterSummary[] = (chapterRows || []).map((r) => ({ chapterNumber: r.chapter_number, title: r.title, summary: r.summary }));
    const totalWords = (chapterRows || []).reduce((sum, r) => sum + (r.word_count || 0), 0);

    const meta = await generateJSON<{ title: string; subtitle: string; description: string }>(
      buildBookMetaPrompt(topic, summaries, lang),
      { temperature: 0.6, maxOutputTokens: 1500 },
    );

    let coverUrl: string | null = null;
    try {
      const cover = await searchStockImage(buildImageQuery(topic.titleEn));
      coverUrl = cover?.url || null;
    } catch {
      // best-effort only
    }

    // Same human-review gate the automated pipeline uses — see supabase-schema.sql.
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

    await supabase.from('generation_jobs').update({ status: 'complete', updated_at: new Date().toISOString() }).eq('id', jobId);

    return NextResponse.json({ ebookId: job.ebook_id, title: meta.title, status: finalStatus });
  } catch (err) {
    if (err instanceof GeminiError) return NextResponse.json({ error: err.message }, { status: err.status || 500 });
    const message = err && typeof err === 'object' && 'message' in err ? String((err as { message: unknown }).message) : 'Unexpected server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
