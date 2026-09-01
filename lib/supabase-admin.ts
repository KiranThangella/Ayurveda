import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Server-only Supabase client using the SERVICE ROLE key — bypasses RLS.
 * NEVER import this from a 'use client' file, and never expose
 * SUPABASE_SERVICE_ROLE_KEY with a NEXT_PUBLIC_ prefix.
 * Used only by API routes that need to write generated content
 * (ebooks, chapters) on behalf of the system, not a logged-in user.
 */
let adminClient: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (!adminClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    if (!url || !serviceKey) {
      throw new Error('Supabase URL and Key must be set for operations.');
    }
    adminClient = createClient(url, serviceKey, { auth: { persistSession: false } });
  }
  return adminClient;
}
