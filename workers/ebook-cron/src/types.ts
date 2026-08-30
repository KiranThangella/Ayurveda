export interface Env {
  GEMINI_API_KEY: string;
  GEMINI_MODEL: string;
  // Optional fallback providers — only tried if earlier ones are missing/fail.
  // See src/providers.ts. Unset ones are simply skipped, nothing else to configure.
  GEMINI_API_KEY_2?: string;  // extra Gemini free-tier key — same GEMINI_MODEL, extra daily quota
  GEMINI_API_KEY_3?: string;
  GROQ_API_KEY?: string;
  GROQ_MODEL?: string;
  DEEPSEEK_API_KEY?: string;
  DEEPSEEK_MODEL?: string;
  OPENAI_API_KEY?: string;
  OPENAI_MODEL?: string;
  NVIDIA_API_KEY?: string;
  NVIDIA_MODEL?: string;
  // Local-only, dev use — only reachable when running `wrangler dev` locally.
  OLLAMA_BASE_URL?: string;
  OLLAMA_MODEL?: string;
  // Cloudflare Workers AI — free, native binding (see wrangler.toml [ai] section),
  // no API key needed. Last resort in the fallback chain, lower quality than the
  // others but genuinely free with no signup. WORKERS_AI_MODEL overrides the model.
  AI?: Ai;
  WORKERS_AI_MODEL?: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  PEXELS_API_KEY?: string;
  MANUAL_TRIGGER_SECRET?: string;
}

export type GenLang = 'en' | 'te';

export interface OutlineChapter {
  chapterNumber: number;
  title: string;
  coversPoints: string[];
  brief: string;
}

export interface ChapterSummary {
  chapterNumber: number;
  title: string;
  summary: string;
}
