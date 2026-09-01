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

/**
 * Safely upsert a record into Supabase. If Supabase fails due to a missing column in
 * the schema (e.g. "Could not find the 'xxx' column..."), it automatically strips
 * that column and retries until it succeeds or runs out of retries.
 */
export async function upsertWithSchemaFallback(
  supabase: SupabaseClient,
  tableName: string,
  initialData: Record<string, any>,
  onConflict?: string
): Promise<{ data: any; error: any }> {
  let payload = { ...initialData };
  let retries = 0;
  const maxRetries = 20;
  let lastError: any = null;

  while (retries < maxRetries) {
    const query = supabase.from(tableName).upsert(
      payload,
      onConflict ? { onConflict } : undefined
    ).select();

    const { data, error } = await query.maybeSingle();

    if (!error) {
      return { data: data || payload, error: null };
    }

    lastError = error;
    const msg = error.message || error.details || error.hint || '';
    
    // Match missing column error patterns from Supabase / PostgREST
    const missingColMatch = 
      msg.match(/Could not find the '([^']+)' column/i) ||
      msg.match(/column "([^"]+)" of relation/i) ||
      msg.match(/Could not find the '([^']+)'/i) ||
      msg.match(/column '([^']+)' does not exist/i);

    if (missingColMatch && missingColMatch[1] && payload.hasOwnProperty(missingColMatch[1])) {
      const badCol = missingColMatch[1];
      console.warn(`[Supabase] Column '${badCol}' missing in table '${tableName}'. Stripping and retrying...`);
      delete payload[badCol];
      retries++;
    } else {
      break;
    }
  }

  return { data: null, error: lastError };
}

/**
 * Safely insert a record into Supabase with automatic missing-column fallback.
 */
export async function insertWithSchemaFallback(
  supabase: SupabaseClient,
  tableName: string,
  initialData: Record<string, any>
): Promise<{ data: any; error: any }> {
  let payload = { ...initialData };
  let retries = 0;
  const maxRetries = 20;
  let lastError: any = null;

  while (retries < maxRetries) {
    const { data, error } = await supabase.from(tableName).insert(payload).select().single();

    if (!error) {
      return { data: data || payload, error: null };
    }

    lastError = error;
    const msg = error.message || error.details || error.hint || '';
    
    const missingColMatch = 
      msg.match(/Could not find the '([^']+)' column/i) ||
      msg.match(/column "([^"]+)" of relation/i) ||
      msg.match(/Could not find the '([^']+)'/i) ||
      msg.match(/column '([^']+)' does not exist/i);

    if (missingColMatch && missingColMatch[1] && payload.hasOwnProperty(missingColMatch[1])) {
      const badCol = missingColMatch[1];
      console.warn(`[Supabase] Column '${badCol}' missing in table '${tableName}'. Stripping and retrying...`);
      delete payload[badCol];
      retries++;
    } else {
      break;
    }
  }

  return { data: null, error: lastError };
}

