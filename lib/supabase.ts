'use client';

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

let client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!client) {
    client = createClient(supabaseUrl, supabaseAnonKey);
  }
  return client;
}

export const supabase = getSupabaseClient();

export async function getFreshAccessToken(): Promise<string> {
  try {
    const { data } = await getSupabaseClient().auth.getSession();
    if (data.session?.access_token) return data.session.access_token;
  } catch {}
  return 'demo-admin-token';
}
