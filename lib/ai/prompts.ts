import type { CurriculumTopic } from '@/lib/data/curriculum';
import type { GenLang } from '@/lib/ebook-generator';

/**
 * PROMPT ENGINEERING NOTES (read this before editing prompts)
 * --------------------------------------------------------------
 * The old system generated content from fixed templates with only the topic
 * name swapped in. To make "ఆయుర్వేదం antha ikkade undi" actually true, three
 * problems had to be solved with prompting, not just a better model:
 *
 * 1. COVERAGE  — an LLM asked to "write about X" will default to the same
 *    5-6 generic points every time. Fix: the outline prompt is built from
 *    curriculum.mustCover, and the model is required to map every point to
 *    a specific chapter before writing a single word of content.
 *
 * 2. CONTINUITY — generating chapters independently causes repetition
 *    (each chapter re-explaining "what is Ayurveda") and gaps (nothing
 *    connects chapter 3 to chapter 4). Fix: every chapter prompt receives a
 *    running compressed memory of prior chapters (~80-120 words each, not
 *    full text — keeps token cost sane) and is explicitly told what NOT to
 *    re-explain.
 *
 * 3. DEPTH vs PADDING — "make it 2000 words" produces filler. Fix: depth is
 *    requested as required *content elements* (classical term + meaning,
 *    mechanism/reasoning, real-life example, practical application, safety
 *    boundary) rather than a word count alone. Word count is a floor, not
 *    the goal.
 */

export interface ChapterSummary {
  chapterNumber: number;
  title: string;
  /** 80-120 word compressed summary of what this chapter actually covered */
  summary: string;
}

export interface OutlineChapter {
  chapterNumber: number;
  title: string;
  /** Which mustCover points from the curriculum this chapter is responsible for */
  coversPoints: string[];
  /** 1-2 sentence brief telling the writer-model what this chapter should achieve */
  brief: string;
}

const LANG_NAME: Record<GenLang, string> = { en: 'English', te: 'Telugu (తెలుగు script, not transliteration)' };

/**
 * Builds the prompt that asks the model to plan a full book BEFORE writing
 * any chapter. This is the step that guarantees no mustCover point is missed
 * and that prevents overlapping/duplicate chapters.
 */
export function buildOutlinePrompt(topic: CurriculumTopic, lang: GenLang, targetChapters?: number): string {
  const chapterCount = targetChapters ?? topic.recommendedChapters;
  const langName = LANG_NAME[lang];

  return `You are a senior Ayurveda scholar and instructional editor planning a nonfiction book for a serious general reader — someone who wants real, classically-grounded knowledge, not a lifestyle-blog summary.

BOOK TOPIC: "${topic.titleEn}" (${topic.titleTe})
SCOPE (stay inside this — do not drift into other books' territory): ${topic.scopeEn}
CLASSICAL SOURCES TO GROUND THIS IN (reference by name/concept, never fabricate a quoted verse): ${topic.classicalSources.join(', ')}
TARGET LANGUAGE FOR THE FINAL BOOK: ${langName}
REQUIRED CHAPTER COUNT: exactly ${chapterCount} chapters, including a short introduction chapter and a closing/practical-integration chapter.

MUST-COVER POINTS — every single one of these must be clearly assigned to at least one chapter. None may be dropped, and none may be silently merged away:
${topic.mustCover.map((p, i) => `${i + 1}. ${p}`).join('\n')}

TASK: Produce a chapter-by-chapter outline that:
- Assigns every must-cover point above to a specific chapter (a point may split across two chapters if it is large, but must not be omitted).
- Orders chapters pedagogically: foundational concept → mechanism/detail → practical application → safety/integration.
- Avoids any two chapters covering the same ground — each chapter must have a distinct, non-overlapping job.
- Chapter 1 should be a genuine orientation to THIS topic specifically (not a generic "welcome to Ayurveda" chapter — assume the reader may already be partway through other books in the series).
- The final chapter should integrate the material into something the reader can actually apply, plus appropriate safety framing if the topic involves therapeutic or health claims.

Respond with ONLY valid JSON, no markdown fences, no commentary, in this exact shape:
{
  "chapters": [
    { "chapterNumber": 1, "title": "...", "coversPoints": ["..."], "brief": "one to two sentences describing exactly what this chapter must accomplish" }
  ]
}`;
}

/**
 * Builds the prompt for a single chapter's PROSE CONTENT ONLY — plain text,
 * no JSON wrapper. Deliberately not JSON: a chapter can legitimately need more
 * tokens than one call allows, and a cut-off sentence is trivial to resume,
 * while a cut-off JSON string is not. See buildChapterContinuationPrompt for
 * the resume step, and generateWithContinuation() in gemini.ts for the loop.
 *
 * The chapter's title is NOT generated here — it's already fixed by the
 * outline step (chapterPlan.title), so there's nothing to regenerate or drift.
 */
