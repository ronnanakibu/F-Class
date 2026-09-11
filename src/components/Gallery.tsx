'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { memories } from '@/data/memories';
import SectionReveal from './SectionReveal';
import { X, Calendar, Tag } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { Memory } from '@/types';

const categories = ['All', 'Practicum', 'Campus', 'Chaos', 'Event'] as const;

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [lightboxItem, setLightboxItem] = useState<Memory | null>(null);

  const filtered = useMemo(() => {
    if (activeCategory === 'All') return memories;
    return memories.filter((m) => m.category === activeCategory);
  }, [activeCategory]);

  const closeLightbox = useCallback(() => {
    setLightboxItem(null);
  }, []);

  // Deterministic heights for masonry visual variety
  const heights = ['h-48', 'h-64', 'h-56', 'h-72', 'h-52', 'h-60', 'h-68', 'h-44'];

  return (
    <section id="gallery" className="py-24 md:py-32 relative">
      <div className="container-custom">
        <SectionReveal>
          <p className="font-mono text-xs tracking-[0.25em] text-accent uppercase mb-4">
            The Vault
          </p>
          <h2 className="text-fluid-heading font-heading font-bold text-text-primary mb-4">
            Memories &{' '}
            <span className="text-accent">Moments</span>
          </h2>
          <p className="text-fluid-body text-text-muted max-w-2xl mb-10">
            The real campus life. Labs, late nights, and everything in between.
          </p>
        </SectionReveal>

        {/* Category Tabs */}
        <SectionReveal delay={0.1}>
          <div className="flex flex-wrap gap-2 mb-10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 text-xs font-mono tracking-wider rounded-lg border transition-all duration-200 cursor-pointer uppercase ${
                  activeCategory === cat
                    ? 'bg-accent/10 border-border-accent text-accent'
                    : 'bg-transparent border-border text-text-muted hover:border-text-dim hover:text-text-primary'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </SectionReveal>

        {/* Masonry Grid */}
        <div className="masonry">
          <AnimatePresence mode="popLayout">
            {filtered.map((memory, i) => (
              <motion.button
                key={memory.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                layout
                onClick={() => setLightboxItem(memory)}
                className={`group relative w-full ${heights[i % heights.length]} rounded-xl border border-border bg-bg-elevated overflow-hidden cursor-pointer hover:border-border-accent transition-all duration-300`}
              >
                {/* Placeholder visual */}
                <div className="absolute inset-0 bg-gradient-to-br from-bg-surface to-bg-elevated flex items-center justify-center">
                  <div className="text-center p-4">
                    <Tag size={20} className="text-accent/30 mx-auto mb-2" />
                    <p className="text-xs font-mono text-text-dim uppercase tracking-wider">
                      {memory.category}
                    </p>
                  </div>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-bg-primary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-4">
                  <h4 className="text-sm font-heading font-semibold text-text-primary text-center mb-2">
                    {memory.title}
                  </h4>
                  <p className="text-[11px] text-text-muted text-center leading-snug line-clamp-2">
                    {memory.caption}
                  </p>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl bg-bg-elevated border border-border rounded-2xl overflow-hidden"
            >
              <button
                onClick={closeLightbox}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-bg-surface/80 hover:bg-bg-hover border border-border text-text-muted hover:text-text-primary transition-colors duration-200 cursor-pointer"
                aria-label="Close lightbox"
              >
                <X size={16} />
              </button>

              {/* Visual Placeholder */}
              <div className="w-full h-64 bg-gradient-to-br from-bg-surface to-bg-primary flex items-center justify-center">
                <Tag size={40} className="text-accent/20" />
              </div>

              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-2.5 py-0.5 text-[10px] font-mono tracking-wider text-accent bg-accent-dim/40 rounded-full uppercase">
                    {lightboxItem.category}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-text-dim font-mono">
                    <Calendar size={10} />
                    {formatDate(lightboxItem.date)}
                  </span>
                </div>

                <h3 className="text-lg font-heading font-bold text-text-primary mb-2">
                  {lightboxItem.title}
                </h3>

                <p className="text-sm text-text-muted leading-relaxed">
                  {lightboxItem.caption}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
