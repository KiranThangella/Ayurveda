import type { Env } from './types';

export interface StockImage {
  url: string;
  photographer: string;
}

export async function searchStockImage(env: Env, query: string): Promise<StockImage | null> {
  if (!env.PEXELS_API_KEY) return null;

  const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`, {
    headers: { Authorization: env.PEXELS_API_KEY },
  });
  if (!res.ok) return null;

  const data = await res.json<any>();
  const photo = data?.photos?.[0];
  if (!photo) return null;

  return { url: photo.src.large2x || photo.src.large, photographer: photo.photographer };
}

const CONCRETE_HINTS = ['herb', 'oil', 'massage', 'food', 'diet', 'spice', 'sleep', 'yoga', 'breath', 'meditation', 'skin', 'hair', 'digestion', 'season', 'morning', 'child', 'pregnancy', 'elderly'];
const GENERIC_THEMES = ['ayurveda herbs', 'herbal medicine', 'meditation wellness', 'indian spices', 'yoga morning routine', 'herbal tea', 'ayurvedic oil massage', 'natural healing plants'];

export function buildImageQuery(topicTitleEn: string, chapterTitleEn?: string): string {
  const source = (chapterTitleEn || topicTitleEn).toLowerCase();
  const matched = CONCRETE_HINTS.find((h) => source.includes(h));
  if (matched) return `ayurveda ${matched}`;
  let hash = 0;
  for (let i = 0; i < source.length; i++) hash = (hash << 5) - hash + source.charCodeAt(i);
  return GENERIC_THEMES[Math.abs(hash) % GENERIC_THEMES.length];
}
