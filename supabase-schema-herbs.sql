-- Run this in Supabase SQL Editor. Safe to run even though supabase-schema.sql
-- already created a `herbs` table (with a simpler `content jsonb` shape) — this
-- adds every column the AI herb generator (Admin -> Generate -> Herbs) actually
-- needs, without touching or duplicating what's already there.

-- If herbs doesn't exist at all yet, create the base shape (matches the
-- original supabase-schema.sql definition) so the ALTERs below always have
-- something to attach to.
create table if not exists herbs (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  common_name text not null,
  telugu_name text,
  sanskrit_name text,
  botanical_name text,
  category text,
  content jsonb not null default '{}',
  "references" jsonb default '[]',
  created_at timestamptz default now()
);

-- Add every column the generator writes -- each one is a no-op if it already exists.
alter table herbs add column if not exists english_name text;
alter table herbs add column if not exists regional_names jsonb not null default '[]'::jsonb;
alter table herbs add column if not exists image_query text;
alter table herbs add column if not exists image_url text;
alter table herbs add column if not exists image_photographer text;
alter table herbs add column if not exists image_pexels_page_url text;
alter table herbs add column if not exists introduction jsonb;
alter table herbs add column if not exists traditional_description jsonb;
alter table herbs add column if not exists traditional_uses jsonb not null default '[]'::jsonb;
alter table herbs add column if not exists common_preparations jsonb not null default '[]'::jsonb;
alter table herbs add column if not exists food_uses jsonb;
alter table herbs add column if not exists cultural_history jsonb;
alter table herbs add column if not exists growing_info jsonb;
alter table herbs add column if not exists storage_info jsonb;
alter table herbs add column if not exists safety_info jsonb;
alter table herbs add column if not exists interactions jsonb;
alter table herbs add column if not exists when_to_consult jsonb;
alter table herbs add column if not exists "references" jsonb default '[]'::jsonb;

-- Make sure category defaults sensibly and slug stays unique (already true in the
-- original schema, this just guarantees it if the table was created some other way).
alter table herbs alter column category set default 'herbs';
create unique index if not exists herbs_slug_key on herbs(slug);

-- Public read access (RLS should already be enabled from the original schema, but
-- this is safe to re-run).
alter table herbs enable row level security;
drop policy if exists "Public read herbs" on herbs;
create policy "Public read herbs" on herbs for select using (true);
-- Writes only ever happen server-side via the service-role key (admin generate route).

-- Supabase's API layer (PostgREST) caches the table schema and doesn't always
-- pick up ALTER TABLE changes made via the SQL Editor instantly — this tells it
-- to refresh right now instead of waiting for its own periodic check.
notify pgrst, 'reload schema';
