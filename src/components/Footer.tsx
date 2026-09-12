'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MessageCircle, Terminal } from 'lucide-react';
import { IconGithub, IconInstagram } from './BrandIcons';
import { classInfo } from '@/data/classInfo';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const router = useRouter();
  const [clickCount, setClickCount] = useState(0);
  const [footerContent, setFooterContent] = useState({
    tagline: 'Circuits, Code, and Chaos.',
    copyright: `© ${currentYear} ${classInfo.classCode} — ${classInfo.institution}. Crafted by CE F students.`,
    instagramUrl: classInfo.socials.instagram,
  });

  useEffect(() => {
    fetch('/api/site-content')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.content?.footer) {
          setFooterContent((prev) => ({ ...prev, ...data.content.footer }));
        }
      })
      .catch(() => {});
  }, []);

  // Easter Egg trigger: click 5 times to open admin console
  const handleEasterEggClick = () => {
    const next = clickCount + 1;
    setClickCount(next);
    if (next >= 5) {
      setClickCount(0);
      router.push('/admin');
    }
  };

  return (
    <footer className="relative border-t border-border bg-bg-elevated/30 select-none">
      <div className="container-custom py-16 md:py-20">
        {/* Closing Statement */}
        <div className="text-center mb-12">
          <p className="text-fluid-subheading font-heading font-bold text-text-primary mb-2">
            Engineered with grit.{' '}
            <span className="text-accent">Built together in Medan.</span>
          </p>
          <p className="text-sm text-text-muted">
            {classInfo.department} — {classInfo.institution}
          </p>
        </div>

        {/* Social Links */}
        <div className="flex items-center justify-center gap-4 mb-12">
          {footerContent.instagramUrl && (
            <a
              href={footerContent.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-xl border border-border bg-bg-surface hover:border-border-accent hover:text-accent text-text-muted transition-all duration-200 cursor-pointer"
              aria-label="Instagram"
            >
              <IconInstagram size={20} />
            </a>
          )}
          {classInfo.socials.github && (
            <a
              href={classInfo.socials.github}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-xl border border-border bg-bg-surface hover:border-border-accent hover:text-accent text-text-muted transition-all duration-200 cursor-pointer"
              aria-label="GitHub"
            >
              <IconGithub size={20} />
            </a>
          )}
          {classInfo.socials.whatsapp && (
            <a
              href={classInfo.socials.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-xl border border-border bg-bg-surface hover:border-border-accent hover:text-accent text-text-muted transition-all duration-200 cursor-pointer"
              aria-label="WhatsApp"
            >
              <MessageCircle size={20} />
            </a>
          )}
        </div>

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-border">
          <div className="flex items-center gap-2">
            <span className="font-heading font-bold text-sm tracking-tight">
              <span className="text-accent">CE</span>
              <span className="text-text-dim mx-1">—</span>
              <span className="text-text-primary">F</span>
            </span>
            <span className="text-text-dim text-xs">|</span>
            <span className="text-text-dim text-xs font-mono">
              {classInfo.batch}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <p
              onClick={handleEasterEggClick}
              className="text-xs text-text-dim font-mono text-center sm:text-right cursor-pointer hover:text-text-muted transition-colors"
              title="CE F Student Class"
            >
              {footerContent.copyright}
            </p>

            {/* Subtle Terminal Easter Egg Link */}
            <Link
              href="/admin"
              className="p-1 rounded text-text-dim/40 hover:text-accent hover:bg-accent/10 transition-colors"
              title="Terminal Console"
            >
              <Terminal size={13} />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
