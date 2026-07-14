'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/header';
import { useStore } from '@/lib/store';
import { ALL_WILAYAS } from '@/lib/sample-data';
import { formatDZD } from '@/lib/format';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Banknote, Truck, MapPin, Tag, Home, Building } from 'lucide-react';

const PROMO_CODES: Record<string, number> = {
  'WELCOME10': 10,
  'MELINA': 15,
  'FEMME20': 20,
};

export default function CheckoutPage() {
  const router = useRouter();
  const cart = useStore((state) => state.cart);
  const createOrder = useStore((state) => state.createOrder);

  const [formData, setFormData] = useState({
    phone: '',
    wilaya: '',
    commune: '',
    deliveryType: 'home' as 'home' | 'office',
    promoCode: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedWilaya = ALL_WILAYAS.find((w) => w.id === formData.wilaya);
  const shipping = selectedWilaya
    ? formData.deliveryType === 'home'
      ? selectedWilaya.homeDelivery
      : selectedWilaya.stopDesk
    : 0;
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = PROMO_CODES[formData.promoCode.toUpperCase()] || 0;
  const discountAmount = Math.round(subtotal * discount / 100);
  const total = subtotal + shipping - discountAmount;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.phone.trim()) newErrors.phone = 'رقم الهاتف مطلوب';
    else if (!/^(05|06|07)\d{8}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'رقم الهاتف غير صحيح';
    }
    if (!formData.wilaya) newErrors.wilaya = 'اختر الولاية';
    if (!formData.commune) newErrors.commune = 'اختر البلدية';
    if (formData.promoCode && !PROMO_CODES[formData.promoCode.toUpperCase()]) {
      newErrors.promoCode = 'رمز الترويجي غير صحيح';
    }
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
      customerName: 'عميل',
      customerEmail: '',
      customerPhone: formData.phone,
      address: '',
      wilaya: selectedWilaya?.name || formData.wilaya,
      commune: formData.commune,
      createdAt: new Date().toISOString(),
      shippingCost: shipping,
      carrierPricing: formData.deliveryType === 'home' ? 'home-delivery' as const : 'stop-desk' as const,
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
          <h1 className="text-2xl font-bold text-foreground mb-4">سلتك فارغة</h1>
          <Link href="/shop" className="text-primary hover:underline font-bold">المتابعة للتسوق</Link>
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
            className="inline-flex mb-4 w-20 h-20 bg-primary text-white rounded-full items-center justify-center"
          >
            <Check className="w-10 h-10" />
          </motion.div>
          <h1 className="text-3xl font-black text-foreground mb-2">تم الطلب بنجاح!</h1>
          <p className="text-muted-foreground">ادفعي عند الاستلام. جارِ التحويل...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-background min-h-screen">
      <Header />
      <div className="border-b border-border bg-white">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl md:text-3xl font-black text-foreground">إتمام الطلب</h1>
          <p className="text-sm text-muted-foreground mt-1">الدفع عند الاستلام — جميع الولايات الـ 58</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
            {/* Phone */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <h2 className="font-black text-lg flex items-center gap-2">
                <span className="bg-primary text-white w-7 h-7 rounded-full flex items-center justify-center text-sm">1</span>
                رقم الهاتف
              </h2>
              <div>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-xl bg-background text-sm ${errors.phone ? 'border-destructive' : 'border-border'} focus:outline-none focus:border-primary`}
                  placeholder="05XX XX XX XX"
                  dir="ltr"
                />
                {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
              </div>
            </div>

            {/* Location */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <h2 className="font-black text-lg flex items-center gap-2">
                <span className="bg-primary text-white w-7 h-7 rounded-full flex items-center justify-center text-sm">2</span>
                عنوان التوصيل
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1.5">الولاية *</label>
                  <select
                    value={formData.wilaya}
                    onChange={(e) => setFormData({ ...formData, wilaya: e.target.value, commune: '' })}
                    className={`w-full px-4 py-3 border rounded-xl bg-background text-sm ${errors.wilaya ? 'border-destructive' : 'border-border'} focus:outline-none focus:border-primary`}
                  >
                    <option value="">اختر الولاية</option>
                    {ALL_WILAYAS.map((w) => (
                      <option key={w.id} value={w.id}>{w.id} - {w.name}</option>
                    ))}
                  </select>
                  {errors.wilaya && <p className="text-xs text-destructive mt-1">{errors.wilaya}</p>}
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1.5">البلدية *</label>
                  <input
                    type="text"
                    value={formData.commune}
                    onChange={(e) => setFormData({ ...formData, commune: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-xl bg-background text-sm ${errors.commune ? 'border-destructive' : 'border-border'} focus:outline-none focus:border-primary`}
                    placeholder="اسم البلدية"
                  />
                  {errors.commune && <p className="text-xs text-destructive mt-1">{errors.commune}</p>}
                </div>
              </div>

              {/* Delivery Type */}
              <div>
                <label className="block text-sm font-bold mb-2">نوع التوصيل</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, deliveryType: 'home' })}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                      formData.deliveryType === 'home'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/30'
                    }`}
                  >
                    <Home className={`w-5 h-5 ${formData.deliveryType === 'home' ? 'text-primary' : 'text-muted-foreground'}`} />
                    <div className="text-right">
                      <p className="font-bold text-sm">توصيل للمنزل</p>
                      {selectedWilaya && (
                        <p className="text-xs text-muted-foreground">{formatDZD(selectedWilaya.homeDelivery)}</p>
                      )}
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, deliveryType: 'office' })}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                      formData.deliveryType === 'office'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/30'
                    }`}
                  >
                    <Building className={`w-5 h-5 ${formData.deliveryType === 'office' ? 'text-primary' : 'text-muted-foreground'}`} />
                    <div className="text-right">
                      <p className="font-bold text-sm">مكتب التوصيل</p>
                      {selectedWilaya && (
                        <p className="text-xs text-muted-foreground">{formatDZD(selectedWilaya.stopDesk)}</p>
                      )}
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Promo Code */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="font-black text-lg flex items-center gap-2 mb-4">
                <Tag className="w-5 h-5 text-primary" />
                رمز ترويجي
              </h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.promoCode}
                  onChange={(e) => setFormData({ ...formData, promoCode: e.target.value })}
                  className={`flex-1 px-4 py-3 border rounded-xl bg-background text-sm uppercase ${errors.promoCode ? 'border-destructive' : 'border-border'} focus:outline-none focus:border-primary`}
                  placeholder="أدخل الرمز"
                />
                {formData.promoCode && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, promoCode: '' })}
                    className="px-4 py-3 border border-border rounded-xl text-sm font-bold hover:bg-muted"
                  >
                    حذف
                  </button>
                )}
              </div>
              {errors.promoCode && <p className="text-xs text-destructive mt-1">{errors.promoCode}</p>}
              {discount > 0 && (
                <p className="text-xs text-green-600 font-bold mt-2">✓ تم تطبيق خصم {discount}%!</p>
              )}
            </div>

            {/* Payment */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="font-black text-lg mb-3 flex items-center gap-2">
                <Banknote className="w-5 h-5 text-primary" />
                الدفع
              </h2>
              <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl">
                <div className="w-4 h-4 rounded-full border-4 border-primary bg-primary" />
                <div>
                  <p className="font-bold text-sm">الدفع عند الاستلام</p>
                  <p className="text-xs text-muted-foreground">ادفعي عند وصول الطلب</p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-white py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:bg-redDim transition-colors animate-pulse-btn"
            >
              أطلب الآن — {formatDZD(total)}
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          {/* Order Summary */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-card border border-border p-6 rounded-2xl">
              <h2 className="font-black text-lg mb-4">ملخص الطلب</h2>
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
                  <span className="text-muted-foreground">المجموع الفرعي</span>
                  <span className="font-mono">{formatDZD(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">التوصيل ({formData.deliveryType === 'home' ? 'للمنزل' : 'مكتب'})</span>
                  <span className="font-mono">
                    {formData.wilaya ? formatDZD(shipping) : 'اختر الولاية'}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="font-bold">خصم ({discount}%)</span>
                    <span className="font-mono font-bold">-{formatDZD(discountAmount)}</span>
                  </div>
                )}
                {selectedWilaya && (
                  <p className="text-xs text-muted-foreground">
                    التوصيل خلال {selectedWilaya.days} أيام
                  </p>
                )}
              </div>
              <div className="flex justify-between items-center">
                <span className="font-black">الإجمالي (COD)</span>
                <span className="text-2xl font-black text-primary font-mono">{formatDZD(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
