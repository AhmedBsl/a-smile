'use client';

import { motion } from 'framer-motion';
import { BrandLogo } from './brand-logo';

export function ModernLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="cursor-pointer"
    >
      <BrandLogo size={size} />
    </motion.div>
  );
}
