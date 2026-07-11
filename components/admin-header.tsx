'use client';

import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

export function AdminHeader() {
  return (
    <header className="h-12 border-b border-border bg-card/80 backdrop-blur-sm flex items-center justify-between px-4 md:px-6 shrink-0">
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono text-muted-foreground hidden md:inline">
          Admin Panel
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary px-2.5 py-1.5 rounded-sm hover:bg-primary/5 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">View Store</span>
        </Link>
      </div>
    </header>
  );
}
