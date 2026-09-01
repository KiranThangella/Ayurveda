import { NextRequest, NextResponse } from 'next/server';
import { getServerPublishedEbooks, saveServerPublishedEbook } from '@/lib/server/ebooks-store';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import type { Ebook } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');

    const serverEbooks = getServerPublishedEbooks();
    const map = new Map<string, Ebook>();

    for (const eb of serverEbooks) {
      map.set(eb.slug, eb);
    }

    // Attempt Supabase fetch as well
    try {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        let query = supabase
          .from('ebooks')
          .select('*')
          .in('generation_status', ['ready', 'complete', 'published'])
          .order('created_at', { ascending: false });

        if (slug) {
          query = query.eq('slug', slug);
        }

        const { data, error } = await query;
        if (!error && Array.isArray(data)) {
          for (const row of data) {
            let chapters = Array.isArray(row.chapters) ? row.chapters : [];
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
                  en: row.language === 'te' ? (ch.content || '') : (ch.content || ''),
                  te: row.language === 'te' ? (ch.content || '') : (ch.content || ''),
                },
              })),
            };
            map.set(ebook.slug, ebook);
          }
        }
      }
    } catch {}

    const all = Array.from(map.values());

    if (slug) {
      const found = all.find((b) => b.slug === slug || b.id === slug);
      if (!found) {
        return NextResponse.json({ error: 'Ebook not found' }, { status: 404 });
      }
      return NextResponse.json({ ebook: found });
    }

    return NextResponse.json({ ebooks: all });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch ebooks' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Ebook;
    if (!body || !body.slug) {
      return NextResponse.json({ error: 'Invalid ebook object' }, { status: 400 });
    }
    saveServerPublishedEbook(body);
    return NextResponse.json({ success: true, ebook: body });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save ebook' }, { status: 500 });
  }
}
