'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Project } from '@/types';
import { ExternalLink, Sparkles, MessageSquare, Layers, Cpu, Globe, Bot, Wrench } from 'lucide-react';
import { IconGithub } from './BrandIcons';

interface ProjectCardProps {
  project: Project;
  index: number;
}

export default function ProjectCard({ project, index }: ProjectCardProps) {
  const [imageError, setImageError] = useState(false);

  const categoryColors: Record<string, string> = {
    Embedded: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    IoT: 'text-sky-400 bg-sky-400/10 border-sky-400/20',
    Hardware: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    Web: 'text-violet-400 bg-violet-400/10 border-violet-400/20',
    AI: 'text-rose-400 bg-rose-400/10 border-rose-400/20',
  };

  const categoryIcons: Record<string, typeof Globe> = {
    Embedded: Cpu,
    IoT: Layers,
    Hardware: Wrench,
    Web: Globe,
    AI: Bot,
  };

  const colorClass =
    categoryColors[project.category] || 'text-accent bg-accent-dim border-border-accent';

  const CategoryIcon = categoryIcons[project.category] || Layers;

  const isWhatsAppLink = Boolean(
    project.demoUrl &&
      (project.demoUrl.includes('wa.me') || project.demoUrl.includes('whatsapp.com'))
  );

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
      transition={{
        duration: 0.5,
        delay: index * 0.08,
        ease: [0.25, 0.46, 0.45, 0.94] as const,
      }}
      layout
      className={`group relative flex flex-col rounded-2xl md:rounded-3xl border transition-all duration-300 overflow-hidden ${
        project.featured
          ? 'border-accent/50 bg-gradient-to-b from-bg-elevated via-bg-elevated/70 to-bg-surface shadow-[0_0_30px_rgba(0,240,255,0.12)]'
          : 'border-border bg-bg-elevated/60 hover:border-border-accent'
      }`}
    >
      {/* Banner Mockup / Image Placeholder */}
      <div className="relative w-full aspect-[16/9] bg-neutral-950 overflow-hidden border-b border-border/60">
        {project.image && !imageError ? (
          <img
            src={project.image}
            alt={project.title}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          /* High-Tech Futuristic Cybernetic Visual Placeholder */
          <div className="w-full h-full relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-bg-primary via-bg-elevated to-bg-surface">
            <div
              className="absolute inset-0 opacity-15"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 1px 1px, var(--accent, #3b82f6) 1px, transparent 0)',
                backgroundSize: '24px 24px',
              }}
            />
            <div className="relative z-10 flex flex-col items-center justify-center text-center p-4">
              <div className="w-12 h-12 rounded-2xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent mb-2 shadow-inner group-hover:scale-110 transition-transform">
                <CategoryIcon size={24} />
              </div>
              <span className="text-[10px] font-mono tracking-widest text-text-dim uppercase">
                {project.category} Showcase
              </span>
            </div>
          </div>
        )}

        {/* Top Badges over image */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
          <span
            className={`px-2.5 py-0.5 text-[10px] font-mono tracking-wider rounded-full border uppercase backdrop-blur-md shadow-sm ${colorClass}`}
          >
            {project.category}
          </span>

          {project.featured && (
            <span className="px-2.5 py-0.5 text-[9px] font-mono tracking-wider rounded-full border border-amber-400/40 bg-amber-500/20 text-amber-300 font-bold uppercase backdrop-blur-md flex items-center gap-1 shadow-md">
              <Sparkles size={10} />
              DEV&apos;S PICK
            </span>
          )}
        </div>
      </div>

      {/* Card Content Body */}
      <div className="flex flex-col flex-1 p-5 md:p-6">
        {/* Title */}
        <h3 className="text-lg font-heading font-bold text-text-primary mb-2 group-hover:text-accent transition-colors duration-200">
          {project.title}
        </h3>

        {/* Description */}
        <p className="text-xs sm:text-sm text-text-muted leading-relaxed mb-4 flex-1">
          {project.description}
        </p>

        {/* Tech Stack */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.techStack.map((tech) => (
            <span
              key={tech}
              className="px-2 py-0.5 text-[10px] font-mono text-text-dim bg-bg-surface border border-border rounded-md"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Team */}
        <p className="text-[11px] text-text-dim font-mono mb-5 flex items-center gap-1">
          <span className="text-text-muted font-semibold">Dev / Team:</span>
          <span>{project.team.join(' · ')}</span>
        </p>

        {/* Action Links */}
        <div className="flex items-center gap-2 mt-auto pt-2">
          {project.repoUrl && (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-mono text-text-muted border border-border rounded-xl hover:border-border-accent hover:text-accent transition-all duration-200 cursor-pointer bg-bg-surface/50"
            >
              <IconGithub size={14} />
              <span>GitHub</span>
            </a>
          )}

          {project.demoUrl && (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-mono rounded-xl transition-all duration-200 cursor-pointer font-semibold shadow-md ${
                isWhatsAppLink
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                  : 'bg-accent hover:bg-accent/90 text-bg-primary shadow-accent/20'
              }`}
            >
              {isWhatsAppLink ? <MessageSquare size={14} /> : <ExternalLink size={14} />}
              <span>{isWhatsAppLink ? 'Coba Bot WA' : 'Live Web'}</span>
            </a>
          )}
        </div>
      </div>
    </motion.article>
  );
}
