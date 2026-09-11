'use client';

import { motion } from 'framer-motion';
import type { Project } from '@/types';
import { ExternalLink } from 'lucide-react';
import { IconGithub } from './BrandIcons';

interface ProjectCardProps {
  project: Project;
  index: number;
}

export default function ProjectCard({ project, index }: ProjectCardProps) {
  const categoryColors: Record<string, string> = {
    Embedded: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    IoT: 'text-sky-400 bg-sky-400/10 border-sky-400/20',
    Hardware: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    Web: 'text-violet-400 bg-violet-400/10 border-violet-400/20',
    AI: 'text-rose-400 bg-rose-400/10 border-rose-400/20',
  };

  const colorClass = categoryColors[project.category] || 'text-accent bg-accent-dim border-border-accent';

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
      className="group relative flex flex-col p-6 rounded-2xl border border-border bg-bg-elevated/60 hover:border-border-accent transition-all duration-300"
    >
      {/* Category Badge */}
      <span className={`self-start px-2.5 py-0.5 text-[10px] font-mono tracking-wider rounded-full border uppercase mb-4 ${colorClass}`}>
        {project.category}
      </span>

      {/* Title */}
      <h3 className="text-lg font-heading font-semibold text-text-primary mb-2 group-hover:text-accent transition-colors duration-200">
        {project.title}
      </h3>

      {/* Description */}
      <p className="text-sm text-text-muted leading-relaxed mb-4 flex-1">
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
      <p className="text-[11px] text-text-dim font-mono mb-4">
        Team: {project.team.join(' · ')}
      </p>

      {/* Links */}
      <div className="flex gap-2 mt-auto">
        {project.repoUrl && (
          <a
            href={project.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-mono text-text-muted border border-border rounded-lg hover:border-border-accent hover:text-accent transition-all duration-200 cursor-pointer"
          >
            <IconGithub size={14} />
            Source
          </a>
        )}
        {project.demoUrl && (
          <a
            href={project.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-mono text-bg-primary bg-accent rounded-lg hover:bg-accent/80 transition-all duration-200 cursor-pointer font-semibold"
          >
            <ExternalLink size={14} />
            Demo
          </a>
        )}
      </div>
    </motion.article>
  );
}
