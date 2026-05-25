"use client";

import { useState } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="relative z-50 border-b border-border bg-bg/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <span className="text-lg font-semibold tracking-tight text-accent">
          TechPro
        </span>

        <nav className="hidden items-center gap-6 text-sm text-muted md:flex">
          <a href="#specs" className="transition-colors hover:text-text">
            Fiche technique
          </a>
          <a href="#commander" className="transition-colors hover:text-text">
            Commander
          </a>
          <a href="#faq" className="transition-colors hover:text-text">
            FAQ
          </a>
        </nav>

        <button
          className="flex flex-col gap-1 md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <span className="h-0.5 w-5 bg-text transition-all" />
          <span className="h-0.5 w-5 bg-text transition-all" />
        </button>
      </div>

      {menuOpen && (
        <div className="animate-slide-up border-t border-border bg-bg px-5 pb-4 md:hidden">
          <a
            href="#specs"
            className="block py-2 text-sm text-muted"
            onClick={() => setMenuOpen(false)}
          >
            Fiche technique
          </a>
          <a
            href="#commander"
            className="block py-2 text-sm text-muted"
            onClick={() => setMenuOpen(false)}
          >
            Commander
          </a>
          <a
            href="#faq"
            className="block py-2 text-sm text-muted"
            onClick={() => setMenuOpen(false)}
          >
            FAQ
          </a>
        </div>
      )}
    </header>
  );
}
