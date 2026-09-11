'use client';

import { motion } from 'framer-motion';
import type { Student } from '@/types';
import { getInitials, stringToHue } from '@/lib/utils';

interface StudentCardProps {
  student: Student;
  index: number;
  onClick: () => void;
}

export default function StudentCard({ student, index, onClick }: StudentCardProps) {
  const hue = stringToHue(student.name);

  return (
    <motion.button
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
      transition={{
        duration: 0.5,
        delay: index * 0.05,
        ease: [0.25, 0.46, 0.45, 0.94] as const,
      }}
      layout
      onClick={onClick}
      className="group relative flex flex-col items-center p-6 rounded-2xl border border-border bg-bg-elevated/60 hover:border-border-accent hover:bg-bg-surface/60 transition-all duration-300 cursor-pointer text-left w-full"
    >
      {/* Avatar */}
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mb-4 text-xl font-heading font-bold border-2 border-transparent group-hover:border-accent/30 transition-all duration-300"
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
      <span className="font-mono text-[10px] tracking-[0.15em] text-text-dim mb-2 uppercase">
        {student.nim}
      </span>

      {/* Name */}
      <h3 className="font-heading font-semibold text-sm text-text-primary text-center mb-1 group-hover:text-accent transition-colors duration-200">
        {student.name}
      </h3>

      {/* Role Badge */}
      {student.role && (
        <span className="inline-block px-2.5 py-0.5 text-[10px] font-mono tracking-wider text-accent bg-accent-dim/40 rounded-full mt-1 uppercase">
          {student.role}
        </span>
      )}

      {/* Quote (on hover) */}
      {student.quote && (
        <div className="absolute inset-x-0 -bottom-2 opacity-0 group-hover:opacity-100 group-hover:bottom-0 transition-all duration-300 pointer-events-none">
          <div className="mx-3 px-3 py-2 bg-bg-primary/95 border border-border rounded-lg">
            <p className="text-[11px] text-text-muted italic text-center leading-snug">
              &ldquo;{student.quote}&rdquo;
            </p>
          </div>
        </div>
      )}
    </motion.button>
  );
}
