import fs from 'fs';
import path from 'path';
import type { Ebook } from '@/lib/types';
import { panchamahabhutaTridoshaEbook } from '@/lib/data/books/panchamahabhuta-tridosha';

const DATA_DIR = path.join(process.cwd(), 'data');
const FILE_PATH = path.join(DATA_DIR, 'published-ebooks.json');

function ensureDirectory() {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch {}
  }
}

export function getServerPublishedEbooks(): Ebook[] {
  try {
    ensureDirectory();
    if (!fs.existsSync(FILE_PATH)) {
      // Seed with initial Telugu masterpiece
      const initial = [panchamahabhutaTridoshaEbook];
      fs.writeFileSync(FILE_PATH, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const raw = fs.readFileSync(FILE_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('Error reading server published ebooks:', err);
    return [panchamahabhutaTridoshaEbook];
  }
}

export function saveServerPublishedEbook(ebook: Ebook): void {
  try {
    ensureDirectory();
    const existing = getServerPublishedEbooks();
    const filtered = existing.filter((b) => b.slug !== ebook.slug && b.id !== ebook.id);
    filtered.unshift(ebook);
    fs.writeFileSync(FILE_PATH, JSON.stringify(filtered, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving server published ebook:', err);
  }
}
