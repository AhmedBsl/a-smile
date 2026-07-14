'use client';

import Link from 'next/link';
import { Header } from '@/components/header';
import { useStore } from '@/lib/store';
import { CARRIERS } from '@/lib/delivery/carriers';
import { motion } from 'framer-motion';
import { formatDZD } from '@/lib/format';
import { Check, Truck, Package, ExternalLink } from 'lucide-react';

export default function OrderPage({ params }: { params: { id: string } }) {
  const order = useStore((state) =>
    state.orders.find((o) => o.id === params.id)
  );

  if (!order) {
    return (
      <main className="bg-background min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">الطلب غير موجود</h1>
          <Link href="/shop" className="text-primary hover:underline font-bold">المتابعة للتسوق</Link>
        </div>
      </main>
    );
  }

  const carrier = order.carrier ? CARRIERS.find((c) => c.slug === order.carrier) : null;

  return (
    <main className="bg-background min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="inline-flex mb-4"
            >
              <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center">
                <Check className="w-8 h-8" />
              </div>
            </motion.div>
            <h1 className="text-4xl font-black text-foreground mb-2">تم تأكيد الطلب!</h1>
            <p className="text-lg text-muted-foreground">شكراً لكِ. تم استلام طلبك بنجاح.</p>
          </div>

          <div className="bg-card border border-border p-8 rounded-3xl mb-8">
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div>
                <p className="text-sm text-muted-foreground mb-1">رقم الطلب</p>
                <p className="text-lg font-bold text-foreground font-mono">{order.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">تاريخ الطلب</p>
                <p className="text-lg font-bold text-foreground">
                  {new Date(order.createdAt).toLocaleDateString('ar-DZ')}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">المبلغ الإجمالي</p>
                <p className="text-lg font-bold text-primary font-mono">{formatDZD(order.total)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">الحالة</p>
                <p className="text-lg font-bold text-accent">قيد المعالجة</p>
              </div>
            </div>

            {/* Carrier Info */}
            {carrier && (
              <div className="mb-8 pb-8 border-b border-border">
                <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-primary" />
                  شركة التوصيل
                </h3>
                <div className="p-4 bg-pink-50 border border-pink-100 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{carrier.logo}</span>
                    <div>
                      <p className="font-bold">{carrier.name}</p>
                      {order.trackingNumber && (
                        <p className="text-sm font-mono text-muted-foreground">
                          رقم التتبع: {order.trackingNumber}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="mb-8 pb-8 border-b border-border">
              <h3 className="font-bold text-foreground mb-4">حالة الطلب</h3>
              <div className="space-y-4">
                {[
                  { label: 'تم الطلب', done: true },
                  { label: 'قيد المعالجة', done: order.status !== 'pending' },
                  { label: 'تم الشحن', done: ['shipped', 'delivered'].includes(order.status) },
                  { label: 'تم التوصيل', done: order.status === 'delivered' },
                ].map((step, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step.done ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                    }`}>
                      {step.done ? <Check className="w-4 h-4" /> : <span className="text-xs">{index + 1}</span>}
                    </div>
                    <span className={`text-sm font-bold ${step.done ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Items */}
            <div className="mb-8 pb-8 border-b border-border">
              <h3 className="font-bold text-foreground mb-4">المنتجات</h3>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.productId} className="flex justify-between items-center py-2">
                    <div>
                      <p className="font-bold text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground">الكمية: {item.quantity}</p>
                    </div>
                    <p className="font-bold text-foreground font-mono">{formatDZD(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping */}
            <div>
              <h3 className="font-bold text-foreground mb-4">عنوان التوصيل</h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>{order.commune}, {order.wilaya}</p>
                <p>{order.customerPhone}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/shop">
              <button className="bg-primary text-white px-8 py-3 rounded-full font-bold hover:bg-redDim transition-all">
                المتابعة للتسوق
              </button>
            </Link>
            <button
              onClick={() => window.print()}
              className="border-2 border-primary text-primary px-8 py-3 rounded-full font-bold hover:bg-primary hover:text-white transition-all"
            >
              طباعة الفاتورة
            </button>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
