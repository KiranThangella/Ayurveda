import { NextRequest, NextResponse } from 'next/server';
import { searchStockImage } from '@/lib/images/pexels';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || 'herb plant';
  try {
    const result = await searchStockImage(q);
    if (!result) {
      return NextResponse.json({ url: null, message: 'No image found or PEXELS_API_KEY missing' });
    }
    return NextResponse.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error searching image';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
