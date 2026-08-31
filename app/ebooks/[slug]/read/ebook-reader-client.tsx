'use client';

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { useLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { getEbookBySlug } from '@/lib/data/ebooks';
import { fetchEbookBySlug } from '@/lib/data/ebooks-remote';
import type { Ebook } from '@/lib/types';
import { Disclaimer } from '@/components/disclaimer';
import { ArrowLeft, ArrowRight, List, Sun, Moon, Type, Bookmark, BookmarkCheck, X, Loader2 } from 'lucide-react';

export default function EbookReaderClient({ slug }: { slug: string }) {
  const { t, lang, isTelugu } = useLanguage();
  const [ebook, setEbook] = useState<Ebook | undefined | null>(() => getEbookBySlug(slug) || null);
  const [loading, setLoading] = useState(!ebook);

  const [chapterIdx, setChapterIdx] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState(18);
  const [tocOpen, setTocOpen] = useState(false);
  const [bookmarks, setBookmarks] = useState<number[]>([]);

  useEffect(() => {
    if (!ebook) {
      setLoading(true);
      fetchEbookBySlug(slug).then((res) => {
        setEbook(res || undefined);
        setLoading(false);
      });
    }
  }, [slug, ebook]);

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(`bookmarks-${slug}`) : null;
    if (saved) setBookmarks(JSON.parse(saved));
    const ch = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('ch') : null;
    if (ch) setChapterIdx(parseInt(ch));
  }, [slug]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`progress-${slug}`, JSON.stringify({ chapterIdx, scroll: 0 }));
    }
  }, [chapterIdx, slug]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{lang === 'te' ? 'పుస్తకం లోడ్ అవుతోంది...' : 'Loading ebook...'}</p>
      </div>
    );
  }

  if (!ebook || !ebook.chapters || ebook.chapters.length === 0) return notFound();

  const chapter = ebook.chapters[chapterIdx] || ebook.chapters[0];
  const title = (ebook.title && (ebook.title[lang] || ebook.title.en)) || '';
  const chTitle = (chapter?.title && (chapter.title[lang] || chapter.title.en || (typeof chapter.title === 'string' ? chapter.title : ''))) || '';
  const chContent = (chapter?.content && (chapter.content[lang] || chapter.content.en || (typeof chapter.content === 'string' ? chapter.content : ''))) || '';
  const progress = Math.round(((chapterIdx + 1) / ebook.chapters.length) * 100);

  const toggleBookmark = () => {
    setBookmarks((prev) => {
      const next = prev.includes(chapterIdx)
        ? prev.filter((i) => i !== chapterIdx)
        : [...prev, chapterIdx];
      if (typeof window !== 'undefined') localStorage.setItem(`bookmarks-${slug}`, JSON.stringify(next));
      return next;
    });
  };

  return (
    <div className={cn('min-h-screen transition-colors', darkMode ? 'dark bg-background text-foreground' : 'bg-background')}>
      {/* Reader header */}
      <div className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur-md">
        <div className="mx-auto max-w-3xl px-4 h-14 flex items-center justify-between gap-4">
          <a
            href={`/ebooks/${ebook.slug}`}
            className={cn('flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground', isTelugu && 'font-telugu')}
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline truncate max-w-[150px]">{title}</span>
          </a>

          {/* Progress */}
          <div className="flex-1 flex items-center gap-3 max-w-xs">
            <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-xs text-muted-foreground shrink-0">{progress}%</span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setFontSize((s) => Math.max(14, s - 2))}
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted/60"
              aria-label="Decrease font size"
            >
              <Type className="h-4 w-4 scale-90" />
            </button>
            <button
              onClick={() => setFontSize((s) => Math.min(28, s + 2))}
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted/60"
              aria-label="Increase font size"
            >
              <Type className="h-5 w-5" />
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted/60"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              onClick={toggleBookmark}
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted/60"
              aria-label="Bookmark chapter"
            >
              {bookmarks.includes(chapterIdx) ? <BookmarkCheck className="h-4 w-4 text-primary" /> : <Bookmark className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setTocOpen(!tocOpen)}
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted/60"
              aria-label="Table of contents"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* TOC drawer */}
      {tocOpen && (
        <div className="fixed inset-0 z-50 flex" onClick={() => setTocOpen(false)}>
          <div className="absolute inset-0 bg-black/30" />
          <div
            className="relative w-80 max-w-[85vw] bg-card border-r border-border h-full overflow-y-auto p-4 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className={cn('text-sm font-bold', isTelugu && 'font-telugu')}>{t('ebook.contents')}</h3>
              <button onClick={() => setTocOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-1">
              {ebook.chapters.map((ch, i) => (
                <button
                  key={ch.id}
                  onClick={() => { setChapterIdx(i); setTocOpen(false); }}
                  className={cn(
                    'flex items-center gap-3 w-full rounded-lg p-2.5 text-left text-sm transition-colors',
                    i === chapterIdx ? 'bg-primary/10 text-primary font-medium' : 'text-foreground/70 hover:bg-muted/60'
                  )}
                >
                  <span className={cn('flex h-6 w-6 items-center justify-center rounded text-xs shrink-0', i === chapterIdx ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>
                    {i + 1}
                  </span>
                  <span className={cn(isTelugu && lang === 'te' && 'font-telugu')}>{ch.title[lang] || ch.title.en}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-2 text-center">
          <p className={cn('text-xs font-semibold uppercase tracking-wider text-primary', isTelugu && 'font-telugu')}>
            {t('ebook.reader')} — {ebook.chapters.length > 0 ? `${chapterIdx + 1} / ${ebook.chapters.length}` : ''}
          </p>
        </div>
        <h1 className={cn('text-2xl sm:text-3xl font-bold tracking-tight font-display text-center mb-8', isTelugu && lang === 'te' && 'font-telugu')}>
          {chTitle}
        </h1>

        <div
          className={cn('prose-content leading-relaxed text-foreground/90 whitespace-pre-line', isTelugu && lang === 'te' && 'font-telugu')}
          style={{ fontSize: `${fontSize}px`, lineHeight: 1.75 }}
        >
          {chContent}
        </div>

        <Disclaimer variant="short" className="mt-8" />

        {/* Navigation */}
        <div className="mt-10 flex items-center justify-between gap-4 border-t border-border/40 pt-6">
          <button
            onClick={() => setChapterIdx(Math.max(0, chapterIdx - 1))}
            disabled={chapterIdx === 0}
            className={cn(
              'flex items-center gap-2 rounded-lg border border-border/60 px-4 py-2.5 text-sm font-medium transition-colors',
              chapterIdx === 0 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-muted/60',
              isTelugu && 'font-telugu'
            )}
          >
            <ArrowLeft className="h-4 w-4" />
            {t('ebook.prev')}
          </button>
          <button
            onClick={() => setChapterIdx(Math.min(ebook.chapters.length - 1, chapterIdx + 1))}
            disabled={chapterIdx === ebook.chapters.length - 1}
            className={cn(
              'flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors',
              chapterIdx === ebook.chapters.length - 1 && 'opacity-40 cursor-not-allowed',
              isTelugu && 'font-telugu'
            )}
          >
            {t('ebook.next')}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
