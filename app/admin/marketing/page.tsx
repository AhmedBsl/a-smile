'use client';

import { AdminPageShell } from '@/components/admin-page-shell';
import { motion } from 'framer-motion';
import { Mail, Share2, Tag, Percent, MessageSquare, Gift } from 'lucide-react';
import { useState } from 'react';

export default function AdminMarketingPage() {
  const [tab, setTab] = useState<'overview' | 'promos' | 'reviews'>('overview');

  const promoFeatures = [
    { icon: Percent, title: 'أكواد الخصم', description: 'إنشاء أكواد خصم بنسبة مئوية أو مبلغ ثابت لعملائك' },
    { icon: Gift, title: 'التخفيضات الموسمية', description: 'إعداد عروض محددة الوقت للمناسبات والعطلات' },
    { icon: Mail, title: 'حملات البريد الإلكتروني', description: 'إرسال رسائل بريد إلكتروني ترويجية لقائمة عملائك' },
    { icon: Share2, title: 'وسائل التواصل', description: 'جدولة وإدارة منشورات وسائل التواصل الاجتماعي' },
    { icon: MessageSquare, title: 'التقييمات', description: 'إدارة تقييمات العملاء على منتجاتك' },
    { icon: Tag, title: 'مكافآت الولاء', description: 'مكافأة العملاء المتكررين بعروض حصرية' },
  ];

  return (
    <AdminPageShell
      title="التسويق"
      subtitle="إدارة الحملات، أكواد الخصم، وتقييمات العملاء."
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
              {t === 'promos' ? 'أكواد الخصم' : t === 'reviews' ? 'التقييمات' : 'نظرة عامة'}
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
             <p className="text-2xl font-black text-foreground mb-2">قريباً</p>
             <p className="text-sm text-muted-foreground">أدوات التسويق المتقدمة والأتمتة قيد الإعداد.</p>
          </motion.div>
        </motion.div>
      )}

      {tab === 'promos' && (
        <div className="bg-card border border-border rounded-sm p-12 text-center">
          <Tag className="w-12 h-12 text-primary/30 mx-auto mb-4" />
          <p className="text-xl font-black text-foreground mb-2">لا توجد أكواد خصم بعد</p>
          <p className="text-sm text-muted-foreground mb-4">أنشئ أول كود خصم لتقديم تخفيضات للعملاء.</p>
          <button className="bg-primary text-primary-foreground px-6 py-2.5 font-bold rounded-sm text-sm">
            إنشاء كود خصم
          </button>
        </div>
      )}

      {tab === 'reviews' && (
        <div className="bg-card border border-border rounded-sm p-12 text-center">
          <MessageSquare className="w-12 h-12 text-primary/30 mx-auto mb-4" />
          <p className="text-xl font-black text-foreground mb-2">لا توجد تقييمات بعد</p>
          <p className="text-sm text-muted-foreground mb-4">ستظهر تقييمات العملاء هنا بمجرد تركهم ملاحظات على منتجاتك.</p>
          <button className="bg-primary text-primary-foreground px-6 py-2.5 font-bold rounded-sm text-sm">
            إضافة تقييم يدوي
          </button>
        </div>
      )}
    </AdminPageShell>
  );
}
