'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { slides } from '@/data/slideshow';
import type { SlideItem } from '@/types';
import SectionReveal from './SectionReveal';
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Sparkles,
  Calendar,
  Layers,
  Volume2,
  VolumeX,
} from 'lucide-react';

const SLIDE_DURATION = 6500; // 6.5s per slide like Apple carousels

export default function AppleSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [imageError, setImageError] = useState<Record<string, boolean>>({});

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressStartRef = useRef<number>(Date.now());
  const elapsedBeforePauseRef = useRef<number>(0);
  const touchStartXRef = useRef<number>(0);

  const activeSlide: SlideItem = slides[currentIndex] || slides[0];

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
    setProgress(0);
    elapsedBeforePauseRef.current = 0;
    progressStartRef.current = Date.now();
  }, []);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
    setProgress(0);
    elapsedBeforePauseRef.current = 0;
    progressStartRef.current = Date.now();
  }, []);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setProgress(0);
    elapsedBeforePauseRef.current = 0;
    progressStartRef.current = Date.now();
  };

  // Timer loop with smooth progress tracking
  useEffect(() => {
    if (!isPlaying || isHovered) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    progressStartRef.current = Date.now() - elapsedBeforePauseRef.current;

    const interval = setInterval(() => {
      const elapsed = Date.now() - progressStartRef.current;
      const pct = Math.min((elapsed / SLIDE_DURATION) * 100, 100);
      setProgress(pct);

      if (elapsed >= SLIDE_DURATION) {
        handleNext();
      }
    }, 100);

    timerRef.current = interval;

    return () => clearInterval(interval);
  }, [isPlaying, isHovered, currentIndex, handleNext]);

  // Handle Pause when hovered
  const onMouseEnter = () => {
    setIsHovered(true);
    elapsedBeforePauseRef.current = (progress / 100) * SLIDE_DURATION;
  };

  const onMouseLeave = () => {
    setIsHovered(false);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape' && isExpanded) setIsExpanded(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, isExpanded]);

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    onMouseEnter();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) handleNext();
      else handlePrev();
    }
    onMouseLeave();
  };

  return (
    <section id="timeline" className="py-24 md:py-32 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full blur-[140px] pointer-events-none opacity-20 transition-colors duration-1000"
        style={{
          backgroundColor: activeSlide.accentColor || 'var(--accent, #3b82f6)',
        }}
      />

      <div className="container-custom relative z-10">
        {/* Section Header with Apple typography */}
        <SectionReveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 mb-4">
                <Sparkles size={12} className="text-accent" />
                <span className="font-mono text-xs tracking-wider text-accent uppercase">
                  Interactive Gallery Showcase
                </span>
              </div>
              <h2 className="text-3xl md:text-5xl font-heading font-extrabold text-text-primary tracking-tight">
                The Journey of <span className="text-accent">CE F</span>
              </h2>
              <p className="text-sm md:text-base text-text-muted mt-2 max-w-xl">
                Setiap babak, milestone, dan memori yang mengukir sejarah perjalanan kami di Teknik Komputer.
              </p>
            </div>

            {/* Top Controls: Play/Pause, Prev, Next */}
            <div className="flex items-center gap-2 self-start md:self-end">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-10 h-10 rounded-full bg-bg-elevated/80 backdrop-blur-md border border-border flex items-center justify-center text-text-primary hover:text-accent hover:border-accent/40 transition-all cursor-pointer shadow-sm"
                title={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
                aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} className="translate-x-0.5" />}
              </button>

              <button
                onClick={handlePrev}
                className="w-10 h-10 rounded-full bg-bg-elevated/80 backdrop-blur-md border border-border flex items-center justify-center text-text-primary hover:text-accent hover:border-accent/40 transition-all cursor-pointer shadow-sm"
                title="Previous slide"
                aria-label="Previous slide"
              >
                <ChevronLeft size={18} />
              </button>

              <button
                onClick={handleNext}
                className="w-10 h-10 rounded-full bg-bg-elevated/80 backdrop-blur-md border border-border flex items-center justify-center text-text-primary hover:text-accent hover:border-accent/40 transition-all cursor-pointer shadow-sm"
                title="Next slide"
                aria-label="Next slide"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </SectionReveal>

        {/* Main Cinematic Showcase Card */}
        <div
          className="relative w-full min-h-[380px] sm:min-h-[440px] md:min-h-0 md:aspect-[21/9] rounded-2xl md:rounded-3xl overflow-hidden border border-border/70 bg-bg-elevated shadow-2xl group select-none"
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Animated Slide Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide.id}
              initial={{ opacity: 0, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 w-full h-full"
            >
              {/* Media Element: Video or Image with Smart Fallback */}
              {activeSlide.mediaType === 'video' ? (
                <video
                  src={activeSlide.mediaUrl}
                  autoPlay
                  loop
                  muted={isMuted}
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : !imageError[activeSlide.id] ? (
                <img
                  src={activeSlide.mediaUrl}
                  alt={activeSlide.title}
                  onError={() =>
                    setImageError((prev) => ({ ...prev, [activeSlide.id]: true }))
                  }
                  className="w-full h-full object-cover"
                />
              ) : (
                /* High-tech Futuristic Apple-style Fallback when media file not yet placed */
                <div className="w-full h-full relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-bg-primary via-bg-elevated to-bg-surface">
                  {/* Subtle Grid Pattern */}
                  <div
                    className="absolute inset-0 opacity-15"
                    style={{
                      backgroundImage: `radial-gradient(circle at 1px 1px, ${activeSlide.accentColor || '#3b82f6'} 1px, transparent 0)`,
                      backgroundSize: '32px 32px',
                    }}
                  />

                  {/* Ambient glowing orb */}
                  <div
                    className="absolute w-96 h-96 rounded-full blur-[100px] opacity-25"
                    style={{ backgroundColor: activeSlide.accentColor || '#3b82f6' }}
                  />

                  {/* Center Emblem Watermark (Minimal icon, no duplicate typography) */}
                  <div className="relative z-10 text-center p-4">
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl mx-auto bg-accent/10 border border-accent/20 flex items-center justify-center backdrop-blur-xl shadow-lg">
                      <Layers size={26} className="text-accent animate-pulse" />
                    </div>
                  </div>
                </div>
              )}

              {/* Multi-stage Apple-style Vignette Overlay for Crisp Readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/60 to-transparent opacity-95 md:opacity-85 pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-r from-bg-primary/80 via-transparent to-transparent pointer-events-none" />

              {/* Top Bar Badges on the Card */}
              <div className="absolute top-3 sm:top-5 md:top-6 left-3.5 sm:left-6 md:left-8 right-3.5 sm:right-6 md:right-8 flex items-center justify-between z-20">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-mono font-semibold tracking-wider uppercase bg-bg-primary/80 backdrop-blur-md border border-border text-accent shadow-sm">
                    {activeSlide.tag}
                  </span>
                  <span className="px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-mono tracking-wider uppercase bg-bg-primary/60 backdrop-blur-md border border-border text-text-dim flex items-center gap-1.5">
                    <Calendar size={11} />
                    {activeSlide.date}
                  </span>
                  <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full text-[10px] font-mono uppercase bg-accent/15 text-accent border border-accent/30 font-bold">
                    Sem {activeSlide.semester}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {activeSlide.mediaType === 'video' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsMuted(!isMuted);
                      }}
                      className="p-2 rounded-full bg-bg-primary/80 backdrop-blur-md border border-border text-text-muted hover:text-text-primary transition-all cursor-pointer"
                      title={isMuted ? 'Unmute' : 'Mute'}
                    >
                      {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsExpanded(true);
                    }}
                    className="p-2 rounded-full bg-bg-primary/80 backdrop-blur-md border border-border text-text-muted hover:text-text-primary transition-all cursor-pointer"
                    title="Fullscreen view"
                  >
                    <Maximize2 size={15} />
                  </button>
                </div>
              </div>

              {/* Bottom Card Typography (Title & Narrative) */}
              <div className="absolute bottom-3 sm:bottom-6 md:bottom-8 left-3.5 sm:left-6 md:left-8 right-3.5 sm:right-6 md:right-8 max-w-2xl z-20">
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.5 }}
                >
                  <h3 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-heading font-extrabold text-white tracking-tight leading-snug mb-1 sm:mb-2 drop-shadow-md">
                    {activeSlide.title}
                  </h3>
                  <p className="text-xs sm:text-sm md:text-base font-semibold text-accent mb-1 sm:mb-2 drop-shadow">
                    {activeSlide.subtitle}
                  </p>
                  <p className="text-[11px] sm:text-xs md:text-sm text-text-muted/90 line-clamp-2 sm:line-clamp-3 leading-relaxed max-w-xl">
                    {activeSlide.description}
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Quick Hover Navigation Arrows overlay */}
          <div className="absolute inset-y-0 left-0 w-24 flex items-center pl-4 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="w-11 h-11 rounded-full bg-bg-primary/80 backdrop-blur-xl border border-border/80 flex items-center justify-center text-text-primary hover:text-accent hover:scale-110 transition-all pointer-events-auto cursor-pointer shadow-lg"
              aria-label="Previous slide"
            >
              <ChevronLeft size={20} />
            </button>
          </div>

          <div className="absolute inset-y-0 right-0 w-24 flex items-center justify-end pr-4 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="w-11 h-11 rounded-full bg-bg-primary/80 backdrop-blur-xl border border-border/80 flex items-center justify-center text-text-primary hover:text-accent hover:scale-110 transition-all pointer-events-auto cursor-pointer shadow-lg"
              aria-label="Next slide"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Apple-style Segmented Timeline Progress Indicators */}
        <div className="mt-6 md:mt-8">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2 sm:gap-3">
            {slides.map((slide, idx) => {
              const isActive = idx === currentIndex;
              const isPassed = idx < currentIndex;

              return (
                <button
                  key={slide.id}
                  onClick={() => goToSlide(idx)}
                  className="group flex flex-col text-left cursor-pointer p-1.5 sm:p-2 rounded-xl transition-all duration-200 hover:bg-bg-elevated/60"
                  aria-label={`Go to slide ${idx + 1}: ${slide.title}`}
                >
                  {/* Segmented Bar Track */}
                  <div className="h-1.5 w-full bg-bg-elevated border border-border/50 rounded-full overflow-hidden mb-2 relative">
                    <div
                      className={`h-full rounded-full transition-all duration-100 ${
                        isActive
                          ? 'bg-accent shadow-[0_0_10px_var(--accent,#3b82f6)]'
                          : isPassed
                          ? 'bg-text-dim/60 w-full'
                          : 'w-0'
                      }`}
                      style={{
                        width: isActive ? `${progress}%` : isPassed ? '100%' : '0%',
                      }}
                    />
                  </div>

                  {/* Segment Details */}
                  <div className="hidden sm:block">
                    <span
                      className={`text-[10px] font-mono tracking-wider block truncate transition-colors ${
                        isActive
                          ? 'text-accent font-bold'
                          : 'text-text-dim group-hover:text-text-muted'
                      }`}
                    >
                      {slide.tag}
                    </span>
                    <span
                      className={`text-[11px] font-heading font-medium truncate block transition-colors ${
                        isActive
                          ? 'text-text-primary font-semibold'
                          : 'text-text-muted group-hover:text-text-primary'
                      }`}
                    >
                      {slide.title.split(':')[0]}
                    </span>
                  </div>

                  {/* Mobile-only compact step number */}
                  <div className="sm:hidden text-center">
                    <span
                      className={`text-[9px] font-mono tracking-tighter ${
                        isActive ? 'text-accent font-bold' : 'text-text-dim'
                      }`}
                    >
                      0{idx + 1}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col justify-between p-4 md:p-8"
          >
            {/* Header */}
            <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full text-xs font-mono uppercase bg-accent/20 text-accent border border-accent/30 font-bold">
                  {activeSlide.tag}
                </span>
                <span className="text-sm font-mono text-text-dim">
                  {activeSlide.date} • Sem {activeSlide.semester}
                </span>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                title="Close fullscreen"
              >
                <X size={20} />
              </button>
            </div>

            {/* Main Center Media */}
            <div className="flex-1 flex items-center justify-center my-4 max-w-6xl mx-auto w-full relative">
              {activeSlide.mediaType === 'video' ? (
                <video
                  src={activeSlide.mediaUrl}
                  autoPlay
                  loop
                  controls
                  className="max-h-[70vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl"
                />
              ) : !imageError[activeSlide.id] ? (
                <img
                  src={activeSlide.mediaUrl}
                  alt={activeSlide.title}
                  className="max-h-[70vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl"
                />
              ) : (
                <div className="p-12 text-center rounded-3xl bg-bg-elevated border border-border max-w-lg">
                  <Layers size={48} className="text-accent mx-auto mb-4" />
                  <h3 className="text-2xl font-bold font-heading text-white mb-2">
                    {activeSlide.title}
                  </h3>
                  <p className="text-sm text-text-muted">{activeSlide.description}</p>
                </div>
              )}
            </div>

            {/* Bottom Caption & Controls */}
            <div className="w-full max-w-4xl mx-auto text-center">
              <h2 className="text-xl md:text-2xl font-bold font-heading text-white mb-1">
                {activeSlide.title}
              </h2>
              <p className="text-sm text-text-muted max-w-2xl mx-auto mb-6">
                {activeSlide.description}
              </p>

              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={handlePrev}
                  className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                  title="Previous"
                >
                  <ChevronLeft size={22} />
                </button>
                <span className="font-mono text-xs text-text-dim">
                  {currentIndex + 1} / {slides.length}
                </span>
                <button
                  onClick={handleNext}
                  className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                  title="Next"
                >
                  <ChevronRight size={22} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
