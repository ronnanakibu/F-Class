'use client';

import { useEffect } from 'react';
import SectionReveal from './SectionReveal';
import { Terminal, Flame, Coffee, Bug, Wrench } from 'lucide-react';

const chaosItems = [
  {
    icon: Flame,
    title: 'Burned Resistors Count',
    value: '∞',
    description: 'We stopped counting after the third lab session.',
  },
  {
    icon: Coffee,
    title: 'Collective Coffee Intake',
    value: '~2,400 cups',
    description: 'Rough estimate. The real number is classified.',
  },
  {
    icon: Bug,
    title: 'Bugs Created (Then Fixed)',
    value: '10,000+',
    description: '"It works on my machine" — heard 47 times this semester.',
  },
  {
    icon: Terminal,
    title: 'Late-Night Debug Sessions',
    value: 'Every. Single. Week.',
    description: 'The lab closes at 10 PM. We leave at 10 PM. Sometimes.',
  },
  {
    icon: Wrench,
    title: 'Last-Minute Lab Reports',
    value: '100%',
    description: 'Not a single report was submitted more than 2 hours early. Not one.',
  },
];

export default function Culture() {
  // Console Easter Egg
  useEffect(() => {
    const styles = [
      'color: #00F0FF',
      'font-size: 14px',
      'font-family: monospace',
      'padding: 8px 0',
    ].join(';');

    const asciiArt = `
%c╔══════════════════════════════════════════════╗
║                                              ║
║      ██████╗███████╗    ███████╗             ║
║     ██╔════╝██╔════╝    ██╔════╝             ║
║     ██║     █████╗      █████╗               ║
║     ██║     ██╔══╝      ██╔══╝               ║
║     ╚██████╗███████╗    ██║                  ║
║      ╚═════╝╚══════╝    ╚═╝                  ║
║                                              ║
║   Computer Engineering — Class F             ║
║   Politeknik Negeri Medan                    ║
║                                              ║
║   > You found the easter egg.                ║
║   > Built with grit. Debugged with tears.    ║
║                                              ║
╚══════════════════════════════════════════════╝`;

    console.log(asciiArt, styles);
    console.log(
      '%c🔧 Want to contribute? Check our GitHub.',
      'color: #6b6b78; font-family: monospace;'
    );
  }, []);

  return (
    <section id="culture" className="py-24 md:py-32 relative overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-grid opacity-30" />

      <div className="container-custom relative z-10">
        <SectionReveal>
          <p className="font-mono text-xs tracking-[0.25em] text-accent uppercase mb-4">
            The Atmosphere
          </p>
          <h2 className="text-fluid-heading font-heading font-bold text-text-primary mb-4">
            The Chaos Behind the{' '}
            <span className="text-accent">Code</span>
          </h2>
          <p className="text-fluid-body text-text-muted max-w-2xl mb-12">
            Engineering isn&apos;t glamorous. It&apos;s burnt components, all-nighters, and the occasional victory. Here&apos;s the honest version.
          </p>
        </SectionReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {chaosItems.map((item, i) => (
            <SectionReveal key={item.title} delay={i * 0.08}>
              <div className="group p-6 rounded-2xl border border-border bg-bg-elevated/40 hover:border-border-accent hover:bg-bg-surface/40 transition-all duration-300 cursor-default">
                <item.icon
                  size={20}
                  className="text-accent/60 group-hover:text-accent mb-4 transition-colors duration-300"
                />
                <h3 className="font-heading font-semibold text-sm text-text-primary mb-1">
                  {item.title}
                </h3>
                <p className="text-2xl font-heading font-bold text-accent mb-2">
                  {item.value}
                </p>
                <p className="text-xs text-text-muted leading-relaxed">
                  {item.description}
                </p>
              </div>
            </SectionReveal>
          ))}
        </div>

        {/* Hidden Easter Egg Hint */}
        <SectionReveal delay={0.5}>
          <div className="mt-12 text-center">
            <p className="font-mono text-[10px] text-text-dim tracking-wider">
              Hint: Open DevTools console for a surprise.
            </p>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
