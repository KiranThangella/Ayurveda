export function cleanAiText(text: string): string {
  if (!text) return '';
  return text
    .replace(/^```html\s*/i, '')
    .replace(/^```markdown\s*/i, '')
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/, '')
    .replace(/```$/, '')
    .trim();
}

export function stripHtmlTags(html: string): string {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').trim();
}

export function cleanAndDeduplicateContent(content: string): { content: string; wordCount: number } {
  if (!content) return { content: '', wordCount: 0 };
  const cleaned = cleanAiText(content);
  const wordCount = cleaned ? cleaned.split(/\s+/).filter(Boolean).length : 0;
  return { content: cleaned, wordCount };
}
