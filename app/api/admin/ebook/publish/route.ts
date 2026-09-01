import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { CURRICULUM } from '@/lib/data/curriculum';
import type { Ebook } from '@/lib/types';
import crypto from 'crypto';

interface PublishRequest {
  topicId: string;
  lang: 'en' | 'te';
  title: string;
  subtitle?: string;
  description?: string;
  price?: number;
  chapters: Array<{
    chapterNumber: number;
    title: string;
    content: string;
    summary: string;
    wordCount: number;
  }>;
  jobId?: string;
  ebookId?: string;
}

function isValidUUID(str?: string): boolean {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as PublishRequest;
    const { topicId, lang, title, subtitle, description, price = 0, chapters = [], jobId, ebookId } = body;

    if (!chapters || chapters.length === 0) {
      return NextResponse.json({ error: 'No chapters provided to publish' }, { status: 400 });
    }

    const topic = CURRICULUM.find((t) => t.id === topicId);
    const category = topic?.series || 'classical_texts';
    const totalWords = chapters.reduce((sum, ch) => sum + (ch.wordCount || 0), 0);

    const slug = topicId
      ? `${topicId}-${lang}`
      : `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'ebook'}-${lang}`;

    const coverImageUrl = 'https://images.pexels.com/photos/12421351/pexels-photo-12421351.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

    // Ensure valid UUID for Supabase primary key
    const resolvedEbookId = isValidUUID(ebookId) ? ebookId! : crypto.randomUUID();

    const ebookObject: Ebook = {
      id: resolvedEbookId,
      slug,
      title: {
        en: lang === 'te' ? (topic?.titleEn || title) : title,
        te: lang === 'te' ? title : (topic?.titleTe || title),
      },
      subtitle: {
        en: lang === 'te' ? (subtitle || 'Comprehensive Ayurvedic Treatise') : (subtitle || ''),
        te: lang === 'te' ? (subtitle || 'సంపూర్ణ ఆయుర్వేద గ్రంథం') : (subtitle || ''),
      },
      description: {
        en: lang === 'te' ? (description || topic?.titleEn || '') : (description || ''),
        te: lang === 'te' ? (description || topic?.titleTe || '') : (description || ''),
      },
      coverQuery: topic?.titleEn || title || 'Ayurvedic treatise herbs health',
      coverImage: coverImageUrl,
      category,
      language: lang,
      readingTime: Math.max(10, Math.round(totalWords / 150)),
      rating: 5,
      reviewCount: 1,
      isPremium: price > 0,
      isFree: price === 0,
      price: price,
      author: {
        en: 'Ayurveda Vignanam Editorial Council',
        te: 'ఆయుర్వేద విజ్ఞానం సంపాదక మండలి',
      },
      tags: ['Ayurveda', 'Herbal Medicine', 'Health', 'Tradition', topic?.titleEn || 'Wellness'],
      featured: true,
      trending: true,
      newRelease: true,
      chapters: chapters.map((ch, idx) => ({
        id: String(idx + 1),
        title: {
          en: lang === 'te' ? ch.title : ch.title,
          te: lang === 'te' ? ch.title : ch.title,
        },
        content: {
          en: lang === 'te' ? '' : ch.content,
          te: lang === 'te' ? ch.content : '',
        },
      })),
    };

    let supabaseSaved = false;
    let supabaseError: string | null = null;

    // Try saving to Supabase if credentials are provided
    try {
      const adminClient = getSupabaseAdmin();
      if (adminClient) {
        // 1. Upsert into ebooks table
        const { data: upsertData, error: upsertError } = await adminClient.from('ebooks').upsert(
          {
            id: resolvedEbookId,
            slug,
            topic_id: topicId || null,
            language: lang,
            title: lang === 'te' ? ebookObject.title.te : ebookObject.title.en,
            subtitle: lang === 'te' ? ebookObject.subtitle.te : ebookObject.subtitle.en,
            description: lang === 'te' ? ebookObject.description.te : ebookObject.description.en,
            price: price,
            price_inr: price,
            is_free: price === 0,
            is_premium: price > 0,
            category,
            cover_query: topic?.titleEn || title,
            cover_url: coverImageUrl,
            cover_image_url: coverImageUrl,
            total_words: totalWords,
            chapter_count: chapters.length,
            chapters: chapters,
            generation_status: 'complete',
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'slug' }
        ).select().maybeSingle();

        if (upsertError) {
          console.warn('Supabase ebook upsert warning:', upsertError);
          supabaseError = upsertError.message;
        } else {
          supabaseSaved = true;
          const finalDbEbookId = upsertData?.id || resolvedEbookId;

          // 2. Also insert/upsert each chapter into ebook_chapters table if it exists
          try {
            const chapterRows = chapters.map((ch, idx) => ({
              ebook_id: finalDbEbookId,
              chapter_number: ch.chapterNumber || idx + 1,
              title: ch.title,
              content: ch.content,
              summary: ch.summary || '',
              word_count: ch.wordCount || 0,
            }));

            await adminClient.from('ebook_chapters').upsert(
              chapterRows,
              { onConflict: 'ebook_id,chapter_number' }
            );
          } catch (chErr) {
            console.warn('Optional ebook_chapters upsert info:', chErr);
          }
        }

        // If a jobId was provided and it exists, mark it completed
        if (jobId) {
          try {
            await adminClient.from('generation_jobs').update({
              status: 'complete',
              updated_at: new Date().toISOString(),
            }).eq('id', jobId);
          } catch {}
        }
      }
    } catch (dbErr: any) {
      console.warn('Supabase publish exception handled:', dbErr);
      supabaseError = dbErr?.message || 'Supabase credentials not configured or database unreachable.';
    }

    return NextResponse.json({
      success: true,
      slug,
      ebookId: ebookObject.id,
      ebook: ebookObject,
      url: `/ebooks/${slug}`,
      supabaseSaved,
      supabaseError,
    });
  } catch (error) {
    console.error('Publish error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Publish failed' },
      { status: 500 }
    );
  }
}
