'use client';

import { AdminPageShell } from '@/components/admin-page-shell';
import { motion } from 'framer-motion';
import { Mail, Share2, Tag, Percent, MessageSquare, Gift } from 'lucide-react';
import { useState } from 'react';

export default function AdminMarketingPage() {
  const [tab, setTab] = useState<'overview' | 'promos' | 'reviews'>('overview');

  const promoFeatures = [
    { icon: Percent, title: 'Discount Codes', description: 'Create percentage or fixed-amount promo codes for your customers' },
    { icon: Gift, title: 'Seasonal Sales', description: 'Set up time-limited promotions for holidays and events' },
    { icon: Mail, title: 'Email Campaigns', description: 'Send promotional emails to your customer list' },
    { icon: Share2, title: 'Social Media', description: 'Schedule and manage social media posts' },
    { icon: MessageSquare, title: 'Reviews', description: 'Manage customer reviews on your products' },
    { icon: Tag, title: 'Loyalty Rewards', description: 'Reward repeat customers with exclusive deals' },
  ];

  return (
    <AdminPageShell
      title="Marketing"
      subtitle="Manage campaigns, promo codes, and customer reviews."
      actions={
        <div className="flex gap-2">
          {(['overview', 'promos', 'reviews'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-sm font-bold text-sm capitalize transition-colors ${
                tab === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground hover:bg-muted-foreground/20'
              }`}
            >
              {t === 'promos' ? 'Promo Codes' : t === 'reviews' ? 'Reviews' : 'Overview'}
            </button>
          ))}
        </div>
      }
    >
      {tab === 'overview' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {promoFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
                className="bg-card border border-border p-5 rounded-sm hover:border-primary/40 transition-colors"
              >
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-sm flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-black text-sm mb-1">{feature.title}</h3>
                <p className="text-xs text-muted-foreground">{feature.description}</p>
              </motion.div>
            );
          })}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="md:col-span-2 lg:col-span-3 bg-card border-2 border-dashed border-primary/30 p-12 rounded-sm text-center mt-4"
          >
            <p className="text-2xl font-black text-foreground mb-2">Coming Soon</p>
            <p className="text-sm text-muted-foreground">Advanced marketing tools and automation are being prepared.</p>
          </motion.div>
        </motion.div>
      )}

      {tab === 'promos' && (
        <div className="bg-card border border-border rounded-sm p-12 text-center">
          <Tag className="w-12 h-12 text-primary/30 mx-auto mb-4" />
          <p className="text-xl font-black text-foreground mb-2">No promo codes yet</p>
          <p className="text-sm text-muted-foreground mb-4">Create your first promo code to offer discounts to customers.</p>
          <button className="bg-primary text-primary-foreground px-6 py-2.5 font-bold rounded-sm text-sm">
            Create Promo Code
          </button>
        </div>
      )}

      {tab === 'reviews' && (
        <div className="bg-card border border-border rounded-sm p-12 text-center">
          <MessageSquare className="w-12 h-12 text-primary/30 mx-auto mb-4" />
          <p className="text-xl font-black text-foreground mb-2">No reviews yet</p>
          <p className="text-sm text-muted-foreground mb-4">Customer reviews will appear here once they leave feedback on your products.</p>
          <button className="bg-primary text-primary-foreground px-6 py-2.5 font-bold rounded-sm text-sm">
            Add Manual Review
          </button>
        </div>
      )}
    </AdminPageShell>
  );
}
