'use client';

import { AdminPageShell } from '@/components/admin-page-shell';
import { COLLECTIONS } from '@/lib/sample-data';
import { useStore } from '@/lib/store';
import { motion } from 'framer-motion';
import { Layers } from 'lucide-react';

export default function CategoriesPage() {
  const products = useStore((s) => s.products);

  const categories = COLLECTIONS.map((col) => ({
    name: col.name,
    icon: col.icon,
    slug: col.id,
    count: products.filter((p) => p.category === col.id).length,
  }));

  return (
    <AdminPageShell
      title="التصنيفات"
      subtitle="إدارة مجموعات المنتجات المعروضة في شريط تصفية المتجر."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((cat, index) => (
          <motion.div
            key={cat.slug}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            className="bg-card border border-border rounded-sm p-5 flex items-start gap-4"
          >
            <div className="p-3 rounded-sm bg-primary/10 text-primary shrink-0 text-2xl">
              {cat.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-black text-foreground">{cat.name}</h3>
              <p className="text-sm text-muted-foreground mt-1 font-mono">
                /{cat.slug}
              </p>
              <p className="text-xs text-muted-foreground mt-3">
                {cat.count} {cat.count !== 1 ? 'منتجات' : 'منتج'}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
      <p className="text-sm text-muted-foreground mt-8 p-4 bg-muted/50 rounded-sm border border-border">
        التصنيفات مأخوذة من تشكيلة ماركة Melina Chic. يمكنك تعيين المنتجات لتصنيف عند تعديلها في صفحة المنتجات.
      </p>
    </AdminPageShell>
  );
}
