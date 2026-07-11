'use client';

import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { HeroShowcase } from './hero-showcase';
import { BrandLogo } from './brand-logo';
import { useRef } from 'react';

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, filter: 'blur(8px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  };

  return (
    <section ref={sectionRef} className="relative bg-background overflow-hidden min-h-[100vh] flex flex-col">
      {/* Animated Background Elements */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 -z-10">
        <div className="absolute top-32 right-1/4 w-[500px] h-[500px] bg-primary/6 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-venom/4 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/3 w-[300px] h-[300px] bg-clay/5 rounded-full blur-[80px]" />
      </motion.div>

      {/* Watermark */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none hidden lg:block">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.5 }}
        >
          <BrandLogo size="lg" className="scale-[5]" />
        </motion.div>
      </div>

      {/* Main Hero Content */}
      <motion.div style={{ y: textY, opacity }} className="container mx-auto px-4 flex-1 flex items-center py-20 md:py-32">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl relative z-10"
        >
          {/* Eyebrow */}
          <motion.div variants={itemVariants} className="mb-8">
            <motion.span
              className="inline-flex items-center gap-2 text-[10px] font-mono tracking-[0.3em] text-primary uppercase border border-primary/20 px-4 py-2 rounded-sm bg-primary/5 backdrop-blur-sm"
              whileHover={{ borderColor: 'rgba(193, 39, 45, 0.4)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-venom animate-pulse" />
              Adel × Abdelillah — Sidi Bel Abbès
            </motion.span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-5xl sm:text-7xl md:text-8xl lg:text-[7rem] font-black text-foreground leading-[0.9] tracking-tight mb-8"
          >
            <span className="block">MADE IN</span>
            <motion.span
              className="block text-primary relative"
              initial={{ backgroundPosition: '0% 50%' }}
              animate={{ backgroundPosition: '100% 50%' }}
              transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }}
              style={{
                backgroundImage: 'linear-gradient(90deg, #C1272D, #8F1E23, #C1272D)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              SIDI BEL ABBÈS
            </motion.span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-base md:text-lg text-muted-foreground max-w-xl leading-relaxed mb-12"
          >
            Streetwear with edge and warmth. The Scorpion Collection, USMBA heritage,
            and the smile in every stitch — clothing people are happy to wear.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3 mb-16">
            <Link
              href="/shop"
              className="group inline-flex items-center justify-center gap-2 bg-primary text-white px-8 py-4 font-black text-sm uppercase tracking-wider hover:bg-redDim transition-all duration-300 rounded-sm"
            >
              Shop Now
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="#featured"
              className="inline-flex items-center justify-center gap-2 border-2 border-foreground/20 text-foreground px-8 py-4 font-bold text-sm uppercase tracking-wider hover:bg-foreground hover:text-background transition-all duration-300 rounded-sm"
            >
              Discover More
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-3 gap-6 max-w-md"
          >
            {[
              { val: '58', label: 'Wilayas shipped' },
              { val: 'COD', label: 'Cash on delivery' },
              { val: '100%', label: 'Local brand' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + i * 0.1 }}
              >
                <div className="text-2xl md:text-3xl font-black text-primary font-mono">
                  {stat.val}
                </div>
                <p className="text-[10px] md:text-xs text-muted-foreground mt-1 uppercase tracking-wide">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-[0.2em]">Scroll</span>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </motion.div>
      </motion.div>

      <HeroShowcase />
    </section>
  );
}
