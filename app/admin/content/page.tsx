'use client';

import { AdminPageShell } from '@/components/admin-page-shell';
import { motion } from 'framer-motion';
import { FileText, Image, Video, Layout, Type, Palette } from 'lucide-react';

export default function AdminContentPage() {
  const contentSections = [
    { icon: Layout, title: 'Hero Section', description: 'Edit the homepage headline, subheadline, and call-to-action labels' },
    { icon: Image, title: 'Product Images', description: 'Manage product photos and gallery images' },
    { icon: Type, title: 'Brand Story', description: 'Edit the about section and brand narrative' },
    { icon: Video, title: 'Lookbook Gallery', description: 'Curate lifestyle images for the homepage showcase' },
    { icon: Palette, title: 'Theme & Colors', description: 'Customize the storefront color scheme and appearance' },
    { icon: FileText, title: 'Static Pages', description: 'Edit shipping, returns, and FAQ pages' },
  ];

  return (
    <AdminPageShell
      title="Content"
      subtitle="Manage pages, images, and media for your storefront."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contentSections.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
              className="bg-card border border-border p-5 rounded-sm hover:border-primary/40 transition-colors cursor-pointer"
            >
              <div className="w-10 h-10 bg-primary/10 text-primary rounded-sm flex items-center justify-center mb-3">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-black text-sm mb-1">{feature.title}</h3>
              <p className="text-xs text-muted-foreground mb-3">{feature.description}</p>
              <button className="bg-primary text-primary-foreground px-4 py-1.5 rounded-sm font-bold text-xs">
                Edit
              </button>
            </motion.div>
          );
        })}
      </div>

    </AdminPageShell>
  );
}
