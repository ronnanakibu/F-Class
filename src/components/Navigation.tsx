'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

import ThemeToggle from '@/components/ThemeToggle';

const navLinks = [
  { label: 'Home', href: '#hero' },
  { label: 'About', href: '#manifesto' },
  { label: 'Students', href: '#students' },
  { label: 'Timeline', href: '#timeline' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Projects', href: '#projects' },
];

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <nav
      className={`fixed top-4 left-4 right-4 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-bg-primary/85 backdrop-blur-md border border-border shadow-lg shadow-black/10'
          : 'bg-transparent'
      } rounded-2xl`}
    >
      <div className="container-custom flex items-center justify-between h-14">
        {/* Logo Mark */}
        <a
          href="#hero"
          className="font-heading font-bold text-lg tracking-tight cursor-pointer select-none"
        >
          <span className="text-accent">CE</span>
          <span className="text-text-muted mx-1">—</span>
          <span className="text-text-primary">F</span>
        </a>

        {/* Desktop Links + Theme Toggle */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-3 py-2 text-sm font-medium text-text-muted hover:text-accent transition-colors duration-200 cursor-pointer rounded-lg hover:bg-bg-surface/50"
            >
              {link.label}
            </a>
          ))}
          <div className="w-px h-4 bg-border mx-2" aria-hidden="true" />
          <ThemeToggle />
        </div>

        {/* Mobile Actions: Theme Toggle + Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-text-muted hover:text-accent transition-colors duration-200 cursor-pointer rounded-xl border border-border bg-bg-surface/50"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="md:hidden overflow-hidden border-t border-border bg-bg-primary/95 backdrop-blur-md rounded-b-2xl"
          >
            <div className="flex flex-col p-4 gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={handleLinkClick}
                  className="px-4 py-3 text-base font-medium text-text-muted hover:text-accent hover:bg-bg-surface/50 transition-colors duration-200 cursor-pointer rounded-xl"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
