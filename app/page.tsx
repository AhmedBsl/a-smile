'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Hero } from '@/components/hero';
import { AnimatedBackground } from '@/components/animated-background';
import { useStore } from '@/lib/store';
import { SAMPLE_PRODUCTS } from '@/lib/sample-data';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { formatDZD } from '@/lib/format';
import { useRef } from 'react';

function FeaturedSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const products = useStore((state) => state.products);

  return (
    <section id="featured" ref={ref} className="py-20 bg-background relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-16 text-center"
        >
          <span className="inline-block text-[10px] font-mono tracking-[0.3em] text-primary uppercase mb-4">
            New Arrivals
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-foreground mb-4">
            Featured Collection
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Hand-picked pieces that define street style. Every item tells a story of confidence and culture.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.slice(0, 6).map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Link href={`/product/${product.id}`}>
                <div className="group cursor-pointer h-full">
                  <div className="relative overflow-hidden rounded-sm bg-muted aspect-[3/4] mb-4">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <span className="text-white text-xs font-bold uppercase tracking-wider">View Details →</span>
                    </div>
                  </div>
                  <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors mb-2">
                    {product.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-black text-primary font-mono">
                      {formatDZD(product.price)}
                    </span>
                    <span className="text-[10px] font-bold text-accent bg-accent/10 px-3 py-1 rounded-sm uppercase tracking-wider">
                      {product.stock > 0 ? 'In Stock' : 'Sold Out'}
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-12 text-center"
        >
          <Link href="/shop">
            <button className="bg-primary text-primary-foreground px-8 py-3.5 font-black text-sm uppercase tracking-wider hover:bg-redDim transition-all duration-300 rounded-sm group inline-flex items-center gap-2">
              View Full Shop
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function BrandStorySection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-20 bg-charcoal text-sand relative overflow-hidden">
      {/* Watermark */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-[0.02] pointer-events-none">
        <svg width="400" height="400" viewBox="0 0 100 100" fill="none">
          <path d="M50 12 C 20 40, 20 70, 42 88 C 30 70, 34 50, 50 38 C 66 50, 70 70, 58 88 C 80 70, 80 40, 50 12 Z" fill="#C1272D" />
        </svg>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block text-[10px] font-mono tracking-[0.3em] text-primary uppercase mb-4">
              Our Story
            </span>
            <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
              TWO FRIENDS,<br />
              <span className="text-primary">ONE DREAM</span>
            </h2>
            <div className="space-y-4 text-sand/70 leading-relaxed">
              <p>
                Adel and Abdelillah grew up in Sidi Bel Abbès, where the desert plains meet the roar of the stadium.
                They wanted to create something that felt like home — streetwear that carries the pride of the
                scorpion, the passion of USMBA, and the warmth of a smile.
              </p>
              <p>
                A.Smile is not just a brand. It&apos;s a statement that Algerian fashion can stand anywhere in the world.
                Every piece is designed with intention, built with quality, and priced for our community.
              </p>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-6">
              {[
                { val: '2', label: 'Founders' },
                { val: '8+', label: 'Products' },
                { val: '58', label: 'Wilayas' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl font-black text-primary font-mono">{stat.val}</div>
                  <p className="text-xs text-sand/50 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-square bg-charcoal2 rounded-sm border border-white/10 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-5">
                <div
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 6 C 12 24, 12 42, 25 53 C 18 42, 20 30, 30 23 C 40 30, 42 42, 35 53 C 48 42, 48 24, 30 6 Z' fill='%23C1272D'/%3E%3C/svg%3E")`,
                    backgroundSize: '60px 60px',
                  }}
                  className="absolute inset-0"
                />
              </div>
              <div className="text-center relative z-10">
                <div className="text-8xl font-black text-primary/20 mb-4">A</div>
                <p className="text-sm font-mono text-sand/30 tracking-[0.3em]">SIDI BEL ABBÈS</p>
                <p className="text-[10px] font-mono text-sand/20 mt-1">EST. 2024</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const router = useRouter();
  const products = useStore((state) => state.products);
  const addProduct = useStore((state) => state.addProduct);

  useEffect(() => {
    if (products.length === 0) {
      SAMPLE_PRODUCTS.forEach((product) => {
        addProduct(product);
      });
    }
  }, [products.length, addProduct]);

  return (
    <main className="bg-background min-h-screen relative">
      <AnimatedBackground />
      <Header />
      <Hero />
      <FeaturedSection />
      <BrandStorySection />

      {/* Footer */}
      <footer className="bg-charcoal text-sand py-12 border-t border-white/10 relative">
        <button
          onClick={() => router.push('/admin')}
          aria-label="Admin"
          className="absolute bottom-4 left-4 w-3 h-3 rounded-full bg-white/5 hover:bg-white/10 transition-colors opacity-20 hover:opacity-40"
        />

        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-black text-lg mb-4">A.SMILE</h3>
              <p className="text-sm text-sand/60 leading-relaxed">
                Premium Algerian streetwear celebrating culture and confidence. Designed in Sidi Bel Abbès.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-xs uppercase tracking-wider text-sand/40">Shop</h4>
              <ul className="space-y-2 text-sm text-sand/60">
                <li><Link href="/shop" className="hover:text-primary transition-colors">All Products</Link></li>
                <li><Link href="/shop?category=Scorpion" className="hover:text-primary transition-colors">Scorpion Collection</Link></li>
                <li><Link href="/shop?category=USMBA" className="hover:text-primary transition-colors">USMBA Heritage</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-xs uppercase tracking-wider text-sand/40">Support</h4>
              <ul className="space-y-2 text-sm text-sand/60">
                <li><Link href="/cart" className="hover:text-primary transition-colors">Cart</Link></li>
                <li><Link href="/checkout" className="hover:text-primary transition-colors">Checkout</Link></li>
                <li><span className="text-sand/30">Contact Coming Soon</span></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-xs uppercase tracking-wider text-sand/40">Legal</h4>
              <ul className="space-y-2 text-sm text-sand/60">
                <li><span className="text-sand/30">Privacy Policy</span></li>
                <li><span className="text-sand/30">Terms of Service</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-sand/40">&copy; 2026 A.SMILE. All rights reserved.</p>
            <p className="text-[10px] font-mono text-sand/20 tracking-wider">DESIGNED IN ALGÉRIA</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
