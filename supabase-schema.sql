-- ============================================================
-- Ayurveda Platform — Supabase Schema
-- Companion to lib/data/curriculum.ts (the source of truth for
-- topic/series content — this schema stores the AI-generated
-- output plus operational data: users, purchases, progress).
-- ============================================================

create extension if not exists "uuid-ossp";

-- ── Curriculum reference tables (mirror lib/data/curriculum.ts) ──
create table if not exists series (
  id text primary key,               -- matches CurriculumSeries.id e.g. 'foundations'
  name_en text not null,
  name_te text not null,
  description_en text,
  description_te text,
  sort_order int not null
);

create table if not exists topics (
  id text primary key,               -- matches CurriculumTopic.id e.g. 'panchamahabhuta-tridosha'
  series_id text references series(id) on delete cascade,
  title_en text not null,
  title_te text not null,
  scope_en text,
  scope_te text,
  must_cover jsonb not null default '[]',       -- string[]
  classical_sources jsonb not null default '[]',-- string[]
  recommended_chapters int not null default 5,
  difficulty text check (difficulty in ('foundation','intermediate','advanced')),
  created_at timestamptz default now()
);

-- ── Users ──
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  preferred_language text check (preferred_language in ('en','te')) default 'en',
  dosha_result text check (dosha_result in ('vata','pitta','kapha','vata-pitta','pitta-kapha','vata-kapha','tridoshic')),
  is_premium boolean default false,
  created_at timestamptz default now()
);

-- ── Herbs ──
create table if not exists herbs (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  common_name text not null,
  telugu_name text,
  sanskrit_name text,
  botanical_name text,
  category text,
  content jsonb not null default '{}',   -- bilingual sub-fields (introduction, uses, safety, etc.)
  references jsonb default '[]',
  created_at timestamptz default now()
);

