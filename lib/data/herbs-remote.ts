import { getSupabaseClient } from '@/lib/supabase';
import type { Herb } from '@/lib/types';

/**
 * Herbs generated via Admin → Generate → Herbs live in the Supabase `herbs`
 * table (see supabase-schema-herbs.sql), separate from the hand-written ones in
 * lib/data/herbs.ts. This fetches and maps them to the same Herb shape so pages
 * can merge both lists. Public read (RLS allows anon select), safe to call from
 * client components.
 */
export async function fetchGeneratedHerbs(): Promise<Herb[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from('herbs').select('*').order('created_at', { ascending: false });
  if (error || !data) return [];
  return data.map(rowToHerb);
}

export async function fetchGeneratedHerbBySlug(slug: string): Promise<Herb | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from('herbs').select('*').eq('slug', slug).maybeSingle();
  if (error || !data) return null;
  return rowToHerb(data);
}

function rowToHerb(row: Record<string, any>): Herb {
  return {
    slug: row.slug,
    commonName: row.common_name,
    teluguName: row.telugu_name,
    sanskritName: row.sanskrit_name,
    englishName: row.english_name,
    botanicalName: row.botanical_name,
    regionalNames: row.regional_names || [],
    category: row.category || 'herbs',
    imageQuery: row.image_query,
    imageUrl: row.image_url || undefined,
    imagePhotographer: row.image_photographer || undefined,
    introduction: row.introduction,
    traditionalDescription: row.traditional_description,
    traditionalUses: row.traditional_uses || [],
    commonPreparations: row.common_preparations || [],
    foodUses: row.food_uses,
    culturalHistory: row.cultural_history,
    growingInfo: row.growing_info,
    storageInfo: row.storage_info,
    safetyInfo: row.safety_info,
    interactions: row.interactions || undefined,
    references: row.references || [],
    whenToConsult: row.when_to_consult,
  };
}
