'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Truck, ShieldCheck, Sparkles } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-gradient-to-bl from-pink-50 via-white to-rose-50">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-pink-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-rose-100/40 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-100/20 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-right"
          >
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-pink-100 text-pink-700 px-4 py-1.5 rounded-full text-sm font-bold mb-6"
            >
              <Sparkles className="w-4 h-4" />
              новая kolekcja 2026
            </motion.div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-foreground leading-tight mb-6">
              <span className="block">أناقتك</span>
              <span className="block text-primary">تبدأ من هنا</span>
            </h1>

            <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto lg:mr-0 lg:ml-auto">
              أحجية أنيقة، ماكياج احترافي، وإطلالة جذابة — كل ما تحتاجينه لتكوني الأفضل
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="/shop"
                className="bg-primary text-white px-8 py-4 rounded-full font-black text-lg hover:bg-redDim transition-all shadow-lg shadow-pink-200 hover:shadow-xl hover:shadow-pink-300 text-center"
              >
                تسوقي الآن
              </Link>
              <Link
                href="/shop?category=hijabs"
                className="border-2 border-primary text-primary px-8 py-4 rounded-full font-black text-lg hover:bg-primary hover:text-white transition-all text-center"
              >
                اكتشفي الحجابات
              </Link>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-8 mt-12 justify-center lg:justify-start">
              {[
                { icon: Truck, label: 'توصيل لـ 58 ولاية' },
                { icon: ShieldCheck, label: 'الدفع عند الاستلام' },
                { icon: Sparkles, label: 'منتجات أصلية' },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <stat.icon className="w-4 h-4 text-primary" />
                  <span className="hidden sm:inline">{stat.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            <div className="relative w-full aspect-square max-w-lg mx-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-200 to-rose-200 rounded-3xl rotate-6 opacity-60" />
              <div className="absolute inset-0 bg-white rounded-3xl shadow-2xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&h=800&fit=crop"
                  alt="Modest fashion"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Floating badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1, type: 'spring' }}
                className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl p-4 border border-border"
              >
                <p className="text-2xl font-black text-primary">-29%</p>
                <p className="text-xs text-muted-foreground font-bold">خصم خاص</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
