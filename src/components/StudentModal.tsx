'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { Student } from '@/types';
import { getInitials, stringToHue } from '@/lib/utils';
import { X } from 'lucide-react';
import { IconGithub, IconInstagram, IconLinkedin } from './BrandIcons';
import { useEffect } from 'react';

interface StudentModalProps {
  student: Student | null;
  onClose: () => void;
}

export default function StudentModal({ student, onClose }: StudentModalProps) {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (student) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [student]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const hue = student ? stringToHue(student.name) : 0;

  return (
    <AnimatePresence>
      {student && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-bg-elevated border border-border rounded-2xl overflow-hidden max-h-[85vh] overflow-y-auto"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-bg-surface/80 hover:bg-bg-hover border border-border text-text-muted hover:text-text-primary transition-colors duration-200 cursor-pointer"
              aria-label="Close modal"
            >
              <X size={16} />
            </button>

            {/* Header */}
            <div className="p-8 pb-6 text-center border-b border-border">
              {/* Avatar */}
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-heading font-bold"
                style={{
                  backgroundColor: `hsl(${hue}, 40%, 18%)`,
                  color: `hsl(${hue}, 60%, 65%)`,
                }}
              >
                {student.photo ? (
                  <img
                    src={student.photo}
                    alt={student.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  getInitials(student.name)
                )}
              </div>

              {/* NIM */}
              <span className="font-mono text-[10px] tracking-[0.2em] text-text-dim uppercase">
                {student.nim}
              </span>

              {/* Name */}
              <h3 className="text-xl font-heading font-bold text-text-primary mt-2">
                {student.name}
              </h3>

              {/* Nickname */}
              {student.nickname && (
                <p className="text-sm text-text-muted mt-0.5">
                  aka &ldquo;{student.nickname}&rdquo;
                </p>
              )}

              {/* Role */}
              {student.role && (
                <span className="inline-block px-3 py-1 text-[10px] font-mono tracking-wider text-accent bg-accent-dim/40 rounded-full mt-3 uppercase">
                  {student.role}
                </span>
              )}
            </div>

            {/* Body */}
            <div className="p-8 space-y-6">
              {/* Quote */}
              {student.quote && (
                <blockquote className="text-sm text-text-muted italic border-l-2 border-accent/30 pl-4">
                  &ldquo;{student.quote}&rdquo;
                </blockquote>
              )}

              {/* Skills */}
              {student.skills && student.skills.length > 0 && (
                <div>
                  <p className="font-mono text-[10px] tracking-[0.2em] text-text-dim uppercase mb-3">
                    Skills
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {student.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 text-xs font-mono text-accent bg-accent-dim/20 border border-border-accent/30 rounded-lg"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Interests */}
              {student.interests && student.interests.length > 0 && (
                <div>
                  <p className="font-mono text-[10px] tracking-[0.2em] text-text-dim uppercase mb-3">
                    Interests
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {student.interests.map((interest) => (
                      <span
                        key={interest}
                        className="px-2.5 py-1 text-xs font-mono text-text-muted bg-bg-surface border border-border rounded-lg"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Social Links */}
              {student.socials && (student.socials.github || student.socials.instagram || student.socials.linkedin) && (
                <div>
                  <p className="font-mono text-[10px] tracking-[0.2em] text-text-dim uppercase mb-3">
                    Connect
                  </p>
                  <div className="flex gap-3">
                    {student.socials.github && (
                      <a
                        href={student.socials.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-xl border border-border bg-bg-surface hover:border-border-accent hover:text-accent text-text-muted transition-all duration-200 cursor-pointer"
                        aria-label="GitHub"
                      >
                        <IconGithub size={18} />
                      </a>
                    )}
                    {student.socials.instagram && (
                      <a
                        href={student.socials.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-xl border border-border bg-bg-surface hover:border-border-accent hover:text-accent text-text-muted transition-all duration-200 cursor-pointer"
                        aria-label="Instagram"
                      >
                        <IconInstagram size={18} />
                      </a>
                    )}
                    {student.socials.linkedin && (
                      <a
                        href={student.socials.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-xl border border-border bg-bg-surface hover:border-border-accent hover:text-accent text-text-muted transition-all duration-200 cursor-pointer"
                        aria-label="LinkedIn"
                      >
                        <IconLinkedin size={18} />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
