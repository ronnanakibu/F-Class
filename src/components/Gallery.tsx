'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { IGStory } from '@/types';
import SectionReveal from './SectionReveal';
import {
  X,
  Volume2,
  VolumeX,
  Heart,
  Send,
  Sparkles,
  Archive,
  ChevronLeft,
  ChevronRight,
  Play,
  Video,
  Image as ImageIcon,
  Tag,
  ExternalLink,
  Layers,
} from 'lucide-react';

const STORY_DURATION = 5000; // 5 seconds per story

const categories = [
  'All',
  'Praktikum',
  'Kantin & Chill',
  'Project IoT',
  'Event',
  'Chaos',
] as const;

const categoryBadgeConfig: Record<
  string,
  { icon: string; color: string; border: string; bg: string }
> = {
  praktikum: {
    icon: '⚡',
    color: 'text-emerald-400',
    border: 'border-emerald-500/40',
    bg: 'bg-emerald-950/80',
  },
  'kantin & chill': {
    icon: '☕',
    color: 'text-amber-400',
    border: 'border-amber-500/40',
    bg: 'bg-amber-950/80',
  },
  'project iot': {
    icon: '🚀',
    color: 'text-cyan-400',
    border: 'border-cyan-500/40',
    bg: 'bg-cyan-950/80',
  },
  event: {
    icon: '🎉',
    color: 'text-purple-400',
    border: 'border-purple-500/40',
    bg: 'bg-purple-950/80',
  },
  chaos: {
    icon: '🔥',
    color: 'text-rose-400',
    border: 'border-rose-500/40',
    bg: 'bg-rose-950/80',
  },
  general: {
    icon: '📸',
    color: 'text-blue-400',
    border: 'border-blue-500/40',
    bg: 'bg-blue-950/80',
  },
};

