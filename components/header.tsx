'use client';

import Link from 'next/link';
import { useState, useRef } from 'react';
import { ShoppingBag, Menu, X, Home, Search, Package } from 'lucide-react';
import { useStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ModernLogo } from './modern-logo';
import { formatDZD } from '@/lib/format';

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [logoClicks, setLogoClicks] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const logoTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const cart = useStore((state) => state.cart);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogoClick = () => {
    if (logoTimeoutRef.current) clearTimeout(logoTimeoutRef.current);

    const newClicks = logoClicks + 1;
    setLogoClicks(newClicks);

    logoTimeoutRef.current = setTimeout(() => {
      setLogoClicks(0);
    }, 1000);

    if (newClicks === 3) {
      setLogoClicks(0);
      if (logoTimeoutRef.current) clearTimeout(logoTimeoutRef.current);
      router.push('/admin');
    }
  };

  const navItems = [
    { name: 'الرئيسية', href: '/', icon: Home },
    { name: 'المتجر', href: '/shop', icon: ShoppingBag },
    { name: 'تتبع الطلب', href: '/track', icon: Package },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-border/40 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <button
            onClick={(e) => {
              e.preventDefault();
              handleLogoClick();
            }}
            className="flex items-center gap-3 group"
          >
            <ModernLogo size="md" />
          </button>

          {/* Search Bar - Desktop */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-md mx-8"
          >
            <div className="relative w-full">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن منتج..."
                className="w-full pr-10 pl-4 py-2.5 border border-border rounded-full bg-muted/50 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
              />
            </div>
          </form>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group relative px-4 py-2 text-foreground font-medium text-sm transition-colors duration-300 flex items-center gap-2"
              >
                <item.icon className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity" />
                <span>{item.name}</span>
                <motion.div
                  className="absolute bottom-0 right-0 h-0.5 bg-primary"
                  initial={{ width: 0 }}
                  whileHover={{ width: '100%' }}
                  transition={{ duration: 0.3 }}
                />
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Cart Button */}
            <Link href="/cart" className="relative group">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="p-2.5 rounded-lg hover:bg-muted transition-colors duration-300 relative"
              >
                <ShoppingBag className="w-5 h-5 text-foreground group-hover:text-primary transition-colors duration-300" />
                {cartCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -left-1 bg-primary text-primary-foreground text-xs font-black w-5 h-5 rounded-full flex items-center justify-center shadow-lg"
                  >
                    {cartCount > 99 ? '99+' : cartCount}
                  </motion.div>
                )}
              </motion.div>
              {cartTotal > 0 && (
                <span className="hidden md:block absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-primary whitespace-nowrap">
                  {formatDZD(cartTotal)}
                </span>
              )}
            </Link>

            {/* Mobile Menu Button */}
            <motion.button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2.5 rounded-lg hover:bg-muted transition-colors duration-300"
              aria-label="Toggle menu"
              whileTap={{ scale: 0.95 }}
            >
              <AnimatePresence mode="wait">
                {isOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-5 h-5 text-foreground" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="w-5 h-5 text-foreground" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden border-t border-border/40 overflow-hidden"
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="mb-2">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث عن منتج..."
                    className="w-full pr-10 pl-4 py-2.5 border border-border rounded-full bg-muted/50 text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </form>
              {navItems.map((item) => (
                <motion.div
                  key={item.href}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 20, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link
                    href={item.href}
                    className="group flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors duration-300 font-medium text-foreground"
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon className="w-5 h-5 text-primary" />
                    <span>{item.name}</span>
                  </Link>
                </motion.div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
