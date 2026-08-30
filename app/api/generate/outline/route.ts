import { NextRequest, NextResponse } from 'next/server';
import { generateJSON, GeminiError } from '@/lib/ai/gemini';
import { buildOutlinePrompt, type OutlineChapter } from '@/lib/ai/prompts';
import { getTopicById } from '@/lib/data/curriculum';
import type { GenLang } from '@/lib/ebook-generator';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { topicId, lang, targetChapters } = await req.json();

    if (!topicId || !lang) {
      return NextResponse.json({ error: 'topicId and lang are required' }, { status: 400 });
    }
    const topic = getTopicById(topicId);
    if (!topic) {
      return NextResponse.json({ error: `Unknown topicId: ${topicId}` }, { status: 404 });
    }

    const prompt = buildOutlinePrompt(topic, lang as GenLang, targetChapters);
    const result = await generateJSON<{ chapters: OutlineChapter[] }>(prompt, { temperature: 0.5, maxOutputTokens: 12000 });

    if (!result.chapters?.length) {
      return NextResponse.json({ error: 'Model returned an empty outline' }, { status: 502 });
    }

    // Sanity check: verify every mustCover point was assigned somewhere
    const coveredPoints = new Set(result.chapters.flatMap((c) => c.coversPoints));
    const missing = topic.mustCover.filter((p) => !Array.from(coveredPoints).some((cp) => cp.includes(p.slice(0, 20))));

    return NextResponse.json({ topic, outline: result.chapters, warnings: missing.length ? { possiblyMissed: missing } : undefined });
  } catch (err) {
    if (err instanceof GeminiError) {
      return NextResponse.json({ error: err.message }, { status: err.status || 500 });
    }
    return NextResponse.json({ error: 'Unexpected server error generating outline' }, { status: 500 });
  }
}
