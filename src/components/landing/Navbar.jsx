import React, { useState, useEffect } from 'react';
import ThemeToggle from '../ui/ThemeToggle';

const navLinks = [
  { name: 'Features', href: '#features' },
  { name: 'Preview', href: '#preview' },
  { name: 'Pricing', href: '#pricing' },
];

export default function Navbar({ onHomeClick }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-background-base/95 backdrop-blur-xl border-b border-border dark:bg-background-base/95 dark:border-border'
          : 'bg-transparent'
      }`}
    >
      <div className="container">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <button
            onClick={onHomeClick}
            className="flex items-center gap-2.5 group transition-transform duration-200 hover:scale-105"
          >
            <div className="relative w-9 h-9 rounded-lg bg-accent flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-shadow duration-300">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xl font-semibold text-gradient">PromptUp</span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="relative text-foreground-muted dark:text-foreground-muted font-medium transition-colors duration-200 hover:text-foreground dark:hover:text-foreground hover:-translate-y-0.5"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* CTA Buttons & Theme Toggle - Desktop */}
          <div className="hidden lg:flex items-center gap-3">
            <ThemeToggle />
            <button className="btn-ghost hover:scale-105 transition-transform duration-200">
              Sign In
            </button>
            <button className="btn-primary hover:scale-102 transition-transform duration-200">
              Get Started Free
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg hover:bg-surface dark:hover:bg-surface transition-colors duration-200"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className={`w-6 h-6 text-foreground-muted dark:text-foreground-muted transition-transform duration-300 ${
                isMobileMenuOpen ? 'rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden overflow-hidden animate-slide-up">
            <div className="py-4 border-t border-border dark:border-border space-y-2">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="block px-4 py-2.5 text-foreground-muted dark:text-foreground-muted hover:text-foreground dark:hover:text-foreground hover:bg-surface dark:hover:bg-surface rounded-lg transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <div className="flex flex-col items-center gap-3 px-4 pt-4 border-t border-border dark:border-border mt-4">
                <ThemeToggle />
                <button className="w-full py-2.5 text-foreground-muted dark:text-foreground-muted hover:text-foreground dark:hover:text-foreground hover:bg-surface dark:hover:bg-surface rounded-lg transition-colors duration-200 text-left">
                  Sign In
                </button>
                <button className="btn-primary w-full">
                  Get Started Free
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
