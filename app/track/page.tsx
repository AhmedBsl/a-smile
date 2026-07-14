'use client';

import { useState } from 'react';
import { Header } from '@/components/header';
import { useStore } from '@/lib/store';
import { CARRIERS, CarrierSlug } from '@/lib/delivery/carriers';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Package, Truck, Check, Clock, MapPin, AlertCircle } from 'lucide-react';

interface TrackingEvent {
  date: string;
  status: string;
  location?: string;
  details?: string;
}

interface TrackingResult {
  carrier: CarrierSlug;
  trackingNumber: string;
  status: 'pending' | 'in-transit' | 'delivered' | 'returned' | 'unknown';
  statusLabel: string;
  events: TrackingEvent[];
}

const STATUS_CONFIG = {
  pending: { color: 'text-yellow-600', bg: 'bg-yellow-50', icon: Clock, label: 'قيد الانتظار' },
  'in-transit': { color: 'text-blue-600', bg: 'bg-blue-50', icon: Truck, label: 'في الطريق' },
  delivered: { color: 'text-green-600', bg: 'bg-green-50', icon: Check, label: 'تم التوصيل' },
  returned: { color: 'text-red-600', bg: 'bg-red-50', icon: AlertCircle, label: 'مرتجع' },
  unknown: { color: 'text-gray-600', bg: 'bg-gray-50', icon: Package, label: 'غير معروف' },
};

export default function TrackPage() {
  const orders = useStore((state) => state.orders);
  const [trackingInput, setTrackingInput] = useState('');
  const [selectedCarrier, setSelectedCarrier] = useState<CarrierSlug | ''>('');
  const [trackingResult, setTrackingResult] = useState<TrackingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const localOrder = orders.find((o) => o.id === trackingInput.trim());

  const handleTrack = async () => {
    if (!trackingInput.trim() || !selectedCarrier) return;
    setLoading(true);
    setError('');
    setTrackingResult(null);

    try {
      const res = await fetch('/api/delivery/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ carrier: selectedCarrier, trackingNumber: trackingInput.trim() }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setTrackingResult(data);
      }
    } catch {
      setError('خطأ في الشبكة — تعذر الاتصال بخدمة التتبع');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-background min-h-screen">
      <Header />
      <div className="border-b border-border bg-white">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl md:text-3xl font-black text-foreground">تتبع الطلب</h1>
          <p className="text-sm text-muted-foreground mt-1">أدخلي رقم التتبع لمعرفة حالة طلبك</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-card border border-border rounded-2xl p-6 mb-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-2">شركة التوصيل</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CARRIERS.map((carrier) => (
                  <button
                    key={carrier.slug}
                    onClick={() => setSelectedCarrier(carrier.slug)}
                    className={`flex items-center gap-2 p-3 border rounded-xl text-sm font-bold transition-all ${
                      selectedCarrier === carrier.slug
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border hover:border-primary/30'
                    }`}
                  >
                    <span>{carrier.logo}</span>
                    <span className="truncate">{carrier.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">رقم التتبع</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={trackingInput}
                  onChange={(e) => setTrackingInput(e.target.value)}
                  placeholder="أدخلي رقم التتبع أو رقم الطلب"
                  className="flex-1 px-4 py-3 border border-border rounded-xl bg-background font-mono text-sm focus:outline-none focus:border-primary"
                  onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
                />
                <button
                  onClick={handleTrack}
                  disabled={!trackingInput.trim() || !selectedCarrier || loading}
                  className="px-6 py-3 bg-primary text-white font-bold rounded-xl flex items-center gap-2 disabled:opacity-50 hover:bg-redDim transition-colors"
                >
                  <Search className="w-4 h-4" />
                  {loading ? 'جارِ التتبع...' : 'تتبع'}
                </button>
              </div>
            </div>

            {localOrder?.carrier && localOrder?.trackingNumber && (
              <button
                onClick={() => {
                  setSelectedCarrier(localOrder.carrier!);
                  setTrackingInput(localOrder.trackingNumber!);
                }}
                className="w-full text-right p-3 bg-pink-50 border border-pink-100 rounded-xl text-sm"
              >
                <p className="text-primary font-bold">تم العثور على الطلب {localOrder.id}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {CARRIERS.find((c) => c.slug === localOrder.carrier)?.name} — #{localOrder.trackingNumber}
                  <span className="text-primary mr-2">اضغطي للتتبع</span>
                </p>
              </button>
            )}
          </div>

          {error && (
            <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-xl">
              <p className="text-sm text-destructive font-semibold">{error}</p>
            </div>
          )}
        </div>

        <AnimatePresence>
          {trackingResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-2xl overflow-hidden"
            >
              <div className={`p-6 ${STATUS_CONFIG[trackingResult.status].bg}`}>
                <div className="flex items-center gap-4">
                  {(() => {
                    const config = STATUS_CONFIG[trackingResult.status];
                    const Icon = config.icon;
                    return (
                      <>
                        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white shadow-sm">
                          <Icon className={`w-6 h-6 ${config.color}`} />
                        </div>
                        <div>
                          <p className={`text-lg font-black ${config.color}`}>{config.label}</p>
                          <p className="text-sm text-muted-foreground font-mono">#{trackingResult.trackingNumber}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {CARRIERS.find((c) => c.slug === trackingResult.carrier)?.name}
                          </p>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-sm font-black text-muted-foreground mb-4">سجل التتبع</h3>
                {trackingResult.events.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">لا توجد أحداث تتبع بعد</p>
                ) : (
                  <div className="space-y-4">
                    {[...trackingResult.events].reverse().map((event, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-3 h-3 rounded-full bg-primary shrink-0" />
                          {index < trackingResult.events.length - 1 && (
                            <div className="w-px flex-1 bg-border mt-1" />
                          )}
                        </div>
                        <div className="pb-4">
                          <p className="text-sm font-bold">{event.status}</p>
                          <p className="text-xs text-muted-foreground font-mono">{event.date}</p>
                          {event.location && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                              <MapPin className="w-3 h-3" />
                              {event.location}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