export function buildChapterContentPrompt(
  topic: CurriculumTopic,
  chapterPlan: OutlineChapter,
  priorChapters: ChapterSummary[],
  lang: GenLang,
  totalChapters: number,
): string {
  const langName = LANG_NAME[lang];
  const isLast = chapterPlan.chapterNumber === totalChapters;

  const continuityBlock = priorChapters.length
    ? `WHAT THE BOOK HAS ALREADY COVERED (do not re-explain these from scratch — refer back briefly if relevant, then move forward; repeating earlier explanations at length is the single biggest quality failure to avoid):
${priorChapters.map((c) => `Chapter ${c.chapterNumber} — "${c.title}": ${c.summary}`).join('\n')}`
    : `This is the opening chapter of the book. There is no prior content to reference.`;

  return `You are a senior Ayurveda scholar writing Chapter ${chapterPlan.chapterNumber} of ${totalChapters} for a book titled "${topic.titleEn}" (${topic.titleTe}).

CHAPTER TITLE: ${chapterPlan.title}
THIS CHAPTER'S JOB: ${chapterPlan.brief}
SPECIFIC POINTS THIS CHAPTER MUST COVER IN REAL DEPTH (not a passing mention — each needs explanation, not just a name-drop):
${chapterPlan.coversPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}

CLASSICAL SOURCES TO GROUND THIS IN: ${topic.classicalSources.join(', ')} — reference these naturally (e.g. "Charaka Samhita explains that...") but NEVER invent a specific verse number or fabricate a direct quotation. If unsure of a precise classical detail, describe the concept accurately without over-claiming textual precision.

${continuityBlock}

WRITE THE CHAPTER IN: ${langName}. ${lang === 'te' ? 'Sanskrit/Ayurveda terms should appear in Telugu script with the term explained in plain Telugu on first use (e.g. వాతం (Vata) ...). Do not write in Romanized/Latin-script Telugu.' : 'Sanskrit/Ayurveda terms should appear transliterated and explained in plain English on first use.'}

DEPTH REQUIREMENTS — every one of these must be present, not just word count:
- Open by connecting to what came before (a single sentence, unless this is Chapter 1) and stating what this chapter will establish.
- For each must-cover point: define the classical concept accurately, explain the reasoning/mechanism behind it (not just "it does X"), and give at least one concrete real-life example or application a modern reader can picture.
- Include practical, actionable guidance the reader can actually use — not vague inspiration.
- ${topic.difficulty === 'advanced' ? 'This is an advanced-tier topic — do not oversimplify; the reader has read the foundational books already.' : 'Keep explanations accessible to an intelligent general reader with no prior Ayurveda background, without dumbing down the actual concepts.'}
- If any point involves a health claim, therapeutic use, dosing, pregnancy, children, or a specific medical condition, include a clear, brief safety caveat exactly where it is relevant (not as a generic disclaimer block) — recommend consulting a qualified Ayurvedic physician for individualized/therapeutic use.
- ${isLast ? 'This is the FINAL chapter — synthesize the whole book into a practical integration plan the reader can follow, and close with a short forward-looking note. Do not introduce a large new concept here.' : 'End with a short bridge sentence into what the next chapter will build on (do not name the next chapter\'s title verbatim, just gesture forward).'}
- Avoid filler padding, generic motivational language, and repeating the same point in different words to hit a length target.
- Target length: 1400-2200 words of substantive content. If you genuinely need more to cover every point in real depth, that's fine — depth and completeness matter more than landing exactly in this range.

Write ONLY the chapter's prose — plain text, paragraphs separated by a blank line. Do not include the chapter title, do not wrap in JSON, do not use markdown fences, do not add commentary before or after. Begin directly with the chapter's opening paragraph.`;
}

/**
 * Resumes a chapter that got cut off mid-way (generateText reported truncated:
 * true). Only the tail of what's written so far is included — enough for the
 * model to pick the thread back up naturally, without resending the whole
 * chapter (and its token cost) on every continuation pass.
 */
export function buildChapterContinuationPrompt(chapterPlan: OutlineChapter, soFar: string, lang: GenLang): string {
  const langName = LANG_NAME[lang];
  const tail = soFar.length > 3000 ? soFar.slice(-3000) : soFar;

  return `You are continuing a book chapter ("${chapterPlan.title}") that was cut off mid-way by a length limit — it is NOT finished. Continue writing in ${langName}, in the exact same voice, tone, and formatting (plain prose, blank line between paragraphs).

Rules:
- Continue directly from the exact point the text below stops. Do not repeat any sentence that already appears below, do not restate the chapter title, do not add a transition phrase like "continuing..." or "as we were saying."
- These points still need real depth if the text below hasn't already covered them: ${chapterPlan.coversPoints.join('; ')}.
- If the text below has already substantively covered everything this chapter needs, write a natural closing (per the chapter's brief: ${chapterPlan.brief}) instead of padding further.

TEXT SO FAR (continue immediately after this, no repetition):
"""
${tail}
"""`;
}

/**
 * Short, separate summary call made AFTER the full chapter content is
 * assembled (including any continuation passes) — summarizing the real,
 * complete text rather than asking the model to predict its own summary
 * while it's still mid-way through writing the chapter itself.
 */
