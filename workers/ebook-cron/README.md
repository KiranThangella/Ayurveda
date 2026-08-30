# MindWriter Ebook Generator — Cloudflare Worker

Automates daily Ayurveda ebook generation. Runs on Cloudflare's native Cron
Trigger every 20 minutes, advancing one book-generation job by exactly one
step per tick (outline → each chapter → final metadata). CPU-time billing
means the 15-40s spent waiting on Gemini's response barely counts against
Workers limits — this comfortably runs on the **free plan**.

Same curriculum (`lib/data/curriculum.ts`), same prompt strategy, and the
same Supabase tables as the Next.js admin's manual "Generate" flow — this
Worker just handles the fully-automated daily pipeline instead.

## One-time setup

```bash
cd workers/ebook-cron
npm install
npx wrangler login          # opens a browser to authenticate with your Cloudflare account

# Set secrets (never commit these — you'll be prompted to paste each value):
npx wrangler secret put GEMINI_API_KEY
npx wrangler secret put SUPABASE_URL                # same as NEXT_PUBLIC_SUPABASE_URL
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY   # Supabase dashboard > Settings > API
npx wrangler secret put PEXELS_API_KEY              # free key from pexels.com/api
npx wrangler secret put MANUAL_TRIGGER_SECRET       # any random string, for testing only
```

## Deploy

```bash
npx wrangler deploy
```

That's it — the cron trigger in `wrangler.toml` is registered automatically
on deploy. No dashboard clicking needed.

## Testing without waiting for the cron

```bash
curl -X POST https://mindwriter-ebook-generator.<your-subdomain>.workers.dev \
  -H "x-trigger-secret: <the MANUAL_TRIGGER_SECRET you set>"
```

Each call advances exactly one step. Run it a few times in a row to watch a
book's outline get planned, then chapters written one by one.

## Watching it run

```bash
npx wrangler tail
```

Streams live logs — useful the first day to confirm ticks are succeeding.

## Changing the schedule

Edit the `crons` line in `wrangler.toml` (standard cron syntax), then
`npx wrangler deploy` again. E.g. `*/10 * * * *` for every 10 minutes if you
want books to finish faster.

## Keeping curriculum/prompts in sync

- `src/curriculum.ts` re-exports `lib/data/curriculum.ts` directly — always
  in sync automatically, nothing to maintain here.
- `src/prompts.ts` is a manual copy of `lib/ai/prompts.ts` (duplicated
  because the Next.js copy uses a `@/` path alias that a standalone Wrangler
  build can't resolve). If you change the prompting strategy, update **both**
  files.
