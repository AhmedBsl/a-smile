'use client';

import { motion } from 'framer-motion';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showGlow?: boolean;
  className?: string;
}

const sizes = {
  sm: 32,
  md: 48,
  lg: 72,
};

export function BrandLogo({
  size = 'md',
  showGlow = false,
  className = '',
}: BrandLogoProps) {
  const dim = sizes[size];

  return (
    <div className={`relative inline-flex ${className}`}>
      {showGlow && (
        <motion.div
          className="absolute inset-0 rounded-sm bg-primary/30 blur-xl"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      )}
      <svg
        width={dim}
        height={dim}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10"
        aria-label="A.Smile logo"
      >
        <rect width="100" height="100" rx="2" fill="#1B1B1B" />
        <path
          d="M50 12 C 20 40, 20 70, 42 88 C 30 70, 34 50, 50 38
             C 66 50, 70 70, 58 88 C 80 70, 80 40, 50 12 Z"
          fill="#C1272D"
        />
        <circle cx="50" cy="90" r="4" fill="#C9E100" />
      </svg>
    </div>
  );
}
