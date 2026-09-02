import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin, upsertWithSchemaFallback } from '@/lib/supabase-admin';
import { assertAdmin } from '@/lib/auth-server';

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('herbs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ herbs: data || [] });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch herbs';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await assertAdmin(req);
  } catch (res) {
    if (res instanceof Response) return res;
    throw res;
  }

  try {
    const body = await req.json();
    const {
      slug,
      commonName,
      teluguName,
      sanskritName,
      englishName,
      botanicalName,
      category,
      imageUrl,
      overview,
      traditionalUses,
      commonPreparations,
      safetyInfo,
    } = body;

    if (!slug) {
      return NextResponse.json({ error: 'Herb slug is required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const payload: Record<string, any> = {
      slug,
      common_name: commonName || slug,
      telugu_name: teluguName || commonName,
      sanskrit_name: sanskritName || '',
      english_name: englishName || commonName,
      botanical_name: botanicalName || '',
      category: category || 'herbs',
      image_url: imageUrl || '',
      updated_at: new Date().toISOString(),
    };

    if (overview) payload.overview = overview;
    if (traditionalUses) payload.traditional_uses = traditionalUses;
    if (commonPreparations) payload.common_preparations = commonPreparations;
    if (safetyInfo) payload.safety_info = safetyInfo;

    const { data, error } = await upsertWithSchemaFallback(supabase, 'herbs', payload, 'slug');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, herb: data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update herb';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return PUT(req);
}
