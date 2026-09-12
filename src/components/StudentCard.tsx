'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Student } from '@/types';
import { getInitials, stringToHue } from '@/lib/utils';
import { IconInstagram } from './BrandIcons';

interface StudentCardProps {
  student: Student;
  index: number;
}

export default function StudentCard({ student, index }: StudentCardProps) {
  const hue = stringToHue(student.name);
  const quoteText = student.katakata || student.quote;

  // Validation: Only attempt to load image if student.photo exists and is not empty
  const hasPhotoConfigured = Boolean(student.photo && student.photo.trim() !== '');
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  // Reset error & loaded states whenever student.photo updates
  useEffect(() => {
    setImgError(false);
    setImgLoaded(false);
  }, [student.photo]);

  // Show photo only if configured and no load error occurred
  const showPhoto = hasPhotoConfigured && !imgError;

  // Highlight leadership roles
  const isLeadership =
    student.role &&
    ['Komting', 'Wakil Komting', 'Sekretaris', 'Bendahara'].includes(student.role);

  // Instagram URL parsing
  const igRaw = student.instagram || student.socials?.instagram;
  let instagramUrl: string | null = null;
  let instagramHandle: string | null = null;

  if (igRaw && igRaw.trim() !== '') {
    const clean = igRaw.trim();
    if (clean.startsWith('http://') || clean.startsWith('https://')) {
      instagramUrl = clean;
      const match = clean.match(/instagram\.com\/([^/?#]+)/i);
      instagramHandle = match ? match[1] : 'instagram';
    } else {
      const handle = clean.replace(/^@/, '');
      instagramUrl = `https://instagram.com/${handle}`;
      instagramHandle = handle;
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      transition={{
        duration: 0.4,
        delay: Math.min(index * 0.03, 0.4),
        ease: [0.25, 0.46, 0.45, 0.94] as const,
      }}
      layout
      className={`group relative flex flex-col items-center p-5 rounded-2xl border transition-all duration-300 w-full ${
        isLeadership
          ? 'border-accent/40 bg-bg-elevated/80 shadow-[0_0_20px_rgba(59,130,246,0.06)]'
          : 'border-border bg-bg-elevated/50 hover:border-border-accent/60 hover:bg-bg-surface/60'
      }`}
    >
      {/* Avatar Container with Inisial Fallback */}
      <div
        className="w-18 h-18 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mb-3 text-lg sm:text-xl font-heading font-bold border-2 border-transparent group-hover:border-accent/40 transition-all duration-300 shadow-inner overflow-hidden select-none relative"
        style={{
          backgroundColor: `hsl(${hue}, 40%, 18%)`,
          color: `hsl(${hue}, 60%, 68%)`,
        }}
      >
        {/* Render initials as base or fallback */}
        {(!showPhoto || !imgLoaded) && (
          <span className="font-heading font-bold text-lg sm:text-xl tracking-wider select-none">
            {getInitials(student.name)}
          </span>
        )}

        {/* Render photo only if configured in data */}
        {showPhoto && (
          <img
            key={student.photo}
            src={student.photo}
            alt=""
            loading="lazy"
            decoding="async"
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
            className={`absolute inset-0 w-full h-full rounded-full object-cover transition-opacity duration-300 ${
              imgLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}
      </div>

      {/* NIM */}
      <span className="font-mono text-[11px] tracking-[0.15em] text-text-dim mb-1.5 uppercase">
        {student.nim}
      </span>

      {/* Name */}
      <h3 className="font-heading font-semibold text-sm text-text-primary text-center mb-1 group-hover:text-accent transition-colors duration-200">
        {student.name}
      </h3>

      {/* Alias */}
      {student.alias && (
        <p className="text-[11px] text-text-muted text-center mb-1.5 font-mono line-clamp-1" title={student.alias}>
          aka &ldquo;{student.alias}&rdquo;
        </p>
      )}

      {/* Role Badge & Instagram Handle */}
      <div className="flex items-center gap-1.5 flex-wrap justify-center mt-1">
        {student.role && (
          <span
            className={`inline-block px-2.5 py-0.5 text-[10px] font-mono tracking-wider rounded-full uppercase ${
              isLeadership
                ? 'text-accent bg-accent/15 border border-accent/30 font-semibold'
                : 'text-text-muted bg-bg-surface border border-border'
            }`}
          >
            {student.role}
          </span>
        )}

        {instagramUrl && (
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/20 hover:border-pink-500/40 text-pink-400 hover:text-pink-300 text-[10px] font-mono transition-all group/ig"
            title={`Instagram @${instagramHandle}`}
          >
            <IconInstagram size={11} className="group-hover/ig:scale-110 transition-transform" />
            <span className="truncate max-w-[100px]">@{instagramHandle}</span>
          </a>
        )}
      </div>

      {/* Quote / Katakata */}
      {quoteText && (
        <div className="mt-3 pt-3 border-t border-border/40 w-full text-center">
          <p className="text-[11px] text-text-muted italic leading-relaxed">
            &ldquo;{quoteText}&rdquo;
          </p>
        </div>
      )}
    </motion.div>
  );
}