export default function Gallery() {
  const [stories, setStories] = useState<IGStory[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; x: number }[]>([]);
  const [showAll, setShowAll] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const elapsedRef = useRef<number>(0);

  // Fetch stories
  const fetchStories = useCallback(async () => {
    try {
      const res = await fetch('/api/stories', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.stories)) {
        setStories(data.stories);
      }
    } catch (err) {
      console.error('Failed to load stories for gallery:', err);
    }
  }, []);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  // Filtered stories based on active category
  const filtered = useMemo(() => {
    let result = stories;
    if (activeCategory !== 'All') {
      result = stories.filter(
        (s) => (s.category || 'General').toLowerCase() === activeCategory.toLowerCase()
      );
    }
    return result;
  }, [activeCategory, stories]);

  const displayedStories = useMemo(() => {
    return showAll ? filtered : filtered.slice(0, 8);
  }, [filtered, showAll]);

  // Story Viewer Handlers
  const activeStory: IGStory | null =
    activeStoryIndex !== null && stories[activeStoryIndex]
      ? stories[activeStoryIndex]
      : null;

  const handleNextStory = useCallback(() => {
    if (activeStoryIndex === null) return;
    if (activeStoryIndex < stories.length - 1) {
      setActiveStoryIndex(activeStoryIndex + 1);
      setProgress(0);
      elapsedRef.current = 0;
      startTimeRef.current = Date.now();
    } else {
      setActiveStoryIndex(null);
      setProgress(0);
      elapsedRef.current = 0;
    }
  }, [activeStoryIndex, stories.length]);

  const handlePrevStory = useCallback(() => {
    if (activeStoryIndex === null) return;
    if (activeStoryIndex > 0) {
      setActiveStoryIndex(activeStoryIndex - 1);
      setProgress(0);
      elapsedRef.current = 0;
      startTimeRef.current = Date.now();
    } else {
      setProgress(0);
      elapsedRef.current = 0;
      startTimeRef.current = Date.now();
    }
  }, [activeStoryIndex]);

  // Story progress timer
  useEffect(() => {
    if (activeStoryIndex === null || isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    startTimeRef.current = Date.now() - elapsedRef.current;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min((elapsed / STORY_DURATION) * 100, 100);
      setProgress(pct);

      if (elapsed >= STORY_DURATION) {
        handleNextStory();
      }
    }, 40);

    timerRef.current = interval;

    return () => clearInterval(interval);
  }, [activeStoryIndex, isPaused, handleNextStory]);

  // Hold to pause gesture
  const handleHoldStart = () => {
    setIsPaused(true);
    elapsedRef.current = (progress / 100) * STORY_DURATION;
  };

  const handleHoldEnd = () => {
    setIsPaused(false);
  };

  // Keyboard navigation & close on Esc
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (activeStoryIndex === null) return;
      if (e.key === 'ArrowRight') handleNextStory();
      if (e.key === 'ArrowLeft') handlePrevStory();
      if (e.key === 'Escape') setActiveStoryIndex(null);
      if (e.key === ' ') setIsPaused((p) => !p);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeStoryIndex, handleNextStory, handlePrevStory]);

  const openStoryAt = (idx: number) => {
    setActiveStoryIndex(idx);
    setProgress(0);
    elapsedRef.current = 0;
    startTimeRef.current = Date.now();
  };

  const triggerLike = () => {
    if (!activeStory) return;
    const isNowLiked = !likedMap[activeStory.id];
    setLikedMap((prev) => ({ ...prev, [activeStory.id]: isNowLiked }));

    if (isNowLiked) {
      const heartId = Date.now();
      const randomX = Math.random() * 60 - 30;
      setFloatingHearts((prev) => [...prev, { id: heartId, x: randomX }]);
      setTimeout(() => {
        setFloatingHearts((prev) => prev.filter((h) => h.id !== heartId));
      }, 1200);
    }
  };

  // Format date readable
  const formatStoryDate = (isoStr: string) => {
    try {
      const date = new Date(isoStr);
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return isoStr;
    }
  };

  // Heights for masonry visual variety
  const heights = ['h-60', 'h-80', 'h-64', 'h-96', 'h-72', 'h-84', 'h-68', 'h-76'];

  return (
    <section id="gallery" className="py-24 md:py-32 relative">
      <div className="container-custom">
        {/* Section Header */}
        <SectionReveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-purple-500/10 border border-rose-500/20 mb-3">
                <Sparkles size={12} className="text-rose-400" />
                <span className="font-mono text-xs tracking-wider text-rose-400 uppercase font-semibold">
                  The Vault • Instagram Story Archive
                </span>
              </div>
              <h2 className="text-3xl md:text-5xl font-heading font-extrabold text-text-primary tracking-tight">
                Memories & <span className="bg-gradient-to-r from-amber-400 via-rose-500 to-purple-500 bg-clip-text text-transparent">Arsip Story</span>
              </h2>
              <p className="text-sm md:text-base text-text-muted mt-2 max-w-2xl">
                Semua story Instagram dari <code className="text-accent font-mono">@comeinone.f</code> tersimpan permanen di dalam vault ini. Tidak hilang setelah 24 jam.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-bg-elevated border border-border text-xs font-mono text-text-dim">
                <Archive size={13} className="text-accent" />
                {stories.length} Story Terkoleksi
              </span>
            </div>
          </div>
        </SectionReveal>

        {/* Top Story Avatar Highlights Ring (Horizontal Bar) */}
        <SectionReveal delay={0.05}>
          <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto pb-4 pt-2 mb-8 no-scrollbar">
            {/* Main Account Ring (@comeinone.f) */}
            <button
              onClick={() => openStoryAt(0)}
              className="flex flex-col items-center gap-2 group shrink-0 cursor-pointer text-center"
              aria-label="Putar Semua Story"
            >
              <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(244,63,94,0.4)]">
                <div className="p-0.5 bg-bg-primary rounded-full">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-bg-elevated to-bg-surface border border-border flex items-center justify-center overflow-hidden text-center">
                    <span className="font-heading font-black text-base sm:text-lg text-transparent bg-gradient-to-r from-accent to-rose-400 bg-clip-text">
                      CE F
                    </span>
                  </div>
                </div>

                {stories.length > 0 && (
                  <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-rose-500 border-2 border-bg-primary flex items-center justify-center text-[9px] text-white font-bold">
                    {stories.length}
                  </span>
                )}
              </div>
              <div className="max-w-[70px] sm:max-w-[80px] text-center">
                <span className="block text-xs font-semibold text-text-primary truncate">
                  comeinone.f
                </span>
                <span className="block text-[10px] text-accent font-mono">
                  Putar Story
                </span>
              </div>
            </button>

            {/* Category Highlights */}
            {categories.slice(1).map((cat) => {
              const catCfg = categoryBadgeConfig[cat.toLowerCase()] || categoryBadgeConfig.general;
              const countInCat = stories.filter(
                (s) => (s.category || 'General').toLowerCase() === cat.toLowerCase()
              ).length;

              return (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat);
                    const idx = stories.findIndex(
                      (s) => (s.category || 'General').toLowerCase() === cat.toLowerCase()
                    );
                    if (idx !== -1) openStoryAt(idx);
                  }}
                  className="flex flex-col items-center gap-2 group shrink-0 cursor-pointer text-center"
                >
                  <div className="p-0.5 rounded-full bg-border hover:border-text-dim border transition-all duration-200 group-hover:scale-105">
                    <div className="p-0.5 bg-bg-primary rounded-full">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-bg-elevated flex items-center justify-center text-xl group-hover:bg-bg-surface transition-colors">
                        <span>{catCfg.icon}</span>
                      </div>
                    </div>
                  </div>
                  <div className="max-w-[70px] sm:max-w-[80px] text-center">
                    <span className="block text-xs font-medium text-text-muted group-hover:text-text-primary truncate">
                      {cat}
                    </span>
                    <span className="block text-[10px] text-text-dim font-mono">
                      {countInCat} Story
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </SectionReveal>

        {/* Category Filter Tabs */}
        <SectionReveal delay={0.1}>
          <div className="flex flex-wrap items-center gap-2 mb-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 text-xs font-mono tracking-wider rounded-xl border transition-all duration-200 cursor-pointer uppercase ${
                  activeCategory === cat
                    ? 'bg-accent/15 border-accent text-accent font-semibold shadow-sm'
                    : 'bg-bg-elevated/40 border-border text-text-muted hover:border-text-dim hover:text-text-primary'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </SectionReveal>

        {/* The Vault Masonry Grid (Archived Instagram Stories) */}
        {displayedStories.length === 0 ? (
          <div className="text-center py-16 rounded-3xl border border-dashed border-border bg-bg-elevated/20">
            <Tag size={32} className="text-text-dim mx-auto mb-3" />
            <h3 className="text-base font-heading font-semibold text-text-primary">
              Belum ada story di kategori ini
            </h3>
            <p className="text-xs text-text-muted mt-1">
              Pilih tab lain atau unggah story baru melalui admin / WhatsApp Bot!
            </p>
          </div>
        ) : (
          <div className="masonry">
            <AnimatePresence mode="popLayout">
              {displayedStories.map((story, i) => {
                const globalIndex = stories.findIndex((s) => s.id === story.id);
                const catCfg =
                  categoryBadgeConfig[(story.category || 'general').toLowerCase()] ||
                  categoryBadgeConfig.general;

                return (
                  <motion.button
                    key={story.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, delay: i * 0.04 }}
                    layout
                    onClick={() => openStoryAt(globalIndex !== -1 ? globalIndex : 0)}
                    className={`group relative w-full ${
                      heights[i % heights.length]
                    } rounded-2xl md:rounded-3xl border border-border/80 bg-neutral-950 overflow-hidden cursor-pointer hover:border-border-accent hover:shadow-[0_0_25px_rgba(0,240,255,0.15)] transition-all duration-300 text-left`}
                  >
                    {/* Media Layer */}
                    <div className="absolute inset-0 w-full h-full overflow-hidden bg-neutral-950">
                      {story.mediaType === 'video' ? (
                        <video
                          src={story.mediaUrl}
                          poster={story.thumbnailUrl}
                          muted
                          loop
                          autoPlay
                          playsInline
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <img
                          src={story.mediaUrl}
                          alt={story.caption || 'Story'}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      )}

                      {/* Fallback Graphic if media file not on disk */}
                      <div className="absolute inset-0 bg-gradient-to-br from-bg-elevated via-bg-surface to-bg-primary flex flex-col items-center justify-center p-6 text-center -z-0">
                        <div className="w-12 h-12 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mb-3">
                          <Layers size={22} className="text-accent" />
                        </div>
                        <span className="text-xs font-mono uppercase tracking-widest text-accent mb-1">
                          {story.category || 'General'}
                        </span>
                        <p className="text-xs text-text-muted font-medium line-clamp-2 max-w-xs">
                          {story.caption || 'Instagram Story Archive'}
                        </p>
                      </div>
                    </div>

                    {/* Dark gradient vignettes for contrast */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/40 pointer-events-none" />

                    {/* Top-Right Badge: Media Type + Instagram Indicator */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20 pointer-events-none">
                      <div className="px-2 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[10px] font-mono text-white/90 flex items-center gap-1 shadow-md">
                        {story.mediaType === 'video' ? (
                          <Video size={11} className="text-rose-400" />
                        ) : (
                          <ImageIcon size={11} className="text-amber-400" />
                        )}
                        <span className="uppercase text-[9px]">{story.mediaType}</span>
                      </div>
                    </div>

                    {/* POJOK KIRI BAWAH: Category Badge & Date Badge (Sesuai Permintaan) */}
                    <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center gap-1.5 z-20 pointer-events-none">
                      {/* Kategori Badge di pojok kiri bawah */}
                      <div
                        className={`px-2.5 py-1 rounded-full backdrop-blur-md border text-[10px] font-mono font-bold flex items-center gap-1 shadow-lg ${catCfg.bg} ${catCfg.border} ${catCfg.color}`}
                      >
                        <span>{catCfg.icon}</span>
                        <span className="uppercase tracking-wider">
                          {story.category || 'General'}
                        </span>
                      </div>

                      {/* Timestamp Date Pill */}
                      <div className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-[10px] font-mono text-white/90 shadow-lg">
                        {formatStoryDate(story.timestamp)}
                      </div>
                    </div>

                    {/* Hover Overlay: Caption & Story Open Action */}
                    <div className="absolute inset-0 bg-black/75 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4 z-30">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-accent uppercase tracking-wider">
                          @{story.author || 'comeinone.f'}
                        </span>
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 flex items-center justify-center text-white">
                          <Play size={12} className="translate-x-0.5" />
                        </div>
                      </div>

                      <div>
                        {story.caption ? (
                          <p className="text-xs sm:text-sm text-white font-medium line-clamp-3 leading-snug mb-3">
                            &ldquo;{story.caption}&rdquo;
                          </p>
                        ) : (
                          <p className="text-xs text-text-dim italic mb-3">
                            Klik untuk menonton story lengkap
                          </p>
                        )}

                        <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-accent">
                          <span>Buka Story</span>
                          <ExternalLink size={12} />
                        </span>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Load More Button */}
        {filtered.length > 8 && (
          <SectionReveal>
            <div className="mt-12 flex justify-center">
              <button
                onClick={() => setShowAll(!showAll)}
                className="px-6 py-3 rounded-full bg-bg-elevated/40 border border-border text-text-primary hover:border-accent hover:text-accent transition-all duration-300 font-medium text-sm flex items-center gap-2"
              >
                {showAll ? 'Sembunyikan Sebagian' : `Lihat Semua (${filtered.length})`}
              </button>
            </div>
          </SectionReveal>
        )}
      </div>

      {/* Fullscreen Instagram Story Viewer Overlay */}
      <AnimatePresence>
        {activeStory && activeStoryIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-0 sm:p-4 select-none"
          >
            {/* Desktop Outside Close */}
            <button
              onClick={() => setActiveStoryIndex(null)}
              className="hidden sm:flex absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer z-50"
              title="Tutup (Esc)"
            >
              <X size={22} />
            </button>

            {/* Desktop Prev Button */}
            <button
              onClick={handlePrevStory}
              disabled={activeStoryIndex === 0}
              className={`hidden sm:flex absolute left-8 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer z-50 ${
                activeStoryIndex === 0 ? 'opacity-30 cursor-not-allowed' : ''
              }`}
              title="Story Sebelumnya"
            >
              <ChevronLeft size={28} />
            </button>

            {/* Desktop Next Button */}
            <button
              onClick={handleNextStory}
              className="hidden sm:flex absolute right-8 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer z-50"
              title="Story Berikutnya"
            >
              <ChevronRight size={28} />
            </button>

            {/* Phone-frame Story Box */}
            <div
              className="relative w-full h-full sm:h-auto sm:max-h-[92vh] sm:w-[420px] sm:aspect-[9/16] bg-neutral-950 sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between"
              onMouseDown={handleHoldStart}
              onMouseUp={handleHoldEnd}
              onTouchStart={handleHoldStart}
              onTouchEnd={handleHoldEnd}
            >
              {/* Media Layer */}
              <div className="absolute inset-0 w-full h-full bg-black flex items-center justify-center">
                {activeStory.mediaType === 'video' ? (
                  <video
                    src={activeStory.mediaUrl}
                    poster={activeStory.thumbnailUrl}
                    autoPlay
                    loop
                    muted={isMuted}
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={activeStory.mediaUrl}
                    alt={activeStory.caption || 'Instagram Story'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                )}
                {/* Fallback Graphic / Overlay (Animates out after 2s) */}
                <motion.div
                  key={activeStory.id}
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 0 }}
                  transition={{ delay: 2, duration: 0.8 }}
                  className="absolute inset-0 bg-gradient-to-b from-purple-950/70 via-black/80 to-rose-950/70 flex flex-col items-center justify-center p-8 text-center z-10 pointer-events-none"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 flex items-center justify-center mb-4 shadow-xl">
                    <Sparkles size={28} className="text-white" />
                  </div>
                  <h4 className="text-lg font-bold font-heading text-white mb-1">
                    @{activeStory.author || 'comeinone.f'} Story
                  </h4>
                  <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-mono text-accent mb-3">
                    {activeStory.category || 'General'}
                  </span>
                  {activeStory.caption && (
                    <p className="text-sm text-white/90 italic max-w-xs">
                      &ldquo;{activeStory.caption}&rdquo;
                    </p>
                  )}
                </motion.div>
              </div>

              {/* Gradient Vignettes */}
              <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none z-10" />
              <div className="absolute bottom-0 inset-x-0 h-36 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none z-10" />

              {/* Invisible Left / Right Tap Areas for Navigation */}
              <div className="absolute inset-0 z-20 flex">
                <div
                  className="w-1/3 h-full cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevStory();
                  }}
                />
                <div
                  className="w-2/3 h-full cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNextStory();
                  }}
                />
              </div>

              {/* Top Controls: Segmented Progress Bars + Profile Header */}
              <div
                className={`relative z-30 p-3 sm:p-4 transition-opacity duration-200 ${
                  isPaused ? 'opacity-0' : 'opacity-100'
                }`}
              >
                {/* Segmented Bars */}
                <div className="flex items-center gap-1.5 mb-3">
                  {stories.map((s, idx) => {
                    const isCurrent = idx === activeStoryIndex;
                    const isPassed = idx < activeStoryIndex;

                    return (
                      <div
                        key={s.id}
                        className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden"
                      >
                        <div
                          className={`h-full bg-white transition-all duration-75 ${
                            isPassed ? 'w-full' : isCurrent ? '' : 'w-0'
                          }`}
                          style={{
                            width: isPassed
                              ? '100%'
                              : isCurrent
                              ? `${progress}%`
                              : '0%',
                          }}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Profile Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full p-0.5 bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600">
                      <div className="w-full h-full rounded-full bg-black flex items-center justify-center font-bold text-[10px] text-white">
                        CE
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white tracking-wide">
                          {activeStory.author || 'comeinone.f'}
                        </span>
                        <svg
                          className="w-3.5 h-3.5 text-blue-400 fill-current"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15-5-5 1.41-1.41L11 14.17l7.59-7.59L20 8l-9 9z" />
                        </svg>
                        <span className="text-[10px] text-white/70 font-mono">
                          {formatStoryDate(activeStory.timestamp)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[9px] text-white/60">
                        <span>The Vault</span>
                        <span>•</span>
                        <span className="text-accent font-mono font-semibold">
                          {activeStory.category || 'General'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Top Right Story Actions */}
                  <div className="flex items-center gap-1">
                    {activeStory.mediaType === 'video' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsMuted(!isMuted);
                        }}
                        className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                        title={isMuted ? 'Unmute' : 'Mute'}
                      >
                        {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveStoryIndex(null);
                      }}
                      className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                      title="Tutup"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Caption & Interactive Action Bar */}
              <div
                className={`relative z-30 p-4 transition-opacity duration-200 ${
                  isPaused ? 'opacity-0' : 'opacity-100'
                }`}
              >
                {/* Caption Text */}
                {activeStory.caption && (
                  <div className="mb-3 px-3 py-2 rounded-xl bg-black/60 backdrop-blur-md border border-white/15">
                    <p className="text-xs sm:text-sm text-white font-medium leading-snug">
                      {activeStory.caption}
                    </p>
                  </div>
                )}

                {/* Interactive Instagram Action Bar */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-10 px-4 rounded-full border border-white/30 bg-black/40 backdrop-blur-md flex items-center text-xs text-white/60">
                    <span>Kirim pesan ke @comeinone.f...</span>
                  </div>

                  {/* Like Button */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerLike();
                      }}
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all cursor-pointer"
                      title="Like story"
                    >
                      <Heart
                        size={22}
                        className={
                          likedMap[activeStory.id]
                            ? 'text-rose-500 fill-rose-500 scale-110'
                            : 'text-white'
                        }
                      />
                    </button>

                    {floatingHearts.map((h) => (
                      <motion.div
                        key={h.id}
                        initial={{ opacity: 1, y: 0, scale: 0.8 }}
                        animate={{ opacity: 0, y: -80, scale: 1.4 }}
                        transition={{ duration: 1 }}
                        className="absolute bottom-8 left-2 pointer-events-none"
                        style={{ transform: `translateX(${h.x}px)` }}
                      >
                        <Heart size={24} className="text-rose-500 fill-rose-500" />
                      </motion.div>
                    ))}
                  </div>

                  {/* Share button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (navigator.share) {
                        navigator.share({
                          title: 'CE F Instagram Story Archive',
                          url: window.location.href,
                        });
                      }
                    }}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white hover:scale-110 transition-all cursor-pointer"
                    title="Share"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
