'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { Herb } from '@/lib/types';
import { getHerbImageUrl } from '@/lib/data/herbs';
import { getFreshAccessToken } from '@/lib/supabase';
import {
  X,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Sparkles,
  Link2,
  Search,
  Save,
  Sprout,
  Leaf,
  Trash2,
  RotateCcw,
} from 'lucide-react';

interface HerbEditModalProps {
  herb: Herb;
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess: (updatedHerb: Herb) => void;
}

// Preset gallery of high quality botanical photos for quick selection
const BOTANICAL_PRESETS = [
  { name: 'Fresh Green Leaves', url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Herbal Tea & Spices', url: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Turmeric Roots', url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Ashwagandha Roots', url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Ginger Herb', url: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Green Sprout Leaf', url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Natural Bark & Resin', url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Cardamom & Spices', url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Amla Fruit', url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Pomegranate / Dadima', url: 'https://images.unsplash.com/photo-1564834724105-918b73d1b9e0?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Aloe Vera / Kumari', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Lavender & Herbs', url: 'https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?auto=format&fit=crop&w=1200&q=80' },
];

export function HerbEditModal({ herb, isOpen, onClose, onSaveSuccess }: HerbEditModalProps) {
  const { lang, isTelugu } = useLanguage();

  const [commonName, setCommonName] = useState(herb.commonName || '');
  const [teluguName, setTeluguName] = useState(herb.teluguName || '');
  const [sanskritName, setSanskritName] = useState(herb.sanskritName || '');
  const [botanicalName, setBotanicalName] = useState(herb.botanicalName || '');
  const [category, setCategory] = useState(herb.category || 'herbs');
  
  // Image state
  const [imageUrl, setImageUrl] = useState<string>(herb.imageUrl || getHerbImageUrl(herb));
  const [imageUrlInput, setImageUrlInput] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>(herb.commonName || herb.englishName || 'herb plant');
  const [isSearching, setIsSearching] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Overview / description state
  const [introEn, setIntroEn] = useState(typeof herb.introduction === 'string' ? herb.introduction : herb.introduction?.en || '');
  const [introTe, setIntroTe] = useState(typeof herb.introduction === 'string' ? herb.introduction : herb.introduction?.te || '');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // File Upload Handler (Converts local file to compressed Data URL for instant preview & persistence)
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
          // Canvas compression to prevent 413 Payload Too Large
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_DIM = 1000;
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
              setImageUrl(compressed);
            } else {
              setImageUrl(rawDataUrl);
            }
          };
          img.onerror = () => setImageUrl(rawDataUrl);
          img.src = rawDataUrl;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // URL apply
  const handleApplyUrl = () => {
    if (imageUrlInput.trim()) {
      setImageUrl(imageUrlInput.trim());
      setImageUrlInput('');
    }
  };

  // Stock image search via Pexels API
  const handleStockSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setUploadError(null);
    try {
      const token = await getFreshAccessToken();
      const res = await fetch(`/api/admin/search-image?q=${encodeURIComponent(searchQuery)}`, {
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
        setImageUrl(data.url);
      } else {
        setUploadError(lang === 'te' ? 'చిత్రం దొరకలేదు, మరొక పదం ప్రయత్నించండి' : 'No image found for query');
      }
    } catch {
      setUploadError(lang === 'te' ? 'శోధన విఫలమైంది' : 'Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  // Submit Handler
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const payload = {
        slug: herb.slug,
        commonName,
        teluguName,
        sanskritName,
        botanicalName,
        category,
        imageUrl,
        overview: {
          en: introEn,
          te: introTe,
        },
        traditionalUses: herb.traditionalUses || [],
        commonPreparations: herb.commonPreparations || [],
        safetyInfo: herb.safetyInfo || { en: '', te: '' },
      };

      const token = await getFreshAccessToken();

      const res = await fetch('/api/admin/herb', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`Server returned error (${res.status}). Please try a smaller image file or image URL.`);
      }

      if (!res.ok || data.error) {
        throw new Error(data.error || `Failed to update herb (${res.status})`);
      }

      const updatedHerb: Herb = {
        ...herb,
        commonName,
        teluguName,
        sanskritName,
        botanicalName,
        category,
        imageUrl,
        introduction: {
          en: introEn,
          te: introTe,
        },
      };

      setSuccessMsg(lang === 'te' ? 'మూలిక చిత్రం మరియు వివరాలు విజయవంతంగా సేవ్ చేయబడ్డాయి!' : 'Herb image & details updated successfully!');
      onSaveSuccess(updatedHerb);

      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl my-8 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/60 bg-muted/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
              <Sprout className="h-5 w-5" />
            </div>
            <div>
              <h2 className={cn('text-lg font-bold text-foreground', isTelugu && 'font-telugu')}>
                {lang === 'te' ? `${teluguName || commonName} - చిత్రం & వివరాల ఎడిటింగ్` : `Edit Herb Image & Details: ${commonName}`}
              </h2>
              <p className="text-xs text-muted-foreground font-mono">slug: {herb.slug}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {error && (
            <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-destructive text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-2 font-medium">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* IMAGE SECTION */}
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className={cn('text-base font-bold text-foreground flex items-center gap-2', isTelugu && 'font-telugu')}>
                <ImageIcon className="h-5 w-5 text-primary" />
                {lang === 'te' ? 'మూలిక చిత్రం (Herb Image)' : 'Herb Image'}
              </h3>
              <span className="text-xs text-muted-foreground">
                {lang === 'te' ? 'నచ్చిన ఫోటోను అప్‌లోడ్ చేయండి లేదా ఎంచుకోండి' : 'Upload custom file or pick from gallery'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
              {/* Preview Container */}
              <div className="md:col-span-5 flex flex-col items-center gap-2">
                <div className="relative w-full aspect-square rounded-xl border border-border bg-black/5 dark:bg-black/40 overflow-hidden shadow-inner group">
                  <img
                    src={imageUrl || BOTANICAL_PRESETS[0].url}
                    alt={commonName}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = BOTANICAL_PRESETS[0].url;
                    }}
                  />
                  <div className="absolute top-2 left-2 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md text-[10px] text-white font-medium">
                    {lang === 'te' ? 'లైవ్ ప్రివ్యూ' : 'Live Preview'}
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full">
                  <button
                    type="button"
                    onClick={() => {
                      setImageUrl('');
                      setImageUrlInput('');
                    }}
                    className="flex-1 py-1.5 px-2 rounded-lg border border-destructive/30 bg-destructive/10 hover:bg-destructive/20 text-destructive text-[11px] font-semibold transition-colors flex items-center justify-center gap-1"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>{lang === 'te' ? 'చిత్రాన్ని తొలగించు' : 'Remove Image'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setImageUrl(getHerbImageUrl(herb));
                      setImageUrlInput('');
                    }}
                    className="py-1.5 px-2 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground text-[11px] font-medium transition-colors flex items-center justify-center gap-1"
                    title={lang === 'te' ? 'పాత చిత్రానికి రీసెట్ చేయి' : 'Reset to default image'}
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>{lang === 'te' ? 'రీసెట్' : 'Reset'}</span>
                  </button>
                </div>
              </div>

              {/* Upload & Option Controls */}
              <div className="md:col-span-7 space-y-4">
                {/* 1. File Upload Button */}
                <div>
                  <label className={cn('block text-xs font-semibold text-foreground mb-1.5', isTelugu && 'font-telugu')}>
                    {lang === 'te' ? '1. కంప్యూటర్/ఫోన్ నుండి ఫోటో అప్‌లోడ్ చేయండి (Upload Image File)' : '1. Upload Image File from Device'}
                  </label>
                  <label className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border-2 border-dashed border-primary/40 bg-card hover:bg-primary/5 cursor-pointer transition-colors text-xs font-medium text-primary">
                    <Upload className="h-4 w-4" />
                    <span>{lang === 'te' ? 'ఫోటో ఫైల్ ఎంచుకోండి (Choose File)' : 'Select Image File'}</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                  {uploadError && <p className="text-xs text-destructive mt-1">{uploadError}</p>}
                </div>

                {/* 2. Custom Image URL */}
                <div>
                  <label className={cn('block text-xs font-semibold text-foreground mb-1.5', isTelugu && 'font-telugu')}>
                    {lang === 'te' ? '2. లేదా నేరుగా Image URL నమోదు చేయండి' : '2. Or Paste Image URL'}
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="url"
                        value={imageUrlInput}
                        onChange={(e) => setImageUrlInput(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full rounded-xl border border-border bg-card py-2 pl-9 pr-3 text-xs outline-none focus:border-primary"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleApplyUrl}
                      disabled={!imageUrlInput.trim()}
                      className="rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-50"
                    >
                      {lang === 'te' ? 'వర్తించు' : 'Apply'}
                    </button>
                  </div>
                </div>

                {/* 3. Pexels Stock Search */}
                <div>
                  <label className={cn('block text-xs font-semibold text-foreground mb-1.5', isTelugu && 'font-telugu')}>
                    {lang === 'te' ? '3. లేదా Stock Photos నుండి వెతకండి' : '3. Search Stock Photos'}
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="e.g. herbal tea, turmeric..."
                        className="w-full rounded-xl border border-border bg-card py-2 pl-9 pr-3 text-xs outline-none focus:border-primary"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleStockSearch}
                      disabled={isSearching}
                      className="rounded-xl bg-accent px-3 py-2 text-xs font-semibold text-accent-foreground flex items-center gap-1 shrink-0"
                    >
                      {isSearching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                      <span>{lang === 'te' ? 'వెతుకు' : 'Search'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Botanical Presets */}
            <div className="pt-2 border-t border-border/40">
              <label className={cn('block text-xs font-semibold text-muted-foreground mb-2', isTelugu && 'font-telugu')}>
                {lang === 'te' ? 'లేదా తక్షణమైన మూలికా చిత్రాల గ్యాలరీ నుండి ఎంచుకోండి (Quick Botanical Presets):' : 'Or select from Quick Botanical Presets:'}
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-32 overflow-y-auto pr-1">
                {BOTANICAL_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setImageUrl(preset.url)}
                    className={cn(
                      'relative aspect-square rounded-lg overflow-hidden border transition-all group',
                      imageUrl === preset.url ? 'border-primary ring-2 ring-primary/40 scale-95' : 'border-border/60 hover:border-primary/50'
                    )}
                  >
                    <img src={preset.url} alt={preset.name} className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[9px] text-white text-center p-1 leading-tight font-medium">
                      {preset.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* HERB DETAILS FORM SECTION */}
          <div className="space-y-4">
            <h3 className={cn('text-sm font-bold text-foreground flex items-center gap-2', isTelugu && 'font-telugu')}>
              <Leaf className="h-4 w-4 text-emerald-600" />
              {lang === 'te' ? 'మూలిక వివరాలు (Herb Information)' : 'Herb Information'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Common Name (English)</label>
                <input
                  type="text"
                  value={commonName}
                  onChange={(e) => setCommonName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-3 py-2 text-xs outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1 font-telugu">తెలుగు పేరు (Telugu Name)</label>
                <input
                  type="text"
                  value={teluguName}
                  onChange={(e) => setTeluguName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-3 py-2 text-xs font-telugu outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">సంస్కృత నామం (Sanskrit Name)</label>
                <input
                  type="text"
                  value={sanskritName}
                  onChange={(e) => setSanskritName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-3 py-2 text-xs outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">వృక్షశాస్త్ర నామం (Botanical Name)</label>
                <input
                  type="text"
                  value={botanicalName}
                  onChange={(e) => setBotanicalName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-3 py-2 text-xs outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={cn('block text-xs font-semibold text-foreground mb-1', isTelugu && 'font-telugu')}>
                  {lang === 'te' ? 'ఇంగ్లీష్ పరిచయం (English Overview)' : 'English Overview'}
                </label>
                <textarea
                  rows={3}
                  value={introEn}
                  onChange={(e) => setIntroEn(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card p-2.5 text-xs outline-none focus:border-primary resize-none"
                />
              </div>

              <div>
                <label className={cn('block text-xs font-semibold text-foreground mb-1 font-telugu', isTelugu && 'font-telugu')}>
                  {lang === 'te' ? 'తెలుగు వివరణ (Telugu Overview)' : 'Telugu Overview'}
                </label>
                <textarea
                  rows={3}
                  value={introTe}
                  onChange={(e) => setIntroTe(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card p-2.5 text-xs font-telugu outline-none focus:border-primary resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border/60 bg-muted/20 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
          >
            {lang === 'te' ? 'రద్దు చేయి' : 'Cancel'}
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{lang === 'te' ? 'సేవ్ అవుతోంది...' : 'Saving...'}</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>{lang === 'te' ? 'చిత్రం సేవ్ చేయి' : 'Save Herb & Image'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
