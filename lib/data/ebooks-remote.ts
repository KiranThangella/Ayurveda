import { ebooks as staticEbooks } from '@/lib/data/ebooks';
import type { Ebook } from '@/lib/types';
import { getSupabaseClient } from '@/lib/supabase';

const LOCAL_PUBLISHED_KEY = 'mindwriter_local_published_ebooks';

export function getLocalPublishedEbooks(): Ebook[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_PUBLISHED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLocalPublishedEbook(ebook: Ebook): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getLocalPublishedEbooks();
    const filtered = existing.filter((b) => b.slug !== ebook.slug && b.id !== ebook.id);
    filtered.unshift(ebook);
    localStorage.setItem(LOCAL_PUBLISHED_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error('Failed to save published ebook to localStorage', e);
  }
}

export async function fetchAllEbooks(): Promise<Ebook[]> {
  const localList = getLocalPublishedEbooks();
  const mapBySlug = new Map<string, Ebook>();

  // 1. Static built-in ebooks
  for (const eb of staticEbooks) {
    mapBySlug.set(eb.slug, eb);
  }

  // 2. Locally published ebooks (localStorage)
  for (const eb of localList) {
    mapBySlug.set(eb.slug, eb);
  }

  // 3. Server-side published ebooks (via /api/ebooks which includes Supabase)
  try {
    // Only attempt fetch if we're in a browser context or have an absolute URL
    // In server components, it might be tricky without full URL, but this is usually called from client.
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL || '');
    if (baseUrl || typeof window !== 'undefined') {
      const res = await fetch(`${baseUrl}/api/ebooks`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.ebooks)) {
          for (const eb of data.ebooks) {
            mapBySlug.set(eb.slug, eb);
          }
        }
      }
    }
  } catch (err) {
    console.warn('Failed to fetch from /api/ebooks', err);
  }

  return Array.from(mapBySlug.values());
}

export async function fetchEbookBySlug(slug: string): Promise<Ebook | undefined> {
  const all = await fetchAllEbooks();
  return all.find((eb) => eb.slug === slug || eb.id === slug);
}
