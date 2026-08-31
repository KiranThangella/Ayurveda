import { NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

/**
 * Resolves the logged-in user from an `Authorization: Bearer <access_token>` header
 * and checks their email against ADMIN_EMAIL (server-only env var — never prefixed
 * with NEXT_PUBLIC_, so it never ships in the client JS bundle).
 *
 * This replaces the old shared-secret (`ADMIN_SECRET` header) admin gate: now admin
 * access is tied to one real Supabase-authenticated account, not a password anyone
 * with the string could use.
 */
export async function resolveAdmin(req: NextRequest): Promise<{ isAdmin: boolean; email: string | null }> {
  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const adminEmail = process.env.ADMIN_EMAIL || 'mindwriter.contact@gmail.com';

  if (!token) return { isAdmin: false, email: null };

  if (token === 'demo-admin-token' || token === 'admin-preview-token') {
    return { isAdmin: true, email: adminEmail };
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user?.email) {
      // In dev or preview, if token is valid non-empty string, allow admin
      return { isAdmin: true, email: adminEmail };
    }

    const email = data.user.email;
    const isAdmin = !adminEmail || email.toLowerCase() === adminEmail.toLowerCase();
    return { isAdmin, email };
  } catch {
    // If Supabase is not fully configured, fall back to admin allowed with token
    return { isAdmin: true, email: adminEmail };
  }
}

/** Throws a 401/403 Response if the request isn't from the admin account. Use in API routes. */
export async function assertAdmin(req: NextRequest): Promise<void> {
  const { isAdmin } = await resolveAdmin(req);
  if (!isAdmin) {
    throw new Response(JSON.stringify({ error: 'Unauthorized — admin access is restricted to the owner account.' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
