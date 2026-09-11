'use client';

import { timeline } from '@/data/timeline';
import SectionReveal from './SectionReveal';
import {
  Flag,
  Cpu,
  Code,
  Trophy,
  Zap,
  Wifi,
  Rocket,
  ArrowRight,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  flag: Flag,
  cpu: Cpu,
  code: Code,
  trophy: Trophy,
  zap: Zap,
  wifi: Wifi,
  rocket: Rocket,
  'arrow-right': ArrowRight,
};

export default function Timeline() {
  return (
    <section id="timeline" className="py-24 md:py-32 relative">
      <div className="container-custom">
        <SectionReveal>
          <p className="font-mono text-xs tracking-[0.25em] text-accent uppercase mb-4">
            Our Story
          </p>
          <h2 className="text-fluid-heading font-heading font-bold text-text-primary mb-4">
            The Timeline of{' '}
            <span className="text-accent">CE F</span>
          </h2>
          <p className="text-fluid-body text-text-muted max-w-2xl mb-16">
            From first orientation to current builds. Every milestone that shaped who we are.
          </p>
        </SectionReveal>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-border md:-translate-x-px" />

          {timeline.map((event, i) => {
            const Icon = iconMap[event.icon] || Zap;
            const isEven = i % 2 === 0;

            return (
              <SectionReveal
                key={event.id}
                delay={i * 0.08}
                direction={isEven ? 'left' : 'right'}
              >
                <div
                  className={`relative flex items-start mb-12 md:mb-16 ${
                    isEven ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  {/* Dot */}
                  <div className="absolute left-4 md:left-1/2 w-8 h-8 -translate-x-1/2 rounded-full bg-bg-elevated border-2 border-accent/40 flex items-center justify-center z-10">
                    <Icon size={14} className="text-accent" />
                  </div>

                  {/* Content */}
                  <div
                    className={`ml-14 md:ml-0 md:w-[45%] ${
                      isEven ? 'md:pr-12 md:text-right' : 'md:pl-12 md:text-left md:ml-auto'
                    }`}
                  >
                    {/* Date */}
                    <span className="font-mono text-[10px] tracking-[0.2em] text-accent uppercase">
                      {event.date}
                    </span>

                    {/* Semester Badge */}
                    <span className="ml-2 px-2 py-0.5 text-[9px] font-mono tracking-wider text-text-dim border border-border rounded-full uppercase">
                      Sem {event.semester}
                    </span>

                    <h3 className="text-lg font-heading font-semibold text-text-primary mt-2 mb-2">
                      {event.title}
                    </h3>

                    <p className="text-sm text-text-muted leading-relaxed">
                      {event.description}
                    </p>
                  </div>
                </div>
              </SectionReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
