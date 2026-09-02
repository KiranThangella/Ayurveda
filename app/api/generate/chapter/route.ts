import { NextRequest, NextResponse } from 'next/server';
import { generateJSON, generateText, GeminiError } from '@/lib/ai/gemini';
import { buildChapterContentPrompt, buildChapterContinuationPrompt, buildChapterSummaryPrompt, type ChapterSummary, type OutlineChapter } from '@/lib/ai/prompts';
import { getTopicById } from '@/lib/data/curriculum';
import type { GenLang } from '@/lib/ebook-generator';
import { cleanAndDeduplicateContent } from '@/lib/ai/text-cleaner';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const {
      topicId,
      lang,
      chapterPlan,
      priorChapters,
      totalChapters,
      resumeFrom,
    }: {
      topicId: string;
      lang: GenLang;
      chapterPlan: OutlineChapter;
      priorChapters: ChapterSummary[];
      totalChapters: number;
      /** Text generated so far from a previous, truncated call to this same route —
       *  when present, this request does exactly ONE more continuation pass instead
       *  of starting over. Lets a long chapter be finished across several short
       *  requests (each comfortably under a Hobby-plan timeout) instead of one long
       *  one. See the `done` flag in the response. */
      resumeFrom?: string;
    } = await req.json();

    if (!topicId || !lang || !chapterPlan || !totalChapters) {
      return NextResponse.json({ error: 'topicId, lang, chapterPlan, totalChapters are required' }, { status: 400 });
    }
    const topic = getTopicById(topicId);
    if (!topic) {
      return NextResponse.json({ error: `Unknown topicId: ${topicId}` }, { status: 404 });
    }

    // Exactly ONE Gemini call per request — either the fresh opening pass, or one
    // continuation pass off `resumeFrom`. Never loops internally, so a single
    // request never has to wait through more than one generation call.
    const { text, truncated } = resumeFrom
      ? await generateText(buildChapterContinuationPrompt(chapterPlan, resumeFrom, lang), { temperature: 0.75, maxOutputTokens: 8192 })
      : await generateText(buildChapterContentPrompt(topic, chapterPlan, priorChapters || [], lang, totalChapters), { temperature: 0.75, maxOutputTokens: 8192 });

    const combined = resumeFrom ? resumeFrom.trimEnd() + '\n\n' + text.trimStart() : text;

    if (truncated) {
      // Not finished yet — hand back what we have so the client can show a
      // "Continue" button that resends this same combined text as resumeFrom.
      return NextResponse.json({
        done: false,
        chapterNumber: chapterPlan.chapterNumber,
        title: chapterPlan.title,
        soFar: combined,
        wordCountSoFar: combined.trim().split(/\s+/).filter(Boolean).length,
      });
    }

    const cleaned = cleanAndDeduplicateContent(combined);
    const content = cleaned.content;
    const wordCount = cleaned.wordCount;

    const { summary } = await generateJSON<{ summary: string }>(
      buildChapterSummaryPrompt(chapterPlan, content, lang),
      { temperature: 0.5, maxOutputTokens: 1500 },
    );

    return NextResponse.json({
      done: true,
      chapterNumber: chapterPlan.chapterNumber,
      title: chapterPlan.title,
      content,
      summary,
      wordCount,
    });
  } catch (err) {
    if (err instanceof GeminiError) {
      return NextResponse.json({ error: err.message }, { status: err.status || 500 });
    }
    return NextResponse.json({ error: 'Unexpected server error generating chapter' }, { status: 500 });
  }
}
