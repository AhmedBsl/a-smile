'use client';

import { Header } from '@/components/header';
import { Hero } from '@/components/hero';
import { HeroShowcase } from '@/components/hero-showcase';
import { useStore } from '@/lib/store';
import { COLLECTIONS } from '@/lib/sample-data';
import { formatDZD } from '@/lib/format';
import { motion } from 'framer-motion';
import { Star, ShoppingBag, Heart, ArrowLeft, Users, Send } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

function FeaturedSection() {
  const products = useStore((state) => state.products);
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-black text-foreground mb-3"
          >
            المنتجات المميزة
          </motion.h2>
          <p className="text-muted-foreground">اختياراتنا لكِ — أجدد المنتجات وأكثرها رواجاً</p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">سيظهر هنا المنتجات بعد إضافتها من لوحة التحكم</p>
          </div>
        ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                href={`/product/${product.id}`}
                className="group block bg-card rounded-2xl border border-border overflow-hidden hover:shadow-xl hover:shadow-pink-100/50 transition-all"
              >
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {product.oldPrice && product.oldPrice > product.price && (
                    <div className="absolute top-3 right-3 bg-primary text-white text-xs font-black px-2.5 py-1 rounded-full">
                      -{Math.round((1 - product.price / product.oldPrice) * 100)}%
                    </div>
                  )}
                  <button className="absolute top-3 left-3 p-2 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white">
                    <Heart className="w-4 h-4 text-primary" />
                  </button>
                </div>

                <div className="p-4">
                  {/* Rating */}
                  {product.rating && (
                    <div className="flex items-center gap-1 mb-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${i < Math.floor(product.rating!) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                        />
                      ))}
                      <span className="text-xs text-muted-foreground mr-1">{product.rating}</span>
                    </div>
                  )}

                  <h3 className="font-bold text-foreground text-sm mb-2 line-clamp-2 min-h-[2.5rem]">
                    {product.name}
                  </h3>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-black text-primary text-lg font-mono">{formatDZD(product.price)}</span>
                    {product.oldPrice && product.oldPrice > product.price && (
                      <span className="text-sm text-muted-foreground line-through font-mono">{formatDZD(product.oldPrice)}</span>
                    )}
                  </div>

                  <button className="w-full bg-primary text-white py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-redDim transition-colors">
                    <ShoppingBag className="w-4 h-4" />
                    أطلب الآن
                  </button>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
        )}

        <div className="text-center mt-10">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 border-2 border-primary text-primary px-8 py-3 rounded-full font-bold hover:bg-primary hover:text-white transition-all"
          >
            عرض جميع المنتجات
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function CollabsSection() {
  const [formData, setFormData] = useState({
    name: '',
    handle: '',
    link: '',
    followers: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setFormData({ name: '', handle: '', link: '', followers: '', message: '' });
  };

  const ambassadors = [
    { name: 'سارة م.', handle: '@sara_style_dz', followers: '45K', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop' },
    { name: 'ليلى ب.', handle: '@layla_beauty', followers: '32K', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop' },
    { name: 'نورا ك.', handle: '@nora_chic', followers: '28K', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop' },
    { name: 'مريم ع.', handle: '@mريم_modest', followers: '51K', image: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=200&h=200&fit=crop' },
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-pink-50 to-rose-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 bg-white text-primary px-4 py-1.5 rounded-full text-sm font-bold mb-4 shadow-sm">
              <Users className="w-4 h-4" />
              فريق سفيرة الماركات
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-foreground mb-3">
              التعاون والشراكات
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              انضمي إلى فريق سفيراتنا واحصلي على خصومات حصرية ومنتجات مجانية
            </p>
          </motion.div>
        </div>

        {/* Ambassador Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {ambassadors.map((amb, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl p-4 text-center border border-pink-100 hover:shadow-lg transition-all"
            >
              <img
                src={amb.image}
                alt={amb.name}
                className="w-16 h-16 rounded-full mx-auto mb-3 object-cover border-2 border-pink-200"
              />
              <p className="font-bold text-foreground text-sm">{amb.name}</p>
              <p className="text-xs text-primary font-bold">{amb.handle}</p>
              <p className="text-xs text-muted-foreground mt-1">{amb.followers} متابع</p>
            </motion.div>
          ))}
        </div>

        {/* Apply Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-xl mx-auto bg-white rounded-2xl p-8 shadow-lg border border-pink-100"
        >
          <h3 className="font-black text-lg text-foreground mb-6 text-center">قدمي الآن للتعاون</h3>
          
          {submitted ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8 text-primary" />
              </div>
              <p className="font-bold text-foreground">تم إرسال طلبك بنجاح!</p>
              <p className="text-sm text-muted-foreground mt-1">سنتواصل معك قريباً</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1.5">الاسم الكامل</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-sm focus:outline-none focus:border-primary"
                    placeholder="اسمك الكامل"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1.5">الحساب</label>
                  <input
                    type="text"
                    value={formData.handle}
                    onChange={(e) => setFormData({ ...formData, handle: e.target.value })}
                    className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-sm focus:outline-none focus:border-primary"
                    placeholder="@username"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1.5">رابط الحساب</label>
                  <input
                    type="url"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-sm focus:outline-none focus:border-primary"
                    placeholder="https://instagram.com/..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1.5">عدد المتابعين</label>
                  <input
                    type="text"
                    value={formData.followers}
                    onChange={(e) => setFormData({ ...formData, followers: e.target.value })}
                    className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-sm focus:outline-none focus:border-primary"
                    placeholder="مثال: 10K"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1.5">رسالة للتعاون</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-sm focus:outline-none focus:border-primary resize-none"
                  placeholder="أخبرينا عن نفسك وعن كيفية تعاونك معنا..."
                />
              </div>
              <button
                type="submit"
                className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-redDim transition-colors"
              >
                إرسال الطلب
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-charcoal text-sand py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-black text-lg mb-4 text-white">MELINA CHIC</h3>
            <p className="text-sm text-sand/60 leading-relaxed">
              متجر الأناقة العصرية للمرأة الجزائرية — أحجية، ماكياج، وإطلالة مميزة
            </p>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-4 text-white">المتجر</h4>
            <ul className="space-y-2 text-sm text-sand/60">
              <li><Link href="/shop" className="hover:text-primary transition-colors">جميع المنتجات</Link></li>
              <li><Link href="/shop?category=hijabs" className="hover:text-primary transition-colors">حجابات</Link></li>
              <li><Link href="/shop?category=shoes" className="hover:text-primary transition-colors">أحذية</Link></li>
              <li><Link href="/shop?category=makeup" className="hover:text-primary transition-colors">ماكياج</Link></li>
              <li><Link href="/shop?category=sunglasses" className="hover:text-primary transition-colors">نظارات شمسية</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-4 text-white">المساعدة</h4>
            <ul className="space-y-2 text-sm text-sand/60">
              <li><Link href="/track" className="hover:text-primary transition-colors">تتبع الطلب</Link></li>
              <li><Link href="/cart" className="hover:text-primary transition-colors">سلة المشتريات</Link></li>
              <li><span className="hover:text-primary transition-colors cursor-pointer">الأسئلة الشائعة</span></li>
              <li><span className="hover:text-primary transition-colors cursor-pointer">سياسة الإرجاع</span></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-4 text-white">تواصل معنا</h4>
            <ul className="space-y-2 text-sm text-sand/60">
              <li>البريد: collabs@melinachic.com</li>
              <li>الدعم: support@melinachic.com</li>
              <li className="pt-2">
                <span className="text-xs text-sand/40">توصيل لجميع الولايات الـ 58</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-sand/40">
            © 2026 Melina Chic. جميع الحقوق محفوظة.
          </p>
          <p className="text-xs text-sand/40">صنع بـ ❤ في الجزائر</p>
        </div>
      </div>
    </footer>
  );
}

export default function HomePage() {
  return (
    <main className="bg-background min-h-screen">
      <Header />
      <Hero />
      <HeroShowcase />
      <FeaturedSection />
      <CollabsSection />
      <Footer />
    </main>
  );
}
