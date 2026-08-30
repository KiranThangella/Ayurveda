import { NextRequest, NextResponse } from 'next/server';
import { generateJSON, GeminiError } from '@/lib/ai/gemini';
import { buildHerbPrompt } from '@/lib/ai/prompts';
import { searchStockImage } from '@/lib/images/pexels';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { assertAdmin } from '@/lib/auth-server';

interface GeneratedHerb {
  commonName: string;
  teluguName: string;
  sanskritName: string;
  englishName: string;
  botanicalName: string;
  regionalNames: { language: string; name: string }[];
  imageQuery: string;
  introduction: { en: string; te: string };
  traditionalDescription: { en: string; te: string };
  traditionalUses: { en: string; te: string }[];
  commonPreparations: { en: string; te: string }[];
  foodUses: { en: string; te: string };
  culturalHistory: { en: string; te: string };
  growingInfo: { en: string; te: string };
  storageInfo: { en: string; te: string };
  safetyInfo: { en: string; te: string };
  interactions?: { en: string; te: string };
  references: string[];
  whenToConsult: { en: string; te: string };
}

export async function POST(req: NextRequest) {
  try {
    await assertAdmin(req);
  } catch (res) {
    if (res instanceof Response) return res;
    throw res;
  }

  try {
    const { slug, commonName, sanskritName }: { slug: string; commonName: string; sanskritName: string } = await req.json();
    if (!slug || !commonName || !sanskritName) {
      return NextResponse.json({ error: 'slug, commonName, sanskritName are required' }, { status: 400 });
    }

    const herb = await generateJSON<GeneratedHerb>(buildHerbPrompt(commonName, sanskritName), {
      temperature: 0.6,
      maxOutputTokens: 8000,
    });

    // Free stock photo — same Pexels lookup already used for ebook covers. Stored
    // once here so the site never has to call Pexels again for this herb.
    const image = await searchStockImage(herb.imageQuery || commonName).catch(() => null);

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from('herbs').upsert(
      {
        slug,
        common_name: herb.commonName,
        telugu_name: herb.teluguName,
        sanskrit_name: herb.sanskritName,
        english_name: herb.englishName,
        botanical_name: herb.botanicalName,
        regional_names: herb.regionalNames || [],
        category: 'herbs',
        image_query: herb.imageQuery,
        image_url: image?.url ?? null,
        image_photographer: image?.photographer ?? null,
        image_pexels_page_url: image?.pexelsPageUrl ?? null,
        introduction: herb.introduction,
        traditional_description: herb.traditionalDescription,
        traditional_uses: herb.traditionalUses || [],
        common_preparations: herb.commonPreparations || [],
        food_uses: herb.foodUses,
        cultural_history: herb.culturalHistory,
        growing_info: herb.growingInfo,
        storage_info: herb.storageInfo,
        safety_info: herb.safetyInfo,
        interactions: herb.interactions ?? null,
        "references": herb.references || [],
        when_to_consult: herb.whenToConsult,
      },
      { onConflict: 'slug' },
    );
    if (error) throw error;

    return NextResponse.json({ slug, commonName: herb.commonName, hasImage: !!image });
  } catch (err) {
    if (err instanceof GeminiError) {
      return NextResponse.json({ error: err.message }, { status: err.status || 500 });
    }
    const message = err && typeof err === 'object' && 'message' in err ? String((err as { message: unknown }).message) : 'Unexpected server error generating herb';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
