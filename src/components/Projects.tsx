'use client';

import { useState, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { projects } from '@/data/projects';
import ProjectCard from './ProjectCard';
import SectionReveal from './SectionReveal';

const categories = ['All', 'Embedded', 'IoT', 'Hardware', 'Web', 'AI'] as const;

export default function Projects() {
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const filtered = useMemo(() => {
    if (activeCategory === 'All') return projects;
    return projects.filter((p) => p.category === activeCategory);
  }, [activeCategory]);

  return (
    <section id="projects" className="py-24 md:py-32 relative">
      <div className="container-custom">
        <SectionReveal>
          <p className="font-mono text-xs tracking-[0.25em] text-accent uppercase mb-4">
            What We Build
          </p>
          <h2 className="text-fluid-heading font-heading font-bold text-text-primary mb-4">
            Engineering{' '}
            <span className="text-accent">Showcase</span>
          </h2>
          <p className="text-fluid-body text-text-muted max-w-2xl mb-10">
            Real projects built by real students. From microcontrollers to machine learning — this is what CE F ships.
          </p>
        </SectionReveal>

        {/* Category Filter */}
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

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <AnimatePresence mode="popLayout">
            {filtered.map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} />
            ))}
          </AnimatePresence>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-text-dim font-mono text-sm">
              No projects in this category yet.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
