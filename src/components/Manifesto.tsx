'use client';

import { useRef, useEffect, useState } from 'react';
import { useInView } from 'framer-motion';
import { classInfo } from '@/data/classInfo';
import SectionReveal from './SectionReveal';
import { Users, FolderGit2, Clock, Infinity } from 'lucide-react';

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(Math.round(increment * step), target);
      setCount(current);
      if (step >= steps) clearInterval(timer);
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isInView, target]);

  return (
    <span ref={ref} className="tabular-nums">
      {count.toLocaleString()}{suffix}
    </span>
  );
}

const stats = [
  {
    icon: Users,
    label: 'Students',
    value: classInfo.stats.totalStudents,
    suffix: '',
  },
  {
    icon: FolderGit2,
    label: 'Active Projects',
    value: classInfo.stats.activeProjects,
    suffix: '',
  },
  {
    icon: Clock,
    label: 'Practicum Hours',
    value: classInfo.stats.practicumHours,
    suffix: '+',
  },
  {
    icon: Infinity,
    label: 'Memories',
    value: 0,
    suffix: '',
    isInfinity: true,
  },
];

export default function Manifesto() {
  const [manifestoContent, setManifestoContent] = useState({
    tagline: classInfo.tagline,
    quote: '',
    description: classInfo.description,
    statProjects: classInfo.stats.activeProjects,
    statHours: classInfo.stats.practicumHours,
  });

  useEffect(() => {
    fetch('/api/site-content')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.content?.manifesto) {
          setManifestoContent((prev) => ({ ...prev, ...data.content.manifesto }));
        }
      })
      .catch(() => {});
  }, []);

  const dynamicStats = [
    {
      icon: Users,
      label: 'Students',
      value: classInfo.stats.totalStudents,
      suffix: '',
    },
    {
      icon: FolderGit2,
      label: 'Active Projects',
      value: manifestoContent.statProjects,
      suffix: '',
    },
    {
      icon: Clock,
      label: 'Practicum Hours',
      value: manifestoContent.statHours,
      suffix: '+',
    },
    {
      icon: Infinity,
      label: 'Memories',
      value: 0,
      suffix: '',
      isInfinity: true,
    },
  ];

  return (
    <section id="manifesto" className="py-24 md:py-32 relative">
      <div className="container-custom">
        {/* Editorial Story */}
        <SectionReveal>
          <div className="max-w-3xl mx-auto mb-20">
            <p className="font-mono text-xs tracking-[0.25em] text-accent uppercase mb-6">
              {manifestoContent.tagline || 'Siapa Kami?'}
            </p>
            <h2 className="text-fluid-heading font-heading font-bold text-text-primary mb-8">
              Kami Juga Masih Mencari <span className="text-accent">Jati Diri </span> Kami.
            </h2>
            <p className="text-fluid-body text-text-muted leading-relaxed">
              {manifestoContent.description}
            </p>
          </div>
        </SectionReveal>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {dynamicStats.map((stat, i) => (
            <SectionReveal key={stat.label} delay={i * 0.1}>
              <div className="group relative p-6 md:p-8 rounded-2xl border border-border bg-bg-elevated/50 hover:border-border-accent hover:bg-bg-surface/50 transition-all duration-300 cursor-default">
                {/* Icon */}
                <stat.icon
                  size={20}
                  className="text-accent mb-4 opacity-60 group-hover:opacity-100 transition-opacity duration-300"
                />

                {/* Value */}
                <div className="text-3xl md:text-4xl font-heading font-bold text-text-primary mb-2">
                  {'isInfinity' in stat && stat.isInfinity ? (
                    <span className="text-accent">∞</span>
                  ) : (
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  )}
                </div>

                {/* Label */}
                <p className="font-mono text-xs tracking-wider text-text-muted uppercase">
                  {stat.label}
                </p>
              </div>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
