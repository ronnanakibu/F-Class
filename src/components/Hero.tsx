'use client';

import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export default function Hero() {
  const headlinePart1 = ['KELAS', 'YANG', 'ISINYA'];
  const headlinePart2 = ['LITTLE', 'LITTLE', 'GAGAP.'];

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const wordVariant = {
    hidden: { opacity: 0, y: 50, rotateX: -15 },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        duration: 0.7,
        ease: [0.25, 0.46, 0.45, 0.94] as const,
      },
    },
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
    >
      {/* =========================================================================
          HERO BACKGROUND MOCKUP
          Lokasi berkas: `public/hero-mockup.jpg`
          Untuk mengganti: Cukup timpa berkas `hero-mockup.jpg` di folder `public/`
          dengan foto kelas Anda sendiri kapan saja!
         ========================================================================= */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Mockup Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center scale-105 transition-transform duration-1000 opacity-30 dark:opacity-25"
          style={{ backgroundImage: "url('/hero-mockup.jpg')" }}
          aria-hidden="true"
        />

        {/* Ambient Dark/Light Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-bg-primary/95 via-bg-primary/80 to-bg-primary" />

        {/* Electric Cyan Radial Light Accent */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--accent-glow)_0%,_transparent_70%)] opacity-30" />

        {/* Ambient Animated Grid */}
        <div className="absolute inset-0 bg-grid-animated opacity-25" />

        {/* Subtle Background Typographic Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden opacity-[0.03] dark:opacity-[0.05]">
          <span className="font-heading font-black text-[12vw] tracking-tighter uppercase whitespace-nowrap text-text-primary">
            LITTLE LITTLE GAGAP
          </span>
        </div>
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 container-custom text-center px-4">
        {/* Class Identity Mark */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-3 px-5 py-2.5 border border-border-accent rounded-full bg-accent-dim/30 backdrop-blur-sm">
            <span className="font-mono text-sm tracking-[0.2em] text-accent font-semibold">
              CE — F
            </span>
            <span className="w-px h-4 bg-border-accent" />
            <span className="font-mono text-xs tracking-wider text-text-muted uppercase">
              TK-F POLMED
            </span>
          </div>
        </motion.div>

        {/* Kinetic Typography Headline */}
        <motion.h1
          variants={container}
          initial="hidden"
          animate="visible"
          className="text-fluid-hero font-heading font-bold tracking-tight mb-8"
        >
          <div className="block">
            {headlinePart1.map((word, i) => (
              <motion.span
                key={`p1-${i}`}
                variants={wordVariant}
                className="inline-block mr-[0.25em] text-text-primary"
                style={{ perspective: '500px' }}
              >
                {word}
              </motion.span>
            ))}
          </div>
          <div className="block mt-1 sm:mt-2">
            {headlinePart2.map((word, i) => (
              <motion.span
                key={`p2-${i}`}
                variants={wordVariant}
                className="inline-block mr-[0.25em] text-accent drop-shadow-[0_0_25px_var(--accent-glow)]"
                style={{ perspective: '500px' }}
              >
                {word}
              </motion.span>
            ))}
          </div>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="text-fluid-body text-text-muted max-w-xl mx-auto mb-12 font-body"
        >
          Computer Engineering — Class F
          <br />
          <span className="text-text-dim">
            Jurusan Teknik Komputer dan Informatika • Politeknik Negeri Medan
          </span>
        </motion.p>

        {/* CTA Button */}
        <motion.a
          href="#manifesto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="inline-flex items-center gap-2 px-6 py-3 text-sm font-mono font-medium tracking-wider text-accent border border-border-accent rounded-full hover:bg-accent-dim/30 hover:shadow-[0_0_20px_var(--accent-glow)] transition-all duration-200 cursor-pointer uppercase group backdrop-blur-sm"
        >
          Explore the Class
          <ChevronDown
            size={16}
            className="group-hover:translate-y-0.5 transition-transform duration-200"
          />
        </motion.a>
      </div>

      {/* Bottom fade into next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-bg-primary to-transparent pointer-events-none" />
    </section>
  );
}
