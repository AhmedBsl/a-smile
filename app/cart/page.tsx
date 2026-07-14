'use client';

import { Header } from '@/components/header';
import { useStore } from '@/lib/store';
import { formatDZD } from '@/lib/format';
import { motion } from 'framer-motion';
import { Trash2, Minus, Plus, ArrowLeft, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function CartPage() {
  const cart = useStore((state) => state.cart);
  const removeFromCart = useStore((state) => state.removeFromCart);
  const updateCartItem = useStore((state) => state.updateCartItem);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (cart.length === 0) {
    return (
      <main className="bg-background min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-black text-foreground mb-2">سلتك فارغة</h1>
          <p className="text-muted-foreground mb-6">لم تضيفي أي منتجات بعد</p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-full font-bold hover:bg-redDim transition-colors"
          >
            تسوقي الآن
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-background min-h-screen">
      <Header />

      <div className="border-b border-border bg-white">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl md:text-3xl font-black text-foreground">سلة المشتريات</h1>
          <p className="text-sm text-muted-foreground mt-1">{cart.length} منتج في السلة</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item, index) => (
              <motion.div
                key={item.productId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card border border-border rounded-2xl p-4 flex gap-4"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 md:w-24 md:h-24 rounded-xl object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-foreground text-sm md:text-base truncate">{item.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    {item.size && <span>المقاس: {item.size}</span>}
                    {item.color && <span>· اللون: {item.color}</span>}
                  </div>
                  <p className="font-black text-primary font-mono mt-2">{formatDZD(item.price)}</p>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-2 bg-muted rounded-full px-2 py-1">
                    <button
                      onClick={() => updateCartItem(item.productId, item.quantity - 1)}
                      className="p-1 hover:bg-white rounded-full transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateCartItem(item.productId, item.quantity + 1)}
                      className="p-1 hover:bg-white rounded-full transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="font-black text-lg mb-4">ملخص الطلب</h2>
              <div className="space-y-3 mb-4 pb-4 border-b border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">المجموع الفرعي</span>
                  <span className="font-mono font-bold">{formatDZD(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">التوصيل</span>
                  <span className="text-xs text-primary font-bold">يُحسب عند الطلب</span>
                </div>
              </div>
              <div className="flex justify-between items-center mb-6">
                <span className="font-black">المجموع</span>
                <span className="text-2xl font-black text-primary font-mono">{formatDZD(subtotal)}</span>
              </div>
              <Link
                href="/checkout"
                className="w-full bg-primary text-white py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:bg-redDim transition-colors text-center"
              >
                المتابعة للطلب
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
