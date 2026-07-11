'use client';

import Link from 'next/link';
import { Header } from '@/components/header';
import { useStore } from '@/lib/store';
import { motion } from 'framer-motion';
import { formatDZD } from '@/lib/format';
import { Trash2, Minus, Plus, ArrowRight } from 'lucide-react';

export default function CartPage() {
  const cart = useStore((state) => state.cart);
  const removeFromCart = useStore((state) => state.removeFromCart);
  const updateCartItem = useStore((state) => state.updateCartItem);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <main className="bg-background min-h-screen">
      <Header />

      {/* Page Header */}
      <div className="border-b border-border bg-background">
        <div className="container mx-auto px-4 py-8">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-black text-foreground"
          >
            Shopping Cart
          </motion.h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {cart.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Your cart is empty
            </h2>
            <p className="text-muted-foreground mb-8">
              Start shopping to add items to your cart
            </p>
            <Link href="/shop">
              <button className="bg-primary text-primary-foreground px-6 py-3 font-bold rounded-lg hover:shadow-lg transition-all">
                Continue Shopping
              </button>
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {cart.map((item, index) => (
                  <motion.div
                    key={item.productId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex gap-4 bg-card border border-border p-4 rounded-lg"
                  >
                    {/* Image */}
                    <div className="w-24 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Item Details */}
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-foreground mb-1">
                        {item.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {item.size && `Size: ${item.size}`}
                        {item.size && item.color && ' • '}
                        {item.color && `Color: ${item.color}`}
                      </p>
                      <p className="text-sm font-bold text-primary font-mono">
                        {formatDZD(item.price)}
                      </p>
                    </div>

                    {/* Quantity & Price */}
                    <div className="flex flex-col items-end justify-between">
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="p-2 text-destructive hover:bg-destructive/10 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateCartItem(
                              item.productId,
                              Math.max(1, item.quantity - 1)
                            )
                          }
                          className="p-1 border border-border rounded hover:bg-muted"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-6 text-center font-bold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateCartItem(item.productId, item.quantity + 1)
                          }
                          className="p-1 border border-border rounded hover:bg-muted"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="font-bold text-foreground font-mono">
                        {formatDZD(item.price * item.quantity)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Continue Shopping */}
              <div className="mt-8">
                <Link href="/shop">
                  <button className="text-primary font-bold hover:underline text-sm">
                    ← Continue Shopping
                  </button>
                </Link>
              </div>
            </div>

            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-1 sticky top-24 h-fit"
            >
              <div className="bg-card border border-border p-6 rounded-lg">
                <h2 className="font-bold text-xl text-foreground mb-6">
                  Order Summary
                </h2>

                <div className="space-y-3 mb-6 pb-6 border-b border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground font-bold font-mono">
                      {formatDZD(subtotal)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Delivery fee calculated at checkout based on your wilaya
                  </p>
                </div>

                <div className="flex justify-between items-center mb-6">
                  <span className="font-bold text-lg text-foreground">Subtotal</span>
                  <span className="text-2xl font-black text-primary font-mono">
                    {formatDZD(subtotal)}
                  </span>
                </div>

                <Link href="/checkout">
                  <button className="w-full bg-primary text-primary-foreground py-3 font-bold rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 mb-3">
                    Proceed to Checkout
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>

                <button
                  onClick={() => {
                    // This would implement the backup feature
                  }}
                  className="w-full border border-border text-foreground py-2 font-bold rounded text-sm hover:bg-muted transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </main>
  );
}
