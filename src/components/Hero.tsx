'use client';

import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export default function Hero() {
  const headlineWords = ['CIRCUITS,', 'CODE,', 'AND', 'CHAOS.'];

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.3,
      },
    },
  };

  const wordVariant = {
    hidden: { opacity: 0, y: 60, rotateX: -15 },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94] as const,
      },
    },
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Ambient Grid */}
      <div className="absolute inset-0 bg-grid-animated opacity-60" />

      {/* Radial gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(0,240,255,0.06)_0%,_transparent_70%)]" />

      {/* Content */}
      <div className="relative z-10 container-custom text-center">
        {/* Class Identity Mark */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-3 px-5 py-2.5 border border-border-accent rounded-full bg-accent-dim/30">
            <span className="font-mono text-sm tracking-[0.2em] text-accent">
              CE — F
            </span>
            <span className="w-px h-4 bg-border-accent" />
            <span className="font-mono text-xs tracking-wider text-text-muted uppercase">
              TK-F
            </span>
          </div>
        </motion.div>

        {/* Kinetic Typography */}
        <motion.h1
          variants={container}
          initial="hidden"
          animate="visible"
          className="text-fluid-hero font-heading font-bold tracking-tight mb-8"
        >
          {headlineWords.map((word, i) => (
            <motion.span
              key={i}
              variants={wordVariant}
              className={`inline-block mr-[0.3em] ${
                word === 'CHAOS.'
                  ? 'text-accent'
                  : 'text-text-primary'
              }`}
              style={{ perspective: '500px' }}
            >
              {word}
            </motion.span>
          ))}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="text-fluid-body text-text-muted max-w-xl mx-auto mb-12"
        >
          Computer Engineering — Class F
          <br />
          <span className="text-text-dim">Politeknik Negeri Medan</span>
        </motion.p>

        {/* CTA */}
        <motion.a
          href="#manifesto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.4 }}
          className="inline-flex items-center gap-2 px-6 py-3 text-sm font-mono font-medium tracking-wider text-accent border border-border-accent rounded-full hover:bg-accent-dim/30 transition-colors duration-200 cursor-pointer uppercase group"
        >
          Explore the Class
          <ChevronDown
            size={16}
            className="group-hover:translate-y-0.5 transition-transform duration-200"
          />
        </motion.a>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-bg-primary to-transparent" />
    </section>
  );
}
