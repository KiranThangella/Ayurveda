import { NextRequest, NextResponse } from 'next/server';
import { generateText, generateJSON } from '@/lib/ai/gemini';
import {
  buildChapterExpansionPrompt,
  buildChapterSummaryPrompt,
  type ChapterExpansionType,
  type OutlineChapter,
} from '@/lib/ai/prompts';
import { getTopicById, CURRICULUM } from '@/lib/data/curriculum';
import { countWords } from '@/lib/ebook-generator';
import type { GenLang } from '@/lib/ebook-generator';
import { cleanAndDeduplicateContent } from '@/lib/ai/text-cleaner';

interface ExpandRequest {
  topicId: string;
  lang: GenLang;
  chapterPlan: OutlineChapter;
  currentContent: string;
  expansionType?: ChapterExpansionType;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ExpandRequest;
    const { topicId, lang = 'en', chapterPlan, currentContent = '', expansionType = 'deepen' } = body;

    if (!chapterPlan || !chapterPlan.title) {
      return NextResponse.json({ error: 'Missing chapterPlan' }, { status: 400 });
    }

    const topic = getTopicById(topicId) || CURRICULUM[0];

    const prompt = buildChapterExpansionPrompt(
      topic,
      chapterPlan,
      currentContent,
      lang,
      expansionType
    );

    const generated = await generateText(prompt, {
      maxOutputTokens: 6000,
      temperature: 0.75,
    });

    const newAddition = (generated?.text || '').trim();
    let finalContent = currentContent;

    if (currentContent) {
      finalContent = `${currentContent}\n\n${newAddition}`;
    } else {
      finalContent = newAddition;
    }

    const cleaned = cleanAndDeduplicateContent(finalContent);
    finalContent = cleaned.content;

    const wordCount = countWords(finalContent);
    const wordsAdded = countWords(newAddition);

    // Generate summary
    let summary = '';
    try {
      const summaryPrompt = buildChapterSummaryPrompt(chapterPlan, finalContent, lang);
      const parsed = await generateJSON<{ summary: string }>(summaryPrompt, {
        maxOutputTokens: 500,
        temperature: 0.3,
      });
      summary = parsed.summary || '';
    } catch {
      summary = `${chapterPlan.title} (expanded: ${wordCount} words)`;
    }

    return NextResponse.json({
      done: true,
      chapterNumber: chapterPlan.chapterNumber,
      title: chapterPlan.title,
      content: finalContent,
      summary,
      wordCount,
      wordsAdded,
    });
  } catch (error) {
    console.error('Chapter expansion API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Chapter expansion failed' },
      { status: 500 }
    );
  }
}
