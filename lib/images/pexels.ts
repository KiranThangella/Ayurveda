/**
 * Free stock photo lookup via Pexels (https://www.pexels.com/api/) — generous free
 * tier, no cost, attribution appreciated but not legally required. Used to attach
 * a relevant cover/chapter image to AI-generated ebooks without any image-gen cost.
 *
 * Ayurveda/Sanskrit terms rarely match stock-photo tags well, so callers should pass
 * a plain-English visual query (e.g. "herbal tea meditation" not "Dinacharya").
 */

export interface StockImage {
  url: string;           // large-size image URL, safe to hotlink or download
  thumbUrl: string;
  photographer: string;
  photographerUrl: string;
  pexelsPageUrl: string;
}

export async function searchStockImage(query: string): Promise<StockImage | null> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) {
    console.warn('PEXELS_API_KEY not set — skipping image attach.');
    return null;
  }

  const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`, {
    headers: { Authorization: apiKey },
  });

  if (!res.ok) {
    console.warn(`Pexels search failed (${res.status}) for query: ${query}`);
    return null;
  }

  const data = await res.json();
  const photo = data?.photos?.[0];
  if (!photo) return null;

  return {
    url: photo.src.large2x || photo.src.large,
    thumbUrl: photo.src.medium,
    photographer: photo.photographer,
    photographerUrl: photo.photographer_url,
    pexelsPageUrl: photo.url,
  };
}

/**
 * Ayurveda content doesn't map cleanly to stock-photo keywords (there is no photo
 * tagged "Srotas" or "Dosha"). This translates a chapter/topic title into a plain
 * visual-search query a stock library will actually return good results for.
 */
export function buildImageQuery(topicTitleEn: string, chapterTitleEn?: string): string {
  const genericVisualThemes = [
    'ayurveda herbs', 'herbal medicine', 'meditation wellness', 'indian spices',
    'yoga morning routine', 'herbal tea', 'ayurvedic oil massage', 'natural healing plants',
  ];
  // Pull the most visually concrete words out of the title (nouns tend to be capitalized
  // or are the last few words); fall back to a generic wellness theme if the title is
  // too abstract/philosophical to search for directly (common in advanced-tier chapters).
  const source = (chapterTitleEn || topicTitleEn).toLowerCase();
  const concreteHints = ['herb', 'oil', 'massage', 'food', 'diet', 'spice', 'sleep', 'yoga', 'breath', 'meditation', 'skin', 'hair', 'digestion', 'season', 'morning', 'child', 'pregnancy', 'elderly'];
  const matched = concreteHints.find((h) => source.includes(h));
  if (matched) return `ayurveda ${matched}`;

  // Deterministic fallback so the same chapter always gets a consistent theme
  const idx = Math.abs(hashCode(source)) % genericVisualThemes.length;
  return genericVisualThemes[idx];
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
