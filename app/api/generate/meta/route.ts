import { NextRequest, NextResponse } from 'next/server';
import { generateJSON, GeminiError } from '@/lib/ai/gemini';
import { buildBookMetaPrompt, type ChapterSummary } from '@/lib/ai/prompts';
import { getTopicById } from '@/lib/data/curriculum';
import type { GenLang } from '@/lib/ebook-generator';

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { topicId, lang, chapterSummaries }: { topicId: string; lang: GenLang; chapterSummaries: ChapterSummary[] } = await req.json();

    if (!topicId || !lang || !chapterSummaries?.length) {
      return NextResponse.json({ error: 'topicId, lang, chapterSummaries are required' }, { status: 400 });
    }
    const topic = getTopicById(topicId);
    if (!topic) {
      return NextResponse.json({ error: `Unknown topicId: ${topicId}` }, { status: 404 });
    }

    const prompt = buildBookMetaPrompt(topic, chapterSummaries, lang);
    const result = await generateJSON<{ title: string; subtitle: string; description: string }>(prompt, { temperature: 0.6 });

    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof GeminiError) {
      return NextResponse.json({ error: err.message }, { status: err.status || 500 });
    }
    return NextResponse.json({ error: 'Unexpected server error generating book meta' }, { status: 500 });
  }
}
