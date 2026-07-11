'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Layers,
  Truck,
  Megaphone,
  FileText,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ExternalLink,
  Warehouse,
} from 'lucide-react';
import { useState } from 'react';
import { clearAdminSession } from '@/lib/auth';
import { BrandLogo } from './brand-logo';
import { useStore } from '@/lib/store';

type NavItem = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href?: string;
  badge?: number;
  children?: { label: string; href: string; badge?: number }[];
};

const navSections: { title?: string; items: NavItem[] }[] = [
  {
    items: [
      { icon: ExternalLink, label: 'View Store', href: '/' },
    ],
  },
  {
    title: 'MAIN',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
    ],
  },
  {
    title: 'COMMERCE',
    items: [
      {
        icon: ShoppingCart,
        label: 'Orders',
        children: [
          { label: 'All Orders', href: '/admin/orders' },
          { label: 'Prepare Orders', href: '/admin/orders?tab=prepare' },
        ],
      },
      {
        icon: Package,
        label: 'Products',
        children: [
          { label: 'All Products', href: '/admin/products' },
          { label: 'Stock Manager', href: '/admin/inventory' },
        ],
      },
      { icon: Layers, label: 'Categories', href: '/admin/categories' },
      { icon: Truck, label: 'Delivery', href: '/admin/delivery' },
    ],
  },
  {
    title: 'GROWTH',
    items: [
      {
        icon: Megaphone,
        label: 'Marketing',
        children: [
          { label: 'Promo Codes', href: '/admin/marketing' },
          { label: 'Reviews', href: '/admin/marketing?tab=reviews' },
        ],
      },
      { icon: FileText, label: 'Content', href: '/admin/content' },
      { icon: Users, label: 'Customers', href: '/admin/customers' },
      { icon: BarChart3, label: 'Statistics', href: '/admin/analytics' },
    ],
  },
  {
    title: 'SYSTEM',
    items: [
      { icon: Settings, label: 'Settings', href: '/admin/settings' },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [expanded, setExpanded] = useState<string[]>(['Orders', 'Products']);
  const orders = useStore((s) => s.orders);
  const products = useStore((s) => s.products);

  const newOrders = orders.filter((o) => o.status === 'pending').length;
  const lowStock = products.filter((p) => p.stock < 10).length;

  const handleLogout = () => {
    clearAdminSession();
    router.push('/');
    router.refresh();
  };

  const toggleExpand = (label: string) => {
    setExpanded((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    if (href.includes('?tab=')) {
      const base = href.split('?')[0];
      return pathname === base;
    }
    return pathname.startsWith(href);
  };

  const renderNavItem = (item: NavItem) => {
    const Icon = item.icon;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expanded.includes(item.label);
    const active = item.href
      ? isActive(item.href)
      : item.children?.some((c) => isActive(c.href));

    if (item.label === 'View Store') {
      return (
        <Link
          key={item.label}
          href="/"
          target="_blank"
          onClick={() => setIsOpen(false)}
          className="flex items-center gap-3 px-3 py-2 rounded-sm text-xs font-semibold text-sand/50 hover:text-primary hover:bg-primary/5 transition-colors"
        >
          <Icon className="w-3.5 h-3.5" />
          {item.label}
          <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
        </Link>
      );
    }

    if (hasChildren) {
      return (
        <div key={item.label}>
          <button
            onClick={() => toggleExpand(item.label)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-sm text-sm font-semibold transition-all ${
              active
                ? 'text-sand bg-white/5'
                : 'text-sand/60 hover:text-sand hover:bg-white/5'
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="flex-1 text-left">{item.label}</span>
            {item.label === 'Orders' && newOrders > 0 && (
              <span className="text-[10px] font-mono bg-primary text-white px-1.5 py-0.5 rounded-sm min-w-[18px] text-center">
                {newOrders}
              </span>
            )}
            {item.label === 'Products' && lowStock > 0 && (
              <span className="text-[10px] font-mono bg-venom/20 text-venom px-1.5 py-0.5 rounded-sm min-w-[18px] text-center">
                {lowStock}
              </span>
            )}
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
            />
          </button>
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden ml-4 border-l border-white/10 pl-2 my-1 space-y-0.5"
              >
                {item.children!.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center justify-between px-3 py-1.5 rounded-sm text-xs font-medium transition-colors ${
                      isActive(child.href)
                        ? 'bg-primary text-white'
                        : 'text-sand/40 hover:text-sand hover:bg-white/5'
                    }`}
                  >
                    <span>{child.label}</span>
                    {child.badge !== undefined && child.badge > 0 && (
                      <span className="text-[9px] font-mono bg-primary/20 text-primary px-1 py-0.5 rounded-sm">
                        {child.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    return (
      <Link
        key={item.label}
        href={item.href!}
        onClick={() => setIsOpen(false)}
        className={`flex items-center gap-3 px-3 py-2 rounded-sm text-sm font-semibold transition-all ${
          active
            ? 'bg-primary text-white'
            : 'text-sand/60 hover:text-sand hover:bg-white/5'
        }`}
      >
        <Icon className="w-4 h-4" />
        {item.label}
      </Link>
    );
  };

  return (
    <>
      <div className="lg:hidden fixed top-3 left-3 z-50">
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2.5 bg-charcoal2 border border-white/10 rounded-sm shadow-lg"
          whileTap={{ scale: 0.95 }}
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="w-5 h-5 text-sand" /> : <Menu className="w-5 h-5 text-sand" />}
        </motion.button>
      </div>

      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : undefined }}
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-charcoal flex flex-col transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-white/10">
          <Link href="/admin" className="flex items-center gap-3 group" onClick={() => setIsOpen(false)}>
            <BrandLogo size="sm" />
            <div>
              <p className="font-black text-sm text-sand tracking-tight">A.SMILE</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-venom animate-pulse" />
                <span className="text-[9px] font-mono text-venom uppercase tracking-wider">
                  Store Live
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 px-2 overflow-y-auto">
          {navSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className={sectionIndex > 0 ? 'mt-4' : ''}>
              {section.title && (
                <p className="px-3 mb-2 text-[9px] font-mono font-bold text-sand/30 uppercase tracking-[0.15em]">
                  {section.title}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => renderNavItem(item))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer Stats */}
        <div className="p-3 border-t border-white/10 space-y-2">
          <div className="px-3 py-2 rounded-sm bg-white/5 text-xs text-sand/40 font-mono">
            <div className="flex justify-between">
              <span>Orders</span>
              <span className="text-sand font-bold">{orders.length}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span>Products</span>
              <span className="text-sand font-bold">{products.length}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-sm text-xs font-semibold text-sand/40 hover:text-primary hover:bg-primary/5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Exit Admin
          </button>
        </div>
      </motion.aside>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/60 z-30"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
