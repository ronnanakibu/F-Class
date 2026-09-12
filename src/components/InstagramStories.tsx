'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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
  Share2,
} from 'lucide-react';

const STORY_DURATION = 5000; // 5 seconds per story

export default function InstagramStories() {
  const [stories, setStories] = useState<IGStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; x: number }[]>([]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const elapsedRef = useRef<number>(0);

  // Fetch stories on load
  const fetchStories = useCallback(async () => {
    try {
      const res = await fetch('/api/stories');
      const data = await res.json();
      if (data.success && Array.isArray(data.stories)) {
        setStories(data.stories);
      }
    } catch (err) {
      console.error('Failed to load stories:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

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
      // Finished all stories
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
      // Replay first story
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

  // Hold to pause (native Instagram story behavior)
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
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  // Pre-defined highlights
  const highlights = [
    { title: 'Semua Story', icon: '📸', count: stories.length },
    { title: 'Praktikum', icon: '⚡', count: 'Lab' },
    { title: 'Kantin & Chill', icon: '☕', count: 'Vibes' },
    { title: 'Project IoT', icon: '🚀', count: 'Build' },
  ];

  return (
    <section className="py-12 md:py-16 relative">
      <div className="container-custom">
        <SectionReveal>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-purple-500/10 border border-rose-500/20 mb-2">
                <Sparkles size={12} className="text-rose-400" />
                <span className="font-mono text-xs tracking-wider text-rose-400 uppercase font-semibold">
                  Instagram Archive & Stories
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-heading font-extrabold text-text-primary">
                Live Story <span className="bg-gradient-to-r from-amber-400 via-rose-500 to-purple-500 bg-clip-text text-transparent">@comeinone.f</span>
              </h3>
              <p className="text-xs sm:text-sm text-text-muted mt-1">
                Terkoneksi dengan bot kelas. Story tidak lenyap dalam 24 jam, melainkan tersimpan sebagai arsip waktu nyata.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-bg-elevated border border-border text-xs font-mono text-text-dim">
                <Archive size={13} className="text-accent" />
                {stories.length} Arsip Tersimpan
              </span>
            </div>
          </div>
        </SectionReveal>

        {/* Instagram Stories Horizontal Avatar Ring Carousel */}
        <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto pb-4 pt-2 no-scrollbar">
          {/* Main Account Ring (@comeinone.f) */}
          <button
            onClick={() => openStoryAt(0)}
            className="flex flex-col items-center gap-2 group shrink-0 cursor-pointer text-center"
            aria-label="Lihat Story Terbaru"
          >
            <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(244,63,94,0.4)]">
              <div className="p-0.5 bg-bg-primary rounded-full">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-bg-elevated to-bg-surface border border-border flex items-center justify-center overflow-hidden text-center">
                  <span className="font-heading font-black text-lg sm:text-xl text-transparent bg-gradient-to-r from-accent to-rose-400 bg-clip-text">
                    CE F
                  </span>
                </div>
              </div>

              {/* Glowing Pulse Ring if stories exist */}
              {stories.length > 0 && (
                <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-rose-500 border-2 border-bg-primary flex items-center justify-center text-[10px] text-white font-bold">
                  {stories.length}
                </span>
              )}
            </div>
            <div className="max-w-[76px] sm:max-w-[88px] text-center">
              <span className="block text-xs font-semibold text-text-primary truncate">
                comeinone.f
              </span>
              <span className="block text-[10px] text-accent font-mono">
                Lihat Story
              </span>
            </div>
          </button>

          {/* Highlight Circles */}
          {highlights.map((hl, i) => (
            <button
              key={i}
              onClick={() => openStoryAt(Math.min(i, stories.length - 1))}
              className="flex flex-col items-center gap-2 group shrink-0 cursor-pointer text-center"
            >
              <div className="p-0.5 rounded-full bg-border hover:border-text-dim border transition-all duration-200 group-hover:scale-105">
                <div className="p-0.5 bg-bg-primary rounded-full">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-bg-elevated flex items-center justify-center text-2xl group-hover:bg-bg-surface transition-colors">
                    <span>{hl.icon}</span>
                  </div>
                </div>
              </div>
              <div className="max-w-[76px] sm:max-w-[88px] text-center">
                <span className="block text-xs font-medium text-text-muted group-hover:text-text-primary truncate">
                  {hl.title}
                </span>
                <span className="block text-[10px] text-text-dim font-mono">
                  {hl.count}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Instagram Story Fullscreen / Modal Viewer Overlay */}
      <AnimatePresence>
        {activeStory && activeStoryIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-0 sm:p-4 select-none"
          >
            {/* Desktop Close Button outside modal */}
            <button
              onClick={() => setActiveStoryIndex(null)}
              className="hidden sm:flex absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer z-50"
              title="Close (Esc)"
            >
              <X size={22} />
            </button>

            {/* Desktop Navigation Arrows outside frame */}
            <button
              onClick={handlePrevStory}
              disabled={activeStoryIndex === 0}
              className={`hidden sm:flex absolute left-8 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer z-50 ${
                activeStoryIndex === 0 ? 'opacity-30 cursor-not-allowed' : ''
              }`}
              title="Previous Story"
            >
              <ChevronLeft size={28} />
            </button>

            <button
              onClick={handleNextStory}
              className="hidden sm:flex absolute right-8 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer z-50"
              title="Next Story"
            >
              <ChevronRight size={28} />
            </button>

            {/* Main Phone-frame Story Box */}
            <div
              className="relative w-full h-full sm:h-auto sm:max-h-[92vh] sm:w-[420px] sm:aspect-[9/16] bg-neutral-950 sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between"
              onMouseDown={handleHoldStart}
              onMouseUp={handleHoldEnd}
              onTouchStart={handleHoldStart}
              onTouchEnd={handleHoldEnd}
            >
              {/* Media Layer (Image or Video) */}
              <div className="absolute inset-0 w-full h-full bg-black flex items-center justify-center">
                {activeStory.mediaType === 'video' ? (
                  <video
                    src={activeStory.mediaUrl}
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
                      // Fallback placeholder image if not yet physically uploaded
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                )}

                {/* Fallback Graphic if media file not found */}
                <div className="absolute inset-0 bg-gradient-to-b from-purple-950/70 via-black/80 to-rose-950/70 flex flex-col items-center justify-center p-8 text-center -z-0">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 flex items-center justify-center mb-4 shadow-xl">
                    <Sparkles size={28} className="text-white" />
                  </div>
                  <h4 className="text-lg font-bold font-heading text-white mb-2">
                    @comeinone.f Story Archive
                  </h4>
                  <p className="text-xs text-text-muted font-mono mb-4">
                    {formatStoryDate(activeStory.timestamp)}
                  </p>
                  {activeStory.caption && (
                    <p className="text-sm text-white/90 italic max-w-xs">
                      &ldquo;{activeStory.caption}&rdquo;
                    </p>
                  )}
                </div>
              </div>

              {/* Gradient Vignettes for Header & Footer */}
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
                    {/* Ring Avatar */}
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
                        {/* Verified badge */}
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
                      <span className="text-[9px] text-white/50 block">
                        Arsip Permanen
                      </span>
                    </div>
                  </div>

                  {/* Header Actions */}
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
                      title="Close"
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
                  <div className="mb-3 px-3 py-2 rounded-xl bg-black/50 backdrop-blur-md border border-white/10">
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

                    {/* Floating animated hearts */}
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
