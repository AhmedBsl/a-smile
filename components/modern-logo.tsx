'use client';

import { motion } from 'framer-motion';
import { BrandLogo } from './brand-logo';

export function ModernLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeMap = { sm: 'sm' as const, md: 'md' as const, lg: 'lg' as const };
  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <BrandLogo size={sizeMap[size]} showGlow />
    </motion.div>
  );
}
