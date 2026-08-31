import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { CURRICULUM } from '@/lib/data/curriculum';
import type { Ebook } from '@/lib/types';

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

    const ebookObject: Ebook = {
      id: ebookId || `eb-${Date.now()}`,
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

    // Try saving to Supabase if configured
    try {
      const adminClient = getSupabaseAdmin();
      if (adminClient) {
        // Upsert into ebooks table
        const { error: upsertError } = await adminClient.from('ebooks').upsert({
          id: ebookObject.id,
          slug,
          topic_id: topicId,
          language: lang,
          title: lang === 'te' ? ebookObject.title.te : ebookObject.title.en,
          subtitle: lang === 'te' ? ebookObject.subtitle.te : ebookObject.subtitle.en,
          description: lang === 'te' ? ebookObject.description.te : ebookObject.description.en,
          price_inr: price,
          category,
          cover_image_url: coverImageUrl,
          total_words: totalWords,
          chapter_count: chapters.length,
          chapters: chapters,
          generation_status: 'ready',
          updated_at: new Date().toISOString(),
        });

        if (upsertError) {
          console.warn('Supabase ebook upsert warning (will still return success):', upsertError);
        }

        // If a jobId was provided, mark it done
        if (jobId) {
          await adminClient.from('generation_jobs').update({
            status: 'completed',
            updated_at: new Date().toISOString(),
          }).eq('id', jobId);
        }
      }
    } catch (dbErr) {
      console.warn('Supabase publish exception handled gracefully:', dbErr);
    }

    return NextResponse.json({
      success: true,
      slug,
      ebookId: ebookObject.id,
      ebook: ebookObject,
      url: `/ebooks/${slug}`,
    });
  } catch (error) {
    console.error('Publish error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Publish failed' },
      { status: 500 }
    );
  }
}
