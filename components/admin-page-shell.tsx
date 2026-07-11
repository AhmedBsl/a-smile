'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AdminPageShellProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function AdminPageShell({
  title,
  subtitle,
  actions,
  children,
}: AdminPageShellProps) {
  return (
    <div className="min-h-full">
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-20">
        <div className="p-4 md:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            )}
          </motion.div>
          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </div>
      </div>
      <div className="p-4 md:p-6">{children}</div>
    </div>
  );
}
