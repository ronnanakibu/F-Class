import { MessageCircle } from 'lucide-react';
import { IconGithub, IconInstagram } from './BrandIcons';
import { classInfo } from '@/data/classInfo';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-border bg-bg-elevated/30">
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
          {classInfo.socials.instagram && (
            <a
              href={classInfo.socials.instagram}
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

          <p className="text-xs text-text-dim font-mono text-center sm:text-right">
            © {currentYear} {classInfo.classCode} — {classInfo.institution}.
            Crafted by CE F students.
          </p>
        </div>
      </div>
    </footer>
  );
}
