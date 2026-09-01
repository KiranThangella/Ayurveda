import { ebooks as staticEbooks } from '@/lib/data/ebooks';
import type { Ebook } from '@/lib/types';
import { getSupabaseClient } from '@/lib/supabase';

const LOCAL_PUBLISHED_KEY = 'mindwriter_local_published_ebooks';

export function getLocalPublishedEbooks(): Ebook[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_PUBLISHED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLocalPublishedEbook(ebook: Ebook): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getLocalPublishedEbooks();
    const filtered = existing.filter((b) => b.slug !== ebook.slug && b.id !== ebook.id);
    filtered.unshift(ebook);
    localStorage.setItem(LOCAL_PUBLISHED_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error('Failed to save published ebook to localStorage', e);
  }
}

export async function fetchAllEbooks(): Promise<Ebook[]> {
  const localList = getLocalPublishedEbooks();
  const mapBySlug = new Map<string, Ebook>();

  // 1. Static built-in ebooks
  for (const eb of staticEbooks) {
    mapBySlug.set(eb.slug, eb);
  }

  // 2. Locally published ebooks
  for (const eb of localList) {
    mapBySlug.set(eb.slug, eb);
  }

  // 3. Supabase published ebooks (if available)
  try {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('ebooks')
        .select('*')
        .in('generation_status', ['ready', 'complete', 'published', 'outline_pending', 'chapters_pending'])
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        for (const row of data) {
          let chapters = Array.isArray(row.chapters) ? row.chapters : [];

          // If chapters json is empty, try fetching from ebook_chapters table
          if (chapters.length === 0 && row.id) {
            try {
              const { data: chData } = await supabase
                .from('ebook_chapters')
                .select('*')
                .eq('ebook_id', row.id)
                .order('chapter_number', { ascending: true });
              if (chData && chData.length > 0) {
                chapters = chData;
              }
            } catch {}
          }

          const ebook: Ebook = {
            id: row.id || row.slug,
            slug: row.slug,
            title: {
              en: row.language === 'te' ? (row.title_en || row.title) : row.title,
              te: row.language === 'te' ? row.title : (row.title_te || row.title),
            },
            subtitle: {
              en: row.language === 'te' ? (row.subtitle_en || row.subtitle || '') : (row.subtitle || ''),
              te: row.language === 'te' ? (row.subtitle || '') : (row.subtitle_te || row.subtitle || ''),
            },
            description: {
              en: row.language === 'te' ? (row.description_en || row.description || '') : (row.description || ''),
              te: row.language === 'te' ? (row.description || '') : (row.description_te || row.description || ''),
            },
            price: Number(row.price_inr ?? row.price ?? 0),
            isFree: Number(row.price_inr ?? row.price ?? 0) === 0,
            language: row.language || 'en',
            category: row.category || 'general',
            coverQuery: row.topic_id || row.title || 'Ayurveda',
            coverImage: row.cover_image_url || row.cover_url || 'https://images.pexels.com/photos/12421351/pexels-photo-12421351.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
            rating: 5,
            reviewCount: 1,
            readingTime: Math.max(10, Math.round((row.total_words || 3000) / 150)),
            isPremium: Number(row.price_inr ?? row.price ?? 0) > 0,
            author: {
              en: 'Ayurveda Vignanam Editorial Council',
              te: 'ఆయుర్వేద విజ్ఞానం సంపాదక మండలి',
            },
            tags: ['Ayurveda', 'Herbs', 'Health', 'Tradition'],
            featured: false,
            trending: false,
            newRelease: true,
            chapters: chapters.map((ch: any, idx: number) => ({
              id: String(idx + 1),
              title: {
                en: row.language === 'te' ? (ch.title_en || ch.title) : ch.title,
                te: row.language === 'te' ? ch.title : (ch.title_te || ch.title),
              },
              content: {
                en: row.language === 'te' ? '' : (ch.content || ''),
                te: row.language === 'te' ? (ch.content || '') : '',
              },
            })),
          };
          mapBySlug.set(ebook.slug, ebook);
        }
      }
    }
  } catch (err) {
    console.warn('Supabase fetch failed, using local & static ebooks', err);
  }

  return Array.from(mapBySlug.values());
}

export async function fetchEbookBySlug(slug: string): Promise<Ebook | undefined> {
  const all = await fetchAllEbooks();
  return all.find((eb) => eb.slug === slug || eb.id === slug);
}
