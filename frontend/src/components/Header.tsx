"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent-light text-xs font-bold text-white">
            G
          </div>
          <span className="text-lg font-semibold tracking-tight">Gradient</span>
        </Link>

        <nav className="hidden items-center gap-6 sm:flex">
          <Link
            href="/"
            className="text-sm font-medium text-muted transition-colors hover:text-foreground"
          >
            Feed
          </Link>
          <Link
            href="/boards"
            className="text-sm font-medium text-muted transition-colors hover:text-foreground"
          >
            Boards
          </Link>
          <button className="rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90">
            Sign In
          </button>
        </nav>

        <button
          className="sm:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {menuOpen ? (
              <path d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-border px-4 py-3 sm:hidden">
          <nav className="flex flex-col gap-3">
            <Link href="/" className="text-sm font-medium">Feed</Link>
            <Link href="/boards" className="text-sm font-medium">Boards</Link>
            <button className="rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-white">
              Sign In
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
