'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { AdminPageShell } from '@/components/admin-page-shell';
import { motion } from 'framer-motion';
import { Package, AlertTriangle, TrendingDown, BarChart3 } from 'lucide-react';
import { formatDZD } from '@/lib/format';

export default function InventoryPage() {
  const products = useStore((state) => state.products);
  const [sortBy, setSortBy] = useState<'stock' | 'price' | 'name'>('stock');

  const lowStockProducts = products.filter((p) => p.stock < 10);
  const outOfStockProducts = products.filter((p) => p.stock === 0);
  const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);
  const totalItems = products.reduce((sum, p) => sum + p.stock, 0);

  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === 'stock') return a.stock - b.stock;
    if (sortBy === 'price') return b.price - a.price;
    return a.name.localeCompare(b.name);
  });

  return (
    <AdminPageShell
      title="المخزون"
      subtitle="إدارة مستويات مخزون منتجاتك"
    >
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'إجمالي العناصر', value: totalItems.toString(), icon: Package, iconColor: 'text-primary/20' },
          { label: 'قيمة المخزون', value: formatDZD(totalValue), icon: BarChart3, iconColor: 'text-accent/20' },
          { label: 'مخزون منخفض', value: lowStockProducts.length.toString(), icon: AlertTriangle, iconColor: 'text-yellow-500/20', valueColor: 'text-yellow-600' },
          { label: 'نفذ من المخزون', value: outOfStockProducts.length.toString(), icon: TrendingDown, iconColor: 'text-primary/20', valueColor: 'text-primary' },
        ].map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="bg-card border border-border rounded-sm p-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">{kpi.label}</p>
                  <p className={`text-2xl font-black font-mono ${kpi.valueColor || 'text-foreground'}`}>{kpi.value}</p>
                </div>
                <Icon className={`w-10 h-10 ${kpi.iconColor}`} />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Sort Controls */}
      <div className="mb-6 flex gap-2">
          {(['stock', 'price', 'name'] as const).map((option) => (
            <button
              key={option}
              onClick={() => setSortBy(option)}
              className={`px-4 py-2 rounded-sm font-semibold capitalize transition-all text-sm ${
                sortBy === option
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground hover:bg-muted-foreground/20'
              }`}
            >
              {option === 'stock' ? 'المخزون' : option === 'price' ? 'السعر' : 'الاسم'}
          </button>
        ))}
      </div>

      {/* Inventory Table */}
      <div className="bg-card border border-border rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-bold text-foreground">المنتج</th>
                <th className="text-left px-4 py-3 font-bold text-foreground">SKU</th>
                <th className="text-left px-4 py-3 font-bold text-foreground">المخزون</th>
                <th className="text-left px-4 py-3 font-bold text-foreground">السعر</th>
                <th className="text-left px-4 py-3 font-bold text-foreground">القيمة الإجمالية</th>
                <th className="text-left px-4 py-3 font-bold text-foreground">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {sortedProducts.map((product, index) => (
                <motion.tr
                  key={product.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-border hover:bg-muted/40 transition-colors"
                >
                  <td className="px-4 py-3 font-semibold text-foreground">{product.name}</td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{product.id}</td>
                  <td className="px-4 py-3">
                    <span className="font-bold text-foreground font-mono">{product.stock}</span>
                  </td>
                  <td className="px-4 py-3 font-mono">{formatDZD(product.price)}</td>
                  <td className="px-4 py-3 font-semibold font-mono">{formatDZD(product.price * product.stock)}</td>
                  <td className="px-4 py-4">
                    {product.stock === 0 ? (
                      <span className="px-3 py-1 bg-primary/20 text-primary rounded-sm text-xs font-bold">نفذ من المخزون</span>
                    ) : product.stock < 10 ? (
                      <span className="px-3 py-1 bg-yellow-500/20 text-yellow-700 rounded-sm text-xs font-bold">مخزون منخفض</span>
                    ) : (
                      <span className="px-3 py-1 bg-venom/20 text-charcoal rounded-sm text-xs font-bold">متوفر</span>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminPageShell>
  );
}
