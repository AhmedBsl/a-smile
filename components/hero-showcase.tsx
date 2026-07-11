'use client';

import { useStore } from '@/lib/store';
import { motion } from 'framer-motion';
import { formatDZD } from '@/lib/format';
import Link from 'next/link';

const highlights = [
  'MADE IN SIDI BEL ABBÈS',
  'SCORPION COLLECTION',
  'USMBA HERITAGE',
  'ALGÉRIE STREETWEAR',
  'PREMIUM QUALITY',
  'CASH ON DELIVERY',
  '58 WILAYAS',
  'FREE RETURNS',
];

export function HeroShowcase() {
  const products = useStore((s) => s.products);
  const showcaseProducts = products.slice(0, 6);

  return (
    <div className="relative w-full overflow-hidden border-y border-border/50 bg-charcoal/5">
      {/* Marquee strip */}
      <div className="flex overflow-hidden py-4">
        <motion.div
          className="flex gap-8 whitespace-nowrap"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
        >
          {[...highlights, ...highlights].map((text, i) => (
            <span
              key={i}
              className="text-[10px] font-mono tracking-[0.3em] text-primary/70 uppercase flex items-center gap-8"
            >
              {text}
              <span className="text-venom/60 text-[8px]">&#9670;</span>
            </span>
          ))}
        </motion.div>
      </div>

      {/* Floating product carousel */}
      {showcaseProducts.length > 0 && (
        <div className="relative py-6">
          <motion.div
            className="flex gap-4 md:gap-6 px-4"
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          >
            {[...showcaseProducts, ...showcaseProducts].map((product, i) => (
              <Link
                key={`${product.id}-${i}`}
                href={`/product/${product.id}`}
                className="shrink-0 w-32 md:w-44 group"
              >
                <motion.div
                  className="relative aspect-[3/4] rounded-sm overflow-hidden bg-muted border border-border/50"
                  whileHover={{ y: -8, scale: 1.03 }}
                  transition={{ duration: 0.3 }}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-sand/80 text-[10px] font-bold truncate">{product.name}</p>
                    <p className="text-primary text-xs font-black font-mono">{formatDZD(product.price)}</p>
                  </div>
                </motion.div>
              </Link>
            ))}
          </motion.div>
        </div>
      )}

      {/* Animated coordinates strip */}
      <motion.div
        className="py-4 flex justify-center gap-6 text-[9px] font-mono text-muted-foreground/60 tracking-[0.3em]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <motion.span
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          35°11&apos;N
        </motion.span>
        <span className="text-primary/40">|</span>
        <motion.span
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, delay: 1 }}
        >
          0°38&apos;W
        </motion.span>
        <span className="text-primary/40">|</span>
        <span>SIDI BEL ABBÈS</span>
      </motion.div>
    </div>
  );
}
