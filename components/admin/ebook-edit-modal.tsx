'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { Ebook, EbookChapter } from '@/lib/types';
import { saveLocalPublishedEbook } from '@/lib/data/ebooks-remote';
import { categories } from '@/lib/data/categories';
import { getFreshAccessToken } from '@/lib/supabase';
import {
  X,
  Save,
  BookOpen,
  Plus,
  Trash2,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  FileText,
  DollarSign,
  Tag,
  Globe,
  Sparkles,
  Upload,
  Link2,
  Search,
  RotateCcw,
} from 'lucide-react';

const EBOOK_COVER_PRESETS = [
  { name: 'Ayurveda Book', url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Forest & Leaves', url: 'https://images.pexels.com/photos/12421351/pexels-photo-12421351.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
  { name: 'Herbal Tea & Spices', url: 'https://images.pexels.com/photos/1417945/pexels-photo-1417945.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
  { name: 'Healing Spices', url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Turmeric Roots', url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Sprout & Nature', url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Rain Leaves', url: 'https://images.pexels.com/photos/7002970/pexels-photo-7002970.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
  { name: 'Mountain Forest', url: 'https://images.pexels.com/photos/167699/pexels-photo-167699.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
];

const QUICK_SEARCH_TAGS = ['Ayurveda Book', 'Herbal Medicine', 'Medicinal Plants', 'Spices', 'Organic Healing', 'Yoga'];

interface EbookEditModalProps {
  ebook: Ebook;
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess: (updatedEbook: Ebook) => void;
}

export function EbookEditModal({ ebook, isOpen, onClose, onSaveSuccess }: EbookEditModalProps) {
  const { lang, isTelugu } = useLanguage();

  // Form state initialized from passed ebook
  const [titleEn, setTitleEn] = useState(ebook.title?.en || '');
  const [titleTe, setTitleTe] = useState(ebook.title?.te || '');
  const [subtitleEn, setSubtitleEn] = useState(ebook.subtitle?.en || '');
  const [subtitleTe, setSubtitleTe] = useState(ebook.subtitle?.te || '');
  const [descEn, setDescEn] = useState(ebook.description?.en || '');
  const [descTe, setDescTe] = useState(ebook.description?.te || '');
  
  const [price, setPrice] = useState(ebook.price || 199);
  const [isFree, setIsFree] = useState(ebook.isFree ?? false);
  const [category, setCategory] = useState(ebook.category || 'general-wellness');
  const [coverImage, setCoverImage] = useState(ebook.coverImage || '');
  const [status, setStatus] = useState<'completed' | 'published' | 'draft'>('completed');

  // Cover Image Extra Controls State
  const [coverImageInput, setCoverImageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState(ebook.title?.en || ebook.title?.te || 'ayurveda book');
  const [isSearching, setIsSearching] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Sync state when ebook prop or isOpen changes
  useEffect(() => {
    if (isOpen && ebook) {
      setTitleEn(ebook.title?.en || '');
      setTitleTe(ebook.title?.te || '');
      setSubtitleEn(ebook.subtitle?.en || '');
      setSubtitleTe(ebook.subtitle?.te || '');
      setDescEn(ebook.description?.en || '');
      setDescTe(ebook.description?.te || '');
      setPrice(ebook.price || 0);
      setIsFree(ebook.isFree ?? false);
      setCategory(ebook.category || 'general-wellness');
      setCoverImage(typeof ebook.coverImage === 'string' ? ebook.coverImage : '');
      setSearchQuery(ebook.title?.en || ebook.title?.te || 'ayurveda book');
      if (ebook.chapters && ebook.chapters.length > 0) {
        setChapters(
          ebook.chapters.map((ch, idx) => ({
            id: ch.id || `ch_${idx + 1}`,
            title: {
              en: typeof ch.title === 'string' ? ch.title : ch.title?.en || '',
              te: typeof ch.title === 'string' ? ch.title : ch.title?.te || '',
            },
            content: {
              en: typeof ch.content === 'string' ? ch.content : ch.content?.en || '',
              te: typeof ch.content === 'string' ? ch.content : ch.content?.te || '',
            },
          }))
        );
      }
    }
  }, [ebook, isOpen]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Chapters list state
  const [chapters, setChapters] = useState<EbookChapter[]>(() => {
    return (ebook.chapters || []).map((ch, idx) => ({
      id: ch.id || `ch_${idx + 1}`,
      title: {
        en: typeof ch.title === 'string' ? ch.title : ch.title?.en || '',
        te: typeof ch.title === 'string' ? ch.title : ch.title?.te || '',
      },
      content: {
        en: typeof ch.content === 'string' ? ch.content : ch.content?.en || '',
        te: typeof ch.content === 'string' ? ch.content : ch.content?.te || '',
      },
    }));
  });

  const [activeChapterIdx, setActiveChapterIdx] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentChapter = chapters[activeChapterIdx] || chapters[0];

  // File Upload with canvas compression
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUploadError(null);
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setUploadError(lang === 'te' ? 'చిత్రం సైజు 10MB కంటే తక్కువగా ఉండాలి' : 'Image size must be less than 10MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          const rawDataUrl = reader.result;
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_DIM = 1200;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_DIM) {
                height = Math.round((height * MAX_DIM) / width);
                width = MAX_DIM;
              }
            } else {
              if (height > MAX_DIM) {
                width = Math.round((width * MAX_DIM) / height);
                height = MAX_DIM;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              const compressed = canvas.toDataURL('image/jpeg', 0.82);
              setCoverImage(compressed);
            } else {
              setCoverImage(rawDataUrl);
            }
          };
          img.onerror = () => setCoverImage(rawDataUrl);
          img.src = rawDataUrl;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyUrl = () => {
    if (coverImageInput.trim()) {
      setCoverImage(coverImageInput.trim());
      setCoverImageInput('');
    }
  };

  const handleStockSearch = async (queryToSearch?: string) => {
    const term = queryToSearch || searchQuery;
    if (!term.trim()) return;
    setIsSearching(true);
    setUploadError(null);
    try {
      const token = await getFreshAccessToken();
      const res = await fetch(`/api/admin/search-image?q=${encodeURIComponent(term)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const text = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`Invalid response from image search (${res.status})`);
      }
      if (data.url) {
        setCoverImage(data.url);
      } else {
        setUploadError(lang === 'te' ? 'చిత్రం దొరకలేదు, మరొక పదం ప్రయత్నించండి' : 'No image found for query');
      }
    } catch {
      setUploadError(lang === 'te' ? 'శోధన విఫలమైంది' : 'Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  const handleUpdateChapter = (field: 'title' | 'content', langKey: 'en' | 'te', val: string) => {
    setChapters((prev) => {
      const next = [...prev];
      if (!next[activeChapterIdx]) return prev;
      next[activeChapterIdx] = {
        ...next[activeChapterIdx],
        [field]: {
          ...next[activeChapterIdx][field],
          [langKey]: val,
        },
      };
      return next;
    });
  };

  const handleAddChapter = () => {
    const newCh: EbookChapter = {
      id: `ch_${chapters.length + 1}_${Date.now()}`,
      title: {
        en: `Chapter ${chapters.length + 1}: New Chapter Title`,
        te: `అధ్యాయం ${chapters.length + 1}: క్రొత్త అధ్యాయం శీర్షిక`,
      },
      content: {
        en: `Write chapter content here in Markdown format...`,
        te: `ఇక్కడ అధ్యాయం విషయం టైప్ చేయండి...`,
      },
    };
    setChapters((prev) => [...prev, newCh]);
    setActiveChapterIdx(chapters.length);
  };

  const handleDeleteChapter = (idx: number) => {
    if (chapters.length <= 1) {
      setError(lang === 'te' ? 'కనీసం ఒక అధ్యాయం ఉండాలి' : 'An ebook must have at least one chapter');
      return;
    }
    setChapters((prev) => prev.filter((_, i) => i !== idx));
    if (activeChapterIdx >= idx && activeChapterIdx > 0) {
      setActiveChapterIdx(activeChapterIdx - 1);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    const updatedEbook: Ebook = {
      ...ebook,
      id: ebook.id || ebook.slug,
      slug: ebook.slug,
      title: { en: titleEn, te: titleTe },
      subtitle: { en: subtitleEn, te: subtitleTe },
      description: { en: descEn, te: descTe },
      price: isFree ? 0 : Number(price),
      isFree,
      isPremium: !isFree,
      category,
      coverImage: coverImage,
      chapters,
      language: ebook.language || 'te',
    };

    try {
      // 1. Save locally immediately
      saveLocalPublishedEbook(updatedEbook);

      // 2. Send to backend publish API
      const res = await fetch('/api/admin/ebook/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ebookId: updatedEbook.id,
          slug: updatedEbook.slug,
          topicSlug: updatedEbook.slug,
          language: updatedEbook.language,
          title: updatedEbook.title.te || updatedEbook.title.en,
          subtitle: updatedEbook.subtitle.te || updatedEbook.subtitle.en,
          description: updatedEbook.description.te || updatedEbook.description.en,
          category: updatedEbook.category,
          isFree: updatedEbook.isFree,
          price: updatedEbook.price,
          coverImage: updatedEbook.coverImage,
          chapters: updatedEbook.chapters.map((ch) => ({
            id: ch.id,
            title: ch.title.te || ch.title.en,
            content: ch.content.te || ch.content.en,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        console.warn('Backend update notice:', data.error);
      }

      setSuccessMsg(lang === 'te' ? 'పుస్తకం సవరణలు మరియు పూర్తయిన స్టేటస్ (Completed Status) విజయవంతంగా సేవ్ చేయబడ్డాయి!' : 'Ebook updated with Completed status successfully!');
      
      setTimeout(() => {
        onSaveSuccess(updatedEbook);
        onClose();
      }, 1200);
    } catch (e) {
      // Even if network fails, local update succeeded
      setSuccessMsg(lang === 'te' ? 'లోకల్ లో సవరించబడింది!' : 'Saved locally!');
      setTimeout(() => {
        onSaveSuccess(updatedEbook);
        onClose();
      }, 1200);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-5xl my-auto rounded-2xl border border-border/80 bg-card shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-foreground">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 bg-muted/30 px-6 py-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={cn('text-base font-bold leading-none', isTelugu && 'font-telugu')}>
                  {lang === 'te' ? 'ఈబుక్ సవరణ యంత్రం (Edit Ebook)' : 'Edit Completed Ebook'}
                </h3>
                <span className="rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold">
                  Status: {status.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 font-mono truncate max-w-md">
                Slug: {ebook.slug}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={saving}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {successMsg && (
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-xs font-semibold text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Basic Ebook Metadata */}
          <div className="rounded-xl border border-border/60 bg-muted/10 p-5 space-y-4">
            <h4 className={cn('text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2', isTelugu && 'font-telugu')}>
              <FileText className="h-4 w-4" />
              {lang === 'te' ? '1. పుస్తకం సాధారణ వివరాలు (Ebook Metadata)' : '1. Basic Ebook Details'}
            </h4>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Title (English)</label>
                <input
                  type="text"
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1 font-telugu">Title (తెలుగు)</label>
                <input
                  type="text"
                  value={titleTe}
                  onChange={(e) => setTitleTe(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-sm font-telugu outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Subtitle (English)</label>
                <input
                  type="text"
                  value={subtitleEn}
                  onChange={(e) => setSubtitleEn(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1 font-telugu">Subtitle (తెలుగు)</label>
                <input
                  type="text"
                  value={subtitleTe}
                  onChange={(e) => setSubtitleTe(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-sm font-telugu outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Description (English)</label>
                <textarea
                  rows={3}
                  value={descEn}
                  onChange={(e) => setDescEn(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card p-3 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1 font-telugu">Description (తెలుగు)</label>
                <textarea
                  rows={3}
                  value={descTe}
                  onChange={(e) => setDescTe(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card p-3 text-sm font-telugu outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-sm outline-none focus:border-primary"
                >
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name.en} ({c.name.te})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Price (₹)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    disabled={isFree}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-sm outline-none focus:border-primary disabled:opacity-50"
                  />
                  <label className="flex items-center gap-1.5 shrink-0 text-xs font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFree}
                      onChange={(e) => setIsFree(e.target.checked)}
                      className="rounded border-border text-primary focus:ring-primary"
                    />
                    <span>{lang === 'te' ? 'ఉచితం (Free)' : 'Free'}</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-sm font-semibold outline-none focus:border-primary text-emerald-600 dark:text-emerald-400"
                >
                  <option value="completed">Completed (పూర్తయింది)</option>
                  <option value="published">Published (ప్రచురించబడింది)</option>
                  <option value="draft">Draft (డ్రాఫ్ట్)</option>
                </select>
              </div>
            </div>

            {/* Rich Ebook Cover Image Management */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <label className={cn('block text-xs font-bold text-foreground flex items-center gap-2', isTelugu && 'font-telugu')}>
                  <ImageIcon className="h-4 w-4 text-primary" />
                  {lang === 'te' ? 'ఈబుక్ కవర్ ఇమేజ్ (Ebook Cover Image)' : 'Ebook Cover Image'}
                </label>
                <span className="text-[11px] text-muted-foreground">
                  {lang === 'te' ? 'స్టాక్ ఫోటోలు లేదా డివైజ్ నుండి మార్చండి' : 'Change cover via stock photos or device'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                {/* Live Cover Preview */}
                <div className="md:col-span-4 flex flex-col items-center gap-2">
                  <div className="relative w-full aspect-[3/4] max-w-[160px] rounded-xl border border-border bg-black/10 dark:bg-black/40 overflow-hidden shadow-md group">
                    {coverImage ? (
                      <img
                        src={coverImage}
                        alt={titleEn || 'Ebook Cover'}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-full w-full flex flex-col items-center justify-center p-3 text-center text-muted-foreground bg-muted/40">
                        <ImageIcon className="h-8 w-8 text-muted-foreground/40 mb-1" />
                        <span className="text-[10px] font-medium">{lang === 'te' ? 'కవర్ ఫోటో లేదు' : 'No Cover Assigned'}</span>
                      </div>
                    )}
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-[9px] text-white font-medium">
                      Preview
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 w-full max-w-[160px]">
                    <button
                      type="button"
                      onClick={() => {
                        setCoverImage('');
                        setCoverImageInput('');
                      }}
                      className="flex-1 py-1.5 px-2 rounded-lg border border-destructive/30 bg-destructive/10 hover:bg-destructive/20 text-destructive text-[10px] font-bold transition-colors flex items-center justify-center gap-1"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>{lang === 'te' ? 'తీసివేయి' : 'Remove'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setCoverImage(ebook.coverImage || EBOOK_COVER_PRESETS[0].url);
                        setCoverImageInput('');
                      }}
                      className="py-1.5 px-2 rounded-lg border border-border bg-card hover:bg-muted text-foreground text-[10px] font-semibold transition-colors flex items-center justify-center gap-1"
                      title={lang === 'te' ? 'రీసెట్ చేయి' : 'Reset'}
                    >
                      <RotateCcw className="h-3 w-3 text-muted-foreground" />
                      <span>{lang === 'te' ? 'రీసెట్' : 'Reset'}</span>
                    </button>
                  </div>
                </div>

                {/* Upload & Stock Photo Options */}
                <div className="md:col-span-8 space-y-3">
                  {/* 1. File Upload */}
                  <div>
                    <label className={cn('block text-[11px] font-semibold text-foreground mb-1', isTelugu && 'font-telugu')}>
                      {lang === 'te' ? '1. డివైజ్ నుండి ఇమేజ్ ఫైల్ అప్‌లోడ్ చేయండి' : '1. Upload Image from Device'}
                    </label>
                    <label className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-xl border border-dashed border-primary/40 bg-card hover:bg-primary/5 cursor-pointer transition-colors text-xs font-medium text-primary">
                      <Upload className="h-3.5 w-3.5" />
                      <span>{lang === 'te' ? 'కవర్ ఫైల్ ఎంచుకోండి (Choose File)' : 'Select Cover File'}</span>
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    </label>
                    {uploadError && <p className="text-[10px] text-destructive mt-0.5">{uploadError}</p>}
                  </div>

                  {/* 2. Free Stock Photo Search */}
                  <div>
                    <label className={cn('block text-[11px] font-semibold text-foreground mb-1', isTelugu && 'font-telugu')}>
                      {lang === 'te' ? '2. ఉచిత Stock Photos (Pexels) నుండి వెతకండి' : '2. Search Free Stock Footage (Pexels)'}
                    </label>
                    <div className="flex gap-1.5 mb-1.5">
                      <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="e.g. ayurveda, nature, healing..."
                          className="w-full rounded-xl border border-border bg-card py-1.5 pl-8 pr-2.5 text-xs outline-none focus:border-primary"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleStockSearch()}
                        disabled={isSearching}
                        className="rounded-xl bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground flex items-center gap-1 shrink-0"
                      >
                        {isSearching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                        <span>{lang === 'te' ? 'వెతుకు' : 'Search'}</span>
                      </button>
                    </div>

                    {/* Quick Search Suggestions */}
                    <div className="flex flex-wrap gap-1">
                      {QUICK_SEARCH_TAGS.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            setSearchQuery(tag);
                            handleStockSearch(tag);
                          }}
                          className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted hover:bg-primary/10 hover:text-primary border border-border/50 transition-colors"
                        >
                          + {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 3. Direct URL */}
                  <div>
                    <label className={cn('block text-[11px] font-semibold text-foreground mb-1', isTelugu && 'font-telugu')}>
                      {lang === 'te' ? '3. లేదా Image URL పేస్ట్ చేయండి' : '3. Or Paste Image URL'}
                    </label>
                    <div className="flex gap-1.5">
                      <div className="relative flex-1">
                        <Link2 className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <input
                          type="url"
                          value={coverImageInput}
                          onChange={(e) => setCoverImageInput(e.target.value)}
                          placeholder="https://images.unsplash.com/..."
                          className="w-full rounded-xl border border-border bg-card py-1.5 pl-8 pr-2.5 text-xs outline-none focus:border-primary"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleApplyUrl}
                        disabled={!coverImageInput.trim()}
                        className="rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-50"
                      >
                        {lang === 'te' ? 'వర్తించు' : 'Apply'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Presets Gallery */}
              <div className="pt-2 border-t border-border/40">
                <label className={cn('block text-[11px] font-semibold text-muted-foreground mb-1.5', isTelugu && 'font-telugu')}>
                  {lang === 'te' ? 'లేదా తక్షణమైన బుక్ కవర్ గ్యాలరీ నుండి ఎంచుకోండి:' : 'Or pick from Quick Book Cover Presets:'}
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 max-h-24 overflow-y-auto pr-1">
                  {EBOOK_COVER_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCoverImage(preset.url)}
                      className={cn(
                        'relative aspect-[3/4] rounded-lg overflow-hidden border transition-all group',
                        coverImage === preset.url ? 'border-primary ring-2 ring-primary/40 scale-95' : 'border-border/60 hover:border-primary/50'
                      )}
                    >
                      <img src={preset.url} alt={preset.name} className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[8px] text-white text-center p-0.5 font-medium leading-tight">
                        {preset.name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Chapter Level Content Editor */}
          <div className="rounded-xl border border-border/60 bg-muted/10 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className={cn('text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2', isTelugu && 'font-telugu')}>
                <BookOpen className="h-4 w-4" />
                {lang === 'te' ? `2. అధ్యాయాలు (${chapters.length}) సవరణ` : `2. Edit Chapters (${chapters.length})`}
              </h4>
              <button
                onClick={handleAddChapter}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 px-3 py-1.5 text-xs font-semibold transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{lang === 'te' ? 'కొత్త అధ్యాయం జోడించు' : 'Add New Chapter'}</span>
              </button>
            </div>

            <div className="grid lg:grid-cols-[240px_1fr] gap-4">
              {/* Chapter list sidebar */}
              <div className="rounded-xl border border-border/60 bg-card p-3 space-y-1 max-h-[350px] overflow-y-auto">
                {chapters.map((ch, idx) => (
                  <div
                    key={ch.id || idx}
                    className={cn(
                      'flex items-center justify-between rounded-lg p-2.5 text-xs transition-colors cursor-pointer',
                      activeChapterIdx === idx
                        ? 'bg-primary text-primary-foreground font-bold'
                        : 'hover:bg-muted/60 text-foreground'
                    )}
                    onClick={() => setActiveChapterIdx(idx)}
                  >
                    <span className="truncate flex-1">
                      {idx + 1}. {ch.title.en || ch.title.te || 'Untitled'}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteChapter(idx);
                      }}
                      className={cn(
                        'p-1 rounded hover:bg-destructive/20 hover:text-destructive shrink-0 ml-1',
                        activeChapterIdx === idx ? 'text-primary-foreground/80' : 'text-muted-foreground'
                      )}
                      title="Delete chapter"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Active Chapter Details */}
              {currentChapter && (
                <div className="rounded-xl border border-border/60 bg-card p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-border/40 pb-2">
                    <span className="text-xs font-bold text-primary uppercase">
                      Editing Chapter {activeChapterIdx + 1}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {(currentChapter.content?.en || currentChapter.content?.te || '').split(/\s+/).length} words
                    </span>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-muted-foreground mb-1">Chapter Title (EN)</label>
                      <input
                        type="text"
                        value={currentChapter.title?.en || ''}
                        onChange={(e) => handleUpdateChapter('title', 'en', e.target.value)}
                        className="w-full rounded-lg border border-border bg-card px-3 py-1.5 text-xs outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-muted-foreground mb-1 font-telugu">Chapter Title (తెలుగు)</label>
                      <input
                        type="text"
                        value={currentChapter.title?.te || ''}
                        onChange={(e) => handleUpdateChapter('title', 'te', e.target.value)}
                        className="w-full rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-telugu outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-muted-foreground mb-1">Content (English Markdown)</label>
                      <textarea
                        rows={8}
                        value={currentChapter.content?.en || ''}
                        onChange={(e) => handleUpdateChapter('content', 'en', e.target.value)}
                        className="w-full rounded-lg border border-border bg-card p-2.5 text-xs font-mono outline-none focus:border-primary leading-relaxed"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-muted-foreground mb-1 font-telugu">Content (తెలుగు Text/Markdown)</label>
                      <textarea
                        rows={8}
                        value={currentChapter.content?.te || ''}
                        onChange={(e) => handleUpdateChapter('content', 'te', e.target.value)}
                        className="w-full rounded-lg border border-border bg-card p-2.5 text-xs font-telugu outline-none focus:border-primary leading-relaxed"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border/60 bg-muted/30 px-6 py-4 shrink-0">
          <button
            onClick={onClose}
            disabled={saving}
            className="rounded-xl border border-border/60 px-4 py-2.5 text-xs font-semibold hover:bg-muted/60 transition-colors"
          >
            {lang === 'te' ? 'రద్దు చేయి' : 'Cancel'}
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 text-xs font-bold shadow-soft hover:shadow-card transition-all disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{lang === 'te' ? 'భద్రపరుస్తోంది...' : 'Saving Changes...'}</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span className={isTelugu ? 'font-telugu' : ''}>
                  {lang === 'te' ? 'సవరణలను భద్రపరుచు (Save & Set Completed)' : 'Save Changes & Set Completed'}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