-- ── Ebooks (AI-generated, one row per generated book) ──
create table if not exists ebooks (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  topic_id text references topics(id),
  language text check (language in ('en','te')) not null,
  title text not null,
  subtitle text,
  description text,
  category text,
  price numeric default 0,
  is_free boolean default true,
  is_premium boolean default false,
  cover_query text,
  rating numeric default 0,
  review_count int default 0,
  total_words int default 0,
  chapter_count int default 0,
  -- 'pending_review' = fully generated but withheld from public read (see RLS below)
  -- until a human approves it — used for pregnancy/children/mental-health/advanced
  -- Panchakarma topics (CurriculumTopic.requiresReview = true). 'rejected' = a human
  -- reviewed it and declined to publish it (distinct from 'failed', which means the
  -- generation pipeline itself broke, not that a person disliked the output).
  generation_status text check (generation_status in ('outline','generating','complete','pending_review','rejected','failed')) default 'outline',
  reviewed_by uuid references profiles(id),
  reviewed_at timestamptz,
  review_notes text,
  featured boolean default false,
  trending boolean default false,
  new_release boolean default true,
  cover_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── Chapters (chapter-by-chapter AI output, keeps generation summary for continuity/debugging) ──
create table if not exists ebook_chapters (
  id uuid primary key default uuid_generate_v4(),
  ebook_id uuid references ebooks(id) on delete cascade,
  chapter_number int not null,
  title text not null,
  content text not null,
  summary text,              -- the compressed summary handed to the next chapter's prompt
  covers_points jsonb default '[]',  -- which curriculum mustCover points this chapter addressed
  word_count int default 0,
  image_url text,
  image_credit text,
  created_at timestamptz default now(),
  unique (ebook_id, chapter_number)
);

-- ── AI generation logs (cost/debugging visibility, optional but recommended) ──
create table if not exists ai_generation_logs (
  id uuid primary key default uuid_generate_v4(),
  ebook_id uuid references ebooks(id) on delete set null,
  topic_id text references topics(id),
  step text check (step in ('outline','chapter','meta')) not null,
  chapter_number int,
  model text,
  prompt_tokens int,
  output_tokens int,
  status text check (status in ('success','error')) not null,
  error_message text,
  created_at timestamptz default now()
);

-- ── Async generation jobs (resumable — powers the daily auto-generate cron) ──
-- One row = one book being generated. The tick endpoint advances a job by exactly
-- one step per call (outline → each chapter → meta), so a large book safely spreads
-- across many cron ticks in a day instead of risking a serverless timeout.
create table if not exists generation_jobs (
  id uuid primary key default uuid_generate_v4(),
  topic_id text references topics(id),
  language text check (language in ('en','te')) not null,
  ebook_id uuid references ebooks(id) on delete cascade,
  status text check (status in ('outline_pending','chapters_pending','meta_pending','complete','failed')) default 'outline_pending',
  outline jsonb,              -- OutlineChapter[] once planned
  chapters_done int default 0,
  error_message text,
  -- Bumped on every transient failure (network/5xx/rate-limit) at the CURRENT step.
  -- On a GeminiSafetyBlockError the job is marked 'failed' immediately (retry_count
  -- is not incremented and does not apply) since the same prompt will always be
  -- blocked again. On any other error, retry_count increments and the job is only
  -- marked 'failed' once it exceeds MAX_RETRIES — otherwise it's left in its current
  -- *_pending status so the next tick retries the same step.
  retry_count int default 0,
  -- Checkpoint for the chapter currently being generated (chapters_done + 1).
  -- Updated after EVERY generation pass (first pass + each continuation), not
  -- just at chapter completion — so a crash/timeout/eviction mid-chapter loses
  -- at most one pass's worth of work, not the whole chapter. Cleared back to
  -- null once that chapter is fully written to ebook_chapters.
  chapter_draft_content text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_jobs_status on generation_jobs(status);
create unique index if not exists idx_jobs_topic_lang_active on generation_jobs(topic_id, language) where status not in ('complete','failed');

-- ── Purchases ──
create table if not exists purchases (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  ebook_id uuid references ebooks(id) on delete cascade,
  amount numeric not null,
  payment_status text check (payment_status in ('pending','completed','refunded')) default 'pending',
  created_at timestamptz default now(),
  unique (user_id, ebook_id)
);

-- ── Reading progress ──
create table if not exists reading_progress (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  ebook_id uuid references ebooks(id) on delete cascade,
  chapter_id uuid references ebook_chapters(id) on delete cascade,
  percent_complete numeric default 0,
  last_read_at timestamptz default now(),
  unique (user_id, ebook_id)
);

-- ── Dosha quiz results ──
create table if not exists dosha_quiz_results (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  answers jsonb not null,
  computed_dosha text not null,
  created_at timestamptz default now()
);

-- ── Reviews ──
create table if not exists reviews (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  ebook_id uuid references ebooks(id) on delete cascade,
  rating int check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now(),
  unique (user_id, ebook_id)
);

-- ── Daily content (rotating homepage content) ──
create table if not exists daily_content (
  id uuid primary key default uuid_generate_v4(),
  content_date date unique not null,
  herb_id uuid references herbs(id),
  fact jsonb,          -- { en, te }
  quote jsonb,
  seasonal_note jsonb,
  recommended_ebook_id uuid references ebooks(id),
  created_at timestamptz default now()
);

-- ── Helpful indexes ──
create index if not exists idx_ebooks_topic on ebooks(topic_id);
create index if not exists idx_ebooks_status on ebooks(generation_status);
create index if not exists idx_chapters_ebook on ebook_chapters(ebook_id);
create index if not exists idx_topics_series on topics(series_id);
create index if not exists idx_purchases_user on purchases(user_id);
create index if not exists idx_progress_user on reading_progress(user_id);

-- ── Row Level Security (enable + basic policies; tighten per your auth model) ──
alter table profiles enable row level security;
alter table purchases enable row level security;
alter table reading_progress enable row level security;
alter table dosha_quiz_results enable row level security;
alter table reviews enable row level security;

create policy "Users manage own profile" on profiles for all using (auth.uid() = id);
create policy "Users manage own purchases" on purchases for all using (auth.uid() = user_id);
create policy "Users manage own progress" on reading_progress for all using (auth.uid() = user_id);
create policy "Users manage own quiz results" on dosha_quiz_results for all using (auth.uid() = user_id);
create policy "Anyone reads reviews, owners write" on reviews for select using (true);
create policy "Users write own reviews" on reviews for insert with check (auth.uid() = user_id);

-- ── Public content tables ──
-- RLS is ON (not left disabled) so the anon/public key — which is exposed in the
-- browser bundle — can never see anything beyond what these policies allow, even if
-- application code has a bug. Without RLS enabled, a disabled-RLS table is fully
-- open to anyone with the anon key, which is effectively "no protection at all"
-- rather than "protected by being out of RLS."
alter table series enable row level security;
alter table topics enable row level security;
alter table herbs enable row level security;
alter table ebooks enable row level security;
alter table ebook_chapters enable row level security;
alter table daily_content enable row level security;

create policy "Public read series" on series for select using (true);
create policy "Public read topics" on topics for select using (true);
create policy "Public read herbs" on herbs for select using (true);

-- Only fully-generated AND human-approved books are visible to anon/public reads.
-- 'outline' / 'generating' / 'pending_review' / 'failed' rows stay invisible outside
-- the service-role key (used server-side by the tick route / Worker / admin panel).
create policy "Public read approved ebooks" on ebooks for select using (generation_status = 'complete');

-- Chapters inherit their parent ebook's approval state rather than having their own
-- status column, so this checks it via the ebooks row.
create policy "Public read chapters of approved ebooks" on ebook_chapters for select using (
  exists (
    select 1 from ebooks
    where ebooks.id = ebook_chapters.ebook_id
    and ebooks.generation_status = 'complete'
  )
);

create policy "Public read daily content" on daily_content for select using (true);

-- generation_jobs and ai_generation_logs intentionally have NO public policy —
-- they're operational/internal and are only ever touched via the service-role key
-- (tick route, Cloudflare Worker, admin panel), never from the browser.
alter table generation_jobs enable row level security;
alter table ai_generation_logs enable row level security;
