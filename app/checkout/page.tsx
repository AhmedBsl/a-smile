'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/header';
import { useStore } from '@/lib/store';
import { WILAYAS } from '@/lib/sample-data';
import { formatDZD } from '@/lib/format';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Banknote } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const cart = useStore((state) => state.cart);
  const createOrder = useStore((state) => state.createOrder);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    wilaya: '',
    commune: '',
    notes: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedWilaya = WILAYAS.find((w) => w.id === formData.wilaya);
  const communes = selectedWilaya?.communes || [];

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = selectedWilaya?.homeDelivery ?? 0;
  const total = subtotal + shipping;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.wilaya) newErrors.wilaya = 'Wilaya is required';
    if (!formData.commune) newErrors.commune = 'Commune is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const orderId = `ORD-${Date.now()}`;
    const order = {
      id: orderId,
      items: cart,
      total,
      status: 'pending' as const,
      customerName: formData.fullName,
      customerEmail: formData.email,
      customerPhone: formData.phone,
      address: '',
      wilaya: selectedWilaya?.name || formData.wilaya,
      commune: formData.commune,
      createdAt: new Date().toISOString(),
      notes: formData.notes,
    };

    createOrder(order);
    setSubmitted(true);
    setTimeout(() => router.push(`/order/${orderId}`), 2000);
  };

  if (cart.length === 0) {
    return (
      <main className="bg-background min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Your cart is empty</h1>
          <Link href="/shop" className="text-primary hover:underline font-bold">
            Continue shopping
          </Link>
        </div>
      </main>
    );
  }

  if (submitted) {
    return (
      <main className="bg-background min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-flex mb-4 w-20 h-20 bg-primary text-white rounded-sm items-center justify-center"
          >
            <Check className="w-10 h-10" />
          </motion.div>
          <h1 className="text-3xl font-black text-foreground mb-2">Order placed!</h1>
          <p className="text-muted-foreground">Pay cash on delivery. Redirecting...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-background min-h-screen">
      <Header />
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-black text-foreground">Checkout</h1>
          <p className="text-sm text-muted-foreground mt-1">Cash on delivery — all 58 wilayas</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
            <div className="bg-card border border-border rounded-sm p-6 space-y-4">
              <h2 className="font-black text-lg">Delivery details</h2>

              <div>
                <label className="block text-sm font-bold mb-2">Full name *</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className={`w-full px-4 py-2.5 border rounded-sm bg-background ${errors.fullName ? 'border-destructive' : 'border-border'}`}
                  placeholder="Your full name"
                />
                {errors.fullName && <p className="text-xs text-destructive mt-1">{errors.fullName}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2">Phone *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`w-full px-4 py-2.5 border rounded-sm bg-background ${errors.phone ? 'border-destructive' : 'border-border'}`}
                    placeholder="05XX XX XX XX"
                  />
                  {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Email (optional)</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full px-4 py-2.5 border rounded-sm bg-background ${errors.email ? 'border-destructive' : 'border-border'}`}
                    placeholder="you@email.com"
                  />
                  {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2">Wilaya *</label>
                  <select
                    value={formData.wilaya}
                    onChange={(e) =>
                      setFormData({ ...formData, wilaya: e.target.value, commune: '' })
                    }
                    className={`w-full px-4 py-2.5 border rounded-sm bg-background ${errors.wilaya ? 'border-destructive' : 'border-border'}`}
                  >
                    <option value="">Select wilaya</option>
                    {WILAYAS.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                  {errors.wilaya && <p className="text-xs text-destructive mt-1">{errors.wilaya}</p>}
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Commune *</label>
                  <select
                    value={formData.commune}
                    onChange={(e) => setFormData({ ...formData, commune: e.target.value })}
                    disabled={!formData.wilaya}
                    className={`w-full px-4 py-2.5 border rounded-sm bg-background disabled:opacity-50 ${errors.commune ? 'border-destructive' : 'border-border'}`}
                  >
                    <option value="">Select commune</option>
                    {communes.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  {errors.commune && <p className="text-xs text-destructive mt-1">{errors.commune}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Order note (optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2.5 border border-border rounded-sm bg-background"
                  placeholder="Delivery instructions..."
                />
              </div>
            </div>

            <div className="bg-card border border-border rounded-sm p-6">
              <h2 className="font-black text-lg mb-3 flex items-center gap-2">
                <Banknote className="w-5 h-5 text-primary" />
                Payment
              </h2>
              <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-sm">
                <div className="w-4 h-4 rounded-full border-4 border-primary bg-primary" />
                <div>
                  <p className="font-bold text-sm">Cash on delivery</p>
                  <p className="text-xs text-muted-foreground">Pay when your order arrives</p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-white py-4 font-black text-lg rounded-sm flex items-center justify-center gap-2 hover:bg-redDim transition-colors"
            >
              Place order — {formatDZD(total)}
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-card border border-border p-6 rounded-sm">
              <h2 className="font-black text-lg mb-4">Order summary</h2>
              <div className="space-y-3 mb-4 pb-4 border-b border-border max-h-64 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span className="font-semibold truncate mr-2">
                      {item.name} ×{item.quantity}
                    </span>
                    <span className="font-mono shrink-0">{formatDZD(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2 text-sm mb-4 pb-4 border-b border-border">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-mono">{formatDZD(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="font-mono">
                    {formData.wilaya ? formatDZD(shipping) : 'Select wilaya'}
                  </span>
                </div>
                {selectedWilaya && (
                  <p className="text-xs text-muted-foreground">
                    Est. {selectedWilaya.days} days to {selectedWilaya.name}
                  </p>
                )}
              </div>
              <div className="flex justify-between items-center">
                <span className="font-black">Total (COD)</span>
                <span className="text-2xl font-black text-primary font-mono">{formatDZD(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