export function buildChapterSummaryPrompt(chapterPlan: OutlineChapter, content: string, lang: GenLang): string {
  const langName = LANG_NAME[lang];
  return `Summarize the chapter below in 80-120 words, in ${langName}, written so it can be handed to the writer of the NEXT chapter as compressed context of what this one already covered (not reader-facing back-cover copy).

CHAPTER TITLE: ${chapterPlan.title}

CHAPTER TEXT:
"""
${content}
"""

Respond with ONLY valid JSON, no markdown fences, no commentary:
{
  "summary": "the 80-120 word summary"
}`;
}

/**
 * Builds the prompt for book-level metadata (title/subtitle/description)
 * once all chapters exist — grounded in what was actually written, not guessed upfront.
 */
export function buildBookMetaPrompt(
  topic: CurriculumTopic,
  chapterSummaries: ChapterSummary[],
  lang: GenLang,
): string {
  const langName = LANG_NAME[lang];
  return `Based on this completed Ayurveda book's actual chapter contents, write reader-facing marketing metadata.

BOOK TOPIC: ${topic.titleEn} (${topic.titleTe})
CHAPTERS WRITTEN:
${chapterSummaries.map((c) => `${c.chapterNumber}. ${c.title} — ${c.summary}`).join('\n')}

Write in: ${langName}.

Respond with ONLY valid JSON:
{
  "title": "compelling but accurate book title, under 60 characters",
  "subtitle": "one line expanding on the title",
  "description": "2-3 sentence back-cover description grounded in what the book actually covers, mentioning chapter count and depth honestly"
}`;
}

/**
 * Builds the prompt for one herb encyclopedia entry — always writes in BOTH
 * English and Telugu together (regardless of the site language currently being
 * viewed), because Herb entries are bilingual objects consumed by both /te and
 * /en views. Mirrors the tone of the hand-written entries in lib/data/herbs.ts:
 * traditional/Ayurvedic framing throughout ("traditionally believed to...",
 * "in Ayurveda this is understood as...") rather than modern medical claims —
 * this is educational/cultural content, not a supplement label.
 */
export function buildHerbPrompt(commonName: string, sanskritName: string): string {
  return `Write a complete, accurate Ayurveda herb encyclopedia entry for "${commonName}" (Sanskrit: ${sanskritName}), in BOTH English and Telugu for every text field below.

Ground every claim in classical Ayurvedic understanding (Charaka Samhita, Sushruta Samhita, Ashtanga Hridaya, Bhavaprakasha, or well-established traditional use) or in well-known regional/culinary/cultural practice. Use careful, traditional framing — "traditionally used for", "in Ayurveda this is classified as", "believed to support" — never modern clinical claims, dosage instructions, or promises of curing/treating any disease. This is educational and cultural content, not medical advice.

safetyInfo and whenToConsult are especially important and must always be filled in seriously: real, standard cautions for this herb (e.g. pregnancy, specific conditions, drug interactions where traditionally noted) and a clear steer toward consulting a qualified Ayurvedic practitioner or doctor before medicinal use — never leave these thin or generic.

Respond with ONLY valid JSON matching this exact shape, no markdown fences, no commentary:
{
  "commonName": "${commonName}",
  "teluguName": "the Telugu name in Telugu script",
  "sanskritName": "${sanskritName}",
  "englishName": "common English name",
  "botanicalName": "Genus species (italics not needed, just the Latin binomial)",
  "regionalNames": [ { "language": "Hindi", "name": "..." }, { "language": "Tamil", "name": "..." }, { "language": "Kannada", "name": "..." }, { "language": "Bengali", "name": "..." } ],
  "imageQuery": "2-4 plain English words a stock photo library would return good results for (e.g. \\"ginger root\\", \\"cardamom pods\\") — NOT the Sanskrit name",
  "introduction": { "en": "2-3 sentences introducing the herb and its place in Ayurveda", "te": "అదే విషయం తెలుగులో" },
  "traditionalDescription": { "en": "how Ayurveda classically describes this herb's rasa/guna/virya/vipaka and dosha effects, in plain language", "te": "తెలుగులో అదే" },
  "traditionalUses": [ { "en": "one traditional use, plainly stated", "te": "తెలుగులో" }, "... 4-6 of these" ],
  "commonPreparations": [ { "en": "a named traditional preparation and how it's made/used", "te": "తెలుగులో" }, "... 2-4 of these" ],
  "foodUses": { "en": "how it's used in everyday cooking, if applicable", "te": "తెలుగులో" },
  "culturalHistory": { "en": "cultural/historical significance in India", "te": "తెలుగులో" },
  "growingInfo": { "en": "how/where it grows, harvest basics", "te": "తెలుగులో" },
  "storageInfo": { "en": "how to store it well", "te": "తెలుగులో" },
  "safetyInfo": { "en": "real, specific cautions — see instructions above", "te": "తెలుగులో" },
  "interactions": { "en": "known traditional cautions around combining with other substances, or state there are none well-documented", "te": "తెలుగులో" },
  "references": [ "Charaka Samhita", "... 2-4 classical or well-known reference names, no fabricated citations" ],
  "whenToConsult": { "en": "clear guidance on when to see a qualified practitioner before use", "te": "తెలుగులో" }
}`;
}
