'use client';

import { motion } from 'framer-motion';
import { COLLECTIONS } from '@/lib/sample-data';
import Link from 'next/link';

export function HeroShowcase() {
  return (
    <section className="py-12 bg-white border-y border-border/40">
      {/* Marquee Strip */}
      <div className="overflow-hidden mb-10">
        <motion.div
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="flex gap-12 whitespace-nowrap"
        >
          {[...COLLECTIONS, ...COLLECTIONS, ...COLLECTIONS, ...COLLECTIONS].map((col, i) => (
            <div key={i} className="flex items-center gap-3 text-lg font-black text-muted-foreground/30">
              <span>{col.icon}</span>
              <span>{col.name}</span>
              <span className="text-primary">✦</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Category Cards */}
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {COLLECTIONS.map((collection, index) => (
            <motion.div
              key={collection.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={`/shop?category=${collection.id}`}
                className="group block p-6 bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl border border-pink-100 hover:border-primary/30 hover:shadow-lg hover:shadow-pink-100 transition-all text-center"
              >
                <span className="text-4xl block mb-3 group-hover:scale-110 transition-transform">
                  {collection.icon}
                </span>
                <h3 className="font-black text-foreground text-sm mb-2">{collection.name}</h3>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-primary group-hover:gap-2 transition-all">
                  الإطلاع
                  <span className="text-lg">⬅</span>
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
