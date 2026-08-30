import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { assertAdmin } from '@/lib/auth-server';

/**
 * Admin gate — requires a real Supabase-authenticated session whose email matches
 * ADMIN_EMAIL (server-only env var). Only that one account can see or act on
 * pending_review ebooks. See lib/auth-server.ts.
 */

// GET — list every ebook currently sitting in pending_review, oldest first.
export async function GET(req: NextRequest) {
  try {
    await assertAdmin(req);
  } catch (res) {
    return res as Response;
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('ebooks')
    .select('id, slug, topic_id, language, title, subtitle, chapter_count, total_words, created_at, updated_at')
    .eq('generation_status', 'pending_review')
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ pendingReview: data });
}

// POST — approve or reject one ebook. Body: { ebookId, action: 'approve' | 'reject', notes?: string }
export async function POST(req: NextRequest) {
  try {
    await assertAdmin(req);
  } catch (res) {
    return res as Response;
  }

  const { ebookId, action, notes }: { ebookId?: string; action?: 'approve' | 'reject'; notes?: string } = await req.json();

  if (!ebookId || (action !== 'approve' && action !== 'reject')) {
    return NextResponse.json({ error: 'ebookId and action ("approve" | "reject") are required' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // Only ever act on a row that's actually still pending_review — guards against a
  // stale UI double-submitting a decision on a book that's already been actioned.
  const { data: current, error: lookupErr } = await supabase
    .from('ebooks')
    .select('id, generation_status')
    .eq('id', ebookId)
    .single();
  if (lookupErr) return NextResponse.json({ error: lookupErr.message }, { status: 404 });
  if (current.generation_status !== 'pending_review') {
    return NextResponse.json({ error: `Ebook is '${current.generation_status}', not pending_review — nothing to decide.` }, { status: 409 });
  }

  const { data, error } = await supabase
    .from('ebooks')
    .update({
      generation_status: action === 'approve' ? 'complete' : 'rejected',
      reviewed_at: new Date().toISOString(),
      review_notes: notes || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', ebookId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ebook: data });
}
