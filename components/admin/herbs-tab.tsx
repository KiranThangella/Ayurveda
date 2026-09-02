'use client';

import { useState, useEffect, useMemo } from 'react';
import { herbs as staticHerbs, getHerbImageUrl } from '@/lib/data/herbs';
import { fetchGeneratedHerbs } from '@/lib/data/herbs-remote';
import type { Herb } from '@/lib/types';
import { HerbEditModal } from './herb-edit-modal';
import { getFreshAccessToken } from '@/lib/supabase';
import {
  Sprout,
  Search,
  Upload,
  Sparkles,
  Edit,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Plus,
  Image as ImageIcon,
  Leaf,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface HerbsTabProps {
  lang: 'en' | 'te';
  isTelugu: boolean;
  t: (k: string) => string;
}

export function HerbsTab({ lang, isTelugu, t }: HerbsTabProps) {
  const [query, setQuery] = useState('');
  const [remoteHerbs, setRemoteHerbs] = useState<Herb[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected herb for modal editing
  const [editingHerb, setEditingHerb] = useState<Herb | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // AI Herb Generator states
  const [isGenerating, setIsGenerating] = useState(false);
  const [genSlug, setGenSlug] = useState('');
  const [genCommonName, setGenCommonName] = useState('');
  const [genSanskritName, setGenSanskritName] = useState('');
  const [genMsg, setGenMsg] = useState<string | null>(null);
  const [genError, setGenError] = useState<string | null>(null);

  // Load Remote Herbs from Supabase
  const loadHerbs = async () => {
    setLoading(true);
    try {
      const data = await fetchGeneratedHerbs();
      setRemoteHerbs(data || []);
    } catch {
      // Ignore fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHerbs();
  }, []);

  // Merge static herbs with remote herbs from Supabase (preferring remote herb image if edited)
  const allHerbs = useMemo(() => {
    const staticMerged = staticHerbs.map((sh) => {
      const remoteMatch = remoteHerbs.find((r) => r.slug === sh.slug);
      if (remoteMatch) {
        return {
          ...sh,
          ...remoteMatch,
          imageUrl: remoteMatch.imageUrl || sh.imageUrl,
        };
      }
      return sh;
    });

    const extraRemote = remoteHerbs.filter((r) => !staticHerbs.some((s) => s.slug === r.slug));
    return [...staticMerged, ...extraRemote];
  }, [remoteHerbs]);

  // Search filtering
  const filteredHerbs = useMemo(() => {
    if (!query.trim()) return allHerbs;
    const q = query.toLowerCase().trim();
    return allHerbs.filter((h) => {
      const common = (h.commonName || h.englishName || '').toLowerCase();
      const telugu = h.teluguName || '';
      const sanskrit = (h.sanskritName || '').toLowerCase();
      const botanical = (h.botanicalName || '').toLowerCase();
      const slug = (h.slug || '').toLowerCase();
      return (
        common.includes(q) ||
        telugu.includes(query) ||
        sanskrit.includes(q) ||
        botanical.includes(q) ||
        slug.includes(q)
      );
    });
  }, [allHerbs, query]);

  // Open Edit Modal
  const handleOpenEdit = (herb: Herb) => {
    setEditingHerb(herb);
    setIsModalOpen(true);
  };

  // Callback when herb is saved
  const handleSaveSuccess = (updatedHerb: Herb) => {
    setRemoteHerbs((prev) => {
      const exists = prev.some((p) => p.slug === updatedHerb.slug);
      if (exists) {
        return prev.map((p) => (p.slug === updatedHerb.slug ? updatedHerb : p));
      }
      return [updatedHerb, ...prev];
    });
  };

  // Generate new Herb via AI
  const handleGenerateHerb = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!genSlug.trim() || !genCommonName.trim() || !genSanskritName.trim()) return;

    setIsGenerating(true);
    setGenMsg(null);
    setGenError(null);

    try {
      const token = await getFreshAccessToken();
      const res = await fetch('/api/generate/herb', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          slug: genSlug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-'),
          commonName: genCommonName.trim(),
          sanskritName: genSanskritName.trim(),
        }),
      });

      const text = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`Server response error (${res.status})`);
      }

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to generate herb');
      }

      setGenMsg(lang === 'te' ? 'మూలిక విజవంతంగా సృష్టించబడింది!' : 'Herb generated successfully!');
      setGenSlug('');
      setGenCommonName('');
      setGenSanskritName('');
      loadHerbs();
    } catch (err: unknown) {
      setGenError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-card border border-border shadow-soft">
        <div>
          <div className="flex items-center gap-2 mb-1 text-primary">
            <Sprout className="h-5 w-5" />
            <span className={cn('text-xs font-bold uppercase tracking-wider', isTelugu && 'font-telugu')}>
              {lang === 'te' ? 'ఆయుర్వేద మూలికల నిర్వాహణ' : 'Ayurvedic Herbs Management'}
            </span>
          </div>
          <h2 className={cn('text-2xl font-bold tracking-tight text-foreground', isTelugu && 'font-telugu')}>
            {lang === 'te' ? 'మూలికల చిత్రాలు & వివరణలు ఎడిటింగ్' : 'Manage Herbs & Custom Image Uploads'}
          </h2>
          <p className={cn('text-xs text-muted-foreground mt-1', isTelugu && 'font-telugu')}>
            {lang === 'te'
              ? `మొత్తం ${allHerbs.length} మూలికలకు చిత్రాలను ఉచితంగా అప్‌లోడ్ చేయండి లేదా నేరుగా మార్చండి.`
              : `Total ${allHerbs.length} herbs loaded. Upload custom photos or edit images for any herb.`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadHerbs}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl border border-border bg-card text-xs font-semibold text-foreground hover:bg-muted transition-colors flex items-center gap-2"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
            <span>{lang === 'te' ? 'రిఫ్రెష్' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* AI Herb Generator Collapsible Box */}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
        <h3 className={cn('text-sm font-bold text-foreground flex items-center gap-2 mb-3', isTelugu && 'font-telugu')}>
          <Sparkles className="h-4 w-4 text-primary" />
          {lang === 'te' ? 'కొత్త మూలికను AI తో సృష్టించు (Generate New Herb)' : 'Generate New Herb with AI'}
        </h3>

        <form onSubmit={handleGenerateHerb} className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-[11px] font-semibold text-foreground mb-1">Common Name (e.g. Gotu Kola)</label>
            <input
              type="text"
              required
              value={genCommonName}
              onChange={(e) => setGenCommonName(e.target.value)}
              placeholder="Gotu Kola"
              className="w-full rounded-xl border border-border bg-card px-3 py-2 text-xs outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-foreground mb-1">Sanskrit Name (e.g. Mandukaparni)</label>
            <input
              type="text"
              required
              value={genSanskritName}
              onChange={(e) => setGenSanskritName(e.target.value)}
              placeholder="Mandukaparni"
              className="w-full rounded-xl border border-border bg-card px-3 py-2 text-xs outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-foreground mb-1">Slug (e.g. gotu-kola)</label>
            <input
              type="text"
              required
              value={genSlug}
              onChange={(e) => setGenSlug(e.target.value)}
              placeholder="gotu-kola"
              className="w-full rounded-xl border border-border bg-card px-3 py-2 text-xs outline-none focus:border-primary"
            />
          </div>

          <button
            type="submit"
            disabled={isGenerating}
            className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            <span>{lang === 'te' ? 'సృష్టించు' : 'Generate'}</span>
          </button>
        </form>

        {genMsg && <p className="text-xs text-emerald-600 font-medium mt-2">{genMsg}</p>}
        {genError && <p className="text-xs text-destructive font-medium mt-2">{genError}</p>}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={lang === 'te' ? 'మూలిక పేరుతో వెతకండి (ఉదా: పసుపు, Brahmi)...' : 'Search herbs by name or Sanskrit...'}
            className={cn(
              'w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-4 text-xs shadow-soft outline-none transition-colors focus:border-primary',
              isTelugu && 'font-telugu'
            )}
          />
        </div>

        <div className="text-xs text-muted-foreground">
          {lang === 'te' ? `${filteredHerbs.length} మూలికలు కనిపిస్తున్నాయి` : `Showing ${filteredHerbs.length} herbs`}
        </div>
      </div>

      {/* Herbs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {filteredHerbs.map((herb) => {
          const displayImage = herb.imageUrl || getHerbImageUrl(herb);

          return (
            <div
              key={herb.slug}
              className="group relative bg-card border border-border/70 rounded-2xl p-4 shadow-soft hover:shadow-medium transition-all flex flex-col justify-between overflow-hidden"
            >
              {/* Image Preview & Badge */}
              <div>
                <div className="relative aspect-video rounded-xl bg-muted overflow-hidden mb-3 border border-border/50">
                  <img
                    src={displayImage}
                    alt={herb.commonName}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                    <span className="text-[10px] text-white font-medium">Click Edit to upload new image</span>
                  </div>
                  {herb.imageUrl && (
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-emerald-500/90 text-[10px] font-bold text-white shadow-sm">
                      Custom Image
                    </span>
                  )}
                </div>

                {/* Herb Titles */}
                <h4 className={cn('font-bold text-sm text-foreground line-clamp-1', isTelugu && 'font-telugu')}>
                  {herb.teluguName || herb.commonName}
                </h4>
                <div className="text-xs text-muted-foreground font-medium mt-0.5 flex items-center gap-1.5 flex-wrap">
                  <span>{herb.commonName}</span>
                  {herb.sanskritName && (
                    <>
                      <span>•</span>
                      <span className="italic">{herb.sanskritName}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-border/50 flex items-center gap-2">
                <button
                  onClick={() => handleOpenEdit(herb)}
                  className="flex-1 py-2 px-3 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>{lang === 'te' ? 'చిత్రం అప్‌లోడ్ / ఎడిట్' : 'Edit & Upload Image'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredHerbs.length === 0 && (
        <div className="text-center py-16 bg-card border border-border rounded-2xl">
          <Sprout className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
          <p className={cn('text-sm text-muted-foreground', isTelugu && 'font-telugu')}>
            {lang === 'te' ? 'ఏ మూలికలు దొరకలేదు' : 'No herbs matched your search.'}
          </p>
        </div>
      )}

      {/* Edit Herb Modal */}
      {editingHerb && (
        <HerbEditModal
          herb={editingHerb}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingHerb(null);
          }}
          onSaveSuccess={handleSaveSuccess}
        />
      )}
    </div>
  );
}
