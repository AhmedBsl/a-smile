'use client';

import Link from 'next/link';
import { Header } from '@/components/header';
import { useStore } from '@/lib/store';
import { motion } from 'framer-motion';
import { formatDZD, formatDate } from '@/lib/format';
import { Check } from 'lucide-react';

export default function OrderPage({ params }: { params: { id: string } }) {
  const order = useStore((state) =>
    state.orders.find((o) => o.id === params.id)
  );

  if (!order) {
    return (
      <main className="bg-background min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Order not found</h1>
          <Link href="/shop" className="text-primary hover:underline font-bold">
            Continue shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-background min-h-screen">
      <Header />

      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto"
        >
          {/* Success Message */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5, type: 'spring' }}
              className="inline-flex mb-4"
            >
              <div className="w-16 h-16 bg-accent text-accent-foreground rounded-full flex items-center justify-center">
                <Check className="w-8 h-8" />
              </div>
            </motion.div>
            <h1 className="text-4xl font-black text-foreground mb-2">
              Order Confirmed!
            </h1>
            <p className="text-lg text-muted-foreground">
              Thank you for your purchase. Your order has been received.
            </p>
          </div>

          {/* Order Details */}
          <div className="bg-card border border-border p-8 rounded-xl mb-8">
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Order Number</p>
                <p className="text-lg font-bold text-foreground">{order.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Order Date</p>
                <p className="text-lg font-bold text-foreground">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                <p className="text-lg font-bold text-primary font-mono">
                  {formatDZD(order.total)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Status</p>
                <p className="text-lg font-bold text-accent capitalize">
                  {order.status}
                </p>
              </div>
            </div>

            {/* Timeline */}
            <div className="mb-8 pb-8 border-b border-border">
              <h3 className="font-bold text-foreground mb-4">Order Status</h3>
              <div className="space-y-4">
                {[
                  { label: 'Order Placed', status: order.status },
                  { label: 'Processing', status: order.status },
                  { label: 'Shipped', status: ['shipped', 'delivered'].includes(order.status) },
                  { label: 'Delivered', status: order.status === 'delivered' },
                ].map((step, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        step.status
                          ? 'bg-accent text-accent-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {step.status ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <span className="text-xs">{index + 1}</span>
                      )}
                    </div>
                    <span
                      className={`text-sm font-bold ${
                        step.status ? 'text-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Items */}
            <div className="mb-8 pb-8 border-b border-border">
              <h3 className="font-bold text-foreground mb-4">Items</h3>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex justify-between items-center py-2"
                  >
                    <div>
                      <p className="font-bold text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="font-bold text-foreground font-mono">
                      {formatDZD(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div>
              <h3 className="font-bold text-foreground mb-4">Shipping Address</h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <p className="text-foreground font-bold">{order.customerName}</p>
                <p>{order.address}</p>
                <p>{order.commune}, {order.wilaya}</p>
                <p>{order.customerPhone}</p>
                <p>{order.customerEmail}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/shop">
              <button className="bg-primary text-primary-foreground px-6 py-3 font-bold rounded-lg hover:shadow-lg transition-all">
                Continue Shopping
              </button>
            </Link>
            <button
              onClick={() => window.print()}
              className="border-2 border-primary text-primary px-6 py-3 font-bold rounded-lg hover:bg-primary hover:text-primary-foreground transition-all"
            >
              Print Receipt
            </button>
          </div>

          {/* Note */}
          <div className="mt-12 bg-muted/50 border border-border p-6 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">
              A confirmation email has been sent to <span className="font-bold text-foreground">{order.customerEmail}</span>
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
